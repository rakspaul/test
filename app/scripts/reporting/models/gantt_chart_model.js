define(['angularAMD', 'common/services/url_service','common/services/data_service','reporting/brands/brands_model','reporting/dashboard/dashboard_model', 'login/login_model', 'reporting/advertiser/advertiser_model', 'reporting/subAccount/sub_account_model'], function (angularAMD) {
  angularAMD.service('ganttChartModel', ['utils', 'urlService', 'dataService', 'brandsModel','dashboardModel','loginModel', 'advertiserModel','subAccountModel', function (utils, urlService , dataService, brandsModel, dashboardModel, loginModel, advertiserModel,subAccountModel) {
        this.dashboard = {
            tasks: {},
            brands: {},
            filter: "end_date"
        };
        this.getGanttChartData = function () {
            var url;
            var isDashboardSubAccount = subAccountModel.isDashboardSubAccount();
            var clientId = isDashboardSubAccount?loginModel.getDashboardClient().id:loginModel.getSelectedClient().id;
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var brandId = brandsModel.getSelectedBrand().id;

            if (brandId !== -1) {
                url = urlService.APICalendarWidgetForBrand(clientId, advertiserId, brandId, this.filter, dashboardModel.campaignStatusToSend());
                url += "&pageCount="+this.pageCount;

            } else {
                url = urlService.APICalendarWidgetForAllBrands(clientId, advertiserId, this.filter,dashboardModel.campaignStatusToSend());
            }
            console.log('Gantt chart url: ',url);
            return dataService.fetch(url, {cache: false}).then(function (response) {
                var data = response.data.data;
                return data;
            })
        }
  }]);
});
