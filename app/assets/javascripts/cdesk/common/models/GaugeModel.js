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
        var ontrack = active.ontrack;
        var total = active.total;
        var pct = 0;
        if(total > 0) {
          pct = Math.round(ontrack / total * 100);
        }
        return pct;
      })
    }
  }
  commonModule.service('gaugeModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', 'brandsModel', 'requestCanceller', 'constants', gauge]);
}());