
GO.config.fontName = 'atari'
GO.config.showFPS = false

P4.track = function(t)
{
}

GO.init = function()
{
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
			}
		}
	})

	GO.scenes.intro = new P4.IntroScene
	GO.scenes.menu = new P4.MenuScene
	
	if (this.debug) {
		/* jump to level via url hash: #d,level=10 */
		var ret = document.location.hash.match(/level=(\d+)/)
			,level = ret ? ret[1] : false

		console.log(level)
		GO.scenes.game = new P4.GameScene(level)
		GO.setScene(GO.scenes.game)
	} else {
		GO.setScene(GO.scenes.intro)
	}
}

addEventListener('load', function() {
	GO.start()
}, true)

