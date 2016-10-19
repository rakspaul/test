define(['angularAMD', 'url-service', 'dashboard-model', 'request-cancel-service'], function (angularAMD) {
    'use strict';

    angularAMD.service('gaugeModel', ['urlService', 'dashboardModel', 'dataService', 'brandsModel', 'requestCanceller',
        'constants', 'loginModel', 'advertiserModel', 'subAccountService', 'vistoconfig',
        function (urlService, dashboardModel, dataService, brandsModel, requestCanceller, constants, loginModel,
                  advertiserModel, subAccountService, vistoconfig) {

            this.dashboard = {selectedFilter: ''};

            this.resetDashboardFilters = function () {
                this.dashboard.selectedFilter = '';
            };

            this.getGaugeData = function () {
                var clientId = vistoconfig.getSelectedAccountId(),
                    advertiserId = vistoconfig.getSelectAdvertiserId(),
                    brandId = (Number(vistoconfig.getSelectedBrandId()) === 0)?-1:vistoconfig.getSelectedBrandId(),

                    url = urlService.APICampaignCountsSummary(
                        constants.PERIOD_LIFE_TIME, clientId, advertiserId, brandId,
                        dashboardModel.campaignStatusToSend()
                    );

                return dataService
                    .fetch(url)
                    .then(function (response) {
                        var active = response.data.data.active,
                            completed = response.data.data.completed,
                            na = response.data.data.na,
                            ready = response.data.data.ready,
                            draft = response.data.data.draft,
                            paused = response.data.data.paused,
                            totalCampaigns = active.total + completed.total + na.total + ready + draft + paused,
                            onTrack = active.ontrack + completed.ontrack + na.ontrack,
                            underPerforming = active.underperforming + completed.underperforming + na.underperforming,
                            others = active.others + completed.others + na.others,
                            pct = 0;

                        if ((onTrack + underPerforming) > 0) {
                            pct = Math.round(onTrack / (onTrack + underPerforming) * 100);
                        }

                        dashboardModel.setCampaignTotal(response.data.data.total);
  ;
                        return {
                            onTrackPct: pct,
                            onTrack: onTrack,
                            underPerforming: underPerforming,
                            others: others,
                            totalCampaigns: totalCampaigns,
                            campaignsFoundForSetKPI: (onTrack + underPerforming) > 0 ? true : false
                        };
                    });
            };
        }
    ]);
});
