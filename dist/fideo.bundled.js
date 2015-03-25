(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.fideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var animate=require("animate"),extend=require("extend"),Emitter=require("tiny-emitter"),sanitize=require("sanitize-elements"),mbl=require("mbl");module.exports=function(e,t){var r=new Emitter,o=extend(!0,{columns:12,framerate:24,length:5,loop:!1,autoplay:!1},t),n={loop:null,progress:0,totalFrame:0,totalRow:0,totalCol:0,currentFrame:1,currentCol:0,currentRow:0};if(!(e=sanitize(e,!0)))return void console.error("Please pass an element!");if(e=e[0],o.columns=e.getAttribute("data-fideo-columns")||o.columns,o.framerate=e.getAttribute("data-fideo-framerate")||o.framerate,o.length=e.getAttribute("data-fideo-length")||o.length,o.loop=e.hasAttribute("loop")||o.loop,o.autoplay=e.hasAttribute("autoplay")||o.autoplay,!o.columns||!o.framerate||!o.length)return void console.error("Please make sure you've defined number of columns, framerate, and animation length!");if(!e.getAttribute("data-fideo"))return void console.error("Hey you need a frame sheet!");var a=function(){n.totalFrame=o.framerate*o.length,n.totalRow=n.totalFrame/o.columns,n.totalCol=o.columns,e.style.backgroundPosition="0 0",e.style.backgroundSize=100*n.totalCol+"% "+100*n.totalRow+"%",n.loop=animate(l,o.framerate),n.loop.pause();var t=mbl(e,{sourceAttr:"data-fideo",bgMode:!0,complete:u});t.start(),setTimeout(function(){r.emit("ready",{element:e})},0)},l=function(){var t=-100*n.currentCol,a=-100*n.currentRow;e.style.backgroundPosition=t+"% "+a+"%",n.currentRow=n.currentFrame%n.totalCol==0?n.currentRow+1:n.currentRow,n.currentCol=n.currentFrame%n.totalCol,n.currentFrame++,n.currentFrame>n.totalFrame&&(o.loop?s():m()),n.progress=d(),r.emit("progress",{element:e,progress:n.progress})},u=function(){o.autoplay&&n.loop.resume(),r.emit("load",{element:e})},i=function(){n.currentFrame=1,n.currentCol=0,n.currentRow=0,e.style.backgroundPosition="0 0"},m=function(){n.loop.pause(),r.emit("ended",{element:e})},s=function(){i(),r.emit("loop",{element:e})},c=function(){n.loop.resume(),r.emit("play",{element:e})},p=function(){n.loop.pause(),r.emit("pause",{element:e})},d=function(){return n.currentFrame/n.totalFrame},f=function(){i(),p()};return a(),{play:c,pause:p,rewind:i,progress:d,next:l,destroy:f,element:e,on:function(e,t){r.on(e,t)}}};
},{"animate":2,"extend":4,"mbl":5,"sanitize-elements":11,"tiny-emitter":12}],2:[function(require,module,exports){
var raf=require("raf-component"),Animate=function(t,i){return this instanceof Animate?(this.id=null,this.now=null,this.then=+new Date,this.delta=null,this.frame=t,this.interval=1e3/i,this.start=this.start.bind(this),void this.start()):new Animate(t,i)};Animate.prototype.pause=function(){return raf.cancel(this.id),this.id=null,this},Animate.prototype.resume=function(){return null==this.id&&this.start(),this},Animate.prototype.start=function(){this.id=raf(this.start),this.now=+new Date,this.delta=this.now-this.then,this.delta<this.interval||(this.frame(),this.then=this.now-this.delta%this.interval)},module.exports=Animate;


},{"raf-component":3}],3:[function(require,module,exports){
function fallback(e){var n=(new Date).getTime(),a=Math.max(0,16-(n-prev)),i=setTimeout(e,a);return prev=n,i}exports=module.exports=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||fallback;var prev=(new Date).getTime(),cancel=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame||window.clearTimeout;exports.cancel=function(e){cancel.call(window,e)};


},{}],4:[function(require,module,exports){
var hasOwn=Object.prototype.hasOwnProperty,toString=Object.prototype.toString,undefined,isPlainObject=function(t){"use strict";if(!t||"[object Object]"!==toString.call(t))return!1;var r=hasOwn.call(t,"constructor"),n=t.constructor&&t.constructor.prototype&&hasOwn.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!r&&!n)return!1;var o;for(o in t);return o===undefined||hasOwn.call(t,o)};module.exports=function t(){"use strict";var r,n,o,e,c,a,i=arguments[0],s=1,u=arguments.length,l=!1;for("boolean"==typeof i?(l=i,i=arguments[1]||{},s=2):("object"!=typeof i&&"function"!=typeof i||null==i)&&(i={});u>s;++s)if(r=arguments[s],null!=r)for(n in r)o=i[n],e=r[n],i!==e&&(l&&e&&(isPlainObject(e)||(c=Array.isArray(e)))?(c?(c=!1,a=o&&Array.isArray(o)?o:[]):a=o&&isPlainObject(o)?o:{},i[n]=t(l,a,e)):e!==undefined&&(i[n]=e));return i};


},{}],5:[function(require,module,exports){
var extend=require("mextend"),trigger=require("etrig"),sanitize=require("sanitize-elements"),Emitter=require("tiny-emitter");module.exports=function(t,e){var n=new Emitter,i=extend({sourceAttr:"data-src",sequential:!1,bgMode:!1,success:function(){},error:function(){},begin:function(){},complete:function(){}},e),o={total:0,count:0},r=function(){return(t=sanitize(t,!0))?(o.total=t.length,void u()):void console.warn("no images here!")},u=function(){d(),o.total<=0?f():i.sequential?a():c()},c=function(){for(var t=0;t<o.total;t++)s(t)},a=function(){s(0)},s=function(e){if(e<o.total){var n=t[e],r=n.getAttribute(i.sourceAttr),u=e+1,c=new Image,a=!1;c.addEventListener("load",function(){a||(a=!0,i.bgMode||n.hasAttribute("data-bgmode")?n.style.backgroundImage="url('"+r+"')":t[e].setAttribute("src",r),n.setAttribute("data-mbl-complete",""),l(e,n),i.sequential&&s(u),o.count++,o.count>=o.total&&f())}),c.addEventListener("error",function(){a||(a=!0,m(e,n),i.sequential&&s(u),o.count++,o.count>=o.total&&f())}),c.src=r,c.complete&&etrig(c,"load")}},l=function(t,e){i.success(t,e),n.emit("success",{element:e,index:t})},m=function(t,e){i.error(t,e),n.emit("error",{element:e,index:t})},d=function(){i.begin(),n.emit("begin")},f=function(){i.complete(),n.emit("complete")};return{start:r,on:function(t,e){n.on(t,e)}}};


},{"etrig":6,"mextend":7,"sanitize-elements":11,"tiny-emitter":12}],6:[function(require,module,exports){
module.exports=function(e,t){var n=document;if(n.createEvent){var v=new Event(t);e.dispatchEvent(v)}else{var v=n.createEventObject();e.fireEvent("on"+t,v)}};


},{}],7:[function(require,module,exports){
var mextend=function(e,n){e=e||{};for(var t in n)e[t]="object"==typeof n[t]&&!n[t]instanceof Array?mextend(e[t],n[t]):n[t];return e};module.exports=mextend;


},{}],8:[function(require,module,exports){
var isArray=Array.isArray,str=Object.prototype.toString;module.exports=isArray||function(r){return!!r&&"[object Array]"==str.call(r)};


},{}],9:[function(require,module,exports){
!function(e){function t(e){return e&&1===e.nodeType&&e&&"object"==typeof e&&Object.prototype.toString.call(e).indexOf("Element")>-1}"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=t),exports.isElement=t):"function"==typeof define&&define.amd?define([],function(){return t}):e.isElement=t}(this);


},{}],10:[function(require,module,exports){
"use strict";module.exports=function(t){return"object"==typeof t&&null!==t};


},{}],11:[function(require,module,exports){
var isElement=require("is-element"),isObject=require("is-object"),isArray=require("is-array");module.exports=function(e,i){if(void 0===e||!isObject(e)||e===window||e===document)return!1;var r=[];if(isElement(e)){if(!i)return e;r.push(e)}else isArray(e)?e.forEach(function(e){isElement(e)&&r.push(e)}):isObject(e)&&Object.keys(e).forEach(function(i){isElement(e[i])&&r.push(e[i])});return r.length?r:!1};


},{"is-array":8,"is-element":9,"is-object":10}],12:[function(require,module,exports){
function E(){}E.prototype={on:function(t,n,e){var i=this.e||(this.e={});return(i[t]||(i[t]=[])).push({fn:n,ctx:e}),this},once:function(t,n,e){var i=this,r=function(){i.off(t,r),n.apply(e,arguments)};return this.on(t,r,e)},emit:function(t){var n=[].slice.call(arguments,1),e=((this.e||(this.e={}))[t]||[]).slice(),i=0,r=e.length;for(i;r>i;i++)e[i].fn.apply(e[i].ctx,n);return this},off:function(t,n){var e=this.e||(this.e={}),i=e[t],r=[];if(i&&n)for(var s=0,o=i.length;o>s;s++)i[s].fn!==n&&r.push(i[s]);return r.length?e[t]=r:delete e[t],this}},module.exports=E;


},{}]},{},[1])(1)
});