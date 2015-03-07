//Data fetching in service.
brandsModule.service("brandsService", ['$http', 'dataService','api','apiPaths','_', function ($http, dataService,  api, apiPaths,_ ) {
  //default values
  this.fetchBrands = function (limit,offset,key) {
    //  var url = '/desk/advertisers.json';
    var url = apiPaths.apiSerivicesUrl + '/brands?' ;
    if(!_.isNull(key) && !_.isEmpty(key))
      url += "key="+key+"&";
    if(!_.isNull(limit) && !isNaN(limit))
      url +=  "limit="+limit+"&";
    if(!_.isNull(offset) && !isNaN(offset))
      url +=  "offset="+offset;
    return dataService.fetch(url);
  }
}]);