(function () {
  'use strict';
  commonModule.directive('header', function () {
    return {
      restrict:'EAC',
      templateUrl: assets.html_header
    };
  });

}());
