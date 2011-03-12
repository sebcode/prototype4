
P4.IntroScene = function()
{
	P4.IntroScene.superproto.constructor.call(this)

	this.layers.handlers = new GO.Layer
	this.layers.starfield = new GO.Layer
	this.layers.fg = new GO.Layer
	this.layers.transition = new GO.Layer

	P4.Starfield.create(this.layers.starfield)
	
	/* random multicolor particles */
	var p = new GO.Particles
	p.colorscheme = { r: -1, g: 255, b: -1 }
	p.x = GO.Screen.width / 2
	p.y = 0
	p.gravity = 200
	p.gravityangle = Math.PI
	p.lifetime = 2
	p.v = 10
	p.vr = 1000
	p.interval = 1
	this.particles = p
	this.layers.fg.push(p)
	
	this.titleSize = 0

	this.blinkTimer = new GO.Timer(500, function() {
		this.blink = ! this.blink
	}, this)
	this.blinkTimer.pause = true
	this.layers.handlers.push(this.blinkTimer)
}

GO.Util.extend(P4.IntroScene, GO.Scene)

P4.IntroScene.prototype.activate = function()
{
	this.locked = true
	
	/* allow click after time period */
	this.layers.handlers.push(new GO.Timer(1500, function() {
		this.locked = false
		this.blinkTimer.reset()
		this.blinkTimer.pause = false
		return false
	}, this))
}

P4.IntroScene.prototype.process = function()
{
	this.clear()

	this.drawTitle()
	this.drawSubTitle()
	this.drawCredit()

	if (!P4.IntroScene.superproto.process.call(this)) {
		return
	}

	this.handleEvent()

	this.particles.x = (GO.Screen.width / 2) + (Math.sin(GO.counter * 10) * 300)
}

P4.IntroScene.prototype.drawTitle = function()
{
	if (this.titleSize < 50) {
		this.titleSize += GO.delta * 50
	}

	if (this.titleSize > 50) {
		this.titleSize = 50
	}

	GO.ctx.font = Math.floor(this.titleSize) + 'px ' + GO.config.fontName
	GO.ctx.fillStyle = '#fff'
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.fillText('prototype4', GO.Screen.width / 2, GO.Screen.height / 2)
}

P4.IntroScene.prototype.drawSubTitle = function()
{
	if (this.locked || this.blink) {
		return
	}

	GO.ctx.font = '20px ' + GO.config.fontName
	GO.ctx.fillStyle = '#fff'
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.fillText('insert coin', GO.Screen.width / 2, GO.Screen.height / 2 + 100)
}

P4.IntroScene.prototype.drawCredit = function()
{
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = '#666'
	GO.ctx.textBaseline = 'bottom'
	GO.ctx.textAlign = 'right'
	GO.ctx.fillText('A Game By Sebastian Volland', GO.Screen.width - 5, GO.Screen.height - 5)
}

P4.IntroScene.prototype.handleEvent = function()
{
	var t

	if (this.locked) {
		return
	}

	if (GO.Event.Mouse.click || GO.Event.Keyboard.chrLower == 'a') {
		this.locked = true

		t = new GO.Transition
		t.v = 2
		t.ondone = {
			fn: function() {
				GO.scenes.game = new P4.GameScene
				GO.setScene(GO.scenes.game)
			}, ctx: this
		}
		this.layers.transition.push(t)
	}
}

