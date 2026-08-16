/* touch: tap in menus, relative drag to steer in the game */
import { makeSandbox, loadGame, boot, makeStep } from './harness.mjs'

const { sandbox, listeners, rafQueue } = makeSandbox({ touch: true })
await loadGame(sandbox)
boot(listeners)

const GO = sandbox.GO
const P4 = sandbox.P4
const step = makeStep(rafQueue, sandbox)

function fire(name, ev) {
	for (const fn of listeners[name] || []) fn(ev)
}

/* listeners receive CSS pixels, so scale logical coords up */
const pt = (x, y, id = 0) => ({
	identifier: id,
	clientX: x * GO.Screen.scale,
	clientY: y * GO.Screen.scale,
})
const ev = (list) => ({
	touches: list, changedTouches: list, cancelable: true,
	preventDefault: () => {},
})

const down = (x, y, id) => fire('touchstart', ev([pt(x, y, id)]))
const moveTo = (x, y, id) => fire('touchmove', ev([pt(x, y, id)]))
const up = (x, y, id) => fire('touchend', ev([pt(x, y, id)]))

const ship = () => GO.scenes.game.player
const target = () => ({ x: GO.Event.Mouse.x, y: GO.Event.Mouse.y })

console.log('--- menus still tap absolutely ---')
step(200)
down(320, 275)
step(1)
console.log('pointer follows finger in menu:',
	Math.round(GO.Event.Mouse.x), Math.round(GO.Event.Mouse.y))
up(320, 275)
step(1)
console.log('tap selected:', GO.scene.items.join(', '))

down(320, 275); up(320, 275)
step(300)
console.log('in game:', GO.scene === GO.scenes.game, '| dragToSteer:', GO.scene.dragToSteer)

console.log('\n--- steering is relative ---')
GO.godMode = true
GO.Event.Mouse.x = 320
GO.Event.Mouse.y = 300
step(120)
const before = { x: ship().x, y: ship().y }
console.log('ship settled at', Math.round(before.x), Math.round(before.y))

/* press far away from the ship: nothing may move */
down(80, 440)
step(30)
console.log('press at (80,440) -> ship moved:',
	Math.round(Math.abs(ship().x - before.x) + Math.abs(ship().y - before.y)), 'px (must be ~0)')

/* now swipe right and up by 100x50 screen px */
const t0 = target()
moveTo(180, 390)
step(1)
const t1 = target()
console.log('swipe +100/-50 moved target by',
	Math.round(t1.x - t0.x), Math.round(t1.y - t0.y),
	'(sensitivity ' + GO.Event.Touch.sensitivity + ' -> expected 150/-75)')

step(150)
console.log('ship followed to', Math.round(ship().x), Math.round(ship().y))

/* lifting and pressing somewhere else must not teleport the ship */
up(180, 390)
const kept = { x: ship().x, y: ship().y }
down(600, 100)
step(30)
console.log('re-press at (600,100) -> ship moved:',
	Math.round(Math.abs(ship().x - kept.x) + Math.abs(ship().y - kept.y)), 'px (must be ~0)')

/* a second finger must not hijack the drag */
down(50, 50, 9)
moveTo(50, 50, 9)
step(5)
const held = target()
moveTo(650, 100, 0)
step(1)
console.log('second finger ignored, first still steers:',
	Math.round(target().x - held.x) !== 0)
up(650, 100, 0)

/* the target stays on screen no matter how far you drag */
down(300, 300)
for (let i = 0; i < 40; i++) { moveTo(300 - i * 40, 300 - i * 40); step(1) }
console.log('clamped to screen:', target().x === 0 && target().y === 0)
up(300, 300)

console.log('\nOK')
