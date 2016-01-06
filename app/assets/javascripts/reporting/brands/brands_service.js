//Data fetching in service.
brandsModule.service("brandsService", function ($rootScope, $http, dataService, api, constants, apiPaths, _, workflowService) {
    //default values
    var service = {};

    service.fetchBrands = function (searchCriteria) {
        var clientId = searchCriteria.clientId;
        var advertiserId = searchCriteria.advertiserId;
        return workflowService.getBrands(clientId, advertiserId);
    };

    service.preForBrandBroadcast = function (brand, advertiser, event_type) {
        var obj = {'brand': brand, 'advertiser': advertiser, 'event_type': event_type};
        $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, obj);
    };

    return service;
});