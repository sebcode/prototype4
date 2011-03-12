
GO.VisibleEntityGroup = function() { }

GO.Util.extend(GO.VisibleEntityGroup, GO.LinkedList)

GO.VisibleEntityGroup.prototype.checkCollision = GO.VisibleEntity.prototype.checkCollision

GO.VisibleEntityGroup.prototype.process = function()
{
	if (!this.first) {
		return
	}

	this.foreach(function(e) {
		if (e.dead) {
			return false
		}
		
		if (e.process) {
			if (e.process() === false) {
				return false
			}
		}
	})
}

