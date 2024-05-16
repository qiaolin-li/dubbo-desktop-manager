"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThemeBar = void 0;
const lifecycle_1 = require("../base/common/lifecycle");
const baseTheme = "body {\r\n  margin: 0 !important;\r\n  overflow: hidden !important;\r\n}\r\n\r\n/* Titlebar */\r\n.cet-titlebar {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-shrink: 0;\r\n  flex-wrap: wrap;\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  right: 0;\r\n  font-size: 13px;\r\n  font-family: Arial, Helvetica, sans-serif;\r\n  box-sizing: border-box;\r\n  padding: 0 16px;\r\n  overflow: hidden;\r\n  -webkit-user-select: none;\r\n  -ms-user-select: none;\r\n  user-select: none;\r\n  zoom: 1;\r\n  width: 100%;\r\n  height: 31px;\r\n  line-height: 31px;\r\n  z-index: 99999;\r\n}\r\n\r\n.cet-titlebar *,\r\n.cet-titlebar *:before,\r\n.cet-titlebar *:after {\r\n  box-sizing: border-box;\r\n}\r\n\r\n.cet-titlebar.cet-windows,\r\n.cet-titlebar.cet-linux,\r\n.cet-titlebar.cet-freebsd {\r\n  padding: 0;\r\n  height: 30px;\r\n  line-height: 30px;\r\n  justify-content: left;\r\n  overflow: visible;\r\n}\r\n\r\n/* Inverted */\r\n.cet-titlebar.cet-inverted {\r\n  flex-direction: row-reverse;\r\n}\r\n\r\n.cet-titlebar.cet-inverted .cet-menubar,\r\n.cet-titlebar.cet-inverted .cet-window-controls {\r\n  flex-direction: row-reverse;\r\n  margin-left: 20px;\r\n  margin-right: 0;\r\n}\r\n\r\n/* First buttons */\r\n.cet-titlebar.cet-first-buttons .cet-window-controls {\r\n  order: -1;\r\n  margin: 0 5px 0 0;\r\n}\r\n\r\n.cet-titlebar.cet-inverted .cet-window-controls {\r\n  margin: 0 5px 0 0;\r\n}\r\n\r\n/* Shadow */\r\n.cet-titlebar.cet-shadow {\r\n  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);\r\n}\r\n\r\n/* Drag region */\r\n.cet-drag-region {\r\n  top: 0;\r\n  left: 0;\r\n  display: block;\r\n  position: absolute;\r\n  width: 100%;\r\n  height: 100%;\r\n  z-index: -1;\r\n  -webkit-app-region: drag;\r\n}\r\n\r\n/* Icon */\r\n.cet-icon {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 34px;\r\n  height: 30px;\r\n  z-index: 99;\r\n  overflow: hidden;\r\n}\r\n\r\n/* Title */\r\n.cet-title {\r\n  flex: 0 1 auto;\r\n  font-size: 12px;\r\n  overflow: hidden;\r\n  white-space: nowrap;\r\n  text-overflow: ellipsis;\r\n  zoom: 1;\r\n}\r\n\r\n/* Title alignment */\r\n.cet-title.cet-title-left {\r\n  margin-left: 8px;\r\n  margin-right: auto;\r\n}\r\n\r\n.cet-title.cet-title-right {\r\n  margin-left: auto;\r\n  margin-right: 8px;\r\n}\r\n\r\n.cet-title.cet-title-center {\r\n  position: absolute;\r\n  left: 50%;\r\n  transform: translateX(-50%);\r\n}\r\n\r\n.cet-title.cet-bigsur {\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n}\r\n\r\n/* Window controls */\r\n.cet-window-controls {\r\n  display: flex;\r\n  flex-grow: 0;\r\n  flex-shrink: 0;\r\n  text-align: center;\r\n  position: relative;\r\n  z-index: 99;\r\n  -webkit-app-region: no-drag;\r\n  height: 30px;\r\n  font-family: initial !important;\r\n  margin-left: auto;\r\n}\r\n\r\n.cet-control-icon {\r\n  width: 2.85rem;\r\n}\r\n\r\n.cet-control-icon:not(.inactive):hover {\r\n  background-color: rgb(255 255 255 / 12%);\r\n}\r\n\r\n.light .cet-control-icon:not(.inactive):hover {\r\n  background-color: rgb(0 0 0 / 12%);\r\n}\r\n\r\n.cet-control-icon.inactive svg {\r\n  opacity: 0.4;\r\n}\r\n\r\n.cet-control-icon svg {\r\n  width: 10px;\r\n  height: -webkit-fill-available;\r\n  fill: #fff;\r\n  display: initial !important;\r\n  vertical-align: unset !important;\r\n}\r\n\r\n.cet-titlebar.light .cet-control-icon svg {\r\n  fill: #222222 !important;\r\n}\r\n\r\n.cet-control-close:not(.inactive):hover {\r\n  background-color: rgb(232 17 35 / 90%) !important;\r\n}\r\n\r\n.cet-control-close:not(.inactive):hover svg {\r\n  fill: #fff !important;\r\n}\r\n\r\n/* Resizer */\r\n.cet-resizer {\r\n  -webkit-app-region: no-drag;\r\n  position: absolute;\r\n}\r\n\r\n.cet-resizer.left {\r\n  top: 0;\r\n  left: 0;\r\n  width: 6px;\r\n  height: 100%;\r\n}\r\n\r\n.cet-resizer.top {\r\n  top: 0;\r\n  width: 100%;\r\n  height: 6px;\r\n}\r\n\r\n/* Container */\r\n.cet-container {\r\n  position: absolute;\r\n  left: 0;\r\n  right: 0;\r\n  bottom: 0;\r\n  overflow: auto;\r\n  z-index: 1;\r\n}\r\n\r\n/* MenuBar */\r\n.cet-menubar {\r\n  display: flex;\r\n  flex-shrink: 1;\r\n  box-sizing: border-box;\r\n  overflow: hidden;\r\n  flex-wrap: wrap;\r\n  margin-right: 20px;\r\n}\r\n\r\n.cet-menubar.bottom {\r\n  order: 1;\r\n  width: 100%;\r\n  padding: 0 5px 5px;\r\n  margin-right: 0;\r\n}\r\n\r\n.cet-menubar.bottom .cet-menubar-menu-button {\r\n  border-radius: 4px;\r\n}\r\n\r\n.cet-menubar.bottom .cet-menubar-menu-button .cet-menubar-menu-title {\r\n  line-height: 26px;\r\n}\r\n\r\n.cet-menubar .cet-menubar-menu-button {\r\n  box-sizing: border-box;\r\n  padding: 0px 8px;\r\n  height: 100%;\r\n  cursor: default;\r\n  zoom: 1;\r\n  white-space: nowrap;\r\n  -webkit-app-region: no-drag;\r\n  outline: 0;\r\n}\r\n\r\n.cet-menubar .cet-menubar-menu-button .cet-menubar-menu-title {\r\n  font-size: 12px;\r\n}\r\n\r\n.cet-menubar .cet-menubar-menu-button.disabled {\r\n  opacity: 0.4;\r\n}\r\n\r\n.cet-menubar .cet-menubar-menu-button:not(.disabled):hover,\r\n.cet-menubar .cet-menubar-menu-button:not(.disabled).open {\r\n  background-color: rgb(255 255 255 / 12%);\r\n}\r\n\r\n.cet-titlebar.light .cet-menubar .cet-menubar-menu-button:not(.disabled):hover,\r\n.cet-titlebar.light .cet-menubar .cet-menubar-menu-button:not(.disabled).open {\r\n  background-color: rgb(0 0 0 / 12%);\r\n}\r\n\r\n.cet-menubar-menu-container {\r\n  position: absolute;\r\n  display: block;\r\n  left: 0px;\r\n  opacity: 1;\r\n  outline: 0;\r\n  border: none;\r\n  text-align: left;\r\n  margin: 0 auto;\r\n  margin-left: 0;\r\n  font-size: inherit;\r\n  overflow-x: visible;\r\n  overflow-y: visible;\r\n  -webkit-overflow-scrolling: touch;\r\n  justify-content: flex-end;\r\n  white-space: nowrap;\r\n  border-radius: 7px;\r\n  backdrop-filter: blur(10px);\r\n  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);\r\n  z-index: 99999;\r\n}\r\n\r\n.cet-menubar-menu-container::-webkit-scrollbar {\r\n  width: 8px;\r\n  height: 4px;\r\n  cursor: pointer;\r\n  background-color: rgba(0, 0, 0, 0);\r\n}\r\n\r\n.cet-menubar-menu-container::-webkit-scrollbar-track {\r\n  border: none;\r\n  background-color: rgba(0, 0, 0, 0);\r\n}\r\n\r\n.cet-menubar-menu-container::-webkit-scrollbar-thumb {\r\n  border-radius: 10px;\r\n  background-color: rgba(110, 110, 110, 0.2);\r\n}\r\n\r\n.cet-menubar-menu-container:focus {\r\n  outline: 0;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-item {\r\n  padding: 0;\r\n  margin: 0;\r\n  transform: none;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  outline: none;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-item.active {\r\n  transform: none;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-item.disabled .cet-action-menu-item {\r\n  opacity: 0.4;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-item .cet-submenu {\r\n  position: absolute;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-menu-item {\r\n  -ms-flex: 1 1 auto;\r\n  flex: 1 1 auto;\r\n  display: -ms-flexbox;\r\n  display: flex;\r\n  height: 2.231em;\r\n  margin: 4px 3px;\r\n  align-items: center;\r\n  position: relative;\r\n  border-radius: 4px;\r\n  text-decoration: none;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-label {\r\n  -ms-flex: 1 1 auto;\r\n  flex: 1 1 auto;\r\n  text-decoration: none;\r\n  padding: 0 1em;\r\n  background: none;\r\n  font-size: 12px;\r\n  line-height: 1;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-label:not(.separator) {\r\n  display: inline-block;\r\n  -webkit-box-sizing: border-box;\r\n  -o-box-sizing: border-box;\r\n  -moz-box-sizing: border-box;\r\n  -ms-box-sizing: border-box;\r\n  box-sizing: border-box;\r\n  margin: 0;\r\n  padding: 0 2em 0 0.8em;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-label.separator {\r\n  opacity: 0.1;\r\n  font-size: inherit;\r\n  width: 100%;\r\n  border-bottom: 1px solid transparent;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-label.separator.text {\r\n  padding: 0.7em 1em 0.1em 1em;\r\n  font-weight: bold;\r\n  opacity: 1;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-label:hover {\r\n  color: inherit;\r\n}\r\n\r\n.cet-menubar-menu-container .keybinding,\r\n.cet-menubar-menu-container .cet-submenu-indicator {\r\n  display: inline-block;\r\n  -ms-flex: 2 1 auto;\r\n  flex: 2 1 auto;\r\n  padding: 0 2em 0 1em;\r\n  text-align: right;\r\n  font-size: 11px;\r\n  line-height: 1;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-submenu-indicator {\r\n  position: absolute;\r\n  right: 4px;\r\n  height: 12px;\r\n  width: 12px;\r\n  padding: 0;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-submenu-indicator img,\r\n.cet-menubar-menu-container .cet-menu-item-icon .icon,\r\n.cet-menubar-menu-container .cet-submenu-indicator svg,\r\n.cet-menubar-menu-container .cet-menu-item-icon svg {\r\n  display: inherit;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-action-menu-item.checked>.cet-menu-item-icon.checkbox {\r\n  visibility: visible;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-menu-item-icon {\r\n  width: 14px;\r\n  height: 14px;\r\n  margin: 0 0 0 12px;\r\n}\r\n\r\n.cet-menubar-menu-container .cet-menu-item-icon.checkbox {\r\n  visibility: hidden;\r\n}";
const macTheme = "";
const winTheme = "";
class ThemingRegistry extends _get__("lifecycle_1").Disposable {
  constructor() {
    super();
    this.theming = [];
    this.theming = [];
  }
  onThemeChange(theme) {
    this.theming.push(theme);
    return (0, _get__("lifecycle_1").toDisposable)(() => {
      const idx = this.theming.indexOf(theme);
      this.theming.splice(idx, 1);
    });
  }
  getTheming() {
    return this.theming;
  }
}
class ThemeBar extends _get__("ThemingRegistry") {
  constructor() {
    super();
    this.registerTheme(collector => {
      collector.addRule(_get__("baseTheme"));
    });
  }
  registerTheme(theme) {
    this.onThemeChange(theme);
    const cssRules = [];
    const hasRule = {};
    const ruleCollector = {
      addRule: rule => {
        if (!hasRule[rule]) {
          cssRules.push(rule);
          hasRule[rule] = true;
        }
      }
    };
    this.getTheming().forEach(p => p(ruleCollector));
    _get__("_applyRules")(cssRules.join('\n'), 'titlebar-style');
  }
  static get win() {
    return collector => {
      collector.addRule(_get__("winTheme"));
    };
  }
  static get mac() {
    return collector => {
      collector.addRule(_get__("macTheme"));
    };
  }
}
exports.ThemeBar = _get__("ThemeBar");
function _applyRules(styleSheetContent, rulesClassName) {
  const themeStyles = document.head.getElementsByClassName(rulesClassName);
  if (themeStyles.length === 0) {
    const styleElement = document.createElement('style');
    styleElement.className = rulesClassName;
    styleElement.innerHTML = styleSheetContent;
    document.head.appendChild(styleElement);
  } else {
    themeStyles[0].innerHTML = styleSheetContent;
  }
}
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
    case "lifecycle_1":
      return lifecycle_1;
    case "baseTheme":
      return baseTheme;
    case "_applyRules":
      return _applyRules;
    case "winTheme":
      return winTheme;
    case "macTheme":
      return macTheme;
    case "ThemingRegistry":
      return ThemingRegistry;
    case "ThemeBar":
      return ThemeBar;
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