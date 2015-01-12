(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope) {
    $scope.user_name = window.user_name;
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $(".page_filters").find(".dropdown_open").removeClass("dropdown_open");
      $("#cdbDropdown").hide();
    }
  });
}());