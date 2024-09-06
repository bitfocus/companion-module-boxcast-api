const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		let self = this

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This modules controls Boxcast through their API.',
			},
			{
				type: 'static-text',
				id: 'hr1',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'textinput',
				id: 'apiKey',
				label: 'API Key',
				width: 6,
				default: '',
			},
			{
				type: 'textinput',
				id: 'apiSecret',
				label: 'API Secret',
				width: 6,
				default: '',
			},
			{
				type: 'static-text',
				id: 'hr2',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'autoSelectBroadcastDateTime',
				label: 'Auto-select Current Broadcast based on current date/time and broadcast state.',
				width: 4,
				default: true,
			},
			{
				type: 'static-text',
				id: 'autoSelectBroadcastDateTimeInfo',
				width: 8,
				label: ' ',
				value: 'Auto-selecting the next Broadcast based on current date/time',
			},
			{
				type: 'checkbox',
				id: 'autoSelectBroadcastAfterStop',
				label: 'Auto-select next Broadcast after stopping the current one.',
				width: 4,
				default: true,
			},
			{
				type: 'static-text',
				id: 'autoSelectBroadcastAfterStopInfo',
				width: 8,
				label: ' ',
				value: 'Moves the Next Broadcast into Current Broadcast, and assigns the next one as the Next Broadcast.',
			},
			{
				type: 'static-text',
				id: 'hr3',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable Polling (necessary for feedbacks and variables)',
				default: false,
				width: 3,
			},
			{
				type: 'textinput',
				id: 'pollingrate',
				label: 'Polling Rate for Current State (in ms)',
				default: self.POLLINGRATE,
				width: 3,
				isVisible: (configValues) => configValues.polling === true,
			},
			{
				type: 'static-text',
				id: 'hr5',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
				width: 3,
			},
			{
				type: 'static-text',
				id: 'info3',
				width: 9,
				label: ' ',
				value: `Enabling Verbose Logging will push all incoming and outgoing data to the log, which is helpful for debugging.`,
			},
		]
	},
}
