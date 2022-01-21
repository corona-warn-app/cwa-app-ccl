/* eslint-disable */
/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import assert from 'assert'
import {
  factory as jfnFactory
} from '../../../lib/jfn/jfn-main.js'

import allTests from './../../fixtures/jfn/json-logic-tests/tests.json'

describe('default tests', () => {

  let jfn
  beforeEach(() => {
    jfn = jfnFactory()
  })

  it.skip( "logging", () => {
    var last_console;
    console.log = function(logged) {
      last_console = logged;
    };
    assert.equal( jfn.apply({"log": [1]}), 1 );
    assert.equal( last_console, 1 );
  });

  it('edge cases', () => {
    assert.equal( jfn.apply(), undefined, "Called with no arguments" );

    assert.equal( jfn.apply({ var: "" }, 0), 0, "Var when data is 'falsy'" );
    assert.equal( jfn.apply({ var: "" }, null), null, "Var when data is null" );
    assert.equal( jfn.apply({ var: "" }, undefined), undefined, "Var when data is undefined" );
  
    assert.equal( jfn.apply({ var: ["a", "fallback"] }, undefined), "fallback", "Fallback works when data is a non-object" );
  })

  it.skip('Expanding functionality with add_operator', () => {
    // Operator is not yet defined
    assert.throws(
      function() {
        jfn.apply({"add_to_a": []});
      },
      /Unrecognized operation/
    );
  
    // Set up some outside data, and build a basic function operator
    var a = 0;
    var add_to_a = function(b) {
      if (b === undefined) {
        b=1;
      } return a += b;
    };
    jfn.add_operation("add_to_a", add_to_a);
    // New operation executes, returns desired result
    // No args
    assert.equal( jfn.apply({"add_to_a": []}), 1 );
    // Unary syntactic sugar
    assert.equal( jfn.apply({"add_to_a": 41}), 42 );
    // New operation had side effects.
    assert.equal(a, 42);
  
    var fives = {
      add: function(i) {
        return i + 5;
      },
      subtract: function(i) {
        return i - 5;
      },
    };
  
    jfn.add_operation("fives", fives);
    assert.equal( jfn.apply({"fives.add": 37}), 42 );
    assert.equal( jfn.apply({"fives.subtract": [47]}), 42 );
  
    // Calling a method with multiple var as arguments.
    jfn.add_operation("times", function(a, b) {
      return a*b;
    });
    assert.equal(
      jfn.apply(
        {"times": [{"var": "a"}, {"var": "b"}]},
        {a: 6, b: 7}
      ),
      42
    );
  
    // Remove operation:
    jfn.rm_operation("times");
  
    assert.throws(
      function() {
        jfn.apply({"times": [2, 2]});
      },
      /Unrecognized operation/
    );
  
    // Calling a method that takes an array, but the inside of the array has rules, too
    jfn.add_operation("array_times", function(a) {
      return a[0]*a[1];
    });
    assert.equal(
      jfn.apply(
        {"array_times": [[{"var": "a"}, {"var": "b"}]]},
        {a: 6, b: 7}
      ),
      42
    );
  });

  it("Control structures don't eval depth-first", () => {
    // Depth-first recursion was wasteful but not harmful until we added custom operations that could have side-effects.
  
    // If operations run the condition, if truthy, it runs and returns that consequent.
    // Consequents of falsy conditions should not run.
    // After one truthy condition, no other condition should run
    var conditions = [];
    var consequents = [];
    jfn.add_operation("pushTest.if", function(v) {
      conditions.push(v); return v;
    });
    jfn.add_operation("pushTest.then", function(v) {
      consequents.push(v); return v;
    });
    jfn.add_operation("pushTest.else", function(v) {
      consequents.push(v); return v;
    });
  
    jfn.apply({"if": [
      {"pushTest.if": [true]},
      {"pushTest.then": ["first"]},
      {"pushTest.if": [false]},
      {"pushTest.then": ["second"]},
      {"pushTest.else": ["third"]},
    ]});
    assert.deepEqual(conditions, [true]);
    assert.deepEqual(consequents, ["first"]);
  
    conditions = [];
    consequents = [];
    jfn.apply({"if": [
      {"pushTest.if": [false]},
      {"pushTest.then": ["first"]},
      {"pushTest.if": [true]},
      {"pushTest.then": ["second"]},
      {"pushTest.else": ["third"]},
    ]});
    assert.deepEqual(conditions, [false, true]);
    assert.deepEqual(consequents, ["second"]);
  
    conditions = [];
    consequents = [];
    jfn.apply({"if": [
      {"pushTest.if": [false]},
      {"pushTest.then": ["first"]},
      {"pushTest.if": [false]},
      {"pushTest.then": ["second"]},
      {"pushTest.else": ["third"]},
    ]});
    assert.deepEqual(conditions, [false, false]);
    assert.deepEqual(consequents, ["third"]);
  
  
    jfn.add_operation("pushTest", function(arg) {
      i.push(arg); return arg;
    });
    var i = [];
  
    i = [];
    jfn.apply({"and": [{"pushTest": [false]}, {"pushTest": [false]}]});
    assert.deepEqual(i, [false]);
    i = [];
    jfn.apply({"and": [{"pushTest": [false]}, {"pushTest": [true]}]});
    assert.deepEqual(i, [false]);
    i = [];
    jfn.apply({"and": [{"pushTest": [true]}, {"pushTest": [false]}]});
    assert.deepEqual(i, [true, false]);
    i = [];
    jfn.apply({"and": [{"pushTest": [true]}, {"pushTest": [true]}]});
    assert.deepEqual(i, [true, true]);
  
  
    i = [];
    jfn.apply({"or": [{"pushTest": [false]}, {"pushTest": [false]}]});
    assert.deepEqual(i, [false, false]);
    i = [];
    jfn.apply({"or": [{"pushTest": [false]}, {"pushTest": [true]}]});
    assert.deepEqual(i, [false, true]);
    i = [];
    jfn.apply({"or": [{"pushTest": [true]}, {"pushTest": [false]}]});
    assert.deepEqual(i, [true]);
    i = [];
    jfn.apply({"or": [{"pushTest": [true]}, {"pushTest": [true]}]});
    assert.deepEqual(i, [true]);
  });

  context('tests from tests.json', () => {
    const tests = allTests
      .filter(function(test) {
        return typeof test !== "string";
      })
    
    tests.forEach((test, idx) => {
      it(`test case ${idx} - ${JSON.stringify(test[0])} - ${JSON.stringify(test[1])} - ${JSON.stringify(test[2])}`, () => {
        var rule = test[0];
        var data = test[1];
        var expected = test[2];
    
        assert.deepEqual(
          jfn.apply(rule, data),
          expected,
          "jfn.apply("+ JSON.stringify(rule) +"," +
            JSON.stringify(data) +") === " +
            JSON.stringify(expected)
        );
      })
    })

  })
})