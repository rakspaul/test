(function () {
  'use strict';
  commonModule.controller('gaugeController', function ($scope, gauge, gaugeModel, constants) {
    gauge.createGauge();
    gauge.setMessage(constants.GAUGE_PERFORMANCE, '% are on track');
    gauge.drawPointer(constants.GAUGE_PERFORMANCE);
    gaugeModel.getGaugeData().then(function(result) {
      gauge.updateGauge(constants.GAUGE_PERFORMANCE, result);
    });
  });
}());