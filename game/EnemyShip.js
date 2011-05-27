
P4.EnemyShip = function(colorscheme, excolorscheme)
{
	P4.EnemyShip.superproto.constructor.call(this)

	var rgb = GO.Util.createColorRGB(colorscheme)
	this.color = rgb.r + ',' + rgb.g + ',' + rgb.b

	if (excolorscheme) {
		this.excolorscheme = excolorscheme
	} else {
		this.excolorscheme = colorscheme
	}

	this.dust = new GO.Particles
	this.dust.x = this.x
	this.dust.y = this.y
	this.dust.gravity = 200
	this.dust.lifetime = 1 / 10
	this.dust.v = 50
	
	this.tail = new GO.LinkedList
	for (i = 0; i < 20; i += 1) {
		this.tail.push({
			x: -100
			,y: -100
			,angle: 0
			,alpha: 1
		})
	}
	this.tailCur = this.tail.first

	this.y = -30
}

GO.Util.extend(P4.EnemyShip, P4.Enemy)

P4.EnemyShip.prototype.size = 1
P4.EnemyShip.prototype.angle = 0
P4.EnemyShip.prototype.v = 0.5
P4.EnemyShip.prototype.cr = 20
P4.EnemyShip.prototype.lethal = true
P4.EnemyShip.prototype.life = 2

P4.EnemyShip.prototype.process = function()
{
	var i
		,cur

	if (this.dust) {
		this.dust.x = this.x
		this.dust.y = this.y
		this.dust.gravityangle = this.angle + Math.PI
		this.dust.process()
	}

	if (!this.hit) {
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

		i = 0
		cur = this.tailCur
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

		this.drawShip(this.x, this.y, this.angle, 1, this.color)
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
	
	if (!this.flyaway) {
		this.tx = px
		this.ty = py

		var d = Math.sqrt(Math.pow(px - this.x, 2) + Math.pow(py - this.y, 2))

		if (d <= 300) {
			this.fire()
		}

		if ((d <= 150 && player.y > (GO.Screen.height * 0.5)) || player.heaven) {
			this.flyaway = true
			this.v = 0.5

			if (this.x > (GO.Screen.width / 2)) {
				this.tx = GO.Screen.width * 2
			} else {
				this.tx = - GO.Screen.width * 2
			}
			this.ty = this.y - 200
		}
	}

	this.x += (this.tx - this.x) * (GO.delta * this.v)
	this.y += (this.ty - this.y) * (GO.delta * this.v)

	if (this.y - 200 > GO.Screen.height
		|| this.x > GO.Screen.width
		|| this.x < 0) {

		this.dead = true
	}
	
	/* angle pointing to mouse position */

	this.angle = (Math.PI / 2) + Math.atan((this.y - this.ty) / (this.x - this.tx))
	if (px <= this.x) {
		this.angle -= Math.PI
	}

	if (this.flyaway) {
		this.angle += Math.PI
	}
}

P4.EnemyShip.prototype.fire = function()
{
	if (this.lastTick != GO.tick) {
		/* fire shot */
		if (GO.tick % 5 == 0) {
			var e = new P4.Shot
			e.fillStyle = 'red'
			e.x = this.x
			e.y = this.y
			e.v = 200
			e.cr = 4
			e.angle = this.angle
			e.lethal = true
			e.collidesWith = [ P4.Player ]
			GO.scenes.game.layers.fg.push(e)
		}
		
		this.lastTick = GO.tick
	}
}

P4.EnemyShip.prototype.drawShip = function(x, y, angle, alpha, color)
{
	GO.ctx.save()
	GO.ctx.fillStyle = 'rgba('+ color +','+ alpha +')'
	GO.ctx.beginPath()
	GO.ctx.translate(x, y)
	GO.ctx.rotate(angle)
	GO.ctx.moveTo(0, -10 * this.size)
	GO.ctx.lineTo(5 * this.size, 5 * this.size)
	GO.ctx.lineTo(-5 * this.size, 5 * this.size)
	GO.ctx.fill()
	GO.ctx.restore()
}

P4.EnemyShip.prototype.oncollision = function(s, d)
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
		GO.Sound.play('explode1')
		this.explode(s.x, s.y, 300)
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

P4.EnemyShip.prototype.explode = function(x, y, v)
{
	var p = new GO.Particles
	p.colorscheme = this.excolorscheme
	p.x = x
	p.y = y
	p.lifetime = 1 / 5
	p.v = v
	p.vr = 100
	p.explode(10)
	this.push(p)
}

