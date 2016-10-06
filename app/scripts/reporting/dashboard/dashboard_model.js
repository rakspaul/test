define(['angularAMD', 'time-period-model', 'url-service', 'request-cancel-service', 'common-utils'], function (angularAMD) {
    'use strict';

    angularAMD.factory('dashboardModel', ['loginModel', 'advertiserModel', 'brandsModel', 'timePeriodModel', 'constants', 'urlService', 'requestCanceller', 'dataService',
        'utils', 'subAccountService', 'vistoconfig', function (loginModel, advertiserModel, brandsModel, timePeriodModel, constants, urlService, requestCanceller,
                                                               dataService, utils, subAccountService, vistoconfig) {


                var dashboardData = {},

                getMediaPlanToolTip = function() {
                    var total = 0,
                        toolTipText,
                        stateMapper = {
                            'In Flight' : 'In_flight',
                            'Ended' : 'Ended'
                        },
                        selectedStatus = getSelectedStatus();


                    if(stateMapper[selectedStatus]) {
                        _.each(dashboardData.campaignData.advertisers, function (obj) {
                            total += _.filter(obj.campaigns, function (campaign) {
                                return campaign.state === stateMapper[selectedStatus];
                            }).length;
                        });
                    } else {
                        total = dashboardData.campaignData.total_campaigns;
                    }

                    toolTipText = 'Media Plan' + (total > 1 ? 's' : '');
                    dashboardData.toolTipText = 'Showing data for ' + total + ' ' + toolTipText;
                },

                getAdvertisers = function () {
                    var clientId = vistoconfig.getSelectedAccountId(),
                        advertiserId = vistoconfig.getSelectAdvertiserId(),
                        url = urlService.APICalendarWidgetForAllAdvertisers(clientId, advertiserId, 'end_date', campaignStatusToSend());

                    return dataService
                        .fetch(url)
                        .then(function (response) {
                            if(response.data && response.data.data && response.status === 'success') {
                                dashboardData.campaignData = response.data.data;

                                getMediaPlanToolTip();
                            }
                        });
                },

                setAdvertiser = function (advertiser) {
                    dashboardData.selectedAdvertiser = advertiser.name;

                    if (advertiser.name === constants.ALL_ADVERTISERS) {
                        dashboardData.advertiserSelected = false;
                    } else {
                        dashboardData.advertiserSelected = true;
                    }
                },

                setSelectedStatus = function (status) {
                    dashboardData.selectedStatus = status || constants.DASHBOARD_STATUS_IN_FLIGHT;
                },

                getSelectedStatus = function () {
                    return dashboardData.selectedStatus;
                },

                getDisplayLabel = function () {
                    var label = 'Showing ' + getSelectedStatus() + ' Media Plans for ';

                    if (vistoconfig.getSelectedBrandId() === -1) {
                        label += constants.ALL_BRANDS;
                    }

                    dashboardData.displayLabel = label;
                },

                getData = function () {
                    dashboardData.brandSelected = vistoconfig.getSelectedBrandId() !== -1;

                    if (dashboardData.brandSelected) {
                        // TODO: Please change the following name "selectedBrand". It may be confused with "brandSelected".
                        dashboardData.selectedBrand = brandsModel.getSelectedBrand().brandName;
                    }

                    getDisplayLabel();
                    getAdvertisers();

                    return dashboardData;
                },

                campaignStatusToSend = function () {
                    var campStatus = getSelectedStatus();

                    if (campStatus === constants.DASHBOARD_STATUS_ALL) {
                        return 'ALL';
                    } else if (campStatus === constants.DASHBOARD_STATUS_ENDED) {
                        return 'ENDED';
                    } else if (campStatus === constants.DASHBOARD_STATUS_IN_FLIGHT) {
                        return 'IN_FLIGHT';
                    }
                };




            dashboardData.statusDropdownValues = [
                constants.DASHBOARD_STATUS_ALL,
                constants.DASHBOARD_STATUS_IN_FLIGHT,
                constants.DASHBOARD_STATUS_ENDED
            ];

            // TODO: Please change the following name "selectedBrand". It may be confused with "brandSelected".
            dashboardData.selectedBrand = brandsModel.getSelectedBrand().brandName;
            dashboardData.brandSelected = false;
            dashboardData.totalCampaigns = 0;
            dashboardData.totalBrands = 0;
            dashboardData.toolTip = '';

            // TODO: is 'name' or 'id' of selectedAdvertiser expected here?
            dashboardData.selectedAdvertiser = advertiserModel.getSelectedAdvertiser().name;

            return {
                setSelectedAdvertiser: setAdvertiser,
                getData: getData,
                campaignStatusToSend: campaignStatusToSend,
                setSelectedStatus: setSelectedStatus,
                getSelectedStatus: getSelectedStatus,

            };
        }
    ]);
});
