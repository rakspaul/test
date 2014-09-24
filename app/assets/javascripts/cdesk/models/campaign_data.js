(function () {
  "use strict";
  var CampaignCDBData = function() {
    this.id = 0;
    this.name = '';
    this.impressions = 0;
    this.clicks = 0;
    this.gross_rev = 0;
    this.ctr = 0;
    this.cpm = 0;
    this.cpc = 0;
    this.cpa = 0;
    this.spend = 0;

    this.getGrossRev = function() {
      return Math.round(this.gross_rev*100)/100;
    }
  }
  angObj.value('CampaignData',CampaignCDBData);
}());