(function () {
  "use strict";
  var CampaignModel = function () {
    this.orderId = -1;
    this.periodStartDate = '';
    this.periodEndDate = '';
    this.startDate = '';
    this.fromSuffix = '';
    this.endDate = '';
    this.toSuffix = '';
    this.campaignTitle = '';
    this.brandName = '';
    this.status = '';
    this.statusIcon = '';
    this.kpiType = '';
    this.kpiValue = '';
    this.totalImpressions = -1;
    this.totalMediaCost = -1;
    this.expectedMediaCost = -1;
    this.lineitemsCount = -1;
    this.actionsCount = -1;
    this.campaignStrategies = -1;
    this.tacticMetrics = [];
    this.chart = true;
    this.campaignStrategiesLoadMore = null;

  }
  commonModule.value('campaignModel', CampaignModel);
}());