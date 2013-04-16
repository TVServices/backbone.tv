$(document).ready(function() {

  var view;
  var DerivedView = Backbone.View.extend({
    initialize: function() {
      this.$el.html("<div class='one'></div><div class='two'></div>");
    },
  });

  module("Backbone.View", {

    setup: function() {
      view = new Backbone.View({
        id        : 'test-view',
        className : 'test-view',
        other     : 'non-special-option'
      });
    }

  });

  test("constructor", 8, function() {
    equal(view.el.id, 'test-view');
    equal(view.el.className, 'test-view');
    equal(view.el.other, void 0);
    equal(view.options.id, 'test-view');
    equal(view.options.className, 'test-view');
    equal(view.options.other, 'non-special-option');
    equal(view.children.length, 0);
    equal(view.inputFocus, null);
  });

  test("jQuery", 1, function() {
    var view = new Backbone.View;
    view.setElement('<p><a><b>test</b></a></p>');
    strictEqual(view.$('a b').html(), 'test');
  });

  test("initialize", 1, function() {
    var View = Backbone.View.extend({
      initialize: function() {
        this.one = 1;
      }
    });

    strictEqual(new View().one, 1);
  });

  test("_ensureElement with DOM node el", 1, function() {
    var View = Backbone.View.extend({
      el: document.body
    });

    equal(new View().el, document.body);
  });

  test("_ensureElement with string el", 3, function() {
    var View = Backbone.View.extend({
      el: "body"
    });
    strictEqual(new View().el, document.body);

    View = Backbone.View.extend({
      el: "#testElement > h1"
    });
    strictEqual(new View().el, $("#testElement > h1").get(0));

    View = Backbone.View.extend({
      el: "#nonexistent"
    });
    ok(!new View().el);
  });

  test("with className and id functions", 2, function() {
    var View = Backbone.View.extend({
      className: function() {
        return 'className';
      },
      id: function() {
        return 'id';
      }
    });

    strictEqual(new View().el.className, 'className');
    strictEqual(new View().el.id, 'id');
  });

  test("with options function", 3, function() {
    var View1 = Backbone.View.extend({
      options: function() {
        return {
          title: 'title1',
          acceptText: 'confirm'
        };
      }
    });

    var View2 = View1.extend({
      options: function() {
        return _.extend(View1.prototype.options.call(this), {
          title: 'title2',
          fixed: true
        });
      }
    });

    strictEqual(new View2().options.title, 'title2');
    strictEqual(new View2().options.acceptText, 'confirm');
    strictEqual(new View2().options.fixed, true);
  });

  test("with attributes", 2, function() {
    var View = Backbone.View.extend({
      attributes: {
        id: 'id',
        'class': 'class'
      }
    });

    strictEqual(new View().el.className, 'class');
    strictEqual(new View().el.id, 'id');
  });

  test("with attributes as a function", 1, function() {
    var View = Backbone.View.extend({
      attributes: function() {
        return {'class': 'dynamic'};
      }
    });

    strictEqual(new View().el.className, 'dynamic');
  });

  test("#1048 - setElement uses provided object.", 2, function() {
    var $el = $('body');

    var view = new Backbone.View({el: $el});
    ok(view.$el === $el);

    view.setElement($el = $($el));
    ok(view.$el === $el);
  });

  test("#1172 - Clone attributes object", 2, function() {
    var View = Backbone.View.extend({
      attributes: {foo: 'bar'}
    });

    var view1 = new View({id: 'foo'});
    strictEqual(view1.el.id, 'foo');

    var view2 = new View();
    ok(!view2.el.id);
  });

  test("#1228 - tagName can be provided as a function", 1, function() {
    var View = Backbone.View.extend({
      tagName: function() {
        return 'p';
      }
    });

    ok(new View().$el.is('p'));
  });

  test("views stopListening", 0, function() {
    var View = Backbone.View.extend({
      initialize: function() {
        this.listenTo(this.model, 'all x', function(){ ok(false); }, this);
        this.listenTo(this.collection, 'all x', function(){ ok(false); }, this);
      }
    });

    var view = new View({
      model: new Backbone.Model,
      collection: new Backbone.Collection
    });

    view.stopListening();
    view.model.trigger('x');
    view.collection.trigger('x');
  });

  test("Provide function for el.", 1, function() {
    var View = Backbone.View.extend({
      el: function() {
        return "<p><a></a></p>";
      }
    });

    var view = new View;
    ok(view.$el.is('p:has(a)'));
  });

  test("addChild", 4, function() {
    var child1 = new Backbone.View;
    var child2 = new Backbone.View;
    view.addChild(child1);
    equal(view.children.length, 1);

    view.addChild(child2);
    equal(view.children.length, 2);
    equal(view.children[0], child1);
    equal(view.children[1], child2);
  });

  test("addChildAt", 4, function() {
    var c1 = new Backbone.View();
    var c2 = new Backbone.View();
    var c3 = new Backbone.View();

    view.addChildAt(c1, 0);
    view.addChildAt(c2, 1);
    view.addChildAt(c3, 1);
    equal(view.children.length, 3);
    equal(view.children[0], c1);
    equal(view.children[1], c3);
    equal(view.children[2], c2);
  });

  test("getChildren", 4, function() {
    var child1 = new Backbone.View;
    var child2 = new Backbone.View;
    view.addChild(child1);
    view.addChild(child2);

    var children = view.getChildren();
    equal(view.children[0], children[0]);
    equal(view.children[1], children[1]);
    equal(view.children[0], child1);
    equal(view.children[1], child2);
  });

  test("getChildIndex", 3, function() {
    var view2 = new Backbone.View;
    var child1 = new Backbone.View;
    var child2 = new Backbone.View;
    view.addChild(child1);
    view.addChild(child2);

    equal(view.getChildIndex(child1), 0);
    equal(view.getChildIndex(child2), 1);
    equal(view.getChildIndex(view2), -1);
  });

  test("setFocus", 7, function() {
    var child1 = new Backbone.View;
    var child2 = new Backbone.View;
    view.addChild(child1);
    view.addChild(child2);

    equal(view.inputFocus, null);
    ok(view.setFocus(child1));
    equal(view.inputFocus, child1);
    ok(view.setFocus(null));
    equal(view.inputFocus, null);

    var view2 = new Backbone.View;
    ok(!view.setFocus(view2));
    equal(view.inputFocus, null);
  });

  test("getFocus", 3, function() {
    var child1 = new Backbone.View;
    var child2 = new Backbone.View;
    view.addChild(child1);
    view.addChild(child2);

    equal(view.getFocus(), null);
    view.setFocus(child1);
    equal(view.getFocus(), child1);
    view.setFocus(null);
    equal(view.getFocus(), null);
  });

  test("children are added to dom in the correct order", 4, function() {
    var c1 = new Backbone.View();
    var c2 = new Backbone.View();
    var c3 = new Backbone.View();

    view.addChildAt(c1, 0);
    view.addChildAt(c2, 1);
    view.addChildAt(c3, 1);
    equal(view.el.children.length, 3);
    equal(view.el.children[0], c1.el);   
    equal(view.el.children[1], c3.el);   
    equal(view.el.children[2], c2.el);   
  });

  test("addChild adds ele's to the correct element", 2, function() {
    var view = new DerivedView({containerSelector: '.two'});
    var c = new Backbone.View();
    view.addChild(c);
    var container = view.getChildContainer();
    equal(container.children().length, 1);
    equal(container.children()[0], c.el);   
  });

  test("getChildContainer returns the correct container", 2, function() {
    equal(view.getChildContainer()[0], view.$el[0]);
    var derived = new DerivedView({containerSelector: '.two'});
    equal(derived.getChildContainer()[0], derived.$('.two')[0]);
  }),

  test("addChiltAt adds ele's to the correct element", 2, function() {
    var view = new DerivedView({containerSelector: '.two'});
    var c = new Backbone.View();
    view.addChildAt(c, 0);
    var container = view.getChildContainer();
    equal(container.children().length, 1);
    equal(container.children()[0], c.el);   
  });

  test("syncChildren blows away garbage", 2, function() {
    var div = document.createElement('div');
    view.getChildContainer().append(div);
    equal(view.getChildContainer().children().length, 1);
    view.syncChildren();
    equal(view.el.children.length, 0);
  });

  test("syncChildren re-adds all children in order", 5, function() {
    var c1 = new Backbone.View();
    var c2 = new Backbone.View();
    var c3 = new Backbone.View();

    view.addChild(c1);
    view.addChild(c2);
    view.addChildAt(c3, 1);
    var div = document.createElement('div');
    view.getChildContainer().append(div);
    equal(view.getChildContainer().children().length, 4);
    view.syncChildren();
    equal(view.el.children.length, 3);
    equal(view.el.children[0], c1.el);   
    equal(view.el.children[1], c3.el);   
    equal(view.el.children[2], c2.el);   
  });

});
