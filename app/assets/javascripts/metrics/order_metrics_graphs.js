ReachMetricsApp.module("Metrics.Order.Graphs", function (Graphs, ReachMetricsApp, Backbone, Marionette, $, _) {

  EXPORT_API_SRC = 'reachui';

  Graphs.View = Backbone.Marionette.ItemView.extend({
    template: JST['templates/metrics/order_graphs'],

    ui: {
      marginDiv: '#metrics-margin-div'
    },

    modelEvents: {
      'change': 'render'
    },

    updateMetrics: function() {
      var self = this;
      // fetch the model
      this.model.fetch({
        success: function(response) {
          // If the response returned a "cdb_unavailable", then show error and show overlay for the order metrics region
          if (response.get('cdb_unavailable')) {
            $('#order_metrics_error').html('The performance reporting system is unavailable. Please try again later by refreshing the page.');
            // Show an error message and enable the order metrics container
            $('#order-metrics-container').removeClass('active');
          } else {
            // if campaign hasnt started, hide the performance region
            if (response.get('not_started')) {
              // hide metrics region
              $('#order-metrics-region').removeClass('active');
            } else {
              // Make order metrics container active
              $('#order-metrics-container').addClass('active');
            }
          }
        },
        error: function() {
          console.log('Error fetching order metrics...');
          $('#order_metrics_error').html('The performance reporting system is unavailable. Please try again later by refreshing the page.');
          // Show an error message and enable the order metrics container
          $('#order-metrics-container').removeClass('active');
        }
      });
    }
  });

  ReachMetricsApp.on("performance:include:order:updateGraphs", function(graphsLayout){
    graphsLayout.updateMetrics();
  });

  ReachMetricsApp.on("performance:include:order:graphs", function(orderMetricsLayout){
    var graphsLayout = new Graphs.View({model: new ReachMetricsApp.Entities.OrderMetrics(ReachMetricsApp.order.id)});
    orderMetricsLayout.orderMetricsContainer.show(graphsLayout);

    ReachMetricsApp.trigger("performance:include:order:updateGraphs", graphsLayout);
  });

});

