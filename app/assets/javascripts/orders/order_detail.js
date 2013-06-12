(function(OrderDetail) {
  OrderDetail.OrderDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/order_details'],
    className: 'order-detail'
  });
})(ReachUI.namespace("Orders.OrderDetail"))
