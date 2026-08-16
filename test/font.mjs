/* the game must not draw its first frame before the webfont is there */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

async function scenario(label, fonts, waitMs) {
	const { sandbox, listeners, rafQueue } = makeSandbox({ fonts })
	await loadGame(sandbox)

	const GO = sandbox.GO
	GO.config.fontTimeout = 100

	const requested = []
	if (fonts) fonts.requested = requested

	boot(listeners)

	const startedSync = !!GO.scene
	if (waitMs) await new Promise(r => setTimeout(r, waitMs))

	console.log(label)
	console.log('  requested:', requested.length ? requested.join(', ') : '(nothing)')
	console.log('  started synchronously:', startedSync, '| started:', !!GO.scene)

	if (GO.scene) {
		makeStep(rafQueue, sandbox)(60)
		console.log('  runs, scene:', GO.scene.constructor.name,
			'| font in use:', GO.config.fontName)
	}
}

/* 1. no Font Loading API at all: start right away */
await scenario('no document.fonts (old browser)', null, 0)

/* 2. font resolves: start only after it has loaded */
let resolveFont
const slow = {
	load(spec) {
		this.requested.push(spec)
		return new Promise(r => { resolveFont = () => r([{}]) })
	},
}
{
	const { sandbox, listeners, rafQueue } = makeSandbox({ fonts: slow })
	await loadGame(sandbox)
	const GO = sandbox.GO
	GO.config.fontTimeout = 100000
	slow.requested = []
	boot(listeners)
	console.log('font still loading')
	console.log('  requested:', slow.requested.join(', '))
	console.log('  started before font arrived:', !!GO.scene, '(must be false)')
	resolveFont()
	await new Promise(r => setTimeout(r, 10))
	console.log('  started after font arrived:', !!GO.scene, '(must be true)')
	makeStep(rafQueue, sandbox)(60)
	console.log('  runs, scene:', GO.scene.constructor.name)
}

/* 3. font never arrives: the timeout has to start the game anyway */
await scenario('font never loads (timeout)',
	{ load() { this.requested.push('x'); return new Promise(() => {}) } }, 250)

/* 4. font load rejects (404): must not swallow the start */
await scenario('font load rejects (404)',
	{ load(s) { this.requested.push(s); return Promise.reject(new Error('404')) } }, 30)

console.log('OK')
