(function () {
  'use strict';
  commonModule.controller('headerController', function ($scope) {
    $scope.user_name = window.user_name;
    $scope.showProfileMenu = function() {
      $("#profileDropdown").toggle();
      $("#brandsList").hide();
      $("#cdbDropdown").hide();
    }
  });
}());