(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"animate":2,"extend":4,"mbl":5,"sanitize-elements":11,"tiny-emitter":12}],2:[function(require,module,exports){
var raf = require('raf-component')

var Animate = function(frame, fps) {
  if (!(this instanceof Animate)) {
    return new Animate(frame, fps)
  }

  this.id = null
  this.now = null
  this.then = +new Date
  this.delta = null
  this.frame = frame
  this.interval = 1000 / fps
  this.start = this.start.bind(this)

  this.start()
}

Animate.prototype.pause = function() {
  raf.cancel(this.id)
  this.id = null  
  return this
}

Animate.prototype.resume = function() {
  if (this.id == null) {
    this.start()
  }

  return this
}

Animate.prototype.start = function() {
  this.id = raf(this.start)

  this.now = +new Date
  this.delta = this.now - this.then

  if (this.delta < this.interval) {
    return
  }

  this.frame()
  this.then = this.now - (this.delta % this.interval)
}

module.exports = Animate

},{"raf-component":3}],3:[function(require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],4:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],5:[function(require,module,exports){
/**
 * MBL ~ Mad Basic Loader
 *
 * Functionality: 
 * - Loads images, fires callbacks & triggers events
 */

var extend   = require('mextend')
var trigger  = require('etrig')
var sanitize = require('sanitize-elements')
var Emitter  = require('tiny-emitter')

module.exports = function($images, opts) {

  var events = new Emitter()

  var options = extend({
    'sourceAttr' : 'data-src',
    'sequential' : false,
    'bgMode'     : false,
    'success'    : function(i, elem) { }, // called on each image successful load
    'error'      : function(i, elem) { }, // called on each image error
    'begin'      : function() { }, // called once loading begins
    'complete'   : function() { } // called once all images have completed (error/success agnostic)
  }, opts)

  var data = {
    'total' : 0,
    'count' : 0
  }

  var init = function() {
    if ($images = sanitize($images, true)) {
      data.total = $images.length
    } else {
      console.warn('no images here!')
      return
    }
    kickoff()
  }

  var kickoff = function() {
    begin()
    if (data.total <= 0) {
      complete()
    } else {
      if (!options.sequential) {
        flood()
      } else {
        sequential()
      }
    }
  }

  var flood = function() {
    for (var i = 0; i < data.total; i++) {
      loadImage(i)
    }
  }

  var sequential = function() {
    loadImage(0)
  }

  // Should split up this function someday
  var loadImage = function(index) {

    if (index < data.total) {

      var elem   = $images[index]
      var src    = elem.getAttribute(options.sourceAttr)
      var next   = index + 1
      var img    = new Image() // create new image
      var loaded = false

      // behavior on image load
      img.addEventListener('load', function() {
        if (!loaded) {
          loaded = true
          if (options.bgMode || elem.hasAttribute('data-bgmode')) {
            elem.style.backgroundImage = "url('" + src + "')"
          } else {
            $images[index].setAttribute('src', src)
          }
          elem.setAttribute('data-mbl-complete', '')
          success(index, elem)
          if (options.sequential) {
            loadImage(next)
          }
          data.count++ 
          if (data.count >= data.total) {
            complete()
          }
        }
      })

      // behavior on image error
      img.addEventListener('error', function() {
        if (!loaded) {
          loaded = true
          error(index, elem)
          if (options.sequential) {
            loadImage(next)
          }
          data.count++ 
          if (data.count >= data.total) {
            complete()
          }
        }
      })

      // set img src
      img.src = src

      if (img.complete) {
        etrig(img, 'load') // ensure even cached image triggers load
      }

    }

  }

  var success = function(index, elem) {
    options.success(index, elem)
    events.emit('success', {
      'element' : elem,
      'index' : index
    })
  }

  var error = function(index, elem) {
    options.error(index, elem)
    events.emit('error', {
      'element' : elem,
      'index' : index
    })
  }

  var begin = function() {
    options.begin()
    events.emit('begin')
  }

  var complete = function() {
    options.complete()
    events.emit('complete')
  }

  return {
    'start' : init,
    'on' : function(ev, cb){ events.on(ev, cb) }
  }

}
},{"etrig":6,"mextend":7,"sanitize-elements":11,"tiny-emitter":12}],6:[function(require,module,exports){
/**
 * @param target is any DOM Element or EventTarget
 * @param type Event type (i.e. 'click')
 */
module.exports = function(target, type) {
  var doc = document;
  if (doc.createEvent) {
    var event = new Event(type);
    target.dispatchEvent(event);
  } else {
    var event = doc.createEventObject();
    target.fireEvent('on' + type, event);
  }
};
},{}],7:[function(require,module,exports){
var mextend = function(target, source){
  target = target || {};
  for (var prop in source) {
    if (typeof source[prop] === 'object' && !source[prop] instanceof Array) {
      target[prop] = mextend(target[prop], source[prop]);
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
};

module.exports = mextend;
},{}],8:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],9:[function(require,module,exports){
(function(root) {
  function isElement(value) {
    return (value && value.nodeType === 1) &&
           (value && typeof value == 'object') &&
           (Object.prototype.toString.call(value).indexOf('Element') > -1);
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = isElement;
    }
    exports.isElement = isElement;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return isElement;
    });
  } else {
    root.isElement = isElement;
  }

})(this);

},{}],10:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],11:[function(require,module,exports){
/**
 * @param $elements are dom element(s)
 * @param wrap true/false if single elements should be wrapped as array
 */
var isElement = require('is-element')
var isObject  = require('is-object')
var isArray   = require('is-array')

module.exports = function($elements, wrap) {
  
  if ($elements === undefined
      || !isObject($elements)
      || $elements === window
      || $elements === document) {
    return false
  }

  var $sanitized = []

  if (isElement($elements)) {
    if (wrap) {
      $sanitized.push($elements)
    } else {
      return $elements
    }
  } 
  else if (isArray($elements)) {
    $elements.forEach(function(value) {
      if (isElement(value)) {
        $sanitized.push(value)
      }
    })
  }
  else if (isObject($elements)) {
    Object.keys($elements).forEach(function(key) {
      if (isElement($elements[key])) {
        $sanitized.push($elements[key])
      }
    })
  } 

  if (!$sanitized.length) {
    return false
  }

  return $sanitized

}
},{"is-array":8,"is-element":9,"is-object":10}],12:[function(require,module,exports){
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});
    
    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });
    
    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    var fn = function () {
      self.off(name, fn);
      callback.apply(ctx, arguments);
    };
    
    return this.on(name, fn, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    
    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];
    
    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback) liveEvents.push(evts[i]);
      }
    }
    
    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length) 
      ? e[name] = liveEvents
      : delete e[name];
    
    return this;
  }
};

module.exports = E;

},{}]},{},[1])(1)
});