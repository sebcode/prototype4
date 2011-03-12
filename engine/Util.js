
GO.Util = {}

GO.Util.extend = function(subclass, superclass)
{
	function Dummy(){}
	Dummy.prototype = superclass.prototype
	subclass.prototype = new Dummy()
	subclass.prototype.constructor = subclass
	subclass.superclass = superclass
	subclass.superproto = superclass.prototype
}

GO.Util.createColorRGB = function(scheme)
{
	var cr = scheme.r
	var cg = scheme.g
	var cb = scheme.b

	if (cr == -1) {
		var r = Math.floor(Math.random() * 255)
	} else {
		var r = cr
	}

	if (cg == -1) {
		var g = Math.floor(Math.random() * 255)
	} else {
		var g = cg
	}

	if (cb == -1) {
		var b = Math.floor(Math.random() * 255)
	} else {
		var b = cb
	}

	return { r: r, g: g, b: b }
}

GO.Util.createColor = function(scheme)
{
	var rgb = GO.Util.createColorRGB(scheme)

	return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")"
}

