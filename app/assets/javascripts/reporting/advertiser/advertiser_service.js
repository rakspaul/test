//Data fetching in service.
advertiserModule.service("advertiserService", function ($rootScope, workflowService, api, constants, _) {
    //default values
    var service = {};
    service.fetchAdvertisers = function (searchCriteria) {
        var clientId = searchCriteria.clientId;
        return workflowService.getAdvertisers('read');
    };

    service.preForAdvertiserBroadcast = function (advertiser, event_type) {
        var obj = {'advertiser': advertiser, 'event_type': event_type};
        $rootScope.$broadcast(constants.EVENT_ADVERTISER_CHANGED, obj);
    };

    return service;
});

