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

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div for Ads (could be called both from Ads level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function() {
      var self = this,
          creatives_sizes = [],
          creatives = this.model.get('creatives').models;

      _.each(creatives, function(el) {
        creatives_sizes.push(el.get('ad_size'));
      });

      var uniq_creative_sizes = _.uniq(creatives_sizes).join(', ');
      self.ui.ads_sizes.html(uniq_creative_sizes);

      this.options.parent_view._updateCreativesCaption();

      var is_visible = ($(self.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = 'Edit Creatives (' + creatives.length + ')';

      this.ui.creatives_container.toggle('slow', function() {
        self.$el.find('.toggle-ads-creatives-btn').html(is_visible ? edit_creatives_title : 'Hide Creatives');
      });
    },

    _toggleTargetingDialog: function() {
      var is_visible = ($(this.ui.targeting).css('display') == 'block');
      this.$el.find('.toggle-ads-targeting-btn').html(is_visible ? '+ Add Targeting' : 'Hide Targeting');
      $(this.ui.targeting).toggle('slow');

      if(is_visible) {
        ReachUI.showCondensedTargetingOptions.apply(this);

        // align height of ad's subdivs with the largest one ('.name')
        _.each($('.ad > div[class^="pure-u-"]'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });
      }
    },

    onRender: function() {
      var self = this;
      $.fn.editable.defaults.mode = 'popup';
      this.$el.find('.start-date .editable.custom, .end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");
          self.model.set(this.dataset['name'], date); //update backbone model
        },
        datepicker: {
          startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          self.model.set(this.dataset['name'], newValue); //update backbone model
        }
      });

      if(this.model.get('targeting').attributes.dmas_list.length == 0) {
        var dmas = new ReachUI.DMA.List();
        dmas.fetch({
          success: function(collection, response, options) {
            self.model.attributes.targeting.set('dmas_list', _.map(collection.models, function(el) { return {code: el.attributes.code, name: el.attributes.name} }) );
            var targetingView = new ReachUI.Targeting.TargetingView({model: self.model.get('targeting'), parent_view: self});
            self.ui.targeting.html(targetingView.render().el);
          }
        });
      } else {
        var targetingView = new ReachUI.Targeting.TargetingView({model: self.model.get('targeting'), parent_view: self});
        self.ui.targeting.html(targetingView.render().el);
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
