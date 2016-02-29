define(['angularAMD', 'common/services/constants_service'

],function (angularAMD) {
    'use strict';
    angularAMD.directive('campaignTacticsCard', function (utils,constants,momentService) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                strategy: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_tactics_card,

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
                $scope.getSpendDiffForTactic = function(tactic) {
                    if (tactic == undefined) {
                        return 0;
                    }
                    var expectedSpend = tactic.expectedMediaCost;
                    return $scope.getPercentDiff(expectedSpend, tactic.grossRev)
                }
                $scope.getSpendTotalDiffForTactic = function(tactic) {
                    if (tactic == undefined) {
                        return 0;
                    }
                    var totalSpend = tactic.totalMediaCost;
                    return $scope.getPercentDiff(totalSpend, tactic.grossRev)
                }
                $scope.getSpendClass = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = $scope.getSpendDifference(campaign);
                        return $scope.getClassFromDiff(spendDifference,campaign.end_date);
                    }
                };
                $scope.getSpendClassForTactic = function(tactic) {
                    var spendDifference = $scope.getSpendDiffForTactic(tactic);
                    return $scope.getClassFromDiff(spendDifference,tactic.endDate);
                }

                $scope.getClassFromDiff = function(spendDifference,endDate) {
                    if (endDate != undefined) {
                        var dateDiffInDays = momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), endDate);
                    }
                    if (spendDifference == -999) { //fix for initial loading
                        return '';
                    }
                    if(endDate != undefined) {
                        if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) == false) {
                            if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                                return 'red';
                            }else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
                                return 'blue';
                            }
                        }

                        //  past a campaign end date
                        if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), endDate) == true) {
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

                $scope.getSpendWidthForTactic = function(tactic) {
                    if(tactic !== undefined) {
                        var actualWidth = 100 + $scope.getSpendTotalDiffForTactic(tactic);
                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                }
                $scope.getSpendTickWidthForTactic = function(tactic) {
                    if(tactic !== undefined) {
                        var actualWidth = 100 + $scope.getSpendTickDifferenceForTactic(tactic);
                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                }
                $scope.getSpendTickDifferenceForTactic = function(tactic) {
                    var spendDifference = 0;
                    if(tactic !== undefined) {
                        var expectedSpend = tactic.expectedMediaCost;
                        var totalSpend = tactic.totalMediaCost;
                        return $scope.getPercentDiff(totalSpend, expectedSpend);
                    }
                    return spendDifference;
                };
                //$scope.campaigns.durationCompletion();
                //To show the accorsponding tactic card
                $scope.showStrategies = function(campaignId, strategiesCount) {
                    if(strategiesCount > 0) {
                      $('#strategies-accordion-' + campaignId).toggle();
                    }          
                };

                $scope.showTactics = function(strategyId, tacticsCount) {
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
              $scope.getMessageForDataNotAvailable = function (tactic) {
                if (!tactic)
                  return constants.MSG_DATA_NOT_AVAILABLE;
                else  if ( tactic.durationLeft() == 'Yet to start')
                  return constants.MSG_TACTIC_YET_TO_START;
                else if (tactic.daysSinceEnded() > 1000)
                  return constants.MSG_TACTIC_VERY_OLD;
                else if (tactic.kpiType =='null')
                  return constants.MSG_TACTIC_KPI_NOT_SET;
                else if (tactic.status == 'active')
                  return constants.MSG_TACTIC_ACTIVE_BUT_NO_DATA;
                else
                  return constants.MSG_DATA_NOT_AVAILABLE;
              };
            } 
        };
    });

});
