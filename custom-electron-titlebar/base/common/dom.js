"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) _get__("__createBinding")(result, mod, k);
  _get__("__setModuleDefault")(result, mod);
  return result;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hide = exports.show = exports.join = exports.$ = exports.prepend = exports.append = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = exports.EventType = exports.isHTMLElement = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createStyleSheet = exports.findParentWithClass = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.StandardWindow = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getDomNodeZoomLevel = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.addDisposableNonBubblingMouseOutListener = exports.addStandardDisposableListener = exports.addDisposableListener = exports.toggleClass = exports.removeClasses = exports.removeClass = exports.addClasses = exports.addClass = exports.hasClass = exports.ModifierKeyEmitter = exports.isInDOM = exports.removeNode = exports.clearNode = void 0;
exports.animate = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = exports.getElementsByTagName = exports.removeTabIndexAndUpdateFocus = void 0;
const browser = _get__("__importStar")(require("../browser/browser"));
const event_1 = require("../browser/event");
const keyboardEvent_1 = require("../browser/keyboardEvent");
const mouseEvent_1 = require("../browser/mouseEvent");
const async_1 = require("../common/async");
const event_2 = require("../common/event");
const lifecycle_1 = require("../common/lifecycle");
const platform = _get__("__importStar")(require("../common/platform"));
const arrays_1 = require("../common/arrays");
function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
exports.clearNode = _get__("clearNode");
function removeNode(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
exports.removeNode = _get__("removeNode");
function isInDOM(node) {
  while (node) {
    if (node === document.body) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
exports.isInDOM = _get__("isInDOM");
class ModifierKeyEmitter extends _get__("event_2").Emitter {
  constructor() {
    super();
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
    _get__("addDisposableListener")(window, 'keydown', e => {
      if (e.defaultPrevented) {
        return;
      }
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      // If Alt-key keydown event is repeated, ignore it #112347
      // Only known to be necessary for Alt-Key at the moment #115810
      if (event.keyCode === 6 /* KeyCode.Alt */ && e.repeat) {
        return;
      }
      if (e.altKey && !this._keyStatus.altKey) {
        this._keyStatus.lastKeyPressed = 'alt';
      } else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyPressed = 'ctrl';
      } else if (e.metaKey && !this._keyStatus.metaKey) {
        this._keyStatus.lastKeyPressed = 'meta';
      } else if (e.shiftKey && !this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyPressed = 'shift';
      } else if (event.keyCode !== 6 /* KeyCode.Alt */) {
        this._keyStatus.lastKeyPressed = undefined;
      } else {
        return;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyPressed) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true);
    _get__("addDisposableListener")(window, 'keyup', e => {
      if (e.defaultPrevented) {
        return;
      }
      if (!e.altKey && this._keyStatus.altKey) {
        this._keyStatus.lastKeyReleased = 'alt';
      } else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyReleased = 'ctrl';
      } else if (!e.metaKey && this._keyStatus.metaKey) {
        this._keyStatus.lastKeyReleased = 'meta';
      } else if (!e.shiftKey && this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyReleased = 'shift';
      } else {
        this._keyStatus.lastKeyReleased = undefined;
      }
      if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
        this._keyStatus.lastKeyPressed = undefined;
      }
      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.metaKey = e.metaKey;
      this._keyStatus.shiftKey = e.shiftKey;
      if (this._keyStatus.lastKeyReleased) {
        this._keyStatus.event = e;
        this.fire(this._keyStatus);
      }
    }, true);
    _get__("addDisposableListener")(document.body, 'mousedown', () => {
      this._keyStatus.lastKeyPressed = undefined;
    }, true);
    _get__("addDisposableListener")(document.body, 'mouseup', () => {
      this._keyStatus.lastKeyPressed = undefined;
    }, true);
    _get__("addDisposableListener")(document.body, 'mousemove', e => {
      if (e.buttons) {
        this._keyStatus.lastKeyPressed = undefined;
      }
    }, true);
    _get__("addDisposableListener")(window, 'blur', () => {
      this.resetKeyStatus();
    });
  }
  get keyStatus() {
    return this._keyStatus;
  }
  get isModifierPressed() {
    return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
  }
  /**
   * Allows to explicitly reset the key status based on more knowledge (#109062)
   */
  resetKeyStatus() {
    this.doResetKeyStatus();
    this.fire(this._keyStatus);
  }
  doResetKeyStatus() {
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    };
  }
  static getInstance() {
    if (!_get__("ModifierKeyEmitter").instance) {
      _get__("ModifierKeyEmitter").instance = new (_get__("ModifierKeyEmitter"))();
    }
    return _get__("ModifierKeyEmitter").instance;
  }
  dispose() {
    super.dispose();
  }
}
exports.ModifierKeyEmitter = _get__("ModifierKeyEmitter");
const _manualClassList = new class {
  _findClassName(node, className) {
    const classes = node.className;
    if (!classes) {
      this._lastStart = -1;
      return;
    }
    className = className.trim();
    const classesLen = classes.length;
    const classLen = className.length;
    if (classLen === 0) {
      this._lastStart = -1;
      return;
    }
    if (classesLen < classLen) {
      this._lastStart = -1;
      return;
    }
    if (classes === className) {
      this._lastStart = 0;
      this._lastEnd = classesLen;
      return;
    }
    let idx = -1;
    let idxEnd;
    while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
      idxEnd = idx + classLen;
      // a class that is followed by another class
      if ((idx === 0 || classes.charCodeAt(idx - 1) === 32 /* CharCode.Space */) && classes.charCodeAt(idxEnd) === 32 /* CharCode.Space */) {
        this._lastStart = idx;
        this._lastEnd = idxEnd + 1;
        return;
      }
      // last class
      if (idx > 0 && classes.charCodeAt(idx - 1) === 32 /* CharCode.Space */ && idxEnd === classesLen) {
        this._lastStart = idx - 1;
        this._lastEnd = idxEnd;
        return;
      }
      // equal - duplicate of cmp above
      if (idx === 0 && idxEnd === classesLen) {
        this._lastStart = 0;
        this._lastEnd = idxEnd;
        return;
      }
    }
    this._lastStart = -1;
  }
  hasClass(node, className) {
    this._findClassName(node, className);
    return this._lastStart !== -1;
  }
  addClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }
  addClass(node, className) {
    if (!node.className) {
      // doesn't have it for sure
      node.className = className;
    } else {
      this._findClassName(node, className); // see if it's already there
      if (this._lastStart === -1) {
        node.className = node.className + ' ' + className;
      }
    }
  }
  removeClass(node, className) {
    this._findClassName(node, className);
    if (this._lastStart === -1) {
      // Prevent styles invalidation if not necessary
    } else {
      node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd || 0);
    }
  }
  removeClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }
  toggleClass(node, className, shouldHaveIt) {
    this._findClassName(node, className);
    if (this._lastStart !== -1 && (shouldHaveIt === undefined || !shouldHaveIt)) {
      this.removeClass(node, className);
    }
    if (this._lastStart === -1 && (shouldHaveIt === undefined || shouldHaveIt)) {
      this.addClass(node, className);
    }
  }
}();
const _nativeClassList = new class {
  hasClass(node, className) {
    return Boolean(className) && node.classList && node.classList.contains(className);
  }
  addClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }
  addClass(node, className) {
    if (className && node.classList) {
      node.classList.add(className);
    }
  }
  removeClass(node, className) {
    if (className && node.classList) {
      node.classList.remove(className);
    }
  }
  removeClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }
  toggleClass(node, className, shouldHaveIt) {
    if (node.classList) {
      node.classList.toggle(className, shouldHaveIt);
    }
  }
}();
// In IE11 there is only partial support for `classList` which makes us keep our
// custom implementation. Otherwise use the native implementation, see: http://caniuse.com/#search=classlist
const _classList = _get__("browser").isIE ? _get__("_manualClassList") : _get__("_nativeClassList");
exports.hasClass = _get__("_classList").hasClass.bind(_get__("_classList"));
exports.addClass = _get__("_classList").addClass.bind(_get__("_classList"));
exports.addClasses = _get__("_classList").addClasses.bind(_get__("_classList"));
exports.removeClass = _get__("_classList").removeClass.bind(_get__("_classList"));
exports.removeClasses = _get__("_classList").removeClasses.bind(_get__("_classList"));
exports.toggleClass = _get__("_classList").toggleClass.bind(_get__("_classList"));
class DomListener {
  constructor(node, type, handler, options) {
    this._node = node;
    this._type = type;
    this._handler = handler;
    this._options = options || false;
    this._node.addEventListener(this._type, this._handler, this._options);
  }
  dispose() {
    if (!this._handler) {
      // Already disposed
      return;
    }
    this._node.removeEventListener(this._type, this._handler, this._options);
    // Prevent leakers from holding on to the dom or handler func
    this._node = null;
    this._handler = null;
  }
}
function addDisposableListener(node, type, handler, useCaptureOrOptions) {
  return new (_get__("DomListener"))(node, type, handler, useCaptureOrOptions);
}
exports.addDisposableListener = _get__("addDisposableListener");
function _wrapAsStandardMouseEvent(handler) {
  return function (e) {
    return handler(new (_get__("mouseEvent_1").StandardMouseEvent)(e));
  };
}
function _wrapAsStandardKeyboardEvent(handler) {
  return function (e) {
    return handler(new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e));
  };
}
const addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
  let wrapHandler = handler;
  if (type === 'click' || type === 'mousedown') {
    wrapHandler = _get__("_wrapAsStandardMouseEvent")(handler);
  } else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
    wrapHandler = _get__("_wrapAsStandardKeyboardEvent")(handler);
  }
  return _get__("addDisposableListener")(node, type, wrapHandler, useCapture);
};
exports.addStandardDisposableListener = _get__("addStandardDisposableListener");
function addDisposableNonBubblingMouseOutListener(node, handler) {
  return _get__("addDisposableListener")(node, 'mouseout', e => {
    // Mouse out bubbles, so this is an attempt to ignore faux mouse outs coming from children elements
    let toElement = e.relatedTarget || e.target;
    while (toElement && toElement !== node) {
      toElement = toElement.parentNode;
    }
    if (toElement === node) {
      return;
    }
    handler(e);
  });
}
exports.addDisposableNonBubblingMouseOutListener = _get__("addDisposableNonBubblingMouseOutListener");
let _animationFrame = null;
function doRequestAnimationFrame(callback) {
  if (!_get__("_animationFrame")) {
    const emulatedRequestAnimationFrame = callback => {
      return setTimeout(() => callback(new Date().getTime()), 0);
    };
    _assign__("_animationFrame", self.requestAnimationFrame || self.msRequestAnimationFrame || self.webkitRequestAnimationFrame || self.mozRequestAnimationFrame || self.oRequestAnimationFrame || emulatedRequestAnimationFrame);
  }
  return _get__("_animationFrame").call(self, callback);
}
class AnimationFrameQueueItem {
  constructor(runner, priority = 0) {
    this._runner = runner;
    this.priority = priority;
    this._canceled = false;
  }
  dispose() {
    this._canceled = true;
  }
  execute() {
    if (this._canceled) {
      return;
    }
    try {
      this._runner();
    } catch (e) {
      console.error(e);
    }
  }
  // Sort by priority (largest to lowest)
  static sort(a, b) {
    return b.priority - a.priority;
  }
}
(function () {
  /**
   * The runners scheduled at the next animation frame
   */
  let NEXT_QUEUE = [];
  /**
   * The runners scheduled at the current animation frame
   */
  let CURRENT_QUEUE = null;
  /**
   * A flag to keep track if the native requestAnimationFrame was already called
   */
  let animFrameRequested = false;
  /**
   * A flag to indicate if currently handling a native requestAnimationFrame callback
   */
  let inAnimationFrameRunner = false;
  const animationFrameRunner = () => {
    animFrameRequested = false;
    CURRENT_QUEUE = NEXT_QUEUE;
    NEXT_QUEUE = [];
    inAnimationFrameRunner = true;
    while (CURRENT_QUEUE.length > 0) {
      CURRENT_QUEUE.sort(_get__("AnimationFrameQueueItem").sort);
      const top = CURRENT_QUEUE.shift();
      top.execute();
    }
    inAnimationFrameRunner = false;
  };
  exports.scheduleAtNextAnimationFrame = (runner, priority = 0) => {
    const item = new (_get__("AnimationFrameQueueItem"))(runner, priority);
    NEXT_QUEUE.push(item);
    if (!animFrameRequested) {
      animFrameRequested = true;
      _get__("doRequestAnimationFrame")(animationFrameRunner);
    }
    return item;
  };
  exports.runAtThisOrScheduleAtNextAnimationFrame = (runner, priority) => {
    if (inAnimationFrameRunner) {
      const item = new (_get__("AnimationFrameQueueItem"))(runner, priority);
      CURRENT_QUEUE.push(item);
      return item;
    } else {
      return (0, exports.scheduleAtNextAnimationFrame)(runner, priority);
    }
  };
})();
function measure(callback) {
  return (0, exports.scheduleAtNextAnimationFrame)(callback, 10000 /* must be early */);
}
exports.measure = _get__("measure");
function modify(callback) {
  return (0, exports.scheduleAtNextAnimationFrame)(callback, -10000 /* must be late */);
}
exports.modify = _get__("modify");
const MINIMUM_TIME_MS = 16;
const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
  return currentEvent;
};
class TimeoutThrottledDomListener extends _get__("lifecycle_1").Disposable {
  constructor(node, type, handler, eventMerger = _get__("DEFAULT_EVENT_MERGER"), minimumTimeMs = _get__("MINIMUM_TIME_MS")) {
    super();
    let lastEvent = null;
    let lastHandlerTime = 0;
    const timeout = this._register(new (_get__("async_1").TimeoutTimer)());
    const invokeHandler = () => {
      lastHandlerTime = new Date().getTime();
      handler(lastEvent);
      lastEvent = null;
    };
    this._register(_get__("addDisposableListener")(node, type, e => {
      lastEvent = eventMerger(lastEvent, e);
      const elapsedTime = new Date().getTime() - lastHandlerTime;
      if (elapsedTime >= minimumTimeMs) {
        timeout.cancel();
        invokeHandler();
      } else {
        timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
      }
    }));
  }
}
function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
  return new (_get__("TimeoutThrottledDomListener"))(node, type, handler, eventMerger, minimumTimeMs);
}
exports.addDisposableThrottledListener = _get__("addDisposableThrottledListener");
function getComputedStyle(el) {
  return document.defaultView.getComputedStyle(el, null);
}
exports.getComputedStyle = _get__("getComputedStyle");
// Adapted from WinJS
// Converts a CSS positioning string for the specified element to pixels.
const convertToPixels = function () {
  return function (element, value) {
    return parseFloat(value) || 0;
  };
}();
function getDimension(element, cssPropertyName, jsPropertyName) {
  const computedStyle = _get__("getComputedStyle")(element);
  let value = '0';
  if (computedStyle) {
    if (computedStyle.getPropertyValue) {
      value = computedStyle.getPropertyValue(cssPropertyName);
    } else {
      // IE8
      value = computedStyle.getAttribute(jsPropertyName);
    }
  }
  return _get__("convertToPixels")(element, value);
}
function getClientArea(element) {
  // Try with DOM clientWidth / clientHeight
  if (element !== document.body) {
    return new (_get__("Dimension"))(element.clientWidth, element.clientHeight);
  }
  // Try innerWidth / innerHeight
  if (window.innerWidth && window.innerHeight) {
    return new (_get__("Dimension"))(window.innerWidth, window.innerHeight);
  }
  // Try with document.body.clientWidth / document.body.clientHeight
  if (document.body && document.body.clientWidth && document.body.clientHeight) {
    return new (_get__("Dimension"))(document.body.clientWidth, document.body.clientHeight);
  }
  // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
  if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight) {
    return new (_get__("Dimension"))(document.documentElement.clientWidth, document.documentElement.clientHeight);
  }
  throw new Error('Unable to figure out browser width and height');
}
exports.getClientArea = _get__("getClientArea");
/**
 * Returns the effective zoom on a given element before window zoom level is applied
 */
