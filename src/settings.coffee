class Settings
	@MODE = 'debug'
	@API_KEY: 'KdpSqVJNTquC4wzt0vuW8898gunhCNaoiDZXyCbUbIalFcE1FyBtsOZvZhF4tjeu'
	@API_URL: 'http://193.107.237.171:81'
	@USER_ID_COOKIE_NAME: 'puid'

	@is_debug: () -> @.MODE == 'debug'