
P4.EnemyStar = function()
{
	P4.EnemyStar.superproto.constructor.call(this)

	this.collidesWith = [ P4.Player ]
}

GO.Util.extend(P4.EnemyStar, P4.Enemy)

P4.EnemyStar.prototype.cr = 30
P4.EnemyStar.prototype.lethal = true
P4.EnemyStar.prototype.damage = 3
P4.EnemyStar.prototype.v = 200

P4.EnemyStar.prototype.process = function()
{
	P4.EnemyStar.superproto.process.call(this)

	this.y += this.v * GO.delta

	this.explode(this.x, this.y, 5)
}

P4.EnemyStar.prototype.explode = function(x, y, v)
{
	var p = new GO.Particles
	p.colorscheme = { r: -1, g: 1, b: 0 }
	p.x = x
	p.y = y
	p.lifetime = 1 / 10
	p.v = v
	p.vr = 100
	p.explode(2)
	this.push(p)
}

