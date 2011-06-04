
P4.EnemyBoss = function()
{
	P4.EnemyBoss.superproto.constructor.call(this)

	this.x = GO.Screen.width / 2
	this.y = -20
	
	this.tx = GO.Screen.width / 2
	this.ty = 100

	this.angle = Math.PI
	
	this.tail = new GO.LinkedList
	for (var i = 0; i < 20; i += 1) {
		this.tail.push({
			x: -100
			,y: -100
			,angle: 0
			,alpha: 1
		})
	}
	this.tailCur = this.tail.first
}

GO.Util.extend(P4.EnemyBoss, P4.Enemy)

P4.EnemyBoss.prototype.size = 3
P4.EnemyBoss.prototype.angle = 0
P4.EnemyBoss.prototype.v = 3
P4.EnemyBoss.prototype.cr = 30
P4.EnemyBoss.prototype.lethal = true
P4.EnemyBoss.prototype.life = 100
P4.EnemyBoss.prototype.color = '247,252,105'

P4.EnemyBoss.prototype.process = function()
{
	if (!this.hit) {
		this.drawTail()
		this.drawShip(this.x, this.y, this.angle, 1, this.color)
	}

	this.x += (this.tx - this.x) * (GO.delta * this.v)
	this.y += (this.ty - this.y) * (GO.delta * this.v)

	if (this.y - 200 > GO.Screen.height
		|| this.x > GO.Screen.width
		|| this.x < 0) {

		this.dead = true
	}
	
	GO.VisibleEntityGroup.prototype.process.call(this)
	
	if (this.hit) {
		if (this.count <= 0) {
			this.dead = true
		}

		return
	}
	var player = GO.scenes.game.player
		,px = player.x
		,py = player.y
	
	if (!player.heaven) {
		this.angle = (Math.PI / 2) + Math.atan((this.y - py) / (this.x - px))
		if (px <= this.x) {
			this.angle -= Math.PI
		}
	} else {
		this.angle = Math.PI
	}

	if (!this.hit && this.lastTick != GO.tick) {
		if (GO.tick % 20 == 0) {
			this.changePos()
		}
	
		if (GO.tick % 30 == 0) {
			this.fire()
		}
	
		if (GO.tick % 100 == 0) {
			var p = new P4.Powerup
			p.x = Math.random() * GO.Screen.width
			p.y = 0
			p.type = 'w'
			GO.scenes.game.layers.fg.push(p)
		}

		this.lastTick = GO.tick
	}

	this.drawEnergy()
	
	if (player.heaven) {
		this.tx = GO.Screen.width / 2
		this.ty = GO.Screen.height + 300
	}
}

P4.EnemyBoss.prototype.drawEnergy = function()
{
	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = 'white'
	GO.ctx.fillText('BOSS : ' + this.life, GO.Screen.width / 2, 20)
}

P4.EnemyBoss.prototype.changePos = function()
{
	var sw = GO.Screen.width
		,sh = GO.Screen.height
	
	GO.Sound.play('boss_move')
	this.tx = 100 + (Math.random() * (sw - 200))
	this.ty = 50 + (Math.random() * (sh - 400))
}

P4.EnemyBoss.prototype.fire = function()
{
	GO.Sound.play('boss_fire')

	for (var i = 0; i < 10; i += 1) {
		var c = { r: 255, g: 255, b: -1 }
			,ec = { r: 255, g: 255, b: -1 }
			,a = new P4.EnemyShip(c, ec)

		a.x = this.x - 20 + (Math.random() * 20)
		a.y = this.y - 20 + (Math.random() * 20)
		a.v = 1 + (Math.random() * 2)
		a.size = 0.2
		a.canFire = false
		a.canFlyAway = false
		a.canGiveScore = false
		a.explodeLifetime = 1 / 20
		GO.scenes.game.layers.fg.push(a)
	}
}

P4.EnemyBoss.prototype.drawTail = function()
{
	if (this.tailCur) {
		this.tailCur.x = this.x
		this.tailCur.y = this.y
		this.tailCur.angle = this.angle
		this.tailCur.alpha = 1
		if (this.tailCur.llnext) {
			this.tailCur = this.tailCur.llnext
		} else {
			this.tailCur = this.tail.first
		}
	}

	var i = 0
		,cur = this.tailCur

	do {
		cur.alpha -= 1 / 10
		if (cur.alpha > 0.1) {
			this.drawShip(cur.x, cur.y, cur.angle, cur.alpha, this.color)
		}

		if (cur.llnext) {
			cur = cur.llnext
		} else {
			cur = this.tail.first
		}
		i += 1
	} while (i < this.tail.count)
}

P4.EnemyBoss.prototype.drawShip = function(x, y, angle, alpha, color)
{
	GO.ctx.save()
	GO.ctx.fillStyle = 'rgba('+ color +','+ alpha +')'
	GO.ctx.beginPath()
	GO.ctx.translate(x, y)
	GO.ctx.rotate(angle)

	GO.ctx.moveTo(0, -10 * this.size)
	GO.ctx.lineTo(5 * this.size, 5 * this.size)
	GO.ctx.lineTo(-5 * this.size, 5 * this.size)

	GO.ctx.moveTo(0 - 10, -10 * this.size)
	GO.ctx.lineTo(5 * this.size - 10, 5 * this.size)
	GO.ctx.lineTo(-5 * this.size - 10, 5 * this.size)

	GO.ctx.moveTo(0 + 10, -10 * this.size)
	GO.ctx.lineTo(5 * this.size + 10, 5 * this.size)
	GO.ctx.lineTo(-5 * this.size + 10, 5 * this.size)

	GO.ctx.fill()
	GO.ctx.restore()
}

P4.EnemyBoss.prototype.explode = function(x, y, v, n)
{
	if (!n) {
		n = 10
	}

	var p = new GO.Particles
	p.colorscheme = this.excolorscheme
	p.x = x
	p.y = y
	p.lifetime = 1 / 5
	p.v = v
	p.vr = 100
	p.explode(n)
	this.push(p)
}

P4.EnemyBoss.prototype.oncollision = function(s, d)
{
	if (!(s instanceof P4.Shot)) {
		return
	}

	if (d > this.cr) {
		return
	}

	if (!this.lethal) {
		return
	}

	this.life -= 1
	s.dead = true

	if (this.life <= 0) {
		GO.Sound.play('boss_explode')
		this.explode(s.x, s.y, 500, 50)
		this.dust = false
		this.lethal = false
		this.hit = true

		if (this.powerup) {
			var p = new P4.Powerup
			p.x = this.x
			p.y = this.y
			GO.scenes.game.layers.fg.push(p)
		}
	} else {
		GO.Sound.play('hit')
		this.explode(s.x, s.y, 10)
		GO.scenes.game.player.score += 100 + Math.floor(this.v * 100)
	}
}

