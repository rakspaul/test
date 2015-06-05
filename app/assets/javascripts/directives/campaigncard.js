(function () {
    'use strict';
    angObj.directive('campaignCard', function (utils,constants) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_card,

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
                $scope.VTCpopup = function(event,flag) {
                    var elem = $(event.target);
                    elem.closest(".each_campaign_list_container").find(".quartile_details_VTC").show() ;
                    if(flag == 1){
                        var top_pos  = elem.closest(".each_campaign_list_container").find(".quartile_details_VTC_btn").offset().top ;
                        var left_pos = elem.closest(".each_campaign_list_container").find(".quartile_details_VTC_btn").offset().left ;
                        elem.closest(".each_campaign_list_container").find(".quartile_details_VTC").css( {"top" : top_pos -200 , "left" : left_pos -150 }) ;
                    }else{
                        elem.closest(".each_campaign_list_container").find(".quartile_details_VTC").hide() ;
                    }
                }

              $scope.getMessageForDataNotAvailable = function (campaign) {
                if (!campaign)
                  return constants.MSG_DATA_NOT_AVAILABLE;
                else  if ( campaign.durationLeft() == 'Yet to start')
                  return constants.MSG_CAMPAIGN_YET_TO_START;
                else if (campaign.daysSinceEnded() > 1000)
                  return constants.MSG_CAMPAIGN_VERY_OLD;
                else if (campaign.kpiType =='null')
                  return constants.MSG_CAMPAIGN_KPI_NOT_SET;
                else if (campaign.status == 'active')
                  return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
                else
                  return constants.MSG_DATA_NOT_AVAILABLE;
              };
            } 
        };
    });

}());
