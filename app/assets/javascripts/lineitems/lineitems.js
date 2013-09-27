(function(LineItems) {
  'use strict';

  LineItems.LineItem = Backbone.Model.extend({
    initialize: function() {
      this.ads = [];
      this.creatives = [];
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
      return { lineitem: _.clone(this.attributes), ads: this.ads, creatives: this.creatives };
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
    },

    _recalculateLiImpressions: function() {
      var sum_impressions = _.inject(this.models, function(sum, el) {
        var imps = parseInt(String(el.get('volume')).replace(/,|\./, ''));
        sum += imps;
        return sum;
      }, 0);

      var sum_media_cost = _.inject(this.models, function(sum, el) {
        sum += parseFloat(el.get('value'));
        return sum;
      }, 0.0);

      var cpm_total = (sum_media_cost / sum_impressions) * 1000;
  
      $('.lineitems-summary-container .total-impressions').html(accounting.formatNumber(sum_impressions));
      $('.lineitems-summary-container .total-media-cost').html(accounting.formatMoney(sum_media_cost));
      $('.lineitems-summary-container .total-cpm').html(accounting.formatMoney(cpm_total));
      $('.total-media-cost span').html(accounting.formatMoney(cpm_total));
    }
  });

  LineItems.LineItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'lineitem pure-g',
    template: JST['templates/lineitems/line_item_row'],

    initialize: function(){
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view

      if(! this.model.get('targeting')) {
        var targeting = new ReachUI.Targeting.Targeting();
        this.model.set('targeting', targeting);
      }
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

      this.$el.find('.volume .editable.custom, .media-cost .editable.custom').editable({
        success: function(response, newValue) {
          view.model.set(this.dataset['name'], newValue); //update backbone model;
          view.model.collection._recalculateLiImpressions();
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          view.model.set(this.dataset['name'], newValue); //update backbone model;
        }
      });
  
      // rendering template for Creatives Dialog layout
      var creatives_list_view = new ReachUI.Creatives.CreativesListView({parent_view: view});
      this.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if(this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          creative.set('order_id', view.model.get('order_id'));
          creative.set('lineitem_id', view.model.get('id'));
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
      
      var targetingView = new ReachUI.Targeting.TargetingView({model: this.model.get('targeting'), parent_view: this});
      this.ui.targeting.html(targetingView.render().el);    
      
      ReachUI.showCondensedTargetingOptions.apply(this);

     // align height of lineitem's li-number div
     _.each($('.lineitem > .li-number'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });

      this.ui.ads_list.html('');
      var ads = this.model.ads.models || this.model.ads.collection || this.model.ads;
      _.each(ads, function(ad) {
        view.renderAd(ad);
      });
    },

    renderAd: function(ad) {
      var li_view = this,
          ad_view = new ReachUI.Ads.AdView({model: ad, parent_view: li_view});
      li_view.ui.ads_list.append(ad_view.render().el);
      ReachUI.showCondensedTargetingOptions.apply(ad_view);

      // align height of ad's subdivs with the largest one ('.name')
      _.each($('.ad > div[class^="pure-u-"]'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });

      // rendering template for Creatives Dialog layout
      // parent_view here set to **ad_view** so 'Done' button in creatives dialog will work correctly
      var creatives_list_view = new ReachUI.Creatives.CreativesListView({itemViewContainer: '.ads-creatives-list-view', parent_view: ad_view});
      ad_view.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if(ad_view.model.get('creatives').models) {
        _.each(ad_view.model.get('creatives').models, function(creative) {
          creative.set('order_id', li_view.model.get('order_id'));
          creative.set('lineitem_id', li_view.model.get('id'));
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div (could be called both from LI level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function() {
      var self = this,
          creatives_sizes = [],
          creatives = this.model.get('creatives').models;

      _.each(creatives, function(el) {
        creatives_sizes.push(el.get('ad_size'));
      });

      var uniq_creative_sizes = _.uniq(creatives_sizes).join(', ');
      self.ui.lineitem_sizes.html(uniq_creative_sizes);
      self.model.set('ad_sizes', uniq_creative_sizes);

      var is_visible = ($(self.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = 'Edit Creatives (' + creatives.length + ')';
      this.ui.creatives_container.toggle('slow', function() {
        self.$el.find('.toggle-creatives-btn').html(is_visible ? edit_creatives_title : 'Hide Creatives');
      });
    },

    _toggleTargetingDialog: function() {
      var is_visible = ($(this.ui.targeting).css('display') == 'block');
      this.$el.find('.toggle-targeting-btn').html(is_visible ? '+ Add Targeting' : 'Hide Targeting');
      $(this.ui.targeting).toggle('slow');

      if(is_visible) {
        ReachUI.showCondensedTargetingOptions.apply(this);

        // align height of lineitem's li-number div
        _.each($('.lineitem > .li-number'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });
      }
    },

    ui: {
      ads_list: '.ads-container',
      targeting: '.targeting-container',
      creatives_container: '.creatives-list-view',
      creatives_content: '.creatives-content',
      lineitem_sizes: '.lineitem-sizes'
    },

    events: {
      'click .toggle-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-creatives-btn': '_toggleCreativesDialog'
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
            account_manager: '.order-details .account-contact-name',
            trafficking_contact: '.order-details .trafficker-container'
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
            $('#save-order-dialog').modal('show').on('hidden', function () {
              ReachUI.Orders.router.navigate('/'+ response.order_id, {trigger: true});
            })
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

})(ReachUI.namespace("LineItems"));
