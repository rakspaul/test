ReachUI.Orders.Mediator = (function(Search, Orders, LineItems) {
  var selectedOrder = null,
    detailRegion = null,
    lineItemRegion = null,
    orderDetailsLayout = null,
    lineItemList = null,
    lineItemListView = null,
    newItemView = null;

  var DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details .content"
  });

  var _onOrderSelected = function(view) {
    if(selectedOrder) {
      var selectedView = this.children.findByModel(selectedOrder);
      if(selectedView) {
        selectedView.$el.removeClass("order-selected");
      }
    }

    selectedOrder = view.model;
    view.$el.addClass("order-selected");

    var detailOrderView = new Orders.DetailView({model: selectedOrder});
    orderDetailsLayout.detail.show(detailOrderView);

    lineItemList = new LineItems.LineItemList();
    lineItemList.setOrder(selectedOrder);
    lineItemList.fetch();
    _showLineItems();
  };

  var _showLineItems = function() {
    var lineItemListView = new LineItems.LineItemListView({collection: lineItemList})
    lineItemListView.on('create:lineitem', _onNewLineItem);
    orderDetailsLayout.lineitems.show(lineItemListView);
  }

  var _onNewLineItem = function() {
    var newLineItem = new LineItems.LineItem({'order': selectedOrder});
    newItemView = new LineItems.NewLineItemView({model: newLineItem});
    orderDetailsLayout.lineitems.show(newItemView);

    newItemView.on("created", _onCreateLineItem);
  }

  var _onCreateLineItem = function(model) {
    lineItemList.add(model);
    _showLineItems();
  }

  var initializeOrderDetailLayout = function() {
    detailRegion = new DetailRegion();
    orderDetailsLayout = new Orders.OrderDetailLayout();

    detailRegion.show(orderDetailsLayout);
  };

  var initializeSearchList = function() {
    var orderList = new Orders.OrderList(),
      searchOrderListView = new Orders.ListView({el: '.order-search-result', collection: orderList}),
      search = new Search.SearchQuery(),
      searchView = new Search.SearchQueryView({model: search});


    search.on('change:query', function() {
      orderList.fetch({data: {search: this.get('query')}});
    });

    searchOrderListView.on("itemview:selected", _onOrderSelected);

    orderList.fetch();
  }

  var init = function() {
    initializeOrderDetailLayout();
    initializeSearchList();
  }

  return {
    initialize: init
  };
})(ReachUI.Search, ReachUI.Orders, ReachUI.LineItems);
