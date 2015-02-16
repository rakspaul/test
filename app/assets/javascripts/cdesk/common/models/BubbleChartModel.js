(function () {
    "use strict";
    var bubbleChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {

        var bubbleWidgetData = {
            chartData : {},
            dataNotAvailable : true

        };
        this.getBubbleChartData = function () {
            var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;

                if(data != undefined ){
                    bubbleWidgetData['dataNotAvailable'] = false ;
                    bubbleWidgetData['chartData'] = data ;
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