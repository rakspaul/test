(function(List, Search) {
  'use strict';

  List.Order = Backbone.Model.extend({});

  List.OrderList = Backbone.Collection.extend({
    model: List.Order,
    url: '/orders/orders/search.json'
  });

  List.SearchOrderItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_search_item'],
    className: 'order',
    triggers: {
      'click': 'selected'
    }
  });

  List.SearchOrderEmptyView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_search_empty'],
    className: 'no-order-found'
  });

  List.SearchOrderCollectionView = Backbone.Marionette.CollectionView.extend({
    itemView: List.SearchOrderItemView,
    emptyView: List.SearchOrderEmptyView,

    onBeforeItemAdded: function(itemView) {
      // This will make sure emptyView don't get style change
      if(itemView.model.id) {
        var cls = itemView.model.get('active') ? 'active-order' : 'inactive-order';
        itemView.$el.addClass(cls);
      }
    }
  });

  List.initialize = function() {
    var orderList = new List.OrderList(),
      searchCollectionView = new List.SearchOrderCollectionView({el: '.order-search-result', collection: orderList}),
      search = new Search.SearchQuery(),
      searchView = new Search.SearchQueryView({model: search});

    searchView.render();
    search.on('change:query', function() {
      orderList.fetch({data: {search: this.get('query')}});
    });

    orderList.fetch();

    var selectedOrder = null;
    searchCollectionView.on("itemview:selected", function(view) {
      if(selectedOrder) {
        var selectedView = searchCollectionView.children.findByModel(selectedOrder);
        selectedView.$el.removeClass("order-selected");
      }
      selectedOrder = view.model;
      view.$el.addClass("order-selected");
    });
  }
})(ReachUI.namespace("Orders.List"), ReachUI.Orders.Search);
