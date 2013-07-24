(function(Report) {
  'use strict';

  Report.Dimension = Backbone.Model.extend({
    defaults: {
      name: '',
      internal_name: '',
      index: 0
    }
  });

  Report.DimensionList = Backbone.Collection.extend({
    model: Report.Dimension,
    url: '/reports/dimensions.json',
    comparator: function(dimension) {
      return dimension.get('index');
    }
  });

  Report.DimensionView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    className: 'droppable',
    template: _.template('<%= name %>')
  });

  Report.AvailableDimensionsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'dimensions-list',
    itemView: Report.DimensionView,
    initialize: function() {
      this.listenTo(this.collection, "sort", this.render);
    },

    onAfterItemAdded: function(itemView) {
      itemView.$el.draggable({ revert: true });
    }
  });

  Report.SelectedDimensionView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    template: _.template('<a><%= name %><span class="remove-icon"><i class="icon-remove"></i></span></a>'),
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
