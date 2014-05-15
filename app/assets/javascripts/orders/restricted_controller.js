ReachUI.Orders.OrderRestrictedController = Marionette.Controller.extend({
  initialize: function() {
    this.orderDetailRegion = new ReachUI.Orders.DetailRegion();
    this.orderDetailsLayout = new ReachUI.Orders.OrderDetailLayout();
    this.orderList = new ReachUI.Orders.OrderList();
    this.lineItemList = new ReachUI.LineItems.LineItemList();

    this.orderDetailRegion.show(this.orderDetailsLayout);

    _.bindAll(this, '_showOrderDetailsAndLineItems');
  },

  index: function() {
    this._unselectOrder();
    this.orderDetailsLayout.bottom.reset();
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

  showLineItem: function(orderId, lineItemId) {
    this.selectedOrder = this.orderList.get(orderId);
    if (!this.selectedOrder) {
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
      if (!lineitem) {
        var self = this;
        this._fetchLineitem(lineItemId, this.selectedOrder).then(function(lineitem) {
          self.lineItemController.show(lineitem);
        });
      } else {
        this.lineItemController.show(lineitem);
      }
    }
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
    ReachUI.checkOrderStatus(order.id);
  },

  _showOrderDetails: function(order) {
    var detailOrderView = new ReachUI.Orders.BasicDetailView({model: order});
    this.orderDetailsLayout.top.show(detailOrderView);
  },

  _showLineitemList: function(order) {
    var self = this;
    if (!this.lineItemList.getOrder() || this.lineItemList.getOrder().id !== order.id) {
      this.lineItemList.reset();
      this.lineItemList.setOrder(order);
      this.lineItemList.fetch().then(
        function(collection, response, options) {
          _.each(self.lineItemList.models, function(li, index) {
            li.set('creatives', new ReachUI.Creatives.CreativesList(collection[index].creatives));
          });
          order.lineItemList = self.lineItemList;
          self._liSetCallbacksAndShow(self.lineItemList);
        },
        function(model, response, options) {
          console.log('error while getting lineitems list');
          console.log(response);
        }
      );
    } else {
      this.lineItemList.setOrder(order);
      this._liSetCallbacksAndShow(this.lineItemList);
    }
  },

  _calculateRemainingImpressions: function(li) {
    var remaining_impressions = li.get('volume');

    _.each(li.ads, function(ad) {
      remaining_impressions -= ad.get('volume');
    });

    return remaining_impressions;
  },

  /////////////////////////////////////////////////////////////////////////////////////////
  // the main function dealing with lineitems/ads/creatives
  _liSetCallbacksAndShow: function(lineItemList) {
    var lineItemListView = new ReachUI.LineItems.BasicLineItemListView({collection: lineItemList});

    // only if `show` action
    if (lineItemList.order.id) {
      var ags = new ReachUI.AudienceGroups.AudienceGroupsList();

      ags.fetch().then(function() {
        // set targeting for existing Order
        var itemIndex = 1;
        _.each(lineItemListView.children._views, function(li_view, li_name) {
          var li            = li_view.model;

          var selected_geos = li.get('selected_geos') ? li.get('selected_geos') : [];
          var zipcodes      = li.get('selected_zip_codes') ? li.get('selected_zip_codes').split(',') : [];
          var kv            = li.get('selected_key_values') ? li.get('selected_key_values') : [];

          li.set({
            'itemIndex': itemIndex,
            'targeting': new ReachUI.Targeting.Targeting({
              selected_zip_codes: zipcodes,
              selected_geos: selected_geos,
              selected_key_values: kv,
              audience_groups: ags.attributes,
              keyvalue_targeting: li.get('keyvalue_targeting'),
              type: li.get('type') })
          }, { silent: true });

          itemIndex += 1;
        });
        lineItemList._recalculateLiImpressionsMediaCost();
      });
    } else { // not persisted Order/Lineitems
      var ags = new ReachUI.AudienceGroups.AudienceGroupsList();

      $.when.apply($, [ ags.fetch() ]).done(function() {
        var itemIndex = 1;

        _.each(lineItemListView.children._views, function(li_view, li_name) {
          var li   = li_view.model;

          li.set({
            'itemIndex': itemIndex,
            'targeting': new ReachUI.Targeting.Targeting({
              audience_groups: ags.attributes,
              keyvalue_targeting: li_view.model.get('keyvalue_targeting'),
              type: li_view.model.get('type')})
          }, { silent: true });

          li_view._recalculateMediaCost();

          itemIndex += 1;
        });
        lineItemList._recalculateLiImpressionsMediaCost();
      });
    }
    this.orderDetailsLayout.bottom.show(lineItemListView);
  },
});
