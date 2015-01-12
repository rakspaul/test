//Data fetching in service.
brandsModule.service("brandsService", ['$http', 'dataService','api','apiPaths', function ($http, dataService,  api, apiPaths ) {
  this.fetchBrands = function () {
    //  var url = '/desk/advertisers.json';
     var url = apiPaths.apiSerivicesUrl + '/brands?user_id=' + user_id ;
    return dataService.fetch(url);
  }
}]);