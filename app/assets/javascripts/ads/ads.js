(function(Ads) {
  'use strict';

  Ads.Ad = Backbone.Model.extend({
    defaults: function() {
      return {
        rate: 0.0,
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD"),
        _delete_creatives: [],
        platform_id: null
      }
    },

     _default_keyvalue_targeting: {
      "companion": "vid=_default"
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.get("order_id") + '/ads.json';
      } else {
        return '/orders/' + this.get("order_id") + '/ads/' + this.id + '.json';
      }
    },

    toJSON: function() {
      var ad = _.clone(this.attributes);
      var frequencyCaps = ad['targeting'].get('frequency_caps'),
          uniqFrequencyCaps = [];

      if (frequencyCaps.toNestedAttributes && frequencyCaps.models.length > 0) {
        ad['frequency_caps_attributes'] = frequencyCaps.toNestedAttributes();
      } else if (frequencyCaps.length > 0) {
        ad['frequency_caps_attributes'] = frequencyCaps;
      }
      _.each(ad['frequency_caps_attributes'], function(fc) {
        var exists = _.any(uniqFrequencyCaps, function(u) {
          return u.impressions == fc.impressions &&
                 u.time_value  == fc.time_value  &&
                 u.time_unit   == fc.time_unit;
        });
        if (!exists.id && fc.id) {
          exists.id = fc.id;
        }
        if (fc._destroy || !exists) {
          uniqFrequencyCaps.push(fc);
        }
      });
      if (uniqFrequencyCaps.length > 0) {
        ad['frequency_caps_attributes'] = uniqFrequencyCaps;
      }
      delete ad['selected_zip_codes'];
      delete ad['frequency_caps'];
      delete ad['site_id'];
      delete ad['zone'];
      return { ad: ad };
    },

    getImps: function() {
      return Math.round(this.get('volume'));
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
        var targeting = new ReachUI.Targeting.Targeting({type: this.model.get('type')});
        this.model.set('targeting', targeting);
      }
      this.model.set({ 'value': this.getMediaCost() }, { silent: true });
    },

    events: {
      'mouseenter': '_showDeleteBtn',
      'mouseleave': '_hideDeleteBtn',
      'click .delete-btn': '_destroyAd',
      'click .toggle-ads-targeting-btn': '_toggleTargetingDialog',
      'click .toggle-ads-creatives-btn': '_toggleCreativesDialog',

      'click .item-selection': '_toggleAdSelection',
      'click .ad-copy-targeting-btn .copy-targeting-item': 'copyTargeting',
      'click .ad-paste-targeting-btn': 'pasteTargeting',
      'click .ad-cancel-targeting-btn': 'cancelTargeting',
    },

    modelEvents: {
      'change:volume': '_recalculateMediaCost'
    },

    ui: {
      targeting:            '.targeting-container',
      creatives_container:  '.ads-creatives-list-view',
      creatives_content:    '.creatives-content',
      ads_sizes:            '.ads-sizes',
      item_selection:       '.item-icon',
      copy_targeting_btn:   '.ad-copy-targeting-btn',
      paste_targeting_btn:  '.ad-paste-targeting-btn',
      cancel_targeting_btn: '.ad-cancel-targeting-btn',
      missing_geo_caution:  '.missing-geo-caution',
      media_cost_value:     '.media-cost-value'
    },

    _recalculateMediaCost: function() {
      var imps = this.getImpressions();
      var media_cost = this.getMediaCost();

      this.model.set({ 'value':  media_cost }, { silent: true });
      this.ui.media_cost_value.html(accounting.formatMoney(media_cost, ''));

      // https://github.com/collectivemedia/reachui/issues/358
      // Catch ads with 0 impressions rather than throw an error
      var $errors_container = this.$el.find('.volume .editable').siblings('.errors_container');
      if(imps == 0) {
        $errors_container.html("Impressions must be greater than 0.");
      } else {
        $errors_container.html('');
      }
    },

    getImpressions: function() {
      return this.model.getImps();
    },

    getMediaCost: function() {
      var cpm  = parseFloat(this.model.get('rate'));
      return (this.getImpressions() * cpm) / 1000.0;
    },

    renderTargetingDialog: function() {
      this.targetingView = new ReachUI.Targeting.TargetingView({model: this.model.get('targeting'), parent_view: this});
      this.ui.targeting.html(this.targetingView.render().el);
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div for Ads (could be called both from Ads level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function(e, showed) {
      var self = this,
          creatives_sizes = [],
          creatives = this.model.get('creatives').models;

      var creatives_visible = ($(self.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = '<span class="pencil-icon"></span>Edit Creatives (' + creatives.length + ')';

      // toggle visibility of Creatives Dialog on LI level, so after rerendering visibility will be restored
      this.options.parent_view.creatives_visible[this.model.cid] = !this.options.parent_view.creatives_visible[this.model.cid];

      this._getCreativesSizes();

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

      if (creatives.length > 0 && this.model.get('type') == 'Video')
        this.$el.find("#caution-symbol-ad").show();
      else
        this.$el.find("#caution-symbol-ad").hide();
    },

    //  This method will open or close targeting dialog box
    //  hideTargeting() will give call to server for validating key value and zipcodes
    _toggleTargetingDialog: function() {
      var is_visible = $(this.ui.targeting).is(':visible');

      if(is_visible) {
        this.targetingView.hideTargeting();
      } else {
        this.$el.find('.toggle-ads-targeting-btn').html('Hide Targeting');
        this.targetingView.showTargeting();
      }
    },

    // after validating zipcode and key values this function will get call
    onTargetingDialogToggle: function() {
      if(this.targetingView._isGeoTargeted()) {
        this.$el.find("#caution-symbol").hide();
      } else {
        this.$el.find("#caution-symbol").show();
      }

      $('.ad > .name').height('');

      this.$el.find('.toggle-ads-targeting-btn').html('+ Add Targeting');
    },

    toggleMissingGeoCaution: function() {
      var targeting = this.model.get('targeting');
      if (targeting && targeting.get('selected_geos').length == 0 &&
                       targeting.get('selected_zip_codes').length == 0) {
        this.ui.missing_geo_caution.show();
      } else {
        this.ui.missing_geo_caution.hide();
      }
    },

    // for ads
    // this function will update the key values and zipcodes after validating
    _hideTargetingDialog: function() {
      ReachUI.showCondensedTargetingOptions.apply(this);
    },

    _getCreativesSizes: function() {
      var creatives_sizes = [],
          type = this.model.get('type'),
          creatives = this.model.get('creatives').models,
          li = this.options.parent_view.model,
          li_type = li.get('type');

      if (creatives.length > 0 && type != 'Video' && type != 'Companion') {
        _.each(creatives, function(el) {
          creatives_sizes.push(el.get('ad_size'));
        });

        var uniq_creative_sizes = _.uniq(creatives_sizes).join(', ');
        if (uniq_creative_sizes) {
          this.ui.ads_sizes.html(uniq_creative_sizes);
        }
      } else {
        var ad_sizes = li.get('ad_sizes');
        if (li_type == 'Video' && type != 'Video') {
          ad_sizes = li.get('companion_ad_size');
        } else if (li_type == 'Video') {
          var companion_size = li.get('companion_ad_size');
          ad_sizes = li.get('master_ad_size');// + (companion_size ? ', ' + li.get('companion_ad_size') : '');
        }
        if (ad_sizes) {
          this.model.set({ 'size': ad_sizes }, { silent: true });
          this.ui.ads_sizes.html(ad_sizes.replace(/,/gi, ', '));
        }
      }
    },

    onRender: function() {
      var self = this;
      $.fn.editable.defaults.mode = 'popup';

      this._getCreativesSizes();

      this.$el.find('.rate .editable.custom').editable({
        success: function(response, newValue) {
          self.model.set({ 'rate': newValue });
          self._recalculateMediaCost();
        }
      });

      this.$el.find('.volume .editable.custom').editable({
        success: function(resp, newValue) {
          var sum_ad_imps = 0,
            imps = self.options.parent_view.model.get('volume'),
            value = parseFloat(String(newValue).replace(/,/g, ''))

          self.model.set({ 'volume': Math.round(Number(value)) }); //update backbone model;

          _.each(self.options.parent_view.model.ads, function(ad) {
            var imps = parseInt(String(ad.get('volume')).replace(/,/g, ''));
            sum_ad_imps += imps;
          });

          self.options.parent_view.recalculateUnallocatedImps();
          self.render();
        },
        validate: function(value) {
          if($.trim(value) == '') {
            return 'This field is required';
          }
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
          startDate: ReachUI.initialStartDate(self.model.get('start_date'))
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          self.model.set($(this).data('name'), newValue); //update backbone model
        }
      });

      if (this.model.get('targeting').attributes.audience_groups.length == 0) {
        var ags  = new ReachUI.AudienceGroups.AudienceGroupsList();

        ags.fetch().then(function() {
          self.model.get('targeting').set('audience_groups', ags.attributes);
          self.renderTargetingDialog();
          ReachUI.showCondensedTargetingOptions.apply(self);
        });
      } else {
        self.renderTargetingDialog();
        ReachUI.showCondensedTargetingOptions.apply(this);
      }

      this.renderCreatives();

      // if this Creatives List was open before the rerendering then open ("show") it again
      if(this.options.parent_view.creatives_visible[self.model.cid]) {
        this.ui.creatives_container.show();
        this.$el.find('.toggle-ads-creatives-btn').html('Hide Creatives');
      }

      this.$el.find('[data-toggle="tooltip"]').tooltip();
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
          creative.set({
            'order_id': li_view.model.get('order_id'),
            'lineitem_id': li_view.model.get('id')
          }, { silent: true });
          var creativeView = new ReachUI.Creatives.CreativeView({model: creative, parent_view: ad_view});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    _toggleAdSelection: function(e) {
      e.stopPropagation();
      ReachUI.toggleItemSelection.call(this, e, 'ad');
    },

    copyTargeting: function(e) {
      ReachUI.copyTargeting.call(this, e, 'ad');
    },

    _deselectAllItems: function(options) {
      ReachUI.deselectAllItems.call(this, options, 'ad');
    },

    pasteTargeting: function(e) {
      ReachUI.pasteTargeting.call(this, e, 'ad');
    },

    cancelTargeting: function(e) {
      ReachUI.cancelTargeting.call(this, e, 'ad');
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
      var model = this.options.parent_view.model;
      var li_ads = model.ads;
      var cid = this.model.cid;

      // update list of ads for the related lineitem
      model.ads =_.filter(li_ads, function(ad) {
        return cid != ad.cid;
      });
      this.options.parent_view.recalculateUnallocatedImps();
      this.remove();
    },

    templateHelpers:{
      adStatusClass: function(){
        if(this.ad.status)
          return "ad-status-"+this.ad.status.toLowerCase().replace(' ','-');
      }
    },
  });

  Ads.AdListView = Backbone.Marionette.CompositeView.extend({
    itemView: Ads.AdView,
    itemViewContainer: '.ads-container',
    template: JST['templates/ads/ads_container'],
    className: 'ads-container',
  });
})(ReachUI.namespace("Ads"));
