var animate  = require('animate')
var extend   = require('extend')
var Emitter  = require('tiny-emitter')
var sanitize = require('sanitize-elements')
var mbl      = require('mbl')

module.exports = function($element, opts) {

  var events = new Emitter()

  var options = extend(true, {
    'columns' : 12,
    'framerate' : 24,
    'length' : 5,
    'loop' : false,
    'autoplay' : false
  }, opts)

  var _data = {
    'loop'   : null,
    'image'  : null,
    'progress' : 0,
    'totalFrame' : 0,
    'totalRow' : 0,
    'totalCol' : 0,
    'currentFrame' : 1,
    'currentCol' : 0,
    'currentRow' : 0,
  }

  if (!options.columns || !options.framerate || !options.length) {
    console.error('Please check your options for number of columns, framerate, and animation length')
    return
  }

  if ($element = sanitize($element, true)) {
    $element = $element[0] // only pass one element to function
  } else {
    console.error('Please pass an element')
    return
  }

  var init = function() {

    // Interpret details
    _data.totalFrame = options.framerate * options.length
    _data.totalRow   = _data.totalFrame / options.columns
    _data.totalCol   = options.columns

    // Set initial styles
    _data.image = $element.getAttribute('data-fideo')
    if (!_data.image) {
      console.error('Hey you need a frame sheet!')
      return
    }
    $element.style.backgroundPosition = '0 0'
    $element.style.backgroundSize = (_data.totalCol * 100) + '% ' + (_data.totalRow * 100) + '%';

    // Init loop
    _data.loop = animate(next, options.framerate)
    _data.loop.pause()

    // Begin load
    var videoLoad = mbl($element, {
      'sourceAttr' : 'data-fideo',
      'bgMode' : true,
      'complete' : loaded
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
    _data.progress = progress()
    events.emit('progress', {
      'element'  : $element,
      'progress' : _data.progress
    })

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
    return _data.currentFrame / _data.totalFrame
  }

  var destroy = function() {
    rewind()
    pause()
  }

  init()
  
  return {
    'play' : play,
    'pause' : pause,
    'rewind' : rewind,
    'progress' : progress,
    'next' : next,
    'destroy' : destroy,
    'element' : $element,
    'on' : function(ev, cb){ events.on(ev, cb) }
  }

}