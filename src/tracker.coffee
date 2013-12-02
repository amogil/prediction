class Tracker
	constructor: ->
		@api = new PredictionAPI()
		@trackProductView()

	trackProductView: () =>
		jQuery('.product-view form').each (_, f) =>
			form = jQuery(f)
			item_id = form.find("input[name='product']").val()
			@api.registerItem item_id, [@currentCategory()]
			@api.registerUserItemAction @userId(), item_id, 'view'

#      form.find('.add-to-cart button').click () =>
#        @api.registerUserItemAction @userId(), item_id, 'conversion'
#      form.find('.link-wishlist').click () =>
#        @api.registerUserItemAction @userId(), item_id, 'like'


	generateUserId: () =>
		alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		random_user_id = ''
		[1..8].map(() -> alphabet.charAt(Math.floor(Math.random() * alphabet.length))).reduce((a, b) -> a + b)
		random_user_id

	currentCategory: () =>
		jQuery('.breadcrumbs li').each (_, item) ->
			starts_with_category = (s) -> s.indexOf('category') == 0
			to_cats_list = (_, e) -> jQuery(e).attr('class').split(' ').filter(starts_with_category)
			withCats = jQuery(item).map to_cats_list
			cat = withCats.first()
			return match.last() if cat && (match = /category(\d+)/.exec(cat.first()))
			'default'

	userId: =>
		user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME)
		unless user_id
			user_id = @generateUserId()
			@api.registerUser(user_id)
			jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, expires: 365 * 10, path: '/', domain: ".#{location.host}")
		user_id