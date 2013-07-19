(function(Report) {
  'use strict';

  Report.Dimension = Backbone.Model.extend({
    defaults: {
      name: '',
      internal_name: '',
      is_removable: false,
      is_dimension: false,
      index: 0
    }
  });

  Report.DimensionList = Backbone.Collection.extend({
    model: Report.Dimension,
    comparator: function(dimension) {
      return dimension.get('index');
    }
  });

  Report.DimensionView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    template: _.template('<%= name %>')
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
    template: _.template('<a class="btn btn-success"><%= name %> <i class="icon-white icon-remove"></i></a>'),
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
