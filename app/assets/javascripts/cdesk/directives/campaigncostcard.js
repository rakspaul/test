(function () {
    'use strict';
    angObj.directive('campaignCostCard', function (utils) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: 'campaign_cost_card',

            link: function ($scope, element, attrs) {

                $scope.getSpendDifference = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = -999; //fix for initial loading
                        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                        if (campaignCDBObj == undefined) {
                            return spendDifference;
                        }
                        var spend = campaignCDBObj.getGrossRev();
                        var expectedSpend = campaign.expectedMediaCost;
                        return $scope.getPercentDiff(expectedSpend, spend);
                    }
                };

                $scope.getSpendTotalDifference = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = 0;
                        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                        if (campaignCDBObj == undefined) {
                            return spendDifference;
                        }
                        var spend = campaignCDBObj.getGrossRev();
                        var totalSpend = campaign.totalMediaCost;
                        return $scope.getPercentDiff(totalSpend, spend);
                    }
                };

                $scope.getSpendTickDifference = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = 0;
                        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                        if (campaignCDBObj == undefined) {
                            return spendDifference;
                        }
                        var spend = campaign.expectedMediaCost;
                        var expectedSpend = campaign.totalMediaCost;
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

                $scope.getSpendClass = function(campaign) {
                    if(campaign !== undefined) {
                        var spendDifference = $scope.getSpendDifference(campaign);
                        return $scope.getClassFromDiff(spendDifference);
                    }
                };
        
                $scope.getClassFromDiff = function(spendDifference) {
                    if (spendDifference > -1) {
                        return 'blue';
                    }
                    if (spendDifference <= -1 && spendDifference > -10) {
                        return 'amber';
                    }
                    if (spendDifference == -999) { //fix for initial loading
                        return ' ';
                    }
                    return 'red';
                }
                $scope.getSpendWidth = function(campaign) {
                    if(campaign !== undefined) {
                        var actualWidth = 100 + $scope.getSpendTotalDifference(campaign);
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

                //This is called when the user clicks on the campaign title
                $scope.goToLocation = function(url){
                    utils.goToLocation(url);
                };
            } 
        };
    });

}());
