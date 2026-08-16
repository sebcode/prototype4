import { GO } from './GO.js'

GO.Event = { }
GO.Event.Mouse = { }
GO.Event.Keyboard = { }
GO.Event.Touch = { }
GO.Event.Gamepad = { }

GO.Event.init = function()
{
	this.Mouse.x = -1
	this.Mouse.y = -1
	this.Mouse.leftDown = false

	this.frameReset()

	addEventListener('mousemove', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.setPointer(e.clientX, e.clientY)
	}, true)

	addEventListener('click', function(e) {
		if (!GO.pause) {
			GO.Event.pointerClick()
		}
	}, true)

	addEventListener('mousedown', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Mouse.leftDown = true
	}, true)

	addEventListener('mouseup', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Mouse.leftDown = false
	}, true)

	addEventListener('keypress', function(e) {
		if (GO.pause) {
			/* any key resumes from a debug pause */
			GO.pause = false
			GO.oldtime = 0
			return
		}

		GO.Event.Keyboard.code = e.keyCode || e.charCode || 0
		GO.Event.Keyboard.chr = String.fromCharCode(GO.Event.Keyboard.code)
		GO.Event.Keyboard.chrLower = GO.Event.Keyboard.chr.toLowerCase()
	}, true)

	addEventListener('keydown', function(e) {
		if (GO.pause) {
			return
		}

		var c = e.keyCode || e.charCode || 0

		GO.Event.Keyboard.down[c] = true

		if (GO.Event.Keyboard.isSteering(c) && e.cancelable) {
			e.preventDefault()
		}

		if (c == 27) {
			GO.Event.Keyboard.setCode(c)
			return
		}

		/* holding a key must not run through a menu */
		if (e.repeat) {
			return
		}

		if (GO.Event.Keyboard.menuKey(c)) {
			if (e.cancelable) {
				e.preventDefault()
			}

			return
		}

		/* enter outside a menu, for scenes that just want to move on */
		if (c == 13) {
			GO.Event.Keyboard.setCode(c)
		}
	}, true)

	addEventListener('keyup', function(e) {
		delete GO.Event.Keyboard.down[e.keyCode || e.charCode || 0]
	}, true)

	/* a key held while the window loses focus would stay down forever */
	addEventListener('blur', function() {
		GO.Event.Keyboard.down = { }
	}, true)

	this.Touch.init()
	this.Gamepad.init()
}

/* map CSS pixels to logical game coordinates */
GO.Event.setPointer = function(clientX, clientY)
{
	var rect = GO.canvas.getBoundingClientRect()

	this.Mouse.x = (clientX - rect.left - GO.canvas.clientLeft) / GO.Screen.scale
	this.Mouse.y = (clientY - rect.top - GO.canvas.clientTop) / GO.Screen.scale

	this.Menu.pointerMoved()
}

/* move the pointer by a delta in logical units, kept on screen */
GO.Event.movePointer = function(dx, dy)
{
	/* nothing has positioned the pointer yet, start from the middle */
	if (this.Mouse.x < 0 || this.Mouse.y < 0) {
		this.Mouse.x = GO.Screen.width / 2
		this.Mouse.y = GO.Screen.height / 2
	}

	this.Mouse.x += dx
	this.Mouse.y += dy

	if (this.Mouse.x < 0) this.Mouse.x = 0
	if (this.Mouse.y < 0) this.Mouse.y = 0
	if (this.Mouse.x > GO.Screen.width) this.Mouse.x = GO.Screen.width
	if (this.Mouse.y > GO.Screen.height) this.Mouse.y = GO.Screen.height
}

/* register a click at the current pointer position, if it is on screen */
GO.Event.pointerClick = function()
{
	if (this.Mouse.x > 0
		&& this.Mouse.y > 0
		&& this.Mouse.x < GO.Screen.width
		&& this.Mouse.y < GO.Screen.height) {

		this.Mouse.click = true
	}
}

/* called once per frame, before the scene is processed */
GO.Event.poll = function()
{
	this.Menu.sync()

	if (!this.Menu.count()) {
		this.Keyboard.pollCursor()
	}

	this.Gamepad.poll()
}

GO.Event.frameReset = function()
{
	this.Mouse.frameReset()
	this.Keyboard.frameReset()
}

GO.Event.Mouse.frameReset = function()
{
	this.click = false
}

/* report a key to the scenes for this frame */
GO.Event.Keyboard.setCode = function(code)
{
	this.code = code
	this.chr = ''
	this.chrLower = ''
}

/* key codes currently held down */
GO.Event.Keyboard.down = { }

