define(['angularAMD', '../../common/utils', 'common/services/constants_service', 'common/moment_utils'],
    function (angularAMD) {
        'use strict';
        angularAMD.directive('campaignCard',
            function ($rootScope, $location, utils, constants, momentService, featuresService, $sce) {
                return {
                    restrict: 'EAC',

                    scope: {
                        campaign: '=',
                        campaigns: '='
                    },

                    templateUrl: assets.html_campaign_card,

                    link: function ($scope, element, attrs) {
                        var fparams = featuresService.getFeatureParams(),
                            campaignList = $scope.campaigns.campaignList,
                            i;

                        _.each(campaignList, function (obj) {
                            obj.campaignTitleHtml = highlightTitleText(obj.campaignTitle, 'test');
                            for (i = 0; i < obj.labels.length; i++) {
                                obj.labels[i] = highlightLabelPill(obj.labels[i], 'test');
                            }
                        });

                        function highlightTitleText(text, phrase) {
                            if (phrase) {
                                text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                                    '<mark class="brand_search_highlight">$1</mark>');
                            }

                            return $sce.trustAsHtml(text);
                        }

                        function highlightLabelPill(text, phrase) {
                            var tempText = text.toString();

                            if (phrase && tempText.indexOf('</mark>') === -1) {
                                if (tempText.indexOf(phrase) >= 0) {
                                    tempText = $sce.trustAsHtml('<mark class="brand_search_highlight">' +
                                        tempText + '</mark>');
                                }
                            }

                            return tempText;
                        }

                        $scope.addHighlightClass = function (text, phrase) {
                            var tempText = text.toString().toLowerCase();

                            return tempText.indexOf(phrase) >= 0;
                        };

                        $scope.showReportsOverview = fparams[0].report_overview;
                        $scope.showManageButton = fparams[0].mediaplan_hub;

                        $scope.textConstants = constants;

                        // NOTE: The params have been modified. To utilize the new feature,
                        // pass $event as the 3rd actual param when calling this method.
                        $scope.redirectTo = function (campaign, filterType, event) {
                            var url = filterType !== 'archived' ?
                                '/mediaplan/' + campaign.orderId + '/overview' :
                                '/mediaplans/' + campaign.orderId;

                            if (event && (event.ctrlKey || event.metaKey)) {
                                window.open(url, '_blank');
                            } else {
                                $location.url(url);
                            }
                        };

                        $scope.getSpendDifference = function (campaign) {
                            var spendDifference,
                                campaignCDBObj,
                                spend,
                                expectedSpend;

                            if (campaign !== undefined) {
                                spendDifference = -999; //fix for initial loading
                                campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                                if (campaignCDBObj === undefined) {
                                    return spendDifference;
                                }
                                spend = campaignCDBObj.getGrossRev();
                                expectedSpend = campaign.expectedMediaCost;
                                return $scope.getPercentDiff(expectedSpend, spend);
                            }
                        };

                        $scope.getSpendTotalDifference = function (campaign) {
                            var spendDifference,
                                campaignCDBObj,
                                spend,
                                totalSpend;

                            if (campaign !== undefined) {
                                spendDifference = 0;
                                campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                                if (campaignCDBObj === undefined) {
                                    return spendDifference;
                                }
                                spend = campaignCDBObj.getGrossRev();
                                totalSpend = campaign.totalMediaCost;
                                return $scope.getPercentDiff(totalSpend, spend);
                            }
                        };

                        $scope.getSpendTickDifference = function (campaign) {
                            var spendDifference,
                                campaignCDBObj,
                                spend,
                                expectedSpend;

                            if (campaign !== undefined) {
                                spendDifference = 0;
                                campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
                                if (campaignCDBObj === undefined) {
                                    return spendDifference;
                                }
                                spend = campaign.expectedMediaCost;
                                expectedSpend = campaign.totalMediaCost;
                                return $scope.getPercentDiff(expectedSpend, spend);
                            }
                        };

                        $scope.getPercentDiff = function (expected, actual) {
                            var spendDifference = 0;

                            if (expected === 0) {
                                spendDifference = 0;
                            } else {
                                spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2)
                            }

                            return spendDifference;
                        };

                        $scope.getSpendClass = function (campaign) {
                            var spendDifference;

                            if (campaign !== undefined) {
                                spendDifference = $scope.getSpendDifference(campaign);
                                return $scope.getClassFromDiff(spendDifference, campaign.end_date);
                            }
                        };

                        $scope.getClassFromDiff = function (spendDifference, campaignEndDate) {
                            var dateDiffInDays;

                            if (campaignEndDate !== undefined) {
                                dateDiffInDays =
                                    momentService.dateDiffInDays(momentService.todayDate('YYYY-MM-DD'), campaignEndDate);
                            }

                            if (spendDifference === -999) { //fix for initial loading
                                return '';
                            }

                            if (campaignEndDate !== undefined) {
                                if (momentService.isGreater(momentService.todayDate('YYYY-MM-DD'), campaignEndDate) === false) {
                                    if ((dateDiffInDays <= 7) && (spendDifference < -5 || spendDifference > 5)) {
                                        return 'red';
                                    } else if ((dateDiffInDays <= 7) && (spendDifference >= -5 && spendDifference <= 5)) {
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
                        };

                        $scope.getSpendWidth = function (campaign) {
                            var actualWidth;

                            if (campaign !== undefined) {
                                actualWidth = 100 + $scope.getSpendTotalDifference(campaign);
                                if (actualWidth > 100) {
                                    actualWidth = 100;
                                }
                                return actualWidth;
                            }
                        };

                        $scope.getSpendTickWidth = function (campaign) {
                            var actualWidth;

                            if (campaign !== undefined) {
                                actualWidth = 100 + $scope.getSpendTickDifference(campaign);
                                if (actualWidth > 100) {
                                    actualWidth = 100;
                                }
                                return actualWidth;
                            }
                        };

                        //$scope.campaigns.durationCompletion();
                        //To show the accorsponding strategy card
                        $scope.showStrategies = function (campaignId, strategiesCount) {
                            if (strategiesCount > 0) {
                                $('#strategies-accordion-' + campaignId).toggle();
                            }
                        };

                        $scope.showTactics = function (strategyId, tacticsCount) {
                            $('#tactics-accordion-' + strategyId).toggle();
                        };

                        //This will call the Parent controllers loadMoreStrategies function
                        $scope.loadMoreStrategies = function (campaignId) {
                            $scope.$parent.loadMoreStrategies(campaignId);
                        };

                        //This will call the Parent controllers loadMoreTactics function
                        $scope.loadMoreTactics = function (strategyId, campaignId) {
                            $scope.$parent.loadMoreTactics(strategyId, campaignId);
                        };

                        //This is called when the user clicks on the campaign title
                        $scope.goToLocation = function (url) {
                            utils.goToLocation(url);
                        };

                        $scope.VTCpopup = function (event, flag) {
                            utils.VTCpopupfunc(event, flag);
                        };

                        $scope.getMessageForDataNotAvailable = function (campaign) {
                            if (!campaign) {
                                return constants.MSG_DATA_NOT_AVAILABLE;
                            } else if (campaign.durationLeft() === 'Yet to start') {
                                return constants.MSG_CAMPAIGN_YET_TO_START;
                            } else if (campaign.daysSinceEnded() > 1000) {
                                return constants.MSG_CAMPAIGN_VERY_OLD;
                            } else if (campaign.kpiType === 'null') {
                                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
                            } else if (campaign.status === 'active') {
                                return constants.MSG_CAMPAIGN_ACTIVE_BUT_NO_DATA;
                            } else {
                                return constants.MSG_DATA_NOT_AVAILABLE;
                            }
                        };
                    }
                };
            }
        );
    }
);
