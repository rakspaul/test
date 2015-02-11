(function () {
    "use strict";
    var screenChartData = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {
        this.getScreenChartData = function () {
            var url = urlService.APIScreenWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.SCREEN_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                return data;
            })
        }
    };
    commonModule.service('screenChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants' , screenChartData]);
}());