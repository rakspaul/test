/*global angObj*/
(function () {
    'use strict';

    angObj.controller('CampaignsController', function($scope, Campaigns, utils) {
      $scope.campaigns = new Campaigns();
      
      $scope.showStrategies = function(campaignId, strategiesCount) {
        if(strategiesCount > 0) {
          $('#strategies-accordion-' + campaignId).toggle();
        }          
      };

      $scope.loadMoreStrategies = function(campaignId) {
          var campaignArray = $scope.campaigns.campaignList, pageSize = 3;
          for(var index in campaignArray) {
            if(campaignArray[index].orderId === parseInt(campaignId)){
              var loadMoreData = campaignArray[index].campaignStrategiesLoadMore;
              if(loadMoreData.length) {
                var moreData = loadMoreData.splice(0, pageSize)
                for(var len=0; len < moreData.length; len++){
                    $scope.campaigns.campaignList[index].campaignStrategies.push(moreData[len]);   
                } 
              }
            }
          }          
      };

      $scope.getSpendDifference = function(campaign) {
        var spendDifference = 0;
        var campaignCDBObj = $scope.campaigns.cdbDataMap[campaign.orderId];
        if(campaignCDBObj == undefined) {
          return spendDifference;
        }
        var spend = campaignCDBObj.getGrossRev();
        var expectedSpend = campaign.expectedMediaCost;
        return $scope.getPercentDiff(expectedSpend, spend);
      };
      $scope.getPercentDiff = function(expected, actual) {
        var spendDifference = 0;
        if(expected == 0) {
          spendDifference = 0;
        } else {
          spendDifference = utils.roundOff((actual - expected) * 100 / expected, 2)
        }
        return spendDifference;
      }
      $scope.getSpendDiffForStrategy = function (strategy) {
        if(strategy == undefined) {
          return 0;
        }
        var expectedSpend = strategy.expectedMediaCost;
        return $scope.getPercentDiff(expectedSpend, strategy.grossRev)
      }
      $scope.getSpendClass = function(campaign) {
        var spendDifference = $scope.getSpendDifference(campaign);
        return $scope.getClassFromDiff(spendDifference);
      };
      $scope.getSpendClassForStrategy = function(strategy) {
        var spendDifference = $scope.getSpendDiffForStrategy(strategy);
        return $scope.getClassFromDiff(spendDifference);
      }
      $scope.getClassFromDiff = function(spendDifference) {
        if(spendDifference > -1) {
          return 'blue';
        }
        if(spendDifference <= -1 && spendDifference > -10) {
          return 'amber';
        }
        return 'red';
      }
      $scope.getSpendWidth = function(campaign) {
        var actualWidth = 100 + $scope.getSpendDifference(campaign);
        if(actualWidth > 100) {
          actualWidth = 100;
        }
        return actualWidth;
      }
      $scope.getSpendWidthForStrategy = function(strategy) {
        var actualWidth = 100 + $scope.getSpendDiffForStrategy(strategy);
        if(actualWidth > 100) {
          actualWidth = 100;
        }
        return actualWidth;
      }
    });


    angObj.factory("Campaigns", function ($http, dataService, campaign, campaign_api, modelTransformer, CampaignData) {

      var Campaigns = function() {
        this.timePeriodList = buildTimePeriodList();
        this.selectedTimePeriod = this.timePeriodList[2];
        this.displayTimePeriod = angular.uppercase(this.selectedTimePeriod.display);
        this.sortFieldList = buildSortFieldList();

        this.cdbDataMap = {}
        this.campaignList = [];
        this.busy = false;
        this.timePeriod = this.selectedTimePeriod.key;
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
          this.timePeriod = 'life_time';
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
            var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
            angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders, timePeriodApiMapping(self.timePeriod), self.timePeriod), function (campaign) {
              this.push(campaign);
              dataService.getCampaignData(cdbApiKey, campaign.orderId).then(function (response) {
                self.cdbDataMap[campaign.orderId] = modelTransformer.transform(response.data.data, CampaignData);
              })
            }, self.campaignList);
          }
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

      Campaigns.prototype.editCampaign = function(campaign) {
        ga('send', 'event', 'edit-campaign', 'click', campaign.campaignTitle, {'hitCallback':
          function () {
            document.location = "campaigns/" + campaign.orderId;
          }
        });
      },

      Campaigns.prototype.campaignReports = function(campaign) {
        ga('send', 'event', 'campaign-report', 'click', campaign.campaignTitle, {'hitCallback':
          function () {
            document.location = "reports/reports/" + campaign.orderId;
          }
        });
      }

      Campaigns.prototype.durationLeft = function(campaign) {
        if(moment() < moment(campaign.startDate)) {
          //campaign yet to start
          return 0;
        }
        if(moment(campaign.endDate) < moment()) {
          //campaign ended
          return -1;
        }
        return moment(campaign.endDate).diff(moment(), 'days');
      },

      Campaigns.prototype.durationCompletion = function(campaign) {
        var totalDays = moment(campaign.endDate).diff(moment(campaign.startDate), 'days'),
            daysOver = moment().diff(moment(campaign.startDate), 'days');

        return Math.round((daysOver / totalDays) * 100);
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
          {display: 'Brand', key: 'advertiser'},
          {display: 'Flight dates', key: 'start_date', className: 'active'}
        ];
      },

      buildTimePeriodList = function() {
        return [createTimePeriodObject('Last 7 days', 'last_week'),
          createTimePeriodObject('Last 30 days', 'last_month'),
          createTimePeriodObject('Lifetime', 'life_time', 'active')];

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