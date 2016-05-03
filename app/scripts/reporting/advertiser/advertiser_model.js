define(['angularAMD', 'reporting/advertiser/advertiser_service', 'common/services/constants_service'], function (angularAMD) {
    angularAMD.factory("advertiserModel", ['advertiserService', 'constants','localStorageService', function (advertiserService, constants,localStorageService) {
        var advertiser = {};
        advertiser.allAdvertiserObject = {id: -1, name: constants.ALL_ADVERTISERS};
        advertiser.selectedBrand = advertiser.allAdvertiserObject;
        advertiser.showList = false;
        advertiser.styleDisplay = "block";
        advertiser.showAll = true;
        advertiser.enable = true;
        advertiser.cssClass = "";
        var advertisers = [advertiser.allAdvertiserObject];
        return {
            getAdvertisers: function (success, searchCritera, search) {
                advertiserService.fetchAdvertisers(searchCritera).then(function (response) {
                    var resData = response.data.data;
                    if (search) {
                        advertisers = [];
                        advertisers.push(advertiser.allAdvertiserObject);
                    }
                    advertisers = [advertiser.allAdvertiserObject].concat(resData);//advertisers.concat(resData);
                    advertiser.totalAdvertisers = advertisers.length;
                    success.call(this, advertisers);
                })
            },
            setSelectedAdvertisers: function (_advertiser) {
                advertiser.selectedAdvertiser = _advertiser;
                var isLeafNode = localStorageService.masterClient.get().isLeafNode;

                if(advertiserService.isDashboardAdvertiser() && !isLeafNode) {
                    localStorage.setItem('dashboardAdvertiser', JSON.stringify(_advertiser));
                } else {
                    localStorage.setItem('setAdvertiser', JSON.stringify(_advertiser));
                }
            },
            getSelectedAdvertiser: function () {
                var isLeafNode = localStorageService.masterClient.get().isLeafNode;
                if(advertiserService.isDashboardAdvertiser() && !isLeafNode) {
                    var savedAdvertiser = JSON.parse(localStorage.getItem('dashboardAdvertiser'));
                } else {
                    var savedAdvertiser = JSON.parse(localStorage.getItem('setAdvertiser'));
                }

                if (savedAdvertiser !== null) {
                    advertiser.selectedAdvertiser = savedAdvertiser;
                    return advertiser.selectedAdvertiser;
                } else {
                    advertiser.selectedAdvertiser = advertiser.allAdvertiserObject;
                    return advertiser.allAdvertiserObject;
                }


            },
            getAdvertiser: function () {
                return advertiser;
            },
            getAllAdvertiser: function () {
                return advertiser.allAdvertiserObject;
            },
            disable: function () {
                advertiser.enable = false;
                advertiser.cssClass = "brands_filter_disabled";
            },
            enable: function () {
                advertiser.enable = true;
                advertiser.cssClass = "";
            },

            callAdvertiserBroadcast: function (advertiser, event_type) {
                advertiserService.preForAdvertiserBroadcast(advertiser, event_type);
            }

        };
    }]);
});
