(function () {
  'use strict';
  commonModule.controller('gaugeController', function ($scope, $rootScope, gauge, gaugeModel, constants, $window, loginModel, analytics, $location) {
    var campaigns = '/campaigns';
    gauge.setLeftArcClickHandler(function() {
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_ONTRACK;
      analytics.track(loginModel.getUserRole(), 'dashboard_campaign_widget', 'campaign_widget_on_track_clicked', loginModel.getLoginName());
      $location.path(campaigns);
      $scope.$apply(); //TODO we need to remove this, added because of removing the hashtag
    });
    gauge.setRightArcClickHandler(function (){
      gaugeModel.dashboard.selectedFilter = constants.ACTIVE_UNDERPERFORMING;
      analytics.track(loginModel.getUserRole(), 'dashboard_campaign_widget', 'campaign_widget_underperforming_clicked', loginModel.getLoginName());
      $location.path(campaigns);
      $scope.$apply(); //TODO we need to remove this, added because of removing the hashtag
    })
    gauge.createGauge();
    gauge.setMessage(constants.GAUGE_PERFORMANCE, '%');
    $scope.$on(constants.EVENT_BRAND_CHANGED, function(event, args) {
      getGaugeData();
    });
    function getGaugeData () {
      $scope.perfBusy = true;
      gaugeModel.getGaugeData().then(function(result) {
        $scope.perfBusy = false;
        if(result.campaignsFoundForSetKPI){
          $scope.dataFound = true;
          gauge.updateGauge(constants.GAUGE_PERFORMANCE, result);
        } else {
          $scope.message = constants.MSG_NO_CAMPAIGNS_WITH_SET_KPI;
           $scope.dataFound = false;
        }
      });
    }
    getGaugeData();
    $scope.getMessageForDataNotAvailable = function () {
        return constants.MSG_NO_CAMPAIGNS_WITH_SET_KPI;
    };
  });
}());