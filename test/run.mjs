/*
 * Runs every test file. With --dist it points them at the built bundle
 * instead of the sources, which is how we check that minifying and
 * bundling did not change the game's behaviour.
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const dist = process.argv.includes('--dist')

const suites = [
	['smoke'], ['smoke', '#d,godmode,level=10', '20000'],
	['smoke', '#d,godmode,level=20', '20000'],
	['input', 'continue'], ['input', 'gamepad'], ['input', 'skip'],
	['keyboard'], ['touch'], ['loader'], ['font'], ['endpaths'], ['mobile'],
	['deploy'],
]

const env = { ...process.env }

if (dist) {
	const assets = path.join(root, 'dist', 'assets')

	if (!fs.existsSync(assets)) {
		console.error('no build to test, run "make dist" first')
		process.exit(1)
	}

	const bundle = fs.readdirSync(assets).find(f => f.endsWith('.js'))

	if (!bundle) {
		console.error('no bundle in dist/assets')
		process.exit(1)
	}

	env.P4_ENTRY = path.join('dist', 'assets', bundle)
	console.log('testing bundle: ' + env.P4_ENTRY + '\n')
} else {
	console.log('testing sources: game/Game.js\n')
}

let failed = 0

for (const [name, ...args] of suites) {
	const label = [name, ...args].join(' ')

	try {
		const out = execFileSync(process.execPath,
			['--experimental-vm-modules', path.join(here, name + '.mjs'), ...args],
			{ env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

		if (/\bOK\b/.test(out)) {
			console.log('  pass  ' + label)
		} else {
			console.log('  FAIL  ' + label + ' (no OK marker)')
			console.log(out.replace(/^/gm, '        '))
			failed += 1
		}
	} catch (e) {
		console.log('  FAIL  ' + label)
		console.log(String(e.stdout || '').replace(/^/gm, '        '))
		console.log(String(e.stderr || '').replace(/^/gm, '        '))
		failed += 1
	}
}

console.log('\n' + (failed ? failed + ' suite(s) failed' : 'all ' + suites.length + ' suites passed'))
process.exit(failed ? 1 : 0)
