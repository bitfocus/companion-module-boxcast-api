const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this
		let presets = []

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorBlack = combineRgb(0, 0, 0) // Black
		const colorRed = combineRgb(255, 0, 0) // Red
		const colorGreen = combineRgb(0, 255, 0) // Green
		const colorBlue = combineRgb(0, 0, 255) // Blue
		const colorYellow = combineRgb(255, 255, 0) // Yellow

		presets = [
			{
				category: 'General',
				name: 'Set Converter Mode to Encoder',
				style: {
					text: 'Encoder',
					size: '18',
					color: colorWhite,
					bgcolor: colorBlack,
				},
				steps: [
					{
						down: [
							{
								actionId: 'modeSwitch',
								options: {
									mode: 'encoder',
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'mode',
						options: {
							mode: 'encoder',
						},
					},
				],
			},
		]

		presets.currentBroadcast = {
			category: 'Control',
			name: 'Start Current Broadcast',
			style: {
				text: 'Start Current Broadcast',
				size: '18',
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startCurrentBroadcast',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'currentBroadcastTimeframe',
					options: {
						timeframe: 'future',
					},
					style: {
						bgcolor: colorBlue,
						color: colorWhite,
					},
				},
				{
					feedbackId: 'currentBroadcastTimeframe',
					options: {
						timeframe: 'preroll',
					},
					style: {
						bgcolor: colorYellow,
						color: colorWhite,
					},
				},
				{
					feedbackId: 'currentBroadcastTimeframe',
					options: {
						timeframe: 'current',
					},
					style: {
						bgcolor: colorRed,
						color: colorWhite,
					},
				},
			],
		}

		self.setPresetDefinitions(presets)
	},
}
