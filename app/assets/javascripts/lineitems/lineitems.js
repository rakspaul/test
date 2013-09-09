(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    initialize: function() {
      this.ads = [];
    },

    defaults: function() {
      return {
        volume: 0,
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD")
      }
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

      var targeting = new ReachUI.Targeting.Targeting();
      this.model.set('targeting', targeting);
    },

    // after start/end date changed LI is rerendered, so render linked Ads also
    onRender: function(){
      var view = this;
      $.fn.editable.defaults.mode = 'popup';

      this.$el.find('.start-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");
          view.model.set(this.dataset['name'], date); //update backbone model;
          
          // order's start date should be lowest of all related LIs
          var start_dates = _.map(view.model.collection.models, function(el) { return el.attributes.start_date; }), min_date = start_dates[0];
          _.each(start_dates, function(el) { if(el < min_date) { min_date = el; } });
          $('.order-details .start-date .editable.date').html(min_date);
        },
        datepicker: {
          startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
        }
      });

      this.$el.find('.end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");
          view.model.set(this.dataset['name'], date); //update backbone model;

          // order's end date should be highest of all related LIs
          var end_dates = _.map(view.model.collection.models, function(el) { return el.attributes.end_date; }), max_date = end_dates[0];
          _.each(end_dates, function(el) { if(el > max_date) { max_date = el; } })
          $('.order-details .end-date .editable.date').html(max_date);
        },
        datepicker: {
          startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
        }
      }); 

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          view.model.set(this.dataset['name'], newValue); //update backbone model;
        }
      });
    
      _.each((this.model.ads.models || this.model.ads.collection || this.model.ads), function(ad) {
        view.renderAd(ad);
      });
      
      var dmas = new ReachUI.DMA.List();
      var self = this;
      dmas.fetch({
        success: function(collection, response, options) {
          self.model.attributes.targeting.set('dmas_list', _.map(collection.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} }) );
          var targetingView = new ReachUI.Targeting.TargetingView({model: self.model.attributes.targeting, parent_view: self});
          self.ui.targeting.html(targetingView.render().el);

          // align height of lineitem's li-number div
          _.each($('.lineitem > .li-number'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });
        }
      });
    },

    renderAd: function(ad) {
      var adView = new ReachUI.Ads.AdView({model: ad, parent_view: this});
      this.ui.ads_list.append(adView.render().el);
    },

    _toggleTargetingDialog: function() {    
      var is_visible = ($(this.ui.targeting).css('display') == 'block');
      this.$el.find('.add_targeting_btn').html(is_visible ? '+ Add Targeting' : 'Hide Targeting');
      this.ui.targeting.toggle('slow');

      if(is_visible) {
        var targeting_options = [];

        var dmas = this.model.attributes.targeting.attributes.selected_dmas;
        if(dmas.length > 0) {
          targeting_options.push('<img src="/assets/dma_targeting_icon.png" title="DMAs" alt="DMAs">', ReachUI.truncateArray(dmas, "title"));
        }

        var zips = this.model.attributes.targeting.attributes.selected_zip_codes;
        if(zips.length > 0) {
          targeting_options.push('<img src="/assets/zip_codes_icon.png" title="Zip codes" alt="Zip Codes">', ReachUI.truncateArray(zips));
        }

        var key_values = this.model.attributes.targeting.attributes.selected_key_values;      
        var kv_icon_pushed = false;
        _.each(key_values, function(value, key) {
          if(value.length > 0) {
            if(!kv_icon_pushed) {
              targeting_options.push('<img src="/assets/account_contact_icon.png" title="Key Value Targeting" alt="Key Value Targeting">&nbsp;');
              kv_icon_pushed = true;
            }
            targeting_options.push("<b>"+key+":</b>", ReachUI.truncateArray(value));
          }
        }); 
    
        // if we close Targeting Dialog in Li context then *all* .targeting_options_condensed will be
        // selected (including Ads' ones), so we need to limit this only to first matching element
        var toptions = this.$el.find('.targeting_options_condensed')[0];
        $(toptions).html(targeting_options.join(' '));

        // align height of lineitem's li-number div
        _.each($('.lineitem > .li-number'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });
      }
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
                  var li_errors_list = [];
                  _.each(li_errors.lineitems, function(val, k) { 
                    li_errors_list.push(k + ' ' + val);
                  });
                  $('.lineitems-container .lineitem:nth(' + li_k + ')').find(' .name .errors').addClass('field_with_errors').html(li_errors_list.join('; '));
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
