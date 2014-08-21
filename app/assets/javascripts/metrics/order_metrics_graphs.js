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
          // if campaign hasnt started, hide the performance region
          if (response.get('not_started')) {
            // hide metrics region
            $('#order-metrics-region').removeClass('active');
          } else {
            // Make order metrics container active
            $('#order-metrics-container').addClass('active');
          }
          self.model.set('errors', 'The performance reporting system is unavailable. Please refresh the page at a later time to update the performance section.');
        },
        error: function() {
          console.log('Error fetching order metrics...');
          self.model.set('errors', 'The performance reporting system is unavailable. Please try again later by refreshing the page.');
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

