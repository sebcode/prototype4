
P4.Starfield = function(scene, conf)
{
	var i

	P4.Starfield.superproto.constructor.call(this)

	this.scene = scene
	this.velocity = conf.velocity
	this.alpha = conf.alpha
	this.distance = conf.distance
	this.stars = new GO.LinkedList

	for (i = 0; i < conf.count; i += 1) {
		this.stars.push({
			x: this.getRandX()
			,y: Math.random() * GO.Screen.height
			,v: this.velocity + (Math.random() * 50)
		})
	}
}

P4.Starfield.create = function(layer)
{
	var vm = 3
		,cm = 1.5

	layer.push(new P4.Starfield(this, {
		velocity: 100 * vm
		,count: 10 * cm
		,alpha: 0.7
	}))

	layer.push(new P4.Starfield(this, {
		velocity: 50 * vm
		,count: 15 * cm
		,alpha: 0.6
	}))
	
	layer.push(new P4.Starfield(this, {
		velocity: 10 * vm
		,count: 10 * cm
		,alpha: 0.4
	}))
}

GO.Util.extend(P4.Starfield, GO.VisibleEntity)

P4.Starfield.prototype.getRandX = function()
{
	return -100 + (Math.random() * (GO.Screen.width + 200))
}

P4.Starfield.prototype.process = function()
{
	var v = this.velocity
		//,offsetx = - (((GO.Screen.width / 2) - this.scene.player.x) / this.distance)
		,offsetx = 0

	GO.ctx.beginPath()
	GO.ctx.fillStyle = 'rgba(150,150,150,'+ this.alpha +')'

	this.stars.foreach(function(e) {
		e.y += GO.delta * e.v

		if (e.y > GO.Screen.height) {
			e.x = this.getRandX()
			e.y = - (Math.random() * 100)
			e.v = this.velocity + (Math.random() * 50)
		}

		GO.ctx.moveTo(offsetx + e.x, e.y)
		GO.ctx.arc(offsetx + e.x, e.y, 1, 0, Math.PI * 2, true)
	}, this)

	GO.ctx.closePath()
	GO.ctx.fill()
}

