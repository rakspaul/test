(function () {
    "use strict";
    var bubbleChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {

        var bubbleWidgetData = {
            chartData : {},
            dataNotAvailable : true,
            budget_top_title : {}

        };
        this.getBubbleChartData = function () {
            var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;

                if(data != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['chartData'] = data ;
                    if( brandsModel.getSelectedBrand().id == -1) { // data is obtained for all brands view
                        var total_brands = (data['total_brands'] > 5) ? 5 : data['total_brands'] ;
                        bubbleWidgetData['budget_top_title'] =  (total_brands >5) ? "(Top 5 brands)" : "(All Brands)";
                    }else { // data is obtained for all campaign view
                        var brand_data = (data != undefined && data['brands'] != undefined) ? data['brands'][0] : undefined ;
                        if(brand_data != undefined){
                          var campaings =  brand_data['campaigns'] ;
                          var campaignLength = (campaings == undefined )?  0 : campaings.length ;
                            bubbleWidgetData['budget_top_title'] = (campaignLength >5) ?  "(Top 5 campaigns)" :  "(All Campaigns)" ;
                        }
                    }
                } else {

                    bubbleWidgetData['dataNotAvailable'] = true ;
                }
                return bubbleWidgetData['chartData'];
            })
        };

        this.getbubbleWidgetData = function(){
            return bubbleWidgetData ;
        };

    };
    commonModule.service('bubbleChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants' , bubbleChartData]);
}());