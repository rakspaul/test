ReachMetricsApp.module("Metrics.Order", function (Order, ReachMetricsApp, Backbone, Marionette, $, _) {

  Order.Layout = Marionette.Layout.extend({
    template: JST['templates/metrics/order'],
    regions: {
      'orderMetricsContainer': "#order-metrics-container"
    }
  });

  ReachMetricsApp.on("performance:include:order:metrics", function(){
    var orderMetricsLayout = new Order.Layout();
    ReachMetricsApp.orderMetricsRegion.show(orderMetricsLayout);

    ReachMetricsApp.trigger("performance:include:order:graphs", orderMetricsLayout);
  });
});