/* logical pixels per second the ship target moves */
GO.Event.Keyboard.speed = 500

GO.Event.Keyboard.isDown = function(code)
{
	return !!this.down[code]
}

/* cursor keys and WASD, the keys that steer or navigate */
GO.Event.Keyboard.isSteering = function(code)
{
	switch (code) {
		case 37: case 38: case 39: case 40: /* cursor keys */
		case 65: case 68: case 87: case 83: /* A D W S */
		case 32: /* space, would scroll the page */
			return true
	}

	return false
}

/*
 * Steer with the cursor keys or WASD, outside of menus. Like the gamepad
 * this moves the shared pointer, which the player then flies towards.
 */
GO.Event.Keyboard.pollCursor = function()
{
	var x = 0
		,y = 0

	if (this.isDown(37) || this.isDown(65)) x -= 1
	if (this.isDown(39) || this.isDown(68)) x += 1
	if (this.isDown(38) || this.isDown(87)) y -= 1
	if (this.isDown(40) || this.isDown(83)) y += 1

	if (!x && !y) {
		return
	}

	/* diagonals must not be faster than the straight directions */
	if (x && y) {
		x *= Math.SQRT1_2
		y *= Math.SQRT1_2
	}

	GO.Event.movePointer(x * this.speed * GO.delta, y * this.speed * GO.delta)
}

/*
 * Cursor keys and enter drive the menus. Returns true when the key was
 * used, so the caller can keep the browser from also acting on it.
 */
GO.Event.Keyboard.menuKey = function(code)
{
	var menu = GO.Event.Menu

	if (!menu.count()) {
		return false
	}

	switch (code) {
		case 38: /* up */
		case 37: /* left */
			return menu.move(-1)

		case 40: /* down */
		case 39: /* right */
			return menu.move(1)

		case 13: /* enter */
		case 32: /* space */
			return menu.select()
	}

	return false
}

GO.Event.Keyboard.frameReset = function()
{
	this.code = 0
	this.chr = ''
	this.chrLower = ''
}

/*
 * Menu navigation, shared by the keyboard and the gamepad.
 *
 * Scenes that are menus implement menuItemCount() and menuItemPos(i).
 * Moving the selection snaps the virtual pointer onto the item, so the
 * hover highlight, the select sound and the click handling all keep
 * working as if a mouse had been moved there - no scene has to know that
 * anything other than a mouse exists.
 */
GO.Event.Menu = { }

GO.Event.Menu.index = 0
GO.Event.Menu.scene = false
GO.Event.Menu.snapped = false

/* has a keyboard or pad taken the menu over from the pointer? */
GO.Event.Menu.active = false

/* forget the current selection, so the next menu starts at the top */
GO.Event.Menu.reset = function()
{
	this.index = 0
	this.snapped = false
}

/* number of items in the current scene, 0 when it is not a menu */
GO.Event.Menu.count = function()
{
	return GO.scene && GO.scene.menuItemCount ? GO.scene.menuItemCount() : 0
}

/* keep the selection in step with the scene; called once per frame */
GO.Event.Menu.sync = function()
{
	var count = this.count()

	if (!count) {
		this.scene = false
		return
	}

	if (this.scene !== GO.scene || this.index > count - 1) {
		this.scene = GO.scene
		this.reset()
	}

	/* highlight the first item on entering a menu, when the pointer is
	   not the thing steering. A scene may not have laid itself out yet,
	   so this is retried every frame until it takes. */
	if (this.active && !this.snapped) {
		this.snapped = this.snap()
	}
}

GO.Event.Menu.move = function(dir)
{
	var count = this.count()

	if (!count) {
		return false
	}

	this.active = true

	/* nothing highlighted yet: light the current item up rather than
	   stepping straight past it */
	if (!this.snapped) {
		this.snapped = this.snap()
		return true
	}

	this.index += dir

	if (this.index < 0) {
		this.index = count - 1
	} else if (this.index > count - 1) {
		this.index = 0
	}

	this.snapped = this.snap()

	return true
}

/*
 * The pointer moved: hand the menu back to it and adopt whatever it is
 * hovering, so a cursor key afterwards continues from there instead of
 * jumping back to a stale selection.
 */
GO.Event.Menu.pointerMoved = function()
{
	if (!this.count()) {
		return
	}

	var i = this.indexAt()

	this.active = false
	this.snapped = i >= 0

	if (i >= 0) {
		this.index = i
	}
}

/* vertical distance between two items, for hit testing */
GO.Event.Menu.spacing = function()
{
	var a, b

	if (this.count() > 1) {
		a = GO.scene.menuItemPos(0)
		b = GO.scene.menuItemPos(1)
	}

	return a && b ? Math.abs(b.y - a.y) : 40
}

