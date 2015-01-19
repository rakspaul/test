(function () {
    'use strict';
    angObj.directive('campaignTacticsCard', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                strategy: '=',
                campaigns: '='
            },

            templateUrl: 'campaign_tactics_card',

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
                        return $scope.getClassFromDiff(spendDifference);
                    }
                };
                $scope.getSpendClassForTactic = function(tactic) {
                    var spendDifference = $scope.getSpendDiffForTactic(tactic);
                    return $scope.getClassFromDiff(spendDifference);
                }
                $scope.getClassFromDiff = function(spendDifference) {
                    if (spendDifference > -1) {
                        return 'blue';
                    }
                    if (spendDifference <= -1 && spendDifference > -10) {
                        return 'amber';
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
            } 
        };
    });

}());
