"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Relay = exports.EventBufferer = exports.AsyncEmitter = exports.Emitter = exports.setGlobalLeakWarningThreshold = exports.Event = void 0;
const lifecycle_1 = require("../common/lifecycle");
const linkedList_1 = require("../common/linkedList");
var Event;
(function (Event) {
  const _disposable = {
    dispose() {}
  };
  Event.None = function () {
    return _disposable;
  };
  /**
   * Given an event, returns another event which only fires once.
   */
  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      // we need this, in case the event fires during the listener call
      let didFire = false;
      const result = event(e => {
        if (didFire) {
          return;
        } else if (result) {
          result.dispose();
        } else {
          didFire = true;
        }
        return listener.call(thisArgs, e);
      }, null, disposables);
      if (didFire) {
        result.dispose();
      }
      return result;
    };
  }
  Event.once = once;
  /**
   * Given an event and a `map` function, returns another event which maps each element
   * throught the mapping function.
   */
  function map(event, map) {
    return (listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables);
  }
  Event.map = map;
  /**
   * Given an event and an `each` function, returns another identical event and calls
   * the `each` function per each element.
   */
  function forEach(event, each) {
    return (listener, thisArgs = null, disposables) => event(i => {
      each(i);
      listener.call(thisArgs, i);
    }, null, disposables);
  }
  Event.forEach = forEach;
  function filter(event, filter) {
    return (listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables);
  }
  Event.filter = filter;
  /**
   * Given an event, returns the same event but typed as `Event<void>`.
   */
  function signal(event) {
    return event;
  }
  Event.signal = signal;
  /**
   * Given a collection of events, returns a single event which emits
   * whenever any of the provided events emit.
   */
  function any(...events) {
    return (listener, thisArgs = null, disposables) => (0, _get__("lifecycle_1").combinedDisposable)(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
  }
  Event.any = any;
  /**
   * Given an event and a `merge` function, returns another event which maps each element
   * and the cummulative result throught the `merge` function. Similar to `map`, but with memory.
   */
  function reduce(event, merge, initial) {
    let output = initial;
    return map(event, e => {
      output = merge(output, e);
      return output;
    });
  }
  Event.reduce = reduce;
  function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
    let subscription;
    let output;
    let handle;
    let numDebouncedCalls = 0;
    const emitter = new (_get__("Emitter"))({
      leakWarningThreshold,
      onFirstListenerAdd() {
        subscription = event(cur => {
          numDebouncedCalls++;
          output = merge(output, cur);
          if (leading && !handle) {
            emitter.fire(output);
          }
          clearTimeout(handle);
          handle = setTimeout(() => {
            const _output = output;
            output = undefined;
            handle = undefined;
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }
            numDebouncedCalls = 0;
          }, delay);
        });
      },
      onLastListenerRemove() {
        subscription.dispose();
      }
    });
    return emitter.event;
  }
  Event.debounce = debounce;
  /**
   * Given an event, it returns another event which fires only once and as soon as
   * the input event emits. The event data is the number of millis it took for the
   * event to fire.
   */
  function stopwatch(event) {
    const start = new Date().getTime();
    return map(once(event), _ => new Date().getTime() - start);
  }
  Event.stopwatch = stopwatch;
  /**
   * Given an event, it returns another event which fires only when the event
   * element changes.
   */
  function latch(event) {
    let firstCall = true;
    let cache;
    return filter(event, value => {
      const shouldEmit = firstCall || value !== cache;
      firstCall = false;
      cache = value;
      return shouldEmit;
    });
  }
  Event.latch = latch;
  /**
   * Buffers the provided event until a first listener comes
   * along, at which point fire all the events at once and
   * pipe the event from then on.
   *
   * ```typescript
   * const emitter = new Emitter<number>();
   * const event = emitter.event;
   * const bufferedEvent = buffer(event);
   *
   * emitter.fire(1);
   * emitter.fire(2);
   * emitter.fire(3);
   * // nothing...
   *
   * const listener = bufferedEvent(num => console.log(num));
   * // 1, 2, 3
   *
   * emitter.fire(4);
   * // 4
   * ```
   */
  function buffer(event, nextTick = false, _buffer = []) {
    let buffer = _buffer.slice();
    let listener = event(e => {
      if (buffer) {
        buffer.push(e);
      } else {
        emitter.fire(e);
      }
    });
    const flush = () => {
      if (buffer) {
        buffer.forEach(e => emitter.fire(e));
      }
      buffer = null;
    };
    const emitter = new (_get__("Emitter"))({
      onFirstListenerAdd() {
        if (!listener) {
          listener = event(e => emitter.fire(e));
        }
      },
      onFirstListenerDidAdd() {
        if (buffer) {
          if (nextTick) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },
      onLastListenerRemove() {
        if (listener) {
          listener.dispose();
        }
        listener = null;
      }
    });
    return emitter.event;
  }
  Event.buffer = buffer;
  /**
   * Similar to `buffer` but it buffers indefinitely and repeats
   * the buffered events to every new listener.
   */
  function echo(event, nextTick = false, buffer = []) {
    buffer = buffer.slice();
    event(e => {
      buffer.push(e);
      emitter.fire(e);
    });
    const flush = (listener, thisArgs) => buffer.forEach(e => listener.call(thisArgs, e));
    const emitter = new (_get__("Emitter"))({
      onListenerDidAdd(emitter, listener, thisArgs) {
        if (nextTick) {
          setTimeout(() => flush(listener, thisArgs));
        } else {
          flush(listener, thisArgs);
        }
      }
    });
    return emitter.event;
  }
  Event.echo = echo;
  class ChainableEvent {
    get event() {
      return this._event;
    }
    constructor(_event) {
      this._event = _event;
    }
    map(fn) {
      return new ChainableEvent(map(this._event, fn));
    }
    forEach(fn) {
      return new ChainableEvent(forEach(this._event, fn));
    }
    filter(fn) {
      return new ChainableEvent(filter(this._event, fn));
    }
    reduce(merge, initial) {
      return new ChainableEvent(reduce(this._event, merge, initial));
    }
    latch() {
      return new ChainableEvent(latch(this._event));
    }
    on(listener, thisArgs, disposables) {
      return this._event(listener, thisArgs, disposables);
    }
    once(listener, thisArgs, disposables) {
      return once(this._event)(listener, thisArgs, disposables);
    }
  }
  function chain(event) {
    return new ChainableEvent(event);
  }
  Event.chain = chain;
  function fromNodeEventEmitter(emitter, eventName, map = id => id) {
    const fn = (...args) => result.fire(map(...args));
    const onFirstListenerAdd = () => emitter.on(eventName, fn);
    const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
    const result = new (_get__("Emitter"))({
      onFirstListenerAdd,
      onLastListenerRemove
    });
    return result.event;
  }
  Event.fromNodeEventEmitter = fromNodeEventEmitter;
  function fromPromise(promise) {
    const emitter = new (_get__("Emitter"))();
    let shouldEmit = false;
    promise.then(undefined, () => null).then(() => {
      if (!shouldEmit) {
        setTimeout(() => emitter.fire(undefined), 0);
      } else {
        emitter.fire(undefined);
      }
    });
    shouldEmit = true;
    return emitter.event;
  }
  Event.fromPromise = fromPromise;
  function toPromise(event) {
    // eslint-disable-next-line promise/param-names
    return new Promise(c => once(event)(c));
  }
  Event.toPromise = toPromise;
})(_get__("Event") || (exports.Event = _assign__("Event", {})));
let _globalLeakWarningThreshold = -1;
function setGlobalLeakWarningThreshold(n) {
  const oldValue = _get__("_globalLeakWarningThreshold");
  _assign__("_globalLeakWarningThreshold", n);
  return {
    dispose() {
      _assign__("_globalLeakWarningThreshold", oldValue);
    }
  };
}
exports.setGlobalLeakWarningThreshold = _get__("setGlobalLeakWarningThreshold");
class LeakageMonitor {
  constructor(customThreshold, name = Math.random().toString(18).slice(2, 5)) {
    this.customThreshold = customThreshold;
    this.name = name;
    this._warnCountdown = 0;
  }
  dispose() {
    if (this._stacks) {
      this._stacks.clear();
    }
  }
  check(listenerCount) {
    let threshold = _get__("_globalLeakWarningThreshold");
    if (typeof this.customThreshold === 'number') {
      threshold = this.customThreshold;
    }
    if (threshold <= 0 || listenerCount < threshold) {
      return undefined;
    }
    if (!this._stacks) {
      this._stacks = new Map();
    }
    const stack = new Error().stack.split('\n').slice(3).join('\n');
    const count = this._stacks.get(stack) || 0;
    this._stacks.set(stack, count + 1);
    this._warnCountdown -= 1;
    if (this._warnCountdown <= 0) {
      // only warn on first exceed and then every time the limit
      // is exceeded by 50% again
      this._warnCountdown = threshold * 0.5;
      // find most frequent listener and print warning
      let topStack;
      let topCount = 0;
      this._stacks.forEach((count, stack) => {
        if (!topStack || topCount < count) {
          topStack = stack;
          topCount = count;
        }
      });
      console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
      console.warn(topStack);
    }
    return () => {
      const count = this._stacks.get(stack) || 0;
      this._stacks.set(stack, count - 1);
    };
  }
}
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
class Emitter {
  constructor(options) {
    this._disposed = false;
    this._options = options;
    this._leakageMon = _get__("_globalLeakWarningThreshold") > 0 ? new (_get__("LeakageMonitor"))(this._options && this._options.leakWarningThreshold) : undefined;
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    if (!this._event) {
      this._event = (listener, thisArgs, disposables) => {
        if (!this._listeners) {
          this._listeners = new (_get__("linkedList_1").LinkedList)();
        }
        const firstListener = this._listeners.isEmpty();
        if (firstListener && this._options && this._options.onFirstListenerAdd) {
          this._options.onFirstListenerAdd(this);
        }
        const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
        if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
          this._options.onFirstListenerDidAdd(this);
        }
        if (this._options && this._options.onListenerDidAdd) {
          this._options.onListenerDidAdd(this, listener, thisArgs);
        }
        // check and record this emitter for potential leakage
        let removeMonitor;
        if (this._leakageMon) {
          removeMonitor = this._leakageMon.check(this._listeners.size);
        }
        const result = {
          dispose: () => {
            if (removeMonitor) {
              removeMonitor();
            }
            result.dispose = _get__("Emitter")._noop;
            if (!this._disposed) {
              remove();
              if (this._options && this._options.onLastListenerRemove) {
                const hasListeners = this._listeners && !this._listeners.isEmpty();
                if (!hasListeners) {
                  this._options.onLastListenerRemove(this);
                }
              }
            }
          }
        };
        if (Array.isArray(disposables)) {
          disposables.push(result);
        }
        return result;
      };
    }
    return this._event;
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._listeners) {
      // put all [listener,event]-pairs into delivery queue
      // then emit all event. an inner/nested event might be
      // the driver of this
      if (!this._deliveryQueue) {
        this._deliveryQueue = [];
      }
      for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
        this._deliveryQueue.push([e.value, event]);
      }
      while (this._deliveryQueue.length > 0) {
        const [listener, event] = this._deliveryQueue.shift();
        try {
          if (typeof listener === 'function') {
            // eslint-disable-next-line no-useless-call
            listener.call(undefined, event);
          } else {
            listener[0].call(listener[1], event);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  dispose() {
    if (this._listeners) {
      this._listeners = undefined;
    }
    if (this._deliveryQueue) {
      this._deliveryQueue.length = 0;
    }
    if (this._leakageMon) {
      this._leakageMon.dispose();
    }
    this._disposed = true;
  }
}
exports.Emitter = _get__("Emitter");
_get__("Emitter")._noop = function () {};
class AsyncEmitter extends _get__("Emitter") {
  async fireAsync(eventFn) {
    if (!this._listeners) {
      return;
    }
    // put all [listener,event]-pairs into delivery queue
    // then emit all event. an inner/nested event might be
    // the driver of this
    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = [];
    }
    for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
      const thenables = [];
      this._asyncDeliveryQueue.push([e.value, eventFn(thenables, typeof e.value === 'function' ? e.value : e.value[0]), thenables]);
    }
    while (this._asyncDeliveryQueue.length > 0) {
      const [listener, event, thenables] = this._asyncDeliveryQueue.shift();
      try {
        if (typeof listener === 'function') {
          // eslint-disable-next-line no-useless-call
          listener.call(undefined, event);
        } else {
          listener[0].call(listener[1], event);
        }
      } catch (e) {
        console.error(e);
        continue;
      }
      // freeze thenables-collection to enforce sync-calls to
      // wait until and then wait for all thenables to resolve
      Object.freeze(thenables);
      await Promise.all(thenables);
    }
  }
}
exports.AsyncEmitter = _get__("AsyncEmitter");
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
class EventBufferer {
  constructor() {
    this.buffers = [];
  }
  wrapEvent(event) {
    return (listener, thisArgs, disposables) => {
      return event(i => {
        const buffer = this.buffers[this.buffers.length - 1];
        if (buffer) {
          buffer.push(() => listener.call(thisArgs, i));
        } else {
          listener.call(thisArgs, i);
        }
      }, undefined, disposables);
    };
  }
  bufferEvents(fn) {
    const buffer = [];
    this.buffers.push(buffer);
    const r = fn();
    this.buffers.pop();
    buffer.forEach(flush => flush());
    return r;
  }
}
exports.EventBufferer = _get__("EventBufferer");
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
class Relay {
  constructor() {
    this.listening = false;
    this.inputEvent = _get__("Event").None;
    this.inputEventListener = _get__("lifecycle_1").Disposable.None;
    this.emitter = new (_get__("Emitter"))({
      onFirstListenerDidAdd: () => {
        this.listening = true;
        this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
      },
      onLastListenerRemove: () => {
        this.listening = false;
        this.inputEventListener.dispose();
      }
    });
    this.event = this.emitter.event;
  }
  // eslint-disable-next-line accessor-pairs
  set input(event) {
    this.inputEvent = event;
    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }
  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }
}
exports.Relay = _get__("Relay");
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
    case "Emitter":
      return Emitter;
    case "Event":
      return Event;
    case "_globalLeakWarningThreshold":
      return _globalLeakWarningThreshold;
    case "setGlobalLeakWarningThreshold":
      return setGlobalLeakWarningThreshold;
    case "LeakageMonitor":
      return LeakageMonitor;
    case "linkedList_1":
      return linkedList_1;
    case "AsyncEmitter":
      return AsyncEmitter;
    case "EventBufferer":
      return EventBufferer;
    case "Relay":
      return Relay;
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
    case "Event":
      return Event = _value;
    case "_globalLeakWarningThreshold":
      return _globalLeakWarningThreshold = _value;
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