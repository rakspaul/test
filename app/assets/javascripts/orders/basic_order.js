(function(Orders) {
  'use strict';

  Orders.BasicDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/orders/basic/order_details'],
    className: 'order-details',

    events: {
      'click .toggle-general-info-button': '_toggleGeneralInfo',
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
    }
  });

})(ReachUI.namespace("Orders"));