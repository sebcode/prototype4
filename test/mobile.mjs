/* faithful-ish phone: touch + AudioContext + document.fonts + portrait */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

const pending = []
const { sandbox, listeners, rafQueue } = makeSandbox({
	touch: true,
	audio: true,
	fonts: { load: () => Promise.resolve([{}]) },
	xhr: (req) => pending.push(req),
})
sandbox.innerWidth = 390
sandbox.innerHeight = 844

await loadGame(sandbox)
boot(listeners)
await new Promise(r => setTimeout(r, 0))

const GO = sandbox.GO
console.log('loader:', GO.Loader.loaded + '/' + GO.Loader.total, '| started:', !!GO.scene)

/* let all the samples arrive */
for (const req of pending) {
	req.status = 200
	req.response = new ArrayBuffer(8)
	req.onload()
}
await new Promise(r => setTimeout(r, 0))
console.log('after samples: started:', !!GO.scene, '| scale:', GO.Screen.scale.toFixed(3))

const step = makeStep(rafQueue, sandbox)

/* run frames, reporting the first exception instead of dying silently */
let err = null
for (let i = 0; i < 200 && !err; i++) {
	try { step(1) } catch (e) { err = e }
}

if (err) {
	console.log('EXCEPTION in frame loop:', err.message)
	console.log(err.stack.split('\n').slice(0, 4).join('\n'))
} else {
	console.log('200 frames ok')
}

console.log('locked:', GO.scene.locked, '| items:', GO.scene.items)
console.log('menuItemCount:', GO.scene.menuItemCount())

console.log('OK')
