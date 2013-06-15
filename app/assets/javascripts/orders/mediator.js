ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
  el: "#details .content"
});

ReachUI.Orders.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    '': 'index',
    ':id': 'orderDetails',
    ':id/lineitems/new': 'newLineItem'
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
    console.log('navigated');
  },

  newLineItem: function(id) {
    this._loadOrder(id);
  },

  _loadOrder: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var self = this;
      this.selectedOrder = new ReachUI.Orders.Order({'id': id})
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

  _selectOrder: function(order) {
    order.select();
    this._showOrderDetails(order);
    var currentRoute = ReachUI.Orders.router.current().route;
    if(currentRoute === "orderDetails") {
      this._showLineitemList(order);
    } else if(currentRoute === "newLineItem") {
      this._newLineItem();
    }
  },

  _showOrderDetails: function(order) {
    var detailOrderView = new ReachUI.Orders.DetailView({model: order});
    this.orderDetailsLayout.detail.show(detailOrderView);
  },

  _showLineitemList: function(order) {
    var lineItemList = new ReachUI.LineItems.LineItemList();
    lineItemList.setOrder(order);
    lineItemList.fetch();

    var lineItemListView = new ReachUI.LineItems.LineItemListView({collection: lineItemList})
    lineItemListView.on('create:lineitem', function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id+'/lineitems/new', {trigger: true});
    }, this);

    this.orderDetailsLayout.lineitems.show(lineItemListView);
  },

  _newLineItem: function() {
    var newLineItem = new ReachUI.LineItems.LineItem({'order': this.selectedOrder});
    var newItemView = new ReachUI.LineItems.NewLineItemView({model: newLineItem});
    newItemView.on("lineitem:created", function() {
      ReachUI.Orders.router.navigate('/'+this.selectedOrder.id, {trigger: true});
    }, this);

    this.orderDetailsLayout.lineitems.show(newItemView);
  }
});
