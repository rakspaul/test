(function(DMA) {
  'use strict';

  DMA.Model = Backbone.Model.extend({
    idAttribute: 'code',

    defaults: {
      code: '',
      name: ''
    }
  });

  DMA.List = Backbone.Collection.extend({
    model: DMA.Model,
    url: '/dmas.json'
  });

  DMA.OptionView = Backbone.Marionette.ItemView.extend({
    tagName: 'option',
    template: _.template('<%= name %>'),

    onRender: function() {
      this.$el.attr('value', this.model.get('code'));
      this.$el.attr('selected', this.options.selected);
    }
  });

  DMA.ChosenView = Backbone.Marionette.CollectionView.extend({
    tagName: 'select',
    itemView: DMA.OptionView,
    itemViewOptions: function(model, index) {
      var selected =  _.indexOf(this.options.dma_ids, model.id) >= 0;
      return {
        selected: selected
      };
    },

    onBeforeRender: function() {
      this.$el.attr('multiple','true');
      this.$el.attr('data-placeholder', 'Select dma...');
    },

    onDomRefresh: function() {
      this.$el.chosen({width: "400px"});
      this.$el.trigger("liszt:updated");
    }
  });
})(ReachUI.namespace("DMA"));
