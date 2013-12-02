class CookiesActionStore
	ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	load: =>
		@data = []
		try
			cookie = jQuery.cookie(Settings.INFO_COOKIE_NAME)
			if cookie
				data = JSON.parse(cookie)
				@data = data if data instanceof Array
		catch e
			console.log("Error while loading actions data from cookies: #{e}") if Settings.is_debug()
		@data

	current: => @data || @load()

	save: =>
		if @data.length == 0
			console.log('Cleaning up tracking data') if Settings.is_debug()
			jQuery.removeCookie(Settings.INFO_COOKIE_NAME, path: '/', domain: ".#{location.host}")
		else
			console.log("Saving tracking data: #{@data}") if Settings.is_debug()
			jQuery.cookie(Settings.INFO_COOKIE_NAME, JSON.stringify(@data),
				expires: 365 * 10, path: '/', domain: ".#{location.host}")

	newId: => @generate(2) + @current().length

	addAction: (type, params) =>
		id = @newId()
		@current().push([id, type, params])
		@save()
		id

	getAction: (id) =>
		@getActions().filter((e) -> e[0] == id)[0]

	getActions: =>
		@current()

	deleteAction: (id) =>
		@data = @current().filter((e) -> e[0] != id)
		@save()

	generate: (count) =>
		[1..count].map(() => @ALPHABET.charAt(Math.floor(Math.random() * @ALPHABET.length))).reduce((a, b) -> a + b)