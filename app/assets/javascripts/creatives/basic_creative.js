(function(Creatives) {
  'use strict';

  Creatives.BasicCreativeView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'creative pure-g',
    template: JST['templates/creatives/basic/creatives_row'],
  });

  Creatives.BasicCreativesListView = Backbone.Marionette.CompositeView.extend({
    itemView: Creatives.BasicCreativeView,
    itemViewContainer: '.creatives-list-view',
    template: JST['templates/creatives/basic/creatives_container'],
    className: 'creatives-content',
    tagName: 'table',

    serializeData: function() {
      var data = {};
      data.is_cox_creative = this.options.is_cox_creative;
      return data;
    },

    ui: {
      creatives: '.creatives-container'
    }
  });
})(ReachUI.namespace("Creatives"));
