import { GO } from './GO.js'

/*
 * Asset preloader with a progress bar.
 *
 * Everything the game needs before the first frame - the webfont and the
 * sound samples - is fetched here while a bar is drawn straight onto the
 * game canvas. The bar is deliberately text free: the font is one of the
 * things being loaded, so there is nothing to write it in yet.
 *
 * A task is a function(done). It must call done() exactly once, on success
 * or failure alike - a 404 costs a sample, not the whole start. On top of
 * that the whole run is capped by timeout: pending fetches keep going in
 * the background and pop in when they arrive.
 */
GO.Loader = { }

GO.Loader.timeout = 15000

GO.Loader.barWidth = 200
GO.Loader.barHeight = 6

GO.Loader.run = function(tasks, onDone)
{
	var self = this

	this.total = tasks.length
	this.loaded = 0
	this.done = false

	if (!this.total) {
		onDone()
		return
	}

	var timer
		,finish = function() {
			if (self.done) {
				return
			}

			self.done = true
			window.clearTimeout(timer)
			onDone()
		}

	var step = function() {
		self.loaded += 1

		if (self.loaded >= self.total) {
			finish()
		}
	}

	/* redraw every frame rather than only on progress, so the bar
	   survives a window resize while loading */
	var draw = function() {
		if (self.done) {
			return
		}

		self.draw()
		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
	timer = window.setTimeout(finish, this.timeout)

	for (var i = 0; i < tasks.length; i += 1) {
		tasks[i](step)
	}
}

GO.Loader.draw = function()
{
	var ctx = GO.ctx
		,w = this.barWidth
		,h = this.barHeight
		,x = Math.round((GO.Screen.width - w) / 2)
		,y = Math.round((GO.Screen.height - h) / 2)
		,p = this.total ? this.loaded / this.total : 1

	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, GO.Screen.width, GO.Screen.height)

	ctx.strokeStyle = '#666'
	ctx.lineWidth = 1

	/* the stroke straddles the path, so the half pixel keeps it crisp */
	ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1)

	ctx.fillStyle = '#fff'
	ctx.fillRect(x, y, Math.round(w * p), h)
}
