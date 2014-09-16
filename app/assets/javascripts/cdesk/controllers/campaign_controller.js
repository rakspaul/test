/*global angObj*/
(function () {
    'use strict';

    angObj.controller('CampaignsController', function($scope, Campaigns) {
      $scope.campaigns = new Campaigns();
    });


    angObj.factory("Campaigns", function ($http, dataService, campaign) {

      var Campaigns = function() {
        this.campaignList = [];
        this.busy = false;
        this.timePeriod = "last_week";
        this.marketerName;
        this.nextPage = 1;

        this.reset = function() {
          this.campaignList = [];
          this.busy = false;
          this.timePeriod = "last_week";
          this.nextPage = 1;
        }
      };

      Campaigns.prototype.fetchCampaigns = function() {
        if(this.busy) {
          console.log('returning as the service is busy: ' + this.timePeriod);
          return;
        }
        this.busy = true;
        console.log('fetching campaigns');
        var self = this;
        dataService.getCampaignActiveInactive(this.nextPage, this.timePeriod).then(function(result) {
          self.nextPage += 1;
          self.marketerName = result.data.marketer_name;
          self.busy = false;
          if (result.data.orders.length > 0) {
            angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders), function(c, key) {
              this.push(c);
            }, self.campaignList);
          }
        });
      },

      Campaigns.prototype.fetchLastWeekCampaigns = function() {
        console.log('fetchLastWeekCampaigns');
        this.reset();
        this.timePeriod = "last_week";
        Campaigns.prototype.fetchCampaigns.call(this);
      },

      Campaigns.prototype.fetchLastMonthCampaigns = function() {
        console.log('fetchLastMonthCampaigns');
        this.reset();
        this.timePeriod = "last_month";
        Campaigns.prototype.fetchCampaigns.call(this);
      };

      return Campaigns;
    });

}());