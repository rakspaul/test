define(['angularAMD', 'common/services/constants_service', 'reporting/campaignList/campaign_list_service', 'common/moment_utils'

],function (angularAMD) {
    'use strict';
    angularAMD.directive('campaignStrategyCard', function (utils, loginModel, constants, campaignListService,momentService) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_strategy_card,

            link: function ($scope, element, attrs) {

                $scope.textConstants = constants;

                $scope.getPercentDiff = function(expected, actual) {
                    var spendDifference = 0;
                    if (expected == 0) {
                        spendDifference = 0;
                    } else {
                        spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2)
                    }
                    return spendDifference;
                }
                $scope.getSpendDiffForStrategy = function(strategy) {
                    if (strategy == undefined) {
                        return 0;
                    }
                    var expectedSpend = strategy.expectedMediaCost;
                    return $scope.getPercentDiff(expectedSpend, strategy.grossRev)
                };
                $scope.getSpendTotalDiffForStrategy = function(strategy) {
                    if (strategy == undefined) {
                        return 0;
                    }
                    var totalSpend = strategy.totalMediaCost;
                    return $scope.getPercentDiff(totalSpend, strategy.grossRev)
                };
                $scope.getSpendClassForStrategy = function(strategy) {
                    var spendDifference = $scope.getSpendDiffForStrategy(strategy);
                    return $scope.getClassFromDiff(spendDifference,strategy.endDate);
                };

                $scope.getClassFromDiff = function(spendDifference,strategyEndDate) {
                    if (strategyEndDate != undefined) {
                        var dateDiffInDays = momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), strategyEndDate);
                    }
                    if (spendDifference == -999) { //fix for initial loading
                        return '';
                    }
                    if(strategyEndDate != undefined) {
                        if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), strategyEndDate) == false) {
                            if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                                return 'red';
                            }else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
                                return 'blue';
                            }
                        }

                        //  past a campaign end date
                        if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), strategyEndDate) == true) {
                            return (spendDifference < -5 || spendDifference > 5) ? 'red' : 'blue';
                        }
                    }
                    if (spendDifference < -10 || spendDifference > 20) {
                        return 'red';
                    } else if (spendDifference >= -10 && spendDifference <= 20) {
                        return 'blue';
                    }
                    return 'red';
                }
                $scope.getSpendWidthForStrategy = function(strategy) {
                    var actualWidth = 100 + $scope.getSpendTotalDiffForStrategy(strategy);
                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }
                    return actualWidth;
                }
                $scope.getSpendTickWidthForStrategy = function(strategy) {
                    if(strategy !== undefined) {
                        var actualWidth = 100 + $scope.getSpendTickDifferenceForStrategy(strategy);
                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                }
                $scope.getSpendTickDifferenceForStrategy = function(strategy) {
                    var spendDifference = 0;
                    if(strategy !== undefined) {
                        var spend = strategy.expectedMediaCost;
                        var expectedSpend = strategy.totalMediaCost;
                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                    return spendDifference;
                };


                //$scope.campaigns.durationCompletion();
                //To show the accorsponding strategy card
                $scope.showStrategies = function(campaignId, strategiesCount) {
                    if(strategiesCount > 0) {
                      $('#strategies-accordion-' + campaignId).toggle();
                    }
                };

                $scope.showTactics = function(strategy) {
                    var strategyId = strategy.id,
                        tacticsCount = strategy.tactics_count;
                    //TODO: check if object already requested!
                    //introducing the tactic data call initiation on click here
                    campaignListService.requestTacticsList(strategy, constants.PERIOD_LIFE_TIME, $scope.campaign,$scope.goToStrategyStartingPosition);
                    if($('#tactics-accordion-' + strategyId).css('display') === 'none') {
                        if(tacticsCount > 0){
                            $("#loading_icon_"+strategyId).show();
                        }
                        analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'show_tactics_for_strategy', loginModel.getLoginName());
                        $("#strategy_"+strategyId).find(".tactics_open_btn").addClass("tactic_open_class");
                    }else{
                         $("#loading_icon_"+strategyId).hide();
                        $("#strategy_"+strategyId).find(".tactics_open_btn").removeClass("tactic_open_class");
                    }
                    $('#tactics-accordion-' + strategyId).toggle();

                };
                //This will call after loaded Tactics
                $scope.goToStrategyStartingPosition = function(strategyId,loadingFlag){
                    $('html, body').animate({'scrollTop' : $("#strategy_"+strategyId).offset().top - 10 },"slow");
                    if(loadingFlag == 0){
                         $("#loading_icon_"+strategyId).hide();
                     }else{
                         $("#loading_icon_"+strategyId).show();
                     }
                }
                //This will call the Parent controllers loadMoreStrategies function
                $scope.loadMoreStrategies = function(campaignId) {
                    $scope.$parent.loadMoreStrategies(campaignId);
                };

                //This will call the Parent controllers loadMoreTactics function
                $scope.loadMoreTactics = function(strategyId, campaignId) {
                    $scope.$parent.loadMoreTactics(strategyId, campaignId);
                };

                //This is called when the user clicks on the campaign title
                $scope.goToLocation = function(url){
                    utils.goToLocation(url);
                };
                $scope.VTCpopup = function(event,flag) {
                    utils.VTCpopupfunc(event,flag) ;
                }

              $scope.getMessageForDataNotAvailable = function (strategy) {
                if (!strategy)
                  return constants.MSG_DATA_NOT_AVAILABLE;
                else  if ( strategy.durationLeft() == 'Yet to start')
                  return constants.MSG_STRATEGY_YET_TO_START;
                else if (strategy.daysSinceEnded() > 1000)
                  return constants.MSG_STRATEGY_VERY_OLD;
                else if (strategy.kpiType =='null')
                  return constants.MSG_STRATEGY_KPI_NOT_SET;
                else if (strategy.status == 'active')
                  return constants.MSG_STRATEGY_ACTIVE_BUT_NO_DATA;
                else
                  return constants.MSG_DATA_NOT_AVAILABLE;
              };
            }
        };
    });

});
