(function () {
    "use strict";
    var ganttChart = function (urlService, dataService, brandsModel, dashboardModel, loginModel, advertiserModel) {
        this.dashboard = {
            tasks: {},
            brands: {},
            filter: "end_date"
        };
        this.getGanttChartData = function () {
            var url;
            var clientId = loginModel.getSelectedClient().id;
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var brandId = brandsModel.getSelectedBrand().id;

            if (brandId !== -1) {
                url = urlService.APICalendarWidgetForBrand(clientId, advertiserId, brandId, this.filter, dashboardModel.campaignStatusToSend());
                url += "&pageCount="+this.pageCount;

            } else {
                url = urlService.APICalendarWidgetForAllBrands(clientId, advertiserId, this.filter,dashboardModel.campaignStatusToSend());
            }
            return dataService.fetch(url, {cache: false}).then(function (response) {
                var data = response.data.data;
                return data;
            })
        }
    }
    commonModule.service('ganttChartModel', ['urlService', 'dataService', 'brandsModel', 'dashboardModel', 'loginModel', 'advertiserModel', ganttChart]);
}());