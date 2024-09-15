const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		feedbacks.currentBroadcastTimeframe = {
			type: 'boolean',
			name: 'Current Broadcast Timeframe',
			description: 'Change the button color based on the Current Broadcast Timeframe',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Broadcast Timeframe',
					id: 'timeframe',
					default: self.CHOICES_BROADCAST_TIMEFRAME[0].id,
					choices: self.CHOICES_BROADCAST_TIMEFRAME,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options

				let broadcastObj = self.getBroadcast(self.CURRENT_BROADCAST_ID)

				if (!broadcastObj) {
					return false
				}

				if (options.timeframe == broadcastObj.timeframe) {
					return true
				}
				return false
			},
		}

		feedbacks.nextBroadcastTimeFrame = {
			type: 'boolean',
			name: 'Next Broadcast Timeframe',
			description: 'Change the button color based on the Next Broadcast Timeframe',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Broadcast Timeframe',
					id: 'timeframe',
					default: self.CHOICES_BROADCAST_TIMEFRAME[0].id,
					choices: self.CHOICES_BROADCAST_TIMEFRAME,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options

				let broadcastObj = self.getBroadcast(self.NEXT_BROADCAST_ID)

				if (!broadcastObj) {
					return false
				}

				if (options.timeframe == broadcastObj.timeframe) {
					return true
				}
				return false
			},
		}

		feedbacks.selectedBroadcastTimeFrame = {
			type: 'boolean',
			name: 'Selected Broadcast Timeframe',
			description: 'Change the button color based on the Selected Broadcast Timeframe',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Broadcast Timeframe',
					id: 'timeframe',
					default: self.CHOICES_BROADCAST_TIMEFRAME[0].id,
					choices: self.CHOICES_BROADCAST_TIMEFRAME,
				},
			],
			callback: function (feedback, bank) {
				let options = feedback.options

				let broadcastObj = self.getBroadcast(self.SELECTED_BROADCAST_ID)

				if (!broadcastObj) {
					return false
				}

				if (options.timeframe == broadcastObj.timeframe) {
					return true
				}
				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
