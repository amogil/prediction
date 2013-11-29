class PredictionAPI
  constructor: (url, apiKey) ->
    @url = url
    @apiKey = apiKey

  registerUser: (userId) =>
    @request 'users.json', pio_uid: userId

  registerItem: (itemId, categoriesIds = []) =>
    @request 'items.json', pio_iid: itemId, pio_itypes: categoriesIds.join ','

  registerUserItemAction: (userId, itemId, action) =>
    @request 'actions/u2i.json', pio_uid: userId, pio_iid: itemId, pio_action: action

  request: (path, data) =>
    url = "#{@url}/#{path}"
    console.log("Posting #{JSON.stringify(data)} to #{url} ...") if Settings.MODE == 'debug'
    jQuery.ajax
      url: url
      type: 'POST'
      data: jQuery.extend({pio_appkey: @apiKey}, data)
      success: () =>
        console.log('Success!') if Settings.MODE == 'debug'
      error: (xhr) =>
        console.log("Error! HTTP Code: #{xhr}") if Settings.MODE == 'debug'