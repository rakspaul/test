define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignTacticsCard', function (utils, constants) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                strategy: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_tactics_card,

            link: function ($scope) {
                $scope.textConstants = constants;

                $scope.getPercentDiff = function (expected, actual) {
                    var spendDifference = 0;

                    if (expected === 0) {
                        spendDifference = 0;
                    } else {
                        spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2);
                    }
                    return spendDifference;
                };

                $scope.getSpendDiffForTactic = function (tactic) {
                    var expectedSpend;

                    if (tactic === undefined) {
                        return 0;
                    }

                    expectedSpend = tactic.expectedMediaCost;

                    return $scope.getPercentDiff(expectedSpend, tactic.spend);
                };

                $scope.getSpendTotalDiffForTactic = function (tactic) {
                    var totalSpend;

                    if (tactic === undefined) {
                        return 0;
                    }

                    totalSpend = tactic.totalMediaCost;

                    return $scope.getPercentDiff(totalSpend, tactic.spend);
                };

                $scope.getSpendClass = function (campaign) {
                    var spendDifference;

                    if (campaign !== undefined) {
                        spendDifference = $scope.getSpendDifference(campaign);

                        return $scope.getClassFromDiff(spendDifference,campaign.end_date);
                    }
                };

                $scope.getSpendClassForTactic = function (tactic) {
                    var spendDifference = $scope.getSpendDiffForTactic(tactic);

                    return $scope.getClassFromDiff(spendDifference,tactic.endDate);
                };

                $scope.getClassFromDiff = function (spendDifference) {

                    // fix for initial loading
                    if (spendDifference === -999) {
                        return '';
                    }

                    if (spendDifference >= -10 && spendDifference <= 20) {
                        return 'blue';
                    }

                    return 'red';
                };

                $scope.getSpendWidthForTactic = function (tactic) {
                    var actualWidth;

                    if (tactic.spend) {
                        actualWidth = 100 + $scope.getSpendTotalDiffForTactic(tactic);

                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                };

                $scope.getSpendTickWidthForTactic = function (tactic) {
                    var actualWidth;

                    if (tactic !== undefined) {
                        actualWidth = 100 + $scope.getSpendTickDifferenceForTactic(tactic);

                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }

                        return actualWidth;
                    }
                };

                $scope.getSpendTickDifferenceForTactic = function (tactic) {
                    var spendDifference = 0,
                        expectedSpend,
                        totalSpend;

                    if (tactic !== undefined) {
                        expectedSpend = tactic.expectedMediaCost;
                        totalSpend = tactic.totalMediaCost;
                        return $scope.getPercentDiff(totalSpend, expectedSpend);
                    }

                    return spendDifference;
                };

                // To show the corresponding tactic card
                $scope.showStrategies = function (campaignId, strategiesCount) {
                    if (strategiesCount > 0) {
                      $('#strategies-accordion-' + campaignId).toggle();
                    }
                };

                $scope.showTactics = function (strategyId) {
                      $('#tactics-accordion-' + strategyId).toggle();
                };

                // This will call the Parent controllers loadMoreStrategies function
                $scope.loadMoreStrategies = function (campaignId) {
                    $scope.$parent.loadMoreStrategies(campaignId);
                };

                // This will call the Parent controllers loadMoreTactics function
                $scope.loadMoreTactics = function (strategyId, campaignId) {
                    $scope.$parent.loadMoreTactics(strategyId, campaignId);
                };

                //This is called when the user clicks on the campaign title
                $scope.goToLocation = function (url) {
                    utils.goToLocation(url);
                };

                $scope.VTCpopup = function (event,flag) {
                    utils.VTCpopupfunc(event,flag) ;
                };

                $scope.getMessageForDataNotAvailable = function (tactic) {
                    if (!tactic) {
                        return constants.MSG_DATA_NOT_AVAILABLE;
                    } else  if ( tactic.durationLeft() === 'Yet to start') {
                        return utils.formatStringWithDate(constants.MSG_TACTIC_YET_TO_START,tactic.startDate,constants.REPORTS_DATE_FORMAT);
                    } else if (tactic.daysSinceEnded() > 1000) {
                        return constants.MSG_TACTIC_VERY_OLD;
                    } else if (tactic.kpiType === 'null') {
                        return constants.MSG_TACTIC_KPI_NOT_SET;
                    } else if (tactic.status === 'active') {
                        return constants.MSG_TACTIC_ACTIVE_BUT_NO_DATA;
                    } else {
                        return constants.MSG_DATA_NOT_AVAILABLE;
                    }
                };
            }
        };
    });
});
