(function(Ads) {
  'use strict';

  Ads.Ad = Backbone.Model.extend({
    defaults: {
      rate: 0.0,
      start_date: moment().add('days', 1).format("YYYY-MM-DD"),
      end_date: moment().add('days', 15).format("YYYY-MM-DD")
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
    },

    events: {
      'mouseenter': '_show_delete_btn',
      'mouseleave': '_hide_delete_btn',
      'click .delete_btn': '_destroy_ad'
    },

    onRender: function() {
      $.fn.editable.defaults.mode = 'popup';
      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          this.model.set(this.dataset['name'], newValue); //update backbone model
        }
      });
    },

    _show_delete_btn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete_btn').show();
    },

    _hide_delete_btn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete_btn').hide();
    },
    
    _destroy_ad: function(e) {
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