function getDomNodeZoomLevel(domNode) {
  let testElement = domNode;
  let zoom = 1.0;
  do {
    const elementZoomLevel = _get__("getComputedStyle")(testElement).zoom;
    if (elementZoomLevel !== null && elementZoomLevel !== undefined && elementZoomLevel !== '1') {
      zoom *= elementZoomLevel;
    }
    testElement = testElement.parentElement;
  } while (testElement !== null && testElement !== document.documentElement);
  return zoom;
}
exports.getDomNodeZoomLevel = _get__("getDomNodeZoomLevel");
const sizeUtils = {
  getBorderLeftWidth: function (element) {
    return _get__("getDimension")(element, 'border-left-width', 'borderLeftWidth');
  },
  getBorderRightWidth: function (element) {
    return _get__("getDimension")(element, 'border-right-width', 'borderRightWidth');
  },
  getBorderTopWidth: function (element) {
    return _get__("getDimension")(element, 'border-top-width', 'borderTopWidth');
  },
  getBorderBottomWidth: function (element) {
    return _get__("getDimension")(element, 'border-bottom-width', 'borderBottomWidth');
  },
  getPaddingLeft: function (element) {
    return _get__("getDimension")(element, 'padding-left', 'paddingLeft');
  },
  getPaddingRight: function (element) {
    return _get__("getDimension")(element, 'padding-right', 'paddingRight');
  },
  getPaddingTop: function (element) {
    return _get__("getDimension")(element, 'padding-top', 'paddingTop');
  },
  getPaddingBottom: function (element) {
    return _get__("getDimension")(element, 'padding-bottom', 'paddingBottom');
  },
  getMarginLeft: function (element) {
    return _get__("getDimension")(element, 'margin-left', 'marginLeft');
  },
  getMarginTop: function (element) {
    return _get__("getDimension")(element, 'margin-top', 'marginTop');
  },
  getMarginRight: function (element) {
    return _get__("getDimension")(element, 'margin-right', 'marginRight');
  },
  getMarginBottom: function (element) {
    return _get__("getDimension")(element, 'margin-bottom', 'marginBottom');
  },
  __commaSentinel: false
};
// ----------------------------------------------------------------------------------------
// Position & Dimension
class Dimension {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  static equals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.width === b.width && a.height === b.height;
  }
}
exports.Dimension = _get__("Dimension");
function getTopLeftOffset(element) {
  // Adapted from WinJS.Utilities.getPosition
  // and added borders to the mix
  let offsetParent = element.offsetParent;
  let top = element.offsetTop;
  let left = element.offsetLeft;
  while ((element = element.parentNode) !== null && element !== document.body && element !== document.documentElement) {
    top -= element.scrollTop;
    const c = _get__("getComputedStyle")(element);
    if (c) {
      left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
    }
    if (element === offsetParent) {
      left += _get__("sizeUtils").getBorderLeftWidth(element);
      top += _get__("sizeUtils").getBorderTopWidth(element);
      top += element.offsetTop;
      left += element.offsetLeft;
      offsetParent = element.offsetParent;
    }
  }
  return {
    left,
    top
  };
}
exports.getTopLeftOffset = _get__("getTopLeftOffset");
function size(element, width, height) {
  if (typeof width === 'number') {
    element.style.width = `${width}px`;
  }
  if (typeof height === 'number') {
    element.style.height = `${height}px`;
  }
}
exports.size = _get__("size");
function position(element, top, right, bottom, left, position = 'absolute') {
  if (typeof top === 'number') {
    element.style.top = `${top}px`;
  }
  if (typeof right === 'number') {
    element.style.right = `${right}px`;
  }
  if (typeof bottom === 'number') {
    element.style.bottom = `${bottom}px`;
  }
  if (typeof left === 'number') {
    element.style.left = `${left}px`;
  }
  element.style.position = position;
}
exports.position = _get__("position");
/**
 * Returns the position of a dom node relative to the entire page.
 */
