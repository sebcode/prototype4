
GO.LinkedList = function() { }

GO.LinkedList.prototype.first = null
GO.LinkedList.prototype.last = null
GO.LinkedList.prototype.count = 0

GO.LinkedList.prototype.destruct = function()
{
	this.clear()
}

GO.LinkedList.prototype.unshift = function(item)
{
	if (this.first) {
		this.first.llprev = item
		item.llnext = this.first
		this.first = item
	} else {
		this.first = item
		this.last = item
	}
	
	this.count++
	GO.entityCount++
	return item
}

GO.LinkedList.prototype.push = function(item)
{
	if (this.last) {
		this.last.llnext = item
		item.llprev = this.last
		this.last = item
	} else {
		this.first = item
		this.last = item
	}
	
	this.count++
	GO.entityCount++
	return item
}

GO.LinkedList.prototype.del = function(item)
{
	if (this.first == item) {
		this.first = item.llnext
	}

	if (this.last == item) {
		this.last = item.llprev
	}

	if (item.llprev) {
		if (item.llnext) {
			item.llprev.llnext = item.llnext
		} else {
			item.llprev.llnext = null
		}
	}

	if (item.llnext) {
		if (item.llprev) {
			item.llnext.llprev = item.llprev
		} else {
			item.llnext.llprev = null
		}
	}

	if (item.destruct) {
		item.destruct()
	}

	this.count--
	GO.entityCount--
	delete item
}

GO.LinkedList.prototype.get = function(i)
{
	if (!this.first) {
		return false
	}

	var item = this.first
	var index = 0

	do {
		if (index == i) {
			return item
		}

		index++
		item = item.llnext
	} while (item)

	return false
}

GO.LinkedList.prototype.clear = function()
{
	this.foreach(function() {
		return false
	})
}

GO.LinkedList.prototype.foreach = function(func, ctx)
{
	if (!ctx) {
		ctx = this
	}

	if (!this.first) {
		return
	}

	var item = this.first

	do {
		var ret = func.call(ctx, item)

		if (ret === true) {
			return
		} else if (ret === false) {
			var delitem = item
			item = item.llnext
			this.del(delitem)
		} else {
			item = item.llnext
		}
	} while (item)
}

