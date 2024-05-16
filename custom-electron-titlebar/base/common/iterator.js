"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MappedNavigator = exports.MappedIterator = exports.ArrayNavigator = exports.ArrayIterator = exports.getSequenceIterator = exports.Iterator = exports.FIN = void 0;
exports.FIN = {
  done: true,
  value: undefined
};
var Iterator;
(function (Iterator) {
  const _empty = {
    next() {
      return exports.FIN;
    }
  };
  function empty() {
    return _empty;
  }
  Iterator.empty = empty;
  function fromArray(array, index = 0, length = array.length) {
    return {
      next() {
        if (index >= length) {
          return exports.FIN;
        }
        return {
          done: false,
          value: array[index++]
        };
      }
    };
  }
  Iterator.fromArray = fromArray;
  function from(elements) {
    if (!elements) {
      return Iterator.empty();
    } else if (Array.isArray(elements)) {
      return Iterator.fromArray(elements);
    } else {
      return elements;
    }
  }
  Iterator.from = from;
  function map(iterator, fn) {
    return {
      next() {
        const element = iterator.next();
        if (element.done) {
          return exports.FIN;
        } else {
          return {
            done: false,
            value: fn(element.value)
          };
        }
      }
    };
  }
  Iterator.map = map;
  function filter(iterator, fn) {
    return {
      next() {
        while (true) {
          const element = iterator.next();
          if (element.done) {
            return exports.FIN;
          }
          if (fn(element.value)) {
            return {
              done: false,
              value: element.value
            };
          }
        }
      }
    };
  }
  Iterator.filter = filter;
  function forEach(iterator, fn) {
    for (let next = iterator.next(); !next.done; next = iterator.next()) {
      fn(next.value);
    }
  }
  Iterator.forEach = forEach;
  function collect(iterator) {
    const result = [];
    forEach(iterator, value => result.push(value));
    return result;
  }
  Iterator.collect = collect;
})(_get__("Iterator") || (exports.Iterator = _assign__("Iterator", {})));
function getSequenceIterator(arg) {
  if (Array.isArray(arg)) {
    return _get__("Iterator").fromArray(arg);
  } else {
    return arg;
  }
}
exports.getSequenceIterator = _get__("getSequenceIterator");
class ArrayIterator {
  constructor(items, start = 0, end = items.length, index = start - 1) {
    this.items = items;
    this.start = start;
    this.end = end;
    this.index = index;
  }
  first() {
    this.index = this.start;
    return this.current();
  }
  next() {
    this.index = Math.min(this.index + 1, this.end);
    return this.current();
  }
  current() {
    if (this.index === this.start - 1 || this.index === this.end) {
      return null;
    }
    return this.items[this.index];
  }
}
exports.ArrayIterator = _get__("ArrayIterator");
class ArrayNavigator extends _get__("ArrayIterator") {
  constructor(items, start = 0, end = items.length, index = start - 1) {
    super(items, start, end, index);
  }
  current() {
    return super.current();
  }
  previous() {
    this.index = Math.max(this.index - 1, this.start - 1);
    return this.current();
  }
  first() {
    this.index = this.start;
    return this.current();
  }
  last() {
    this.index = this.end - 1;
    return this.current();
  }
  parent() {
    return null;
  }
}
exports.ArrayNavigator = _get__("ArrayNavigator");
class MappedIterator {
  constructor(iterator, fn) {
    this.iterator = iterator;
    this.fn = fn;
    // noop
  }
  next() {
    return this.fn(this.iterator.next());
  }
}
exports.MappedIterator = _get__("MappedIterator");
class MappedNavigator extends _get__("MappedIterator") {
  constructor(navigator, fn) {
    super(navigator, fn);
    this.navigator = navigator;
  }
  current() {
    return this.fn(this.navigator.current());
  }
  previous() {
    return this.fn(this.navigator.previous());
  }
  parent() {
    return this.fn(this.navigator.parent());
  }
  first() {
    return this.fn(this.navigator.first());
  }
  last() {
    return this.fn(this.navigator.last());
  }
  next() {
    return this.fn(this.navigator.next());
  }
}
exports.MappedNavigator = _get__("MappedNavigator");
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
    case "Iterator":
      return Iterator;
    case "getSequenceIterator":
      return getSequenceIterator;
    case "ArrayIterator":
      return ArrayIterator;
    case "ArrayNavigator":
      return ArrayNavigator;
    case "MappedIterator":
      return MappedIterator;
    case "MappedNavigator":
      return MappedNavigator;
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
    case "Iterator":
      return Iterator = _value;
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