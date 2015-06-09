
dashboardModule.factory("dashboardModel", ['brandsModel', 'timePeriodModel', 'constants' ,'urlService','requestCanceller','dataService', function (brandsModel, timePeriodModel, constants,urlService,requestCanceller,dataService) {
  var dashboardData = {selectedStatus: JSON.parse(localStorage.getItem('dashboardStatusFilter')) == null ? constants.DASHBOARD_STATUS_ALL :  JSON.parse(localStorage.getItem('dashboardStatusFilter'))};
  dashboardData.statusDropdownValues = [constants.DASHBOARD_STATUS_ACTIVE, constants.DASHBOARD_STATUS_COMPLETED,constants.DASHBOARD_STATUS_ALL];
  dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
  dashboardData.brandSelected = false;
  dashboardData.totalCampaigns = 0;
  dashboardData.totalBrands = 0;
  dashboardData.toolTip = '';

  var setTitle = function () {
    dashboardData.title = 'Showing ';
    getCampaingsCount();
    addCampaigns();
  };

   var getCampaingsCount =  function () {
        var url = urlService.APICampaignCountsSummary(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id, dashboardData.selectedStatus);
        var canceller = requestCanceller.initCanceller(constants.DASHBOARD_CAMPAIGNS_COUNT_CANCELLER);

       return dataService.fetchCancelable(url, canceller, function(response) {
           var totalCampaigns =  response.data.data.active.total + response.data.data.completed.total + response.data.data.na.total ;
           dashboardData.totalCampaigns = totalCampaigns ;

           dashboardData.totalBrands = response.data.data.brands.total;

           if(brandsModel.getSelectedBrand().id == -1 ){
               dashboardData.toolTip = 'Showing data for ' +  dashboardData.totalCampaigns + ' campaigns across '+ dashboardData.totalBrands + ' brands';
           } else //"Displaying data for 15 campaigns"
               dashboardData.toolTip = 'Showing data for ' +  dashboardData.totalCampaigns + ' campaigns' ;

       })
    };

  function addCampaigns() {
    var selectedBrand = brandsModel.getSelectedBrand().name;

    dashboardData.titleSecondPart = dashboardData.selectedStatus + ' Campaigns for ' + timePeriodModel.timeData.selectedTimePeriod.display + ' for ';

    if(selectedBrand === constants.ALL_BRANDS) {
      dashboardData.titleSecondPart += constants.ALL_BRANDS;
    }


  };

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
  };

  return {
    setTitle: setTitle,
    setSelectedBrand: setBrand,
    getData: getData
  };
}]);
