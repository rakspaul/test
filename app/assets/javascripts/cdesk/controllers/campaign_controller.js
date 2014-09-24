/*global angObj*/
(function () {
    'use strict';

    angObj.controller('CampaignsController', function($scope, Campaigns) {
      $scope.campaigns = new Campaigns();
    });


    angObj.factory("Campaigns", function ($http, dataService, campaign, campaign_api, modelTransformer, CampaignData) {

      var Campaigns = function() {
        this.timePeriodList = buildTimePeriodList();
        this.selectedTimePeriod = this.timePeriodList[0];
        this.displayTimePeriod = angular.uppercase(this.timePeriodList[0].display);
        this.sortFieldList = buildSortFieldList();

        this.cdbDataMap = {}
        this.campaignList = [];
        this.busy = false;
        this.timePeriod = "last_week";
        this.marketerName;
        this.nextPage = 1;
        this.sortParam = 'start_date';
        this.sortDirection = 'desc';
        this.totalPages;
        this.totalCount;
        this.brandId = 0;

        this.reset = function() {
          this.campaignList = [];
          this.busy = false;
          this.timePeriod = "last_week";
          this.nextPage = 1;
          this.brandId = 0;
          this.sortParam = undefined;
          this.sortDirection = undefined;
          this.totalPages = undefined;
        };

        this.resetFilters = function() {
          this.campaignList = [];
          this.busy = false;
          this.nextPage = 1;
          this.sortParam = 'start_date';
          this.sortDirection = 'desc';
          this.totalPages = undefined;
          this.totalCount = undefined;
        };

        this.resetSortParams = function() {
          this.campaignList = [];
          this.busy = false;
          this.nextPage = 1;
          this.sortParam = undefined;
          this.sortDirection = undefined;
          this.totalPages = undefined;
          this.totalCount = undefined;
        };
      };

      Campaigns.prototype.fetchCampaigns = function() {
        if(this.busy) {
          console.log('returning as the service is busy: ' + this.timePeriod);
          return;
        }
        if(this.totalPages && (this.totalPages + 1) == this.nextPage) {
          console.log('returning as all the campaigns are displayed');
          return;
        }

        this.busy = true;
        var self = this, url = Campaigns.prototype._campaignServiceUrl.call(this);
        console.log('fetching campaigns: ' + url);
        dataService.getCampaignActiveInactive(url).then(function(result) {
          self.nextPage += 1;
          self.marketerName = result.data.marketer_name;
          self.totalPages = result.data.total_pages;
          self.totalCount = result.data.total_count;
          self.busy = false;
          if (result.data.orders.length > 0) {
            angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders, timePeriodApiMapping(self.timePeriod)), function(c, key) {
              this.push(c);
            }, self.campaignList);
          }
          var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
          angular.forEach(result.data.orders, function(value) {
            dataService.getCampaignData(cdbApiKey,value.id).then(function (response) {
              self.cdbDataMap[value.id] = modelTransformer.transform(response.data.data, CampaignData);
            })
          });
        }, function(result) {
          //failure
          self.busy = false;
          self.totalCount = 0;
        });
      },

      Campaigns.prototype.filterByTimePeriod = function(timePeriod) {
        this.selectedTimePeriod = timePeriod;
        this.displayTimePeriod = angular.uppercase(timePeriod.display);

        $("#cdbDropdown").toggle();
        this.timePeriodList.forEach(function (period) {
          if(period == timePeriod) {
            period.className = 'active';
          } else {
            period.className = '';
          }
        });

        ga('send', 'event', 'time-period-filter', 'click', this.displayTimePeriod);

        Campaigns.prototype._applyFilters.call(this, {timePeriod: timePeriod.key});
      },

      Campaigns.prototype.filterByBrand = function(brand) {
        $("#cdbDropdown").toggle();
        if(brand != undefined) {
          ga('send', 'event', 'brand-filter', 'click', brand.name);

          Campaigns.prototype._applyFilters.call(this, {brand: brand.id});
        }
      },

      Campaigns.prototype.sortCampaigns = function(fieldName) {
        if(this.sortParam) {
          if(this.sortParam == fieldName) {
            var sortDirection = toggleSortDirection(this.sortDirection);
            this.resetSortParams();
            this.sortDirection = sortDirection;
          } else {
            this.resetSortParams();
          }
        } else {
          this.resetSortParams();
        }
        !this.sortDirection && (this.sortDirection = 'asc');
        this.sortParam = fieldName;
        this.sortFieldList.forEach(function (field) {
          if(fieldName == field.key) {
            field.className = 'active';
          } else {
            field.className = '';
          }
        });

        ga('send', 'event', 'sort', 'click', this.sortParam + '-' + this.sortDirection);

        Campaigns.prototype.fetchCampaigns.call(this);
      },

      Campaigns.prototype.sortIcon = function(fieldName) {

        if (this.sortParam == fieldName) {
          return this.sortDirection == 'asc' ? 'ascending' : 'descending';
        } else {
          return '';
        }
      },

      Campaigns.prototype.editCampaign = function(campaign, placement) {
        ga('send', 'event', placement, 'click', campaign.campaignTitle);
        window.location = "campaigns/" + campaign.orderId;
      },

      Campaigns.prototype.campaignReports = function(campaign) {
        ga('send', 'event', 'campaign-report', 'click', campaign.campaignTitle);
        window.location = "reports/reports/" + campaign.orderId;

      },

      Campaigns.prototype._applyFilters = function(filters) {
        console.log('filter campaigns: ' + JSON.stringify(filters));
        if(filters == undefined) {
          return;
        }
        this.resetFilters();
        filters.brand && (this.brandId = filters.brand);
        filters.timePeriod && (this.timePeriod = filters.timePeriod);
        Campaigns.prototype.fetchCampaigns.call(this);
      },

      Campaigns.prototype._campaignServiceUrl = function() {
        var params = [
                    'filter[date_filter]=' + this.timePeriod,
                    'page=' + this.nextPage,
                    'callback=JSON_CALLBACK'
        ];
        this.brandId > 0 && params.push('filter[advertiser_filter]=' + this.brandId);
        this.sortParam && params.push('sort_column=' + this.sortParam);
        this.sortDirection && params.push('sort_direction=' + this.sortDirection);
        return campaign_api + '/campaigns.js?' + params.join('&');
      };


      var toggleSortDirection = function(dir) {
        if(dir == 'asc') {
          return 'desc';
        }
        return 'asc';
      },

      buildSortFieldList = function() {
        return [
          {display: 'Campaign', key: 'order_name'},
          {display: 'Advertiser', key: 'advertiser'},
          {display: 'Flight dates', key: 'start_date', className: 'active'}
        ];
      },

      buildTimePeriodList = function() {
        return [createTimePeriodObject('Last 7 days', 'last_week', 'active'),
          createTimePeriodObject('Last 30 days', 'last_month'),
          createTimePeriodObject('Lifetime', 'life_time')];

      },

      createTimePeriodObject = function(display, key, className) {
        var obj = {"display": display, "key": key};
        obj.className = (className == undefined ? '' : className);
        return obj;
      };

      var timePeriodApiMapping = function(key) {
        var apiObj = { 'last_week' : 'last_7_days', 'last_month' : 'last_30_days', 'life_time' : 'lifetime' };
        return apiObj[key];
      };

      return Campaigns;
    });

}());