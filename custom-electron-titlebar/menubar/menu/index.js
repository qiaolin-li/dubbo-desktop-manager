"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CETMenu = exports.Direction = void 0;
const dom_1 = require("../../base/common/dom");
const lifecycle_1 = require("../../base/common/lifecycle");
const item_1 = require("./item");
const keyCodes_1 = require("../../base/common/keyCodes");
const keyboardEvent_1 = require("../../base/browser/keyboardEvent");
const event_1 = require("../../base/common/event");
const separator_1 = require("./separator");
const submenu_1 = require("./submenu");
const platform_1 = require("../../base/common/platform");
var Direction;
(function (Direction) {
  Direction[Direction["Right"] = 0] = "Right";
  Direction[Direction["Left"] = 1] = "Left";
})(_get__("Direction") || (exports.Direction = _assign__("Direction", {})));
class CETMenu extends _get__("lifecycle_1").Disposable {
  constructor(menuContainer, menuIcons, parentOptions, currentOptions, closeSubMenu = () => {}) {
    super();
    this.menuContainer = menuContainer;
    this.menuIcons = menuIcons;
    this.parentOptions = parentOptions;
    this.currentOptions = currentOptions;
    this.closeSubMenu = closeSubMenu;
    this.focusedItem = undefined;
    this.items = [];
    this.triggerKeys = {
      keys: [3 /* KeyCode.Enter */, 10 /* KeyCode.Space */],
      keyDown: true
    };
    this.parentData = {
      parent: this
    };
    this._onDidCancel = this._register(new (_get__("event_1").Emitter)());
    this.mnemonics = new Map();
    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      let eventHandled = true;
      if (event.equals(16 /* KeyCode.UpArrow */)) {
        this.focusPrevious();
      } else if (event.equals(18 /* KeyCode.DownArrow */)) {
        this.focusNext();
      } else if (event.equals(9 /* KeyCode.Escape */)) {
        this.cancel();
      } else if (this.isTriggerKeyEvent(event)) {
        // Staying out of the else branch even if not triggered
        if (this.triggerKeys && this.triggerKeys.keyDown) {
          this.doTrigger(event);
        }
      } else {
        eventHandled = false;
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_UP, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      // Run action on Enter/Space
      if (this.isTriggerKeyEvent(event)) {
        if (this.triggerKeys && !this.triggerKeys.keyDown) {
          this.doTrigger(event);
        }
        event.preventDefault();
        event.stopPropagation();
        // Recompute focused item
      } else if (event.equals(2 /* KeyCode.Tab */) || event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
        this.updateFocusedItem();
      }
    }));
    if (this.currentOptions.enableMnemonics) {
      this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        const key = _get__("keyCodes_1").KeyCodeUtils.fromString(e.key);
        if (this.mnemonics.has(key)) {
          const items = this.mnemonics.get(key);
          if (items.length === 1) {
            if (items[0] instanceof _get__("submenu_1").CETSubMenu) {
              this.focusItemByElement(items[0].element);
            }
            items[0].onClick(e);
          }
          if (items.length > 1) {
            const item = items.shift();
            if (item) {
              this.focusItemByElement(item.element);
              items.push(item);
            }
            this.mnemonics.set(key, items);
          }
        }
      }));
    }
    if (_get__("platform_1").isLinux) {
      this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
        if (event.equals(14 /* KeyCode.Home */) || event.equals(11 /* KeyCode.PageUp */)) {
          this.focusedItem = this.items.length - 1;
          this.focusNext();
          _get__("dom_1").EventHelper.stop(e, true);
        } else if (event.equals(13 /* KeyCode.End */) || event.equals(12 /* KeyCode.PageDown */)) {
          this.focusedItem = 0;
          this.focusPrevious();
          _get__("dom_1").EventHelper.stop(e, true);
        }
      }));
    }
    if (_get__("platform_1").isFreeBSD) {
      this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
        if (event.equals(14 /* KeyCode.Home */) || event.equals(11 /* KeyCode.PageUp */)) {
          this.focusedItem = this.items.length - 1;
          this.focusNext();
          _get__("dom_1").EventHelper.stop(e, true);
        } else if (event.equals(13 /* KeyCode.End */) || event.equals(12 /* KeyCode.PageDown */)) {
          this.focusedItem = 0;
          this.focusPrevious();
          _get__("dom_1").EventHelper.stop(e, true);
        }
      }));
    }
    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_OUT, e => {
      const relatedTarget = e.relatedTarget;
      if (!(0, _get__("dom_1").isAncestor)(relatedTarget, this.menuContainer)) {
        this.focusedItem = undefined;
        this.updateFocus();
        e.stopPropagation();
      }
    }));
    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_UP, e => {
      // Absorb clicks in menu dead space https://github.com/Microsoft/vscode/issues/63575
      _get__("dom_1").EventHelper.stop(e, true);
    }));
    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_OVER, e => {
      let target = e.target;
      if (!target || !(0, _get__("dom_1").isAncestor)(target, this.menuContainer) || target === this.menuContainer) {
        return;
      }
      while (target.parentElement !== this.menuContainer && target.parentElement !== null) {
        target = target.parentElement;
      }
      if ((0, _get__("dom_1").hasClass)(target, 'cet-action-item')) {
        const lastFocusedItem = this.focusedItem;
        this.setFocusedItem(target);
        if (lastFocusedItem !== this.focusedItem) {
          this.updateFocus();
        }
      }
    }));
    if (this.currentOptions.ariaLabel) {
      this.menuContainer.setAttribute('aria-label', this.currentOptions.ariaLabel);
    }
  }
  trigger(index) {
    if (index <= this.items.length && index >= 0) {
      const item = this.items[index];
      if (item instanceof _get__("submenu_1").CETSubMenu) {
        this.focus(index);
      }
    }
  }
  createMenu(menuItems) {
    if (!menuItems) return;
    menuItems.forEach(menuItem => {
      if (!menuItem) return;
      const itemElement = (0, _get__("dom_1").$)('li.cet-action-item', {
        role: 'presentation'
      });
      // Prevent native context menu on actions
      this._register((0, _get__("dom_1").addDisposableListener)(itemElement, _get__("dom_1").EventType.CONTEXT_MENU, e => {
        e.preventDefault();
        e.stopPropagation();
      }));
      let item;
      if (menuItem.type === 'separator') {
        item = new (_get__("separator_1").CETSeparator)(menuItem, this.menuIcons, this.parentOptions, this.currentOptions);
      } else if (menuItem.type === 'submenu' || menuItem.submenu) {
        const submenuItems = menuItem.submenu.items;
        item = new (_get__("submenu_1").CETSubMenu)(menuItem, this.menuIcons, submenuItems, this.parentData, this.parentOptions, this.currentOptions, this.closeSubMenu);
        if (this.currentOptions.enableMnemonics) {
          const mnemonic = item.mnemonic;
          if (mnemonic && item.isEnabled()) {
            let actionItems = [];
            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic);
            }
            actionItems.push(item);
            this.mnemonics.set(mnemonic, actionItems);
          }
        }
      } else {
        item = new (_get__("item_1").CETMenuItem)(menuItem, this.menuIcons, this.parentOptions, this.currentOptions, this.items, this.closeSubMenu);
        if (this.currentOptions.enableMnemonics) {
          const mnemonic = item.mnemonic;
          if (mnemonic && item.isEnabled()) {
            let actionItems = [];
            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic);
            }
            actionItems.push(item);
            this.mnemonics.set(mnemonic, actionItems);
          }
        }
      }
      item.render(itemElement);
      this.items.push(item);
      (0, _get__("dom_1").append)(this.menuContainer, itemElement);
    });
  }
  isTriggerKeyEvent(event) {
    let ret = false;
    if (this.triggerKeys) {
      this.triggerKeys.keys.forEach(keyCode => {
        ret = ret || event.equals(keyCode);
      });
    }
    return ret;
  }
  updateFocusedItem() {
    for (let i = 0; i < this.menuContainer.children.length; i++) {
      const elem = this.menuContainer.children[i];
      if ((0, _get__("dom_1").isAncestor)(document.activeElement, elem)) {
        this.focusedItem = i;
        break;
      }
    }
  }
  focus(arg) {
    let selectFirst = false;
    let index;
    if (arg === undefined) {
      selectFirst = true;
    } else if (typeof arg === 'number') {
      index = arg;
    } else if (typeof arg === 'boolean') {
      selectFirst = arg;
    }
    if (selectFirst && typeof this.focusedItem === 'undefined') {
      // Focus the first enabled item
      this.focusedItem = this.items.length - 1;
      this.focusNext();
    } else {
      if (index !== undefined) {
        this.focusedItem = index;
      }
      this.updateFocus();
    }
  }
  focusNext() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = this.items.length - 1;
    }
    const startIndex = this.focusedItem;
    let item;
    do {
      this.focusedItem = (this.focusedItem + 1) % this.items.length;
      item = this.items[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled() || item.isSeparator());
    if (this.focusedItem === startIndex && !item.isEnabled() || item.isSeparator()) {
      this.focusedItem = undefined;
    }
    this.updateFocus();
  }
  focusPrevious() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = 0;
    }
    const startIndex = this.focusedItem;
    let item;
    do {
      this.focusedItem = this.focusedItem - 1;
      if (this.focusedItem < 0) {
        this.focusedItem = this.items.length - 1;
      }
      item = this.items[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled() || item.isSeparator());
    if (this.focusedItem === startIndex && !item.isEnabled() || item.isSeparator()) {
      this.focusedItem = undefined;
    }
    this.updateFocus();
  }
  updateFocus() {
    if (typeof this.focusedItem === 'undefined') {
      this.menuContainer.focus();
    }
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (i === this.focusedItem) {
        if (item.isEnabled()) {
          item.focus();
        } else {
          this.menuContainer.focus();
        }
      } else {
        item.blur();
      }
    }
  }
  doTrigger(event) {
    if (typeof this.focusedItem === 'undefined') {
      return; // nothing to focus
    }
    // trigger action
    const item = this.items[this.focusedItem];
    if (item instanceof _get__("item_1").CETMenuItem) {
      item.onClick(event);
    }
  }
  cancel() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur(); // remove focus from focused action
    }
    this._onDidCancel.fire();
  }
  focusItemByElement(element) {
    const lastFocusedItem = this.focusedItem;
    if (element) this.setFocusedItem(element);
    if (lastFocusedItem !== this.focusedItem) {
      this.updateFocus();
    }
  }
  setFocusedItem(element) {
    this.focusedItem = Array.prototype.findIndex.call(this.container.children, elem => elem === element);
  }
  applyStyle(style) {
    var _a, _b;
    const container = this.menuContainer;
    if (style === null || style === void 0 ? void 0 : style.backgroundColor) {
      let transparency = (_a = this.parentOptions) === null || _a === void 0 ? void 0 : _a.menuTransparency;
      if (transparency < 0) transparency = 0;
      if (transparency > 1) transparency = 1;
      const rgba = (_b = style.backgroundColor) === null || _b === void 0 ? void 0 : _b.rgba;
      container.style.backgroundColor = `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${1 - transparency})`;
    }
    if (this.items) {
      this.items.forEach(item => {
        if (item instanceof _get__("item_1").CETMenuItem || item instanceof _get__("separator_1").CETSeparator) {
          item.updateStyle(style);
        }
      });
    }
  }
  get container() {
    return this.menuContainer;
  }
  get onDidCancel() {
    return this._onDidCancel.event;
  }
  dispose() {
    (0, _get__("lifecycle_1").dispose)(this.items);
    this.items = [];
    (0, _get__("dom_1").removeNode)(this.container);
    super.dispose();
  }
}
exports.CETMenu = _get__("CETMenu");
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
    case "Direction":
      return Direction;
    case "event_1":
      return event_1;
    case "dom_1":
      return dom_1;
    case "keyboardEvent_1":
      return keyboardEvent_1;
    case "keyCodes_1":
      return keyCodes_1;
    case "submenu_1":
      return submenu_1;
    case "platform_1":
      return platform_1;
    case "separator_1":
      return separator_1;
    case "item_1":
      return item_1;
    case "lifecycle_1":
      return lifecycle_1;
    case "CETMenu":
      return CETMenu;
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
    case "Direction":
      return Direction = _value;
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