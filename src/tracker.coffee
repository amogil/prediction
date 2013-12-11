class Tracker
	constructor: ->
		@reg = new Registerer()
		@api = new PredictionAPI()
		@trackProductView()
		@subscribeCompareLinks()

		@subscribeAddToCartAtWishList()
		@subscribeAddToCartAtProductView()
		@subscribeAddToCartAtCategoryView()
		@subscribeAddToCartAtCompareView()

		@subscribeAddToWishlistAtProductView()
		@subscribeAddToWishlistAtCategoryView()
		@subscribeAddToWishlistAtCompareView()

		@injectRecommendations()

	injectRecommendations: =>
		on_sucdess = (data) -> console.log(data)
		if jQuery('.category-products').length > 0 && (category_id = @currentCategory())
			@api.getRecommendations(@reg.userId(), category_id, on_sucdess)
			console.log("Product list for category #{category_id}")

	subscribeAddToWishlistAtCompareView: =>
		jQuery('.compare-table .link-wishlist').click (e) =>
			item = jQuery(e.target)
			if (match = /\/wishlist.+\/product\/(\d+)\//.exec item.attr('href'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToWishlistAction item_id

	subscribeAddToWishlistAtCategoryView: =>
		jQuery('.category-products .link-wishlist').click (e) =>
			item = jQuery(e.target)
			if (match = /\/wishlist\/index\/add\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToWishlistAction item_id

	subscribeAddToWishlistAtProductView: =>
		jQuery('.product-view .link-wishlist').click (e) =>
			item = jQuery(e.target)
			if (match = /\/wishlist\/index\/add\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToWishlistAction item_id

	subscribeAddToCartAtCompareView: =>
		jQuery('.compare-table .btn-cart').click (e) =>
			item = jQuery(e.target)
			item = item.parent().parent()
			if (match = /\/checkout\/.+\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToCart item_id

	subscribeAddToCartAtCategoryView: =>
		jQuery('.category-products .btn-cart').click (e) =>
			item = jQuery(e.target)
			item = item.parent().parent()
			if (match = /\/checkout\/.+\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToCart item_id

	subscribeAddToCartAtWishList: =>
		# Добавить все в корзину
		jQuery('.my-wishlist .btn-add').click =>
			get_item_id = (_, e) -> jQuery(e).attr('id').gsub(/^product-price-/, '')
			jQuery('.my-wishlist [id^="product-price-"]').map(get_item_id).each (_, item_id) =>
				@reg.registerItemAddToCart item_id

		# Добавить в корзину
		jQuery('.my-wishlist .cart-cell').each (_, e) =>
			cell = jQuery(e)
			item_id = jQuery('[id^="product-price-"]', cell).attr('id').gsub(/^product-price-/, '')
			jQuery('.btn-cart', cell).click => @reg.registerItemAddToCart item_id

	subscribeAddToCartAtProductView: =>
		jQuery('.product-view form').each (_, f) =>
			form = jQuery(f)
			item_id = form.find("input[name='product']").val()
			jQuery('.btn-cart', form).click =>
				@reg.registerItemAddToCart item_id

	subscribeCompareLinks: =>
		jQuery('.link-compare').click (e) =>
			item = jQuery(e.target)
			if (match = /\/product_compare\/add\/product\/(\d+)\//.exec item.attr('onclick'))
				item_id = match[match.length - 1]
				@reg.registerItemAddToCompareAction item_id

	trackProductView: =>
		jQuery('.product-view form').each (_, f) =>
			form = jQuery(f)
			item_id = form.find("input[name='product']").val()
			cat = @currentCategory()
			@reg.registerItem item_id, [cat] if cat && cat.length > 0
			@reg.registerItemViewAction item_id

	currentCategory: =>
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