/* the item the pointer sits on, -1 for none */
GO.Event.Menu.indexAt = function()
{
	var count = this.count()
		,half = this.spacing() / 2

	for (var i = 0; i < count; i += 1) {
		var pos = GO.scene.menuItemPos(i)

		if (pos && Math.abs(pos.y - GO.Event.Mouse.y) <= half) {
			return i
		}
	}

	return -1
}

/* activate the highlighted item, exactly as a click on it would */
GO.Event.Menu.select = function()
{
	if (!this.count() || !this.snapped) {
		return false
	}

	GO.Event.Mouse.click = true

	return true
}

/* put the virtual pointer onto the selected item */
GO.Event.Menu.snap = function()
{
	var pos = GO.scene.menuItemPos(this.index)

	if (!pos) {
		return false
	}

	GO.Event.Mouse.x = pos.x
	GO.Event.Mouse.y = pos.y

	return true
}

/*
 * Touch input.
 *
 * Menus are tapped, so there the touch drives the virtual pointer directly
 * and the existing hover and click handling works unchanged.
 *
 * Steering is relative instead: the ship does not jump to the finger, it
 * follows the movement of the drag from wherever it already is. That keeps
 * the thumb out of the playfield and lets you start a drag anywhere on the
 * screen. Scenes ask for it with dragToSteer.
 */
GO.Event.Touch.active = false

/* logical pixels the ship moves per screen pixel dragged */
GO.Event.Touch.sensitivity = 1.5

/* identifier of the touch we are following, null when there is none */
GO.Event.Touch.id = null

GO.Event.Touch.init = function()
{
	if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
		return
	}

	/* keep the browser from scrolling / zooming the page */
	var swallow = function(e) {
		if (e.cancelable) {
			e.preventDefault()
		}
	}

	addEventListener('touchstart', function(e) {
		GO.Event.Touch.begin(e.changedTouches[0])
		swallow(e)
	}, { passive: false, capture: true })

	addEventListener('touchmove', function(e) {
		GO.Event.Touch.move(GO.Event.Touch.find(e.touches))
		swallow(e)
	}, { passive: false, capture: true })

	addEventListener('touchend', function(e) {
		var t = GO.Event.Touch.find(e.changedTouches)

		if (t) {
			GO.Event.Touch.move(t)
		}

		/* release the drag once the screen is clear, even if we lost
		   track of the touch - otherwise every later press is ignored */
		if (t || !e.touches.length) {
			GO.Event.Touch.end()
		}

		if (t) {
			/* a tap counts as a click; the synthetic mouse click that
			   some browsers emit after is harmless, it just repeats it */
			GO.Event.pointerClick()
		}

		swallow(e)
	}, { passive: false, capture: true })

	addEventListener('touchcancel', function() {
		GO.Event.Touch.end()
	}, true)
}

/* does the current scene want relative steering rather than tapping? */
GO.Event.Touch.dragToSteer = function()
{
	return !!(GO.scene && GO.scene.dragToSteer)
}

GO.Event.Touch.begin = function(t)
{
	/* a second finger does not steal the drag */
	if (GO.pause || !t || this.id !== null) {
		return
	}

	this.active = true
	this.id = t.identifier
	this.lastX = t.clientX
	this.lastY = t.clientY

	GO.Event.Gamepad.active = false
	GO.Event.Mouse.leftDown = true

	/* a tap has to land where the finger is; only steering is relative */
	if (!this.dragToSteer()) {
		GO.Event.setPointer(t.clientX, t.clientY)
	}
}

GO.Event.Touch.move = function(t)
{
	if (GO.pause || !t) {
		return
	}

	if (this.dragToSteer()) {
		var s = this.sensitivity / GO.Screen.scale

		GO.Event.movePointer((t.clientX - this.lastX) * s,
			(t.clientY - this.lastY) * s)
	} else {
		GO.Event.setPointer(t.clientX, t.clientY)
	}

	this.lastX = t.clientX
	this.lastY = t.clientY
}

GO.Event.Touch.end = function()
{
	this.id = null
	GO.Event.Mouse.leftDown = false
}

/* the touch we are following, out of a TouchList */
GO.Event.Touch.find = function(list)
{
	if (this.id === null || !list) {
		return false
	}

	for (var i = 0; i < list.length; i += 1) {
		if (list[i].identifier === this.id) {
			return list[i]
		}
	}

	return false
}

