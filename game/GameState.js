import { P4 } from './P4.js'

P4.FormatDiff = function(diff)
{
	switch (Number(diff)) {
		case 0: return 'easy'
		case 1: return 'normal'
		case 2: return 'hard'
		case 3: return 'ultra'
		default: return 'easy'
	}
}

P4.DiffFromText = function(diff)
{
	switch (diff) {
		case 'easy': return 0
		case 'normal': return 1
		case 'hard': return 2
		case 'ultra': return 3
		default: return false
	}
}

/*
 * Persistent game state (savegame + highscores). Backed by localStorage;
 * falls back to an in-memory object when storage is unavailable (private
 * mode, file:// in some browsers).
 */
P4.GameState = { }

P4.GameState.storageKey = 'p4.GameState'

P4.GameState.init = function()
{
	P4.GameState.data = { }

	var state

	try {
		state = window.localStorage.getItem(P4.GameState.storageKey)
	} catch (e) {
		return
	}

	if (!state) {
		return
	}

	try {
		state = JSON.parse(state)
	} catch (e) {
		return
	}

	if (!state) {
		return
	}

	P4.GameState.data = state
}

P4.GameState.store = function(key, val)
{
	P4.GameState.data[key] = val

	P4.GameState.commit()
}

P4.GameState.commit = function()
{
	try {
		window.localStorage.setItem(P4.GameState.storageKey,
			JSON.stringify(P4.GameState.data))
	} catch (e) {
	}
}

P4.GameState.get = function(key)
{
	if (!P4.GameState.data.hasOwnProperty(key)) {
		return false
	}

	return P4.GameState.data[key]
}
