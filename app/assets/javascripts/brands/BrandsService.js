//Data fetching in service.
brandsModule.service("brandsService", function ($rootScope, $http,workflowService, dataService,  api, constants, apiPaths,_ ) {
    //default values
    var service = {};

    service.fetchBrands = function (searchCriteria,theID) {
        //alert("I'm in the service     "+theID);
        var url = apiPaths.apiSerivicesUrl + '/advertisers?' ;

        if(!_.isNull(searchCriteria.key) && !_.isEmpty(searchCriteria.key))
          url += "key="+searchCriteria.key+"&";
        if(!_.isNull(searchCriteria.limit) && !isNaN(searchCriteria.limit))
          url +=  "limit="+searchCriteria.limit+"&";
        if(!_.isNull(searchCriteria.offset) && !isNaN(searchCriteria.offset))
          url +=  "offset="+searchCriteria.offset;

        url = apiPaths.WORKFLOW_APIUrl + "/advertisers?pageNo=1&pageSize=10&sortOrder=desc";
        //alert($rootScope.fibble);

        return dataService.fetch(url);
    };


    /* Remove and put in adver controller*/
    /* Remove and put in adver controller*/

    service.preForBrandBroadcast = function(brand,adver) {
        if(adver){
            this.brand = brand;
            this.broadcastItem();

        }
        else{
            this.brand = brand;
            this.broadcastItem();
        }

    };

    service.preForAdvertiserBroadcast = function(brand) {
        //alert('');
        this.brand = brand;

        this.broadcastItem();
    };

    service.broadcastItem = function() {
        //alert('im in the broadcast');
        $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED);
    };

    return service;
});

// url =  "http://dev-workflow002.ewr004.collective-media.net:9009/api/workflow/v3/campaigns/209/ads/516";
//url =  "http://ampqaapp001.ewr004.collective-media.net:9009/api/workflow/v3/advertisers?pageNo=1&pageSize=10&sortOrder=desc";
//alert(url);
/*apiSerivicesUrl: scala_api,
 workflow_apiServicesUrl: workflow_api,
 WORKFLOW_APIUrl : workflowCreate_api*/
// var testRob = dataService.fetch(url);
