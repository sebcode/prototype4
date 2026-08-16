import { defineConfig } from 'vite'

/*
 * The game is plain ES modules, so vite needs no plugins - it is here for
 * two things only:
 *
 *  - dev: serve the source files with sane cache headers, no build step
 *  - build: one content hashed bundle plus hashed assets, so a deploy can
 *    never be picked up half old and half new
 */
export default defineConfig({
	/* relative URLs, so dist/ can be dropped into any subdirectory
	   (http://host/p4/) and not just a domain root */
	base: './',

	server: {
		/* listen on the LAN too, so phones and tablets can reach it */
		host: true,
		port: 8000,
		/* never let a stale module survive a reload while developing */
		headers: { 'Cache-Control': 'no-store' },
	},
	build: {
		outDir: 'dist',
		/* one chunk, no dynamic imports, so there is nothing to preload
		   and the polyfill would be dead weight */
		modulePreload: { polyfill: false },
		emptyOutDir: true,
		assetsInlineLimit: 0,
		rollupOptions: {
			output: {
				entryFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[hash][extname]',
			},
		},
	},
})
