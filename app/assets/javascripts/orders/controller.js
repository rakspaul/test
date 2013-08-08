ReachUI.Orders.DetailRegion = Backbone.Marionette.Region.extend({
  el: "#details .content"
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

    searchView.bindShortcutKey('s');

    searchOrderListView.on("itemview:selected", function(view) {
      ReachUI.Orders.router.navigate('/' + view.model.id, {trigger: true});
    });

    searchOrderListView.listenTo(this.orderList, 'change', function(model) {
      // update the order view in list when order is edited and saved.
      var view = searchOrderListView.children.findByModel(model);
      view.render();
    });

    $(".order-new").click(function() {
      ReachUI.Orders.router.navigate('/new', {trigger: true});
    });

    _.bindAll(this, '_showOrderDetailsAndLineItems', '_showNewLineItemView', '_onSaveOrderSuccess');
    this._bindKeys();
  },

  _bindKeys: function() {
    var self = this;
    Mousetrap.bind(['c o'], function(e) {
      ReachUI.Orders.router.navigate('/new', {trigger: true});
      return false;
    });

    Mousetrap.bind(['e o'], function(e) {
      if(self.selectedOrder) {
        ReachUI.Orders.router.navigate('/' + self.selectedOrder.id + '/edit', {trigger: true});
        return false;
      }
    });

    Mousetrap.bind(['c l'], function(e) {
      if(self.selectedOrder) {
        ReachUI.Orders.router.navigate('/' + self.selectedOrder.id + '/lineitems/new', {trigger: true});
        return false;
      }
    });

    Mousetrap.bind(['?'], function(e) {
      $("#shortcut_help_modal").modal("show");
    });
  },

  index: function() {
    //this.orderList.fetch();
    //this.orderDetailsLayout.top.close();
    //this.orderDetailsLayout.bottom.close();
    var order = new ReachUI.Orders.Order();
    var uploadView = new ReachUI.Orders.UploadView();

    if(this.selectedOrder) {
      this.selectedOrder.unselect();
    }

    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    //this.orderDetailsLayout.bottom.show(view);
    
  },

  newOrder: function() {
    var order = new ReachUI.Orders.Order();
    var view = new ReachUI.Orders.EditView({model: order});
    var uploadView = new ReachUI.Orders.UploadView();

    if(this.selectedOrder) {
      this.selectedOrder.unselect();
    }

    uploadView.on('io:uploaded', this._ioUploaded, this);
    this.orderDetailsLayout.top.show(uploadView);
    this.orderDetailsLayout.bottom.show(view);
    view.on('order:save', this._saveOrder, this);
    view.on('order:close', function() {
      window.history.back();
    });
  },

  editOrder: function(id) {
    this.selectedOrder = this.orderList.get(id);
    if(!this.selectedOrder) {
      var promise = this._fetchOrder(id);
      promise.then(this._showEditOrder);
    } else {
      this._showEditOrder(this.selectedOrder);
    }
  },

  _showEditOrder: function(order) {
    order.select();

    var view = new ReachUI.Orders.EditView({model: order});
    this.orderDetailsLayout.top.close();
    this.orderDetailsLayout.bottom.show(view);

    view.on('order:save', this._saveOrder, this);
    view.on('order:close', function() {
      window.history.back();
    });
  },

  _ioUploaded: function(orderModel) {
    this.orderList.unshift(orderModel);
    // view order
    ReachUI.Orders.router.navigate('/' + orderModel.id, {trigger: true});
  },

  _saveOrder: function(args) {
    var model = args.model,
      view = args.view,
      isNew = model.isNew();;

    var _order = {
      name: view.ui.name.val(),
      start_date: view.ui.start_date.val(),
      end_date: view.ui.end_date.val(),
      advertiser_id: view.ui.advertiser_id.val(),
      sales_person_id: view.ui.sales_person_id.val()
    };

    // get all the error labels and clear them
    _.keys(view.ui)
      .filter(function(val) {
        return /_error$/.test(val);
      })
      .forEach(function(val) {
        view.ui[val].text("");
      });

    var self = this;

    model.save(_order, {
      success: this._onSaveOrderSuccess,
      error: this._onSaveOrderFailure,
      view: view,
      isNew: isNew
    });
  },

  _onSaveOrderSuccess: function(model, response, options) {
    // add order at beginning
    this.orderList.unshift(model);
    if(options.isNew) {
      // view order
      ReachUI.Orders.router.navigate('/' + model.id, {trigger: true});
    } else {
      window.history.back();
    }
  },

  _onSaveOrderFailure: function(model, xhr, options) {
    if(xhr.responseJSON && xhr.responseJSON.errors) {
      var formErrors = [];

      _.each(xhr.responseJSON.errors, function(value, key) {
        var errorLabel = options.view.ui[key + "_error"];
        if(errorLabel) {
          errorLabel.text(value[0]);
        } else {
          formErrors.push(value);
        }
      });

      alert("Error saving order. \n" + formErrors.join("\n"));
    }
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
      this._showOrderDetails(this.selectedOrder);

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
                                    mainRegion: this.orderDetailsLayout.bottom
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
    detailOrderView.on('order:edit', function(args) {
      var order = args.model;
      ReachUI.Orders.router.navigate('/'+ order.id +'/edit', {trigger: true});
    });
    detailOrderView.on('order:export', function(args) {
      var order = args.model;
      window.location.href = '/orders/'+ order.id +'/export.xls';
    });
    this.orderDetailsLayout.top.show(detailOrderView);

    //turn x-editable plugin to inline mode
    $.fn.editable.defaults.mode = 'inline';
    $.fn.editable.defaults.ajaxOptions = {type: "PATCH", dataType: 'json'};
    $('.editable.typeahead').editable({
      source: ["Eric Burns", "Mary Ball", "Bryan Snyder", "Ronnie Wallace"]
    });
    $('.total_media_cost .editable.custom').editable({
      validate: function(value) {
        if(value.match(/[^\d]+/)) {
          return 'This field should contain only digits';
        }
      }
    });
    $('.editable:not(.typeahead):not(.custom)').editable();
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

    this.orderDetailsLayout.bottom.show(lineItemListView);
  }
});
