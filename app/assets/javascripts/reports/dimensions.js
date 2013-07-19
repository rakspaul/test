(function(Report) {
  'use strict';

  Report.Dimension = Backbone.Model.extend({
    defaults: {
      name: ''
    }
  });

  Report.DimensionList = Backbone.Collection.extend({
    model: Report.Dimension
  });

  Report.DimensionView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    template: _.template('<%= name %>'),
  });

  Report.AvailableDimensionsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'dimensions-list',
    itemView: Report.DimensionView,

    onAfterItemAdded: function(itemView) {
      itemView.$el.draggable({ revert: true });
    }
  });

  Report.SelectedDimensionView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    template: _.template('<%= name %><i class="icon-white icon-remove"></i>'),
    triggers: {
      'click .icon-remove': 'dimension:remove'
    }
  });

  Report.SelectedDimensionsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'selected-dimensions-list',
    itemView: Report.SelectedDimensionView,
  });
})(ReachUI.namespace("Reports"));
