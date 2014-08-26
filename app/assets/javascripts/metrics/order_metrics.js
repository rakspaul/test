ReachMetricsApp.module("Metrics.Order", function (Order, ReachMetricsApp, Backbone, Marionette, $, _) {

  Order.Layout = Marionette.Layout.extend({
    template: JST['templates/metrics/order'],

    regions: {
      'orderMetricsContainer': "#order-metrics-container"
    },

    ui: {
      btnHideOrderMetrics: "#hideOrderMetricsBtn"
    },

    events: {
      "click #hideOrderMetricsBtn": "clickHideOrderMetricsBtn"
    },

    clickHideOrderMetricsBtn: function(e) {
      e.preventDefault();

      this.ui.btnHideOrderMetrics.toggleClass("active");
      if (this.ui.btnHideOrderMetrics.hasClass('active')) {
        $("#order-metrics-container").hide();
      } else {
        $("#order-metrics-container").show();
      }
    }
  });

  ReachMetricsApp.on("performance:include:order:metrics", function(){
    var orderMetricsLayout = new Order.Layout();
    ReachMetricsApp.orderMetricsRegion.show(orderMetricsLayout);

    ReachMetricsApp.trigger("performance:include:order:graphs", orderMetricsLayout);
  });
});