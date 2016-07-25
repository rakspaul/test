define(['angularAMD', 'common/services/url_service', 'common/services/data_service', 'reporting/brands/brands_model',
    'reporting/dashboard/dashboard_model', 'common/services/vistoconfig_service'], function (angularAMD) {
    'use strict';

    angularAMD.service('ganttChartModel', function (utils, urlService , dataService, brandsModel,
                                                                     dashboardModel, vistoconfig) {
            this.dashboard = {
                tasks: {},
                brands: {},
                filter: 'end_date'
            };

            this.getGanttChartData = function () {
                var url,
                    clientId = vistoconfig.getSelectedAccountId(),
                    advertiserId = vistoconfig.getSelectAdvertiserId(),
                    brandId = vistoconfig.getSelectedBrandId();

                if (advertiserId !== -1) {
                    url = urlService.APICalendarWidgetForAdvertiser(clientId, advertiserId, brandId, this.filter,
                        dashboardModel.campaignStatusToSend());

                    url += '&pageCount=' + this.pageCount;
                } else {
                    url = urlService.APICalendarWidgetForAllAdvertisers(clientId, advertiserId, this.filter,
                        dashboardModel.campaignStatusToSend());
                }

                return dataService
                    .fetch(url, {cache: false})
                    .then(function (response) {
                        return response.data.data;
                    });
            };
        }
    );
});
