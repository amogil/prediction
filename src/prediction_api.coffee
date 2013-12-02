class PredictionAPI
  constructor: () ->
    jQuery.support.cors = true

  registerUser: (userId) =>
    @request 'users.json', pio_uid: userId

  registerItem: (itemId, categoriesIds = ['default']) =>
    @request 'items.json', pio_iid: itemId, pio_itypes: categoriesIds.join ','

  registerUserItemAction: (userId, itemId, action) =>
    @request 'actions/u2i.json', pio_uid: userId, pio_iid: itemId, pio_action: action

  request: (path, data) =>
    url = "#{Settings.API_URL}/#{path}"
    console.log("Posting #{JSON.stringify(data)} to #{url}") if Settings.is_debug()
    jQuery.ajax
      url: url
      type: 'POST'
      contentType: 'application/json; charset=utf-8'
      dataType: 'json'
      crossDomain: true
      data: JSON.stringify(jQuery.extend({pio_appkey: Settings.API_KEY}, data))
      success: () =>
        console.log('Success!') if Settings.is_debug()
      error: (_xhr, _textStatus, error) =>
        console.log("Error: #{error}!") if Settings.is_debug()