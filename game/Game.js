
GO.config.fontName = 'atari'
GO.config.showFPS = true

P4.track = function(t)
{
}

GO.init = function()
{
	this.debug = document.location.hash == '#d' || document.location.hash == '#debug'

	if (this.debug) {
		//this.godMode = true
		//this.wireFrame = true
	}

	GO.handlers.push({
		process: function() {
			switch (GO.Event.Keyboard.chr) {
				case '0':
					if (GO.debug
						&& GO.scenes.game
						&& GO.scene == GO.scenes.game
						&& GO.scenes.game.level) {

						var next = GO.scenes.game.level.skipToNextLevel()
						GO.showMsg(next ? 'skip to ' + next : 'no next level')
					}
				break

				case '8':
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
						GO.godMode = !GO.godMode
						GO.showMsg(GO.godMode ? 'god mode on' : 'god mode off')

						/* the spawn invincibility timer is skipped in god mode */
						if (!GO.godMode && GO.scenes.game) {
							GO.scenes.game.player.invincible = false
						}
					}
				break

				case '7':
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

