"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEdgeWebView = exports.isIPad = exports.isWebkitWebView = exports.isSafari = exports.isChrome = exports.isWebKit = exports.isFirefox = exports.isOpera = exports.isEdgeOrIE = exports.isEdge = exports.isIE = exports.onDidChangeFullscreen = exports.isFullscreen = exports.setFullscreen = exports.getPixelRatio = exports.setZoomFactor = exports.getZoomFactor = exports.onDidChangeZoomLevel = exports.getTimeSinceLastZoomLevelChanged = exports.getZoomLevel = exports.setZoomLevel = void 0;
const event_1 = require("../common/event");
class WindowManager {
  constructor() {
    this._zoomLevel = 0;
    this._lastZoomLevelChangeTime = 0;
    this._onDidChangeZoomLevel = new (_get__("event_1").Emitter)();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
    // --- Zoom Factor
    this._zoomFactor = 0;
    // --- Fullscreen
    this._fullscreen = false;
    this._onDidChangeFullscreen = new (_get__("event_1").Emitter)();
    this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
  }
  getZoomLevel() {
    return this._zoomLevel;
  }
  getTimeSinceLastZoomLevelChanged() {
    return Date.now() - this._lastZoomLevelChangeTime;
  }
  setZoomLevel(zoomLevel, isTrusted) {
    if (this._zoomLevel === zoomLevel) {
      return;
    }
    this._zoomLevel = zoomLevel;
    // See https://github.com/Microsoft/vscode/issues/26151
    this._lastZoomLevelChangeTime = isTrusted ? 0 : Date.now();
    this._onDidChangeZoomLevel.fire(this._zoomLevel);
  }
  getZoomFactor() {
    return this._zoomFactor;
  }
  setZoomFactor(zoomFactor) {
    this._zoomFactor = zoomFactor;
  }
  // --- Pixel Ratio
  getPixelRatio() {
    const ctx = document.createElement('canvas').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
  }
  setFullscreen(fullscreen) {
    if (this._fullscreen === fullscreen) {
      return;
    }
    this._fullscreen = fullscreen;
    this._onDidChangeFullscreen.fire();
  }
  isFullscreen() {
    return this._fullscreen;
  }
}
_get__("WindowManager").INSTANCE = new (_get__("WindowManager"))();
/** A zoom index, e.g. 1, 2, 3 */
function setZoomLevel(zoomLevel, isTrusted) {
  _get__("WindowManager").INSTANCE.setZoomLevel(zoomLevel, isTrusted);
}
exports.setZoomLevel = _get__("setZoomLevel");
function getZoomLevel() {
  return _get__("WindowManager").INSTANCE.getZoomLevel();
}
exports.getZoomLevel = _get__("getZoomLevel");
/** Returns the time (in ms) since the zoom level was changed */
function getTimeSinceLastZoomLevelChanged() {
  return _get__("WindowManager").INSTANCE.getTimeSinceLastZoomLevelChanged();
}
exports.getTimeSinceLastZoomLevelChanged = _get__("getTimeSinceLastZoomLevelChanged");
function onDidChangeZoomLevel(callback) {
  return _get__("WindowManager").INSTANCE.onDidChangeZoomLevel(callback);
}
exports.onDidChangeZoomLevel = _get__("onDidChangeZoomLevel");
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
function getZoomFactor() {
  return _get__("WindowManager").INSTANCE.getZoomFactor();
}
exports.getZoomFactor = _get__("getZoomFactor");
function setZoomFactor(zoomFactor) {
  _get__("WindowManager").INSTANCE.setZoomFactor(zoomFactor);
}
exports.setZoomFactor = _get__("setZoomFactor");
function getPixelRatio() {
  return _get__("WindowManager").INSTANCE.getPixelRatio();
}
exports.getPixelRatio = _get__("getPixelRatio");
function setFullscreen(fullscreen) {
  _get__("WindowManager").INSTANCE.setFullscreen(fullscreen);
}
exports.setFullscreen = _get__("setFullscreen");
function isFullscreen() {
  return _get__("WindowManager").INSTANCE.isFullscreen();
}
exports.isFullscreen = _get__("isFullscreen");
exports.onDidChangeFullscreen = _get__("WindowManager").INSTANCE.onDidChangeFullscreen;
const userAgent = navigator.userAgent;
exports.isIE = _get__("userAgent").indexOf('Trident') >= 0;
exports.isEdge = _get__("userAgent").indexOf('Edge/') >= 0;
exports.isEdgeOrIE = exports.isIE || exports.isEdge;
exports.isOpera = _get__("userAgent").indexOf('Opera') >= 0;
exports.isFirefox = _get__("userAgent").indexOf('Firefox') >= 0;
exports.isWebKit = _get__("userAgent").indexOf('AppleWebKit') >= 0;
exports.isChrome = _get__("userAgent").indexOf('Chrome') >= 0;
exports.isSafari = !exports.isChrome && _get__("userAgent").indexOf('Safari') >= 0;
exports.isWebkitWebView = !exports.isChrome && !exports.isSafari && exports.isWebKit;
exports.isIPad = _get__("userAgent").indexOf('iPad') >= 0;
exports.isEdgeWebView = exports.isEdge && _get__("userAgent").indexOf('WebView/') >= 0;
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
    case "event_1":
      return event_1;
    case "WindowManager":
      return WindowManager;
    case "setZoomLevel":
      return setZoomLevel;
    case "getZoomLevel":
      return getZoomLevel;
    case "getTimeSinceLastZoomLevelChanged":
      return getTimeSinceLastZoomLevelChanged;
    case "onDidChangeZoomLevel":
      return onDidChangeZoomLevel;
    case "getZoomFactor":
      return getZoomFactor;
    case "setZoomFactor":
      return setZoomFactor;
    case "getPixelRatio":
      return getPixelRatio;
    case "setFullscreen":
      return setFullscreen;
    case "isFullscreen":
      return isFullscreen;
    case "userAgent":
      return userAgent;
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
  switch (variableName) {}
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