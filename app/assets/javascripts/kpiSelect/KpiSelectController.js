(function () {
    'use strict';
    kpiSelectModule.controller('kpiSelectController', function ($scope, $rootScope , kpiSelectModel, campaignSelectModel , constants , analytics, loginModel) {

        $scope.kpiData = {};
        $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi() ;
        $scope.kpiData.kpiDropDown = kpiSelectModel.getKpiObj().kpiDropDown ;

        $scope.setSelectedKpi = function(_kpi){
          kpiSelectModel.setSelectedKpi(_kpi);

          $scope.kpiData.selectedKpi = kpiSelectModel.getSelectedKpi() ;
          $rootScope.$broadcast(constants.EVENT_KPI_CHANGED, _kpi);
        };

        $('#kpi_drop_down').click(function (e) {

            var _selectedKpi =  $(e.target).attr("value") ;

            $scope.setSelectedKpi(_selectedKpi);
            analytics.track(loginModel.getUserRole(), constants.GA_COST_METRIC_SELECTED, _selectedKpi, loginModel.getLoginName());
        });

    });
}());
