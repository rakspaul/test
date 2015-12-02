//Data Manipulation in model
//advertiserModule.factory("advertiserModel", ['advertiserService', 'constants', function (advertiserService, constants) {
brandsModule.factory("advertiserModel", ['advertiserService', 'constants', 'workflowService', function (advertiserService, constants, workflowService) {
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
                console.log('search',search);
                if(search){
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
            localStorage.setItem('setAdvertiser', JSON.stringify(_advertiser));
        },
        getSelectedAdvertiser: function() {
            var savedAdvertiser = JSON.parse(localStorage.getItem('setAdvertiser'));
            if(savedAdvertiser !== null){
                advertiser.selectedAdvertiser = savedAdvertiser;
                return advertiser.selectedAdvertiser;
            } else {
                return advertiser.allAdvertiserObject;
            }


        },
        getAdvertiser: function() {
            return advertiser;
        },
        getAllAdvertiser: function() {
            return advertiser.allAdvertiserObject;
        },
        disable: function() {
            advertiser.enable = false;
            advertiser.cssClass = "brands_filter_disabled";
        },
        enable: function() {
            advertiser.enable = true;
            advertiser.cssClass = "";
        },

        callAdvertiserBroadcast :  function(advertiser) {
            advertiserService.preForAdvertiserBroadcast(advertiser);
        }

    };
}]);