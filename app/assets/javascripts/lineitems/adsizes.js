(function(LineItems) {
  'use strict';

  LineItems.AdSize = Backbone.Model.extend({
    defaults: {
      selected: false
    },

    toggleSelected: function() {
      this.set({"selected": !this.get("selected")});
    }
  });

  LineItems.AdSizeList = Backbone.Collection.extend({
    model: LineItems.AdSize,
    url: '/ad_sizes.json',

    getSelected: function() {
      return this.where({selected: true});
    }
  });

  LineItems.AdSizeCheckbox = Backbone.Marionette.ItemView.extend({
    className: 'ad-size',
    template: JST['templates/lineitems/ad_size'],

    ui: {
      checkbox: 'input[type=checkbox]'
    },

    events: {
      'click':'onClick'
    },

    initialize: function() {
      this.listenTo(this.model, 'change:selected', this._selected);
    },

    onClick: function() {
      this.model.toggleSelected();
    },

    _selected: function() {
      this.ui.checkbox.prop('checked', this.model.get("selected"));
    }
  });

  LineItems.AdSizeCheckboxList = Backbone.Marionette.CollectionView.extend({
    className: 'ad-size-list',
    itemView: LineItems.AdSizeCheckbox
  });

})(ReachUI.namespace("LineItems"));
