ReachMetricsApp.module("Metrics.Order.Graphs", function (Graphs, ReachMetricsApp, Backbone, Marionette, $, _) {

  EXPORT_API_SRC = 'reachui';

  Graphs.View = Backbone.Marionette.ItemView.extend({
    template: JST['templates/metrics/order_graphs'],

    ui: {

    },

    modelEvents: {
      'change': 'render'
    },

    updateGraphs: function(userId, token, exportUri) {
      // Update start and end date
      this.model.set('startDate',
          moment(ReachMetricsApp.order.get('start_date')).format('DD MMM YYYY'));
      this.model.set('endDate', moment().subtract('days', 1).format('DD MMM YYYY'));

      // Get the data for impressions, clicks, ctr, gross_rev and all_cogs
      var metricsUrl = exportUri +
                      "?user_id=" + userId + "&tkn=" + token +
                      "&cols=impressions,clicks,ctr,gross_rev,all_cogs" +
                      "&filter=order_id:" + ReachMetricsApp.order.id +
                      "&start_date=" + ReachMetricsApp.order.get('start_date') +
                      "&precision=2&jsonp=updateMetrics&src=" + EXPORT_API_SRC;

      var self = this;
      $.getScript(metricsUrl, function(data) {
        var result = cdbResponse.records[0];
        self.model.set('impressions', parseInt(result.impressions ? result.impressions : 0));
        self.model.set('clicks', parseInt(result.clicks ? result.clicks : 0));
        self.model.set('ctr', parseInt(result.ctr ? result.ctr : 0));
        self.model.set('revenue', parseInt(result.gross_rev ? result.gross_rev : 0));
        var net_revenue = result.gross_rev - result.all_cogs;
        var gross_margin = (result.gross_rev != 0) ? ((net_revenue / result.gross_rev) * 100) : 0;
        self.model.set('margin', parseInt(gross_margin));
      });

      // Get the data for impressions, clicks, ctr, gross_rev and all_cogs
      metricsUrl = exportUri +
          "?user_id=" + userId + "&tkn=" + token +
          "&cols=booked_impressions,booked_rev" +
          "&filter=order_id:" + ReachMetricsApp.order.id +
          "&start_date=" + ReachMetricsApp.order.get('start_date') +
          "&precision=2&jsonp=updateMetrics&src=" + EXPORT_API_SRC;

      $.getScript(metricsUrl, function(data) {
        var bookedImpressions = 0;
        var bookedRevenue = 0;
        $.map(cdbResponse.records, function(e, i) {
          bookedImpressions += e.booked_impressions;
          bookedRevenue += e.booked_rev;
        });

        self.model.set('bookedImpressions', parseInt(bookedImpressions));
        self.model.set('bookedRevenue', parseInt(bookedRevenue));

        // Enable the parent div's opacity
        $('#order-metrics-container').addClass('active');
      });
    },

    updateMetrics: function() {
      // Get token
      var self = this;
      var token = undefined;
      var userId = undefined;
      $.getJSON('/token.json', function(response) {
        token = response.tkn;
        userId = response.current_user_id;
      }).done(function() {
        if (token && userId) {
          // Get the export uri
          var exportUri = undefined;

          $.getJSON('/export_uri.json', function(response) {
            exportUri = response.export_uri;
          }).done(function() {
            if (exportUri) {
              self.updateGraphs(userId, token, exportUri);
            }
          });
        }
      });
    }
  });

  ReachMetricsApp.on("performance:include:order:updateGraphs", function(graphsLayout){
    graphsLayout.updateMetrics();
  });

  ReachMetricsApp.on("performance:include:order:graphs", function(orderMetricsLayout){
    var graphsLayout = new Graphs.View({model: new ReachMetricsApp.Entities.OrderMetrics()});
    orderMetricsLayout.orderMetricsContainer.show(graphsLayout);

    ReachMetricsApp.trigger("performance:include:order:updateGraphs", graphsLayout);
  });

});


ReachMetricsApp.module("Entities", function(Entities, ReachMetricsApp, Backbone, Marionette, $, _) {

  Entities.OrderMetrics = Backbone.Model.extend({
    defaults: {
      startDate: '',
      endDate: '',
      impressions: 0,
      bookedImpressions: 0,
      clicks: 0,
      ctr: 0,
      revenue: 0,
      bookedRevenue: 0,
      margin: 0,
      errors: {}
    }
  });

});

