class PredictionAPI
	constructor: () ->
		jQuery.support.cors = true

	registerUser: (userId, successCallback) =>
		@request 'users.json', successCallback, pio_uid: userId

	registerItem: (itemId, categoriesIds, successCallback) =>
		@request 'items.json', successCallback, pio_iid: itemId, pio_itypes: categoriesIds.join ','

	registerUserItemAction: (userId, itemId, action, successCallback) =>
		@request 'actions/u2i.json', successCallback, pio_uid: userId, pio_iid: itemId, pio_action: action

	getRecommendations: (userId, successCallback, max_count = 3) =>
		params = jQuery.param(pio_uid: userId, pio_n: max_count, pio_appkey: Settings.API_KEY)
		url = "engines/itemrec/#{Settings.PREDIOCTION_ENGINE_ID}/topn.json?#{params}"
		@request url, successCallback

	request: (path_and_qs, successCallback, data = null) =>
		url = "#{Settings.API_URL}/#{path_and_qs}"
		options =
			if data
				type: 'POST'
				contentType: 'application/json'
				dataType: 'json'
				data: JSON.stringify(jQuery.extend({pio_appkey: Settings.API_KEY}, data))
			else
				type: 'GET'
		base_options = {
			url: url
			crossDomain: true
			success: (data) =>
				console.log('Success!') if Settings.is_debug()
				successCallback(data) if successCallback
			error: (_xhr, _textStatus, error) => console.log("Error: #{error}!") if Settings.is_debug()
		}
		console.log("Sending #{JSON.stringify(data || '')} to #{url}") if Settings.is_debug()
		jQuery.ajax(jQuery.extend base_options, options)