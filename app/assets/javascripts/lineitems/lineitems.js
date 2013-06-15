(function(LineItems) {
  LineItems.LineItem = Backbone.Model.extend({
    initialize: function(opts) {
      this.order = opts.order;
    },

    url: function() {
      return '/orders/' + this.order.id + '/lineitems.json';
    },

    toJSON: function() {
      return { lineitem: _.clone(this.attributes) };
    }
  });

  LineItems.LineItemList = Backbone.Collection.extend({
    model: LineItems.LineItem,
    url: function() {
      return '/orders/' + this.order.id + '/lineitems.json';
    },
    setOrder: function(order) {
      this.order = order;
    }
  });

  LineItems.LineItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/lineitems/line_item_row']
  });

  LineItems.LineItemListView = Backbone.Marionette.CompositeView.extend({
    itemView: LineItems.LineItemView,
    itemViewContainer: 'tbody',
    template: JST['templates/lineitems/line_item_table'],
    className: 'table-container',

    triggers: {
      'click .create': 'create:lineitem'
    }
  });

  LineItems.NewLineItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/lineitems/new_line_item'],

    ui: {
      name: '#name',
      active: '#active',
      start_date: '#start_date',
      end_date: '#end_date',
      volume: '#volume',
      rate: '#rate'
    },

    events: {
      'click .save': 'create'
    },

    create: function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var mj = {
        'name': this.ui.name.val(),
        'active': this.ui.active.prop('checked'),
        'start_date': this.ui.start_date.val(),
        'end_date': this.ui.end_date.val(),
        'volume': this.ui.volume.val(),
        'rate': this.ui.rate.val()
      };

      var self = this;
      this.model.save(mj, {
        success: function(model, response, options) {
          self.trigger("lineitem:created", model);
        },
        error: function(model, xhr, options) {
          alert('error');
        }
      });
    }
  });
})(ReachUI.namespace("LineItems"));
