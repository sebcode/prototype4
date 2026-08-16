/* exercises the EndScene branches that the other tests miss */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

async function run(label, hash, storage, frames, drive) {
	const { sandbox, listeners, rafQueue } = makeSandbox({ hash, storage })
	await loadGame(sandbox)
	boot(listeners)
	const GO = sandbox.GO, P4 = sandbox.P4
	const step = makeStep(rafQueue, sandbox)
	let t = 0
	for (let i = 0; i < frames; i++) {
		t += 0.05
		GO.Event.Mouse.x = 320 + Math.sin(t) * 200
		GO.Event.Mouse.y = drive ? 360 + Math.cos(t * 0.7) * 80 : 20
		step(1)
		if (GO.scene === GO.scenes.end) break
	}
	const s = GO.scene
	console.log(label + ':',
		s === GO.scenes.end
			? `EndScene "${s.label1}" score=${s.score} newHighscore=${s.isNewHighScore}`
			: 'still in ' + s.constructor.name)
	console.log('  saved:', JSON.stringify(P4.GameState.data))
}

/* beating a stored highscore must render the NEW HIGHSCORE label */
await run('new highscore', '#d,godmode,level=20',
	{ 'p4.GameState': JSON.stringify({ highscore: { 0: 10 } }) }, 30000, true)

/* dying with no lives left must reach Game Over (no godmode, parked ship) */
await run('game over', '#d,level=1', {}, 30000, false)

console.log('OK')
