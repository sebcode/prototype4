/*
 * The build must survive being dropped into a subdirectory, not just a
 * domain root. Resolves every URL the page and the bundle reference the
 * way a browser would - html refs against the document, bundle assets
 * against the module - and checks the file is actually there.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

if (!fs.existsSync(path.join(dist, 'index.html'))) {
	console.log('no build to check, skipping')
	console.log('OK')
	process.exit(0)
}

/* pretend the build was deployed here */
const base = 'https://example.test/some/sub/p4/'
const local = (url) => path.join(dist, new URL(url).pathname.replace('/some/sub/p4/', ''))

const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"|url\(['"]?([^'")]+)['"]?\)/g)]
	.map(m => m[1] || m[2])

let missing = 0
let checked = 0

function check(url, what) {
	checked += 1

	if (!fs.existsSync(local(url))) {
		console.log('  MISSING (' + what + ') ' + url)
		missing += 1
	}
}

for (const r of refs) {
	if (/^(https?:)?\/\//.test(r)) continue
	if (r.startsWith('/')) {
		console.log('  ABSOLUTE path in index.html, breaks a subdirectory deploy: ' + r)
		missing += 1
		continue
	}

	check(new URL(r, base).href, 'html')
}

const jsRef = refs.find(r => r.endsWith('.js'))
const jsUrl = new URL(jsRef, base).href
const js = fs.readFileSync(local(jsUrl), 'utf8')

/* assets the bundle fetches resolve against the module's own URL */
const assets = [...js.matchAll(/new URL\([`"']([^`"']+)[`"']\s*,\s*import\.meta\.url\)/g)]
	.map(m => m[1])

for (const a of assets) {
	if (a.startsWith('/')) {
		console.log('  ABSOLUTE asset URL in bundle, breaks a subdirectory deploy: ' + a)
		missing += 1
		continue
	}

	check(new URL(a, jsUrl).href, 'bundle')
}

console.log('html refs: ' + refs.length + ' | bundle assets: ' + assets.length)

if (!assets.length) {
	console.log('  no bundle assets found - the sound URL map should be in there')
	missing += 1
}

if (missing) {
	console.log(missing + ' reference(s) would 404 in a subdirectory')
	process.exit(1)
}

console.log('all ' + checked + ' references resolve under ' + base)
console.log('OK')
