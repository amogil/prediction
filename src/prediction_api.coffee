class PredictionAPI
  constructor: (url, apiKey) ->
    @url = url
    @apiKey = apiKey

  registerUser: (userId) =>
    @request pio_uid: userId

  registerItem: (itemId, categoriesIds = []) =>
    @request pio_iid: itemId, categoriesIds.join ','

  registerUserItemAction: (userId, itemId, action) =>
    @request pio_uid: userId, pio_iid: itemId, pio_action: action

  request: (data) =>
    data['pio_appkey'] = @apiKey
    $.ajax
      crossDomain: true
      url: "#{@url}/users.json"
      type: 'POST'
      data: data