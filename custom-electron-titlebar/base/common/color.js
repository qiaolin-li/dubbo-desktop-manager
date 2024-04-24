"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Color = exports.HSVA = exports.HSLA = exports.RGBA = void 0;
function roundFloat(number, decimalPoints) {
  const decimal = Math.pow(10, decimalPoints);
  return Math.round(number * decimal) / decimal;
}
class RGBA {
  constructor(r, g, b, a = 1) {
    this.r = Math.min(255, Math.max(0, r)) | 0;
    this.g = Math.min(255, Math.max(0, g)) | 0;
    this.b = Math.min(255, Math.max(0, b)) | 0;
    this.a = _get__("roundFloat")(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }
}
exports.RGBA = _get__("RGBA");
class HSLA {
  constructor(h, s, l, a) {
    this.h = Math.max(Math.min(360, h), 0) | 0;
    this.s = _get__("roundFloat")(Math.max(Math.min(1, s), 0), 3);
    this.l = _get__("roundFloat")(Math.max(Math.min(1, l), 0), 3);
    this.a = _get__("roundFloat")(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
  }
  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h in the set [0, 360], s, and l in the set [0, 1].
   */
  static fromRGBA(rgba) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const a = rgba.a;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (min + max) / 2;
    const chroma = max - min;
    if (chroma > 0) {
      s = Math.min(l <= 0.5 ? chroma / (2 * l) : chroma / (2 - 2 * l), 1);
      switch (max) {
        case r:
          h = (g - b) / chroma + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / chroma + 2;
          break;
        case b:
          h = (r - g) / chroma + 4;
          break;
      }
      h *= 60;
      h = Math.round(h);
    }
    return new (_get__("HSLA"))(h, s, l, a);
  }
  static _hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }
  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   */
  static toRGBA(hsla) {
    const h = hsla.h / 360;
    const {
      s,
      l,
      a
    } = hsla;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = _get__("HSLA")._hue2rgb(p, q, h + 1 / 3);
      g = _get__("HSLA")._hue2rgb(p, q, h);
      b = _get__("HSLA")._hue2rgb(p, q, h - 1 / 3);
    }
    return new (_get__("RGBA"))(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
  }
}
exports.HSLA = _get__("HSLA");
class HSVA {
  constructor(h, s, v, a) {
    this.h = Math.max(Math.min(360, h), 0) | 0;
    this.s = _get__("roundFloat")(Math.max(Math.min(1, s), 0), 3);
    this.v = _get__("roundFloat")(Math.max(Math.min(1, v), 0), 3);
    this.a = _get__("roundFloat")(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
  }
  // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
  static fromRGBA(rgba) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const cmax = Math.max(r, g, b);
    const cmin = Math.min(r, g, b);
    const delta = cmax - cmin;
    const s = cmax === 0 ? 0 : delta / cmax;
    let m;
    if (delta === 0) {
      m = 0;
    } else if (cmax === r) {
      m = ((g - b) / delta % 6 + 6) % 6;
    } else if (cmax === g) {
      m = (b - r) / delta + 2;
    } else {
      m = (r - g) / delta + 4;
    }
    return new (_get__("HSVA"))(Math.round(m * 60), s, cmax, rgba.a);
  }
  // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
  static toRGBA(hsva) {
    const {
      h,
      s,
      v,
      a
    } = hsva;
    const c = v * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = v - c;
    let [r, g, b] = [0, 0, 0];
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else if (h < 360) {
      r = c;
      b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return new (_get__("RGBA"))(r, g, b, a);
  }
}
exports.HSVA = _get__("HSVA");
class Color {
  static fromHex(hex) {
    return _get__("Color").Format.CSS.parseHex(hex) || _get__("Color").RED;
  }
  get hsla() {
    if (this._hsla) {
      return this._hsla;
    } else {
      return _get__("HSLA").fromRGBA(this.rgba);
    }
  }
  get hsva() {
    if (this._hsva) {
      return this._hsva;
    }
    return _get__("HSVA").fromRGBA(this.rgba);
  }
  constructor(arg) {
    if (!arg) {
      throw new Error('Color needs a value');
    } else if (arg instanceof _get__("RGBA")) {
      this.rgba = arg;
    } else if (arg instanceof _get__("HSLA")) {
      this._hsla = arg;
      this.rgba = _get__("HSLA").toRGBA(arg);
    } else if (arg instanceof _get__("HSVA")) {
      this._hsva = arg;
      this.rgba = _get__("HSVA").toRGBA(arg);
    } else {
      throw new Error('Invalid color ctor argument');
    }
  }
  equals(other) {
    return !!other && _get__("RGBA").equals(this.rgba, other.rgba) && _get__("HSLA").equals(this.hsla, other.hsla) && _get__("HSVA").equals(this.hsva, other.hsva);
  }
  /**
   * http://www.w3.org/TR/WCAG20/#relativeluminancedef
   * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
   */
  getRelativeLuminance() {
    const R = _get__("Color")._relativeLuminanceForComponent(this.rgba.r);
    const G = _get__("Color")._relativeLuminanceForComponent(this.rgba.g);
    const B = _get__("Color")._relativeLuminanceForComponent(this.rgba.b);
    const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return _get__("roundFloat")(luminance, 4);
  }
  static _relativeLuminanceForComponent(color) {
    const c = color / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  /**
   * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
   * Returns the contrast ration number in the set [1, 21].
   */
  getContrastRatio(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
  }
  /**
   *	http://24ways.org/2010/calculating-color-contrast
   *  Return 'true' if darker color otherwise 'false'
   */
  isDarker() {
    const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
    return yiq < 128;
  }
  /**
   *	http://24ways.org/2010/calculating-color-contrast
   *  Return 'true' if lighter color otherwise 'false'
   */
  isLighter() {
    const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
    return yiq >= 128;
  }
  isLighterThan(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 > lum2;
  }
  isDarkerThan(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 < lum2;
  }
  lighten(factor) {
    return new (_get__("Color"))(new (_get__("HSLA"))(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
  }
  darken(factor) {
    return new (_get__("Color"))(new (_get__("HSLA"))(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
  }
  transparent(factor) {
    const {
      r,
      g,
      b,
      a
    } = this.rgba;
    return new (_get__("Color"))(new (_get__("RGBA"))(r, g, b, a * factor));
  }
  isTransparent() {
    return this.rgba.a === 0;
  }
  isOpaque() {
    return this.rgba.a === 1;
  }
  opposite() {
    return new (_get__("Color"))(new (_get__("RGBA"))(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
  }
  blend(c) {
    const rgba = c.rgba;
    // Convert to 0..1 opacity
    const thisA = this.rgba.a;
    const colorA = rgba.a;
    const a = thisA + colorA * (1 - thisA);
    if (a < 1e-6) {
      return _get__("Color").TRANSPARENT;
    }
    const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
    const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
    const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
    return new (_get__("Color"))(new (_get__("RGBA"))(r, g, b, a));
  }
  flatten(...backgrounds) {
    const background = backgrounds.reduceRight((accumulator, color) => {
      return _get__("Color")._flatten(color, accumulator);
    });
    return _get__("Color")._flatten(this, background);
  }
  static _flatten(foreground, background) {
    const backgroundAlpha = 1 - foreground.rgba.a;
    return new (_get__("Color"))(new (_get__("RGBA"))(backgroundAlpha * background.rgba.r + foreground.rgba.a * foreground.rgba.r, backgroundAlpha * background.rgba.g + foreground.rgba.a * foreground.rgba.g, backgroundAlpha * background.rgba.b + foreground.rgba.a * foreground.rgba.b));
  }
  toString() {
    return '' + _get__("Color").Format.CSS.format(this);
  }
  static getLighterColor(of, relative, factor) {
    if (of.isLighterThan(relative)) {
      return of;
    }
    factor = factor || 0.5;
    const lum1 = of.getRelativeLuminance();
    const lum2 = relative.getRelativeLuminance();
    factor = factor * (lum2 - lum1) / lum2;
    return of.lighten(factor);
  }
  static getDarkerColor(of, relative, factor) {
    if (of.isDarkerThan(relative)) {
      return of;
    }
    factor = factor || 0.5;
    const lum1 = of.getRelativeLuminance();
    const lum2 = relative.getRelativeLuminance();
    factor = factor * (lum1 - lum2) / lum1;
    return of.darken(factor);
  }
}
exports.Color = _get__("Color");
_get__("Color").WHITE = new (_get__("Color"))(new (_get__("RGBA"))(255, 255, 255, 1));
_get__("Color").BLACK = new (_get__("Color"))(new (_get__("RGBA"))(0, 0, 0, 1));
_get__("Color").RED = new (_get__("Color"))(new (_get__("RGBA"))(255, 0, 0, 1));
_get__("Color").BLUE = new (_get__("Color"))(new (_get__("RGBA"))(0, 0, 255, 1));
_get__("Color").GREEN = new (_get__("Color"))(new (_get__("RGBA"))(0, 255, 0, 1));
_get__("Color").CYAN = new (_get__("Color"))(new (_get__("RGBA"))(0, 255, 255, 1));
_get__("Color").LIGHTGREY = new (_get__("Color"))(new (_get__("RGBA"))(211, 211, 211, 1));
_get__("Color").TRANSPARENT = new (_get__("Color"))(new (_get__("RGBA"))(0, 0, 0, 0));
(function (Color) {
  let Format;
  (function (Format) {
    let CSS;
    (function (CSS) {
      function formatRGB(color) {
        if (color.rgba.a === 1) {
          return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
        }
        return Color.Format.CSS.formatRGBA(color);
      }
      CSS.formatRGB = formatRGB;
      function formatRGBA(color) {
        return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+color.rgba.a.toFixed(2)})`;
      }
      CSS.formatRGBA = formatRGBA;
      function formatHSL(color) {
        if (color.hsla.a === 1) {
          return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
        }
        return Color.Format.CSS.formatHSLA(color);
      }
      CSS.formatHSL = formatHSL;
      function formatHSLA(color) {
        return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
      }
      CSS.formatHSLA = formatHSLA;
      function _toTwoDigitHex(n) {
        const r = n.toString(16);
        return r.length !== 2 ? '0' + r : r;
      }
      /**
       * Formats the color as #RRGGBB
       */
      function formatHex(color) {
        return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
      }
      CSS.formatHex = formatHex;
      /**
       * Formats the color as #RRGGBBAA
       * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
       */
      function formatHexA(color, compact = false) {
        if (compact && color.rgba.a === 1) {
          return Color.Format.CSS.formatHex(color);
        }
        return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
      }
      CSS.formatHexA = formatHexA;
      /**
       * The default format will use HEX if opaque and RGBA otherwise.
       */
      function format(color) {
        if (!color) {
          return null;
        }
        if (color.isOpaque()) {
          return Color.Format.CSS.formatHex(color);
        }
        return Color.Format.CSS.formatRGBA(color);
      }
      CSS.format = format;
      /**
       * Converts an Hex color value to a Color.
       * returns r, g, and b are contained in the set [0, 255]
       * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
       */
      function parseHex(hex) {
        if (!hex) {
          // Invalid color
          return null;
        }
        const length = hex.length;
        if (length === 0) {
          // Invalid color
          return null;
        }
        if (hex.charCodeAt(0) !== 35 /* CharCode.Hash */) {
          // Does not begin with a #
          return null;
        }
        if (length === 7) {
          // #RRGGBB format
          const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
          const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
          const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
          return new Color(new (_get__("RGBA"))(r, g, b, 1));
        }
        if (length === 9) {
          // #RRGGBBAA format
          const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
          const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
          const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
          const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
          return new Color(new (_get__("RGBA"))(r, g, b, a / 255));
        }
        if (length === 4) {
          // #RGB format
          const r = _parseHexDigit(hex.charCodeAt(1));
          const g = _parseHexDigit(hex.charCodeAt(2));
          const b = _parseHexDigit(hex.charCodeAt(3));
          return new Color(new (_get__("RGBA"))(16 * r + r, 16 * g + g, 16 * b + b));
        }
        if (length === 5) {
          // #RGBA format
          const r = _parseHexDigit(hex.charCodeAt(1));
          const g = _parseHexDigit(hex.charCodeAt(2));
          const b = _parseHexDigit(hex.charCodeAt(3));
          const a = _parseHexDigit(hex.charCodeAt(4));
          return new Color(new (_get__("RGBA"))(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
        }
        // Invalid color
        return null;
      }
      CSS.parseHex = parseHex;
      function _parseHexDigit(charCode) {
        switch (charCode) {
          case 48 /* CharCode.Digit0 */:
            return 0;
          case 49 /* CharCode.Digit1 */:
            return 1;
          case 50 /* CharCode.Digit2 */:
            return 2;
          case 51 /* CharCode.Digit3 */:
            return 3;
          case 52 /* CharCode.Digit4 */:
            return 4;
          case 53 /* CharCode.Digit5 */:
            return 5;
          case 54 /* CharCode.Digit6 */:
            return 6;
          case 55 /* CharCode.Digit7 */:
            return 7;
          case 56 /* CharCode.Digit8 */:
            return 8;
          case 57 /* CharCode.Digit9 */:
            return 9;
          case 97 /* CharCode.a */:
            return 10;
          case 65 /* CharCode.A */:
            return 10;
          case 98 /* CharCode.b */:
            return 11;
          case 66 /* CharCode.B */:
            return 11;
          case 99 /* CharCode.c */:
            return 12;
          case 67 /* CharCode.C */:
            return 12;
          case 100 /* CharCode.d */:
            return 13;
          case 68 /* CharCode.D */:
            return 13;
          case 101 /* CharCode.e */:
            return 14;
          case 69 /* CharCode.E */:
            return 14;
          case 102 /* CharCode.f */:
            return 15;
          case 70 /* CharCode.F */:
            return 15;
        }
        return 0;
      }
    })(CSS = Format.CSS || (Format.CSS = {}));
  })(Format = Color.Format || (Color.Format = {}));
})(_get__("Color") || (exports.Color = _assign__("Color", {})));
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
    case "roundFloat":
      return roundFloat;
    case "RGBA":
      return RGBA;
    case "HSLA":
      return HSLA;
    case "HSVA":
      return HSVA;
    case "Color":
      return Color;
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
    case "Color":
      return Color = _value;
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