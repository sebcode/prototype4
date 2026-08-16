import { GO } from './GO.js'

/*
 * Sound playback via the Web Audio API.
 *
 * The samples are decoded once at startup and kept as AudioBuffers; every
 * play() spawns a fresh BufferSource, so the same sample can overlap with
 * itself without any voice management.
 *
 * Browsers keep the AudioContext suspended until the user interacts with
 * the page, so the context is resumed on the first click or keypress.
 * Sounds triggered before that are dropped silently.
 */

GO.Sound = { }

/*
 * Where the samples live. The game hands over a name -> URL map (see
 * game/sounds.js) so a bundler can content hash them; without one we fall
 * back to plain paths and the built in name list.
 */
GO.Sound.path = 'sounds/'
GO.Sound.ext = '.mp3'
GO.Sound.urls = false
GO.Sound.volume = 0.5
GO.Sound.enabled = true

GO.Sound.names = [
	'appear'
	,'boss_explode'
	,'boss_fire'
	,'boss_move'
	,'enemystar'
	,'explode1'
	,'game_over'
	,'getready'
	,'hit'
	,'intro'
	,'level_start'
	,'menu_click'
	,'menu_close'
	,'menu_open'
	,'minis'
	,'player_explode'
	,'player_hit'
	,'powerup_canon'
	,'powerup_life'
	,'select'
]

GO.Sound.buffers = { }

GO.Sound.setUrls = function(urls)
{
	this.urls = urls
	this.names = Object.keys(urls)
}

GO.Sound.url = function(name)
{
	if (this.urls && this.urls[name]) {
		return this.urls[name]
	}

	return this.path + name + this.ext
}

GO.Sound.init = function()
{
	var Ctx = window.AudioContext || window.webkitAudioContext

	if (!Ctx) {
		this.enabled = false
		return
	}

	try {
		this.ctx = new Ctx
	} catch (e) {
		this.enabled = false
		return
	}

	this.gain = this.ctx.createGain()
	this.gain.gain.value = this.volume
	this.gain.connect(this.ctx.destination)

	var unlock = function() {
		GO.Sound.unlock()
	}

	addEventListener('mousedown', unlock, true)
	addEventListener('keydown', unlock, true)
	addEventListener('touchstart', unlock, true)
}

/*
 * One loader task per sample, for GO.Loader. Returns nothing when audio is
 * unavailable, so the loader does not wait on samples that can never play.
 */
GO.Sound.loadTasks = function()
{
	var tasks = []

	if (!this.enabled || !this.ctx) {
		return tasks
	}

	for (var i = 0; i < this.names.length; i += 1) {
		tasks.push(this.loadTask(this.names[i]))
	}

	return tasks
}

GO.Sound.loadTask = function(name)
{
	var self = this

	return function(done) {
		self.load(name, done)
	}
}

GO.Sound.unlock = function()
{
	if (this.ctx && this.ctx.state == 'suspended') {
		this.ctx.resume()
	}
}

/*
 * Fetch and decode one sample. done() is called either way: a sample that
 * cannot be loaded just stays silent, it must not hold up the loader.
 */
GO.Sound.load = function(name, done)
{
	if (!done) {
		done = function() { }
	}

	var req = new XMLHttpRequest

	req.open('GET', this.url(name), true)
	req.responseType = 'arraybuffer'

	req.onerror = done
	req.onabort = done

	req.onload = function() {
		if (req.status && req.status >= 400) {
			done()
			return
		}

		GO.Sound.ctx.decodeAudioData(req.response, function(buffer) {
			GO.Sound.buffers[name] = buffer
			done()
		}, function() {
			/* undecodable sample, stays silent */
			done()
		})
	}

	try {
		req.send()
	} catch (e) {
		/* file:// without a server, stays silent */
		done()
	}
}

GO.Sound.play = function(name)
{
	if (!this.enabled || !this.ctx) {
		return
	}

	var buffer = this.buffers[name]

	if (!buffer) {
		return
	}

	if (this.ctx.state == 'suspended') {
		return
	}

	var src = this.ctx.createBufferSource()
	src.buffer = buffer
	src.connect(this.gain)
	src.start(0)
}

GO.Sound.setVolume = function(v)
{
	this.volume = v

	if (this.gain) {
		this.gain.gain.value = v
	}
}
