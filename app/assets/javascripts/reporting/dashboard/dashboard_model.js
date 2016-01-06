dashboardModule.factory("dashboardModel", ['loginModel', 'advertiserModel', 'brandsModel', 'timePeriodModel', 'constants', 'urlService', 'requestCanceller', 'dataService', function (loginModel, advertiserModel, brandsModel, timePeriodModel, constants, urlService, requestCanceller, dataService) {
    var dashboardData = {selectedStatus: JSON.parse(localStorage.getItem('dashboardStatusFilter')) == null ? constants.DASHBOARD_STATUS_ALL : JSON.parse(localStorage.getItem('dashboardStatusFilter'))};
    dashboardData.statusDropdownValues = [constants.DASHBOARD_STATUS_ACTIVE, constants.DASHBOARD_STATUS_COMPLETED, constants.DASHBOARD_STATUS_ALL];
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

    var getCampaingsCount = function () {
        var clientId = loginModel.getSelectedClient().id;
        var advertiserId = advertiserModel.getSelectedAdvertiser().id;
        var brandId = brandsModel.getSelectedBrand().id;
        var url = urlService.APICampaignCountsSummary(timePeriodModel.timeData.selectedTimePeriod.key, clientId, advertiserId, brandId, dashboardData.selectedStatus);
        return dataService.fetch(url).then(function (response) {
            var ready = response.data.data.ready, draft = response.data.data.draft, paused = response.data.data.paused;
            var totalCampaigns = response.data.data.active.total + response.data.data.completed.total + response.data.data.na.total + ready + draft + paused;
            dashboardData.totalCampaigns = totalCampaigns;
            if (advertiserId > 0 && brandId == -1) {
                dashboardData.toolTip = 'Showing data for ' + dashboardData.totalCampaigns + ' Media Plans across ' + brandsModel.totalBrands() + ' brands';
            } else {
                dashboardData.toolTip = 'Showing data for ' + dashboardData.totalCampaigns + ' Media Plans';
            }

        })
    };

    function addCampaigns() {
        var selectedBrand = brandsModel.getSelectedBrand().name;
        dashboardData.titleSecondPart = dashboardData.selectedStatus + ' Media Plans for Lifetime for ';
        if (selectedBrand === constants.ALL_BRANDS) {
            dashboardData.titleSecondPart += constants.ALL_BRANDS;
        }
    };

    var setBrand = function (brand) {
        dashboardData.selectedBrand = brand.name;
        if (brand.name === constants.ALL_BRANDS) {
            dashboardData.brandSelected = false;
        } else {
            dashboardData.brandSelected = true;
        }
    };

    var getData = function () {
        return dashboardData;
    };

    var campaignStatusToSend = function () {
        var campStatus = getData().selectedStatus;
        if (campStatus == constants.DASHBOARD_STATUS_ALL) {
            return 'ALL';
        } else if (campStatus == constants.DASHBOARD_STATUS_COMPLETED) {
            return 'ENDED';
        } else if (campStatus == constants.DASHBOARD_STATUS_ACTIVE) {
            return 'IN_FLIGHT';
        }
    }

    return {
        setTitle: setTitle,
        setSelectedBrand: setBrand,
        getData: getData,
        campaignStatusToSend: campaignStatusToSend
    };
}]);
