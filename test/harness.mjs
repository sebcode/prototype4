/*
 * Shared test harness: stubs enough DOM/canvas to run the real game modules
 * in Node. Needs --experimental-vm-modules for vm.SourceTextModule.
 */
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { pathToFileURL, fileURLToPath } from 'url'

/* repository root, and the entry the tests load by default */
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const entryEnv = process.env.P4_ENTRY
export const noop = () => {}

/* virtual clock: the caller advances it one frame at a time */
export const clock = { t: 1000000 }
class FakeDate {
	getTime() { return clock.t }
	static now() { return clock.t }
}

export function makeSandbox(opts = {}) {
	const calls = []
	const record = (name) => (...args) => { calls.push([name, ...args]) }

	const ctxProxy = new Proxy({
		fillRect: record('fillRect'),
		strokeRect: record('strokeRect'),
		fillText: record('fillText'),
		canvas: null,
		measureText: () => ({ width: 10 }),
		createRadialGradient: () => ({ addColorStop: noop }),
		createLinearGradient: () => ({ addColorStop: noop }),
	}, {
		get: (t, k) => (k in t ? t[k] : noop),
		set: (t, k, v) => { t[k] = v; return true },
	})

	const canvas = {
		width: 640, height: 480, clientLeft: 0, clientTop: 0, style: {},
		getContext: () => ctxProxy,
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 480 }),
	}
	canvas.canvas = canvas
	ctxProxy.canvas = canvas

	const listeners = {}
	const rafQueue = []
	const store = Object.assign({}, opts.storage)

	const sandbox = {
		console, Math, Date: FakeDate, JSON, Number, String, Object, Array, Error,
		parseInt, parseFloat, setTimeout, clearTimeout, isNaN,
		/* the bundle resolves asset URLs with new URL(..., import.meta.url) */
		URL, URLSearchParams,
		requestAnimationFrame: (fn) => rafQueue.push(fn),
		addEventListener: (n, fn) => { (listeners[n] = listeners[n] || []).push(fn) },
		removeEventListener: noop,
		navigator: opts.navigator || { getGamepads: () => [], maxTouchPoints: 0 },
		document: {
			getElementById: (id) => (id === 'canvas' ? canvas : null),
			location: { hash: opts.hash || '' },
			/* enough DOM for bundler injected preamble code */
			createElement: () => ({ relList: { supports: () => true } }),
			querySelectorAll: () => [],
		},
		MutationObserver: function () { this.observe = noop; this.disconnect = noop },
		localStorage: {
			getItem: (k) => (k in store ? store[k] : null),
			setItem: (k, v) => { store[k] = String(v) },
			removeItem: (k) => { delete store[k] },
		},
		XMLHttpRequest: function () {
			this.open = noop
			/* no sound files in the harness; GO.Sound stays silent */
			this.send = () => { throw new Error('offline') }
		},
		devicePixelRatio: 1,
		innerWidth: 1280,
		innerHeight: 960,
	}

	if (opts.touch) {
		sandbox.ontouchstart = null
	}

	/* CSS Font Loading API stub; omit opts.fonts to simulate a browser
	   without it */
	if (opts.fonts) {
		sandbox.document.fonts = opts.fonts
	}

	/* Web Audio + a working XHR, so the sound loader can be exercised */
	if (opts.audio) {
		sandbox.AudioContext = function () {
			this.state = 'running'
			this.destination = {}
			this.createGain = () => ({ gain: {}, connect: noop })
			this.createBufferSource = () => ({ connect: noop, start: noop })
			this.decodeAudioData = (buf, ok, fail) => {
				if (opts.undecodable && opts.undecodable(buf)) fail(new Error('bad'))
				else ok({ sample: true })
			}
			this.resume = noop
		}
	}

	if (opts.xhr) {
		sandbox.XMLHttpRequest = function () {
			const req = this
			this.open = (m, url) => { req.url = url }
			this.send = () => opts.xhr(req)
		}
	}

	sandbox.window = sandbox
	sandbox.globalThis = sandbox

	return { sandbox, listeners, rafQueue, store, canvas, calls }
}

/* load the ES module graph starting at entry, the same way the browser does */
export async function loadGame(sandbox, entry = entryEnv || 'game/Game.js') {
	vm.createContext(sandbox)

	const cache = new Map()

	/* vm walks the graph itself, so the linker only has to hand back one
	   instance per file */
	function fetch(file) {
		if (cache.has(file)) {
			return cache.get(file)
		}

		const mod = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), {
			context: sandbox,
			identifier: file,
			/* vite resolves import.meta.glob at build time; stand in for
			   it so the sources run unbundled here too */
			initializeImportMeta(meta) {
				meta.url = pathToFileURL(file).href
				meta.glob = (pattern) => {
					const dir = path.resolve(path.dirname(file), path.dirname(pattern))
					const ext = path.extname(pattern)
					const out = {}
					for (const name of fs.readdirSync(dir).sort()) {
						if (path.extname(name) !== ext) continue
						out[path.dirname(pattern) + '/' + name] =
							'/' + path.relative(root, path.join(dir, name))
					}
					return out
				}
			},
		})

		cache.set(file, mod)

		return mod
	}

	const mod = fetch(path.join(root, entry))

	await mod.link((spec, referencing) =>
		fetch(path.resolve(path.dirname(referencing.identifier), spec)))

	await mod.evaluate()

	return cache
}

/* fire window load, which boots the game */
export function boot(listeners) {
	for (const fn of listeners['load'] || []) fn()
}

export function makeStep(rafQueue, sandbox) {
	return function step(n, onFrame) {
		for (let i = 0; i < n; i++) {
			const q = rafQueue.splice(0, rafQueue.length)
			if (!q.length) throw new Error('rAF loop stopped at frame ' + i)
			clock.t += 16
			for (const fn of q) fn()
			if (onFrame) onFrame()
		}
	}
}
