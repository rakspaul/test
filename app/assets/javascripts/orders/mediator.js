ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
  el: "#details .content"
});

ReachUI.Orders.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    ':id': 'orderDetails',
    ':id/lineitems/new': 'newLineItem',
    ':id/lineitems/:lineitem_id': 'showLineItem'
  },

  current : function() {
    var Router = this,
        fragment = Backbone.history.fragment,
        routes = _.pairs(Router.appRoutes),
        route = null, params = null, matched;

    matched = _.find(routes, function(handler) {
        route = _.isRegExp(handler[0]) ? handler[0] : Router._routeToRegExp(handler[0]);
        return route.test(fragment);
    });

    if(matched) {
        // NEW: Extracts the params using the internal
        // function _extractParameters
        params = Router._extractParameters(route, fragment);
        route = matched[1];
    }

    return {
        route : route,
        fragment : fragment,
        params : params
    };
  }
});

ReachUI.Orders.OrderController = Marionette.Controller.extend({
  initialize: function() {
    this.orderDetailRegion = new ReachUI.Orders.DetailRegion();
    this.orderDetailsLayout = new ReachUI.Orders.OrderDetailLayout();
    this.orderList = new ReachUI.Orders.OrderList();
    this.lineItemList = new ReachUI.LineItems.LineItemList();

    this.orderDetailRegion.show(this.orderDetailsLayout);

    this._initializeLineItemController();

    var search = new ReachUI.Search.SearchQuery(),
      searchView = new ReachUI.Search.SearchQueryView({model: search}),
      searchOrderListView = new ReachUI.Orders.ListView({el: '.order-search-result', collection: this.orderList});

    search.on('change:query', function(model) {
      this.orderList.fetch({data: {search: model.get('query')}});
    }, this);

    searchOrderListView.on("itemview:selected", function(view) {
      ReachUI.Orders.router.navigate('/' + view.model.id, {trigger: true});
    });

    _.bindAll(this, '_showOrderDetailsAndLineItems', '_showNewLineItemView');
  },

  index: function() {
    this.orderList.fetch();
  },

  orderDetails: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var promise = this._fetchOrder(id);
      promise.then(this._showOrderDetailsAndLineItems);
    } else {
      this._showOrderDetailsAndLineItems(this.selectedOrder);
    }
  },

  newLineItem: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      this._fetchOrder(id).then(this._showNewLineItemView);
    } else {
      this._showNewLineItemView(this.selectedOrder);
    }
  },

  showLineItem: function(orderId, lineItemId) {
    this.selectedOrder = this.orderList.get(orderId);
    if(!this.selectedOrder) {
      var self = this;
      this._fetchOrder(orderId).then(function(order) {
        order.select();
        self._showOrderDetails(order);
        self._fetchLineitem(lineItemId, order).then(function(lineitem) {
          self.lineItemController.show(lineitem);
        });
      });
    } else {
      this.selectedOrder.select();
      if(!this.lineItemList) {
        this.lineItemList = new ReachUI.LineItems.LineItemList();
      }

      var lineitem = this.lineItemList.get(lineItemId);
      if(!lineitem) {
        var self = this;
        this._fetchLineitem(lineItemId, this.selectedOrder).then(function(lineitem) {
          self.lineItemController.show(lineitem);
        });
      } else {
        this.lineItemController.show(lineitem);
      }
    }
  },

  _initializeLineItemController: function() {
    this.lineItemController = new ReachUI.LineItems.LineItemController({
                                    mainRegion: this.orderDetailsLayout.lineitems
                                  });
    this.lineItemController.on("lineitem:saved", this._navigateToSelectedOrder, this);
    this.lineItemController.on("lineitem:close", this._navigateToSelectedOrder, this);
  },

  _navigateToSelectedOrder: function(lineitem) {
    if(lineitem) {
      this.lineItemList.add(lineitem);
    }

    ReachUI.Orders.router.navigate('/'+ this.selectedOrder.id, {trigger: true});
  },

  _fetchOrder: function(id) {
    var self = this;
    this.selectedOrder = new ReachUI.Orders.Order({'id': id});

    return this.selectedOrder.fetch().then(
      function() {
        self.orderList.add(self.selectedOrder);
        return self.selectedOrder;
      },
      function(error) {
        alert("Order not found. Id: " + id);
      });
  },

  _fetchLineitem: function(id, order) {
    var lineitem = new ReachUI.LineItems.LineItem({'id': id, 'order_id': order.id});
    return lineitem.fetch().then(
      function() {
        return lineitem;
      },
      function() {
        alert('Lineitem not found. Id: ' + id);
      });
  },

  _showOrderDetailsAndLineItems: function(order) {
    order.select();
    this._showOrderDetails(order);
    this._showLineitemList(order);
  },

  _showNewLineItemView: function(order) {
    order.select();
    this._showOrderDetails(order);

    var newLineItem = new ReachUI.LineItems.LineItem({'order_id': order.id});
    this.lineItemController.show(newLineItem);
  },

  _showOrderDetails: function(order) {
    var detailOrderView = new ReachUI.Orders.DetailView({model: order});
    this.orderDetailsLayout.detail.show(detailOrderView);
  },

  _showLineitemList: function(order) {
    if(!this.lineItemList.getOrder() || this.lineItemList.getOrder().id !== order.id) {
      this.lineItemList.reset();
      this.lineItemList.setOrder(order);
      this.lineItemList.fetch();
    }

    var lineItemListView = new ReachUI.LineItems.LineItemListView({collection: this.lineItemList})
    lineItemListView.on('lineitem:create', function(args) {
      ReachUI.Orders.router.navigate('/'+ order.id +'/lineitems/new', {trigger: true});
    }, this);

    lineItemListView.on('itemview:lineitem:show', function(view) {
      this.selectedLineItem = view.model;
      ReachUI.Orders.router.navigate('/'+ view.model.get("order_id") +'/lineitems/' + view.model.id, {trigger: true});
    }, this);

    this.orderDetailsLayout.lineitems.show(lineItemListView);
  }
});
