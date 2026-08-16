/* menus via cursor keys + enter, ship via cursor keys / WASD */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

const { sandbox, listeners, rafQueue } = makeSandbox({
	storage: { 'p4.GameState': JSON.stringify({ level: 7, score: 4200, lives: 2 }) },
})
await loadGame(sandbox)
boot(listeners)

const GO = sandbox.GO
const P4 = sandbox.P4
const step = makeStep(rafQueue, sandbox)

const fire = (n, ev) => { for (const fn of listeners[n] || []) fn(ev) }
const key = (code, repeat = false) =>
	fire('keydown', { keyCode: code, repeat, cancelable: true, preventDefault() {} })
const keyUp = (code) => fire('keyup', { keyCode: code })
const tap = (code) => { key(code); step(1); keyUp(code) }

const UP = 38, DOWN = 40, ENTER = 13, ESC = 27, W = 87, A = 65, S = 83, D = 68

const hovered = () => {
	const i = GO.Event.Menu.index
	return GO.Event.Menu.snapped && GO.scene.items ? GO.scene.items[i] : '(none)'
}

console.log('--- menu by keyboard ---')
step(200)
console.log('items:', GO.scene.items.join(', '))
console.log('nothing highlighted yet:', hovered())

tap(DOWN)
console.log('first DOWN highlights (no skip):', hovered())
tap(DOWN)
console.log('DOWN:', hovered())
tap(DOWN)
console.log('DOWN wraps:', hovered())
tap(UP)
console.log('UP wraps back:', hovered())

/* held key must not run through the list */
key(DOWN); step(1)
const before = GO.Event.Menu.index
for (let i = 0; i < 30; i++) { key(DOWN, true); step(1) }
keyUp(DOWN)
console.log('held DOWN stepped:', GO.Event.Menu.index - before, 'item(s) (must be 0)')

while (hovered() !== 'new game') tap(DOWN)
tap(ENTER)
step(2)
console.log('ENTER opened submenu:', GO.scene.items.join(', '), '| on:', hovered())

tap(DOWN); tap(DOWN)
console.log('two DOWN ->', hovered())
tap(ENTER)
step(300)
console.log('started:', GO.scene === GO.scenes.game,
	'| diff:', P4.FormatDiff(GO.scenes.game.player.diff))

console.log('\n--- mouse and keyboard mixed ---')
GO.setScene(GO.scenes.intro)
GO.scene.locked = false
step(2)
/* hover the second item with the mouse, then press DOWN */
const p = GO.scene.menuItemPos(1)
fire('mousemove', { clientX: p.x * GO.Screen.scale, clientY: p.y * GO.Screen.scale })
step(1)
console.log('mouse hovers index:', GO.Event.Menu.index, '| snapped:', GO.Event.Menu.snapped)
tap(DOWN)
console.log('DOWN continues from there ->', hovered(), '(index ' + GO.Event.Menu.index + ')')

console.log('\n--- steering the ship ---')
GO.setScene(GO.scenes.game)
GO.godMode = true
GO.Event.Mouse.x = 320
GO.Event.Mouse.y = 300
step(120)
const start = { x: GO.scenes.game.player.x, y: GO.scenes.game.player.y }
console.log('ship at', Math.round(start.x), Math.round(start.y))

key(D); step(60); keyUp(D)
step(60)
const right = GO.scenes.game.player.x
console.log('D moved right:', Math.round(right - start.x), 'px')

key(W); step(60); keyUp(W)
step(60)
console.log('W moved up:', Math.round(start.y - GO.scenes.game.player.y), 'px')

/* arrows steer too, and diagonals are not faster */
GO.Event.Mouse.x = 320; GO.Event.Mouse.y = 240
key(39); step(30); keyUp(39)
const straight = GO.Event.Mouse.x - 320
GO.Event.Mouse.x = 320; GO.Event.Mouse.y = 240
key(39); key(40); step(30); keyUp(39); keyUp(40)
const diag = GO.Event.Mouse.x - 320
console.log('arrow right:', Math.round(straight), 'px | diagonal x:', Math.round(diag),
	'px (must be smaller)')

/* keys held when the window loses focus must not stick */
key(A)
fire('blur', {})
step(30)
console.log('stuck key after blur:', Object.keys(GO.Event.Keyboard.down).length === 0 ? 'none' : 'STUCK')

console.log('\nOK')
