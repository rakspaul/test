(function () {
  'use strict';
  commonModule.controller('gaugeController', function ($scope, gauge, gaugeModel, constants, $window, loginModel, analytics) {
    var campaigns = '/#/campaigns';
    gauge.setLeftArcClickHandler(function() {
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_ONTRACK;
      analytics.track(loginModel.getUserRole(), 'dashboard_campaign_widget', 'campaign_widget_on_track_clicked', loginModel.getLoginName());
      $window.location.href = campaigns;
    });
    gauge.setRightArcClickHandler(function (){
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_UNDERPERFORMING;
      analytics.track(loginModel.getUserRole(), 'dashboard_campaign_widget', 'campaign_widget_underperforming_clicked', loginModel.getLoginName());
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