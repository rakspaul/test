(function () {
  "use strict";
  var CampaignCDBData = function () {
    this.id = 0;
    this.impressions = 0;
    this.clicks = 0;
    this.gross_rev = 0;
    this.ctr = 0;
    this.cpm = 0;
    this.vtc = 0;
    this.cpc = 0;
    this.cpa = 0;
    this.spend = 0;
    this.action_rate = 0;

    this.getGrossRev = function () {
      return this.roundOff(this.gross_rev, 2);
    }

    this.getCPA = function () {
      return this.roundOff(this.cpa, 2);
    }

    this.getActionRate = function () {
      return this.roundOff(this.action_rate, 2)
    }
    this.getCTR = function () {
      return this.roundOff(this.ctr, 2);
    }
    this.map = function (value) {
      if(value == 'ctr') {
          return this[value];
      }
      return this[value];
    }
    this.roundOff = function (value, places) {
      var factor = Math.pow(10, places);
      return Math.round(value * factor) / factor;
    }
  }
  commonModule.value('campaignCDBData', CampaignCDBData);
}());