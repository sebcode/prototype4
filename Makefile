# prototype4
#
#   make serve       dev server, serves the sources unbundled (no build step)
#   make dist        production build into dist/
#   make serve-dist  serve the production build, to check it before deploying
#   make check       run the test suite against the sources
#   make check-dist  run the same suite against the built bundle
#   make clean       remove dist/
#
# The game needs to be served over http rather than opened as a file:// URL:
# it is ES modules, and the browser refuses to load the samples otherwise.

PORT ?= 8000
NODE := node --experimental-vm-modules

.PHONY: serve dist serve-dist check check-dist clean install sounds

node_modules:
	npm install

install: node_modules

# No watcher needed: the browser loads the source modules directly, so a
# reload is the rebuild. Cache-Control: no-store keeps a stale module from
# surviving that reload (see vite.config.js).
#
# --host binds to the LAN as well, so a phone on the same wifi can open the
# address vite prints as "Network" and test touch input on real hardware.
serve: node_modules
	npx vite --host --port $(PORT)

dist: node_modules
	npx vite build

# The .wav files are the masters; the game loads the .mp3 next to them.
# MP3 because it is the one lossy format every current browser decodes
# without leaning on an OS codec - notably firefox, which has no AAC
# decoder of its own. Both are committed, so running the game needs no
# ffmpeg; this target is only for re-encoding after changing a sound.
sounds:
	@for f in sounds/*.wav; do \
		echo "  $$f"; \
		ffmpeg -v error -y -i "$$f" -c:a libmp3lame -q:a 4 "$${f%.wav}.mp3"; \
	done

serve-dist: dist
	npx vite preview --host --port $(PORT)

check: node_modules
	$(NODE) test/run.mjs

check-dist: dist
	$(NODE) test/run.mjs --dist

clean:
	rm -rf dist
