
GO.config.fontName = 'atari'
GO.config.showFPS = false

P4.track = function(t)
{
}

P4.FormatDiff = function(diff)
{
	switch (Number(diff)) {
		case 0: return 'easy'
		case 1: return 'normal'
		case 2: return 'hard'
		case 3: return 'ultra'
		default: return 'easy'
	}
}

P4.DiffFromText = function(diff)
{
	switch (diff) {
		case 'easy': return 0
		case 'normal': return 1
		case 'hard': return 2
		case 'ultra': return 3
		default: return false
	}
}

P4.GameState = { }

P4.GameState.init = function()
{
	if (!window.localStorage) {
		return
	}
	
	P4.GameState.data = { }

	var state = window.localStorage.getItem('p4GameState')
	if (!state) {
		return
	}

	state = JSON.parse(state)
	if (!state) {
		return
	}

	P4.GameState.data = state
}

P4.GameState.store = function(key, val)
{
	P4.GameState.data[key] = val

	P4.GameState.commit()
}

P4.GameState.commit = function()
{
	if (!window.localStorage) {
		return
	}
	
	window.localStorage.setItem('p4GameState', P4.GameState.data);
}

P4.GameState.get = function(key)
{
	if (!P4.GameState.data.hasOwnProperty(key)) {
		return false
	}

	return P4.GameState.data[key]
}

GO.init = function()
{
	P4.GameState.init()

	this.debug = document.location.hash.indexOf('#d') > -1

	if (this.debug) {
		this.godMode = document.location.hash.indexOf('godmode') > -1
		//this.wireFrame = true
		this.config.showFPS = true
	}

	GO.handlers.push({
		process: function() {
			switch (GO.Event.Keyboard.chr) {
				case '0':
					if (GO.debug) {
						if (GO.speed == 1) {
							GO.showMsg('slow motion on')
							GO.speed = 0.5
						} else {
							GO.showMsg('slow motion off')
							GO.speed = 1
						}
					}
				break
				
				case '9':
					if (GO.debug) {
						if (GO.speed == 1) {
							GO.showMsg('fast motion on')
							GO.speed = 1.5
						} else {
							GO.showMsg('fast motion off')
							GO.speed = 1
						}
					}
				break

				case '=':
					if (GO.debug) {
						GO.pause = true
					}
				break
			}
		}
	})

	GO.scenes.intro = new P4.IntroScene
	GO.scenes.menu = new P4.MenuScene
	
	if (this.debug) {
		/* jump to level via url hash: #d,level=10 */
		var ret = document.location.hash.match(/level=(\d+)/)
			,level = ret ? ret[1] : false
			,ret = document.location.hash.match(/diff=(\d+)/)
			,diff = ret ? ret[1] : 0

		GO.scenes.game = new P4.GameScene({ level: level, score: 100, lives: 3, diff: diff })
		GO.setScene(GO.scenes.game)
	} else {
		GO.setScene(GO.scenes.intro)
	}
}

addEventListener('load', function() {
	GO.start()
}, true)

