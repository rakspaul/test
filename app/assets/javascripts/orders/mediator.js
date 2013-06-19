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

    this.orderDetailRegion.show(this.orderDetailsLayout);

    this.orderList = new ReachUI.Orders.OrderList();
    var searchOrderListView = new ReachUI.Orders.ListView({el: '.order-search-result', collection: this.orderList});
    searchOrderListView.on("itemview:selected", function(view) {
      ReachUI.Orders.router.navigate('/'+view.model.id, {trigger: true});
    });

    var search = new ReachUI.Search.SearchQuery(),
      searchView = new ReachUI.Search.SearchQueryView({model: search}),
      self = this;
    search.on('change:query', function() {
      self.orderList.fetch({data: {search: this.get('query')}});
    });
  },

  index: function() {
    this.orderList.fetch();
  },

  orderDetails: function(id) {
    this._loadOrder(id);
  },

  newLineItem: function(id) {
    this._loadOrder(id);
  },

  showLineItem: function(orderId, lineItemId) {
    this.lineItemId = lineItemId;
    this._loadOrder(orderId);
  },

  _loadOrder: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var self = this;
      this.selectedOrder = new ReachUI.Orders.Order({'id': id});
      this.selectedOrder.fetch({
        success: function() {
          self.orderList.add(self.selectedOrder);
          self._selectOrder(self.selectedOrder);
        },
        error: function() {
          alert('Order not found');
        }
      });
    } else {
      this._selectOrder(this.selectedOrder);
    }
    console.log(ReachUI.Orders.router.current());
  },

  _loadLineitem: function(id) {
    if(!this.lineItemList) {
      this.lineItemList = new ReachUI.LineItems.LineItemList();
    }

    var lineitem = this.lineItemList.get(id);
    if(!lineitem) {
      var self = this;
      lineitem = new ReachUI.LineItems.LineItem({}, {'order': this.selectedOrder});
      lineitem.id = id;
      lineitem.fetch({
        success: function(model) {
          self._showLineItem(model);
        },
        error: function(model) {
          alert('Lineitem not found. Id: ' + model.id);
        }
      });
    } else {
      this._showLineItem(lineitem);
    }
  },

  _selectOrder: function(order) {
    order.select();
    this._showOrderDetails(order);
    var currentRoute = ReachUI.Orders.router.current().route;
    if(currentRoute === "orderDetails") {
      this._showLineitemList(order);
    } else if(currentRoute === "newLineItem") {
      this._newLineItem();
    } else if(currentRoute === "showLineItem") {
      this._loadLineitem(this.lineItemId);
    }
  },

  _showOrderDetails: function(order) {
    var detailOrderView = new ReachUI.Orders.DetailView({model: order});
    this.orderDetailsLayout.detail.show(detailOrderView);
  },

  _showLineitemList: function(order) {
    this.lineItemList = new ReachUI.LineItems.LineItemList();
    this.lineItemList.setOrder(order);
    this.lineItemList.fetch();

    var lineItemListView = new ReachUI.LineItems.LineItemListView({collection: this.lineItemList})
    lineItemListView.on('lineitem:create', function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id+'/lineitems/new', {trigger: true});
    }, this);

    lineItemListView.on('itemview:lineitem:show', function(view) {
      this.selectedLineItem = view.model;
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id+'/lineitems/' + this.selectedLineItem.id, {trigger: true});
    }, this);

    this.orderDetailsLayout.lineitems.show(lineItemListView);
  },

  _newLineItem: function() {
    var newLineItem = new ReachUI.LineItems.LineItem({}, {'order': this.selectedOrder});
    var lineItemController = new ReachUI.LineItems.LineItemController({
                                    model: newLineItem, mainRegion:
                                    this.orderDetailsLayout.lineitems
                                  });

    lineItemController.on("lineitem:saved", function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id, {trigger: true});
    }, this);

    lineItemController.show();
  },

  _showLineItem: function(lineitem) {
    lineitem.setOrder(this.selectedOrder);
    var lineItemController = new ReachUI.LineItems.LineItemController({
                                    model: lineitem,
                                    mainRegion: this.orderDetailsLayout.lineitems
                                  });

    lineItemController.on("lineitem:saved", function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id, {trigger: true});
    }, this);

    lineItemController.on("lineitem:close", function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id, {trigger: true});
    }, this);

    lineItemController.show();
  }
});
