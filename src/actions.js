module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		actions.selectNextBroadcast = {
			name: 'Select Next Broadcast',
			description: 'Select the Next Broadcast based on the current date/time and moves it into the Current Broadcast slot.',
			callback: function (action) {
				self.selectNextBroadcast()
			},
		}

		actions.startNextBroadcast = {
			name: 'Start Next Broadcast',
			callback: function (action) {
				self.startNextBroadcast()
			},
		}

		actions.stopCurrentBroadcast = {
			name: 'Stop Current Broadcast',
			callback: function (action) {
				self.stopCurrentBroadcast()
			},
		}

		actions.startSpecificBroadcast = {
			name: 'Start Specific Broadcast',
			options: [
				{
					type: 'dropdown',
					label: 'Broadcast',
					id: 'broadcast',
					default: self.CHOICES_BROADCASTS[0].id,
					choices: self.CHOICES_BROADCASTS,
				},
			],
			callback: function (action) {
				let options = action.options
				self.startBroadcast(options.broadcast)
			},
		}

		actions.stopSpecificBroadcast = {
			name: 'Stop Specific Broadcast',
			options: [
				{
					type: 'dropdown',
					label: 'Broadcast',
					id: 'broadcast',
					default: self.CHOICES_BROADCASTS[0].id,
					choices: self.CHOICES_BROADCASTS,
				},
			],
			callback: function (action) {
				let options = action.options
				self.stopBroadcast(options.broadcast)
			},
		}

		actions.filterBroadcastsByChannel = {
			name: 'Filter Broadcasts by Channel',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
				},
			],
			callback: function (action) {
				let options = action.options
				self.config.filter_channels = true
				self.config.channel_id = self.CHANNELID
				self.saveConfig(self.config)
				self.filterBroadcastsByChannel(options.channel)
			},
		}

		actions.filterBroadcastsByChannelOff = {
			name: 'Filter Broadcasts by Channel - Turn Off',
			callback: function (action) {
				self.config.filter_channels = false
				self.config.channel_id = undefined
				self.saveConfig(self.config)
				
				self.getBroadcasts()
			},
		}

		self.setActionDefinitions(actions)
	},
}
