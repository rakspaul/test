define(['angularAMD', 'campaign-list-service', 'tactic-card', 'campaign-chart'],
    function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignStrategyCard', ['utils', 'loginModel', 'constants', 'campaignListService',
        'momentService', '$routeParams', function (utils, loginModel, constants, campaignListService, momentService, $routeParams) {
        return {
            restrict: 'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_strategy_card,

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

                $scope.getSpendDiffForStrategy = function (strategy) {
                    var expectedSpend;

                    if (strategy === undefined) {
                        return 0;
                    }

                    // if spend is not available don't return any color
                    if(strategy.spend){
                        expectedSpend = strategy.expectedMediaCost;
                        return $scope.getPercentDiff(expectedSpend, strategy.spend);
                    }
                };

                $scope.getSpendTotalDiffForStrategy = function (strategy) {
                    var totalSpend;

                    if (strategy === undefined) {
                        return 0;
                    }

                    totalSpend = strategy.totalMediaCost;

                    return $scope.getPercentDiff(totalSpend, strategy.spend);
                };

                $scope.getSpendClassForStrategy = function (strategy) {
                    if(strategy.spend) {
                        var spendDifference = $scope.getSpendDiffForStrategy(strategy);

                        return $scope.getClassFromDiff(spendDifference, strategy.startDate);
                    }
                };

                $scope.getClassFromDiff = function (spendDifference, strategyStartDate) {

                    // fix for initial loading
                    if (spendDifference === -999) {
                        return '';
                    }

                    // if startDate is less than the campaign start date , return empty;
                    if (strategyStartDate !== undefined) {
                        var dateDiffInDays =
                            momentService.dateDiffInDays(strategyStartDate, momentService.todayDate('YYYY-MM-DD'));
                        if(dateDiffInDays < 0){
                            return;
                        }
                    }
                    if (spendDifference >= -10 && spendDifference <= 20) {
                        return 'blue';
                    }

                    return 'red';
                };

                $scope.getSpendWidthForStrategy = function (strategy) {
                    var actualWidth = 100 + $scope.getSpendTotalDiffForStrategy(strategy);

                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }

                    return actualWidth;
                };

                $scope.getSpendTickWidthForStrategy = function (strategy) {
                    var actualWidth;

                    if (strategy !== undefined) {
                        actualWidth = 100 + $scope.getSpendTickDifferenceForStrategy(strategy);

                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }

                        return actualWidth;
                    }
                };

                $scope.getSpendTickDifferenceForStrategy = function (strategy) {
                    var spendDifference = 0,
                        spend,
                        expectedSpend;

                    if (strategy !== undefined) {
                        spend = strategy.expectedMediaCost;
                        expectedSpend = strategy.totalMediaCost;

                        return $scope.getPercentDiff(expectedSpend, spend);
                    }

                    return spendDifference;
                };

                // To show the accorsponding strategy card
                $scope.showStrategies = function (campaignId, strategiesCount) {
                    if (strategiesCount > 0) {
                        $('#strategies-accordion-' + campaignId).toggle();
                    }
                };

                $scope.showTactics = function (strategy) {
                    var strategyId = strategy.id,
                        tacticsCount = strategy.tactics_count,
                        clientId = $routeParams.subAccountId || $routeParams.accountId,
                        tacticsAccordion = $('#tactics-accordion-' + strategyId);

                    // TODO: check if object already requested!
                    // introducing the tactic data call initiation on click here
                    campaignListService.getTacticsList(clientId, $scope.campaign, strategy, constants.PERIOD_LIFE_TIME,
                        $scope.goToStrategyStartingPosition);

                    if (tacticsAccordion.css('display') === 'none') {
                        if (tacticsCount > 0) {
                            $('#loading_icon_' + strategyId).show();
                        }

                        $('#strategy_' + strategyId)
                            .find('.tactics_open_btn')
                            .addClass('tactic_open_class');
                    } else {
                        $('#loading_icon_' + strategyId).hide();
                        $('#strategy_' + strategyId)
                            .find('.tactics_open_btn')
                            .removeClass('tactic_open_class');
                    }

                    tacticsAccordion.toggle();
                };

                // This will call after loaded Tactics
                $scope.goToStrategyStartingPosition = function (strategyId, loadingFlag) {
                    $('html, body').animate({'scrollTop': $('#strategy_' + strategyId).offset().top - 10}, 'slow');

                    if (loadingFlag === 0) {
                        $('#loading_icon_' + strategyId).hide();
                    } else {
                        $('#loading_icon_' + strategyId).show();
                    }
                };

                // This will call the Parent controllers loadMoreStrategies function
                $scope.loadMoreStrategies = function (campaignId) {
                    $scope.$parent.loadMoreStrategies(campaignId);
                };

                // This will call the Parent controllers loadMoreTactics function
                $scope.loadMoreTactics = function (strategyId, campaignId) {
                    $scope.$parent.loadMoreTactics(strategyId, campaignId);
                };

                // This is called when the user clicks on the campaign title
                $scope.goToLocation = function (url) {
                    utils.goToLocation(url);
                };

                $scope.VTCpopup = function (event, flag) {
                    utils.VTCpopupfunc(event, flag);
                };

                $scope.getMessageForDataNotAvailable = function (strategy) {
                    if (!strategy) {
                        return constants.MSG_DATA_NOT_AVAILABLE;
                    } else if (strategy.durationLeft() === 'Yet to start') {
                        return utils.formatStringWithDate(constants.MSG_STRATEGY_YET_TO_START,strategy.startDate,constants.REPORTS_DATE_FORMAT);
                    } else if (strategy.daysSinceEnded() > 1000) {
                        return constants.MSG_STRATEGY_VERY_OLD;
                    } else if (strategy.kpiType === 'null') {
                        return constants.MSG_STRATEGY_KPI_NOT_SET;
                    } else if (strategy.status === 'active') {
                        return constants.MSG_STRATEGY_ACTIVE_BUT_NO_DATA;
                    } else {
                        return constants.MSG_DATA_NOT_AVAILABLE;
                    }
                };
            }
        };
    }]);
});
