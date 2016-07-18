define(['angularAMD', '../common/d3/gauge', 'reporting/models/gauge_model', 'common/services/constants_service'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('GaugeController', function ($scope, $rootScope, $window, $location, gauge, gaugeModel,
                                                       constants) {
        var campaigns = '/mediaplans';

        gauge.setLeftArcClickHandler(function () {
            gaugeModel.dashboard.selectedFilter = constants.ACTIVE_ONTRACK;
            $location.path(campaigns);

            // TODO: we need to remove this, added because of removing the hashtag
            $scope.$apply();
        });

        gauge.setRightArcClickHandler(function () {
            gaugeModel.dashboard.selectedFilter = constants.ACTIVE_UNDERPERFORMING;
            $location.path(campaigns);

            // TODO: we need to remove this, added because of removing the hashtag
            $scope.$apply();
        });

        gauge.createGauge();
        gauge.setMessage(constants.GAUGE_PERFORMANCE, '%');

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function () {
            getGaugeData();
        });

        $scope.$on(constants.EVENT_BRAND_CHANGED, function () {
            getGaugeData();
        });

        function getGaugeData() {
            $scope.perfBusy = true;

            gaugeModel
                .getGaugeData()
                .then(function (result) {
                    $scope.perfBusy = false;

                    if (result.campaignsFoundForSetKPI) {
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
});
