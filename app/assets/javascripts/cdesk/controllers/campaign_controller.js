/*global angObj*/
(function() {
    'use strict';

    angObj.controller('CampaignsController', function($scope, Campaigns, utils, $location, _) {
      $scope.campaigns = new Campaigns();
      
      $scope.campaigns.fetchDashboardData();
      
      $scope.$on("fromCampaignDetails", function(event, args) {
        $scope.loadMoreStrategies(args.campaignId);
      });

      $scope.loadMoreStrategies = function(campaignId) {
        var pageSize = 3;
        var campaign = _.find($scope.campaigns.campaignList, function(c) {
          return c.orderId === parseInt(campaignId);
        });
        var loadMoreData = campaign.campaignStrategiesLoadMore;
        if (loadMoreData.length) {
          var moreData = loadMoreData.splice(0, pageSize);
          _.each(moreData, function(s) {
            campaign.campaignStrategies.push(s);
          });
        }
      };

      $scope.loadMoreTactics = function(strategyId, campaignId) {
        var pageSize = 3;
        var campaign = _.find($scope.campaigns.campaignList, function(c) {
          return c.orderId === parseInt(campaignId);
        });

        var strategy = _.find(campaign.campaignStrategies, function(s) {
          return s.id === parseInt(strategyId);
        });

        var loadMoreData = strategy.strategyTacticsLoadMore;
        if (loadMoreData.length) {
          var moreData = loadMoreData.splice(0, pageSize);
          _.each(moreData, function(t) {
            strategy.strategyTactics.push(s);
          });
        }
      };

      $scope.goToLocation = function(url) {
        utils.goToLocation(url);
      };
    });


    angObj.factory("Campaigns", function($http, dataService, campaign, apiPaths, modelTransformer, CampaignData) {

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
            this.dashboard = {
                filterActive : '(active,underperforming)',
                filterReady : undefined,
                filterDraft : undefined,
                filterCompleted : undefined,
                status : {
                    active : {
                        underperforming : 'active',
                        ontrack : ''
                    },
                    pending : {
                        draft : '',
                        ready : ''
                    },
                    completed : {
                        underperforming : '',
                        ontrack : ''
                    }
                }
            };
            this.resetDasboard = function() {
                this.campaignList = [];
                this.busy = false;
                this.timePeriod = 'life_time';
                this.nextPage = 1;
                //this.brandId = 0;
                this.sortParam = undefined;
                this.sortDirection = undefined;
                this.totalPages = undefined;
            };

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
                if (this.busy) {
                    console.log('returning as the service is busy: ' + this.timePeriod);
                    return;
                }
                if (this.totalPages && (this.totalPages + 1) == this.nextPage) {
                    console.log('returning as all the campaigns are displayed');
                    return;
                }

                this.busy = true;
                var self = this,
                    url = Campaigns.prototype._campaignServiceUrl.call(this);
                console.log('fetching from new campaigns api: ' + url);
                dataService.getCampaignActiveInactive(url).then(function(result) {
                    self.nextPage += 1;
                    self.marketerName = result.data.marketer_name;
                    self.totalPages = result.data.total_pages;
                    self.totalCount = result.data.total_count;
                    self.periodStartDate = result.data.period_start_date;
                    self.periodEndDate = result.data.period_end_date;

                    self.busy = false;
                    if (result.data.orders.length > 0) {
                        var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
                        angular.forEach(campaign.setActiveInactiveCampaigns(result.data.orders, timePeriodApiMapping(self.timePeriod), self.timePeriod, self.periodStartDate, self.periodEndDate), function(campaign) {
                            this.push(campaign);
                            dataService.getCampaignData(cdbApiKey, campaign).then(function(response) {
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

            Campaigns.prototype.fetchDashboardData = function() {
                var url = apiPaths.apiSerivicesUrl + '/desk/campaigns/summary/counts?user_id=' + user_id + '&date_filter=' + this.timePeriod,
                    self = this;
                //applying brand filter if active
                if(this.brandId > 0) {
                    url += '&advertiser_filter=' + this.brandId;
                }

                dataService.getCampaignDashboardData(url).then(function(result) {
                    if(result.status == "success" && !angular.isString(result.data)){
                        self.dashboard.pending = {
                            total : result.data.data.draft + result.data.data.ready,
                            draft : result.data.data.draft,
                            ready :  result.data.data.ready
                        };
                        self.dashboard.active = {
                            total : result.data.data.active.ontrack + result.data.data.active.underperforming,
                            ontrack : result.data.data.active.ontrack,
                            underperforming :  result.data.data.active.underperforming
                        };
                        self.dashboard.completed = {
                            total : result.data.data.completed.ontrack + result.data.data.completed.underperforming,
                            ontrack : result.data.data.completed.ontrack,
                            underperforming :  result.data.data.completed.underperforming
                        };
                        self.dashboard.total =  self.dashboard.pending.total +
                                                self.dashboard.active.total +
                                                self.dashboard.completed.total;

                    }
                });


            },

            Campaigns.prototype.dashboardFilter = function(type, state) {

                this.resetDasboard();
                
                if (type == 'pending' && state == "draft") {

                    if (this.dashboard.status.pending.draft == 'active') {
                        this.dashboard.filterDraft = undefined;
                        this.dashboard.status.pending.draft = '';
                    } else {
                        this.dashboard.filterDraft = '(draft)';
                        this.dashboard.status.pending.draft = 'active';
                    }

                } else if (type == 'pending' && state == "ready") {

                    if (this.dashboard.status.pending.ready == 'active') {
                        this.dashboard.filterReady = undefined;
                        this.dashboard.status.pending.ready = '';
                    } else {
                        this.dashboard.filterReady = '(ready)';
                        this.dashboard.status.pending.ready = 'active';
                    }

                } else if ((type == 'active' && state == "ontrack") || (type == 'active' && state == "underperforming")) {

                    if (state == "ontrack" && this.dashboard.status.active.underperforming == '') {
                        if (this.dashboard.status.active.ontrack == 'active' && this.dashboard.status.active.underperforming == '') {
                            this.dashboard.filterActive = undefined;
                            this.dashboard.status.active.ontrack = '';
                        } else if (this.dashboard.status.active.ontrack == 'active') {
                            this.dashboard.filterActive = '(active,underperforming)';
                            this.dashboard.status.active.ontrack = '';
                        } else {
                            this.dashboard.filterActive = '(active,onTrack)';
                            this.dashboard.status.active.ontrack = 'active';
                        }

                    } else if (state == "ontrack" && this.dashboard.status.active.underperforming == 'active') {

                        if (this.dashboard.status.active.ontrack == 'active' && this.dashboard.status.active.underperforming == '') {
                            this.dashboard.filterActive = undefined;
                            this.dashboard.status.active.ontrack = '';
                        } else if (this.dashboard.status.active.ontrack == 'active') {
                            this.dashboard.filterActive = '(active,underperforming)';
                            this.dashboard.status.active.ontrack = '';
                        } else {
                            this.dashboard.filterActive = '(active)';
                            this.dashboard.status.active.ontrack = 'active';
                        }

                    } else if (state == "underperforming" && this.dashboard.status.active.ontrack == '') {

                        if (this.dashboard.status.active.underperforming == 'active' && this.dashboard.status.active.ontrack == '') {
                            this.dashboard.filterActive = undefined;
                            this.dashboard.status.active.underperforming = '';
                        } else if (this.dashboard.status.active.underperforming == 'active') {
                            this.dashboard.filterActive = '(active,onTrack)';
                            this.dashboard.status.active.underperforming = '';
                        } else {
                            this.dashboard.filterActive = '(active,underperforming)';
                            this.dashboard.status.active.underperforming = 'active';
                        }

                    } else if (state == "underperforming" && this.dashboard.status.active.ontrack == 'active') {

                        if (this.dashboard.status.active.underperforming == 'active' && this.dashboard.status.active.ontrack == '') {
                            this.dashboard.filterActive = undefined;
                            this.dashboard.status.active.underperforming = '';
                        } else if (this.dashboard.status.active.underperforming == 'active') {
                            this.dashboard.filterActive = '(active,onTrack)';
                            this.dashboard.status.active.underperforming = '';
                        } else {
                            this.dashboard.filterActive = '(active)';
                            this.dashboard.status.active.underperforming = 'active';
                        }


                    }

                } else if ((type == 'completed' && state == "ontrack") || (type == 'completed' && state == "underperforming")) {

                    if (state == "ontrack" && this.dashboard.status.completed.underperforming == '') {

                        if (this.dashboard.status.completed.ontrack == 'active' && this.dashboard.status.completed.underperforming == '') {
                            this.dashboard.filterCompleted = undefined;
                            this.dashboard.status.completed.ontrack = '';
                        } else if (this.dashboard.status.completed.ontrack == 'active') {
                            this.dashboard.filterCompleted = '(completed,underperforming)';
                            this.dashboard.status.completed.ontrack = '';
                        } else {
                            this.dashboard.filterCompleted = '(completed,onTrack)';
                            this.dashboard.status.completed.ontrack = 'active';
                        }

                    } else if (state == "ontrack" && this.dashboard.status.completed.underperforming == 'active') {

                        if (this.dashboard.status.completed.ontrack == 'active' && this.dashboard.status.completed.underperforming == '') {
                            this.dashboard.filterCompleted = undefined;
                            this.dashboard.status.completed.ontrack = '';
                        } else if (this.dashboard.status.completed.ontrack == 'active') {
                            this.dashboard.filterCompleted = '(completed,underperforming)';
                            this.dashboard.status.completed.ontrack = '';
                        } else {
                            this.dashboard.filterCompleted = '(completed)';
                            this.dashboard.status.completed.ontrack = 'active';
                        }

                    } else if (state == "underperforming" && this.dashboard.status.completed.ontrack == '') {
                        if (this.dashboard.status.completed.underperforming == 'active' && this.dashboard.status.completed.ontrack == '') {
                            this.dashboard.filterCompleted = undefined;
                            this.dashboard.status.completed.underperforming = '';
                        } else if (this.dashboard.status.completed.underperforming == 'active') {
                            this.dashboard.filterCompleted = '(completed,onTrack)';
                            this.dashboard.status.completed.underperforming = '';
                        } else {
                            this.dashboard.filterCompleted = '(completed,underperforming)';
                            this.dashboard.status.completed.underperforming = 'active';
                        }

                    } else if (state == "underperforming" && this.dashboard.status.completed.ontrack == 'active') {
                        if (this.dashboard.status.completed.underperforming == 'active' && this.dashboard.status.completed.ontrack == '') {
                            this.dashboard.filterCompleted = undefined;
                            this.dashboard.status.completed.underperforming = '';
                        } else if (this.dashboard.status.completed.underperforming == 'active') {
                            this.dashboard.filterCompleted = '(completed,onTrack)';
                            this.dashboard.status.completed.underperforming = '';
                        } else {
                            this.dashboard.filterCompleted = '(completed)';
                            this.dashboard.status.completed.underperforming = 'active';
                        }

                    }


                }

                //get the campaign list 
                this.campaignList = [];
                Campaigns.prototype.fetchCampaigns.call(this);
            },

            Campaigns.prototype.filterByTimePeriod = function(timePeriod) {
                this.selectedTimePeriod = timePeriod;
                this.displayTimePeriod = angular.uppercase(timePeriod.display);

                $("#cdbDropdown").toggle();
                this.timePeriodList.forEach(function(period) {
                    if (period == timePeriod) {
                        period.className = 'active';
                    } else {
                        period.className = '';
                    }
                });

                ga('send', 'event', 'time-period-filter', 'click', this.displayTimePeriod);

                Campaigns.prototype._applyFilters.call(this, {
                    timePeriod: timePeriod.key
                });

            },

            Campaigns.prototype.filterByBrand = function(brand) {
                $("#cdbDropdown").toggle();
                if (brand != undefined) {
                    ga('send', 'event', 'brand-filter', 'click', brand.name);

                    Campaigns.prototype._applyFilters.call(this, {
                        brand: brand.id
                    });
                }
            },

            Campaigns.prototype.sortCampaigns = function(fieldName) {
                if (this.sortParam) {
                    if (this.sortParam == fieldName) {
                        var sortDirection = toggleSortDirection(this.sortDirection);
                        this.resetSortParams();
                        this.sortDirection = sortDirection;
                    } else {
                        this.resetSortParams();
                    }
                } else {
                    this.resetSortParams();
                }!this.sortDirection && (this.sortDirection = 'asc');
                this.sortParam = fieldName;
                this.sortFieldList.forEach(function(field) {
                    if (fieldName == field.key) {
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
                ga('send', 'event', 'edit-campaign', 'click', campaign.campaignTitle, {
                    'hitCallback': function() {
                        document.location = "campaigns#/campaigns/" + campaign.orderId;
                    }
                });
            },

            Campaigns.prototype.campaignReports = function(campaign) {
                ga('send', 'event', 'campaign-report', 'click', campaign.campaignTitle, {
                    'hitCallback': function() {
                        document.location = "reports/reports/" + campaign.orderId;
                    }
                });
            }

            Campaigns.prototype.durationLeft = function(campaign) {
                if(campaign !== undefined) {
                    if (moment() < moment(campaign.startDate)) {
                        //campaign yet to start
                        return 0;
                    }
                    if (moment(campaign.endDate) < moment()) {
                        //campaign ended
                        return -1;
                    }
                    return moment(campaign.endDate).diff(moment(), 'days');
                }
            },

            Campaigns.prototype.durationCompletion = function(campaign) {
                if(campaign !== undefined) {
                    var totalDays = moment(campaign.endDate).diff(moment(campaign.startDate), 'days'),
                        daysOver = moment().diff(moment(campaign.startDate), 'days');

                    return Math.round((daysOver / totalDays) * 100);
                }
            },

            Campaigns.prototype._applyFilters = function(filters) {
                console.log('filter campaigns: ' + JSON.stringify(filters));
                if (filters == undefined) {
                    return;
                }
                this.resetFilters();
                filters.brand && (this.brandId = filters.brand);
                filters.timePeriod && (this.timePeriod = filters.timePeriod);
    
                Campaigns.prototype.fetchDashboardData.call(this); //populating dashboard filter with new data
                Campaigns.prototype.fetchCampaigns.call(this);
            },

            Campaigns.prototype._campaignServiceUrl = function() {
                var params = [
                    'date_filter=' + this.timePeriod,
                    'page=' + this.nextPage,
                    'callback=JSON_CALLBACK'
                ];
                this.brandId > 0 && params.push('advertiser_filter=' + this.brandId);
                this.sortParam && params.push('sort_column=' + this.sortParam);
                this.sortDirection && params.push('sort_direction=' + this.sortDirection);
                this.dashboard.filterActive && params.push('conditions=' + this.dashboard.filterActive);
                this.dashboard.filterReady && params.push('conditions=' + this.dashboard.filterReady);
                this.dashboard.filterDraft && params.push('conditions=' + this.dashboard.filterDraft);
                this.dashboard.filterCompleted && params.push('conditions=' + this.dashboard.filterCompleted);
                return apiPaths.apiSerivicesUrl + '/desk/campaigns/bystate?user_id='+user_id+'&' + params.join('&');
            };

        var toggleSortDirection = function(dir) {
                if (dir == 'asc') {
                    return 'desc';
                }
                return 'asc';
            },

            buildSortFieldList = function() {
                return [{
                    display: 'Campaign',
                    key: 'order_name'
                }, {
                    display: 'Brand',
                    key: 'advertiser'
                }, {
                    display: 'Flight dates',
                    key: 'start_date',
                    className: 'active'
                }];
            },

            buildTimePeriodList = function() {
                return [createTimePeriodObject('Last 7 days', 'last_week'),
                    createTimePeriodObject('Last 30 days', 'last_month'),
                    createTimePeriodObject('Lifetime', 'life_time', 'active')
                ];

            },

            createTimePeriodObject = function(display, key, className) {
                var obj = {
                    "display": display,
                    "key": key
                };
                obj.className = (className == undefined ? '' : className);
                return obj;
            };

        var timePeriodApiMapping = function(key) {
            var apiObj = {
                'last_week': 'last_7_days',
                'last_month': 'last_30_days',
                'life_time': 'lifetime'
            };
            return apiObj[key];
        };

        return Campaigns;
    });
    //Hot fix to show the campaign tab selected
    //$("ul.nav:first").find('.active').removeClass('active').end().find('li:first').addClass('active');
}());