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
           // var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key,loginModel.getAgencyId(), dashboardModel.getData().selectedStatus);
            var clientId = loginModel.getSelectedClient().id;
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var brandId = brandsModel.getSelectedBrand().id;
            var campaignStatus = dashboardModel.campaignStatusToSend();
            var url = urlService.APISpendWidgetForAllBrands(clientId,advertiserId,brandId,timePeriodModel.timeData.selectedTimePeriod.key,campaignStatus);
            //console.log('bubble chart url',url);
            var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {

             var total_brands = response.data.data.length ;

             var data =   _.chain(response.data.data).
                                sortBy(function(d){ return d.budget ;}).
                                reverse().
                                slice(0,5).
                                value();

                if(data.length > 0){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['brandData'] = data ;
                    bubbleWidgetData['budget_top_title'] =  (total_brands >5) ? "(Top 5 brands)" : "(All Brands)";

                } else {
                    bubbleWidgetData['dataNotAvailable'] = true ;
                }
                return bubbleWidgetData['brandData'];
            })
        };

       // getBubbleChartDataForCampaign
        this.getBubbleChartDataForCampaign = function (selectedBrand) {
            var url = urlService.APISpendWidgetForCampaigns(timePeriodModel.timeData.selectedTimePeriod.key,loginModel.getAgencyId(), selectedBrand, dashboardModel.getData().selectedStatus);
            var canceller = requestCanceller.initCanceller(constants.BUBBLE_CHART_CAMPAIGN_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {

                var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {} ;
                var campaignLength = response.data.data.length ;

                if(campaigns != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns ;
                    bubbleWidgetData['budget_top_title'] = (campaignLength >5) ?  "(Top 5 campaigns)" :  "(All Campaigns)" ;

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
            var url = urlService.APISpendWidgetForCampaigns(timePeriodModel.timeData.selectedTimePeriod.key,loginModel.getAgencyId(), selectedBrand, dashboardModel.getData().selectedStatus);
            return dataService.fetch(url).then(function(response) {

                var campaigns = (response.data.data !== undefined) ? response.data.data.campaigns : {} ;
                var campaignLength = response.data.data.length ;

                if(campaigns != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['campaignDataForSelectedBrand'] = campaigns ;
                    bubbleWidgetData['budget_top_title'] = (campaignLength >5) ?  "(Top 5 campaigns)" :  "(All Campaigns)" ;

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