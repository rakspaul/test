(function () {
    "use strict";
    var ganttChart = function (utils, urlService, timePeriodModel, dataService, brandsModel, dashboardModel, requestCanceller, constants, loginModel, advertiserModel) {
        this.dashboard = {
        	tasks: {},
        	brands: {}, 
            filter : "end_date"
        };

        this.getGanttChartData = function () {
            var url;
            var clientId = loginModel.getClientId();
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var brandId = brandsModel.getSelectedBrand().id;

            if(brandId !== -1){
                url = urlService.APICalendarWidgetForAllBrands(timePeriodModel.timeData.selectedTimePeriod.key, loginModel.getAgencyId(), this.filter,  dashboardModel.getData().selectedStatus, brandId);
            }else{
                url = urlService.APICalendarWidgetForBrand(timePeriodModel.timeData.selectedTimePeriod.key, clientId, advertiserId, this.filter,  dashboardModel.getData().selectedStatus);
            }

            var canceller = requestCanceller.initCanceller(constants.GANTT_CHART_BRAND_CANCELLER);
            return dataService.fetchCancelable(url, canceller, function(response) {
                var data = response.data.data;
                return data;
            })
        }



    }
    commonModule.service('ganttChartModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel','dashboardModel','requestCanceller', 'constants', 'loginModel', 'advertiserModel',  ganttChart ]);
}());