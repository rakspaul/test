(function(BlockSites) {
  'use strict';

// --------------------/ Region /------------------------------------
// --------------------/ Layout /------------------------------------
// --------------------/ Models /------------------------------------

  BlockSites.Pagination = Backbone.Model.extend({
    defaults: {
      total_records: 0,
      page_size: 250,
      current_page: 0,
    },

    setTotalRecords: function(count) {
      this.set({total_records: count});
      this.set({current_page: 0}, {silent : true});
    },

    getOffset: function() {
      return this.get("current_page") * this.get("page_size");
    },
  });

// --------------------/ Views /------------------------------------

  BlockSites.PaginationView = Backbone.Marionette.ItemView.extend({
    template: _.template("<div/>"),

    modelEvents: {
      'change:total_records': 'render',
    },

    initialize: function() {
      _.bindAll(this, '_onPageClick');
    },

    onRender: function() {
      this.$el.pagination({
        items: this.model.get('total_records'),
        itemsOnPage: this.model.get('page_size'),
        cssStyle: "pagination",
        onPageClick: this._onPageClick,
      });

      if (this.model.get('total_records') > 0) {
        this.$el.show();
      } else {
        this.$el.hide();
      }
    },

    _onPageClick: function(page_number, event) {
      var t = page_number - 1;
      this.model.unset("current_page", {silent: true});
      this.model.set("current_page", t);
    }
  });

// --------------------/ Controller /------------------------------------

})(ReachUI.namespace("BlockSites"));