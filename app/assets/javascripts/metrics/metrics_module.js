ReachMetricsApp = new Marionette.Application();

ReachMetricsApp.module("Metrics", function (Metrics, ReachMetricsApp, Backbone, Marionette, $, _) {

  this.startWithParent = false;

  ReachMetricsApp.addRegions({
    "orderMetricsRegion": "#order-metrics-region"
  });

  Metrics.addInitializer(function(options) {
    ReachMetricsApp.order = options.order;

    ReachMetricsApp.trigger("performance:include:order:metrics");
  });

});