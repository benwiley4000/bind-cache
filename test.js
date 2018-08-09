const assert = require('assert');
const bindCache = require('.');

// TEST HELPERS

function run(...args) {
  return args.map(arg => arg());
}

let passedAssertions = 0;
let failedAssertions = 0;

function checkAssertion(assertion) {
  try {
    assert(assertion);
    passedAssertions++;
  } catch(e) {
    console.error(e);
    failedAssertions++;
  }
}

function reportTestResults() {
  console.log(`${passedAssertions} assertions passed.`);
  console.log(`${failedAssertions} assertions failed.`);
  if (failedAssertions) {
    process.exit(1);
  }
}


// TEST DEFINITIONS

function runTests() {
  let instance;

  function getBarResult(myArg, mySecondArg) {
    return myArg + mySecondArg;
  }

  const argument1 = 'hey';
  const argument2 = 'ho';
  const result1 = 'myresult';
  const result2 = getBarResult(argument1, argument2);

  class MyClass {
    constructor() {
      instance = this;
      this.bind = bindCache(this);
      const boundFoo = this.bind(this.foo);
      const boundBar = this.bind(this.bar, argument1, argument2);

      // check that function calls execute successfully
      const [fooResult, barResult] = run(boundFoo, boundBar);
      checkAssertion(fooResult === result1);
      checkAssertion(barResult === result2);

      // check that calls to bind with the same set of function+arguments
      // return the same bound function
      checkAssertion(this.bind(this.foo) === boundFoo);
      checkAssertion(this.bind(this.bar, argument1, argument2) === boundBar);

      // check that different functions don't return the bound function
      checkAssertion(boundFoo !== boundBar);

      // check that the same function with different arguments returns
      // a different bound function
      checkAssertion(this.bind(this.foo, argument1) !== boundFoo);
      checkAssertion(this.bind(this.bar, argument1) !== boundBar);
      checkAssertion(this.bind(this.bar) !== boundBar);
    }

    foo() {
      checkAssertion(this === instance);
      return result1;
    }

    bar(myArg, mySecondArg) {
      checkAssertion(this === instance);
      checkAssertion(myArg === argument1);
      checkAssertion(mySecondArg === argument2);
      return getBarResult(myArg, mySecondArg);
    }
  }

  new MyClass();
}


// RUN TESTS

runTests();
reportTestResults();
