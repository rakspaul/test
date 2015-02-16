
dashboardModule.factory("dashboardModel", ['brandsModel', 'timePeriodModel', 'constants', function (brandsModel, timePeriodModel, constants) {
  var dashboardData = {selectedStatus: constants.DASHBOARD_STATUS_ACTIVE};
  dashboardData.statusDropdownValues = [constants.DASHBOARD_STATUS_ALL,constants.DASHBOARD_STATUS_ACTIVE, constants.DASHBOARD_STATUS_COMPLETED]
  dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
  dashboardData.brandSelected = false;
  var setTitle = function () {
    dashboardData.title = "Showing ";
    var selectedBrand = brandsModel.getSelectedBrand().name;//dashboardData.selectedBrand;
    if(selectedBrand === constants.ALL_BRANDS) {
      //var brandsCount = brandsModel.getBrand().totalBrands;
      dashboardData.title += "Brands: ";
    }
    addTitleSecondPart();
  };
  function addTitleSecondPart() {
    dashboardData.titleSecondPart = dashboardData.selectedStatus + ' Campaigns for ' + timePeriodModel.timeData.selectedTimePeriod.display;
  }
  var setBrand = function(brand) {
    dashboardData.selectedBrand = brand.name;
    if(brand.name === constants.ALL_BRANDS) {
      dashboardData.brandSelected = false;
    } else {
      dashboardData.brandSelected = true;
    }
  };
  var getData = function() {
    return dashboardData;
  }

  return {
    setTitle: setTitle,
    setSelectedBrand: setBrand,
    getData: getData
  };
}]);