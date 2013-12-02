class CookiesActionStore

	load: =>
		@data = try
			JSON.parse(jQuery.cookie(Settings.INFO_COOKIE_NAME))
		catch _
			[]
		@data

	current: => @data || load()

	save: =>
		if @data.length == 0
			jQuery.cookie(Settings.INFO_COOKIE_NAME, null)
		else
			jQuery.cookie(Settings.INFO_COOKIE_NAME, JSON.stringify(@data),
				expires: 365 * 10, path: '/', domain: ".#{location.host}")

	newId: => @generate(2) + @current().length

	addAction: (type, params) =>
		@current().push([@newId(), type, params])
		@save()

	getAction: (id) =>
		@getActions().filter((_, e) -> e[0] == id)[0]

	getActions: =>
		@current()

	deleteAction: (id) =>
		@data = @current().filter((_, e) -> e[0] != id)
		@save()

	generate: (count) =>
		[1..count].map(() -> @ALPHABET.charAt(Math.floor(Math.random() * @alphabet.length))).reduce((a, b) -> a + b)

	userId: =>
		user_id = jQuery.cookie(Settings.USER_ID_COOKIE_NAME)
		unless user_id
			user_id = @generate(8)
			@registerUser(user_id)
			jQuery.cookie(Settings.USER_ID_COOKIE_NAME, user_id, expires: 365 * 10, path: '/', domain: ".#{location.host}")
		user_id