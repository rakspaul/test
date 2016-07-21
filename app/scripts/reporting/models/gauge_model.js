define(['angularAMD', 'common/services/url_service', 'reporting/dashboard/dashboard_model',
    'common/services/data_service', 'reporting/brands/brands_model', 'common/services/request_cancel_service',
    'common/services/constants_service', 'login/login_model', 'reporting/advertiser/advertiser_model',
    'reporting/subAccount/sub_account_service'], function (angularAMD) {
    'use strict';

    angularAMD.service('gaugeModel', ['urlService', 'dashboardModel', 'dataService', 'brandsModel', 'requestCanceller',
        'constants', 'loginModel', 'advertiserModel', 'subAccountModel',
        function (urlService, dashboardModel, dataService, brandsModel, requestCanceller, constants, loginModel,
                  advertiserModel, subAccountModel) {
            this.dashboard = {selectedFilter: ''};

            this.resetDashboardFilters = function () {
                this.dashboard.selectedFilter = '';
            };

            this.getGaugeData = function () {
                var advertiserId = advertiserModel.getSelectedAdvertiser().id,
                    brandId = brandsModel.getSelectedBrand().id,
                    clientId = subAccountModel.getDashboardAccountId(),

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
