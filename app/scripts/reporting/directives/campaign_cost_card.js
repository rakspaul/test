define(['angularAMD', '../../common/utils', 'common/services/constants_service'],
    function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignCostCard', function ($location, utils, constants) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_cost_card,

            link: function ($scope) {
                $scope.textConstants = constants;

                $scope.redirectTo = function (campaign, filterType) {
                    $location.url(filterType !== 'archived' ?
                        '/mediaplan/' + campaign.orderId + '/overview' :
                        '/mediaplans/'+campaign.orderId);
                };


                $scope.getSpendDifference = function (campaign) {
                    var spendDifference,
                        campaignCDBObj,
                        spend,
                        expectedSpend;

                    if (campaign !== undefined) {
                        // fix for initial loading
                        spendDifference = -999;

                        campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                        if (campaignCDBObj === undefined) {
                            return spendDifference;
                        }

                        spend = campaignCDBObj.getSpend();
                        expectedSpend = campaign.expectedMediaCost;

                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                };

                $scope.getSpendTotalDifference = function (campaign) {
                    var spendDifference,
                        campaignCDBObj,
                        spend,
                        totalSpend;

                    if (campaign !== undefined) {
                        spendDifference = 0;
                        campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                        if (campaignCDBObj === undefined) {
                            return spendDifference;
                        }

                        spend = campaignCDBObj.getSpend();
                        totalSpend = campaign.totalMediaCost;

                        return $scope.getPercentDiff(totalSpend, spend);
                    }
                };

                $scope.getSpendTickDifference = function (campaign) {
                    var spendDifference,
                        campaignCDBObj,
                        spend,
                        expectedSpend;

                    if (campaign !== undefined) {
                        spendDifference = 0;
                        campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                        if (campaignCDBObj === undefined) {
                            return spendDifference;
                        }

                        spend = campaign.expectedMediaCost;
                        expectedSpend = campaign.totalMediaCost;

                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                };

                $scope.getPercentDiff = function (expected, actual) {
                    var spendDifference = 0;

                    if (expected === 0) {
                        spendDifference = 0;
                    } else {
                        spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2);
                    }

                    return spendDifference;
                };

                $scope.getSpendClass = function (campaign) {
                    var spendDifference;

                    if (campaign !== undefined) {
                        spendDifference = $scope.getSpendDifference(campaign);

                        return $scope.getClassFromDiff(spendDifference,campaign.end_date);
                    }
                };

                $scope.getClassFromDiff = function (spendDifference) {

                    // fix for initial loading
                    if (spendDifference === -999) {
                        return '';
                    }

                    if (spendDifference < -10 || spendDifference > 20) {
                        return 'red';
                    } else if (spendDifference >= -10 && spendDifference <= 20) {
                        return 'blue';
                    }

                    return 'red';
                };

                $scope.getSpendWidth = function (campaign) {
                    var actualWidth;

                    if (campaign !== undefined) {
                        actualWidth = 100 + $scope.getSpendTotalDifference(campaign);

                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }

                        return actualWidth;
                    }
                };

                $scope.getSpendTickWidth = function (campaign) {
                    var actualWidth;

                    if (campaign !== undefined) {
                        actualWidth = 100 + $scope.getSpendTickDifference(campaign);

                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }

                        return actualWidth;
                    }
                };

                // This is called when the user clicks on the campaign title
                $scope.goToLocation = function (url) {
                    utils.goToLocation(url);
                };

                $scope.getMessageForDataNotAvailable = function () {
                    return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
                };
            }
        };
    });
});
