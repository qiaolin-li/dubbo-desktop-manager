"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CETSubMenu = void 0;
const consts_1 = require("../../consts");
const item_1 = require("./item");
const lifecycle_1 = require("../../base/common/lifecycle");
const dom_1 = require("../../base/common/dom");
const keyboardEvent_1 = require("../../base/browser/keyboardEvent");
const index_1 = require("./index");
const async_1 = require("../../base/common/async");
class CETSubMenu extends _get__("item_1").CETMenuItem {
  constructor(item, submenuIcons, submenuItems, parentData, submenuParentOptions, submenuOptions, closeSubMenu = () => {}) {
    super(item, submenuIcons, submenuParentOptions, submenuOptions);
    this.submenuIcons = submenuIcons;
    this.submenuItems = submenuItems;
    this.parentData = parentData;
    this.submenuParentOptions = submenuParentOptions;
    this.submenuOptions = submenuOptions;
    this.submenuDisposables = [];
    this.mouseOver = false;
    this._closeSubMenu = () => {};
    this._closeSubMenu = closeSubMenu;
    this.showScheduler = new (_get__("async_1").RunOnceScheduler)(() => {
      if (this.mouseOver) {
        this.cleanupExistingSubmenu(false);
        this.createSubmenu(false);
      }
    }, 250);
    this.hideScheduler = new (_get__("async_1").RunOnceScheduler)(() => {
      if (this.element && !(0, _get__("dom_1").isAncestor)(document.activeElement, this.element) && this.parentData.submenu === this.mySubmenu) {
        this.parentData.parent.focus(false);
        this.cleanupExistingSubmenu(true);
      }
    }, 750);
  }
  render(el) {
    var _a, _b;
    super.render(el);
    if (!this.itemElement) {
      return;
    }
    (0, _get__("dom_1").addClass)(this.itemElement, 'cet-submenu-item');
    this.itemElement.setAttribute('aria-haspopup', 'true');
    this.submenuIndicator = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.cet-submenu-indicator'));
    this.submenuIndicator.innerHTML = this.submenuIcons.submenuIndicator;
    this.submenuIndicator.setAttribute('aria-hidden', 'true');
    (0, _get__("consts_1").applyFill)(this.submenuIndicator, (_a = this.menuStyle) === null || _a === void 0 ? void 0 : _a.svgColor, (_b = this.menuStyle) === null || _b === void 0 ? void 0 : _b.foregroundColor);
    if (this.element) {
      (0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.KEY_UP, e => {
        const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
        if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
          _get__("dom_1").EventHelper.stop(e, true);
          this.createSubmenu(true);
        }
      });
      (0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.KEY_DOWN, e => {
        const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
        if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
          _get__("dom_1").EventHelper.stop(e, true);
        }
      });
      (0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.MOUSE_OVER, e => {
        if (!this.mouseOver) {
          this.mouseOver = true;
          this.showScheduler.schedule();
        }
      });
      (0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.MOUSE_LEAVE, e => {
        this.mouseOver = false;
      });
      (0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.FOCUS_OUT, e => {
        if (this.element && !(0, _get__("dom_1").isAncestor)(document.activeElement, this.element)) {
          this.hideScheduler.schedule();
        }
      });
    }
  }
  cleanupExistingSubmenu(force) {
    if (this.parentData.submenu && (force || this.parentData.submenu !== this.mySubmenu)) {
      this.parentData.submenu.dispose();
      this.parentData.submenu = undefined;
      if (this.submenuContainer) {
        this.submenuContainer = undefined;
      }
    }
  }
  createSubmenu(selectFirstItem = true) {
    if (!this.itemElement) {
      return;
    }
    if (this.element) {
      if (!this.parentData.submenu) {
        this.submenuContainer = (0, _get__("dom_1").append)(this.element, (0, _get__("dom_1").$)('.cet-submenu'));
        (0, _get__("dom_1").addClasses)(this.submenuContainer, 'cet-menubar-menu-container');
        this.parentData.submenu = new (_get__("index_1").CETMenu)(this.submenuContainer, this.submenuIcons, this.submenuParentOptions, this.submenuOptions, this._closeSubMenu);
        this.parentData.submenu.createMenu(this.submenuItems);
        if (this.menuStyle) {
          this.parentData.submenu.applyStyle(this.menuStyle);
        }
        const boundingRect = this.element.getBoundingClientRect();
        const childBoundingRect = this.submenuContainer.getBoundingClientRect();
        const computedStyles = getComputedStyle(this.parentData.parent.container);
        const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;
        if (window.innerWidth <= boundingRect.right + childBoundingRect.width) {
          this.submenuContainer.style.left = '10px';
          this.submenuContainer.style.top = `${this.element.offsetTop + boundingRect.height}px`;
        } else {
          this.submenuContainer.style.left = `${this.element.offsetWidth}px`;
          this.submenuContainer.style.top = `${this.element.offsetTop - paddingTop}px`;
        }
        this.submenuDisposables.push((0, _get__("dom_1").addDisposableListener)(this.submenuContainer, _get__("dom_1").EventType.KEY_UP, e => {
          const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
          if (event.equals(15 /* KeyCode.LeftArrow */)) {
            _get__("dom_1").EventHelper.stop(e, true);
            this.parentData.parent.focus();
            if (this.parentData.submenu) {
              this.parentData.submenu.dispose();
              this.parentData.submenu = undefined;
            }
            this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
            this.submenuContainer = undefined;
          }
        }));
        this.submenuDisposables.push((0, _get__("dom_1").addDisposableListener)(this.submenuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
          const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
          if (event.equals(15 /* KeyCode.LeftArrow */)) {
            _get__("dom_1").EventHelper.stop(e, true);
          }
        }));
        this.submenuDisposables.push(this.parentData.submenu.onDidCancel(() => {
          this.parentData.parent.focus();
          if (this.parentData.submenu) {
            this.parentData.submenu.dispose();
            this.parentData.submenu = undefined;
          }
          this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
          this.submenuContainer = undefined;
        }));
        this.parentData.submenu.focus(selectFirstItem);
        this.mySubmenu = this.parentData.submenu;
      } else {
        this.parentData.submenu.focus(false);
      }
    }
  }
  applyStyle() {
    super.applyStyle();
    if (!this.menuStyle) return;
    const isSelected = this.element && (0, _get__("dom_1").hasClass)(this.element, 'focused');
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
    (0, _get__("consts_1").applyFill)(this.submenuIndicator, this.submenuParentOptions.svgColor, fgColor);
    if (this.parentData.submenu) this.parentData.submenu.applyStyle(this.menuStyle);
  }
  onClick(e) {
    // stop clicking from trying to run an action
    _get__("dom_1").EventHelper.stop(e, true);
    this.cleanupExistingSubmenu(false);
    this.createSubmenu(false);
  }
  dispose() {
    super.dispose();
    this.hideScheduler.dispose();
    if (this.mySubmenu) {
      this.mySubmenu.dispose();
      this.mySubmenu = null;
    }
    if (this.submenuContainer) {
      this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
      this.submenuContainer = undefined;
    }
  }
}
exports.CETSubMenu = _get__("CETSubMenu");
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
    case "async_1":
      return async_1;
    case "dom_1":
      return dom_1;
    case "consts_1":
      return consts_1;
    case "keyboardEvent_1":
      return keyboardEvent_1;
    case "index_1":
      return index_1;
    case "lifecycle_1":
      return lifecycle_1;
    case "item_1":
      return item_1;
    case "CETSubMenu":
      return CETSubMenu;
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