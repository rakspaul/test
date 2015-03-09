//Data fetching in service.
brandsModule.service("brandsService", ['$http', 'dataService','api','apiPaths','_', function ($http, dataService,  api, apiPaths,_ ) {
  //default values
  this.fetchBrands = function (searchCriteria) {
    //  var url = '/desk/advertisers.json';
    var url = apiPaths.apiSerivicesUrl + '/brands?' ;
    if(!_.isNull(searchCriteria.key) && !_.isEmpty(searchCriteria.key))
      url += "key="+searchCriteria.key+"&";
    if(!_.isNull(searchCriteria.limit) && !isNaN(searchCriteria.limit))
      url +=  "limit="+searchCriteria.limit+"&";
    if(!_.isNull(searchCriteria.offset) && !isNaN(searchCriteria.offset))
      url +=  "offset="+searchCriteria.offset;
    return dataService.fetch(url);
  }
}]);