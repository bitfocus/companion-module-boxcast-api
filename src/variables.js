module.exports = {
	initVariables() {
		let self = this
		let variables = []

		//filter by channel bool
		variables.push({ variableId: 'filterByChannel', name: 'Filter by Channel On/Off' })

		variables.push({ variableId: 'currentBroadcastName', name: 'Current Broadcast Name' })
		variables.push({ variableId: 'currentBroadcastChannelName', name: 'Current Broadcast Channel Name' })
		variables.push({ variableId: 'currentBroadcastStreamSource', name: 'Current Broadcast Stream Source' })
		variables.push({ variableId: 'currentBroadcastBoxcasterName', name: 'Current Broadcast Boxcaster Name' })
		variables.push({ variableId: 'currentBroadcastAudioSource', name: 'Current Broadcast Audio Source' })
		variables.push({ variableId: 'currentBroadcastStartTime', name: 'Current Broadcast Start Time' })
		variables.push({ variableId: 'currentBroadcastStopTime', name: 'Current Broadcast Stop Time' })
		variables.push({ variableId: 'currentBroadcastIsPrivate', name: 'Current Broadcast Is Private' })
		variables.push({ variableId: 'currentBroadcastTimeframe', name: 'Current Broadcast Timeframe' })

		variables.push({ variableId: 'nextBroadcastName', name: 'Next Broadcast Name' })
		variables.push({ variableId: 'nextBroadcastChannelName', name: 'Next Broadcast Channel Name' })
		variables.push({ variableId: 'nextBroadcastStreamSource', name: 'Next Broadcast Stream Source' })
		variables.push({ variableId: 'nextBroadcastBoxcasterName', name: 'Next Broadcast Boxcaster Name' })
		variables.push({ variableId: 'nextBroadcastAudioSource', name: 'Next Broadcast Audio Source' })
		variables.push({ variableId: 'nextBroadcastStartTime', name: 'Next Broadcast Start Time' })
		variables.push({ variableId: 'nextBroadcastStopTime', name: 'Next Broadcast Stop Time' })
		variables.push({ variableId: 'nextBroadcastIsPrivate', name: 'Next Broadcast Is Private' })
		variables.push({ variableId: 'nextBroadcastTimeframe', name: 'Next Broadcast Timeframe' })

		self.setVariableDefinitions(variables)
	},

	checkVariables() {
		let self = this

		try {
			let variableObj = {}

			//get filter by channel bool
			variableObj.filterByChannel = self.config.filter_by_channel

			//get currentbroadcast by id and set vars
			let currentBroadcast = self.getBroadcast(self.CURRENT_BROADCAST_ID);

			if (currentBroadcast) {
				variableObj.currentBroadcastName = currentBroadcast.name
				
				let broadcastChannelObj = self.getChannel(currentBroadcast.channel_id)

				if (broadcastChannelObj) {
					variableObj.currentBroadcastChannelName = broadcastChannelObj.name
				}
				else {
					variableObj.currentBroadcastChannelName = ''
				}

				variableObj.currentBroadcastStreamSource = currentBroadcast.stream_source
				variableObj.currentBroadcastBoxcasterName = currentBroadcast.boxcaster_name
				variableObj.currentBroadcastAudioSource = currentBroadcast.audio_source
				variableObj.currentBroadcastStartTime = currentBroadcast.starts_at
				variableObj.currentBroadcastStopTime = currentBroadcast.ends_at
				variableObj.currentBroadcastIsPrivate = currentBroadcast.is_private
				variableObj.currentBroadcastTimeframe = currentBroadcast.timeframe
			}

			//get nextbroadcast by id and set vars
			let nextBroadcast = self.getBroadcast(self.NEXT_BROADCAST_ID);

			if (nextBroadcast) {
				variableObj.nextBroadcastName = nextBroadcast.name
				
				let broadcastChannelObj = self.getChannel(nextBroadcast.channel_id)

				if (broadcastChannelObj) {
					variableObj.nextBroadcastChannelName = broadcastChannelObj.name
				}
				else {
					variableObj.nextBroadcastChannelName = ''
				}

				variableObj.nextBroadcastStreamSource = nextBroadcast.stream_source
				variableObj.nextBroadcastBoxcasterName = nextBroadcast.boxcaster_name
				variableObj.nextBroadcastAudioSource = nextBroadcast.audio_source
				variableObj.nextBroadcastStartTime = nextBroadcast.starts_at
				variableObj.nextBroadcastStopTime = nextBroadcast.ends_at
				variableObj.nextBroadcastIsPrivate = nextBroadcast.is_private
				variableObj.nextBroadcastTimeframe = nextBroadcast.timeframe
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			self.log('error', 'Error setting Variables: ' + String(error))
		}
	},
}
