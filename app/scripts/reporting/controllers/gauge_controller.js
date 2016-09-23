define(['angularAMD', 'gauge-model'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('GaugeController', ['$scope', '$rootScope', '$window', '$location', '$routeParams', 'gauge', 'gaugeModel',
            'constants', 'urlBuilder',

            function ($scope, $rootScope, $window, $location, $routeParams, gauge, gaugeModel, constants, urlBuilder) {


                gauge.setLeftArcClickHandler(function () {
                    gaugeModel.dashboard.selectedFilter = constants.ACTIVE_ONTRACK;
                    $location.path(urlBuilder.mediaPlansListUrl());
                    $scope.$apply();
                });

                gauge.setRightArcClickHandler(function () {
                    gaugeModel.dashboard.selectedFilter = constants.ACTIVE_UNDERPERFORMING;
                    $location.path(urlBuilder.mediaPlansListUrl());
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
            }]);
    });
