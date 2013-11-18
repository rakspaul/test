(function(Ads) {
  'use strict';

  Ads.Ad = Backbone.Model.extend({
    defaults: function() {
      return {
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD"),
        _delete_creatives: []
      }
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.get("order_id") + '/ads.json';
      } else {
        return '/orders/' + this.get("order_id") + '/ads/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { ad: _.clone(this.attributes) };
    }
  });

  Ads.AdList = Backbone.Collection.extend({
    model: Ads.Ad,
    url: function() {
      return '/orders/' + this.order.id + '/ads.json';
    },

    setOrder: function(order) {
      this.order = order;
    },

    getOrder: function() {
      return this.order;
    }
  });

  Ads.AdView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'ad pure-g',
    template: JST['templates/ads/ad_row'],

    initialize: function(){
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view

      if( !this.model.get('targeting') ) {
        var targeting = new ReachUI.Targeting.Targeting();
        this.model.set('targeting', targeting);
      }
    },

    events: {
      'mouseenter': '_showDeleteBtn',
      'mouseleave': '_hideDeleteBtn',
      'click .delete-btn': '_destroyAd',
      'click .toggle-ads-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-ads-creatives-btn': '_toggleCreativesDialog'
    },

    ui: {
      targeting: '.targeting-container',
      creatives_container: '.ads-creatives-list-view',
      creatives_content: '.creatives-content',
      ads_sizes: '.ads-sizes'
    },

    _validateAdImpressions: function() {
      var li_imps = this.options.parent_view.model.get('volume');
      var sum_ad_imps = 0;

      _.each(this.options.parent_view.model.ads, function(ad) {
        var imps = parseInt(String(ad.get('volume')).replace(/,|\./, ''));
        sum_ad_imps += imps;
      });

      var li_errors_container = this.options.parent_view.$el.find('.volume .errors_container')[0];

      if(sum_ad_imps > li_imps) {
        $(li_errors_container).html("Ad Impressions exceed Line Item Impressions");
      } else {
        $(li_errors_container).html("");
      }

      ReachUI.alignLINumberDiv();
      ReachUI.alignAdsDivs();
    },

    _recalculateMediaCost: function() {
      var imps = parseInt(String(this.model.get('volume')).replace(/,|\./, ''));
      var cpm  = parseFloat(this.model.get('rate'));
      var media_cost = (imps / 1000.0) * cpm;

      this.model.set('value', media_cost);
      this.$el.find('.pure-u-1-12.media-cost span').html(accounting.formatMoney(media_cost, ''));
    },

    renderTargetingDialog: function() {
      var targetingView = new ReachUI.Targeting.TargetingView({model: this.model.get('targeting'), parent_view: this});
      this.ui.targeting.html(targetingView.render().el);
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div for Ads (could be called both from Ads level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function(e, showed) {
      var self = this,
          creatives_sizes = [],
          creatives = this.model.get('creatives').models;

      var creatives_visible = ($(self.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = 'Edit Creatives (' + creatives.length + ')';

      // toggle visibility of Creatives Dialog on LI level, so after rerendering visibility will be restored
      this.options.parent_view.creatives_visible[this.model.cid] = !this.options.parent_view.creatives_visible[this.model.cid];

      // update caption with Ad size for this Ad
      _.each(creatives, function(el) {
        creatives_sizes.push(el.get('ad_size'));
      });

      var uniq_creative_sizes = _.uniq(creatives_sizes).join(', ');
      this.ui.ads_sizes.html(uniq_creative_sizes);

      if (showed) {
        if (!creatives_visible) {
          this.ui.creatives_container.show('slow', function() {
            self.$el.find('.toggle-ads-creatives-btn').html(edit_creatives_title);
          });
        }
      } else {
        this.ui.creatives_container.toggle('slow', function() {
          self.$el.find('.toggle-ads-creatives-btn').html(creatives_visible ? edit_creatives_title : 'Hide Creatives');
        });
      }
    },

    _toggleTargetingDialog: function() {
      $('.ad > .name').height('');
      var is_visible = ($(this.ui.targeting).css('display') == 'block');
      this.$el.find('.toggle-ads-targeting-btn').html(is_visible ? '+ Add Targeting' : 'Hide Targeting');
      $(this.ui.targeting).toggle('slow');

      if(is_visible) {
        ReachUI.showCondensedTargetingOptions.apply(this);
        ReachUI.alignAdsDivs();
      }
    },

    onRender: function() {
      var self = this;
      $.fn.editable.defaults.mode = 'popup';

      this.$el.find('.rate .editable.custom, .volume .editable.custom').editable({
        success: function(response, newValue) {
          self.model.set($(this).data('name'), newValue); //update backbone model;
          self._recalculateMediaCost();
          self._validateAdImpressions();
        }
      });

      this.$el.find('.start-date .editable.custom, .end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD"),
              field = $(this).data('name');
          if (self.model.get('creatives').models) {
            _.each(self.model.get('creatives').models, function(creative) {
              creative.set(field, date);
            });
          }
          self.model.set($(this).data('name'), date); //update backbone model
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          self.model.set($(this).data('name'), newValue); //update backbone model
        }
      });

      if(this.model.get('targeting').attributes.dmas_list.length == 0) {
        var dmas = new ReachUI.DMA.List();
        var ags  = new ReachUI.AudienceGroups.AudienceGroupsList();

        $.when.apply($, [ dmas.fetch(), ags.fetch() ]).done(function() {
          var dmas_list = _.map(dmas.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} });

          self.model.get('targeting').set('dmas_list', dmas_list);
          self.model.get('targeting').set('audience_groups', ags.attributes);
          self.renderTargetingDialog();
        });
      } else {
        self.renderTargetingDialog();
      }

      this.renderCreatives();
      this._validateAdImpressions();

      // if this Creatives List was open before the rerendering then open ("show") it again
      if(this.options.parent_view.creatives_visible[self.model.cid]) {
        this.ui.creatives_container.show();
        this.$el.find('.toggle-ads-creatives-btn').html('Hide Creatives');
      }

      ReachUI.alignAdsDivs();
    },

    renderCreatives: function() {
      var ad_view = this,
          li_view = this.options.parent_view;

      // rendering template for Creatives Dialog layout
      // parent_view here set to **this view** so 'Done' button in creatives dialog will work correctly
      var creatives_list_view = new ReachUI.Creatives.CreativesListView({itemViewContainer: '.ads-creatives-list-view', parent_view: this});
      this.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if (this.model.get('creatives').models) {
        _.each(this.model.get('creatives').models, function(creative) {
          creative.set('order_id', li_view.model.get('order_id'));
          creative.set('lineitem_id', li_view.model.get('id'));
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative, parent_view: ad_view});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    _showDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').show();
    },

    _hideDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').hide();
    },

    _destroyAd: function(e) {
      var li_ads = this.options.parent_view.model.ads;
      var cid = this.model.cid;

      // update list of ads for the related lineitem
      var new_ads = _.inject(li_ads, function(new_ads, ad) {
        if(cid != ad.cid) {
          new_ads.push(ad);
        }
        return new_ads;
      }, []);
      this.options.parent_view.model.ads = new_ads;

      this.remove();
    }
  });

  Ads.AdListView = Backbone.Marionette.CompositeView.extend({
    itemView: Ads.AdView,
    itemViewContainer: '.ads-container',
    template: JST['templates/ads/ads_container'],
    className: 'ads-container',
  });
})(ReachUI.namespace("Ads"));
