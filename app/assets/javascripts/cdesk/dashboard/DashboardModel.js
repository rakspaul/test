
dashboardModule.factory("dashboardModel", ['brandsModel', 'timePeriodModel', 'constants', function (brandsModel, timePeriodModel, constants) {
  var dashboardData = {selectedStatus: constants.DASHBOARD_STATUS_ACTIVE};
  dashboardData.statusDropdownValues = [constants.DASHBOARD_STATUS_ALL,constants.DASHBOARD_STATUS_ACTIVE, constants.DASHBOARD_STATUS_COMPLETED]
  dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
  dashboardData.brandSelected = false;
  var setTitle = function () {
    dashboardData.title = 'Showing ';
    addCampaigns();
  };
  function addCampaigns() {
    var selectedBrand = brandsModel.getSelectedBrand().name;
    var brandsCount = brandsModel.getBrand().totalBrands;

    dashboardData.titleSecondPart = dashboardData.selectedStatus + ' campaigns for ' + timePeriodModel.timeData.selectedTimePeriod.display + ' for ';
    //dashboardData.toolTip = 'Showing data for ';
    dashboardData.toolTip = 'Showing ';
    if(selectedBrand === constants.ALL_BRANDS) {
      dashboardData.titleSecondPart += "all brands";
      //dashboardData.toolTip += brandsCount;
    }
    //dashboardData.toolTip += ' campaigns across ' + brandsCount + ' brands for '+ timePeriodModel.timeData.selectedTimePeriod.display + ' for ' + selectedBrand;
    dashboardData.toolTip += dashboardData.selectedStatus + ' campaigns for ' + timePeriodModel.timeData.selectedTimePeriod.display + ' for ' + selectedBrand;
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
