prototype4

This is a HTML5 canvas game written in JavaScript. 
Use a modern browser like Chrome, Safari or Firefox for smooth graphics.
    
Play the game online: http://baunz.net/p4/
    
Instructions: move the spaceship to steer it. The ship fires automatically.
Avoid being hit by the enemies. Collect powerups to restore your energy and to
improve your weapon. Pick one of four difficulty levels in the main menu; your
progress and the highscore per difficulty are stored in the browser, so you can
"continue" a run later. There are 20 levels with a boss fight in level 10 and
two bosses in level 20.

Controls:
  mouse     move the pointer to steer, click to pick a menu item
  keyboard  cursor keys or WASD steer; in menus cursor keys move the
            selection and enter picks it
  touch     press anywhere and swipe to steer - the ship follows the
            movement of your thumb instead of jumping to it; tap to pick a
            menu item
  gamepad   left stick or d-pad steers and moves the menu selection,
            A picks, B or start opens the in-game menu
  ESC       in-game menu, and back out of the difficulty menu
  A         quick start from the title screen

On startup a progress bar shows while the font and the sound effects load.

The code is ES modules, and the sounds go through the Web Audio API, so the
game has to be served over http rather than opened as a file:// URL:

  make serve       dev server on http://localhost:8000/
  make dist        production build into dist/
  make serve-dist  serve that build, to look at it before deploying
  make check       run the test suite against the sources
  make check-dist  run the same suite against the built bundle
  make clean       remove dist/

Development needs no build step and no watcher: the dev server hands the
source modules to the browser as they are, so a reload is the rebuild. It
sends Cache-Control: no-store, otherwise a browser can keep one module from
before an edit and mix it with the new ones, which produces very confusing
half broken states.

The production build is one content hashed bundle plus hashed assets. That
is not about size - the JS is 24 kB gzipped next to 1.3 MB of samples - but
about replacing a deploy atomically: with 34 separately cached files a
browser can end up with a mix of old and new ones, with a single hashed
bundle it cannot. index.html is the only unhashed file and must be served
with a short cache lifetime, or it keeps pointing at the old bundle.

Layout: index.html loads game/Game.js, which pulls in the rest through
imports; there is no hand sorted script list to keep in order. engine/ is the
generic game engine, all of it hanging off the GO namespace and assembled by
engine/engine.js. game/ is this game, hanging off P4. Game.js also puts GO and
P4 on window so you can poke at them from the browser console - note that this
means a module which forgets to import GO still appears to work.

game/sounds.js is the one file that knows a bundler exists: the engine fetches
samples by name at runtime, which a bundler cannot follow, so that file globs
the sounds directory to build a name -> URL map and hands it to GO.Sound. That
is what gets the samples content hashed too.

The game loads sounds/*.mp3; the .wav files next to them are the masters and
are not shipped. MP3 because it is the one lossy format every current browser
decodes on its own - firefox has no AAC decoder and falls back to the OS one,
which is not there on every linux box, and safari is unreliable with ogg
opus. It cuts the audio from 1.2 MB to 175 kB. "make sounds" re-encodes the
masters; the game itself needs no ffmpeg, both formats are committed.

Debug mode: append #d to the URL. Options are comma separated, for example
#d,godmode,level=10,diff=3. In debug mode: 0 skips to the next level, 7 and 8
toggle fast and slow motion, 9 toggles god mode, = pauses (any key resumes).

Programmed by Sebastian Volland.
http://baunz.net/

The Atari font is from:
http://members.bitstream.net/marksim/atarimac/fonts.html

The sound effects were created with cfxr:
http://thirdcog.eu/apps/cfxr
