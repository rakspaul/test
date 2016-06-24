define(['angularAMD', 'common/services/url_service', 'reporting/dashboard/dashboard_model', 'common/services/data_service', 'reporting/brands/brands_model', 'common/services/request_cancel_service', 'common/services/constants_service', 'login/login_model', 'reporting/advertiser/advertiser_model', 'reporting/subAccount/sub_account_model'], function (angularAMD) {
    'use strict';
    angularAMD.service('gaugeModel', ['urlService', 'dashboardModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants', 'loginModel', 'advertiserModel', 'subAccountModel', '$routeParams',
        function (urlService, dashboardModel, dataService, brandsModel, requestCanceller, constants, loginModel, advertiserModel, subAccountModel, $routeParams) {

        this.dashboard = {selectedFilter: ''};
        this.resetDashboardFilters = function () {
            this.dashboard.selectedFilter = '';
        }
        this.getGaugeData = function () {
            var advertiserId = advertiserModel.getSelectedAdvertiser().id;
            var brandId = brandsModel.getSelectedBrand().id;
            // var clientId = subAccountModel.getDashboardAccountId();
            var clientId = $routeParams.subAccountId || $routeParams.accountId;
            var url = urlService.APICampaignCountsSummary(constants.PERIOD_LIFE_TIME, clientId, advertiserId, brandId, dashboardModel.campaignStatusToSend());
            //var canceller = requestCanceller.initCanceller(constants.GAUGE_CANCELLER);

            return dataService.fetch(url).then(function (response) {
                var active = response.data.data.active;
                var completed = response.data.data.completed;
                var na = response.data.data.na;
                var ready = response.data.data.ready, draft = response.data.data.draft, paused = response.data.data.paused;

                var totalCampaigns = active.total + completed.total + na.total + ready + draft + paused;
                var onTrack = active.ontrack + completed.ontrack + na.ontrack;
                var underPerforming = active.underperforming + completed.underperforming + na.underperforming;
                var others = active.others + completed.others + na.others;


                var pct = 0;
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
                    //campaignsFound:totalCampaigns>0?true:false
                };
            })
        }
    }]);
});
