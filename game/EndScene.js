
P4.EndScene = function(label1, label2)
{
	if (label1) {
		this.label1 = label1
	}

	if (label2) {
		this.label2 = label2
	}

	P4.EndScene.superproto.constructor.call(this)

	this.layers.handlers = new GO.Layer
	this.layers.starfield = new GO.Layer
	this.layers.txt = new GO.Layer
	this.layers.transition = new GO.Layer

	P4.Starfield.create(this.layers.starfield)

	this.blinkTimer = new GO.Timer(500, function() {
		this.blink = ! this.blink
	}, this)
	this.blinkTimer.pause = true
	this.layers.handlers.push(this.blinkTimer)
}

GO.Util.extend(P4.EndScene, GO.Scene)

P4.EndScene.prototype.label1 = 'Game Over'
P4.EndScene.prototype.label2 = 'try again'

P4.EndScene.prototype.activate = function()
{
	this.locked = true

	GO.Sound.play('game_over')
	
	/* allow click after time period */
	this.layers.handlers.push(new GO.Timer(1500, function() {
		this.locked = false
		this.blinkTimer.reset()
		this.blinkTimer.pause = false
		return false
	}, this))
}

P4.EndScene.prototype.process = function()
{
	this.clear()
	
	this.drawTitle()
	this.drawSubTitle()

	if (!P4.EndScene.superproto.process.call(this)) {
		return
	}

	this.handleEvent()
}

P4.EndScene.prototype.drawTitle = function()
{
	GO.ctx.font = '30px ' + GO.config.fontName
	GO.ctx.fillStyle = '#fff'
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.fillText(this.label1, GO.Screen.width / 2, GO.Screen.height / 2)
}

P4.EndScene.prototype.drawSubTitle = function()
{
	if (this.locked || this.blink) {
		return
	}

	GO.ctx.font = '20px ' + GO.config.fontName
	GO.ctx.fillStyle = '#fff'
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.fillText(this.label2, GO.Screen.width / 2, GO.Screen.height / 2 + 100)
}

P4.EndScene.prototype.handleEvent = function()
{
	if (this.locked) {
		return
	}

	if (GO.Event.Mouse.click || GO.Event.Keyboard.code == 27) {
		this.locked = true

		t = new GO.Transition
		t.v = 2
		t.ondone = {
			fn: function() {
				GO.setScene(GO.scenes.intro)
			}, ctx: this
		}
		this.layers.transition.push(t)
	}
}

