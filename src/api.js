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

		self.log('info', 'Attempting to reconnect in 30 seconds...')

		self.RECONNECT_INTERVAL = setTimeout(self.initConnection.bind(this), 30000)
	},

	startInterval: function () {
		let self = this

		if (self.config.polling) {
			if (self.config.pollingrate === undefined) {
				self.config.pollingrate = 1000
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
						'Authorization': `Bearer ${self.TOKEN}`,
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

		if ((self.config.filter_by_channel === true)) {
			self.filterBroadcastsByChannel(self.config.channel_id)
		} else {
			self.getBroadcasts()
		}

		self.checkCurrentBroadcast()
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

			const request = await fetch(`${self.BASEURL}/account/broadcasts?q=timeframe:future`, {
				method: 'GET',
				headers: self.HEADERS,
			})

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

		if (JSON.stringify(self.CHANNELS) === JSON.stringify(data)) {
			if (self.config.verbose) {
				self.log('debug', 'No change in Channel Data.')
			}
			return
		}

		if (self.config.verbose) {
			self.log('debug', 'Building Channel Choices...')
		}

		console.log(data)

		self.CHANNELS = data

		self.CHOICES_CHANNELS = []

		if (self.CHANNELS.length === 0) {
			self.log('warn', 'No Channels found.')
			self.CHOICES_CHANNELS.push({ id: undefined, label: 'No Channels Available' })
		}
		else {
			self.CHANNELS.forEach((channel) => {
				self.CHOICES_CHANNELS.push({ id: channel.id, label: channel.name })
			})
		}

		self.initActions()

		self.checkFeedbacks()
		self.checkVariables()
	},

	buildBroadcastChoices(data) {
		let self = this

		//compare the data to self.BROADCASTS and only update if different
		//this is to prevent feedbacks from updating if the data is the same

		if (JSON.stringify(self.BROADCASTS) === JSON.stringify(data)) {
			if (self.config.verbose) {
				self.log('debug', 'No change in Broadcast Data.')
			}
			return
		}

		if (self.config.verbose) {
			self.log('debug', 'Building Broadcast Choices...')
		}

		console.log(data)

		self.BROADCASTS = data

		self.CHOICES_BROADCASTS = []

		if (self.BROADCASTS.length === 0) {
			self.log('warn', 'No Broadcasts found.')
			self.CHOICES_BROADCASTS.push({ id: undefined, label: 'No Broadcasts Available' })
		}
		else {
			self.BROADCASTS.forEach((broadcast) => {
				self.CHOICES_BROADCASTS.push({ id: broadcast.id, label: broadcast.name })
			})
		}
		
		self.initActions()

		self.checkFeedbacks()
		self.checkVariables()
	},

	checkCurrentBroadcast() {
		let self = this

		//checks to see if the current broadcast timeframe is 'past'
		//this signfies that the current broadcast has ended, and we should move on to the next one

		if (self.config.verbose) {
			self.log('debug', 'Checking Current Broadcast...')
		}

		if (self.CURRENT_BROADCAST_ID) {
			if (self.config.autoSelectBroadcastDateTime == true) {
				let currentBroadcast = self.getBroadcast(self.CURRENT_BROADCAST_ID)

				if (currentBroadcast) {
					if (currentBroadcast.timeframe === 'past') {
						self.selectNextBroadcast()
						self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
						self.selectNextBroadcast()

						self.checkFeedbacks()
						self.checkVariables()
					}
				}
			}
		}
		else {
			self.selectNextBroadcast()
			self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
			self.selectNextBroadcast()

			self.checkFeedbacks()
			self.checkVariables()
		}
	},

	selectNextBroadcast() {
		//get the next broadcast in self.BROADCASTS based on starts_at property
		let self = this

		let now = new Date()

		let nextBroadcast = self.BROADCASTS.find((broadcast) => {
			let startsAt = new Date(broadcast.starts_at)
			return startsAt > now && broadcast.id !== self.CURRENT_BROADCAST_ID
		})

		if (nextBroadcast) {
			self.NEXT_BROADCAST_ID = nextBroadcast.id
		}
	},

	startNextBroadcast() {
		let self = this

		if (self.NEXT_BROADCAST_ID) {
			self.startBroadcast(self.NEXT_BROADCAST_ID)
			self.CURRENT_BROADCAST_ID = self.NEXT_BROADCAST_ID
			self.selectNextBroadcast()
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
		}
	},

	async startBroadcast(broadcastId) {
		let self = this

		let broadcastObj = self.getBroadcast(broadcastId)

		if (broadcastObj) {
			let broadcastName = broadcastObj.name

			self.log('info', `Starting Broadcast: ${broadcastName}`)

			try {
				const request = await fetch(`${self.BASEURL}/account/broadcasts/${broadcastId}`, {
					method: 'PUT',
					headers: self.HEADERS,
					body: JSON.stringify({
						starts_at: 'NOW',
					}),
				})
	
				let result = await request.json()
	
				if (result) {
					//assume it did the thing
					//update feedbacks and vars
				} else {
					self.log('error', 'Error getting broadcasts.')
				}
			} catch (error) {
				self.log('error', `Error logging in: ${String(error)}`)
				self.startReconnectInterval()
			}
		}
		else {
			self.log('error', `Broadcast not found: ${broadcastId}`)
			return
		}
	},

	async stopBroadcast(broadcastId) {
		let self = this

		let broadcastObj = self.getBroadcast(broadcastId)

		if (broadcastObj) {
			let broadcastName = broadcastObj.name

			self.log('info', `Stopping Broadcast: ${broadcastName}`)

			try {
				const request = await fetch(`${self.BASEURL}/account/broadcasts/${broadcastId}`, {
					method: 'PUT',
					headers: self.HEADERS,
					body: JSON.stringify({
						stops_at: 'NOW',
					}),
				})
	
				let result = await request.json()
	
				if (result) {
					//assume it did the thing
					//update feedbacks and vars
				} else {
					self.log('error', 'Error getting broadcasts.')
				}
			} catch (error) {
				self.log('error', `Error logging in: ${String(error)}`)
				self.startReconnectInterval()
			}
		}
	},

	async filterBroadcastsByChannel(channelId) {
		let self = this

		let channelObj = self.getChannel(channelId)

		if (channelObj) {
			self.log('info', `Filtering broadcasts by Channel: ${channelObj.name}`)

			self.config.filter_by_channel = true
			self.config.channel_id = channelId
			self.saveConfig(self.config)
		}
		else {
			self.log('info', `Filtering broadcasts by Channel: ${channelId}`)
		}

		try {
			const request = await fetch(`${self.BASEURL}/account/channels/${channelId}/broadcasts?q=timeframe:future`, {
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
	}
}
