/*
 * Sample name -> URL.
 *
 * The engine fetches samples by name at runtime, which no bundler can
 * follow, so the mapping is built here where it can: the glob is resolved
 * at build time and yields content hashed URLs, which is what lets the
 * audio be cached forever and still be replaced atomically.
 *
 * The .wav files next to them are the masters, see "make sounds".
 *
 * This is the one spot in the game that knows a bundler exists.
 */
const files = import.meta.glob('../sounds/*.mp3', {
	eager: true,
	query: '?url',
	import: 'default',
})

export const soundUrls = { }

for (const path in files) {
	soundUrls[path.replace(/^.*\//, '').replace(/\.mp3$/, '')] = files[path]
}
