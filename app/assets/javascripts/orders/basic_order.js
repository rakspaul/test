(function(Orders) {
  'use strict';

  Orders.BasicDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/basic/order_details'],
    className: 'order-details',

    events: {
      'click .toggle-general-info-button': '_toggleGeneralInfo',
      'click #clientDfpUrl': '_openClientDFPUrl'
    },

    triggers: {
      'click .export-order':'order:export'
    },

    _toggleGeneralInfo: function() {
      $('.general-info-container .columns').slideToggle({
        complete: function() {
          var general_info_visible = ($(this).css('display') == 'block');
          $('.toggle-general-info-button').html(general_info_visible ? '^ Hide General Information ^' : 'v Show General Information v');
        }
      });
    },

    _openClientDFPUrl: function(event) {
      var client_order_id = this.model.get("client_order_id"),
        client_network_id = this.model.get("reach_client_network_id");
      if (client_order_id && client_network_id && client_order_id != "" && client_network_id != "") {
        var client_dfp_url = "https://www.google.com/dfp/"+client_network_id+"#delivery/OrderDetail/orderId=" + client_order_id
        window.open(client_dfp_url);
      }
    },

    onDomRefresh: function() {
      // Hide the general information section if the performance data is available
      if (moment(this.model.get('start_date')) < moment().startOf('day')) {
        $('.general-info-container .columns').css('display', 'none');
        $('.toggle-general-info-button').html('v Show General Information v');
      }
    }

  });

})(ReachUI.namespace("Orders"));