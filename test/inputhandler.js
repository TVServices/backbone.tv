$(document).ready(function() {

  var ele;
  var view;
  var actionMap;
  var handler;

  module("Backbone.InputHandler", {

    setup: function() {
      ele = { // book keeping for the tests
        types: [],
        callbacks: [],
        addEventListener: function(type, callback) {
          this.types.push(type);
          this.callbacks.push(callback);
        } 
      };
      actionMap = {
        25: 50
      };
      view = new Backbone.View();
      handler = new Backbone.InputHandler(ele, view, actionMap);
    }

  });

  test("constructor", 3, function() {
    equal(handler.rootView, view);
    equal(handler.rootEle, ele);
    equal(handler.actionMap, actionMap);
  });

  test("initialize", 3, function() {
    equal(ele.types.length, 2);
    ok(ele.types.indexOf('keydown') !== -1);
    ok(ele.types.indexOf('keyup') !== -1);
  });

  test("initializeEvent", 6, function() {
    var captures = [];
    var onevents = [];
    var events = [];
    handler.walkViews = function(cap, onE, e) {
      captures.push(cap);
      onevents.push(onE);
      events.push(e);
    };
    ele.callbacks[0]('event1');
    ele.callbacks[1]('event2');
    equal(captures[0], 'captureKeyDown');
    equal(captures[1], 'captureKeyUp');
    equal(onevents[0], 'onKeyDown');
    equal(onevents[1], 'onKeyUp');
    equal(events[0], 'event1');
    equal(events[1], 'event2');
  });

  test("walkViews: event has action if keyCode is in actionMap", 3, function() {
    var action;
    view.onKeyDown = function(event) {
      action = event.action;
    };

    handler.walkViews('captureKeyDown', 'onKeyDown', {keyCode:25});
    equal(action, 50);
    handler.walkViews('captureKeyDown', 'onKeyDown', {keyCode:10});
    equal(action, null);
    handler.walkViews('captureKeyDown', 'onKeyDown', {});
    equal(action, null);
  });

  test("walkViews: calls callbacks in focus path in correct order", 1, function() {
    var log = [];
    var View = Backbone.View.extend({
      captureKeyDown: function(e) {
        log.push(this.name + ': capture');
        return false;
      },
      onKeyDown: function(e) {
        log.push(this.name + ': handle');
        return false;
      }
    });
    var a = new View, b = new View, c = new View, d = new View;
    view.addChild(a);
    view.setFocus(a);
    a.name = 'a';
    a.addChild(b);
    a.setFocus(b);
    b.name = 'b';
    b.addChild(c);
    b.setFocus(c);
    c.name = 'c';
    c.addChild(d);

    var handler = new Backbone.InputHandler(ele, view);
    handler.walkViews('captureKeyDown', 'onKeyDown', {});

    deepEqual(log, ['a: capture', 'b: capture', 'c: capture'
                  , 'c: handle', 'b: handle', 'a: handle']);
  });

  test("walkViews: respects captures and stops walking the focus path", 1, function() {
    var log = [];
    var View = Backbone.View.extend({
      captureKeyDown: function(e) {
        log.push(this.name + ': capture');
        return true;
      },
      onKeyDown: function(e) {
        log.push(this.name + ': handle');
        return false;
      }
    });
    var a = new View, b = new View;
    view.addChild(a);
    view.setFocus(a);
    a.name = 'a';
    a.addChild(b);
    a.setFocus(b);
    b.name = 'b';

    var handler = new Backbone.InputHandler(ele, view);
    handler.walkViews('captureKeyDown', 'onKeyDown', {});

    deepEqual(log, ['a: capture', 'a: handle']);
  });

  test("walkViews: when a view handles an event, no further callbacks are called", 1, function() {
    var log = [];
    var View = Backbone.View.extend({
      captureKeyDown: function(e) {
        log.push(this.name + ': capture');
        return false;
      },
      onKeyDown: function(e) {
        log.push(this.name + ': handle');
        return true;
      }
    });
    var a = new View, b = new View;
    view.addChild(a);
    view.setFocus(a);
    a.name = 'a';
    a.addChild(b);
    a.setFocus(b);
    b.name = 'b';

    var handler = new Backbone.InputHandler(ele, view);
    handler.walkViews('captureKeyDown', 'onKeyDown', {});

    deepEqual(log, ['a: capture', 'b: capture', 'b: handle']);
  });

});
