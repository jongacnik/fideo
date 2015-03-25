var animate  = require('animate')
var extend   = require('extend')
var Emitter  = require('tiny-emitter')
var sanitize = require('sanitize-elements')
var mbl      = require('mbl')

module.exports = function($element, opts) {

  /**
   * Preliminaries...
   */

  var events = new Emitter()

  var options = extend(true, {
    'columns' : 12,
    'framerate' : 24,
    'length' : 5,
    'loop' : false,
    'autoplay' : false
  }, opts) // <- extend defaults with options passed in

  var _data = {
    'loop' : null,
    'progress' : 0,
    'totalFrame' : 0,
    'totalRow' : 0,
    'totalCol' : 0,
    'currentFrame' : 1,
    'currentCol' : 0,
    'currentRow' : 0,
  }

  // Sanitize element
  if ($element = sanitize($element, true)) {
    $element = $element[0] // only pass one element to fideo
  } else {
    console.error('Please pass an element!')
    return
  }

  // Extend options with those from data-attributes
  var furtherExtendOptions = function() {

    // data-fideo-[option] options
    options.columns   = $element.getAttribute('data-fideo-columns') || options.columns
    options.framerate = $element.getAttribute('data-fideo-framerate') || options.framerate
    options.length    = $element.getAttribute('data-fideo-length') || options.length
    options.loop      = $element.hasAttribute('data-fideo-loop') || options.loop
    options.autoplay  = $element.hasAttribute('data-fideo-autoplay') || options.autoplay

    // data-fideo-setup options
    var setup
    if (setup = $element.getAttribute('data-fideo-setup')) {
      try {
        setup = JSON.parse(setup)
        options = extend(true, options, setup)
      } catch (error) {
        console.warn('Error with data-fideo-setup JSON formatting. Ignoring these options.')
      }
    }

  }() // <- execute

  // Quality control...
  if (!options.columns || !options.framerate || !options.length) {
    console.error('Make sure you\'ve defined number of columns, framerate, and animation length!')
    return
  }

  if (!$element.getAttribute('data-fideo')) {
    console.error('Hey you need a frame sheet src!')
    return
  }

  /**
   * Whew, we can fideo!
   */

  var init = function() {

    // Interpret details
    _data.totalFrame = options.framerate * options.length
    _data.totalRow   = _data.totalFrame / options.columns
    _data.totalCol   = options.columns

    // Set initial styles
    $element.style.backgroundPosition = '0 0'
    $element.style.backgroundSize = (_data.totalCol * 100) + '% ' + (_data.totalRow * 100) + '%';

    // Init loop
    _data.loop = animate(next, options.framerate)
    _data.loop.pause()

    // Begin load
    var videoLoad = mbl($element, {
      'sourceAttr' : 'data-fideo',
      'bgMode' : true,
      'complete' : loaded // <- run loaded method once framesheet loads
    })
    videoLoad.start()

    // Emit ready, ew yucky timeout hack
    setTimeout(function() {
      events.emit('ready', {
        'element' : $element
      })
    }, 0)

  }

  var next = function() {

    // Get background xPos and yPos
    var xPos = -100 * _data.currentCol
    var yPos = -100 * _data.currentRow

    // Set styles
    $element.style.backgroundPosition = xPos + '% ' + yPos + '%'
   
    // Update data
    _data.currentRow = _data.currentFrame % _data.totalCol == 0 ? _data.currentRow + 1 : _data.currentRow
    _data.currentCol = _data.currentFrame % _data.totalCol
    _data.currentFrame++

    // Handle loop or end
    if (_data.currentFrame > _data.totalFrame) {
      if (options.loop) {
        loop()
      } else {
        end()
      }
    }

    // Emit progress
    progress()

  }

  var loaded = function() {
    if (options.autoplay) _data.loop.resume()
    events.emit('load', {
      'element' : $element
    })
  }

  var rewind = function() {
    _data.currentFrame = 1;
    _data.currentCol = 0;
    _data.currentRow = 0;
    $element.style.backgroundPosition = '0 0'
  }

  var end = function() {
    _data.loop.pause()
    events.emit('ended', {
      'element' : $element
    })
  }

  var loop = function() {
    rewind()
    events.emit('loop', {
      'element'  : $element,
    })
  }

  var play = function() {
    _data.loop.resume()
    events.emit('play', {
      'element' : $element
    })
  }

  var pause = function() {
    _data.loop.pause()
    events.emit('pause', {
      'element' : $element
    })
  }

  var progress = function() {
    _data.progress = getProgress()
    events.emit('progress', {
      'element'  : $element,
      'progress' : _data.progress
    })
  }

  var getProgress = function() {
    return _data.currentFrame / _data.totalFrame
  }

  var destroy = function() {
    rewind()
    pause()
  }

  init() // <- init!
  
  /**
   * Public methods
   */

  return {
    'play' : play,
    'pause' : pause,
    'rewind' : rewind,
    'getProgress' : getProgress,
    'next' : next,
    'destroy' : destroy,
    'element' : $element,
    'on' : function(ev, cb){ events.on(ev, cb) }
  }

}