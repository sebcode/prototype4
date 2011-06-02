
P4.Level = function(scene, startWith)
{
	this.scene = scene

	if (startWith) {
		this.startWith = startWith
	}

	if (this.startWith) {
		for (var i = 0; i <= this.sequence.length; i += 1) {
			if (this.startWith == this.sequence[i]) {
				this.stepindex = i
				break
			}
		}
	}
}

P4.Level.prototype.pattern = {}
P4.Level.prototype.scene = false
P4.Level.prototype.step = false
P4.Level.prototype.stepindex = 0
P4.Level.prototype.wait = 0
P4.Level.prototype.forcewait = 0
P4.Level.prototype.lastLevelIndex = 0
//P4.Level.prototype.startWith = 'dummy2'

P4.Level.prototype.pattern.powerupW = function()
{
	var p = new P4.Powerup
	p.x = Math.random() * GO.Screen.width
	p.y = 0
	p.type = 'w'
	GO.scenes.game.layers.fg.push(p)
}

P4.Level.prototype.pattern.powerupE = function()
{
	var p = new P4.Powerup
	p.x = Math.random() * GO.Screen.width
	p.y = 0
	p.type = 'e'
	GO.scenes.game.layers.fg.push(p)
}

P4.Level.prototype.pattern.star = function()
{
	GO.Sound.play('enemystar')
	var a = new P4.EnemyStar()
	a.x = Math.random() * GO.Screen.width
	a.y = -10
	this.scene.layers.fg.push(a)
}

