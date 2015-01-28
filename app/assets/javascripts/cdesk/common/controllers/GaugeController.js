(function () {
  'use strict';
  commonModule.controller('gaugeController', function ($scope, gauge, gaugeModel, constants) {
    gauge.createGauge();
    gauge.setMessage(constants.GAUGE_PERFORMANCE, '% are On Track');
    gauge.drawPointer(constants.GAUGE_PERFORMANCE);
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