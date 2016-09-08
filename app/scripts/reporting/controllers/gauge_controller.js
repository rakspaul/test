define(['angularAMD', 'gauge-model'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('GaugeController', ['$scope', '$rootScope', '$window', '$location', 'gauge', 'gaugeModel',
            'constants', 'accountService', 'subAccountService', 'vistoconfig',

            function ($scope, $rootScope, $window, $location, gauge, gaugeModel, constants, accountService, subAccountService, vistoconfig) {

                var campaigns;

                if (accountService.getSelectedAccount().isLeafNode) {
                    campaigns = '/a/' + vistoconfig.getMasterClientId() + '/mediaplans';
                } else {
                    var firstSubAccount = subAccountService.getSubAccounts()[0].id;
                    campaigns = '/a/' + vistoconfig.getMasterClientId() + '/sa/' + firstSubAccount + '/mediaplans';
                }

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
            }]);
    });
