ReachUI.Orders.Mediator = (function(Orders) {
  var selectedOrder = null,
    detailRegion = null;

  var DetailRegion = Backbone.Marionette.Region.extend({
    el: ".order-details"
  });

  var initializeSearchList = function() {
    var orderList = new Orders.List.OrderList(),
      searchCollectionView = new Orders.List.SearchOrderCollectionView({el: '.order-search-result', collection: orderList}),
      search = new Orders.Search.SearchQuery(),
      searchView = new Orders.Search.SearchQueryView({model: search});

    detailRegion = new DetailRegion();

    search.on('change:query', function() {
      orderList.fetch({data: {search: this.get('query')}});
    });

    searchCollectionView.on("itemview:selected", function(view) {
      if(selectedOrder) {
        var selectedView = searchCollectionView.children.findByModel(selectedOrder);
        if(selectedView) {
          selectedView.$el.removeClass("order-selected");
        }
      }

      selectedOrder = view.model;
      view.$el.addClass("order-selected");

      var detailOrder = new Orders.OrderDetail.OrderDetailView({model: selectedOrder});
      detailRegion.show(detailOrder);
    });

    orderList.fetch();
  }

  return {
    initialize: initializeSearchList
  };
})(ReachUI.Orders);
