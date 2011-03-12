
P4.Powerup = function()
{
	P4.Powerup.superproto.constructor.call(this)

	this.collidesWith = [ P4.Player ]

	switch (Math.floor(Math.random() * 2)) {
		case 0: this.type = 'w'; break
		case 1: this.type = 'e'; break
	}
}

GO.Util.extend(P4.Powerup, GO.VisibleEntityGroup)

P4.Powerup.prototype.x = 0
P4.Powerup.prototype.y = 0
P4.Powerup.prototype.v = 300
P4.Powerup.prototype.cr = 50
P4.Powerup.prototype.active = true
P4.Powerup.prototype.type = 'w'

P4.Powerup.prototype.consume = function()
{
	if (this.active && this.touching) {
		this.active = false
		this.dead = true
		return true
	}

	return false
}

P4.Powerup.prototype.oncollision = function(e, d)
{
	if (!(e instanceof P4.Player)) {
		return
	}

	if (d >= 10) {
		this.magnet = true
	} else {
		this.touching = true
	}
}

P4.Powerup.prototype.process = function()
{
	P4.Powerup.superproto.process.call(this)

	if (this.magnet) {
		var px = GO.scenes.game.player.x
			,py = GO.scenes.game.player.y

		this.x += (px - this.x) * GO.delta * 15
		this.y += (py - this.y) * GO.delta * 15
	} else {
		this.y += this.v * GO.delta
	}
	
	if (this.y - 200 > GO.Screen.height) {
		this.dead = true
	}

	switch (this.type) {
		case 'w':
			this.drawCircle(this.x, this.y, 'yellow', 'w')
			break

		case 'e':
			this.drawCircle(this.x, this.y, 'white', 'E')
			break
	}
}

P4.Powerup.prototype.drawCircle = function(x, y, c, t)
{
	GO.ctx.beginPath()
	GO.ctx.fillStyle = c
	GO.ctx.arc(x, y, 6, 0, Math.PI * 2, true)
	GO.ctx.fill()
	GO.ctx.closePath()

	GO.ctx.textBaseline = 'middle'
	GO.ctx.textAlign = 'center'
	GO.ctx.font = '8px ' + GO.config.fontName
	GO.ctx.fillStyle = 'black'
	GO.ctx.fillText(t, x, y)
}

