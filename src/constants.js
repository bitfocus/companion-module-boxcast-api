module.exports = {
	POLLINGRATE: 1000,
	RECONNECT_TIME: 30000,

	INTERVAL: null, //used for polling device for feedbacks
	RECONNECT_INTERVAL: null, //used for reconnecting to device

	BASEURL: 'https://rest.boxcast.com',

	CURRENT_BROADCAST_ID: undefined,
	NEXT_BROADCAST_ID: undefined,

	CHANNELS: [],
	BROADCASTS: [],

	CHOICES_CHANNELS: [
		{ id: undefined, label: 'No Channels Available' },
	],

	CHOICES_BROADCASTS: [
		{ id: undefined, label: 'No Broadcasts Available' },
	],

	CHOICES_BROADCAST_TIMEFRAME: [
		{ id: 'future', label: 'Future' },
		{ id: 'preroll', label: 'Preroll' },
		{ id: 'current', label: 'Current' },
		{ id: 'past', label: 'Past' },
	],
}
