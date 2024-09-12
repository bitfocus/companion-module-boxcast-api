module.exports = {
	initVariables() {
		let self = this
		let variables = []

		//filter by channel bool
		variables.push({ variableId: 'filterByChannel', name: 'Filter by Channel On/Off' })

		//current broadcast
		variables.push({ variableId: 'currentBroadcastId', name: 'Current Broadcast ID' })
		variables.push({ variableId: 'currentBroadcastName', name: 'Current Broadcast Name' })
		variables.push({ variableId: 'currentBroadcastChannelName', name: 'Current Broadcast Channel Name' })
		variables.push({ variableId: 'currentBroadcastStreamSource', name: 'Current Broadcast Stream Source' })
		variables.push({ variableId: 'currentBroadcastBoxcasterName', name: 'Current Broadcast Boxcaster Name' })
		variables.push({ variableId: 'currentBroadcastAudioSource', name: 'Current Broadcast Audio Source' })
		variables.push({ variableId: 'currentBroadcastStartTime', name: 'Current Broadcast Start Time' })
		variables.push({ variableId: 'currentBroadcastStopTime', name: 'Current Broadcast Stop Time' })
		variables.push({ variableId: 'currentBroadcastIsPrivate', name: 'Current Broadcast Is Private' })
		variables.push({ variableId: 'currentBroadcastTimeframe', name: 'Current Broadcast Timeframe' })

		//next broadcast
		variables.push({ variableId: 'nextBroadcastId', name: 'Next Broadcast ID' })
		variables.push({ variableId: 'nextBroadcastName', name: 'Next Broadcast Name' })
		variables.push({ variableId: 'nextBroadcastChannelName', name: 'Next Broadcast Channel Name' })
		variables.push({ variableId: 'nextBroadcastStreamSource', name: 'Next Broadcast Stream Source' })
		variables.push({ variableId: 'nextBroadcastBoxcasterName', name: 'Next Broadcast Boxcaster Name' })
		variables.push({ variableId: 'nextBroadcastAudioSource', name: 'Next Broadcast Audio Source' })
		variables.push({ variableId: 'nextBroadcastStartTime', name: 'Next Broadcast Start Time' })
		variables.push({ variableId: 'nextBroadcastStopTime', name: 'Next Broadcast Stop Time' })
		variables.push({ variableId: 'nextBroadcastIsPrivate', name: 'Next Broadcast Is Private' })
		variables.push({ variableId: 'nextBroadcastTimeframe', name: 'Next Broadcast Timeframe' })

		//selected broadcast
		variables.push({ variableId: 'selectedBroadcastId', name: 'Selected Broadcast ID' })
		variables.push({ variableId: 'selectedBroadcastName', name: 'Selected Broadcast Name' })
		variables.push({ variableId: 'selectedBroadcastChannelName', name: 'Selected Broadcast Channel Name' })
		variables.push({ variableId: 'selectedBroadcastStreamSource', name: 'Selected Broadcast Stream Source' })
		variables.push({ variableId: 'selectedBroadcastBoxcasterName', name: 'Selected Broadcast Boxcaster Name' })
		variables.push({ variableId: 'selectedBroadcastAudioSource', name: 'Selected Broadcast Audio Source' })
		variables.push({ variableId: 'selectedBroadcastStartTime', name: 'Selected Broadcast Start Time' })
		variables.push({ variableId: 'selectedBroadcastStopTime', name: 'Selected Broadcast Stop Time' })
		variables.push({ variableId: 'selectedBroadcastIsPrivate', name: 'Selected Broadcast Is Private' })
		variables.push({ variableId: 'selectedBroadcastTimeframe', name: 'Selected Broadcast Timeframe' })

		self.setVariableDefinitions(variables)
	},

	checkVariables() {
		let self = this

		try {
			let variableObj = {}

			//get filter by channel bool
			variableObj.filterByChannel = self.config.filter_by_channel

			//curent broadcast id
			variableObj.currentBroadcastId = self.CURRENT_BROADCAST_ID

			//get currentbroadcast by id and set vars
			let currentBroadcast = self.getBroadcast(self.CURRENT_BROADCAST_ID)

			if (currentBroadcast) {
				variableObj.currentBroadcastName = currentBroadcast.name

				let broadcastChannelObj = self.getChannel(currentBroadcast.channel_id)

				if (broadcastChannelObj) {
					variableObj.currentBroadcastChannelName = broadcastChannelObj.name
				} else {
					variableObj.currentBroadcastChannelName = ''
				}

				variableObj.currentBroadcastStreamSource = currentBroadcast.stream_source
				variableObj.currentBroadcastBoxcasterName = currentBroadcast.boxcaster_name
				variableObj.currentBroadcastAudioSource = currentBroadcast.audio_source
				variableObj.currentBroadcastStartTime = currentBroadcast.starts_at
				variableObj.currentBroadcastStopTime = currentBroadcast.stops_at
				variableObj.currentBroadcastIsPrivate = currentBroadcast.is_private
				variableObj.currentBroadcastTimeframe = currentBroadcast.timeframe
			} else {
				//set to blank
				variableObj.currentBroadcastName = ''
				variableObj.currentBroadcastChannelName = ''
				variableObj.currentBroadcastStreamSource = ''
				variableObj.currentBroadcastBoxcasterName = ''
				variableObj.currentBroadcastAudioSource = ''
				variableObj.currentBroadcastStartTime = ''
				variableObj.currentBroadcastStopTime = ''
				variableObj.currentBroadcastIsPrivate = ''
				variableObj.currentBroadcastTimeframe = ''
			}

			//next broadcast id
			variableObj.nextBroadcastId = self.NEXT_BROADCAST_ID

			//get nextbroadcast by id and set vars
			let nextBroadcast = self.getBroadcast(self.NEXT_BROADCAST_ID)

			if (nextBroadcast) {
				variableObj.nextBroadcastName = nextBroadcast.name

				let broadcastChannelObj = self.getChannel(nextBroadcast.channel_id)

				if (broadcastChannelObj) {
					variableObj.nextBroadcastChannelName = broadcastChannelObj.name
				} else {
					variableObj.nextBroadcastChannelName = ''
				}

				variableObj.nextBroadcastStreamSource = nextBroadcast.stream_source
				variableObj.nextBroadcastBoxcasterName = nextBroadcast.boxcaster_name
				variableObj.nextBroadcastAudioSource = nextBroadcast.audio_source
				variableObj.nextBroadcastStartTime = nextBroadcast.starts_at
				variableObj.nextBroadcastStopTime = nextBroadcast.ends_at
				variableObj.nextBroadcastIsPrivate = nextBroadcast.is_private
				variableObj.nextBroadcastTimeframe = nextBroadcast.timeframe
			} else {
				//set to blank
				variableObj.nextBroadcastName = ''
				variableObj.nextBroadcastChannelName = ''
				variableObj.nextBroadcastStreamSource = ''
				variableObj.nextBroadcastBoxcasterName = ''
				variableObj.nextBroadcastAudioSource = ''
				variableObj.nextBroadcastStartTime = ''
				variableObj.nextBroadcastStopTime = ''
				variableObj.nextBroadcastIsPrivate = ''
				variableObj.nextBroadcastTimeframe = ''
			}

			//selected broadcast id
			variableObj.selectedBroadcastId = self.SELECTED_BROADCAST_ID

			//get selectedbroadcast by id and set vars
			let selectedBroadcast = self.getBroadcast(self.SELECTED_BROADCAST_ID)

			if (selectedBroadcast) {
				variableObj.selectedBroadcastName = selectedBroadcast.name

				let broadcastChannelObj = self.getChannel(selectedBroadcast.channel_id)

				if (broadcastChannelObj) {
					variableObj.selectedBroadcastChannelName = broadcastChannelObj.name
				} else {
					variableObj.selectedBroadcastChannelName = ''
				}

				variableObj.selectedBroadcastStreamSource = selectedBroadcast.stream_source
				variableObj.selectedBroadcastBoxcasterName = selectedBroadcast.boxcaster_name
				variableObj.selectedBroadcastAudioSource = selectedBroadcast.audio_source
				variableObj.selectedBroadcastStartTime = selectedBroadcast.starts_at
				variableObj.selectedBroadcastStopTime = selectedBroadcast.ends_at
				variableObj.selectedBroadcastIsPrivate = selectedBroadcast.is_private
				variableObj.selectedBroadcastTimeframe = selectedBroadcast.timeframe
			} else {
				//set to blank
				variableObj.selectedBroadcastName = ''
				variableObj.selectedBroadcastChannelName = ''
				variableObj.selectedBroadcastStreamSource = ''
				variableObj.selectedBroadcastBoxcasterName = ''
				variableObj.selectedBroadcastAudioSource = ''
				variableObj.selectedBroadcastStartTime = ''
				variableObj.selectedBroadcastStopTime = ''
				variableObj.selectedBroadcastIsPrivate = ''
				variableObj.selectedBroadcastTimeframe = ''
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			self.log('error', 'Error setting Variables: ' + String(error))
		}
	},
}
