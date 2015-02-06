(function () {
    "use strict";
    var ganttChart = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {
        this.dashboard = {
        	tasks: {},
        	brands: {}
        };

        this.getGanttChartData = function () {
            var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.GANTT_CHART_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                return data;
            })
        }

      

    }
    commonModule.service('ganttChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants' , ganttChart ]);
}());