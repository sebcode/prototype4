
GO.Particles = function() { }

GO.Util.extend(GO.Particles, GO.VisibleEntityGroup)

GO.Particles.prototype.x = 0
GO.Particles.prototype.y = 0
GO.Particles.prototype.size = 0.1
GO.Particles.prototype.maxsize = 3
GO.Particles.prototype.gravity = 0
GO.Particles.prototype.gravityangle = false
GO.Particles.prototype.color = false
GO.Particles.prototype.lifetime = 1
GO.Particles.prototype.interval = 1

GO.Particles.prototype.explode = function(c)
{
	this.explosion = true

	for (var i = 0; i < c; i++) {
		this.createParticle()
	}
}

GO.Particles.prototype.createParticle = function()
{
	var p = new GO.Particle
	p.x = this.x
	p.y = this.y
	p.v = this.v
	if (this.vr) {
		p.v += Math.random() * this.vr
	}
	p.size = this.size
	p.maxsize = this.maxsize
	p.gravity = this.gravity
	p.gravityangle = this.gravityangle
	p.lifetime = this.lifetime
	if (this.colorscheme) {
		p.color = GO.Util.createColor(this.colorscheme)
	} else if (this.color) {
		p.color = this.color
	}
	this.push(p)
}

GO.Particles.prototype.process = function()
{
	GO.Particles.superproto.process.call(this)

	if (this.explosion) {
		if (!this.count) {
			this.dead = true
		}

		return
	}

	if (this.lastTick != GO.tick) {
		if (GO.tick % this.interval == 0) {
			this.createParticle()
			this.lastTick = GO.tick
		}
	}
}

