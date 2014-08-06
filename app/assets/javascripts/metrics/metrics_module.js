ReachMetricsApp = new Marionette.Application();

ReachMetricsApp.module("Metrics", function (Metrics, ReachMetricsApp, Backbone, Marionette, $, _) {

  this.startWithParent = false;

  ReachMetricsApp.addRegions({
    "orderMetricsRegion": "#order-metrics-region"
  });

  Metrics.addInitializer(function(options) {
    ReachMetricsApp.order = options.order;

    // Show the metrics region IF the date is after 'yesterday'
    if (!moment(ReachMetricsApp.order.get('start_date')).isAfter(moment().subtract('days', 1))) {
      ReachMetricsApp.trigger("performance:include:order:metrics");
    }
  });

});