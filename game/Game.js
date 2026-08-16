import { GO } from '../engine/engine.js'
import { P4 } from './P4.js'
import './GameState.js'
import { soundUrls } from './sounds.js'
import './IntroScene.js'
import './MenuScene.js'
import './GameScene.js'

GO.Sound.setUrls(soundUrls)

GO.config.fontName = 'atari'
GO.config.showFPS = false

/* handy when poking at the game from the browser console in debug mode */
window.GO = GO
window.P4 = P4

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
	GO.boot()
}, true)

