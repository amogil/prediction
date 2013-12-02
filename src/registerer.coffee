class Registerer
	ACTION_REGISTER_ITEM: 1
	ACTION_VIEW: 2
	ACTION_REGISTER_USER: 3

	constructor: ->
		@store = new CookiesActionStore()
		@api = new PredictionAPI()
		@enqueueProcess()

	process: =>
		@store.getActions().each (a) =>
			action = @store.getAction(a[0])
			@process_action(action[0], action[1], action[2]) if action

	enqueueProcess: =>
		setTimeout((() => @process()), 0)

	registerUser: (user_id) =>
		@store.addAction(@ACTION_REGISTER_USER, user_id)
		@enqueueProcess()

	registerItem: (item_id, categories) =>
		@store.addAction(@ACTION_REGISTER_ITEM, [item_id, categories])
		@enqueueProcess()

	registerItemViewAction: (item_id) =>
		@store.addAction(@ACTION_VIEW, item_id)
		@enqueueProcess()

	registerItemAddToCompareAction: (item_id) =>
		@store.addAction(@ACTION_VIEW, item_id)
		@enqueueProcess()

	process_action: (id, type, params) =>
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
			user_id = @generate(8)
			@registerUser(user_id)
			jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, expires: 365 * 10, path: '/', domain: ".#{location.host}")
		user_id