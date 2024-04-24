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
exports.StandardKeyboardEvent = exports.getCodeForKeyCode = void 0;
const keyCodes_1 = require("../common/keyCodes");
const platform = _get__("__importStar")(require("../common/platform"));
const KEY_CODE_MAP = new Array(230);
const INVERSE_KEY_CODE_MAP = new Array(112 /* KeyCode.MAX_VALUE */);
(function () {
  for (let i = 0; i < _get__("INVERSE_KEY_CODE_MAP").length; i++) {
    _get__("INVERSE_KEY_CODE_MAP")[i] = 0;
  }
  function define(code, keyCode) {
    _get__("KEY_CODE_MAP")[code] = keyCode;
    _get__("INVERSE_KEY_CODE_MAP")[keyCode] = code;
  }
  define(3, 7 /* KeyCode.PauseBreak */); // VK_CANCEL 0x03 Control-break processing
  define(8, 1 /* KeyCode.Backspace */);
  define(9, 2 /* KeyCode.Tab */);
  define(13, 3 /* KeyCode.Enter */);
  define(16, 4 /* KeyCode.Shift */);
  define(17, 5 /* KeyCode.Ctrl */);
  define(18, 6 /* KeyCode.Alt */);
  define(19, 7 /* KeyCode.PauseBreak */);
  define(20, 8 /* KeyCode.CapsLock */);
  define(27, 9 /* KeyCode.Escape */);
  define(32, 10 /* KeyCode.Space */);
  define(33, 11 /* KeyCode.PageUp */);
  define(34, 12 /* KeyCode.PageDown */);
  define(35, 13 /* KeyCode.End */);
  define(36, 14 /* KeyCode.Home */);
  define(37, 15 /* KeyCode.LeftArrow */);
  define(38, 16 /* KeyCode.UpArrow */);
  define(39, 17 /* KeyCode.RightArrow */);
  define(40, 18 /* KeyCode.DownArrow */);
  define(45, 19 /* KeyCode.Insert */);
  define(46, 20 /* KeyCode.Delete */);
  define(48, 21 /* KeyCode.KEY_0 */);
  define(49, 22 /* KeyCode.KEY_1 */);
  define(50, 23 /* KeyCode.KEY_2 */);
  define(51, 24 /* KeyCode.KEY_3 */);
  define(52, 25 /* KeyCode.KEY_4 */);
  define(53, 26 /* KeyCode.KEY_5 */);
  define(54, 27 /* KeyCode.KEY_6 */);
  define(55, 28 /* KeyCode.KEY_7 */);
  define(56, 29 /* KeyCode.KEY_8 */);
  define(57, 30 /* KeyCode.KEY_9 */);
  define(65, 31 /* KeyCode.KEY_A */);
  define(66, 32 /* KeyCode.KEY_B */);
  define(67, 33 /* KeyCode.KEY_C */);
  define(68, 34 /* KeyCode.KEY_D */);
  define(69, 35 /* KeyCode.KEY_E */);
  define(70, 36 /* KeyCode.KEY_F */);
  define(71, 37 /* KeyCode.KEY_G */);
  define(72, 38 /* KeyCode.KEY_H */);
  define(73, 39 /* KeyCode.KEY_I */);
  define(74, 40 /* KeyCode.KEY_J */);
  define(75, 41 /* KeyCode.KEY_K */);
  define(76, 42 /* KeyCode.KEY_L */);
  define(77, 43 /* KeyCode.KEY_M */);
  define(78, 44 /* KeyCode.KEY_N */);
  define(79, 45 /* KeyCode.KEY_O */);
  define(80, 46 /* KeyCode.KEY_P */);
  define(81, 47 /* KeyCode.KEY_Q */);
  define(82, 48 /* KeyCode.KEY_R */);
  define(83, 49 /* KeyCode.KEY_S */);
  define(84, 50 /* KeyCode.KEY_T */);
  define(85, 51 /* KeyCode.KEY_U */);
  define(86, 52 /* KeyCode.KEY_V */);
  define(87, 53 /* KeyCode.KEY_W */);
  define(88, 54 /* KeyCode.KEY_X */);
  define(89, 55 /* KeyCode.KEY_Y */);
  define(90, 56 /* KeyCode.KEY_Z */);
  define(93, 58 /* KeyCode.ContextMenu */);
  define(96, 93 /* KeyCode.NUMPAD_0 */);
  define(97, 94 /* KeyCode.NUMPAD_1 */);
  define(98, 95 /* KeyCode.NUMPAD_2 */);
  define(99, 96 /* KeyCode.NUMPAD_3 */);
  define(100, 97 /* KeyCode.NUMPAD_4 */);
  define(101, 98 /* KeyCode.NUMPAD_5 */);
  define(102, 99 /* KeyCode.NUMPAD_6 */);
  define(103, 100 /* KeyCode.NUMPAD_7 */);
  define(104, 101 /* KeyCode.NUMPAD_8 */);
  define(105, 102 /* KeyCode.NUMPAD_9 */);
  define(106, 103 /* KeyCode.NUMPAD_MULTIPLY */);
  define(107, 104 /* KeyCode.NUMPAD_ADD */);
  define(108, 105 /* KeyCode.NUMPAD_SEPARATOR */);
  define(109, 106 /* KeyCode.NUMPAD_SUBTRACT */);
  define(110, 107 /* KeyCode.NUMPAD_DECIMAL */);
  define(111, 108 /* KeyCode.NUMPAD_DIVIDE */);
  define(112, 59 /* KeyCode.F1 */);
  define(113, 60 /* KeyCode.F2 */);
  define(114, 61 /* KeyCode.F3 */);
  define(115, 62 /* KeyCode.F4 */);
  define(116, 63 /* KeyCode.F5 */);
  define(117, 64 /* KeyCode.F6 */);
  define(118, 65 /* KeyCode.F7 */);
  define(119, 66 /* KeyCode.F8 */);
  define(120, 67 /* KeyCode.F9 */);
  define(121, 68 /* KeyCode.F10 */);
  define(122, 69 /* KeyCode.F11 */);
  define(123, 70 /* KeyCode.F12 */);
  define(124, 71 /* KeyCode.F13 */);
  define(125, 72 /* KeyCode.F14 */);
  define(126, 73 /* KeyCode.F15 */);
  define(127, 74 /* KeyCode.F16 */);
  define(128, 75 /* KeyCode.F17 */);
  define(129, 76 /* KeyCode.F18 */);
  define(130, 77 /* KeyCode.F19 */);
  define(144, 78 /* KeyCode.NumLock */);
  define(145, 79 /* KeyCode.ScrollLock */);
  define(186, 80 /* KeyCode.US_SEMICOLON */);
  define(187, 81 /* KeyCode.US_EQUAL */);
  define(188, 82 /* KeyCode.US_COMMA */);
  define(189, 83 /* KeyCode.US_MINUS */);
  define(190, 84 /* KeyCode.US_DOT */);
  define(191, 85 /* KeyCode.US_SLASH */);
  define(192, 86 /* KeyCode.US_BACKTICK */);
  define(193, 110 /* KeyCode.ABNT_C1 */);
  define(194, 111 /* KeyCode.ABNT_C2 */);
  define(219, 87 /* KeyCode.US_OPEN_SQUARE_BRACKET */);
  define(220, 88 /* KeyCode.US_BACKSLASH */);
  define(221, 89 /* KeyCode.US_CLOSE_SQUARE_BRACKET */);
  define(222, 90 /* KeyCode.US_QUOTE */);
  define(223, 91 /* KeyCode.OEM_8 */);
  define(226, 92 /* KeyCode.OEM_102 */);
  /**
   * https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
   * If an Input Method Editor is processing key input and the event is keydown, return 229.
   */
  define(229, 109 /* KeyCode.KEY_IN_COMPOSITION */);
  define(91, 57 /* KeyCode.Meta */);
  if (_get__("platform").isMacintosh) {
    // the two meta keys in the Mac have different key codes (91 and 93)
    define(93, 57 /* KeyCode.Meta */);
  } else {
    define(92, 57 /* KeyCode.Meta */);
  }
})();
function extractKeyCode(e) {
  if (e.charCode) {
    // "keypress" events mostly
    const char = String.fromCharCode(e.charCode).toUpperCase();
    return _get__("keyCodes_1").KeyCodeUtils.fromString(char);
  }
  return _get__("KEY_CODE_MAP")[e.keyCode] || 0 /* KeyCode.Unknown */;
}
function getCodeForKeyCode(keyCode) {
  return _get__("INVERSE_KEY_CODE_MAP")[keyCode];
}
exports.getCodeForKeyCode = _get__("getCodeForKeyCode");
const ctrlKeyMod = _get__("platform").isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */;
const altKeyMod = 512 /* KeyMod.Alt */;
const shiftKeyMod = 1024 /* KeyMod.Shift */;
const metaKeyMod = _get__("platform").isMacintosh ? 2048 /* KeyMod.CtrlCmd */ : 256 /* KeyMod.WinCtrl */;
class StandardKeyboardEvent {
  constructor(source) {
    const e = source;
    this.browserEvent = e;
    this.target = e.target;
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.keyCode = _get__("extractKeyCode")(e);
    this.code = e.code;
    // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
    this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* KeyCode.Ctrl */;
    this.altKey = this.altKey || this.keyCode === 6 /* KeyCode.Alt */;
    this.shiftKey = this.shiftKey || this.keyCode === 4 /* KeyCode.Shift */;
    this.metaKey = this.metaKey || this.keyCode === 57 /* KeyCode.Meta */;
    this._asKeybinding = this._computeKeybinding();
    this._asRuntimeKeybinding = this._computeRuntimeKeybinding();
  }
  preventDefault() {
    if (this.browserEvent && this.browserEvent.preventDefault) {
      this.browserEvent.preventDefault();
    }
  }
  stopPropagation() {
    if (this.browserEvent && this.browserEvent.stopPropagation) {
      this.browserEvent.stopPropagation();
    }
  }
  toKeybinding() {
    return this._asRuntimeKeybinding;
  }
  equals(other) {
    return this._asKeybinding === other;
  }
  _computeKeybinding() {
    let key = 0 /* KeyCode.Unknown */;
    if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
      key = this.keyCode;
    }
    let result = 0;
    if (this.ctrlKey) {
      result |= _get__("ctrlKeyMod");
    }
    if (this.altKey) {
      result |= _get__("altKeyMod");
    }
    if (this.shiftKey) {
      result |= _get__("shiftKeyMod");
    }
    if (this.metaKey) {
      result |= _get__("metaKeyMod");
    }
    result |= key;
    return result;
  }
  _computeRuntimeKeybinding() {
    let key = 0 /* KeyCode.Unknown */;
    if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
      key = this.keyCode;
    }
    return new (_get__("keyCodes_1").SimpleKeybinding)(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
  }
}
exports.StandardKeyboardEvent = _get__("StandardKeyboardEvent");
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
    case "INVERSE_KEY_CODE_MAP":
      return INVERSE_KEY_CODE_MAP;
    case "KEY_CODE_MAP":
      return KEY_CODE_MAP;
    case "platform":
      return platform;
    case "keyCodes_1":
      return keyCodes_1;
    case "getCodeForKeyCode":
      return getCodeForKeyCode;
    case "extractKeyCode":
      return extractKeyCode;
    case "ctrlKeyMod":
      return ctrlKeyMod;
    case "altKeyMod":
      return altKeyMod;
    case "shiftKeyMod":
      return shiftKeyMod;
    case "metaKeyMod":
      return metaKeyMod;
    case "StandardKeyboardEvent":
      return StandardKeyboardEvent;
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