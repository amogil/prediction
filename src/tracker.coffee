class Tracker
	constructor: ->
		@reg = new Registerer()
		@trackProductView()
		@subscribeCompare()

	subscribeCompare: () =>
		jQuery('.link-compare').click (e) =>
			item = jQuery(e.target)
			if (match = /\/product_compare\/add\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToCompareAction item_id

	trackProductView: () =>
		jQuery('.product-view form').each (_, f) =>
			form = jQuery(f)
			item_id = form.find("input[name='product']").val()
			@reg.registerItem item_id, [@currentCategory()]
			@reg.registerItemViewAction item_id

#      form.find('.add-to-cart button').click () =>
#        @reg.registerUserItemAction @userId(), item_id, 'conversion'
#      form.find('.link-wishlist').click () =>
#        @reg.registerUserItemAction @userId(), item_id, 'like'

	currentCategory: () =>
		item_cat = (item) ->
			starts_with_category = (s) -> s.indexOf('category') == 0
			to_cats_list = (_, e) -> jQuery(e).attr('class').split(' ').filter(starts_with_category)
			withCats = jQuery(item).map to_cats_list
			cat = withCats[0]
			if cat && (match = /category(\d+)/.exec cat)
				match[match.length - 1]
			else
				null
		categories = jQuery('.breadcrumbs li').map((_, item) -> item_cat(item)).filter((_, c) -> c)
		categories[0]