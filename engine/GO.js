
export const GO = function() { }

GO.Screen = { }

GO.config = {}
GO.config.fontName = 'sans'

/* how long to wait for the webfont before starting anyway, in ms */
GO.config.fontTimeout = 3000

/*
 * Wait for the configured webfont, then run done().
 *
 * A canvas draws its text once: fillText silently falls back to a system
 * font while the webfont is still loading, and nothing redraws when it
 * finally arrives, so the title screen would keep the wrong typeface for
 * as long as it is on screen. The wait is capped, because a missing or
 * slow font file must not stop the game from starting - it just looks
 * different.
 */
GO.waitForFont = function(done)
{
	var family = this.config.fontName

	if (!family || !document.fonts || !document.fonts.load) {
		done()
		return
	}

	var called = false
		,timer
		,finish = function() {
			if (called) {
				return
			}

			called = true
			window.clearTimeout(timer)
			done()
		}

	timer = window.setTimeout(finish, this.config.fontTimeout)

	/* the size is irrelevant, but the shorthand needs one to parse */
	document.fonts.load('16px ' + family).then(finish, finish)
}

/*
 * Bring up the canvas and the audio context, preload the assets behind a
 * progress bar, then start the game. Everything the loader waits for is
 * optional in the sense that a failure only costs that one asset.
 */
GO.boot = function()
{
	if (!this.initCanvas()) {
		return false
	}

	this.Sound.init()

	var self = this
		,tasks = [ function(done) { self.waitForFont(done) } ]
			.concat(this.Sound.loadTasks())

	this.Loader.run(tasks, function() {
		self.start()
	})
}

GO.initCanvas = function()
{
	this.canvas = document.getElementById('canvas')
	if (!this.canvas || (this.canvas && !this.canvas.getContext)) {
		return false
	}

	this.Screen.width = this.canvas.width
	this.Screen.height = this.canvas.height
	this.Screen.scale = 1

	this.ctx = this.canvas.getContext('2d')

	this.resize()
	addEventListener('resize', function() {
		GO.resize()
	}, true)

	return true
}

GO.start = function()
{
	this.Event.init()

	this.entityCount = 0
	this.speed = 1
	this.delta = 0
	this.counter = 0
	this.seconds = 0
	this.tick = 0
	this.tickn = 0
	this.frameCounter = 0
	this.fps = 0
	this.fpsCounter = 0
	this.fpsLastSec = 0

	this.msg = ''
	this.messages = new GO.LinkedList

	this.scenes = { }
	this.scene = false
	this.handlers = new GO.LinkedList

	/* the canvas and the audio context are already up, GO.boot needed
	   them to draw the loading bar and to decode the samples */
	if (!this.ctx && !this.initCanvas()) {
		return false
	}

	requestAnimationFrame(function() {
		GO.loop()
	})

	if (this.init) {
		this.init.call(this)
	}
}

/*
 * Fit the canvas to the browser window, keeping the aspect ratio of the
 * logical resolution (GO.Screen.width x GO.Screen.height). The backing
 * store is sized in device pixels for sharp rendering on high-DPI
 * displays; a base transform maps logical coordinates onto it, so all
 * game code keeps drawing in logical coordinates.
 */
GO.resize = function()
{
	var availWidth = window.innerWidth - 2
	var availHeight = window.innerHeight - 2

	var scale = Math.min(availWidth / this.Screen.width,
		availHeight / this.Screen.height)

	var displayWidth = Math.floor(this.Screen.width * scale)
	var displayHeight = Math.floor(this.Screen.height * scale)
	var dpr = window.devicePixelRatio || 1

	this.canvas.style.width = displayWidth + 'px'
	this.canvas.style.height = displayHeight + 'px'
	this.canvas.width = Math.round(displayWidth * dpr)
	this.canvas.height = Math.round(displayHeight * dpr)

	this.Screen.scale = displayWidth / this.Screen.width

	this.ctx.setTransform(this.canvas.width / this.Screen.width, 0, 0,
		this.canvas.height / this.Screen.height, 0, 0)
	this.ctx.mozImageSmoothingEnabled = false
}

GO.setScene = function(scene)
{
	if (this.scene.deactivate) {
		this.scene.deactivate.call(this.scene)
	}

	this.scene = scene
	
	if (this.scene.activate) {
		this.scene.activate.call(this.scene)
	}
}

GO.loop = function()
{
	requestAnimationFrame(function() {
		GO.loop()
	})

	var date = new Date
	this.now = date.getTime()

	if (this.pause) {
		this.oldtime = this.now
		return
	}

	if (this.oldtime) {
		this.delta = ((this.now - this.oldtime) / 1000) * this.speed

		/* cap the delta so the game does not jump ahead after the
		   tab was inactive (rAF stops firing in background tabs) */
		if (this.delta > 0.1) {
			this.delta = 0.1
		}
	}
	this.oldtime = this.now

	this.counter += this.delta
	this.seconds = Math.round(this.counter)
	this.frameCounter++

	this.fpsCounter++
	if (this.fpsLastSec != this.seconds) {
		this.fps = this.fpsCounter * this.speed
		this.fpsCounter = 0
		this.fpsLastSec = this.seconds
	}

	this.tickn += this.delta
	if (this.tickn > 60 / 1000) {
		this.tick++
		this.tickn = 0
	}

	this.Event.poll()

	if (this.handlers.count) {
		this.handlers.foreach(function(handler) {
			return handler.process.call(handler)
		}, this)
	}

	if (this.scene) {
		this.scene.process.call(this.scene)
	}

	if (this.msg) {
		/* the alignment has to be set explicitly, the canvas keeps
		   whatever the scene (or showFPS) left behind */
		this.ctx.fillStyle = 'white'
		this.ctx.font = '12px ' + this.config.fontName
		this.ctx.textAlign = 'left'
		this.ctx.textBaseline = 'alphabetic'
		this.ctx.fillText(this.msg, 20, this.Screen.height - 20)
	}

	this.showFPS()

	this.Event.frameReset()
}

GO.showFPS = function()
{
	if (!this.config.showFPS) {
		return
	}

	this.ctx.fillStyle = '#666'
	this.ctx.font = '8px ' + this.config.fontName
	this.ctx.textAlign = 'end'
	this.ctx.textBaseline = 'top'
	this.ctx.fillText(this.fps + ' fps', GO.Screen.width - 5, 5)
}

GO.showMsg = function(msg)
{
	if (!this.msg) {
		this.msg = msg
	} else {
		this.messages.push({ msg: msg })
	}

	if (this.messageTimer) {
		return
	}

	this.messageTimer = new GO.Timer(1000, function() {
		if (!GO.messages.count) {
			GO.msg = ''
			GO.messageTimer = false
			return false
		}

		var mobj = GO.messages.first
		GO.msg = mobj.msg
		GO.messages.del(mobj)
	}, this)
	
	this.handlers.push(this.messageTimer)
}

