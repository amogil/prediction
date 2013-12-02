class Registerer
	ACTION_REGISTER_ITEM: 1
	ACTION_VIEW: 2

	ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	constructor: ->
		@store = new CookiesActionStore()
		@api = new PredictionAPI()

	process: =>
		@store.getActions().each (_, a) =>
			action = @store.getAction(a[0])
			if action
				id = action[0]
				type = action[1]
				params = action[2]


	enqueueProcess: =>
		setTimeout((() => @process()), 0)

	registerItem: (item_id, categories) =>
		@store.addAction(@ACTION_REGISTER_ITEM, [item_id, categories])
		@enqueueProcess()

	registerItemViewAction: (item_id) =>
		@store.addAction(@ACTION_VIEW, item_id)
		@enqueueProcess()

	registerItemAddToCompareAction: (item_id) =>
		@store.addAction(@ACTION_VIEW, item_id)
		@enqueueProcess()