P4.Level.prototype.pattern.minis = function()
{
	for (var i = 0; i < 20; i += 1) {
		var c = { r: -1, g: -1, b: -1 }
			,ec = { r: -1, g: -1, b: -1 }
			,a = new P4.EnemyShip(c, ec)

		a.x = 100 + (GO.Screen.width - 200) * Math.random()
		a.v = 1 + (Math.random() * 2)
		a.size = 0.2
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.singlerandom = function()
{
	var a = new P4.EnemyShipPurple()
	a.x = 100 + (GO.Screen.width - 200) * Math.random()
	a.life = 5
	this.scene.layers.fg.push(a)
}

P4.Level.prototype.pattern.lineblueslow = function()
{
	var l = 12
		,powerup = this.step.powerup ? Math.floor(Math.random() * l) : false
	
	for (var i = 0; i < l; i++) {
		a = new P4.EnemyShipBlue()
		a.x = (GO.Screen.width / (l - 1)) * i

		if (i == powerup) {
			a.powerup = this.step.powerup
		}

		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.linepurple = function()
{
	for (var i = 0, l = 8; i < l; i++) {
		a = new P4.EnemyShipPurple()
		a.x = (GO.Screen.width / (l - 1)) * i
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.yellowline = function()
{
	var l = 8
		,powerup = this.step.powerup ? Math.floor(Math.random() * l) : false

	for (var i = 0; i < l; i += 1) {
		a = new P4.EnemyShipYellow()
		a.x = (GO.Screen.width / (l - 1)) * i
		
		if (i == powerup) {
			a.powerup = this.step.powerup
		}

		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.yellowandorange = function()
{
	for (var i = 0, l = 8; i < l; i++) {
		a = new P4.EnemyShipYellow()
		a.x = (GO.Screen.width / (l - 1)) * i
		this.scene.layers.fg.push(a)
	}
	
	for (var i = 0, l = 8; i < l; i++) {
		a = new P4.EnemyShipOrange()
		a.x = (GO.Screen.width / (l - 1)) * i
		a.y = -150
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.n4 = function()
{
	for (var i = 0, l = 8; i < l; i += 1) {
		if (i % 2 == 0) {
			a = new P4.EnemyShipBlue()
		} else {
			a = new P4.EnemyShipPurple()
		}

		a.x = (GO.Screen.width / (l - 1)) * i
		a.y = -150
		a.v = 0.2 + (i / 10)

		if (i == 0) {
			a.powerup = 1
		}

		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.n5 = function()
{
	for (var i = 0, l = 8; i < l; i += 1) {
		if (i % 2 == 0) {
			a = new P4.EnemyShipBlue()
		} else {
			a = new P4.EnemyShipPurple()
		}

		a.x = GO.Screen.width - ((GO.Screen.width / (l - 1)) * i)
		a.y = -150
		a.v = 0.2 + (i / 10)
		
		if (i == 0) {
			a.powerup = 1
		}

		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.rush1 = function()
{
	for (var i = 0; i < 5; i += 1) {
		var a = new P4.EnemyShipBlue()
		a.x = 100 + (GO.Screen.width - 200) * Math.random()
		a.life = 5
		a.v = 0.5 + (Math.random() * 2)
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.rush2 = function()
{
	for (var i = 0; i < 8; i += 1) {
		var a = new P4.EnemyShipOrange()
		a.x = 100 + (GO.Screen.width - 200) * Math.random()
		a.life = 5
		a.v = 0.5 + (Math.random() * 2)
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.rush3 = function()
{
	for (var i = 0; i < 8; i += 1) {
		var a = new P4.EnemyShipLime()
		a.x = 100 + (GO.Screen.width - 200) * Math.random()
		a.life = 5
		a.v = 0.5 + (Math.random() * 2)
		this.scene.layers.fg.push(a)
	}
}

P4.Level.prototype.pattern.boss = function()
{
	var a = new P4.EnemyBoss()
	this.scene.layers.fg.push(a)
}

P4.Level.prototype.process = function()
{
	if (this.levelText && this.drawLevelText) {
		GO.ctx.font = '20px ' + GO.config.fontName
		GO.ctx.textBaseline = 'alphabetic'
		GO.ctx.textAlign = 'center'
		GO.ctx.fillStyle = 'white'
		GO.ctx.fillText(this.levelText, GO.Screen.width / 2, GO.Screen.height / 2 - 30)
	}

	this.processStep()
}

P4.Level.prototype.gotoLast = function()
{
	this.stepindex = this.lastLevelIndex
	this.step = false
}

P4.Level.prototype.processStep = function()
{
	if (this.scene.player.heaven) {
		return
	}

	if (this.stepindex > this.sequence.length - 1) {
		if (P4.Enemy.count > 0) {
			return
		}

		GO.scenes.end = new P4.EndScene('Well Done', this.scene.player.score)
		GO.setScene(GO.scenes.end)
		P4.track('finished')
		return
	}

	if (GO.tick != this.lasttick) {
		if (this.forcewait > 0) {
			this.forcewait -= 1
		} else if (this.wait > 0) {
			this.wait -= 1
		} else if (!this.step) {
			if (typeof this.sequence[this.stepindex] == 'string') {
				if (P4.Enemy.count <= 0) {
					GO.Sound.play('level_start')

					//var rgb = GO.Util.createColorRGB({r: -1, g: -1, b: -1})
					//this.scene.setOverlayColor(rgb.r + ',' + rgb.g + ',' + rgb.b)

					this.levelText = this.sequence[this.stepindex]
					
					if (ext && ext.save) {
						ext.save('Level', this.levelText)
					}
				
					P4.track(this.levelText)

					this.drawLevelText = true
					this.lastLevelIndex = this.stepindex
					this.forcewait = 20
					this.stepindex += 1
					return
				}
			} else if (this.sequence[this.stepindex].bgcolor) {
				this.scene.setOverlayColor(this.sequence[this.stepindex].bgcolor)
				this.stepindex += 1
				return
			} else {
				this.drawLevelText = false
				this.step = this.sequence[this.stepindex]
				if (!this.step) {
					this.step = false
					this.stepindex += 1
					return
				} else {
					this.wait = this.step.w
				}
			}
		} else {
			if (this.step.p) {
				this.pattern[this.step.p].call(this)
			}
			this.step = false
			this.stepindex += 1
		}
	
		this.lasttick = GO.tick
	}
}

