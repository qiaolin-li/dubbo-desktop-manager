"use strict";

/* eslint-disable indent */
/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OS = exports.setImmediate = exports.globals = exports.isRootUser = exports.platform = exports.isWeb = exports.isNative = exports.isFreeBSD = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.PlatformToString = void 0;
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isFreeBSD = false;
let _isNative = false;
let _isWeb = false;
const isElectronRenderer = typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer';
// OS detection
if (typeof navigator === 'object' && !_get__("isElectronRenderer")) {
  const userAgent = navigator.userAgent;
  _assign__("_isWindows", userAgent.indexOf('Windows') >= 0);
  _assign__("_isMacintosh", userAgent.indexOf('Macintosh') >= 0);
  _assign__("_isLinux", userAgent.indexOf('Linux') >= 0);
  _assign__("_isFreeBSD", userAgent.indexOf('FreeBSD') >= 0);
  _assign__("_isWeb", true);
} else if (typeof process === 'object') {
  _assign__("_isWindows", process.platform === 'win32');
  _assign__("_isMacintosh", process.platform === 'darwin');
  _assign__("_isLinux", process.platform === 'linux');
  _assign__("_isFreeBSD", process.platform === 'freebsd');
  _assign__("_isNative", true);
}
function PlatformToString(platform) {
  switch (platform) {
    case 0 /* Platform.Web */:
      return 'Web';
    case 1 /* Platform.Mac */:
      return 'Mac';
    case 2 /* Platform.Linux */:
      return 'Linux';
    case 3 /* Platform.FreeBSD */:
      return 'FreeBSD';
    case 4 /* Platform.Windows */:
      return 'Windows';
  }
}
exports.PlatformToString = _get__("PlatformToString");
let _platform = 0 /* Platform.Web */;
if (_get__("_isNative")) {
  if (_get__("_isMacintosh")) {
    _assign__("_platform", 1) /* Platform.Mac */;
  } else if (_get__("_isWindows")) {
    _assign__("_platform", 4) /* Platform.Windows */;
  } else if (_get__("_isLinux")) {
    _assign__("_platform", 2) /* Platform.Linux */;
  } else if (_get__("_isFreeBSD")) {
    _assign__("_platform", 3) /* Platform.FreeBSD */;
  }
}
exports.isWindows = _get__("_isWindows");
exports.isMacintosh = _get__("_isMacintosh");
exports.isLinux = _get__("_isLinux");
exports.isFreeBSD = _get__("_isFreeBSD");
exports.isNative = _get__("_isNative");
exports.isWeb = _get__("_isWeb");
exports.platform = _get__("_platform");
function isRootUser() {
  return _get__("_isNative") && !_get__("_isWindows") && process.getuid() === 0;
}
exports.isRootUser = _get__("isRootUser");
const g = typeof global === 'object' ? global : {};
const _globals = typeof self === 'object' ? self : _get__("g");
exports.globals = _get__("_globals");
let _setImmediate = null;
function setImmediate(callback) {
  if (_get__("_setImmediate") === null) {
    if (exports.globals.setImmediate) {
      _assign__("_setImmediate", exports.globals.setImmediate.bind(exports.globals));
    } else if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
      _assign__("_setImmediate", process.nextTick.bind(process));
    } else {
      _assign__("_setImmediate", exports.globals.setTimeout.bind(exports.globals));
    }
  }
  return _get__("_setImmediate")(callback);
}
exports.setImmediate = _get__("setImmediate");
const _wl = _get__("_isWindows") ? 1 /* OperatingSystem.Windows */ : 3 /* OperatingSystem.Linux */ | 4 /* OperatingSystem.FreeBSD */;
exports.OS = _get__("_isMacintosh") ? 2 /* OperatingSystem.Macintosh */ : _get__("_wl");
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
    case "isElectronRenderer":
      return isElectronRenderer;
    case "_isWindows":
      return _isWindows;
    case "_isMacintosh":
      return _isMacintosh;
    case "_isLinux":
      return _isLinux;
    case "_isFreeBSD":
      return _isFreeBSD;
    case "_isWeb":
      return _isWeb;
    case "_isNative":
      return _isNative;
    case "PlatformToString":
      return PlatformToString;
    case "_platform":
      return _platform;
    case "isRootUser":
      return isRootUser;
    case "g":
      return g;
    case "_globals":
      return _globals;
    case "_setImmediate":
      return _setImmediate;
    case "setImmediate":
      return setImmediate;
    case "_wl":
      return _wl;
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
    case "_isWindows":
      return _isWindows = _value;
    case "_isMacintosh":
      return _isMacintosh = _value;
    case "_isLinux":
      return _isLinux = _value;
    case "_isFreeBSD":
      return _isFreeBSD = _value;
    case "_isWeb":
      return _isWeb = _value;
    case "_isNative":
      return _isNative = _value;
    case "_platform":
      return _platform = _value;
    case "_setImmediate":
      return _setImmediate = _value;
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