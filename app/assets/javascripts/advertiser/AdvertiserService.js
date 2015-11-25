//Data fetching in service.
advertiserModule.service("advertiserService", function ($rootScope, $http,workflowService, dataService,  api, constants, apiPaths,_ ) {
    //default values
    var service = {};
    service.fetchAdvertisers = function (searchCriteria) {
        var clientId = searchCriteria.clientId;
        return workflowService.getAdvertisers(clientId);
    };

    service.preForAdvertiserBroadcast = function(advertiser) {
        this.broadcastItem(advertiser);
    };

    service.broadcastItem = function(advertiser) {
        $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED, advertiser);
    };

    return service;
});

