/* the preloader: progress bar, and the game must wait for the assets */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

const tick = () => new Promise(r => setTimeout(r, 0))

/* pending sound requests, completed by the test one at a time */
function makeAudioSandbox(opts = {}) {
	const pending = []
	const s = makeSandbox({
		audio: true,
		fonts: { load: () => Promise.resolve([{}]) },
		xhr: (req) => {
			if (opts.failAll) { req.onerror() ; return }
			pending.push(req)
		},
	})
	return { ...s, pending }
}

function finishOne(req) {
	req.status = 200
	req.response = new ArrayBuffer(8)
	req.onload()
}

/* --- 1. the bar tracks progress and the game waits for every asset --- */
{
	const { sandbox, listeners, rafQueue, calls, pending } = makeAudioSandbox()
	await loadGame(sandbox)
	const GO = sandbox.GO
	boot(listeners)
	await tick()

	const L = GO.Loader
	console.log('--- progress ---')
	console.log('assets tracked:', L.total, '(1 font + 20 samples)')
	console.log('sound requests fired:', pending.length)
	console.log('started before assets done:', !!GO.scene, '(must be false)')

	/* drain the rAF queue once so the bar gets drawn */
	const step = makeStep(rafQueue, sandbox)
	calls.length = 0
	step(1)
	const bar = calls.filter(c => c[0] === 'fillRect' || c[0] === 'strokeRect')
	console.log('bar draw calls:', bar.map(c => c[0] + '(' + c.slice(1).join(',') + ')').join(' '))

	const half = Math.floor(pending.length / 2)
	for (let i = 0; i < half; i++) finishOne(pending[i])
	await tick()
	console.log('after ' + half + ' samples: loaded=' + L.loaded + '/' + L.total,
		'| still waiting:', !GO.scene)

	calls.length = 0
	step(1)
	const fill = calls.filter(c => c[0] === 'fillRect').pop()
	console.log('filled width at ' + L.loaded + '/' + L.total + ':', fill[3], 'of', L.barWidth)

	for (let i = half; i < pending.length; i++) finishOne(pending[i])
	await tick()
	console.log('all assets done -> started:', !!GO.scene,
		'| loaded=' + L.loaded + '/' + L.total)

	step(200)
	console.log('runs:', GO.scene === GO.scenes.intro ? 'intro scene' : 'other',
		'| samples decoded:', Object.keys(GO.Sound.buffers).length)
	console.log('bar stops redrawing:', GO.Loader.done)
}

/* --- 2. every sound 404s: must not block, game starts, stays silent --- */
{
	const { sandbox, listeners, rafQueue } = makeAudioSandbox({ failAll: true })
	await loadGame(sandbox)
	const GO = sandbox.GO
	boot(listeners)
	await tick()
	console.log('\n--- all sounds 404 ---')
	console.log('started anyway:', !!GO.scene, '| decoded:', Object.keys(GO.Sound.buffers).length)
	makeStep(rafQueue, sandbox)(60)
	console.log('play() is a no-op, no throw:', (GO.Sound.play('hit'), true))
}

/* --- 3. sounds never answer: the timeout has to start the game --- */
{
	const { sandbox, listeners, rafQueue } = makeAudioSandbox()
	await loadGame(sandbox)
	const GO = sandbox.GO
	GO.Loader.timeout = 120
	boot(listeners)
	await tick()
	console.log('\n--- sounds hang ---')
	console.log('started before timeout:', !!GO.scene, '(must be false)')
	await new Promise(r => setTimeout(r, 250))
	console.log('started after timeout:', !!GO.scene, '(must be true)',
		'| loaded=' + GO.Loader.loaded + '/' + GO.Loader.total)
	makeStep(rafQueue, sandbox)(60)
	console.log('runs:', GO.scene === GO.scenes.intro ? 'intro scene' : 'other')
}

/* --- 4. no audio support at all: only the font is tracked --- */
{
	const { sandbox, listeners, rafQueue } = makeSandbox({
		fonts: { load: () => Promise.resolve([{}]) },
	})
	await loadGame(sandbox)
	const GO = sandbox.GO
	boot(listeners)
	await tick()
	console.log('\n--- no AudioContext ---')
	console.log('assets tracked:', GO.Loader.total, '(font only)',
		'| sound enabled:', GO.Sound.enabled, '| started:', !!GO.scene)
	makeStep(rafQueue, sandbox)(60)
	console.log('runs:', GO.scene === GO.scenes.intro ? 'intro scene' : 'other')
}

console.log('\nOK')
