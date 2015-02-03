(function () {
    "use strict";
    var bubbleChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {
        this.getBubbleChartData = function () {
            var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.SPEND_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                return data;
            })
        }
    };
    commonModule.service('bubbleChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants' , bubbleChartData]);
}());