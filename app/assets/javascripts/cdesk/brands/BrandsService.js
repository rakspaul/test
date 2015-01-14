//Data fetching in service.
brandsModule.service("brandsService", ['$http', 'dataService','api','apiPaths', function ($http, dataService,  api, apiPaths ) {
  this.fetchBrands = function () {
    //  var url = '/desk/advertisers.json';
     var url = apiPaths.apiSerivicesUrl + '/brands' ;
    return dataService.fetch(url);
  }
}]);