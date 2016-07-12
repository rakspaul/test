define(['angularAMD', 'login/login_model', 'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model','reporting/timePeriod/time_period_model','common/services/constants_service','common/services/url_service','common/services/request_cancel_service','common/services/data_service','common/utils', 'reporting/subAccount/sub_account_model'],function (angularAMD) {
  'use strict';
  angularAMD.factory("dashboardModel", ['loginModel', 'advertiserModel', 'brandsModel', 'timePeriodModel', 'constants', 'urlService', 'requestCanceller', 'dataService', 'utils','subAccountModel', function (loginModel, advertiserModel, brandsModel, timePeriodModel, constants, urlService, requestCanceller, dataService, utils,subAccountModel) {

    var dashboardData = {selectedStatus: constants.DASHBOARD_STATUS_IN_FLIGHT};//by default it is active.  Now check local storage if we want to change it last saved status.
    var localStoredCampaignStatus = JSON.parse(localStorage.getItem('dashboardStatusFilter'));
    if (localStoredCampaignStatus != null && localStoredCampaignStatus !== undefined &&
        (localStoredCampaignStatus == constants.DASHBOARD_STATUS_ALL ||
            localStoredCampaignStatus == constants.DASHBOARD_STATUS_IN_FLIGHT ||
            localStoredCampaignStatus == constants.DASHBOARD_STATUS_ENDED))
    {
       dashboardData.selectedStatus= localStoredCampaignStatus;
    }
    dashboardData.statusDropdownValues = [constants.DASHBOARD_STATUS_ALL, constants.DASHBOARD_STATUS_IN_FLIGHT, constants.DASHBOARD_STATUS_ENDED];
    dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
    dashboardData.brandSelected = false;
    dashboardData.totalCampaigns = 0;
    dashboardData.totalBrands = 0;
    dashboardData.toolTip = '';
    dashboardData.selectedAdvertiser = advertiserModel.getSelectedAdvertiser().name;

    var setTitle = function () {
        dashboardData.title = 'Showing ';
        getCampaingsCount();
        addCampaigns();
    };

    var getCampaingsCount = function () {
        var clientId = subAccountModel.getDashboardAccountId();
        var advertiserId = advertiserModel.getSelectedAdvertiser().id;
        var brandId = brandsModel.getSelectedBrand().id;
        var url = urlService.APICalendarWidgetForAllBrands(clientId, advertiserId, 'end_date',campaignStatusToSend());

        return dataService.fetch(url).then(function (response) {
            var searchCriteria = utils.typeaheadParams;
            searchCriteria.clientId = clientId;
            searchCriteria.advertiserId = advertiserId ? advertiserId : -1;
            return brandsModel.getBrands(function() {
                var totalCamapigns = response.data.data.total_campaigns;
                var mediaPlanText = 'Media Plan' + (totalCamapigns > 1 ? 's' : '');
                dashboardData.toolTip = 'Showing data for ' + totalCamapigns + ' ' + mediaPlanText;
            },searchCriteria, false);
        });
    };

    function addCampaigns() {
        var selectedAdvertiser = advertiserModel.getSelectedAdvertiser().name
        dashboardData.titleSecondPart = dashboardData.selectedStatus + ' Media Plans for ';
        if (selectedAdvertiser === constants.ALL_ADVERTISERS) {
            dashboardData.titleSecondPart += constants.ALL_ADVERTISERS;
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
    var setAdvertiser = function(advertiser){
        dashboardData.selectedAdvertiser = advertiser.name;
        if (advertiser.name === constants.ALL_ADVERTISERS) {
            dashboardData.advertiserSelected = false;
        } else {
            dashboardData.advertiserSelected = true;
        }
    }
    var getData = function () {
        return dashboardData;
    };

    var campaignStatusToSend = function () {
        var campStatus = getData().selectedStatus;
        if (campStatus == constants.DASHBOARD_STATUS_ALL) {
            return 'ALL';
        } else if (campStatus == constants.DASHBOARD_STATUS_ENDED) {
            return 'ENDED';
        } else if (campStatus == constants.DASHBOARD_STATUS_IN_FLIGHT) {
            return 'IN_FLIGHT';
        }
    }

    return {
        setTitle: setTitle,
        setSelectedBrand: setBrand,
        setSelectedAdvertiser: setAdvertiser,
        getData: getData,
        campaignStatusToSend: campaignStatusToSend
    };
  }]);
});
