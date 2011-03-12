
GO.Scene = function()
{
	this.layers = { }
}

GO.Scene.prototype.paused = false

GO.Scene.prototype.pause = function()
{
	this.paused = true
}

GO.Scene.prototype.resume = function()
{
	this.paused = false
}

GO.Scene.prototype.togglePause = function()
{
	this.paused = ! this.paused
}

GO.Scene.prototype.clear = function()
{
	GO.ctx.clearRect(0, 0, GO.Screen.width, GO.Screen.height)
}

GO.Scene.prototype.process = function()
{
	if (this.paused) {
		return false
	}

	for (i in this.layers) {
		if (this.layers.hasOwnProperty(i)) {
			this.layers[i].process()
		}
	}

	/* collision detection */

	var d = 0

	this.foreachEntity(function(e) {
		if (!e.collidesWith) {
			return
		}

		for (var i = 0, l = e.collidesWith.length; i < l; i += 1) {
			var entityClass = e.collidesWith[i]

			this.foreachEntity(function(e, e2, entityClass) {
				if (!entityClass) {
					return
				}

				if (e instanceof entityClass == false) {
					return
				}

				if (e.oncollision && e.checkCollision && (d = e.checkCollision(e2))) {
					e.oncollision(e2, d)

					if (e2.oncollision) {
						e2.oncollision(e, d)
					}
				}
			}, this, e, entityClass)
		}
	}, this)

	return true
}

GO.Scene.prototype.foreachEntity = function(func, ctx, arg1, arg2, arg3)
{
	for (i in this.layers) {
		if (!this.layers.hasOwnProperty(i)) {
			continue
		}

		var layer = this.layers[i]

		layer.foreach(function(e) {
			func.call(ctx, e, arg1, arg2, arg3)
		}, ctx)
	}
}

