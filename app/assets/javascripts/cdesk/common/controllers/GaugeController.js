(function () {
  'use strict';
  commonModule.controller('gaugeController', function ($scope, gauge, gaugeModel, constants, $window) {
    var campaigns = '/#/campaigns';
    gauge.setLeftArcClickHandler(function() {
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_ONTRACK;
      $window.location.href = campaigns;
    });
    gauge.setRightArcClickHandler(function (){
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_UNDERPERFORMING;
      $window.location.href = campaigns;
    })
    gauge.createGauge();
    gauge.setMessage(constants.GAUGE_PERFORMANCE, '%');
    $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
      getGaugeData();
    });
    function getGaugeData () {
      gaugeModel.getGaugeData().then(function(result) {
        gauge.updateGauge(constants.GAUGE_PERFORMANCE, result);
      });
    }
    getGaugeData();
  });
}());