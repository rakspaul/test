(function () {
  "use strict";
  var gauge = function (utils, urlService, timePeriodModel, dataService) {
    this.getGaugeData = function () {
      var url = urlService.APICampaignCountsSummary(timePeriodModel.timeData.selectedTimePeriod.key);
      return dataService.fetch(url).then(function(response) {
        var active = response.data.data.active;
        var ontrack = active.ontrack;
        var underperforming = active.underperforming;
        var total = ontrack + underperforming;
        var pct = Math.round(ontrack/total*100);
        return pct;
      })
    }
  }
  commonModule.service('gaugeModel', ['utils', 'urlService', 'timePeriodModel', 'dataService', gauge]);
}());