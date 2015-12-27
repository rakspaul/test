//Data fetching in service.
brandsModule.service("brandsService", function ($rootScope, $http, dataService,  api, constants, apiPaths,_, workflowService) {
    //default values
    var service = {};

    service.fetchBrands = function (searchCriteria) {
        /*var url = apiPaths.apiSerivicesUrl + '/brands?' ;
        if(!_.isNull(searchCriteria.key) && !_.isEmpty(searchCriteria.key))
            url += "key="+searchCriteria.key+"&";
        if(!_.isNull(searchCriteria.limit) && !isNaN(searchCriteria.limit))
            url +=  "limit="+searchCriteria.limit+"&";
        if(!_.isNull(searchCriteria.offset) && !isNaN(searchCriteria.offset))
            url +=  "offset="+searchCriteria.offset;*/
        var clientId = searchCriteria.clientId;
        var advertiserId = searchCriteria.advertiserId;
        return workflowService.getBrands(clientId, advertiserId);
    };

    service.preForBrandBroadcast = function(brand, advertiser) {
        this.brand = brand;
        this.broadcastItem();
    };

    service.broadcastItem = function() {
        $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED);
    };
    return service;
});