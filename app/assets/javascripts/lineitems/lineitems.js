(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    initialize: function() {
      this.ads = [];
    },

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
      return { lineitem: _.clone(this.attributes), ads: this.ads };
    },

    pushAd: function(ad) {
      this.ads.push(ad);
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
    tagName: 'div',
    className: 'lineitem pure-g',
    template: JST['templates/lineitems/line_item_row'],

    initialize: function(){
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view
    },

    // after start/end date changed LI is rerendered, so render linked Ads also
    onRender: function(){
      // manipulate the `el` here. it's already been rendered, and is full of the view's HTML, ready to go.

      $.fn.editable.defaults.mode = 'popup';
      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          this.model.set(this.dataset['name'], newValue); //update backbone model;
        }
      });

      var view = this;
      _.each(this.model.ads, function(ad) {
        view.renderAd(ad);
      });
    },

    renderAd: function(ad) {
      var adView = new ReachUI.Ads.AdView({model: ad});
      this.ui.ads_list.append(adView.render().el);
    },

    _toggleTargetingDialog: function() {
      var targeting = new ReachUI.Targeting.Targeting();
      var dmas = new ReachUI.DMA.List();
      var self = this;
      dmas.fetch({
        success: function(collection, response, options) {
          targeting.set('dmas_list', _.map(collection.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} }) );
          var targetingView = new ReachUI.Targeting.TargetingView({model: targeting});
          self.ui.targeting.html(targetingView.render().el);
        }
      });
    },

    ui: {
      ads_list: '.ads-container',
      targeting: '.targeting-container'
    },

    events: {
      'click .add_targeting_btn': '_toggleTargetingDialog'
    },

    triggers: {
      'click .li-number': 'lineitem:add_ad'
    }
  });

  LineItems.LineItemListView = Backbone.Marionette.CompositeView.extend({
    itemView: LineItems.LineItemView,
    itemViewContainer: '.lineitems-container',
    template: JST['templates/lineitems/line_item_table'],
    className: 'lineitems-container',

    _saveOrder: function(ev) {
      this._clearAllErrors();
      var lineitems = this.collection;
      
      // store Order and Lineitems in one POST request
      this.collection.order.save({lineitems: lineitems.models}, {
        success: function(model, response, options) {
          // error handling
          var errors_fields_correspondence = {
            reach_client: '.order-details .billing-contact-company',
            start_date: '.order-details .start-date',
            end_date: '.order-details .end-date',
            billing_contact: '.order-details .billing-contact-name',
            media_contact: '.order-details .media-contact-name',
            sales_person: '.order-details .salesperson-name',
            account_manager: '.order-details .account-contact-name'
          };
          if(response.status == "error") {
            _.each(response.errors, function(error, key) {
              console.log(key);
              console.log(error);
              
              if(key == 'lineitems') {
                _.each(error, function(li_errors, li_k) {
                  console.log('li_k - ' + li_k);
                  console.log('li_errors - ' + li_errors);
                  _.each(li_errors["ads"], function(ad_error, ad_k) {
                    $('.lineitems-container .lineitem:nth(' + li_k + ')').find('.ad:nth(' + ad_k + ') .size .errors').addClass('field_with_errors').html(ad_error);
                  });
                });
              } else {
                var field_class = errors_fields_correspondence[key];
                $(field_class + ' .errors_container').html(error);
                $(field_class).addClass('field_with_errors');
              }
            });
          } else if(response.status == "success") {
            ReachUI.Orders.router.navigate('/'+ response.order_id, {trigger: true});
          }
        },
        error: function(model, xhr, options) {
          alert('There was an error while saving Order.');
          console.log(xhr.responseJSON);
        }
      });
    },

    events: {
      'click .save-order-btn': '_saveOrder'
    },

    triggers: {
      'click .create': 'lineitem:create'
    },

    _clearAllErrors: function() {
      $('.errors_container').html('');
      $('.field').removeClass('field_with_errors');
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