function getDomNodePagePosition(domNode) {
  const bb = domNode.getBoundingClientRect();
  return {
    left: bb.left + exports.StandardWindow.scrollX,
    top: bb.top + exports.StandardWindow.scrollY,
    width: bb.width,
    height: bb.height
  };
}
exports.getDomNodePagePosition = _get__("getDomNodePagePosition");
exports.StandardWindow = new class {
  get scrollX() {
    if (typeof window.scrollX === 'number') {
      // modern browsers
      return window.scrollX;
    } else {
      return document.body.scrollLeft + document.documentElement.scrollLeft;
    }
  }
  get scrollY() {
    if (typeof window.scrollY === 'number') {
      // modern browsers
      return window.scrollY;
    } else {
      return document.body.scrollTop + document.documentElement.scrollTop;
    }
  }
}();
// Adapted from WinJS
// Gets the width of the element, including margins.
function getTotalWidth(element) {
  const margin = _get__("sizeUtils").getMarginLeft(element) + _get__("sizeUtils").getMarginRight(element);
  return element.offsetWidth + margin;
}
exports.getTotalWidth = _get__("getTotalWidth");
function getContentWidth(element) {
  const border = _get__("sizeUtils").getBorderLeftWidth(element) + _get__("sizeUtils").getBorderRightWidth(element);
  const padding = _get__("sizeUtils").getPaddingLeft(element) + _get__("sizeUtils").getPaddingRight(element);
  return element.offsetWidth - border - padding;
}
exports.getContentWidth = _get__("getContentWidth");
function getTotalScrollWidth(element) {
  const margin = _get__("sizeUtils").getMarginLeft(element) + _get__("sizeUtils").getMarginRight(element);
  return element.scrollWidth + margin;
}
exports.getTotalScrollWidth = _get__("getTotalScrollWidth");
// Adapted from WinJS
// Gets the height of the content of the specified element. The content height does not include borders or padding.
function getContentHeight(element) {
  const border = _get__("sizeUtils").getBorderTopWidth(element) + _get__("sizeUtils").getBorderBottomWidth(element);
  const padding = _get__("sizeUtils").getPaddingTop(element) + _get__("sizeUtils").getPaddingBottom(element);
  return element.offsetHeight - border - padding;
}
exports.getContentHeight = _get__("getContentHeight");
// Adapted from WinJS
// Gets the height of the element, including its margins.
function getTotalHeight(element) {
  const margin = _get__("sizeUtils").getMarginTop(element) + _get__("sizeUtils").getMarginBottom(element);
  return element.offsetHeight + margin;
}
exports.getTotalHeight = _get__("getTotalHeight");
// Gets the left coordinate of the specified element relative to the specified parent.
function getRelativeLeft(element, parent) {
  if (element === null) {
    return 0;
  }
  const elementPosition = _get__("getTopLeftOffset")(element);
  const parentPosition = _get__("getTopLeftOffset")(parent);
  return elementPosition.left - parentPosition.left;
}
function getLargestChildWidth(parent, children) {
  const childWidths = children.map(child => {
    return Math.max(_get__("getTotalScrollWidth")(child), _get__("getTotalWidth")(child)) + _get__("getRelativeLeft")(child, parent) || 0;
  });
  const maxWidth = Math.max(...childWidths);
  return maxWidth;
}
exports.getLargestChildWidth = _get__("getLargestChildWidth");
// ----------------------------------------------------------------------------------------
function isAncestor(testChild, testAncestor) {
  while (testChild) {
    if (testChild === testAncestor) {
      return true;
    }
    testChild = testChild.parentNode;
  }
  return false;
}
exports.isAncestor = _get__("isAncestor");
function findParentWithClass(node, clazz, stopAtClazzOrNode) {
  while (node) {
    if ((0, exports.hasClass)(node, clazz)) {
      return node;
    }
    if (stopAtClazzOrNode) {
      if (typeof stopAtClazzOrNode === 'string') {
        if ((0, exports.hasClass)(node, stopAtClazzOrNode)) {
          return null;
        }
      } else {
        if (node === stopAtClazzOrNode) {
          return null;
        }
      }
    }
    node = node.parentNode;
  }
  return null;
}
exports.findParentWithClass = _get__("findParentWithClass");
function createStyleSheet(container = document.getElementsByTagName('head')[0]) {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.media = 'screen';
  container.appendChild(style);
  return style;
}
exports.createStyleSheet = _get__("createStyleSheet");
let _sharedStyleSheet = null;
function getSharedStyleSheet() {
  if (!_get__("_sharedStyleSheet")) {
    _assign__("_sharedStyleSheet", _get__("createStyleSheet")());
  }
  return _get__("_sharedStyleSheet");
}
function getDynamicStyleSheetRules(style) {
  if (style && style.sheet && style.sheet.rules) {
    // Chrome, IE
    return style.sheet.rules;
  }
  if (style && style.sheet && style.sheet.cssRules) {
    // FF
    return style.sheet.cssRules;
  }
  return [];
}
function createCSSRule(selector, cssText, style = _get__("getSharedStyleSheet")()) {
  if (!style || !cssText) {
    return;
  }
  style.sheet.insertRule(selector + '{' + cssText + '}', 0);
}
exports.createCSSRule = _get__("createCSSRule");
function removeCSSRulesContainingSelector(ruleName, style = _get__("getSharedStyleSheet")()) {
  if (!style) {
    return;
  }
  const rules = _get__("getDynamicStyleSheetRules")(style);
  const toDelete = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.selectorText.indexOf(ruleName) !== -1) {
      toDelete.push(i);
    }
  }
  for (let i = toDelete.length - 1; i >= 0; i--) {
    style.sheet.deleteRule(toDelete[i]);
  }
}
exports.removeCSSRulesContainingSelector = _get__("removeCSSRulesContainingSelector");
function isHTMLElement(o) {
  if (typeof HTMLElement === 'object') {
    return o instanceof HTMLElement;
  }
  return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}
