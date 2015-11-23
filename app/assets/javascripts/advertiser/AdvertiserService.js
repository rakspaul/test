//Data fetching in service.
advertiserModule.service("advertiserService", function ($rootScope, $http,workflowService, dataService,  api, constants, apiPaths,_ ) {
    //default values
    var service = {};
    service.fetchAdvertisers = function (searchCriteria,newAdvertiserID) {
        var url = apiPaths.apiSerivicesUrl + '/advertisers?' ;

        if(!_.isNull(searchCriteria.key) && !_.isEmpty(searchCriteria.key))
            url += "key="+searchCriteria.key+"&";
        if(!_.isNull(searchCriteria.limit) && !isNaN(searchCriteria.limit));
            url +=  "limit="+searchCriteria.limit+"&";
        if(!_.isNull(searchCriteria.offset) && !isNaN(searchCriteria.offset))
            url +=  "offset="+searchCriteria.offset;

        url = apiPaths.WORKFLOW_APIUrl + "/advertisers?pageNo=1&pageSize=10&sortOrder=desc";
        return dataService.fetch(url);
    };

    service.preForBrandBroadcast = function(brand,newBrandID) {
        this.brand = brand;
        this.broadcastItem();
    };

    service.broadcastItem = function() {
        $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED);
    };

    return service;
});

