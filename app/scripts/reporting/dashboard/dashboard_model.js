define(['angularAMD', 'login/login_model', 'reporting/advertiser/advertiser_model',
    'reporting/brands/brands_model', 'reporting/timePeriod/time_period_model', 'common/services/constants_service',
    'common/services/url_service', 'common/services/request_cancel_service',
    'common/services/data_service', 'common/utils',
    'common/services/sub_account_service', 'common/services/vistoconfig_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('dashboardModel', ['loginModel', 'advertiserModel', 'brandsModel', 'timePeriodModel',
        'constants', 'urlService', 'requestCanceller', 'dataService', 'utils','subAccountService', 'vistoconfig',
        function (loginModel, advertiserModel, brandsModel, timePeriodModel, constants, urlService, requestCanceller,
                  dataService, utils, subAccountService, vistoconfig) {

            var localStoredCampaignStatus = JSON.parse(localStorage.getItem('dashboardStatusFilter')),

                // by default it is active.  Now check local storage if we want to change it last saved status.
                dashboardData = {selectedStatus: constants.DASHBOARD_STATUS_IN_FLIGHT},

                setTitle = function () {
                    dashboardData.title = 'Showing ';
                    getCampaingsCount();
                    addCampaigns();
                },

                getCampaingsCount = function () {
                    var clientId = vistoconfig.getSelectedAccountId(),
                        advertiserId = vistoconfig.getSelectAdvertiserId(),
                        url = urlService.APICalendarWidgetForAllAdvertisers(clientId, advertiserId,
                            'end_date', campaignStatusToSend());

                    return dataService
                        .fetch(url)
                        .then(function (response) {
                                var totalCamapigns = response.data.data.total_campaigns;
                                var mediaPlanText = 'Media Plan' + (totalCamapigns > 1 ? 's' : '');
                                dashboardData.toolTip = 'Showing data for ' + totalCamapigns + ' ' + mediaPlanText;
                            });
                },


                setAdvertiser = function(advertiser){
                    dashboardData.selectedAdvertiser = advertiser.name;

                    if (advertiser.name === constants.ALL_ADVERTISERS) {
                        dashboardData.advertiserSelected = false;
                    } else {
                        dashboardData.advertiserSelected = true;
                    }
                },

                getData = function () {
                    dashboardData.brandSelected = vistoconfig.getSelectedBrandId() !== -1;
                    dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
                    return dashboardData;
                },

                campaignStatusToSend = function () {
                    var campStatus = getData().selectedStatus;

                    if (campStatus === constants.DASHBOARD_STATUS_ALL) {
                        return 'ALL';
                    } else if (campStatus === constants.DASHBOARD_STATUS_ENDED) {
                        return 'ENDED';
                    } else if (campStatus === constants.DASHBOARD_STATUS_IN_FLIGHT) {
                        return 'IN_FLIGHT';
                    }
                };

            function addCampaigns() {
                dashboardData.titleSecondPart = dashboardData.selectedStatus + ' Media Plans for ';
                if (vistoconfig.getSelectedBrandId() === -1) {
                    dashboardData.titleSecondPart += constants.ALL_BRANDS;
                }
            }

            if (localStoredCampaignStatus !== null && localStoredCampaignStatus !== undefined &&
                (localStoredCampaignStatus === constants.DASHBOARD_STATUS_ALL ||
                    localStoredCampaignStatus === constants.DASHBOARD_STATUS_IN_FLIGHT ||
                    localStoredCampaignStatus === constants.DASHBOARD_STATUS_ENDED)) {
               dashboardData.selectedStatus= localStoredCampaignStatus;
            }

            dashboardData.statusDropdownValues = [
                constants.DASHBOARD_STATUS_ALL,
                constants.DASHBOARD_STATUS_IN_FLIGHT,
                constants.DASHBOARD_STATUS_ENDED
            ];

            dashboardData.selectedBrand = brandsModel.getSelectedBrand().name;
            dashboardData.brandSelected = false;
            dashboardData.totalCampaigns = 0;
            dashboardData.totalBrands = 0;
            dashboardData.toolTip = '';
            dashboardData.selectedAdvertiser = advertiserModel.getSelectedAdvertiser().name;

            return {
                setTitle: setTitle,
                setSelectedAdvertiser: setAdvertiser,
                getData: getData,
                campaignStatusToSend: campaignStatusToSend
            };
        }
    ]);
});
