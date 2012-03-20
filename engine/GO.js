
GO = function() { }

GO.Screen = { }

GO.config = {}
GO.config.fontName = 'sans'

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
	
	this.canvas = document.getElementById('canvas')
	if (!this.canvas || (this.canvas && !this.canvas.getContext)) {
		return false
	}

	this.Screen.width = this.canvas.width
	this.Screen.height = this.canvas.height
	
	this.ctx = this.canvas.getContext('2d')
	this.ctx.mozImageSmoothingEnabled = false
	
	this.timer = window.setInterval(function() {
		GO.loop()
	}, 1000 / 60)

	if (this.init) {
		this.init.call(this)
	}
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
	if (this.pause) {
		return
	}

	var date = new Date
	this.now = date.getTime()
	if (this.oldtime) {
		this.delta = ((this.now - this.oldtime) / 1000) * this.speed
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

	if (this.handlers.count) {
		this.handlers.foreach(function(handler) {
			return handler.process.call(handler)
		}, this)
	}

	if (this.scene) {
		this.scene.process.call(this.scene)
	}

	if (this.msg) {
		this.ctx.fillStyle = 'white'
		this.ctx.font = '12px ' + this.config.fontName
		this.ctx.fillText(this.msg, 20, this.Screen.height - 20)
	}

	this.showFPS()

	this.Event.frameReset()
}

GO.showFPS = function()
{
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

