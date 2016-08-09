define(['angularAMD', 'login/login_model','login/login_service', 'reporting/common/d3/bubble_chart',
    'reporting/models/bubble_chart_model','reporting/brands/brands_model', 'common/services/constants_service',
    'reporting/advertiser/advertiser_model', 'common/services/vistoconfig_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BubbleChartController', function ($scope, $cookieStore, $location, loginModel, loginService,
                                                             bubbleChart, bubbleChartModel, brandsModel, constants,
                                                             advertiserModel, vistoconfig) {
        var _curCtrl = this;

        _curCtrl.defaultFilter = {
            advertiserId: -1,
            brandId: -1,
            dateFilter: 'life_time'
        };

        function getSpendDataForCampaigns() {
            $scope.spendBusy = true;

            // Fetch the new data now.
            bubbleChartModel
                .getBubbleChartDataForCampaign(vistoconfig.getSelectAdvertiserId())
                .then(function () {
                    $scope.spendBusy = false;

                    if (bubbleChartModel.getbubbleWidgetData().dataNotAvailable === true) {
                        d3.select('#advertisers_svg').remove();
                        d3.select('#campaigns_svg').remove();
                        $scope.dataFound = false;
                    } else {
                        $scope.dataFound = true;
                        $scope.data.campaignDataForSelectedBrand =
                            bubbleChartModel.getbubbleWidgetData().campaignDataForSelectedBrand;

                        $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData().budget_top_title;
                        bubbleChart.updateBubbleChartData('campaigns', $scope.data.campaignDataForSelectedBrand);
                    }
                });
        }

        function getSpendDataForAdvertisers() {
            var o = {};

            o.advertiserId = vistoconfig.getSelectAdvertiserId();
            o.brandId = vistoconfig.getSelectedBrandId();
            o.dateFilter = constants.PERIOD_LIFE_TIME;

            (JSON.stringify(o) === JSON.stringify(_curCtrl.defaultFilter)) ?
                getSpendDataForAdvertisersWithDefaultValue() : getSpendDataForCampaigns(o);

            $scope.spendBusy = true;
        }

        function getSpendDataForAdvertisersWithDefaultValue(){
            // Fetch the new data now.
            bubbleChartModel
                .getBubbleChartData()
                .then(function () {
                    $scope.spendBusy = false;

                    if (bubbleChartModel.getbubbleWidgetData().dataNotAvailable === true) {
                        d3.select('#advertisers_svg').remove();
                        d3.select('#campaigns_svg').remove();
                        $scope.dataFound = false;
                    } else {
                        $scope.dataFound = true;
                        $scope.data.advertiserData = bubbleChartModel.getbubbleWidgetData().advertiserData;
                        bubbleChart.updateBubbleChartData('advertisers', $scope.data.advertiserData);
                        $scope.budget_top_title = bubbleChartModel.getbubbleWidgetData().budget_top_title;
                    }
                }, function(){
                    dataNotFound();
                });
        }

        function dataNotFound(){
            $scope.spendBusy = false;
            d3.select('#advertisers_svg').remove();
            d3.select('#campaigns_svg').remove();
            $scope.dataFound = false;
        }

        $scope.data = {
            advertiserData: {},
            campaignDataForSelectedBrand: {},
            campaignDataForAllBrands: []
        };

        $scope.dataFound = true;
        $scope.style = constants.DATA_NOT_AVAILABLE_STYLE;

        if (vistoconfig.getSelectAdvertiserId() === -1) {
            getSpendDataForAdvertisers();
        } else {
            getSpendDataForCampaigns();
        }

        $scope.refresh = function () {
            bubbleChart.cleaningBubbleChart('advertisers');
            bubbleChart.cleaningBubbleChart('campaigns');

            // All Advertisers is selected
            if (vistoconfig.getSelectAdvertiserId() === -1) {
                getSpendDataForAdvertisers();
            } else {
                getSpendDataForCampaigns();
            }
        };

        $scope.$on(constants.EVENT_STATUS_FILTER_CHANGED, function () {
            $scope.refresh();
        });

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };
    });
});
