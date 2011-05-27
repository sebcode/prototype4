
GO.config.fontName = 'atari'
GO.config.showFPS = false

P4.track = function(t)
{
}

GO.init = function()
{
	this.debug = document.location.hash == '#d'

	if (this.debug) {
		//this.godMode = true
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
		GO.scenes.game = new P4.GameScene
		GO.setScene(GO.scenes.game)
	} else {
		GO.setScene(GO.scenes.intro)
	}
}

addEventListener('load', function() {
	GO.start()
}, true)

