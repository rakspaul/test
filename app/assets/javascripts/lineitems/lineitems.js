(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    defaults: {
      volume: 0,
      rate: 0.0,
      start_date: moment().add('days', 1).format("YYYY-MM-DD"),
      end_date: moment().add('days', 15).format("YYYY-MM-DD")
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.get("order_id") + '/lineitems.json';
      } else {
        return '/orders/' + this.get("order_id") + '/lineitems/' + this.id + '.json';
      }
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
    className: 'lineitem-row',
    template: JST['templates/lineitems/line_item_row'],

    triggers: {
      'click': 'lineitem:show'
    }
  });

  LineItems.LineItemListView = Backbone.Marionette.CompositeView.extend({
    itemView: LineItems.LineItemView,
    itemViewContainer: 'tbody',
    template: JST['templates/lineitems/line_item_table'],
    className: 'table-container',

    triggers: {
      'click .create': 'lineitem:create'
    }
  });

  LineItems.LineItemLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/lineitems/new_line_item_layout'],
    regions: {
      properties: '.properties-region',
      adsizes: '.ad-sizes-region',
    },

    triggers: {
      'click .save-lineitem': 'lineitem:save',
      'click .close-lineitem': 'lineitem:close'
    }
  });

  LineItems.LineItemDetailView = Backbone.Marionette.ItemView.extend({
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

    onDomRefresh: function() {
      // initial flight values
      this.ui.start_date.val(this.model.get("start_date"));
      this.ui.end_date.val(this.model.get("end_date"));

      var self = this;
      this.ui.flight_container.daterangepicker({
        format: 'YYYY-MM-DD',
        separator: ' to ',
        startDate: this.ui.start_date.val(),
        endDate: this.ui.end_date.val()
      },
      function(start, end) {
        if(start) {
          self.ui.start_date.val(start.format("YYYY-MM-DD"));
          self.ui.end_date.val(end.format("YYYY-MM-DD"));
          self.ui.flight.text(self.ui.start_date.val() + " to " + self.ui.end_date.val());
        }
      });

      this.ui.flight.text(this.ui.start_date.val() + " to " + this.ui.end_date.val());
    }
  });

  LineItems.LineItemController = Marionette.Controller.extend({
    initialize: function(options) {
      this.mainRegion = options.mainRegion;
      this.lineItemModel = options.model;
    },

    show: function() {
      var layout = this._getLayout();
      this.mainRegion.show(layout);
    },

    _getLayout: function() {
      var layout = new LineItems.LineItemLayout();

      layout.on("render", function() {
        this._showProperties(layout);
        this._showAdSizes(layout);
      }, this);

      layout.on("lineitem:save", function(evt) {
        this._saveLineitem();
      }, this);

      layout.on("lineitem:close", function(evt) {
        this.trigger("lineitem:close");
      }, this);

      return layout;
    },

    _showProperties: function(layout) {
      this.lineItemView = new LineItems.LineItemDetailView({model: this.lineItemModel});
      layout.properties.show(this.lineItemView);
    },

    _showAdSizes: function(layout) {
      this.adSizeList = new LineItems.AdSizeList();
      var adSizeListView = new LineItems.AdSizeCheckboxList({collection: this.adSizeList});
      adSizeListView.on("after:item:added", this._setSelectedAdSizes, this);
      layout.adsizes.show(adSizeListView);

      this.adSizeList.fetch();
    },

    _setSelectedAdSizes: function(view) {
      var strAdSizes = this.lineItemModel.get("ad_sizes");

      if(strAdSizes) {
        var tmpAdSizeList = strAdSizes.split(',');
        if(tmpAdSizeList.indexOf(view.model.get("size")) !== -1) {
          view.model.selected();
        }
      }
    },

    _saveLineitem: function() {
      var selectedSizes = this.adSizeList.getSelected();
      var mj = {
        'name': this.lineItemView.ui.name.val(),
        'active': this.lineItemView.ui.active.prop('checked'),
        'start_date': this.lineItemView.ui.start_date.val(),
        'end_date': this.lineItemView.ui.end_date.val(),
        'volume': this.lineItemView.ui.volume.val(),
        'rate': this.lineItemView.ui.rate.val(),
        'ad_sizes': _.map(selectedSizes, function(size) { return size.get('size'); }).join(',')
      };

      var self = this;

      // get all the error labels and clear them
      _.keys(this.lineItemView.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.lineItemView.ui[val].text("");
        });

      this.lineItemModel.save(mj, {
        success: function(model, response, options) {
          self.trigger("lineitem:saved", model);
        },
        error: function(model, xhr, options) {
          if(xhr.responseJSON && xhr.responseJSON.errors) {
            _.each(xhr.responseJSON.errors, function(value, key) {
              var errorLabel = self.lineItemView.ui[key + "_error"];
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
