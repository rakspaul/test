(function () {
    'use strict';
    angObj.directive('campaignCard', function (utils,constants,momentService, $location) {
        return {
            restrict:'EAC',

            scope: {
                campaign: '=',
                campaigns: '='
            },

            templateUrl: assets.html_campaign_card,

            link: function ($scope, element, attrs) {

                $scope.textConstants = constants;

                // NOTE: The params have been modified. To utilize the new feature,
                // pass $event as the 3rd actual param when calling this method.
                $scope.redirectTo = function(campaign, filterType, event) {
                    var url = filterType !== 'archived' ?
                        '/mediaplan/'+campaign.orderId+'/overview' :
                        '/mediaplans/'+campaign.orderId;

                    if (event.ctrlKey || event.metaKey) {
                        window.open(url, '_blank');
                    } else {
                        $location.url(url);
                    }
                };

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
                        return $scope.getClassFromDiff(spendDifference,campaign.end_date);
                    }
                };

                $scope.getClassFromDiff = function(spendDifference,campaignEndDate) {
                 if (campaignEndDate != undefined) {
                    var dateDiffInDays = momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), campaignEndDate);
                 }

                 if (spendDifference == -999) { //fix for initial loading
                    return '';
                 }

                 if(campaignEndDate != undefined) {
                    if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), campaignEndDate) == false) {
                        if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                            return 'red';
                        }else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
                                return 'blue';
                        }
                    }
                    //  past a campaign end date
                    if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), campaignEndDate) == true) {
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
                    utils.VTCpopupfunc(event,flag) ;
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
