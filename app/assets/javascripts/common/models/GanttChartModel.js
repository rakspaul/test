(function () {
    "use strict";
    var ganttChart = function (utils, urlService, timePeriodModel, dataService, brandsModel, dashboardModel, requestCanceller, constants, loginModel) {
        this.dashboard = {
        	tasks: {},
        	brands: {}, 
            filter : "end_date"
        };

        this.getGanttChartData = function () {
            var url;

            if(brandsModel.getSelectedBrand().id !== -1){
                //brand selected
                url = urlService.APICalendarWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, loginModel.getAgencyId(), this.filter,  dashboardModel.getData().selectedStatus, brandsModel.getSelectedBrand().id);
               // console.log('calendar url = '+url);
            }else{
                url = urlService.APICalendarWidgetForBrand(timePeriodModel.timeData.selectedTimePeriod.key, loginModel.getAgencyId(), this.filter,  dashboardModel.getData().selectedStatus);
            }

           // var url = urlService.APISpendWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
            var canceller = requestCanceller.initCanceller(constants.GANTT_CHART_BRAND_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                return data;
            })
        }

      

    }
    commonModule.service('ganttChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel','dashboardModel','requestCanceller', 'constants', 'loginModel', ganttChart ]);
}());