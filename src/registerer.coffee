class Registerer
	ACTION_REGISTER_ITEM: 1
	ACTION_VIEW: 2
	ACTION_REGISTER_USER: 3

	constructor: ->
		@store = new CookiesActionStore()
		@api = new PredictionAPI()
		@store.getActions().each (action) =>
			@do_action_job(action[0], action[1], action[2]) if action

	registerUser: (user_id) =>
		@process_action(@ACTION_REGISTER_USER, user_id)

	registerItem: (item_id, categories) =>
		@process_action(@ACTION_REGISTER_ITEM, [item_id, categories])

	registerItemViewAction: (item_id) =>
		@process_action(@ACTION_VIEW, item_id)

	registerItemAddToCompareAction: (item_id) =>
		@process_action(@ACTION_VIEW, item_id)

	process_action: (type, params) =>
		id = @store.addAction(type, params)
		@do_action_job(id, type, params)

	do_action_job: (id, type, params) =>
		try
			if !id || !type || !params
				console.log("Warning while processing action. Bad params: #{id}, #{type}, #{params}") if Settings.is_debug()
				return
			on_success = () => @store.deleteAction(id)
			if type == @ACTION_REGISTER_USER
				@api.registerUser(params, on_success)
			else if type == @ACTION_VIEW
				@api.registerUserItemAction(@userId(), params, 'view', on_success)
			else if type == @ACTION_REGISTER_ITEM
				@api.registerItem(params[0], params[1], on_success)
		catch e
			console.log("Error while processing action: #{e}") if Settings.is_debug()
			@store.deleteAction(id)

	userId: =>
		user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME)
		unless user_id
			user_id = @store.generate(8)
			@registerUser(user_id)
			jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, expires: 365 * 10, path: '/', domain: ".#{location.host}")
		user_id