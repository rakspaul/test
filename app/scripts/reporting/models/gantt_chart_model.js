define(['angularAMD', 'url-service', 'dashboard-model'], function (angularAMD) {
    'use strict';

    angularAMD.service('ganttChartModel', ['utils', 'urlService' , 'dataService', 'brandsModel',
        'dashboardModel', 'vistoconfig', function (utils, urlService , dataService, brandsModel,
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
                    brandId = (Number(vistoconfig.getSelectedBrandId()) === 0)?-1:vistoconfig.getSelectedBrandId();

                if (advertiserId !== -1) {
                    url = urlService.APICalendarWidgetForAdvertiser(clientId, advertiserId, brandId, this.filter,
                        dashboardModel.campaignStatusToSend());

                    url += '&pageCount=' + this.pageCount;
                } else {
                    url = urlService.APICalendarWidgetForAllAdvertisers(clientId, advertiserId, this.filter,
                        dashboardModel.campaignStatusToSend());
                }
console.log("calendar url: ",url);
                return dataService
                    .fetch(url, {cache: false})
                    .then(function (response) {
                        return response.data.data;
                    });
            };
        }]);
});
