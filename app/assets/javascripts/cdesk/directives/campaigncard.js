(function () {
    'use strict';
    angObj.directive('campaignCard', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: 'campaign_card',

            link: function ($scope, element, attrs) {

                $scope.getSpendDifference = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = 0;
                        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                        if (campaignCDBObj == undefined) {
                            return spendDifference;
                        }
                        var spend =campaignCDBObj.getGrossRev();
                        var expectedSpend =campaign.expectedMediaCost;
                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                };

                $scope.getSpendTickDifference = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = 0;
                        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                        if (campaignCDBObj == undefined) {
                            return spendDifference;
                        }
                        var spend =campaign.expectedMediaCost;
                        var expectedSpend =campaign.totalMediaCost;
                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                };
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
                }
                $scope.getSpendClass = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = $scope.getSpendDifference(campaign);
                        return $scope.getClassFromDiff(spendDifference);
                    }
                };
                $scope.getSpendClassForStrategy = function(strategy) {
                    var spendDifference = $scope.getSpendDiffForStrategy(strategy);
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
                $scope.getSpendWidth = function(campaign) {
                    if(campaign !== undefined) {
                        var actualWidth = 100 + $scope.getSpendDifference(campaign);
                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                }

                $scope.getSpendTickWidth = function(campaign) {
                    if(campaign !== undefined) {
                        var actualWidth = 100 + $scope.getSpendTickDifference(campaign);
                        if (actualWidth > 100) {
                            actualWidth = 100;
                        }
                        return actualWidth;
                    }
                }
                $scope.getSpendWidthForStrategy = function(strategy) {
                    var actualWidth = 100 + $scope.getSpendDiffForStrategy(strategy);
                    if (actualWidth > 100) {
                        actualWidth = 100;
                    }
                    return actualWidth;
                }
                //$scope.campaigns.durationCompletion();
                //To show the accorsponding strategy card
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