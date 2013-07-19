(function(Report) {
  'use strict';

  Report.PagingMetaData = Backbone.Model.extend({
    defaults: {
      item_count: 0,
      per_page: 50,
      selected_page: 0,
    },

    getItemCount: function() {
      return this.get("item_count");
    },

    setItemCount: function(count) {
      this.set({item_count: count});
      this.setSelectedPage(0);
    },

    perPage: function() {
      return this.get("per_page");
    },

    setSelectedPage: function(selected_page) {
      this.set({selected_page: selected_page});
    },

    getSelectedPage: function() {
      return this.get("selected_page");
    },

    getOffset: function() {
      return this.get("selected_page") * this.perPage();
    },
  });

  Report.PagingView = Backbone.Marionette.ItemView.extend({
    template: _.template("<div/>"),

    initialize: function() {
      this.model.on('change:item_count', this.render, this);  
    },

    onRender:function() {
      var self = this;
      this.$el.pagination({
        items: this.model.getItemCount(), 
        itemsOnPage: this.model.perPage(), 
        cssStyle: "pagination",
        onPageClick: function(page_number, event) {
          self.model.setSelectedPage(page_number);
          self.trigger("page:change");
        },
      });
    },
  });
})(ReachUI.namespace("Reports"));
