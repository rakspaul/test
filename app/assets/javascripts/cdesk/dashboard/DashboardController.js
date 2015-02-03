(function() {
  "use strict";
  dashboardModule.controller('dashboardController', function ($scope) {

      $(".main_navigation").find('.active').removeClass('active').end().find('#dashboard_nav_link').addClass('active');
  })
}());