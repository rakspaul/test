(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    defaults: {
      volume: 0,
      rate: 0.0,
      start_date: moment().add('days', 1).format("YYYY-MM-DD"),
      end_date: moment().add('days', 15).format("YYYY-MM-DD")
    },

    initialize: function(attrs, opts) {
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
      flight: '#flight',
      flight_container: '.flight-input',
      start_date: '#start_date',
      end_date: '#end_date',
      volume: '#volume',
      rate: '#rate',
      name_error: '#name_error',
      start_date_error: '#start_date_error',
      end_date_error: '#end_date_error',
      volume_error: '#volume_error',
      rate_error: '#rate_error'
    },

    events: {
      'click .save': 'create'
    },

    onDomRefresh: function() {
      var self = this;
      this.ui.flight_container.daterangepicker({
        format: 'YYYY-MM-DD',
        separator: ' to ',
        startDate: moment().add('days', 1),
        endDate: moment().add('days', 15)
      },
      function(start, end) {
        if(start) {
          self.ui.start_date.val(start.format("YYYY-MM-DD"));
          self.ui.end_date.val(end.format("YYYY-MM-DD"));
          self.ui.flight.text(this.ui.start_date.val() + " to " + this.ui.end_date.val());
        }
      });

      // initial flight values
      this.ui.start_date.val(this.model.get("start_date"));
      this.ui.end_date.val(this.model.get("end_date"));
      this.ui.flight.text(this.ui.start_date.val() + " to " + this.ui.end_date.val());
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

      // get all the error labels and clear them
      _.keys(this.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.ui[val].text("");
        });

      this.model.save(mj, {
        success: function(model, response, options) {
          self.trigger("lineitem:created", model);
        },
        error: function(model, xhr, options) {
          if(xhr.responseJSON && xhr.responseJSON.errors) {
            _.each(xhr.responseJSON.errors, function(value, key) {
              var errorLabel = self.ui[key + "_error"];
              if(errorLabel) {
                errorLabel.text(value[0]);
              }
            });
          }
        }
      });
    }
  });
})(ReachUI.namespace("LineItems"));
