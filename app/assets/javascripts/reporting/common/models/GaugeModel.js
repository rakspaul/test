(function () {
  "use strict";
  var gauge = function (utils, urlService, timePeriodModel, dashboardModel, dataService, loginModel, advertiserModel, brandsModel, requestCanceller, constants) {
    this.dashboard = {selectedFilter: ''};
    this.resetDashboardFilters = function() {
      this.dashboard.selectedFilter = '';
    }
    this.getGaugeData = function () {
      var clientId = loginModel.getSelectedClient().id;
      var advertiserId = advertiserModel.getSelectedAdvertiser().id;
      var brandId = brandsModel.getSelectedBrand().id;
      var campaignStatus = dashboardModel.getData().selectedStatus;

      var url = urlService.APICampaignCountsSummary(timePeriodModel.timeData.selectedTimePeriod.key, clientId, advertiserId, brandId, campaignStatus);
      //var canceller = requestCanceller.initCanceller(constants.GAUGE_CANCELLER);
      return dataService.fetch(url).then(function(response) {
        var active = response.data.data.active;
        var completed = response.data.data.completed;
        var na = response.data.data.na ;
        var ready = response.data.data.ready , draft = response.data.data.draft, paused = response.data.data.paused ;

        var totalCampaigns = active.total + completed.total + na.total + ready + draft + paused ;
        var onTrack = active.ontrack + completed.ontrack + na.ontrack ;
        var underPerforming = active.underperforming + completed.underperforming + na.underperforming ;
        var others = active.others + completed.others + na.others ;


        var pct = 0;
        if((onTrack + underPerforming) > 0) {
          pct = Math.round(onTrack / (onTrack + underPerforming) * 100);
        }
        return {
            onTrackPct : pct,
            onTrack : onTrack,
            underPerforming : underPerforming,
            others : others,
            totalCampaigns : totalCampaigns,
            campaignsFoundForSetKPI: (onTrack + underPerforming) > 0?true:false
            //campaignsFound:totalCampaigns>0?true:false
        };
      })
    }
  }
  commonModule.service('gaugeModel', ['utils', 'urlService', 'timePeriodModel', 'dashboardModel' , 'dataService', 'loginModel', 'advertiserModel', 'brandsModel', 'requestCanceller', 'constants', gauge]);
}());