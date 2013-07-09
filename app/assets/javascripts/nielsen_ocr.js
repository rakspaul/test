(function(Ocr, Orders, Search) {
  'use strict';

  Ocr.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      '': 'index',
      ':id': 'show'
    }
  });

  Ocr.OcrController = Marionette.Controller.extend({
    initialize: function(options) {
      var search = new Search.SearchQuery(),
        searchView = new Search.SearchQueryView({model: search}),
        searchOrderListView = null;

      this.orderList = new ReachUI.Orders.OrderList();

      search.on('change:query', function(model) {
        this.orderList.fetch({data: {search: model.get('query')}});
      }, this);

      searchOrderListView = new Orders.ListView({el: '.order-search-result', collection: this.orderList})
      searchOrderListView.on("itemview:selected", function(view) {
        Ocr.router.navigate('/' + view.model.id, {trigger: true});
      });

      searchView.bindShortcutKey('s');
    },

    index: function() {
      this.orderList.fetch();
    },

    show: function(id) {
      this.selectedOrder = this.orderList.get(id);
      this.selectedOrder.select();
    }
  });

})(ReachUI.namespace("Ocr"), ReachUI.namespace("Orders"), ReachUI.namespace("Search"));
