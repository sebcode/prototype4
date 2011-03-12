
GO.Particle = function()
{
	this.a = Math.random() * (Math.PI * 2)
	this.dir = Math.random() > 0.5
	this.v = (1 + Math.random() * 2) * 50
}

GO.Particle.prototype.x = 0
GO.Particle.prototype.y = 0
GO.Particle.prototype.size = 0.1
GO.Particle.prototype.maxsize = 3
GO.Particle.prototype.gravity = 0
GO.Particle.prototype.gravityangle = false
GO.Particle.prototype.color = 'white'
GO.Particle.prototype.lifetime = 1

GO.Particle.prototype.setColorScheme = function(scheme)
{
	this.color = GO.Util.createColor(scheme)
}

GO.Particle.prototype.process = function()
{
	this.lifetime -= GO.delta

	if (this.lifetime < 0) {
		this.size -= GO.delta * 10
	} else if (this.size <= this.maxsize) {
		this.size += GO.delta * 100
	}

	if (this.size > this.maxsize) {
		this.size = this.maxsize
	}

	if (this.size <= 0) {
		this.dead = true
		return
	}

	if (this.dir) {
		this.a += GO.delta
	} else {
		this.a -= GO.delta
	}

	this.x += Math.sin(this.a) * this.v * GO.delta
	this.y += - Math.cos(this.a) * this.v * GO.delta

	if (this.gravity && this.gravityangle !== false) {
		this.x += Math.sin(this.gravityangle) * this.gravity * GO.delta
		this.y += - Math.cos(this.gravityangle) * this.gravity * GO.delta
	}

	GO.ctx.fillStyle = this.color
	GO.ctx.beginPath()
	GO.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true)
	GO.ctx.closePath()
	GO.ctx.fill()

	if (this.x < 0 || this.y < 0 || this.x > GO.Screen.width || this.y > GO.Screen.height) {
		this.dead = true
	}
}

