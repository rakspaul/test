(function () {
    "use strict";
    var bubbleChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel ,dashboardModel , requestCanceller, constants, loginModel,advertiserModel) {

        var bubbleWidgetData = {
            brandData : {},
            dataNotAvailable : true,
            budget_top_title : {},
            campaignDataForSelectedBrand : {},
            campaignDataForAllBrands : {}
        };

        this.getBubbleChartData = function () {
            var queryObj = {"clientId":loginModel.getSelectedClient().id,"advertiserId":advertiserModel.getSelectedAdvertiser().id,"brandId":brandsModel.getSelectedBrand().id,"dateFilter":timePeriodModel.timeData.selectedTimePeriod.key,"campaignStatus":dashboardModel.campaignStatusToSend()};
            var url = urlService.APISpendWidgetForAllBrands(queryObj);
            //var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
            return dataService.fetch(url).then(function(response) {
                if(response.data && response.data.data.length >0) {
                    var total_brands = response.data.data.length;
                    var data = _.chain(response.data.data).
                        sortBy(function (d) {
                            return d.budget;
                        }).
                        reverse().
                        slice(0, 5).
                        value();

                    if (data.length > 0) {
                        bubbleWidgetData['dataNotAvailable'] = false;
                        bubbleWidgetData['brandData'] = data;
                        bubbleWidgetData['budget_top_title'] = (total_brands > 5) ? "(Top 5 brands)" : "(All Brands)";
                    } else {
                        bubbleWidgetData['dataNotAvailable'] = true;
                    }
                    return bubbleWidgetData['brandData'];
                }
            })
        };

       // getBubbleChartDataForCampaign
        this.getBubbleChartDataForCampaign = function (selectedBrand) {
            var clientId =  loginModel.getSelectedClient().id;
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var queryObj = {"clientId":loginModel.getSelectedClient().id,"advertiserId":advertiserModel.getSelectedAdvertiser().id,"brandId":((selectedBrand == undefined)?-1:selectedBrand),"dateFilter":timePeriodModel.timeData.selectedTimePeriod.key,"campaignStatus":dashboardModel.campaignStatusToSend()};
          //  var url = urlService.APISpendWidgetForCampaigns(clientId, advertiserId, selectedBrand, timePeriodModel.timeData.selectedTimePeriod.key, dashboardModel.getData().selectedStatus);
            var url = urlService.APISpendWidgetForCampaigns(queryObj);
            var canceller = requestCanceller.initCanceller(constants.BUBBLE_CHART_CAMPAIGN_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {

                var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {} ;
                var campaignLength = response.data.data.length ;

                if(campaigns != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns ;
                    bubbleWidgetData['budget_top_title'] = (campaignLength >5) ?  "(Top 5 Media Plans)" :  "(All Media Plans)" ;

                    var allCampaignsHaveZeroBudget = true ;
                    for ( var i in campaigns){
                        if( campaigns[i].budget > 0)
                          allCampaignsHaveZeroBudget = false ;
                    }
                    bubbleWidgetData['dataNotAvailable'] = allCampaignsHaveZeroBudget ;

                } else {
                    bubbleWidgetData['dataNotAvailable'] = true ;
                }
                return campaigns;
            })
        };

        // So that user can fire paraller request to fetch campaigns of a brands.
        this.getBubbleChartDataForCampaignWithOutCanceller = function (selectedBrand) {
            var queryObj = {"clientId":loginModel.getSelectedClient().id,"advertiserId":advertiserModel.getSelectedAdvertiser().id,"brandId":((selectedBrand == undefined)?-1:selectedBrand),"dateFilter":timePeriodModel.timeData.selectedTimePeriod.key,"campaignStatus":dashboardModel.campaignStatusToSend()};
            var url = urlService.APISpendWidgetForCampaigns(queryObj);
            return dataService.fetch(url).then(function(response) {

                var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {} ;
                var campaignLength = response.data.data.length ;

                if(campaigns != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns ;
                    bubbleWidgetData['budget_top_title'] = (campaignLength >5) ?  "(Top 5 Media Plans)" :  "(All Media Plans)" ;

                } else {
                    bubbleWidgetData['dataNotAvailable'] = true ;
                }
                return campaigns;
            })
        };


        this.getbubbleWidgetData = function(){
            return bubbleWidgetData ;
        };

    };
    commonModule.service('bubbleChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel','dashboardModel','requestCanceller', 'constants' , 'loginModel' ,'advertiserModel' ,bubbleChartData]);
}());