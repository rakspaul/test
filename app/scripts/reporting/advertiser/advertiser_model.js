define(['angularAMD', 'reporting/advertiser/advertiser_service', 'common/services/constants_service'], function (angularAMD) {
    angularAMD.service("advertiserModel", ['$q', '$location', '$timeout', 'advertiserService', 'constants','localStorageService', 'workflowService',
        function ($q, $location, $timeout, advertiserService, constants, localStorageService, workflowService) {
        var advertiserData = {
            advertiserList: [],
            selectedAdvertiser: {id: -1, name: constants.ALL_ADVERTISERS},
            allAdvertiserObject: {id: -1, name: constants.ALL_ADVERTISERS}
        },
        previousAccountId;

        // advertiser.allAdvertiserObject = {id: -1, name: constants.ALL_ADVERTISERS};
        // advertiser.selectedBrand = advertiser.allAdvertiserObject;
        // advertiser.showList = false;
        // advertiserData.styleDisplay = "block";
        advertiserData.showAll = true;
        advertiserData.enable = true;
        advertiserData.cssClass = "";
        // var advertisers = [advertiser.allAdvertiserObject];
//TODO: to be moved to new service
        var pageFinder = function(path) {
            var pageName;
            if (path.endsWith('dashboard')) {
                pageName = 'dashboard';
            } else if (path.endsWith('mediaplans')) {
                pageName = 'mediaplans';
            } else if (path.split('/').indexOf('mediaplans') > 0) {
                pageName = 'reports';
            }

            return {
                isDashboardPage: function() {
                    return pageName == 'dashboard';
                },
                isMediaplansPage: function() {
                    return pageName == 'mediaplans';
                },
                isReportsPage: function() {
                    return pageName == 'reports';
                }
            };
        };

        return {
            // getAdvertisers: function (success, searchCritera, search) {
            //     advertiserService.fetchAdvertisers(searchCritera).then(function (response) {
            //         var resData = response.data.data;
            //         if (search) {
            //             advertisers = [];
            //             advertisers.push(advertiser.allAdvertiserObject);
            //         }
            //         advertisers = [advertiser.allAdvertiserObject].concat(resData);//advertisers.concat(resData);
            //         advertiser.totalAdvertisers = advertisers.length;
            //         success.call(this, advertisers);
            //     })
            // },
            fetchAdvertiserList: function(accountId) {
                if (previousAccountId != accountId) {
                    this.reset();
                }
                var deferred = $q.defer();
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
                        previousAccountId = accountId;
                        console.log('fetchAdvertiserList is fetched');
                    } else {
                        // TODO return failure
                    }
                    deferred.resolve();
                });
                return deferred.promise;
            },

            allowedAdvertiser: function(advertiserId) {
                // var accountIdParam = subAccountIdParam();
                if (advertiserId) {
                    advertiserData.selectedAdvertiser = _.find(advertiserData.advertiserList, function(a) {
                        return advertiserId == a.id;
                    });
                    if (advertiserData.selectedAdvertiser.id) {
                        // loginModel.setSelectedClient(selectedAccount);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    advertiserData.selectedAdvertiser = advertiserData.allAdvertiserObject;
                }
                return true;
            },
            // setSelectedAdvertisers: function (_advertiser) {
            //     advertiser.selectedAdvertiser = _advertiser;
            //     var isLeafNode = localStorageService.masterClient.get().isLeafNode;

            //     if(advertiserService.isDashboardAdvertiser() && !isLeafNode) {
            //         localStorage.setItem('dashboardAdvertiser', JSON.stringify(_advertiser));
            //     } else {
            //         localStorage.setItem('setAdvertiser', JSON.stringify(_advertiser));
            //     }
            // },
            getSelectedAdvertiser: function () {
                // var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                // if(advertiserService.isDashboardAdvertiser() && !isLeafNode) {
                //     var savedAdvertiser = localStorage.getItem('dashboardAdvertiser') && JSON.parse(localStorage.getItem('dashboardAdvertiser'));
                // } else {
                //     var savedAdvertiser = localStorage.getItem('setAdvertiser') && JSON.parse(localStorage.getItem('setAdvertiser'));
                // }

                // if (savedAdvertiser !== null) {
                //     advertiser.selectedAdvertiser = savedAdvertiser;
                //     return advertiser.selectedAdvertiser;
                // } else {
                //     advertiser.selectedAdvertiser = advertiser.allAdvertiserObject;
                //     return advertiser.allAdvertiserObject;
                // }
                return advertiserData.selectedAdvertiser;
            },

            // getAdvertiser: function () {
            //     return advertiser;
            // },
            // getAllAdvertiser: function () {
            //     return advertiser.allAdvertiserObject;
            // },
            getAdvertiserList: function() {
                return advertiserData.advertiserList;
            },

            disable: function () {
                advertiserData.enable = false;
                advertiserData.cssClass = "brands_filter_disabled";
            },

            enable: function () {
                advertiserData.enable = true;
                advertiserData.cssClass = "";
            },

            reset: function() {
                advertiserData.advertiserList = [];
                advertiserData.selectedAdvertiser = {id: -1, name: constants.ALL_ADVERTISERS};
            },

            changeAdvertiser: function(accountId, subAccountId, advertiser) {

                var url = '/a/' + accountId;
                if (subAccountId) {
                     url += '/sa/' + subAccountId;
                }
                var page = pageFinder($location.path());
                if (page.isDashboardPage()) {
                    url += '/dashboard';
                } else if (page.isMediaplansPage()) {
                    url += '/mediaplans';
                } else if (page.isReportsPage()) {
                    var reportName = _.last($location.path().split('/'));
                    url += '/mediaplans/reports/' + reportName;
                }
                url += '?advertiser_id=' + advertiser.id;
                console.log('change the url', url);
                // $location.url(url);
                // TODO: make sure $location.url works instead of windlow.location
                window.location = url;
            }

            // callAdvertiserBroadcast: function (advertiser, event_type) {
            //     advertiserService.preForAdvertiserBroadcast(advertiser, event_type);
            // }

        };
    }]);
});
