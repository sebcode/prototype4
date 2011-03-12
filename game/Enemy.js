
P4.Enemy = function()
{
	P4.Enemy.superproto.constructor.call(this)
	
	P4.Enemy.count += 1
}

P4.Enemy.count = 0

GO.Util.extend(P4.Enemy, GO.VisibleEntityGroup)

P4.Enemy.prototype.lethal = true

P4.Enemy.prototype.destruct = function()
{
	P4.Enemy.count -= 1
}

P4.Enemy.prototype.process = function()
{
	P4.Enemy.superproto.process.call(this)

	this.y += this.v * GO.delta
	
	if (this.y - 200 > GO.Screen.height
		|| this.x > GO.Screen.width
		|| this.x < 0) {

		this.dead = true
	}
}

