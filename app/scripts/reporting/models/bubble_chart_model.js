define(['angularAMD', 'url-service', 'time-period-model', 'dashboard-model', 'request-cancel-service'], function (angularAMD) {
    'use strict';

    angularAMD.service('bubbleChartModel', ['urlService', 'timePeriodModel', 'dataService', 'brandsModel',
        'dashboardModel', 'requestCanceller', 'constants', 'loginModel', 'advertiserModel',
        'subAccountService', 'vistoconfig',
        function (urlService, timePeriodModel, dataService, brandsModel, dashboardModel, requestCanceller,
                 constants, loginModel, advertiserModel, subAccountService, vistoconfig) {
            var bubbleWidgetData = {
                advertiserData: {},
                dataNotAvailable: true,
                budget_top_title: {},
                campaignDataForSelectedBrand: {},
                campaignDataForAllBrands: {}
            };

            this.getBubbleChartData = function () {
                var queryObj = {
                        clientId: vistoconfig.getSelectedAccountId(),
                        advertiserId: vistoconfig.getSelectAdvertiserId(),
                        brandId: vistoconfig.getSelectedBrandId(),
                        dateFilter: constants.PERIOD_LIFE_TIME,
                        campaignStatus: dashboardModel.campaignStatusToSend()
                    },

                    url = urlService.APISpendWidgetForAllBrands(queryObj);

                return dataService
                    .fetch(url)
                    .then(function (response) {
                        if (response.data && response.data.data.length > 0) {
                            var total_advertisers = response.data.data.length,

                                data = _.chain(response.data.data)
                                    .sortBy(function (d) {
                                        return d.budget;
                                    })
                                    .reverse()
                                    .slice(0, 5)
                                    .value();

                            if (data.length > 0) {
                                bubbleWidgetData.dataNotAvailable = false;
                                bubbleWidgetData.advertiserData = data;

                                bubbleWidgetData.budget_top_title = (total_advertisers >= 5) ?
                                    '(Top 5 Advertisers)' : '(All Advertisers)';
                            } else {
                                bubbleWidgetData.dataNotAvailable = true;
                            }
                        } else {
                            bubbleWidgetData.dataNotAvailable = true;
                        }

                        return bubbleWidgetData.advertiserData;
                    });
            };

            // getBubbleChartDataForCampaign
            this.getBubbleChartDataForCampaign = function () {
                var queryObj = {
                        clientId: vistoconfig.getSelectedAccountId(),
                        advertiserId: vistoconfig.getSelectAdvertiserId(),
                        brandId: (Number(vistoconfig.getSelectedBrandId()) === 0)?-1:vistoconfig.getSelectedBrandId(),
                        dateFilter: constants.PERIOD_LIFE_TIME,
                        campaignStatus: dashboardModel.campaignStatusToSend()
                    },

                    url = urlService.APISpendWidgetForCampaigns(queryObj),
                    canceller = requestCanceller.initCanceller(constants.BUBBLE_CHART_CAMPAIGN_CANCELLER);

                return dataService.fetchCancelable(url, canceller, function (response) {
                    var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {},
                        campaignLength = (campaigns !== undefined) ? campaigns.length : 0,
                        allCampaignsHaveZeroBudget,
                        i;

                    if (campaigns !== undefined) {
                        bubbleWidgetData.dataNotAvailable = false;
                        bubbleWidgetData.campaignDataForSelectedBrand = campaigns;

                        bubbleWidgetData.budget_top_title = (campaignLength >= 5) ?
                            '(Top 5 Media Plans)' : '(All Media Plans)';

                        allCampaignsHaveZeroBudget = true;

                        for (i in campaigns) {
                            if (campaigns[i].budget > 0) {
                                allCampaignsHaveZeroBudget = false;
                            }
                        }

                        bubbleWidgetData.dataNotAvailable = allCampaignsHaveZeroBudget;
                    } else {
                        bubbleWidgetData.dataNotAvailable = true;
                    }

                    return campaigns;
                });
            };

            // So that user can fire paraller request to fetch campaigns of a brands.
            this.getBubbleChartDataForCampaignWithOutCanceller = function () {
                if (vistoconfig.getSelectedAccountId()) {
                    var queryObj = {
                            clientId: vistoconfig.getSelectedAccountId(),
                            advertiserId: vistoconfig.getSelectAdvertiserId(),
                            brandId: vistoconfig.getSelectedBrandId(),
                            dateFilter: constants.PERIOD_LIFE_TIME,
                            campaignStatus: dashboardModel.campaignStatusToSend()
                        },

                        url = urlService.APISpendWidgetForCampaigns(queryObj);

                    return dataService
                        .fetch(url)
                        .then(function (response) {
                            var campaigns,
                                campaignLength;

                            if (response) {
                                campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {};
                                campaignLength = (campaigns !== undefined) ? campaigns.length : 0;

                                if (campaigns !== undefined) {
                                    bubbleWidgetData.dataNotAvailable = false;
                                    bubbleWidgetData.campaignDataForSelectedBrand = campaigns;

                                    bubbleWidgetData.budget_top_title = (campaignLength >= 5) ?
                                        '(Top 5 Media Plans)' : '(All Media Plans)';

                                } else {
                                    bubbleWidgetData.dataNotAvailable = true;
                                }
                            }

                            return campaigns;
                        });
                }
            };

            this.getbubbleWidgetData = function () {
                return bubbleWidgetData;
            };
        }
    ]);
});
