const { InstanceStatus } = require('@companion-module/base')

module.exports = {
	async initConnection() {
		let self = this

		//clear any existing intervals
		clearInterval(self.INTERVAL)
		clearInterval(self.RECONNECT_INTERVAL)

		if (self.config.apiKey !== '' && self.config.apiSecret !== '') {
			self.updateStatus(InstanceStatus.Connecting)
			self.log('info', `Opening connection to Boxcast API...`)

			//auth first, then get data
			self.login()
		} else {
			self.updateStatus(InstanceStatus.Disconnected, 'API Key and Secret are required.')
			self.log('error', 'API Key and Secret are required.')
			return
		}
	},

	startReconnectInterval: function () {
		let self = this

		self.updateStatus(InstanceStatus.ConnectionFailure, 'Reconnecting')

		if (self.RECONNECT_INTERVAL !== undefined) {
			clearInterval(self.RECONNECT_INTERVAL)
			self.RECONNECT_INTERVAL = undefined
		}

		self.log('info', `Attempting to reconnect in ${self.RECONNECT_TIME / 1000} seconds...`)

		self.RECONNECT_INTERVAL = setTimeout(self.initConnection.bind(this), self.RECONNECT_TIME)
	},

	startInterval: function () {
		let self = this

		if (self.config.polling) {
			if (self.config.pollingrate === undefined) {
				self.config.pollingrate = self.POLLINGRATE
			}

			self.log(
				'info',
				`Starting Update Interval: Fetching new data from Boxcast every ${self.config.pollingrate}ms.`
			)
			self.INTERVAL = setInterval(self.getData.bind(self), parseInt(self.config.pollingrate))
		} else {
			self.log(
				'info',
				'Polling is disabled. Module will not request new data at a regular rate. Feedbacks and Variables will not update.'
			)
		}
	},

	async login() {
		let self = this

		try {
			const request = await fetch(`https://auth.boxcast.com/oauth2/token`, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${Buffer.from(`${self.config.apiKey}:${self.config.apiSecret}`).toString('base64')}`,
				},
				body: new URLSearchParams({
					grant_type: 'client_credentials',
				}),
			})

			let result = await request.json()

			if (result) {
				if (result['token_type'] === 'bearer') {
					self.updateStatus(InstanceStatus.Ok)

					self.TOKEN = result['access_token']
					self.EXPIRES = result['expires_in']
					self.SCOPE = result['scope']

					self.HEADERS = {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${self.TOKEN}`,
					}

					self.log('info', `Logged in to Boxcast API.`)

					if (self.config.verbose) {
						self.log('debug', `Token: ${self.TOKEN}`)
						self.log('debug', `Expires: ${self.EXPIRES}`)
						self.log('debug', `Scope: ${self.SCOPE}`)
					}

					self.getData() //get initial data
					self.startInterval()
				} else {
					//login failed
					self.updateStatus(InstanceStatus.Disconnected, 'Login failed.')
				}
			}
		} catch (error) {
			self.log('error', `Error logging in: ${String(error)}`)
			self.startReconnectInterval()
		}
	},

	getData() {
		let self = this

		if (self.config.verbose) {
			self.log('debug', 'Getting Data...')
		}

		self.getChannels()

		if (self.config.filter_by_channel === true) {
			self.filterBroadcastsByChannel(self.config.channel_id)
		} else {
			self.getBroadcasts()
		}

		self.checkCurrentBroadcast()
		self.checkSelectedBroadcast()
	},

	async getChannels() {
		let self = this

		try {
			if (self.config.verbose) {
				self.log('debug', 'Getting Channels...')
			}

			const request = await fetch(`${self.BASEURL}/account/channels`, {
				method: 'GET',
				headers: self.HEADERS,
			})

			let result = await request.json()

			if (result) {
				self.buildChannelChoices(result)
			} else {
				self.log('error', 'Error getting channels.')
			}
		} catch (error) {
			self.log('error', `Error getting channels: ${String(error)}`)
		}
	},

	async getBroadcasts() {
		let self = this

		try {
			if (self.config.verbose) {
				self.log('debug', 'Getting Broadcasts...')
			}

			let numBroadcasts = self.config.numBroadcasts || 5

			const request = await fetch(
				`${self.BASEURL}/account/broadcasts?s=starts_at&l=${numBroadcasts}&q=timeframe:current%20timeframe:preroll timeframe:future`,
				{
					method: 'GET',
					headers: self.HEADERS,
				}
			)

			let result = await request.json()

			if (result) {
				self.buildBroadcastChoices(result)
			} else {
				self.log('error', 'Error getting broadcasts.')
			}
		} catch (error) {
			self.log('error', `Error getting broadcasts: ${String(error)}`)
		}
	},

	buildChannelChoices(data) {
		let self = this

		//compare the data to self.CHANNELS and only update if different
		//this is to prevent feedbacks from updating if the data is the same

		try {
			if (JSON.stringify(self.CHANNELS) === JSON.stringify(data)) {
				if (self.config.verbose) {
					self.log('debug', 'No change in Channel Data.')
				}
				return
			}

			if (self.config.verbose) {
				self.log('debug', 'Building Channel Choices...')
			}

			self.CHANNELS = data

			self.CHOICES_CHANNELS = []

			if (self.CHANNELS.length === 0) {
				self.log('warn', 'No Channels found.')
				self.CHOICES_CHANNELS.push({ id: undefined, label: 'No Channels Available' })
			} else {
				self.CHANNELS.forEach((channel) => {
					self.CHOICES_CHANNELS.push({ id: channel.id, label: channel.name })
				})
			}

			self.initActions()

			self.checkFeedbacks()
			self.checkVariables()
		} catch (error) {
			self.log('error', `Error building channel choices: ${String(error)}`)
		}
	},

	buildBroadcastChoices(data) {
		let self = this

		//compare the data to self.BROADCASTS and only update if different
		//this is to prevent feedbacks from updating if the data is the same

		try {
			if (JSON.stringify(self.BROADCASTS) === JSON.stringify(data)) {
				if (self.config.verbose) {
					self.log('debug', 'No change in Broadcast Data.')
				}
				return
			}

			if (self.config.verbose) {
				self.log('debug', 'Building Broadcast Choices...')
			}

			self.BROADCASTS = data

			self.CHOICES_BROADCASTS = []

			if (self.BROADCASTS.length === 0) {
				self.log('warn', 'No Broadcasts found.')
				self.CHOICES_BROADCASTS.push({ id: undefined, label: 'No Broadcasts Available' })
			} else {
				self.BROADCASTS.forEach((broadcast) => {
					self.CHOICES_BROADCASTS.push({ id: broadcast.id, label: broadcast.name })
				})
			}

			self.initActions()

			self.checkFeedbacks()
			self.checkVariables()
		} catch (error) {
			self.log('error', `Error building broadcast choices: ${String(error)}`)
		}
	},

	async checkCurrentBroadcast() {
		let self = this

		//checks to see if the current broadcast timeframe is 'past'
		//this signfies that the current broadcast has ended, and we should move on to the next one

		if (self.config.verbose) {
			self.log('debug', 'Checking Current Broadcast...')
		}

		self.CURRENT_BROADCAST_ID = undefined
		self.selectNextBroadcast()
		self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
		self.selectNextBroadcast()

		self.checkFeedbacks()
		self.checkVariables()
	},

	async checkSelectedBroadcast() {
		let self = this

		//checks to see if the selected broadcast timeframe is 'past'
		//this signifies that the selected broadcast has ended, and we should move on to the next one

		if (self.config.verbose) {
			self.log('debug', 'Checking Selected Broadcast...')
		}

		try {
			if (self.SELECTED_BROADCAST_ID) {
				const request = await fetch(`${self.BASEURL}/account/broadcasts?q=id:${self.SELECTED_BROADCAST_ID}`, {
					method: 'GET',
					headers: self.HEADERS,
				})

				let result = await request.json()

				if (result) {
					let selectedBroadcast = result[0]

					if (selectedBroadcast.timeframe === 'past') {
						self.SELECTED_BROADCAST_ID = undefined
						self.log('info', `Selected Broadcast has ended. Please select a new one.`)
					}
				}

				self.checkFeedbacks()
				self.checkVariables()
			}
		} catch (error) {
			self.log('error', `Error checking selected broadcast: ${String(error)}`)
		}
	},

	selectNextBroadcast() {
		//get the next broadcast in self.BROADCASTS based on starts_at property
		let self = this

		try {
			let nextBroadcast = undefined

			//the broadcasts are sorted in order, so just loop through them until we find the one that isnt the current broadcast id
			for (let i = 0; i < self.BROADCASTS.length; i++) {
				let broadcast = self.BROADCASTS[i]

				if (broadcast.id !== self.CURRENT_BROADCAST_ID && broadcast.timeframe !== 'past') {
					nextBroadcast = broadcast
					break
				}
			}

			if (nextBroadcast) {
				self.NEXT_BROADCAST_ID = nextBroadcast.id
			} else {
				self.NEXT_BROADCAST_ID = undefined
			}
		} catch (error) {
			self.log('error', `Error selecting next broadcast: ${String(error)}`)
		}
	},

	startCurrentBroadcast() {
		let self = this

		if (self.CURRENT_BROADCAST_ID) {
			self.startBroadcast(self.CURRENT_BROADCAST_ID)
		} else {
			self.log('error', 'No Current Broadcast Selected.')
		}
	},

	startNextBroadcast() {
		let self = this

		if (self.NEXT_BROADCAST_ID) {
			self.startBroadcast(self.NEXT_BROADCAST_ID)
			self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
			self.selectNextBroadcast()
		} else {
			self.log('error', 'No Next Broadcast Selected.')
		}
	},

	startSelectedBroadcast() {
		let self = this

		if (self.SELECTED_BROADCAST_ID) {
			self.startBroadcast(self.SELECTED_BROADCAST_ID)
		} else {
			self.log('error', 'No Broadcast Selected.')
		}
	},

	stopCurrentBroadcast() {
		let self = this

		if (self.CURRENT_BROADCAST_ID) {
			self.stopBroadcast(self.CURRENT_BROADCAST_ID)
			if (self.config.autoSelectBroadcastAfterStop) {
				self.CURRENT_BROADCAST_ID = undefined
				self.selectNextBroadcast()
				self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
				self.selectNextBroadcast()
			}
		} else {
			self.log('error', 'No Current Broadcast Selected.')
		}
	},

	stopSelectedBroadcast() {
		let self = this

		if (self.SELECTED_BROADCAST_ID) {
			self.stopBroadcast(self.SELECTED_BROADCAST_ID)
			self.SELECTED_BROADCAST_ID = undefined
		} else {
			self.log('error', 'No Broadcast Selected.')
		}
	},

	async startBroadcast(broadcastId) {
		let self = this

		let broadcastObj = self.getBroadcast(broadcastId)

		if (broadcastObj) {
			let broadcastName = broadcastObj.name || broadcastId

			self.log('info', `Starting Broadcast: ${broadcastName}`)

			try {
				const request = await fetch(`${self.BASEURL}/account/broadcasts/${broadcastId}`, {
					method: 'PUT',
					headers: self.HEADERS,
					body: JSON.stringify({
						starts_at: 'now',
					}),
				})

				let result = await request.json()

				if (result) {
					//assume it did the thing
					//update feedbacks and vars
					console.log(result)
					self.checkFeedbacks()
					self.checkVariables()
				} else {
					self.log('error', 'Error getting broadcasts.')
				}
			} catch (error) {
				self.log('error', `Error getting broadcasts: ${String(error)}`)
			}
		} else {
			self.log('error', `Broadcast not found: ${broadcastId}`)
			return
		}
	},

	async stopBroadcast(broadcastId) {
		let self = this

		let broadcastObj = self.getBroadcast(broadcastId)

		if (broadcastObj) {
			let broadcastName = broadcastObj.name || broadcastId

			self.log('info', `Stopping Broadcast: ${broadcastName}`)

			try {
				const request = await fetch(`${self.BASEURL}/account/broadcasts/${broadcastId}`, {
					method: 'PUT',
					headers: self.HEADERS,
					body: JSON.stringify({
						stops_at: 'now',
					}),
				})

				let result = await request.json()

				if (result) {
					//assume it did the thing
					//update feedbacks and vars
					console.log(result)
					self.checkFeedbacks()
					self.checkVariables()
				} else {
					self.log('error', 'Error getting broadcasts.')
				}
			} catch (error) {
				self.log('error', `Error stopping broadcast: ${String(error)}`)
			}
		}
	},

	async filterBroadcastsByChannel(channelId) {
		let self = this

		let channelObj = self.getChannel(channelId)

		if (channelObj) {
			let channelName = channelObj.name || channelId
			self.log('info', `Filtering broadcasts by Channel: ${channelName}`)

			self.config.filter_by_channel = true
			self.config.channel_id = channelId
			self.saveConfig(self.config)
		} else {
			self.log('info', `Filtering broadcasts by Channel: ${channelId}`)
		}

		try {
			const request = await fetch(`${self.BASEURL}/account/channels/${channelId}/broadcasts`, {
				method: 'GET',
				headers: self.HEADERS,
			})

			let result = await request.json()

			if (result) {
				self.buildBroadcastChoices(result.data)
			} else {
				self.log('error', 'Error getting broadcasts.')
			}
		} catch (error) {
			self.log('error', `Error getting broadcasts: ${String(error)}`)
		}
	},

	getChannel(channelId) {
		let self = this

		return self.CHANNELS.find((channel) => channel.id === channelId)
	},

	getBroadcast(broadcastId) {
		let self = this

		return self.BROADCASTS.find((broadcast) => broadcast.id === broadcastId)
	},
}
