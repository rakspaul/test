(function () {
  "use strict";
  var gauge = function (utils, urlService, timePeriodModel, dataService, brandsModel, requestCanceller, constants) {
    this.dashboard = {selectedFilter: ''};
    this.resetDashboardFilters = function() {
      this.dashboard.selectedFilter = '';
    }
    this.getGaugeData = function () {
      var url = urlService.APICampaignCountsSummary(timePeriodModel.timeData.selectedTimePeriod.key, brandsModel.getSelectedBrand().id);
      var canceller = requestCanceller.initCanceller(constants.GAUGE_CANCELLER);
      return dataService.fetchCancelable(url, canceller, function(response) {
        var active = response.data.data.active;
        var completed = response.data.data.completed;
        var na = response.data.data.na ;
        var totalCampaigns = active.total + completed.total + na.total ;
        var onTrack = active.ontrack + completed.ontrack + na.ontrack ;
        var underPerforming = active.underperforming + completed.underperforming + na.underperforming ;


        var pct = 0;
        if(totalCampaigns > 0) {
          pct = Math.round(onTrack / totalCampaigns * 100);
        }
        return pct;
      })
    }
  }
  commonModule.service('gaugeModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants', gauge]);
}());