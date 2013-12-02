class PredictionAPI
	constructor: () ->
		jQuery.support.cors = true

	registerUser: (userId, successCallback) =>
		@request 'users.json', successCallback, pio_uid: userId

	registerItem: (itemId, categoriesIds, successCallback) =>
		@request 'items.json', successCallback, pio_iid: itemId, pio_itypes: categoriesIds.join ','

	registerUserItemAction: (userId, itemId, action, successCallback) =>
		@request 'actions/u2i.json', successCallback, pio_uid: userId, pio_iid: itemId, pio_action: action

	request: (path, successCallback, data) =>
		url = "#{Settings.API_URL}/#{path}"
		console.log("Posting #{JSON.stringify(data)} to #{url}") if Settings.is_debug()
		jQuery.ajax
			url: url
			type: 'POST'
			contentType: 'application/json'
			dataType: 'json'
			crossDomain: true
			data: JSON.stringify(jQuery.extend({pio_appkey: Settings.API_KEY}, data))
			success: () =>
				console.log('Success!') if Settings.is_debug()
				successCallback() if successCallback
			error: (_xhr, _textStatus, error) => console.log("Error: #{error}!") if Settings.is_debug()