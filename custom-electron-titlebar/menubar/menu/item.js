"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
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
exports.CETMenuItem = void 0;
const electron_1 = require("electron");
const dom_1 = require("../../base/common/dom");
const keyCodes_1 = require("../../base/common/keyCodes");
const lifecycle_1 = require("../../base/common/lifecycle");
const consts_1 = require("../../consts");
const strings = _get__("__importStar")(require("../../base/common/strings"));
class CETMenuItem extends _get__("lifecycle_1").Disposable {
  constructor(_item, menuIcons, parentOptions, options, menuItems, closeSubMenu = () => {}) {
    super();
    this._item = _item;
    this.menuIcons = menuIcons;
    this.parentOptions = parentOptions;
    this.options = options;
    this.menuItems = menuItems;
    this.closeSubMenu = closeSubMenu;
    // Set mnemonic
    if (this._item.label && options.enableMnemonics) {
      const label = this._item.label;
      if (label) {
        const matches = _get__("consts_1").MENU_MNEMONIC_REGEX.exec(label);
        if (matches) {
          this._mnemonic = _get__("keyCodes_1").KeyCodeUtils.fromString((!!matches[1] ? matches[1] : matches[2]).toLocaleUpperCase());
        }
      }
    }
  }
  render(el) {
    this._currentElement = el;
    this._register((0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.MOUSE_DOWN, e => {
      if (this.item.enabled && e.button === 0 && this.element) {
        (0, _get__("dom_1").addClass)(this.element, 'active');
      }
    }));
    this._register((0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.CLICK, e => {
      if (this.item.enabled) {
        this.onClick(e);
      }
    }));
    this._register((0, _get__("dom_1").addDisposableListener)(this.element, _get__("dom_1").EventType.DBLCLICK, e => {
      _get__("dom_1").EventHelper.stop(e, true);
    }));
    [_get__("dom_1").EventType.MOUSE_UP, _get__("dom_1").EventType.MOUSE_OUT].forEach(event => {
      this._register((0, _get__("dom_1").addDisposableListener)(this.element, event, e => {
        _get__("dom_1").EventHelper.stop(e);
        (0, _get__("dom_1").removeClass)(this.element, 'active');
      }));
    });
    this.itemElement = (0, _get__("dom_1").append)(this.element, (0, _get__("dom_1").$)('a.cet-action-menu-item'));
    if (this.mnemonic) {
      this.itemElement.setAttribute('aria-keyshortcuts', `${this.mnemonic}`);
    }
    this.iconElement = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.cet-menu-item-icon'));
    this.iconElement.setAttribute('role', 'none');
    this.labelElement = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.cet-action-label'));
    this.updateLabel();
    this.setAccelerator();
    this.updateIcon();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
    this.updateVisibility();
  }
  onClick(event) {
    _get__("dom_1").EventHelper.stop(event, true);
    _get__("electron_1").ipcRenderer.send('menu-event', this.item.commandId);
    if (this.item.type === 'checkbox') {
      this.item.checked = !this.item.checked;
      this.updateChecked();
    } else if (this.item.type === 'radio') {
      this.updateRadioGroup();
    }
    this.closeSubMenu();
  }
  applyStyle() {
    var _a, _b, _c;
    if (!this.menuStyle) {
      return;
    }
    const isSelected = this.element && (0, _get__("dom_1").hasClass)(this.element, 'focused');
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
    const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : null;
    if (this.itemElement) {
      this.itemElement.style.color = fgColor ? fgColor.toString() : '';
      this.itemElement.style.backgroundColor = bgColor ? bgColor.toString() : '';
      if (this.iconElement) {
        if (((_a = this.iconElement.firstElementChild) === null || _a === void 0 ? void 0 : _a.className) === 'icon') {
          (0, _get__("consts_1").applyFill)(this.iconElement.firstElementChild, (_b = this.parentOptions) === null || _b === void 0 ? void 0 : _b.svgColor, fgColor, false);
        } else {
          (0, _get__("consts_1").applyFill)(this.iconElement, (_c = this.parentOptions) === null || _c === void 0 ? void 0 : _c.svgColor, fgColor);
        }
      }
    }
  }
  updateStyle(style) {
    this.menuStyle = style;
    this.applyStyle();
  }
  focus() {
    if (this.element) {
      this.element.focus();
      (0, _get__("dom_1").addClass)(this.element, 'focused');
    }
    this.applyStyle();
  }
  blur() {
    if (this.element) {
      this.element.blur();
      (0, _get__("dom_1").removeClass)(this.element, 'focused');
    }
    this.applyStyle();
  }
  setAccelerator() {
    let accelerator = null;
    if (this.item.role) {
      switch (this.item.role.toLocaleLowerCase()) {
        case 'undo':
          accelerator = 'CtrlOrCmd+Z';
          break;
        case 'redo':
          accelerator = 'CtrlOrCmd+Y';
          break;
        case 'cut':
          accelerator = 'CtrlOrCmd+X';
          break;
        case 'copy':
          accelerator = 'CtrlOrCmd+C';
          break;
        case 'paste':
          accelerator = 'CtrlOrCmd+V';
          break;
        case 'selectall':
          accelerator = 'CtrlOrCmd+A';
          break;
        case 'minimize':
          accelerator = 'CtrlOrCmd+M';
          break;
        case 'close':
          accelerator = 'CtrlOrCmd+W';
          break;
        case 'reload':
          accelerator = 'CtrlOrCmd+R';
          break;
        case 'forcereload':
          accelerator = 'CtrlOrCmd+Shift+R';
          break;
        case 'toggledevtools':
          accelerator = 'CtrlOrCmd+Shift+I';
          break;
        case 'togglefullscreen':
          accelerator = 'F11';
          break;
        case 'resetzoom':
          accelerator = 'CtrlOrCmd+0';
          break;
        case 'zoomin':
          accelerator = 'CtrlOrCmd++';
          break;
        case 'zoomout':
          accelerator = 'CtrlOrCmd+-';
          break;
      }
    }
    if (this.item.label && this.item.accelerator) {
      accelerator = this.item.accelerator;
    }
    if (this.itemElement && accelerator !== null) {
      (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.keybinding')).textContent = (0, _get__("consts_1").parseAccelerator)(accelerator);
    }
  }
  updateLabel() {
    var _a, _b;
    const label = this.item.label || '';
    const cleanMenuLabel = (0, _get__("consts_1").cleanMnemonic)(label);
    // Update the button label to reflect mnemonics
    if (this.options.enableMnemonics) {
      const cleanLabel = _get__("strings").escape(label);
      // This is global so reset it
      _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
      let escMatch = _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      // We can't use negative lookbehind so we match our negative and skip
      while (escMatch && escMatch[1]) {
        escMatch = _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      }
      const replaceDoubleEscapes = str => str.replace(/&amp;&amp;/g, '&amp;');
      if (escMatch) {
        this.labelElement.innerText = '';
        this.labelElement.append(_get__("strings").ltrim(replaceDoubleEscapes(cleanLabel.substring(0, escMatch.index)), ' '), (0, _get__("dom_1").$)('mnemonic', {
          'aria-hidden': 'true'
        }, escMatch[3]), _get__("strings").rtrim(replaceDoubleEscapes(cleanLabel.substring(escMatch.index + escMatch[0].length)), ' '));
      } else {
        this.labelElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
      }
    } else {
      this.labelElement.innerText = cleanMenuLabel.replace(/&&/g, '&');
    }
    const mnemonicMatches = _get__("consts_1").MENU_MNEMONIC_REGEX.exec(label);
    // Register mnemonics
    if (mnemonicMatches) {
      const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
      if (this.options.enableMnemonics) {
        (_a = this.itemElement) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
      } else {
        (_b = this.itemElement) === null || _b === void 0 ? void 0 : _b.removeAttribute('aria-keyshortcuts');
      }
    }
  }
  updateIcon() {
    var _a, _b;
    if (this.item.icon) {
      const icon = this.item.icon;
      if (this.iconElement && icon) {
        const iconE = (0, _get__("dom_1").append)(this.iconElement, (0, _get__("dom_1").$)('.icon'));
        let iconData;
        if (typeof this.item.icon !== 'string') {
          iconData = _get__("electron_1").ipcRenderer.sendSync('menu-icon', this.item.commandId);
        } else {
          const iconPath = this.item.icon;
          iconData = _get__("electron_1").nativeImage.createFromPath(iconPath).toDataURL();
        }
        if (iconData) iconE.style.webkitMaskBoxImage = `url(${iconData})`;
      }
    } else if (this.iconElement && this.item.type === 'checkbox') {
      (0, _get__("dom_1").addClass)(this.iconElement, 'checkbox');
      this.iconElement.innerHTML = this.menuIcons.checkbox;
    } else if (this.item.type === 'radio') {
      (0, _get__("dom_1").addClass)(this.iconElement, 'radio');
      this.iconElement.innerHTML = this.item.checked ? this.menuIcons.radioChecked : this.menuIcons.radioUnchecked;
    }
    (0, _get__("consts_1").applyFill)(this.iconElement, (_a = this.parentOptions) === null || _a === void 0 ? void 0 : _a.svgColor, (_b = this.menuStyle) === null || _b === void 0 ? void 0 : _b.foregroundColor);
  }
  updateTooltip() {
    let title = null;
    if (this.item.sublabel) {
      title = this.item.sublabel;
    } else if (!this.item.label && this.item.label && this.item.icon) {
      title = this.item.label;
      if (this.item.accelerator) {
        title = (0, _get__("consts_1").parseAccelerator)(this.item.accelerator);
      }
    }
    if (this.itemElement && title) {
      this.itemElement.title = title;
    }
  }
  updateEnabled() {
    if (this.element) {
      if (this.item.enabled && this.item.type !== 'separator') {
        (0, _get__("dom_1").removeClass)(this.element, 'disabled');
        this.element.tabIndex = 0;
      } else {
        (0, _get__("dom_1").addClass)(this.element, 'disabled');
      }
    }
  }
  updateVisibility() {
    if (this.item.visible === false && this.itemElement) {
      this.itemElement.remove();
    }
  }
  updateChecked() {
    if (this.itemElement) {
      if (this.item.checked) {
        (0, _get__("dom_1").addClass)(this.itemElement, 'checked');
        this.itemElement.setAttribute('aria-checked', 'true');
      } else {
        (0, _get__("dom_1").removeClass)(this.itemElement, 'checked');
        this.itemElement.setAttribute('aria-checked', 'false');
      }
    }
  }
  updateRadioGroup() {
    if (this.radioGroup === undefined) {
      this.radioGroup = this.getRadioGroup();
    }
    if (this.menuItems) {
      for (let i = this.radioGroup.start; i < this.radioGroup.end; i++) {
        const menuItem = this.menuItems[i];
        if (menuItem instanceof _get__("CETMenuItem") && menuItem.item.type === 'radio') {
          // update item.checked for each radio button in group
          menuItem.item.checked = menuItem === this;
          menuItem.updateIcon();
          // updateChecked() *all* radio buttons in group
          menuItem.updateChecked();
          // set the radioGroup property of all the other radio buttons since it was already calculated
          if (menuItem !== this) {
            menuItem.radioGroup = this.radioGroup;
          }
        }
      }
    }
  }
  /** radioGroup index's starts with (previous separator +1 OR menuItems[0]) and ends with (next separator OR menuItems[length]) */
  getRadioGroup() {
    let startIndex = 0;
    let endIndex = this.menuItems ? this.menuItems.length : 0;
    let found = false;
    if (this.menuItems) {
      for (const index in this.menuItems) {
        const menuItem = this.menuItems[index];
        if (menuItem === this) {
          found = true;
        } else if (menuItem instanceof _get__("CETMenuItem") && menuItem.isSeparator()) {
          if (found) {
            endIndex = Number.parseInt(index);
            break;
          } else {
            startIndex = Number.parseInt(index) + 1;
          }
        }
      }
    }
    return {
      start: startIndex,
      end: endIndex
    };
  }
  get element() {
    return this._currentElement;
  }
  get item() {
    return this._item;
  }
  isEnabled() {
    return this.item.enabled;
  }
  isSeparator() {
    return this.item.type === 'separator';
  }
  get mnemonic() {
    return this._mnemonic;
  }
  dispose() {
    if (this.itemElement) {
      (0, _get__("dom_1").removeNode)(this.itemElement);
      this.itemElement = undefined;
    }
    super.dispose();
  }
}
exports.CETMenuItem = _get__("CETMenuItem");
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
    case "consts_1":
      return consts_1;
    case "keyCodes_1":
      return keyCodes_1;
    case "dom_1":
      return dom_1;
    case "electron_1":
      return electron_1;
    case "strings":
      return strings;
    case "CETMenuItem":
      return CETMenuItem;
    case "lifecycle_1":
      return lifecycle_1;
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