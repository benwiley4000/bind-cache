# bind-cache

Creates a cache of bound JavaScript functions created with [`Function.prototype.bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind).

* Only one instance is ever created for each unique set of arguments
* Designed to be allocated only for the lifetime of an associated object
* Works for binding call arguments to a method
* Ideal for React components

## usage

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.message = 'Hello World';

    // cache is garbage-collected whenever the
    // MyComponent instance is garbage-collected
    this.bind = bindCache(this);
  }

  handleClick() {
    alert(this.message);
  }

  render() {
    // across multiple renders, only one bound instance of this.handleClick
    // is ever created for this instance of MyComponent
    return <MyButton onClick={this.bind(this.handleClick)}>Click Me</MyButton>;
  }
}
```

### pass arguments to bound function

```jsx
  // ...
  handleClick(index) {
    alert(this.message + ' (index: ' + index + ')');
  }

  render() {
    return (
      <div>
        {this.props.dataList.map((data, i) =>
          // across multiple renders, only one bound instance of
          // this.handleClick is created for each member of this.props.dataList
          <MyButton onClick={this.bind(this.handleClick, i)}>{data}</MyButton>
        )}
      </div>
    );
  }
}
```

## install

With npm:

```console
npm install @benwiley4000/bind-cache
```

Using a script tag:

```html
<script src="https://unpkg.com/@benwiley4000/bind-cache"></script>
<script>
  console.log(bindCache); // should be a function
</script>
```

### dependencies

This library is written in plain ES5 JavaScript so it will run in any browser you'll need to support, but you might need to polyfill [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Browser_compatibility) and [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility) to support older browsers.

For compatibility, pass your substitutions for `Map` and `Symbol` in the optional second argument to `bindCache`:

```js
this.bind = bindCache(this, { Map: MapPolyfill, Symbol: SymbolPolyfill });
```

For `Map` you can try the [`es6-map` package](https://github.com/medikoo/es6-map).

For `Symbol` you can try the [`es6-symbol` package](https://www.npmjs.com/package/es6-symbol).

However if you prefer something less heavy you can probably get away with the following:

```js
function SymbolPolyfill() {
  // this should return something that you will NEVER pass
  // as an argument to bind - otherwise something could go wrong.
  return 1.513543544;
}
```

## API

### `bindCache(objectInstance[, options])`

allocates a new cache (optionally with `Map` and `Symbol` fallbacks) and returns a function `bind` which looks like:

### `bind(functionToBind[, ...callArguments])`

Each call to `bind(...)` returns a function bound to `objectInstance` (and optionally to an additional list of call arguments).

The cache is never emptied and lasts as long as `bind` is referenced somewhere in the application (after which it will be garbage-collected).

## why

In some cases a JavaScript class instance needs to pass one of its member methods around as a callback argument. Generally this method sound be bound to the class instance before being passed so that when invoked it will have access to the `this` context of that particular instance.

```jsx
  render() {
    // each time render is called, we bind a copy of handleClick to the
    // instance and pass it to our MyButton child as an onClick prop
    return <MyButton onClick={this.handleClick.bind(this)}>Click Me</MyButton>;
  }
```

In the world of React components in particular (and perhaps others), it's typically desirable to bind the method only once and pass that bound method many times in the render method. Creating a new bound instance on each render can cause unnecessary re-renders in child components.

Typically this approach takes one of two forms:
* Bind in the constructor
    ```jsx
    class MyComponent extends React.Component {
      constructor(props) {
        super(props);
        // when the instance is created, we grab our methods
        // from the prototype and created bound copies on
        // the instance
        this.handleClick = this.handleClick.bind(this);
        this.handleHover = this.handleHover.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
      }

      render() {
        return <MyButton onClick={this.handleClick}>Click Me</MyButton>;
      }
    }
    ```
* Use arrow function class "methods"
    ```jsx
    class MyComponent extends React.Component {
      // when the instance is created, we create new
      // arrow function members bound to our instance
      handleClick = () => {
        // ...
      };

      handleHover = () => {
        // ...
      };

      handleBlur = () => {
        // ...
      };

      render() {
        return <MyButton onClick={this.handleClick}>Click Me</MyButton>;
      }
    }
    ```

Each of these approaches can be problematic:
* Binding in the constructor introduces a lot of boilerplate that is annoying to maintain
* Binding with arrow function members relies on the JavaScript [class fields proposal](https://github.com/tc39/proposal-class-fields) which has not yet made it into the ECMAScript specification
* Binding with arrow function members also means our methods are excluded from the class prototype, which can be a problem for testing, or if you are overriding a method in a derived class (rare in the React world, but certainly possible)
* Each approach doesn't lend itself well to cases where functions need to be bound with additional call arguments. That case comes up when, for instance, an array of children needs to be rendered, each with a bound callback prop.

`bindCache` avoids all of the above problems.

## comparisons to prior work

[cached-bind](https://github.com/megazazik/cached-bind) by megazazik solves the same issues, but bind-cache has a few advantages:
* Doesn't modify the object
* No need for a `key` argument
* Much simpler/smaller implementation (plain ES5)

However cached-bind doesn't require `Map` or `Symbol`, so it can work without polyfills in older browsers.

## contributing

Please feel free to open a pull request with test cases or bug fixes.
