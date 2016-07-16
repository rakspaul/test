define(['angularAMD', 'common/services/url_service', 'common/services/data_service', // jshint ignore:line
    'reporting/brands/brands_model','reporting/dashboard/dashboard_model', 'login/login_model',
    'reporting/advertiser/advertiser_model', 'reporting/subAccount/sub_account_service'], function (angularAMD) {
    'use strict';

    angularAMD.service('ganttChartModel', ['utils', 'urlService', 'dataService', 'brandsModel','dashboardModel',
        'loginModel', 'advertiserModel','subAccountModel', function (utils, urlService , dataService, brandsModel,
                                                                     dashboardModel, loginModel, advertiserModel,
                                                                     subAccountModel) {
            this.dashboard = {
                tasks: {},
                brands: {},
                filter: 'end_date'
            };

            this.getGanttChartData = function () {
                var url,
                    clientId = subAccountModel.getDashboardAccountId(),
                    advertiserId = advertiserModel.getSelectedAdvertiser().id,
                    brandId = brandsModel.getSelectedBrand().id;

                if (brandId !== -1) {
                    url = urlService.APICalendarWidgetForBrand(clientId, advertiserId, brandId, this.filter,
                        dashboardModel.campaignStatusToSend());

                    url += '&pageCount=' + this.pageCount;
                } else {
                    url = urlService.APICalendarWidgetForAllBrands(clientId, advertiserId, this.filter,
                        dashboardModel.campaignStatusToSend());
                }

                return dataService
                    .fetch(url, {cache: false})
                    .then(function (response) {
                        return response.data.data;
                    });
            };
        }
    ]);
});
