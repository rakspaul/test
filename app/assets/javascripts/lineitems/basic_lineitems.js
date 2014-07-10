(function(LineItems) {
  'use strict';


  LineItems.BasicLineItemView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'lineitem pure-g',

    getTemplate: function() {
      return JST['templates/lineitems/basic/line_item_row'];
    },

    initialize: function(){
      _.bindAll(this, "render");

      this.creatives_visible = {};

      if (!this.model.get('targeting')) {
        var targeting = new ReachUI.Targeting.Targeting({type: this.model.get('type'), keyvalue_targeting: this.model.get('keyvalue_targeting')});
        this.model.set({ 'targeting': targeting }, { silent: true });
      }
    },

    _recalculateMediaCost: function() {
      var imps = parseInt(String(this.model.get('volume')).replace(/,|\./g, ''));
      var cpm  = parseFloat(this.model.get('rate'));
      var media_cost = (imps * cpm) / 1000.0;
      this.model.set('value', media_cost);
      var $li_media_cost = this.$el.find('.pure-u-1-12.media-cost .number-value span');
      $($li_media_cost[0]).html(accounting.formatMoney(media_cost, ''));
    },

    // after start/end date changed LI is rerendered, so render linked Ads also
    onRender: function() {
      var view = this;

      this.renderCreatives();
    },

    renderCreatives: function() {
      var view = this, is_cox_creative = false;

      // check whether there are Cox Creatives
      if (this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          if (creative.get('html_code')) {
            is_cox_creative = true;
          }
        })
      }

      // rendering template for Creatives Dialog layout
      var creatives_list_view = new ReachUI.Creatives.BasicCreativesListView({parent_view: this, is_cox_creative: is_cox_creative});
      this.ui.creatives_container.html(creatives_list_view.render().el);

      // rendering each Creative
      if (this.model.get('creatives')) {
        _.each(this.model.get('creatives').models, function(creative) {
          creative.set({
            'order_id': view.model.get('order_id'),
            'lineitem_id': view.model.get('id')
          });
          var creativeView = new ReachUI.Creatives.BasicCreativeView({model: creative, parent_view: view});
          creatives_list_view.ui.creatives.append(creativeView.render().el);
        });
      }
    },

    ///////////////////////////////////////////////////////////////////////////////
    // Toggle Creatives div (could be called both from LI level and from Creatives level: 'Done' button)
    _toggleCreativesDialog: function(e, showed) {
      var self = this,
          creatives = this.model.get('creatives').models;

      //this._updateCreativesCaption();

      var is_visible = ($(this.ui.creatives_container).css('display') == 'block');
      var edit_creatives_title = '<span></span>Show Creatives (' + creatives.length + ')';
      if (showed) {
        if (!is_visible) {
          this.ui.creatives_container.show('slow', function() {
            self.$el.find('.toggle-creatives-btn').html(edit_creatives_title);
          });
        }
      } else {
        this.ui.creatives_container.toggle('slow', function() {
          self.$el.find('.toggle-creatives-btn').html(is_visible ? edit_creatives_title : 'Hide Creatives');
        });
      }
    },

    ui: {
      targeting: '.targeting-container',
      creatives_container: '.creatives-list-view',
      creatives_content: '.creatives-content',
      lineitem_sizes: '.lineitem-sizes'
    },

    events: {
      'click .toggle-creatives-btn': '_toggleCreativesDialog'
    },

    templateHelpers:{
      lineitemStatusClass: function(){
        if(this.lineitem.li_status)
          return "lineitem-status-"+this.lineitem.li_status.toLowerCase().split(' ').join('-');
      }
    }

  });



  LineItems.BasicLineItemListView = Backbone.Marionette.CompositeView.extend({
    itemView: LineItems.BasicLineItemView,
    itemViewContainer: '.lineitems-container',
    template: JST['templates/lineitems/basic/line_item_table'],
    className: 'lineitems-container'
  });

})(ReachUI.namespace("LineItems"));
