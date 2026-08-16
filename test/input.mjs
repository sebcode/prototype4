import { makeSandbox, loadGame, boot, makeStep, noop } from './harness.mjs'

const mode = process.argv[2]

/* a virtual gamepad the test drives directly */
const pad = {
	connected: true,
	axes: [0, 0, 0, 0],
	buttons: Array.from({ length: 17 }, () => ({ pressed: false })),
}

const storage = mode === 'continue' || mode === 'gamepad'
	? { 'p4.GameState': JSON.stringify({ level: 7, score: 4200, lives: 2, highscore: { 2: 9999 } }) }
	: {}

const { sandbox, listeners, rafQueue } = makeSandbox({
	storage,
	touch: true,
	navigator: { getGamepads: () => [pad], maxTouchPoints: 5 },
})

await loadGame(sandbox)
boot(listeners)

const GO = sandbox.GO
const P4 = sandbox.P4
const step = makeStep(rafQueue, sandbox)

function fire(name, ev) {
	for (const fn of listeners[name] || []) fn(ev)
}

console.log(`--- ${mode} ---`)

if (mode === 'continue') {
	step(200)
	console.log('menu items:', GO.scene.items.join(', '))
	console.log('highscore in state:', JSON.stringify(P4.GameState.data.highscore))

	/* hover "hard" would show its highscore in the footer; check the lookup */
	console.log('DiffFromText(hard) =', P4.DiffFromText('hard'),
		'-> highscore', P4.GameState.data.highscore[P4.DiffFromText('hard')])

	GO.Event.Mouse.x = 320
	GO.Event.Mouse.y = 480 / 2 + 25 + 10 /* first item = continue */
	GO.Event.Mouse.click = true
	step(1)
	step(200)
	console.log('scene is game:', GO.scene === GO.scenes.game)
	console.log('resumed at:', GO.scenes.game.level.levelText,
		'score:', GO.scenes.game.player.score,
		'lives:', GO.scenes.game.player.lives)
}

if (mode === 'gamepad') {
	/* seed a savegame so the intro has two items to step between */
	step(200)
	console.log('menu:', GO.scene.items.join(', '))

	const stick = (v) => { pad.axes[1] = v }
	const sel = () => GO.Event.Menu.index
	const hovered = () => {
		/* which item does the pointer actually sit on, per the scene's
		   own hit test */
		const h = GO.scene.itemHeight
		const i = Math.floor((GO.Event.Mouse.y - (480 / 2 + 25)) / h)
		return GO.scene.items[i] !== undefined ? GO.scene.items[i] : '(none)'
	}

	/* nothing highlighted before the pad is touched */
	console.log('before input, hovered:', hovered())

	stick(1); step(1)
	console.log('down 1 ->', sel(), hovered())
	step(3) /* still held, must not run away */
	console.log('still held ->', sel(), hovered())

	stick(0); step(1)
	stick(1); step(1)
	console.log('down again ->', sel(), hovered())

	stick(-1); step(1)
	console.log('up ->', sel(), hovered())

	/* wrap around the top */
	stick(0); step(1)
	stick(-1); step(1)
	console.log('up past top wraps ->', sel(), hovered())
	stick(0); step(1)

	/* auto repeat after holding */
	stick(1); step(1)
	const atRepeatStart = sel()
	step(60) /* ~1s */
	console.log('held ~1s stepped', sel() !== atRepeatStart ? 'yes' : 'no', '-> index', sel())
	stick(0); step(1)

	/* select "new game" then verify the submenu is navigable */
	while (hovered() !== 'new game') { stick(0); step(1); stick(1); step(1) }
	pad.buttons[0].pressed = true; step(1); pad.buttons[0].pressed = false
	step(2)
	console.log('submenu:', GO.scene.items.join(', '), '| hovered:', hovered())

	stick(0); step(1); stick(1); step(1)
	stick(0); step(1); stick(1); step(1)
	console.log('two downs ->', hovered())

	pad.buttons[0].pressed = true; step(1); pad.buttons[0].pressed = false
	step(300)
	console.log('scene is game:', GO.scene === GO.scenes.game,
		'| diff:', GO.scenes.game && P4.FormatDiff(GO.scenes.game.player.diff))

	/* in game the stick must move the ship freely again, not snap */
	GO.godMode = true
	stick(0); step(1)
	GO.Event.Mouse.x = 320; GO.Event.Mouse.y = 240
	stick(1); step(10)
	const y1 = GO.Event.Mouse.y
	stick(-1); step(5)
	console.log('free cursor in game: down', Math.round(y1 - 240),
		'px then up', Math.round(y1 - GO.Event.Mouse.y), 'px')
	stick(0)

	/* start opens the in-game menu, which must also be navigable */
	pad.buttons[9].pressed = true; step(1); pad.buttons[9].pressed = false
	step(2)
	console.log('in-game menu open:', GO.scene === GO.scenes.menu, '| sel:', GO.scene.sel)
	stick(0); step(1); stick(1); step(1); step(1)
	console.log('after down, sel:', GO.scene.sel, 'of', GO.scene.items.length,
		'->', GO.scene.items[GO.scene.sel - 1] && GO.scene.items[GO.scene.sel - 1].label)
	stick(0); step(1); stick(1); step(1); step(1)
	console.log('after down, sel:', GO.scene.sel,
		'->', GO.scene.items[GO.scene.sel - 1] && GO.scene.items[GO.scene.sel - 1].label)
}

if (mode === 'touch') {
	step(200)
	/* the listeners get CSS pixels, so scale logical coords up */
	const touch = (x, y) => {
		const c = { clientX: x * GO.Screen.scale, clientY: y * GO.Screen.scale }
		return { touches: [c], changedTouches: [c], cancelable: true, preventDefault: noop }
	}

	fire('touchstart', touch(320, 480 / 2 + 25 + 10))
	step(1)
	console.log('touch set pointer:', Math.round(GO.Event.Mouse.x), Math.round(GO.Event.Mouse.y),
		'active:', GO.Event.Touch.active)

	fire('touchend', touch(320, 480 / 2 + 25 + 10))
	step(1)
	console.log('tap opened difficulty menu:', GO.scene.items.join(', '))

	fire('touchstart', touch(320, 480 / 2 + 25 + 10))
	fire('touchend', touch(320, 480 / 2 + 25 + 10))
	step(300)
	console.log('scene is game:', GO.scene === GO.scenes.game)

	/* drag: the ship must settle above the finger, not under it */
	GO.godMode = true
	fire('touchstart', touch(300, 400))
	for (let i = 0; i < 400; i++) { fire('touchmove', touch(300, 400)); step(1) }
	const p = GO.scenes.game.player
	console.log('finger y=400, ship y=' + Math.round(p.y),
		'offset applied:', Math.round(400 - p.y) === GO.Event.Touch.offsetY)
}

if (mode === 'skip') {
	GO.debug = true
	step(200)
	GO.Event.Mouse.x = 320
	GO.Event.Mouse.y = 480 / 2 + 25 + 10
	GO.Event.Mouse.click = true
	step(1)
	GO.Event.Mouse.y = 480 / 2 + 25 + 10
	GO.Event.Mouse.click = true
	step(1)
	step(400)
	console.log('start level:', GO.scenes.game.level.levelText)

	for (let i = 0; i < 5; i++) {
		fire('keypress', { keyCode: '0'.charCodeAt(0) })
		step(1)
		step(60)
	}
	console.log('after 5 skips:', GO.scenes.game.level.levelText, '|', GO.msg)
}

console.log('OK')
