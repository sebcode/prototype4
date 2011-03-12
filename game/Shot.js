
P4.Shot = function() { }

P4.Shot.prototype.x = 0
P4.Shot.prototype.y = 0
P4.Shot.prototype.angle = 0
P4.Shot.prototype.v = 600
P4.Shot.prototype.p = 0
P4.Shot.prototype.cr = 50
P4.Shot.prototype.fillStyle = 'white'
P4.Shot.prototype.target = false
P4.Shot.prototype.radius = 2
P4.Shot.prototype.damage = 2

P4.Shot.prototype.lastDistance = false

P4.Shot.prototype.oncollision = function(e, d)
{
	if (!(e instanceof P4.Enemy)) {
		return
	}

	/* lethal is false, when enemy is exploding */
	if (!e.lethal) {
		return
	}
	
	if (this.lastDistance === false || d < this.lastDistance) {
		this.lastDistance = d
		this.target = { x: e.x, y: e.y }
	}
}

P4.Shot.prototype.process = function()
{
	if (this.target) {
		this.x += (this.target.x - this.x) * (GO.delta * 10)
		this.y += (this.target.y - this.y) * (GO.delta * 10)
		
		if (Math.sqrt(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2)) <= 10) {
			this.target = false
		}
	} else {
		this.x += Math.sin(this.angle) * this.v * GO.delta
		this.y += - Math.cos(this.angle) * this.v * GO.delta
	}
	
	if (this.x > GO.Screen.width || this.y > GO.Screen.height || this.x < -10 || this.y <= -10) {
		this.dead = true
	}

	GO.ctx.fillStyle = this.fillStyle
	GO.ctx.beginPath()
	GO.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
	GO.ctx.fill()
}

