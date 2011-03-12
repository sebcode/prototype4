
GO.Transition = function() { }

GO.Transition.prototype.a = 0
GO.Transition.prototype.v = 5
GO.Transition.prototype.ondone = false
GO.Transition.prototype.isdone = false

GO.Transition.prototype.process = function()
{
	this.a += GO.delta * this.v
	if (this.a > 1) {
		this.a = 1
	}

	GO.ctx.fillStyle = 'rgba(0,0,0,'+ this.a +')'
	GO.ctx.fillRect(0, 0, GO.Screen.width, GO.Screen.height)
	
	if (this.a >= 1) {
		this.a = 1
		this.isdone = true
		if (this.ondone) {
			this.ondone.fn.call(this.ondone.ctx)
		}
		return false
	}
}

