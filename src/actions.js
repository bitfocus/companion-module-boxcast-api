module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		actions.startCurrentBroadcast = {
			name: 'Start Current Broadcast',
			callback: function (action) {
				self.startCurrentBroadcast()
			},
		}

		actions.stopCurrentBroadcast = {
			name: 'Stop Current Broadcast',
			callback: function (action) {
				self.stopCurrentBroadcast()
			},
		}

		actions.selectNextBroadcast = {
			name: 'Select Next Broadcast',
			description: 'Select the Next Broadcast and moves it into the Current Broadcast slot.',
			callback: function (action) {
				self.selectNextBroadcast()
			},
		}

		actions.selectBroadcast = {
			name: 'Select Specific Broadcast',
			desctiprion: 'Select a specific Broadcast and populate variables around it.',
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
				self.SELECTED_BROADCAST_ID = options.broadcast
				self.checkFeedbacks()
				self.checkVariables()
			},
		}

		actions.startSelectedBroadcast = {
			name: 'Start Selected Broadcast',
			callback: function (action) {
				self.startSelectedBroadcast()
			},
		}

		actions.stopSelectedBroadcast = {
			name: 'Stop Selected Broadcast',
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
				self.stopSelectedBroadcast(options.broadcast)
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
