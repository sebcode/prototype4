
GO.Timer = function(interval, ontick, ctx)
{
	this.interval = interval
	this.ontick = ontick
	this.ctx = ctx
	this.oldTime = GO.now
}

GO.Timer.prototype.reset = function()
{
	this.oldTime = GO.now
}

GO.Timer.prototype.process = function()
{
	if (this.pause) {
		return
	}

	if (!this.oldTime) {
		this.oldTime = GO.now
	}

	if (!this.ontick) {
		return
	}

	if (GO.now >= this.oldTime + this.interval) {
		this.oldTime = GO.now
		return this.ontick.call(this.ctx)
	}
}

