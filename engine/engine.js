/*
 * The engine is one unit built around the GO namespace: every module below
 * hangs its part off GO rather than exporting it. Importing this file pulls
 * in the whole engine and hands back the assembled namespace, so game code
 * needs a single import instead of tracking which engine file defines what.
 *
 * Modules that another one needs at evaluation time (GO.Util.extend and the
 * base classes) import each other directly, so the order here is not load
 * bearing.
 */

import { GO } from './GO.js'

import './Util.js'
import './LinkedList.js'
import './Event.js'
import './Sound.js'
import './Loader.js'
import './Timer.js'
import './Transition.js'
import './Scene.js'
import './Layer.js'
import './VisibleEntity.js'
import './VisibleEntityGroup.js'
import './Particle.js'
import './Particles.js'

export { GO }