/*
 * Gamepad input.
 *
 * Everything the pad does ends up in the same virtual pointer the mouse
 * writes to, so no scene needs to know where the input came from.
 *
 * During gameplay the stick moves that pointer freely. In a menu a free
 * pointer is awkward, so scenes that implement menuItemCount()/menuItemPos()
 * get discrete navigation instead: up and down step through the items and
 * the pointer is snapped onto the item, which makes the existing hover
 * highlight, the select sound and the click handling work unchanged.
 */
GO.Event.Gamepad.active = false
GO.Event.Gamepad.speed = 500 /* logical pixels per second */
GO.Event.Gamepad.deadzone = 0.25

/* menu navigation auto-repeat, in seconds */
GO.Event.Gamepad.repeatDelay = 0.4
GO.Event.Gamepad.repeatRate = 0.15

GO.Event.Gamepad.init = function()
{
	this.lastButtons = { }
	this.navDir = 0
	this.navTime = 0

	if (!navigator.getGamepads) {
		return
	}

	addEventListener('gamepadconnected', function() {
		GO.showMsg('gamepad connected')
	}, true)
}

GO.Event.Gamepad.get = function()
{
	if (!navigator.getGamepads) {
		return false
	}

	var pads = navigator.getGamepads()

	for (var i = 0; i < pads.length; i += 1) {
		if (pads[i] && pads[i].connected) {
			return pads[i]
		}
	}

	return false
}

GO.Event.Gamepad.axis = function(v)
{
	if (Math.abs(v) < this.deadzone) {
		return 0
	}

	/* rescale so the stick starts moving smoothly at the deadzone edge */
	return (v - (v > 0 ? this.deadzone : -this.deadzone)) / (1 - this.deadzone)
}

GO.Event.Gamepad.pressed = function(pad, index)
{
	var b = pad.buttons[index]

	if (!b) {
		return false
	}

	return typeof b == 'object' ? b.pressed : b == 1
}

/* true only on the frame the button goes down */
GO.Event.Gamepad.justPressed = function(pad, index)
{
	var down = this.pressed(pad, index)
		,was = this.lastButtons[index]

	this.lastButtons[index] = down

	return down && !was
}

GO.Event.Gamepad.poll = function()
{
	var pad = this.get()

	if (!pad) {
		return
	}

	var x = this.axis(pad.axes[0] || 0)
		,y = this.axis(pad.axes[1] || 0)

	/* d-pad, on the standard mapping */
	if (this.pressed(pad, 14)) x = -1
	if (this.pressed(pad, 15)) x = 1
	if (this.pressed(pad, 12)) y = -1
	if (this.pressed(pad, 13)) y = 1

	if (GO.Event.Menu.count()) {
		this.pollMenu(y)
	} else {
		this.navDir = 0
		this.pollCursor(x, y)
	}

	/* A / cross => select the highlighted item, or click */
	if (this.justPressed(pad, 0)) {
		GO.Event.Mouse.click = true
	}

	/* B / circle and start => escape (opens and closes the in-game menu) */
	if (this.justPressed(pad, 1) || this.justPressed(pad, 9)) {
		GO.Event.Keyboard.code = 27
		GO.Event.Keyboard.chr = ''
		GO.Event.Keyboard.chrLower = ''
	}
}

/* free pointer movement, used during gameplay */
GO.Event.Gamepad.pollCursor = function(x, y)
{
	if (!x && !y) {
		return
	}

	this.begin()

	GO.Event.movePointer(x * this.speed * GO.delta, y * this.speed * GO.delta)
}

/* discrete item selection, used in menus */
GO.Event.Gamepad.pollMenu = function(y)
{
	var dir = 0

	if (y > 0.5) dir = 1
	if (y < -0.5) dir = -1

	if (!dir) {
		this.navDir = 0
		return
	}

	if (dir != this.navDir) {
		/* stick or d-pad just moved: step immediately */
		this.navDir = dir
		this.navTime = -this.repeatDelay
	} else {
		this.navTime += GO.delta

		if (this.navTime < this.repeatRate) {
			return
		}

		this.navTime = 0
	}

	this.begin()

	GO.Event.Menu.move(dir)
}

/* the pad takes over from mouse or touch */
GO.Event.Gamepad.begin = function()
{
	if (this.active) {
		return
	}

	this.active = true
	GO.Event.Touch.active = false

	/* start from the middle instead of wherever the mouse was left */
	if (GO.Event.Mouse.x < 0 || GO.Event.Mouse.y < 0) {
		GO.Event.Mouse.x = GO.Screen.width / 2
		GO.Event.Mouse.y = GO.Screen.height / 2
	}
}

