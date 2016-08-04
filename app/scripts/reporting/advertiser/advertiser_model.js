define(['angularAMD', 'reporting/advertiser/advertiser_service', 'common/services/constants_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('advertiserModel', ['$q', '$location', '$timeout', 'advertiserService', 'constants',
            'localStorageService', 'workflowService', 'pageFinder',
            function ($q, $location, $timeout, advertiserService, constants, localStorageService,
                      workflowService, pageFinder) {

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

                        // All Advertisers id is -1 and don't show it in the URL
                        (advertiser.id > 0) && (url += '/adv/' + advertiser.id);
                        $location.url(pageFinder.pageBuilder($location.path()).buildPage(url));
                    }
                };
            }
        ]);
    }
);
