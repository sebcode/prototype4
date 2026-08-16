/* drives intro -> menu -> gameplay, or jumps straight to a debug level */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

const hash = process.argv[2] || ''
const frames = Number(process.argv[3] || 4000)

const { sandbox, listeners, rafQueue } = makeSandbox({ hash })
await loadGame(sandbox)
boot(listeners)

const GO = sandbox.GO
const P4 = sandbox.P4

if (!GO) throw new Error('GO was not exposed on window')
if (!GO.scene) throw new Error('no scene after start')

const rawStep = makeStep(rafQueue, sandbox)
const seen = new Set()

let t = 0
function step(n) {
	rawStep(n, null)
}
function play(n) {
	for (let i = 0; i < n; i++) {
		t += 0.05
		GO.Event.Mouse.x = 320 + Math.sin(t) * 200
		GO.Event.Mouse.y = 360 + Math.cos(t * 0.7) * 80
		rawStep(1)
		if (GO.scene === GO.scenes.game && GO.scenes.game.level.levelText) {
			seen.add(GO.scenes.game.level.levelText)
		}
	}
}

function clickAt(x, y) {
	GO.Event.Mouse.x = x
	GO.Event.Mouse.y = y
	GO.Event.Mouse.click = true
	step(1)
}

console.log(`--- ${hash ? `hash="${hash}"` : 'intro flow'} ---`)

if (!hash) {
	play(200)
	if (!(GO.scene instanceof P4.IntroScene)) throw new Error('not in intro')
	console.log('intro menu items:', GO.scene.items.join(', '))

	const idx = GO.scene.items.indexOf('new game')
	clickAt(320, 480 / 2 + 25 + idx * 40 + 10)
	play(5)
	console.log('difficulty menu:', GO.scene.items.join(', '))

	const d = GO.scene.items.indexOf('hard')
	clickAt(320, 480 / 2 + 25 + d * 40 + 10)
	play(200)
	if (!(GO.scene instanceof P4.GameScene)) throw new Error('game did not start')
	console.log('difficulty applied: energy=' + P4.Player.prototype.energy
		+ ' lives=' + P4.Player.prototype.lives
		+ ' bulletSpeed=' + P4.EnemyShip.prototype.bulletSpeed)
}

play(frames)

console.log('scene:', GO.scene.constructor === P4.GameScene ? 'game'
	: GO.scene.constructor === P4.EndScene ? 'end (' + GO.scene.label1 + ', score ' + GO.scene.score + ')'
	: GO.scene.constructor === P4.IntroScene ? 'intro' : 'menu')
if (GO.scenes.game) {
	console.log('levels seen:', [...seen].join(' | ') || '(none)')
	console.log('score:', GO.scenes.game.player.score,
		'lives:', GO.scenes.game.player.lives,
		'enemies:', P4.Enemy.count)
}
console.log('savegame:', JSON.stringify(P4.GameState.data))
console.log('OK')
