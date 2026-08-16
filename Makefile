# SkyRoads intro — reverse-engineering + WebGL reproduction
#
# Targets:
#   make assets   extract the real intro graphics from skyroads/INTRO.LZS -> web/assets/
#   make serve    start a local dev web server for the WebGL intro (http://localhost:8000)
#   make dev      assets + serve
#   make test     replay DEMO.REC against the game physics (no browser)
#   make trace    same, but print every physics tick
#   make clean    remove generated assets

PORT ?= 8000
PY   ?= python3
WEB  := web

.PHONY: serve
serve:
	@echo "Serving $(WEB)/ at http://localhost:$(PORT)  (Ctrl-C to stop)"
	$(PY) -m http.server $(PORT)
