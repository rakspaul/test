(function () {
    'use strict';
    angObj.directive('campaignStrategyCard', function (utils, loginModel, analytics, constants) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_strategy_card,

            link: function ($scope, element, attrs) {

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
                    return $scope.getClassFromDiff(spendDifference);
                };
                $scope.getClassFromDiff = function(spendDifference) {
                    if (spendDifference > -1) {
                        return 'blue';
                    }
                    if (spendDifference <= -1 && spendDifference > -10) {
                        return 'amber';
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

                $scope.showTactics = function(strategyId, tacticsCount) {
                    var myContainer = $('#tactics-accordion-' + strategyId);
                    //var x = myContainer.offset().left;
                    var y = myContainer.offset().top;
                    var getTacticsCount = 1;
                    var maxTacticsCount = 2;
                    var maxTacticsHeight = 275;
                    if(tacticsCount > maxTacticsCount){
                        getTacticsCount = maxTacticsCount;
                    }
                    var scrollTo = getTacticsCount * maxTacticsHeight;
                    if($('#tactics-accordion-' + strategyId).css('display') === 'none') {
                        analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'show_tactics_for_strategy', loginModel.getLoginName());
                        $("html, body").animate({ scrollTop: y + scrollTo }, "slow"); 
                        $(".tactics_open_btn").addClass("tactic_open_class");
                    }else{
                        $("html, body").animate({ scrollTop: y - scrollTo }, "slow"); 
                        $(".tactics_open_btn").removeClass("tactic_open_class");
                    }
                    $('#tactics-accordion-' + strategyId).toggle();
                };

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

}());
