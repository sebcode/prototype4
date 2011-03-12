
P4.Player = function(scene)
{
	this.scene = scene

	P4.Player.superproto.constructor.call(this)
	
	this.reset()
	this.collidesWith = [ P4.Enemy ]

	this.dust = new GO.Particles
	this.dust.x = this.x
	this.dust.y = this.y
	this.dust.gravity = 200
	this.dust.gravityangle = Math.PI
	this.dust.colorscheme = this.dustColorScheme
	this.dust.lifetime = 1 / 10
	this.dust.v = (1 + Math.random() * 2) * 50
	this.push(this.dust)
}

GO.Util.extend(P4.Player, GO.VisibleEntityGroup)

P4.Player.prototype.dustColorScheme = { r: -1, g: 255, b: 255 }
P4.Player.prototype.cr = 8
P4.Player.prototype.size = 1
P4.Player.prototype.lives = 3
P4.Player.prototype.weapon = 0
P4.Player.prototype.energy = 10

P4.Player.prototype.reset = function()
{
	this.heaven = false
	this.x = GO.Screen.width / 2
	this.y = GO.Screen.height - (GO.Screen.height / 4)
	this.angle = 0
	this.spawn = 500
	this.invincible = true
	this.fire = true
	this.weapon = 0
	this.weaponCooldown = 0
	this.energy = P4.Player.prototype.energy
}

P4.Player.prototype.explode = function(big)
{
	var p = new GO.Particles
	p.x = this.x
	p.y = this.y
	p.lifetime = 1 / 5
	p.v = big ? 500 : 50
	p.explode(20)
	this.push(p)
}

P4.Player.prototype.oncollision = function(e)
{
	if (e instanceof P4.Powerup && e.consume()) {
		switch (e.type) {
			case 'w':
				this.weapon = 1
				this.weaponCooldown = 10
				break

			case 'e':
				this.energy += 1
				if (this.energy >= 10) {
					this.energy = 10
				}
				break
		}

		return
	}

	if (this.invincible) {
		return
	}

	if (!(e instanceof P4.Enemy || e instanceof P4.Shot)) {
		return
	}

	if (!e.lethal) {
		return
	}

	if (e instanceof P4.Shot) {
		e.dead = true
	} else if (e instanceof P4.EnemyStar) {
		e.lethal = false
	}

	if (this.energy <= 0) {
		this.explode(true)
		this.heaven = true
		this.x = -5000
		this.y = -5000
		this.lives -= 1

		this.push(new GO.Timer(2000, function() {
			if (this.ondied) {
				if (this.ondied.fn.call(this.ondied.ctx) == false) {
					return false
				}
			}

			return false
		}, this))
	} else {
		var damage = e.damage ? e.damage : 1
		this.energy -= damage
		if (this.energy < 0) {
			this.energy = 0
		}
		this.hit = true
	}
}

P4.Player.prototype.process = function()
{
	this.dust.x = this.x
	this.dust.y = this.y

	P4.Player.superproto.process.call(this)

	if (this.heaven) {
		return
	}

	if (this.spawn > 0) {
		GO.ctx.beginPath()
		GO.ctx.lineWidth = 3
		GO.ctx.fillStyle = 'rgba(255,255,255,0.1)'
		GO.ctx.arc(this.x, this.y, 30 + this.spawn / 2, 0, Math.PI * 2, true)
		GO.ctx.fill()
		GO.ctx.closePath()

		this.spawn -= GO.delta * 1000
		if (this.spawn <= 0) {
			this.spawn = false
			
			if (!GO.godMode) {
				this.push(new GO.Timer(2000, function() {
					this.invincible = false
					return false
				}, this))
			}
		}
	}

	/* autofire */
	this.fire = true

	if (this.lastTick != GO.tick) {
		/* fire shot */
		if (GO.tick % 2 == 0 && this.fire) {
			switch (this.weapon) {
				case 0:
					this.fireSingleShot()
					break

				case 1:
					this.fireDoubleShot()
					break
			}

			this.fire = false
		}
		
		/* every second */
		if (GO.tick % 10 == 0 && this.weaponCooldown > 0) {
			this.weaponCooldown -= 1

			if (this.weaponCooldown <= 0 && this.weapon > 0) {
				this.weapon -= 1
			}
		}
		
		this.lastTick = GO.tick
	}

	/* fly to mouse position */
	if (!this.spawn && GO.Event.Mouse.x != -1 && GO.Event.Mouse.y != -1) {
		this.x += (GO.Event.Mouse.x - this.x) * (GO.delta * 5)
		this.y += (GO.Event.Mouse.y - this.y) * (GO.delta * 5)
	}

	/* snap right border */
	if (this.x >= GO.Screen.width - 20) {
		this.x = GO.Screen.width - 20
	}

	/* snap left border */
	if (this.x <= 20) {
		this.x = 20
	}

	/* snap bottom */
	if (this.y > GO.Screen.height - 20) {
		this.y = GO.Screen.height - 20
	}

	/* snap top */
	if (this.y <= 20) {
		this.y = 20
	}

	/* rotate towards flying direction */
	if (!this.spawn && GO.Event.Mouse.x != -1) {
		var n = GO.Event.Mouse.x - this.x
		this.angle = Math.sin(n / 100)
	}

	/* tail */
	this.push({
		lt: 2,
		angle: this.angle,
		alpha: 1,
		x: this.x,
		y: this.y,
		parent: this,
		size: this.size,
		process: function() {
			this.lt -= GO.delta * 10
			if (this.lt <= 0) {
				this.dead = true
				return false
			}

			this.alpha = this.alpha / 1.5
			this.parent.drawShip(this.x, this.y, this.angle, this.alpha)
		}
	})
	
	if (!this.spawn && this.invincible) {
		GO.ctx.beginPath()
		GO.ctx.fillStyle = 'rgba(255,255,255,0.1)'
		GO.ctx.arc(this.x, this.y, 30, 0, Math.PI * 2, true)
		GO.ctx.fill()
	}
	
	this.drawShip(this.x, this.y, this.angle, 1)
}

P4.Player.prototype.fireSingleShot = function()
{
	var e = new P4.Shot
	e.x = this.x
	e.y = this.y
	e.v = 400
	e.angle = this.angle
	e.collidesWith = [ P4.Enemy ]
	this.scene.layers.fg.push(e)
	this.fire = false
}

P4.Player.prototype.fireDoubleShot = function()
{
	var e = new P4.Shot
	e.x = this.x + 10
	e.y = this.y
	e.v = 400
	e.angle = this.angle
	e.collidesWith = [ P4.Enemy ]
	this.scene.layers.fg.push(e)
	
	var e = new P4.Shot
	e.x = this.x - 10
	e.y = this.y
	e.v = 400
	e.angle = this.angle
	e.collidesWith = [ P4.Enemy ]
	this.scene.layers.fg.push(e)
}

P4.Player.prototype.drawShip = function(x, y, angle, alpha)
{
	GO.ctx.save()
	GO.ctx.fillStyle = 'rgba(255,255,255,'+ alpha +')'
	GO.ctx.beginPath()
	GO.ctx.translate(x, y)
	GO.ctx.rotate(angle)
	GO.ctx.moveTo(0, -10 * this.size)
	GO.ctx.lineTo(5 * this.size, 5 * this.size)
	GO.ctx.lineTo(-5 * this.size, 5 * this.size)
	GO.ctx.fill()
	GO.ctx.restore()
}

