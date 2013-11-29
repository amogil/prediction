class Tracker
  constructor: ->
    @api = new PredictionAPI Settings.API_URL, Settings.API_KEY
    jQuery('.product-view form').each (_, f) ->
      form = jQuery(f)
      item_id = form.find("input[name='product']").val()
      @api.registerItem item_id
      @api.registerUserItemAction @userId(), item_id, 'view'

      form.find('.add-to-cart button').click () ->
        @api.registerUserItemAction @userId(), item_id, 'conversion'
      form.find('.link-wishlist').click () ->
        @api.registerUserItemAction @userId(), item_id, 'like'

  generateUserId: () =>
    random_user_id = ''
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for _ in [1..8]
      random_user_id += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    random_user_id

  userId: =>
    user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME)
    unless user_id
      @api.registerUser(user_id)
      jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, expires: 9999, domain: ".#{location.host}")
    user_id