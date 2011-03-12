
GO.Event = { }
GO.Event.Mouse = { }
GO.Event.Keyboard = { }

GO.Event.init = function()
{
	this.Mouse.x = -1
	this.Mouse.y = -1
	this.Mouse.leftDown = false

	this.frameReset()

	addEventListener('mousemove', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Mouse.x = e.clientX - GO.canvas.offsetLeft
		GO.Event.Mouse.y = e.clientY - GO.canvas.offsetTop
	}, true)

	addEventListener('click', function(e) {
		if (!GO.pause
			&& GO.Event.Mouse.x > 0
			&& GO.Event.Mouse.y > 0
			&& GO.Event.Mouse.x < GO.Screen.width
			&& GO.Event.Mouse.y < GO.Screen.height) {

			GO.Event.Mouse.click = true
		}
	}, true)

	addEventListener('mousedown', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Mouse.leftDown = true
	}, true)

	addEventListener('mouseup', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Mouse.leftDown = false
	}, true)

	addEventListener('keypress', function(e) {
		if (GO.pause) {
			return
		}

		GO.Event.Keyboard.code = e.keyCode || e.charCode || 0
		GO.Event.Keyboard.chr = String.fromCharCode(GO.Event.Keyboard.code)
		GO.Event.Keyboard.chrLower = GO.Event.Keyboard.chr.toLowerCase()
	}, true)
	
	addEventListener('keydown', function(e) {
		if (GO.pause) {
			return
		}

		var c = e.keyCode || e.charCode || 0
		if (c == 27) {
			GO.Event.Keyboard.code = c
			GO.Event.Keyboard.chr = ''
			GO.Event.Keyboard.chrLower = ''
		}
	}, true)
}

GO.Event.frameReset = function()
{
	this.Mouse.frameReset()
	this.Keyboard.frameReset()
}

GO.Event.Mouse.frameReset = function()
{
	this.click = false
}

GO.Event.Keyboard.frameReset = function()
{
	this.code = 0
	this.chr = ''
	this.chrLower = ''
}

