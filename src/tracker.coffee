class Tracker
  constructor: ->
    @api = new PredictionAPI Settings.API_URL, Settings.API_KEY
    jQuery('.product-view').each (_, e) ->
      if form = jQuery('form', jQuery(e)).first()
        if item = /^.*\/(\d+)\//.exec(form.action)[1]
          @api.registerItem item

          jQuery(form).find('.add-to-cart button').click () ->
            @api.registerUserItemAction @userId(), item, 'conversion'
            true

          jQuery(form).find('.link-wishlist').click () ->
            @api.registerUserItemAction @userId(), item, 'like'
            true

          @api.registerUserItemAction @userId(), item, 'view'

  generateUserId: () =>
    random_user_id = ''
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    i = 0
    while i < 8
      random_user_id += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
      i++
    random_user_id

  userId: =>
    user_id = jQuery.cookie('puid')
    unless user_id
      @api.registerUser(user_id)
      jQuery.cookie('puid', user_id, expires: 9999, domain: '')
    user_id