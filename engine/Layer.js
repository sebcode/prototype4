
GO.Layer = function() { }

GO.Util.extend(GO.Layer, GO.LinkedList)

GO.Layer.prototype.process = function()
{
	if (!this.first) {
		return
	}

	var entity = this.first

	this.foreach(function(e) {
		if (e.dead) {
			return false
		}
		
		if (e.process) {
			if (e.process() === false) {
				return false
			}
		}

		if (GO.wireFrame) {
			GO.ctx.fillStyle = 'red'
			GO.ctx.beginPath()
			GO.ctx.arc(e.x, e.y, 3, 0, Math.PI * 2, true)
			GO.ctx.fill()
			
			GO.ctx.beginPath()
			GO.ctx.strokeStyle = 'red'
			GO.ctx.lineWidth = 3
			GO.ctx.arc(e.x, e.y, e.cr, 0, Math.PI * 2, true)
			GO.ctx.stroke()
		}
	})
}

