function bindCache(instance, options) {
  options = options || {};
  // for Map/Symbol, if unavailable in global scope, use supplied ponyfills
  var _Map = typeof Map === 'undefined' ? options.Map : Map;
  var _Symbol = typeof Symbol === 'undefined' ? options.Symbol : Symbol;

  var cache = new _Map();
  var boundFnSymbol = _Symbol();
  var slice = Array.prototype.slice;

  // the only named argument is fn, the function to bind, but
  // bind accepts any number of additional call arguments to
  // be bound
  return function bind(fn) {
    var c = cache;
    // iterate each argument (fn, and any call arguments)
    // to find a cache specific to that set of arguments
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!c.has(arg)) {
        c.set(arg, new _Map());
      }
      c = c.get(arg);
    }

    // boundFnSymbol is a unique key in the cache for this
    // set of arguments that will never conflict with another
    // argument that could be passed to create a sub-cache
    if (!c.has(boundFnSymbol)) {
      c.set(
        boundFnSymbol,
        fn.bind.apply(fn, [instance].concat(slice.call(arguments, 1)))
      );
    }

    return c.get(boundFnSymbol);
  };
}

if (typeof module !== 'undefined' && module) {
  module.exports = bindCache;
}
