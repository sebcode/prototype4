
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
}

GO.Util.extend(P4.IntroScene, GO.Scene)

P4.IntroScene.prototype.activate = function()
{
	this.locked = true
	
	/* allow click after time period */
	this.layers.handlers.push(new GO.Timer(1500, function() {
		this.locked = false
		return false
	}, this))
	
	GO.Sound.play('intro')

	this.setMainMenu()
}

P4.IntroScene.prototype.setMainMenu = function()
{
	this.items = []

	var continueLevel = P4.GameState.get('level')
	if (continueLevel) {
		this.items.push('continue')
	}

	this.items.push('new game')
	this.items.push('quit')
}

P4.IntroScene.prototype.process = function()
{
	this.clear()

	this.drawTitle()
	this.drawMenu()
	this.drawFooter()

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
	GO.ctx.fillText('prototype4', GO.Screen.width / 2, GO.Screen.height / 2 - 50)
}

P4.IntroScene.prototype.drawMenu = function()
{
	if (this.locked) {
		return
	}

	GO.ctx.font = '20px ' + GO.config.fontName
	GO.ctx.fillStyle = '#999'
	GO.ctx.textBaseline = 'alphabetic'
	GO.ctx.textAlign = 'center'

	var x = GO.Screen.width / 2
		,y = GO.Screen.height / 2 + 100
		,sel = false
	
	for (var i = 0; i < this.items.length; i += 1) {
		if (this.drawMenuItem(i, this.items[i])) {
			sel = true
		}
	}

	if (!sel) {
		this.lastMenuItem = false
	}
}

P4.IntroScene.prototype.drawMenuItem = function(i, txt, onclick)
{
	var h = 40
		,x = GO.Screen.width / 2
		,y = GO.Screen.height / 2 + 25 + (i * h)
		,sel = 0
	
	if (GO.Event.Mouse.y > y
		&& GO.Event.Mouse.y < y + h
		&& GO.Event.Mouse.x < x + 150
		&& GO.Event.Mouse.x > x - 150) {
	
		sel = true
	}

	GO.ctx.font = '20px ' + GO.config.fontName
	GO.ctx.textBaseline = 'top'
	GO.ctx.textAlign = 'center'
	GO.ctx.fillStyle = (sel ? '#aff' : '#999')
	GO.ctx.fillText(sel ? '[ ' + txt + ' ]' : txt, x, y)
	
	if (sel && GO.Event.Mouse.click) {
		GO.Sound.play('menu_click')
		this.handleMenuItemClick(txt)
	}
	
	if (sel && this.lastMenuItem != txt) {
		GO.Sound.play('select')
		this.lastMenuItem = txt
	}

	return sel
}

P4.IntroScene.prototype.handleMenuItemClick = function(item)
{
	switch (item) {
		case 'continue':
			this.beginGame(P4.GameState.data)
			break

		case 'new game':
			P4.track('menu-newgame')
			this.clickNewGame()
			break

		case 'quit':
			if (ext && ext.quit) {
				P4.track('quit')
				ext.quit()
			}
			break

		case 'BACK':
			this.setMainMenu()
			break

		case 'easy':
			P4.track('menu-diff-easy')
			this.beginGame({ diff: 0 })
			break

		case 'normal':
			P4.track('menu-diff-normal')
			this.beginGame({ diff: 1 })
			break

		case 'hard':
			P4.track('menu-diff-hard')
			this.beginGame({ diff: 2 })
			break

		case 'ultra':
			P4.track('menu-diff-ultra')
			this.beginGame({ diff: 3 })
			break
	}
}

P4.IntroScene.prototype.clickNewGame = function()
{
	this.items = []
	this.items.push('easy')
	this.items.push('normal')
	this.items.push('hard')
	this.items.push('ultra')
	this.items.push('BACK')
}

P4.IntroScene.prototype.drawFooter = function()
{
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = '#666'
	GO.ctx.textBaseline = 'bottom'
	GO.ctx.textAlign = 'right'
	GO.ctx.fillText('A Game By Sebastian Volland', GO.Screen.width - 5, GO.Screen.height - 5)

	var diff = P4.DiffFromText(this.lastMenuItem)

	if (P4.GameState.data.highscore
		&& diff !== false
		&& P4.GameState.data.highscore[diff]) {

		GO.ctx.textBaseline = 'bottom'
		GO.ctx.textAlign = 'left'
		GO.ctx.fillText('HIGHSCORE: ' + P4.GameState.data.highscore[diff], 5, GO.Screen.height - 5)
	}
}

P4.IntroScene.prototype.beginGame = function(gameState)
{
	t = new GO.Transition
	t.v = 2
	t.ondone = {
		fn: function() {
			GO.scenes.game = new P4.GameScene(gameState)
			GO.setScene(GO.scenes.game)
		}, ctx: this
	}
	this.layers.transition.push(t)
}

P4.IntroScene.prototype.handleEvent = function()
{
	var t

	if (this.locked) {
		return
	}

	if (false && GO.Event.Mouse.click || GO.Event.Keyboard.chrLower == 'a') {
		this.locked = true
		this.beginGame()
	}
}

