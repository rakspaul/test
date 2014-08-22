ReachMetricsApp.module("Entities", function(Entities, ReachMetricsApp, Backbone, Marionette, $, _) {

  Entities.OrderMetrics = Backbone.Model.extend({

    defaults: {
      agency_user: true,
      start_date: '',
      end_date: '',
      impressions: 0,
      booked_impressions: 0,
      clicks: 0,
      ctr: 0,
      gross_rev: 0,
      booked_rev: 0,
      margin: 0,
      errors: '',
      cdb_unavailable: false
    },

    initialize: function(options) {
      this.set('orderId', options);
    },

    url: function() {
      return '/orders/' + this.get('orderId') + '/metrics.json';
    }
  });

});