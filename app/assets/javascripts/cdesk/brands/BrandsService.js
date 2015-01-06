//Data fetching in service.
brandsModule.service("brandsService", ['$http', 'dataService', function ($http, dataService) {
  this.fetchBrands = function () {
    var url = '/desk/advertisers.json';
    return dataService.fetch(url);
  }
}]);