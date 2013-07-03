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
    },

    getOrder: function() {
      return this.order;
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
    template: JST['templates/lineitems/line_item_detail_layout'],
    className: 'lineitem-details',

    regions: {
      properties: '.properties-region',
      adsizes: '.ad-sizes-region',
    },

    triggers: {
      'click .save-lineitem': 'lineitem:save',
      'click .close-lineitem': 'lineitem:close'
    },

    initialize: function() {
      _.bindAll(this, '_close_form');
      Mousetrap.bind(['esc'], this._close_form);
    },

    onClose: function() {
      Mousetrap.unbind('esc');
    },

    _close_form: function() {
      this.trigger('lineitem:close');
    }
  });

  LineItems.LineItemDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/lineitems/line_item_detail'],

    ui: {
      name: '#name',
      active: '#active',
      flight: '#flight',
      flight_container: '.flight-input',
      start_date: '#start_date',
      end_date: '#end_date',
      volume: '#volume',
      rate: '#rate',
      media_cost: '#media_cost',
      name_error: '#name_error',
      start_date_error: '#start_date_error',
      end_date_error: '#end_date_error',
      volume_error: '#volume_error',
      rate_error: '#rate_error'
    },

    events: {
      'change #volume': '_calculate_media_cost',
      'change #rate': '_calculate_media_cost'
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
      this._calculate_media_cost();
    },

    onClose: function() {
      this.ui.flight_container.daterangepicker('destroy');
    },

    _calculate_media_cost: function() {
      var imps = parseInt(this.ui.volume.val(), 10),
        cpm = parseFloat(this.ui.rate.val(), 10);
      this.ui.media_cost.val(imps/1000 * cpm);
    }
  });

  LineItems.LineItemController = Marionette.Controller.extend({
    initialize: function(options) {
      this.mainRegion = options.mainRegion;
      this.adSizeList = new LineItems.AdSizeList();
      _.bindAll(this, '_adSizeLoadError', '_onSaveSuccess', '_onSaveFailure');
    },

    show: function(lineitem) {
      this._clearAdSizeSelection();
      this.lineItemModel = lineitem;

      this._createLayout();
      this.mainRegion.show(this.layout);
    },

    // Ad sizes are cached, therefore clear any previously selected
    // ad sizes.
    _clearAdSizeSelection: function() {
      this.adSizeList.forEach(function(adSize) {
        adSize.set({selected: false}, {silent: true});
      });
    },

    _createLayout: function() {
      this.layout = new LineItems.LineItemLayout();

      this.layout.on("render", function() {
        this._showProperties();
        this._showAdSizes();
      }, this);

      this.layout.on("lineitem:save", function(evt) {
        this._saveLineitem();
      }, this);

      this.layout.on("lineitem:close", function(evt) {
        this.trigger("lineitem:close");
      }, this);
    },

    _showProperties: function() {
      this.lineItemView = new LineItems.LineItemDetailView({model: this.lineItemModel});
      this.layout.properties.show(this.lineItemView);
    },

    _showAdSizes: function() {
      if(this.adSizeList.length === 0) {
        this.adSizeList.fetch({error: this._adSizeLoadError});
      }

      var adSizeListView = new LineItems.AdSizeCheckboxList({collection: this.adSizeList});
      adSizeListView.on("after:item:added", this._setSelectedAdSizes, this);
      this.layout.adsizes.show(adSizeListView);
    },

    _adSizeLoadError: function() {
      var errorModel = new ReachUI.Error({message: 'Error loading ad sizes'}),
        inlineErrorView = new ReachUI.InlineErrorView({model: errorModel});

      this.layout.adsizes.show(inlineErrorView);
    },

    _setSelectedAdSizes: function(view) {
      var strAdSizes = this.lineItemModel.get("ad_sizes");

      if(strAdSizes) {
        var tmpAdSizeList = _.map(strAdSizes.split(','), function(size) { return size.trim(); });
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
        success: this._onSaveSuccess,
        error: this._onSaveFailure
      });
    },

    _onSaveSuccess: function(model, response, options) {
      this.trigger("lineitem:saved", model);
    },

    _onSaveFailure: function(model, xhr, options) {
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [];

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = this.lineItemView.ui[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        }, this);

        alert("Error saving lineitem. \n" + formErrors.join("\n"));
      }
    }
  });

})(ReachUI.namespace("LineItems"));
