
GO.VisibleEntity = function() { }

GO.VisibleEntity.prototype.checkCollision = function(s)
{
	var o1 = this
	var o2 = s

	var d = Math.sqrt(Math.pow(o1.x - o2.x, 2) + Math.pow(o1.y - o2.y, 2))

	var o1cr = o1.cr ? o1.cr : 1
	var o2cr = o2.cr ? o2.cr : 1

	if ((o1cr + o2cr) >= d) {
		return d
	}

	return false
}

