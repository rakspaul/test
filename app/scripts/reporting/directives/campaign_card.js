define(['angularAMD', 'common-utils', 'campaign-select-model'], function (angularAMD) {
    'use strict';

    angularAMD.directive('campaignCard', ['$rootScope', '$routeParams', '$location', 'utils', 'constants', 'momentService', 'featuresService', '$sce',
        'campaignSelectModel', 'vistoconfig', 'urlBuilder', 'accountService',
        function ($rootScope, $routeParams, $location, utils, constants, momentService, featuresService, $sce,
                  campaignSelectModel, vistoconfig, urlBuilder, accountService) {
            return {
                restrict: 'EAC',

                scope: {
                    campaign: '=',
                    campaigns: '='
                },

                templateUrl: assets.html_campaign_card,

                link: function ($scope) {
                    var fParams = featuresService.getFeatureParams(),
                        campaignList = $scope.campaigns.campaignList,
                        keywordsArr = '',
                        keywords;

                    function highlightTitleText(text, phrase) {
                        if (phrase) {
                            text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                                '<mark class="brand_search_highlight">$1</mark>');
                        }

                        return $sce.trustAsHtml(text);
                    }

                    function highlightLabelPill(text, phrase) {
                        var tempText = text ? text.toString() : '',
                            tempTextLower = tempText.toLowerCase(),
                            tempPhrase = phrase ? phrase.toLowerCase() : '';

                        if (phrase && tempTextLower.indexOf('</mark>') === -1) {
                            if (tempTextLower.indexOf(tempPhrase) >= 0) {
                                tempText = $sce.trustAsHtml('<mark class="brand_search_highlight">' +
                                    tempText + '</mark>');
                            }
                        }

                        return tempText;
                    }

                    $scope.searchTerm = $scope.campaigns.searchTerm;
                    keywordsArr = $scope.searchTerm ? $scope.searchTerm.split(' ') : [];

                    // If search term contains more than 1 word,
                    // add the entire search term into the list of keywords array.
                    if (keywordsArr.length > 1) {
                        keywordsArr.push($scope.searchTerm);
                    }

                    keywords = keywordsArr.join('|');

                    _.each(campaignList, function (obj) {
                        var labelsLen = 0,
                            searchTermsArr,
                            searchTermsLen = 0,
                            i,
                            j,
                            temp;

                        if (keywordsArr) {
                            // Highlight keywords in title
                            obj.campaignTitleHtml = highlightTitleText(obj.campaignTitle, keywords);

                            // Highlight matching label pills
                            labelsLen = obj.labels.length;
                            searchTermsArr = $scope.searchTerm.split(' ');
                            searchTermsLen = searchTermsArr.length;

                            if (searchTermsLen > 1) {
                                searchTermsArr.push($scope.searchTerm);
                            }

                            for (i = 0; i < labelsLen; i++) {
                                for (j = 0; j < searchTermsLen; j++) {
                                    temp = highlightLabelPill(obj.labels[i], searchTermsArr[j]).toString();
                                    if (temp.indexOf('</mark>') >= 0) {
                                        obj.labels[i] = temp;
                                        break;
                                    }
                                }
                            }
                        }
                    });

                    $scope.addHighlightClass = function (text, phrase) {
                        var tempText = text ? text.toString().toLowerCase() : '';

                        return tempText.indexOf(phrase) >= 0;
                    };

                    $scope.redirectToOverViewPage = function(campaign) {
                        var url = '',
                            accountData = accountService.getSelectedAccount();

                        url = '/a/'+ accountData.id;

                        if(!accountData.isLeafNode &&  campaign.client_id) {
                            url += '/sa/' + campaign.client_id;
                        }

                        url += '/mediaplan/' + campaign.orderId + '/overview';

                        return url;
                    };

                    $scope.showReportsOverview = fParams[0].report_overview;
                    $scope.showManageButton = fParams[0].mediaplan_hub;

                    $scope.textConstants = constants;

                    // NOTE: The params have been modified. To utilize the new feature,
                    // pass $event as the 3rd actual param when calling this method.
                    $scope.redirectTo = function (showManageButton, campaign, filterType, event) {
                        var url = '',
                            subAccountId;

                        campaignSelectModel.setSelectedCampaign({
                            id: campaign.id,
                            name: campaign.name,
                            startDate: campaign.startDate,
                            endDate: campaign.endDate,
                            kpi: campaign.kpiType
                        });

                        subAccountId = $routeParams.subAccountId && campaign.client_id;

                        if (showManageButton) {
                            if (campaign.is_archived) {
                                url = urlBuilder.buildBaseUrl() + '/mediaplans/' + campaign.id + '/overview';
                            } else {
                                url = urlBuilder.mediaPlanOverviewUrl(campaign.id, $routeParams.accountId, subAccountId);
                            }
                        } else {
                            url = urlBuilder.buildBaseUrl() + '/mediaplans/' + campaign.id +'/overview';
                        }

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
                            // fix for initial loading
                            spendDifference = -999;

                            campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];

                            if (campaignCDBObj === undefined) {
                                return spendDifference;
                            }

                            spend = campaignCDBObj.getSpend();
                            expectedSpend = campaign.expectedMediaCost;

                            // if spend is not available don't return any color
                            if(spend) {
                                return $scope.getPercentDiff(expectedSpend, spend);
                            }else{
                                return -999;
                            }
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

                            spend = campaignCDBObj.getSpend();
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
                            spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2);
                        }

                        return spendDifference;
                    };

                    $scope.getSpendClass = function (campaign) {
                        var spendDifference;
                        if (campaign !== undefined) {
                            spendDifference = $scope.getSpendDifference(campaign);
                            return $scope.getClassFromDiff(spendDifference, campaign.start_date);
                        }
                    };

                    $scope.getClassFromDiff = function (spendDifference, campaignStartDate) {
                        // fix for initial loading
                        if (spendDifference === -999) {
                            return '';
                        }

                        // if startDate is less than the campaign start date , return;
                        if (campaignStartDate !== undefined) {
                            var dateDiffInDays =
                                momentService.dateDiffInDays(campaignStartDate, momentService.todayDate('YYYY-MM-DD'));
                            if(dateDiffInDays < 0){
                                return;
                            }
                        }

                        if (spendDifference >= -10 && spendDifference <= 20) {
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

                    // To show the corresponding strategy card
                    $scope.showStrategies = function (campaignId, strategiesCount) {
                        if (strategiesCount > 0) {
                            $('#strategies-accordion-' + campaignId).toggle();
                        }
                    };

                    $scope.showTactics = function (strategyId) {
                        $('#tactics-accordion-' + strategyId).toggle();
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

                    $scope.getMessageForDataNotAvailable = function (campaign) {
                        if (!campaign) {
                            return constants.MSG_DATA_NOT_AVAILABLE;
                        } else if (campaign.durationLeft() === 'Yet to start') {
                            return utils.formatStringWithDate(constants.MSG_CAMPAIGN_YET_TO_START ,campaign.startDate,constants.REPORTS_DATE_FORMAT);
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
        }]);
});
