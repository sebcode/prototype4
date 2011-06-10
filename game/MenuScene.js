
P4.MenuScene = function()
{
	P4.MenuScene.superproto.constructor.call(this)

	this.layers.starfield = new GO.Layer
	P4.Starfield.create(this.layers.starfield)

	this.items = [
		{
			label: 'continue',
			func: function() {
				GO.setScene(GO.scenes.game)
			}
		},
		{
			label: 'new game',
			func: function() {
				GO.scenes.game = new P4.GameScene({ diff: GO.scenes.game.player.diff })
				GO.setScene(GO.scenes.game)
			}
		},
		{
			label: 'quit to menu',
			func: function() {
				GO.setScene(GO.scenes.intro)
			}
		}
	]
}

GO.Util.extend(P4.MenuScene, GO.Scene)

P4.MenuScene.prototype.activate = function()
{
	this.lastSel = false

	GO.Sound.play('menu_open')
}

P4.MenuScene.prototype.process = function()
{
	this.clear()

	if (!P4.MenuScene.superproto.process.call(this)) {
		return
	}

	if (GO.Event.Keyboard.code == 27) {
		GO.Sound.play('menu_close')
		GO.setScene(GO.scenes.game)
		return
	}

	var l = this.items.length
	this.txth = 20
	this.w = GO.Screen.width / 2
	this.h = (l * (this.txth + 20)) + 10
	this.x = (GO.Screen.width / 2) - (this.w / 2)
	this.y = (GO.Screen.height / 2) - (this.h / 2)

	GO.ctx.beginPath()
	GO.ctx.fillStyle = '#333'
	GO.ctx.rect(this.x, this.y, this.w, this.h)
	GO.ctx.fill()
	
	GO.ctx.beginPath()
	GO.ctx.strokeStyle = '#fff'
	GO.ctx.lineWidth = 2
	GO.ctx.rect(this.x, this.y, this.w, this.h)
	GO.ctx.stroke()
	GO.ctx.closePath()

	for (var i = 0; i < l; i++) {
		this.drawMenuItem(i + 1, this.items[i].label)
	}

	this.sel = 0

	if (GO.Event.Mouse.y > this.y
		&& GO.Event.Mouse.y < this.y + this.h
		&& GO.Event.Mouse.x > this.x
		&& GO.Event.Mouse.x < this.x + this.w) {

		this.sel = Math.floor((GO.Event.Mouse.y - this.y) / (this.txth + 20)) + 1
		
		if (this.sel != this.lastSel) {
			GO.Sound.play('select')
			this.lastSel = this.sel
		}
	}

	if (GO.Event.Mouse.click && this.sel && this.items[this.sel - 1] && this.items[this.sel - 1].func) {
		GO.Sound.play('menu_click')
		this.items[this.sel - 1].func.call()
	}
}

P4.MenuScene.prototype.drawMenuItem = function(i, txt)
{
	var x = (GO.Screen.width / 2)
		,y = this.y + (i * (this.txth + 20)) - 10

	GO.ctx.textBaseline = 'alphabetic'
	GO.ctx.textAlign = 'center'
	GO.ctx.font = this.txth + 'px ' + GO.config.fontName
	GO.ctx.fillStyle = (i == this.sel ? '#f00' : '#fff')
	GO.ctx.fillText(txt, x, y)
}