exports.isHTMLElement = _get__("isHTMLElement");
exports.EventType = {
  // Mouse
  CLICK: 'click',
  AUXCLICK: 'auxclick',
  DBLCLICK: 'dblclick',
  MOUSE_UP: 'mouseup',
  MOUSE_DOWN: 'mousedown',
  MOUSE_OVER: 'mouseover',
  MOUSE_MOVE: 'mousemove',
  MOUSE_OUT: 'mouseout',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  MOUSE_WHEEL: 'wheel',
  POINTER_UP: 'pointerup',
  POINTER_DOWN: 'pointerdown',
  POINTER_MOVE: 'pointermove',
  POINTER_LEAVE: 'pointerleave',
  CONTEXT_MENU: 'contextmenu',
  WHEEL: 'wheel',
  // Keyboard
  KEY_DOWN: 'keydown',
  KEY_PRESS: 'keypress',
  KEY_UP: 'keyup',
  // HTML Document
  LOAD: 'load',
  BEFORE_UNLOAD: 'beforeunload',
  UNLOAD: 'unload',
  PAGE_SHOW: 'pageshow',
  PAGE_HIDE: 'pagehide',
  ABORT: 'abort',
  ERROR: 'error',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  FULLSCREEN_CHANGE: 'fullscreenchange',
  WK_FULLSCREEN_CHANGE: 'webkitfullscreenchange',
  // Form
  SELECT: 'select',
  CHANGE: 'change',
  SUBMIT: 'submit',
  RESET: 'reset',
  FOCUS: 'focus',
  FOCUS_IN: 'focusin',
  FOCUS_OUT: 'focusout',
  BLUR: 'blur',
  INPUT: 'input',
  // Local Storage
  STORAGE: 'storage',
  // Drag
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_ENTER: 'dragenter',
  DRAG_LEAVE: 'dragleave',
  DRAG_OVER: 'dragover',
  DROP: 'drop',
  DRAG_END: 'dragend',
  // Animation
  ANIMATION_START: _get__("browser").isWebKit ? 'webkitAnimationStart' : 'animationstart',
  ANIMATION_END: _get__("browser").isWebKit ? 'webkitAnimationEnd' : 'animationend',
  ANIMATION_ITERATION: _get__("browser").isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
};
exports.EventHelper = {
  stop: function (e, cancelBubble) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      // IE8
      e.returnValue = false;
    }
    if (cancelBubble) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        // IE8
        e.cancelBubble = true;
      }
    }
  }
};
function saveParentsScrollTop(node) {
  const r = [];
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    r[i] = node.scrollTop;
    node = node.parentNode;
  }
  return r;
}
exports.saveParentsScrollTop = _get__("saveParentsScrollTop");
function restoreParentsScrollTop(node, state) {
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    if (node.scrollTop !== state[i]) {
      node.scrollTop = state[i];
    }
    node = node.parentNode;
  }
}
exports.restoreParentsScrollTop = _get__("restoreParentsScrollTop");
class FocusTracker {
  constructor(element) {
    this._onDidFocus = new (_get__("event_2").Emitter)();
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = new (_get__("event_2").Emitter)();
    this.onDidBlur = this._onDidBlur.event;
    this.disposables = [];
    let hasFocus = _get__("isAncestor")(document.activeElement, element);
    let loosingFocus = false;
    const onFocus = () => {
      loosingFocus = false;
      if (!hasFocus) {
        hasFocus = true;
        this._onDidFocus.fire();
      }
    };
    const onBlur = () => {
      if (hasFocus) {
        loosingFocus = true;
        window.setTimeout(() => {
          if (loosingFocus) {
            loosingFocus = false;
            hasFocus = false;
            this._onDidBlur.fire();
          }
        }, 0);
      }
    };
    (0, _get__("event_1").domEvent)(element, exports.EventType.FOCUS, true)(onFocus, null, this.disposables);
    (0, _get__("event_1").domEvent)(element, exports.EventType.BLUR, true)(onBlur, null, this.disposables);
  }
  dispose() {
    this.disposables = (0, _get__("lifecycle_1").dispose)(this.disposables);
    this._onDidFocus.dispose();
    this._onDidBlur.dispose();
  }
}
function trackFocus(element) {
  return new (_get__("FocusTracker"))(element);
}
exports.trackFocus = _get__("trackFocus");
function append(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
  return children[children.length - 1];
}
exports.append = _get__("append");
function prepend(parent, child) {
  parent.insertBefore(child, parent.firstChild);
  return child;
}
exports.prepend = _get__("prepend");
const SELECTOR_REGEX = /([\w\\-]+)?(#([\w\\-]+))?((.([\w\\-]+))*)/;
function $(description, attrs, ...children) {
  const match = _get__("SELECTOR_REGEX").exec(description);
  if (!match) {
    throw new Error('Bad use of emmet');
  }
  const result = document.createElement(match[1] || 'div');
  if (match[3]) {
    result.id = match[3];
  }
  if (match[4]) {
    result.className = match[4].replace(/\./g, ' ').trim();
  }
  attrs = attrs || {};
  Object.keys(attrs).forEach(name => {
    const value = attrs[name];
    if (/^on\w+$/.test(name)) {
      result[name] = value;
    } else if (name === 'selected') {
      if (value) {
        result.setAttribute(name, 'true');
      }
    } else {
      result.setAttribute(name, value);
    }
  });
  (0, _get__("arrays_1").coalesce)(children).forEach(child => {
    if (child instanceof Node) {
      result.appendChild(child);
    } else {
      result.appendChild(document.createTextNode(child));
    }
  });
  return result;
}
exports.$ = _get__("$");
function join(nodes, separator) {
  const result = [];
  nodes.forEach((node, index) => {
    if (index > 0) {
      if (separator instanceof Node) {
        result.push(separator.cloneNode());
      } else {
        result.push(document.createTextNode(separator));
      }
    }
    result.push(node);
  });
  return result;
}
exports.join = _get__("join");
function show(...elements) {
  for (const element of elements) {
    if (element) {
      element.style.display = '';
      element.removeAttribute('aria-hidden');
    }
  }
}
exports.show = _get__("show");
function hide(...elements) {
  for (const element of elements) {
    if (element) {
      element.style.display = 'none';
      element.setAttribute('aria-hidden', 'true');
    }
  }
}
exports.hide = _get__("hide");
function findParentWithAttribute(node, attribute) {
  while (node) {
    if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}
function removeTabIndexAndUpdateFocus(node) {
  if (!node || !node.hasAttribute('tabIndex')) {
    return;
  }
  // If we are the currently focused element and tabIndex is removed,
  // standard DOM behavior is to move focus to the <body> element. We
  // typically never want that, rather put focus to the closest element
  // in the hierarchy of the parent DOM nodes.
  if (document.activeElement === node) {
    const parentFocusable = _get__("findParentWithAttribute")(node.parentElement, 'tabIndex');
    if (parentFocusable) {
      parentFocusable.focus();
    }
  }
  node.removeAttribute('tabindex');
}
exports.removeTabIndexAndUpdateFocus = _get__("removeTabIndexAndUpdateFocus");
function getElementsByTagName(tag) {
  return Array.prototype.slice.call(document.getElementsByTagName(tag), 0);
}
exports.getElementsByTagName = _get__("getElementsByTagName");
function finalHandler(fn) {
  return e => {
    e.preventDefault();
    e.stopPropagation();
    fn(e);
  };
}
exports.finalHandler = _get__("finalHandler");
function domContentLoaded() {
  return new Promise(resolve => {
    const readyState = document.readyState;
    if (readyState === 'complete' || document && document.body !== null) {
      _get__("platform").setImmediate(resolve);
    } else {
      window.addEventListener('DOMContentLoaded', resolve, false);
    }
  });
}
exports.domContentLoaded = _get__("domContentLoaded");
/**
 * Find a value usable for a dom node size such that the likelihood that it would be
 * displayed with constant screen pixels size is as high as possible.
 *
 * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
 * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
 * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
 */
function computeScreenAwareSize(cssPx) {
  const screenPx = window.devicePixelRatio * cssPx;
  return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
}
exports.computeScreenAwareSize = _get__("computeScreenAwareSize");
/**
 * See https://github.com/Microsoft/monaco-editor/issues/601
 * To protect against malicious code in the linked site, particularly phishing attempts,
 * the window.opener should be set to null to prevent the linked site from having access
 * to change the location of the current page.
 * See https://mathiasbynens.github.io/rel-noopener/
 */
function windowOpenNoOpener(url) {
  if (_get__("platform").isNative || _get__("browser").isEdgeWebView) {
    // In VSCode, window.open() always returns null...
    // The same is true for a WebView (see https://github.com/Microsoft/monaco-editor/issues/628)
    window.open(url);
  } else {
    const newTab = window.open();
    if (newTab) {
      newTab.opener = null;
      newTab.location.href = url;
    }
  }
}
exports.windowOpenNoOpener = _get__("windowOpenNoOpener");
function animate(fn) {
  const step = () => {
    fn();
    stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
  };
  let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
  return (0, _get__("lifecycle_1").toDisposable)(() => stepDisposable.dispose());
}
exports.animate = _get__("animate");
function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}
;
var _RewireModuleId__ = null;
function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    let globalVariable = _getGlobalObject();
    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }
    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }
  return _RewireModuleId__;
}
function _getRewireRegistry__() {
  let theGlobalVariable = _getGlobalObject();
  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }
  return theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__;
}
function _getRewiredData__() {
  let moduleId = _getRewireModuleId__();
  let registry = _getRewireRegistry__();
  let rewireData = registry[moduleId];
  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }
  return rewireData;
}
(function registerResetAll() {
  let theGlobalVariable = _getGlobalObject();
  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();
var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
let _RewireAPI__ = {};
(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }
  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();
function _get__(variableName) {
  let rewireData = _getRewiredData__();
  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];
    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}
function _get_original__(variableName) {
  switch (variableName) {
    case "__createBinding":
      return __createBinding;
    case "__setModuleDefault":
      return __setModuleDefault;
    case "__importStar":
      return __importStar;
    case "clearNode":
      return clearNode;
    case "removeNode":
      return removeNode;
    case "isInDOM":
      return isInDOM;
    case "addDisposableListener":
      return addDisposableListener;
    case "keyboardEvent_1":
      return keyboardEvent_1;
    case "ModifierKeyEmitter":
      return ModifierKeyEmitter;
    case "event_2":
      return event_2;
    case "browser":
      return browser;
    case "_manualClassList":
      return _manualClassList;
    case "_nativeClassList":
      return _nativeClassList;
    case "_classList":
      return _classList;
    case "DomListener":
      return DomListener;
    case "mouseEvent_1":
      return mouseEvent_1;
    case "_wrapAsStandardMouseEvent":
      return _wrapAsStandardMouseEvent;
    case "_wrapAsStandardKeyboardEvent":
      return _wrapAsStandardKeyboardEvent;
    case "addStandardDisposableListener":
      return addStandardDisposableListener;
    case "addDisposableNonBubblingMouseOutListener":
      return addDisposableNonBubblingMouseOutListener;
    case "_animationFrame":
      return _animationFrame;
    case "AnimationFrameQueueItem":
      return AnimationFrameQueueItem;
    case "doRequestAnimationFrame":
      return doRequestAnimationFrame;
    case "measure":
      return measure;
    case "modify":
      return modify;
    case "DEFAULT_EVENT_MERGER":
      return DEFAULT_EVENT_MERGER;
    case "MINIMUM_TIME_MS":
      return MINIMUM_TIME_MS;
    case "async_1":
      return async_1;
    case "lifecycle_1":
      return lifecycle_1;
    case "TimeoutThrottledDomListener":
      return TimeoutThrottledDomListener;
    case "addDisposableThrottledListener":
      return addDisposableThrottledListener;
    case "getComputedStyle":
      return getComputedStyle;
    case "convertToPixels":
      return convertToPixels;
    case "Dimension":
      return Dimension;
    case "getClientArea":
      return getClientArea;
    case "getDomNodeZoomLevel":
      return getDomNodeZoomLevel;
    case "getDimension":
      return getDimension;
    case "sizeUtils":
      return sizeUtils;
    case "getTopLeftOffset":
      return getTopLeftOffset;
    case "size":
      return size;
    case "position":
      return position;
    case "getDomNodePagePosition":
      return getDomNodePagePosition;
    case "getTotalWidth":
      return getTotalWidth;
    case "getContentWidth":
      return getContentWidth;
    case "getTotalScrollWidth":
      return getTotalScrollWidth;
    case "getContentHeight":
      return getContentHeight;
    case "getTotalHeight":
      return getTotalHeight;
    case "getRelativeLeft":
      return getRelativeLeft;
    case "getLargestChildWidth":
      return getLargestChildWidth;
    case "isAncestor":
      return isAncestor;
    case "findParentWithClass":
      return findParentWithClass;
    case "createStyleSheet":
      return createStyleSheet;
    case "_sharedStyleSheet":
      return _sharedStyleSheet;
    case "getSharedStyleSheet":
      return getSharedStyleSheet;
    case "createCSSRule":
      return createCSSRule;
    case "getDynamicStyleSheetRules":
      return getDynamicStyleSheetRules;
    case "removeCSSRulesContainingSelector":
      return removeCSSRulesContainingSelector;
    case "isHTMLElement":
      return isHTMLElement;
    case "saveParentsScrollTop":
      return saveParentsScrollTop;
    case "restoreParentsScrollTop":
      return restoreParentsScrollTop;
    case "event_1":
      return event_1;
    case "FocusTracker":
      return FocusTracker;
    case "trackFocus":
      return trackFocus;
    case "append":
      return append;
    case "prepend":
      return prepend;
    case "SELECTOR_REGEX":
      return SELECTOR_REGEX;
    case "arrays_1":
      return arrays_1;
    case "$":
      return $;
    case "join":
      return join;
    case "show":
      return show;
    case "hide":
      return hide;
    case "findParentWithAttribute":
      return findParentWithAttribute;
    case "removeTabIndexAndUpdateFocus":
      return removeTabIndexAndUpdateFocus;
    case "getElementsByTagName":
      return getElementsByTagName;
    case "finalHandler":
      return finalHandler;
    case "platform":
      return platform;
    case "domContentLoaded":
      return domContentLoaded;
    case "computeScreenAwareSize":
      return computeScreenAwareSize;
    case "windowOpenNoOpener":
      return windowOpenNoOpener;
    case "animate":
      return animate;
  }
  return undefined;
}
function _assign__(variableName, value) {
  let rewireData = _getRewiredData__();
  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}
function _set_original__(variableName, _value) {
  switch (variableName) {
    case "_animationFrame":
      return _animationFrame = _value;
    case "_sharedStyleSheet":
      return _sharedStyleSheet = _value;
  }
  return undefined;
}
function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);
  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;
  _assign__(variableName, newValue);
  return prefix ? newValue : oldValue;
}
function _set__(variableName, value) {
  let rewireData = _getRewiredData__();
  if (typeof variableName === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
    return function () {
      Object.keys(variableName).forEach(function (name) {
        _reset__(variableName);
      });
    };
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }
    return function () {
      _reset__(variableName);
    };
  }
}
function _reset__(variableName) {
  let rewireData = _getRewiredData__();
  delete rewireData[variableName];
  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }
  ;
}
function _with__(object) {
  let rewireData = _getRewiredData__();
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};
  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }
  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    let result = callback();
    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }
    return result;
  };
}
let _typeOfOriginalExport = typeof module.exports;
function addNonEnumerableProperty(name, value) {
  Object.defineProperty(module.exports, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}
if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(module.exports)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}