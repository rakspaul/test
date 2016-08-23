define(['angularAMD', 'reporting/advertiser/advertiser_service', 'common/services/constants_service','reporting/campaignSelect/campaign_select_controller'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('advertiserModel', ['$route','$q', '$location', '$timeout', 'advertiserService', 'constants',
            'localStorageService', 'workflowService', 'pageFinder','campaignSelectModel',
            function ($route,$q, $location, $timeout, advertiserService, constants, localStorageService,
                      workflowService, pageFinder,campaignSelectModel) {

                var advertiserData = {
                        advertiserList: [],
                        selectedAdvertiser: {id: -1, name: constants.ALL_ADVERTISERS},
                        allAdvertiserObject: {id: -1, name: constants.ALL_ADVERTISERS},
                        showAll: true,
                        enable: true,
                        cssClass: ''
                    },

                    previousAccountId;

                return {
                    fetchAdvertiserList: function (accountId) {
                        var deferred = $q.defer();

                        accountId = Number(accountId);

                        if (previousAccountId !== accountId) {
                            this.reset();
                        }

                        if (advertiserData.advertiserList.length > 0) {
                            console.log('fetchAdvertiserList ', 'already fetched');
                            $timeout(function() {
                                deferred.resolve();
                            }, 10);

                            return deferred.promise;
                        }

                        workflowService.getAdvertisers(accountId, 'read').then(function (result) {
                            if (result && result.data.data.length > 0) {
                                advertiserData.advertiserList = _.map(result.data.data, function(a) {
                                    return {'id': a.id, 'name': a.name};
                                });

                                advertiserData.advertiserList = _.sortBy(advertiserData.advertiserList, 'name');
                                advertiserData.advertiserList.unshift(advertiserData.allAdvertiserObject);
                                console.log('fetchAdvertiserList is fetched');
                            } else {
                                advertiserData.advertiserList = [advertiserData.allAdvertiserObject];
                            }

                            previousAccountId = accountId;
                            deferred.resolve();
                        });

                        return deferred.promise;
                    },

                    allowedAdvertiser: function(advertiserId) {
                        advertiserId = Number(advertiserId);

                        if (advertiserId) {
                            advertiserData.selectedAdvertiser = _.find(advertiserData.advertiserList, function(a) {
                                return advertiserId === a.id;
                            });

                            if (advertiserData.selectedAdvertiser) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            advertiserData.selectedAdvertiser = advertiserData.allAdvertiserObject;
                        }

                        return true;
                    },

                    getSelectedAdvertiser: function () {
                        return advertiserData.selectedAdvertiser;
                    },

                    getAdvertiserList: function() {
                        return advertiserData.advertiserList;
                    },

                    disable: function () {
                        advertiserData.enable = false;
                        advertiserData.cssClass = 'brands_filter_disabled';
                    },

                    enable: function () {
                        advertiserData.enable = true;
                        advertiserData.cssClass = '';
                    },

                    reset: function() {
                        advertiserData.advertiserList = [];
                        advertiserData.selectedAdvertiser = {id: -1, name: constants.ALL_ADVERTISERS};
                    },

                    changeAdvertiser: function(accountId, subAccountId, advertiser) {
                        var url = '/a/' + accountId;
                        subAccountId && (url += '/sa/' + subAccountId);
                        var cannedReportName = _.last($location.path().split('/'));

                        //brand is 0 in url always as when a new advertiser is selected it will be 'All Brands'
                        (advertiser.id > 0)?(url += '/adv/' + advertiser.id+'/b/0'):'';

                        if ($location.path().split('/').indexOf('mediaplans') > 0) {

                            // If it is canned reports
                            if($route.current.params.campaignId){

                                //check which is the apropriate client id master or subaccount.
                                var accountIdToFetchCamp = accountId;
                                if(subAccountId) {
                                    accountIdToFetchCamp = subAccountId;
                                }

                                //You need to fetch campaigns when ever an advertiser has changed from dropdown.  Brand will be -1 for call as in UI it will be 'All Brands'.
                                campaignSelectModel.fetchCampaigns(accountIdToFetchCamp, advertiser.id, -1).then(function(response){
                                    var campaignArr = response.data.data;

                                    if(campaignArr[0].campaign_id) {

                                        var campaignId = campaignArr[0].campaign_id;

                                        //set first campaign as selected campaign
                                        campaignSelectModel.setSelectedCampaign(campaignArr[0]);

                                        url += '/mediaplans/' + campaignArr[0].campaign_id;
                                        (cannedReportName && cannedReportName !== 'mediaplans') ? (url += '/' + cannedReportName) : '';
                                        $location.url(url);
                                    }
                                });
                            } else {
                                // if it is mediaplan list page
                                url +='/mediaplans';
                                (cannedReportName && cannedReportName !== 'mediaplans')?(url += '/'+cannedReportName):'';
                                $location.url(url);
                            }

                        } else {
                            (advertiser.id > 0) && (url += '/adv/' + advertiser.id);
                            $location.url(pageFinder.pageBuilder($location.path()).buildPage(url));
                        }
                    }
                };
            }
        ]);
    }
);
