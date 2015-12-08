    //originally part of controllers/campaign_controller.js
    campaignListModule.factory("campaignListModel", ['$rootScope', '$http', '$location', 'dataService', 'campaignListService', 'apiPaths',
        'modelTransformer', 'campaignCDBData', 'campaignCost',
        'dataStore', 'requestCanceller', 'constants',
        'brandsModel', 'loginModel', 'analytics','RoleBasedService',
        function($rootScope, $http, $location, dataService, campaignListService, apiPaths,
            modelTransformer, campaignCDBData, campaignCost,
            dataStore, requestCanceller, constants,
            brandsModel, loginModel, analytics, RoleBasedService) {
            //var scrollFlag = 1;
            var Campaigns = function() {
                this.timePeriodList = buildTimePeriodList();
                this.selectedTimePeriod = this.timePeriodList[2];
                this.displayTimePeriod = angular.uppercase(this.selectedTimePeriod.display);
                this.sortFieldList = buildSortFieldList();
                this.cdbDataMap = {};
                this.campaignList = [];
                this.costBreakdownList = [];
                this.CBdownParams = {
                    totalPages: 0,
                    totalCount: 0,
                    nextPage: 1
                };
                this.tabActivation = {
                    "costTab": 0,
                    "performanceTab": 0
                };
                this.scrollFlag = 1;
                this.costList = {};
                this.costIds = '';
                this.selectedCostType = 'cpa';
                this.costDate = {
                    startDate: undefined,
                    endDate: undefined
                };

                //this.costMargin;
                this.busy = false;
                this.timePeriod = this.selectedTimePeriod.key;
                this.marketerName;
                this.nextPage = 1;
                this.sortParam = 'start_date';
                this.sortDirection = 'desc';
                this.totalPages;
                this.totalCount;
                this.brandId = brandsModel.getSelectedBrand().id;
                this.client_id=loginModel.getClientId();
                this.dashboard = {
                    filterTotal: 1,
                    filterSelectAll: false,
                    displayFilterSection: false,
                    busy: false,
                    pending: {
                        width: undefined
                    },
                    active: {
                        width: undefined,
                        ontrackWidth: undefined
                    },
                    completed: {
                        width: undefined,
                        ontrackWidth: undefined
                    },
                   // filterActive: '(active,underperforming)',
                    quickFilterSelected: getCapitalizeString(constants.ACTIVE),
                    quickFilterSelectedCount:0,
                    filterActive: constants.ACTIVE_CONDITION,
                    filterReady: undefined,
                    filterDraft: undefined,
                    filterCompleted: undefined,
                    status: {
                        active: {
                            bothItem: '',
                            underperforming: '',
                            ontrack: '',
                            endingSoon:''
                        },
                        pending: {
                            draft: '',
                            ready: ''
                        },
                        completed: {
                            underperforming: '',
                            ontrack: ''
                        }
                    }
                };

                //by default active filter will be applied - (active)
                this.appliedQuickFilter = constants.ACTIVE_CONDITION;
                this.appliedQuickFilterText = constants.ACTIVE_LABEL;
                this.dashboard.status.active.bothItem = constants.ACTIVE;

                this.resetFilters = function() {
                    this.campaignList = [];
                    this.timePeriod = 'life_time';
                    this.busy = false;
                    this.nextPage = 1;
                    this.sortParam = 'start_date';
                    this.sortDirection = 'desc';
                    this.totalPages = undefined;
                    this.dashboard.quickFilterSelectedCount = 0;
                    //this.brandId = brandsModel.getSelectedBrand().id;
                    this.resetCostBreakdown.call(this);
                };

                this.resetTabActivation = function() {
                    this.tabActivation = {
                        "costTab": 0,
                        "performanceTab": 0
                    };
                };
            };

            Campaigns.prototype = function() {
                var reloadGraphs = function() {
                        campaignListService.loadGraphs(this.campaignList, timePeriodApiMapping(this.selectedTimePeriod.key))
                    },
                    resetCostBreakdown = function() {
                        this.CBdownParams = {
                            nextPage: 1,
                            totalPages: 0
                        };
                        this.costBreakdownList = [];
                        this.resetTabActivation();
                    },
                    fetchData = function() {
                        if ($('#performance_tab').hasClass("active") == false && $('#cost_tab').hasClass("active") == false) {
                            $('#performance_tab').addClass("active");
                        }
                        if ($('#performance_tab').hasClass("active") == true) {
                            this.tabActivation.performanceTab = 1;
                            fetchCampaigns.call(this);
                        } else {
                            fetchCostBreakdown.call(this);
                        }
                    },
                    findScrollerFromContainer = function() {
                        var self = this;
                        $('.each_section_block').bind('scroll', function() {
                            self.scrollFlag = 1;
                        });
                    },
                    getData = function(from) {
                        $("#cost_tab,#performance_tab").removeClass("active");
                        $('#' + from).addClass("active");
                        this.scrollFlag = 1;
                        if (from == 'cost_tab') {
                            if (this.tabActivation.costTab == 0) { // if You click costbreakdown if tab is not activated  will fetch data.
                                fetchCostBreakdown.call(this);
                                this.tabActivation.costTab = 1;
                            }
                        } else {
                            if (this.tabActivation.performanceTab == 0) { // if You click performance if tab is not activated fetch data.
                                fetchCampaigns.call(this);
                                this.tabActivation.performanceTab = 1;
                            }
                        }
                    },

                    fetchCampaigns = function() {
                        findScrollerFromContainer.call(this); // check scoroller only inside container
                        if ((this.dashboard.filterTotal > 0) && (this.scrollFlag > 0)) {
                            this.scrollFlag = 0; //Reseting scrollFlag
                            if (this.totalPages && (this.totalPages + 1) == this.nextPage) {
                                return;
                            }
                            this.busy = true;
                            var self = this,
                                url = _campaignServiceUrl.call(this);
                            campaignListService.getCampaigns(url, function(result) {
                                requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);

                                var data = result.data.data;

                                self.nextPage += 1;
                                self.marketerName = data.marketer_name;
                                self.totalPages = data.total_pages;
                                self.periodStartDate = data.period_start_date;
                                self.periodEndDate = data.period_end_date;
                                self.dashboard.filterTotal = data.total_count;
                                self.dashboard.quickFilterSelectedCount = data.total_count;
                                self.busy = false;
                                if (data.orders.length > 0) {
                                    var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
                                    var campaignData = campaignListService.setActiveInactiveCampaigns(data.orders, timePeriodApiMapping(self.timePeriod), self.periodStartDate, self.periodEndDate)
                                    angular.forEach(campaignData, function(campaign) {
                                        this.push(campaign);
                                        //self.costIds += campaign.orderId + ',';
                                        //compareCostDates.call(self, campaign.startDate, campaign.endDate);
                                        if (campaign.kpi_type == 'null') {
                                            campaign.kpi_type = 'CTR';
                                            campaign.kpi_value = 0;
                                        }
                                        campaignListService.getCdbLineChart(campaign, self.timePeriod, function(cdbData) {
                                            if (cdbData) {
                                                self.cdbDataMap[campaign.orderId] = modelTransformer.transform(cdbData, campaignCDBData);
                                                self.cdbDataMap[campaign.orderId]['modified_vtc_metrics'] = campaignListService.vtcMetricsJsonModifier(self.cdbDataMap[campaign.orderId].video_metrics);
                                            }
                                        });
                                    }, self.campaignList);

                                    if (brandsModel.getSelectedBrand().id !== -1 && self.campaignList.length) { //as we change the brand, we are updating the campaign model as well.
                                        $rootScope.$broadcast('updateCampaignAsBrandChange', self.campaignList[0]);
                                    }

                                }
                            }, function(result) {
                                self.busy = false;
                            });
                        }
                    },
                    fetchCostBreakdown = function() {
                        findScrollerFromContainer.call(this);
                        if ((this.dashboard.filterTotal > 0) && (this.scrollFlag > 0)) {
                            this.scrollFlag = 0; //Reseting scrollFlag
                            if (this.CBdownParams.totalPages && (this.CBdownParams.totalPages + 1) == this.CBdownParams.nextPage) {
                                return;
                            }
                            this.busy = true;
                            var self = this,
                                url = _campaignServiceUrl.call(this, 'costBreakdown');
                                //console.log('cost breakdown url: ',url);
                            campaignListService.getCampaigns(url, function(result) {
                                requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);

                                var data = result.data.data;

                                self.CBdownParams.nextPage += 1;
                                self.marketerName = data.marketer_name;
                                self.CBdownParams.totalPages = data.total_pages;
                                self.periodStartDate = data.period_start_date;
                                self.periodEndDate = data.period_end_date;

                                self.busy = false;
                                if (data.orders.length > 0) {
                                    var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
                                    var campaignData = campaignListService.setActiveInactiveCampaigns(data.orders, timePeriodApiMapping(self.timePeriod), self.periodStartDate, self.periodEndDate)
                                    angular.forEach(campaignData, function(campaign) {
                                        this.push(campaign);
                                        self.costIds += campaign.orderId + ',';
                                        compareCostDates.call(self, campaign.startDate, campaign.endDate);
                                        if (campaign.kpi_type == 'null') {
                                            campaign.kpi_type = 'CTR';
                                            campaign.kpi_value = 0;
                                        }
                                    }, self.costBreakdownList);

                                    if (brandsModel.getSelectedBrand().id !== -1 && self.costBreakdownList.length) { //as we change the brand, we are updating the campaign model as well.
                                        $rootScope.$broadcast('updateCampaignAsBrandChange', self.costBreakdownList[0]);
                                    }

                                    self.costIds = self.costIds.substring(0, self.costIds.length - 1);
                                    if (self.costIds !== '') {
                                        fetchCostData.call(self);
                                        self.costIds = '';
                                    }
                                }
                            }, function(result) {
                                self.busy = false;
                            });
                        }
                    },
                    compareCostDates = function(startDate, endDate) {
                        if (this.costDate.startDate === undefined) {
                            this.costDate.startDate = new Date(startDate);
                        } else {
                            var smallestDate = new Date(this.costDate.startDate);
                            var tempDate = new Date(startDate);
                            if (tempDate < smallestDate) {
                                this.costDate.startDate = tempDate;
                            }
                        }
                        if (this.costDate.endDate === undefined) {
                            this.costDate.endDate = new Date(endDate);
                        } else {
                            var highestDate = new Date(this.costDate.endDate);
                            var tempDate = new Date(endDate);
                            if (highestDate < tempDate) {
                                this.costDate.endDate = tempDate;
                            }

                        }
                    },

                /*  fetchDashboardData will be called initially from the controller and when brand is selected.
                    forceLoad Filter will be undefined if you are coming directly to this page else if you are coming from dashboard then (active,ontrack)/(active,underperforming)
                */
                    fetchDashboardData = function(forceLoadFilter) {
                        this.dashboard.busy = true;
                        var selectedClientId = loginModel.getClientId();
                        var url = apiPaths.apiSerivicesUrl_NEW + '/campaigns/summary/counts?date_filter=' + this.timePeriod+'&client_id='+selectedClientId,
                            self = this;
                        //applying brand filter if active
                        if (this.brandId > 0) {
                            url += '&advertiser_filter=' + this.brandId;
                        }
                        var request_start = new Date();
                        campaignListService.getDashboardData(url, function(result) {
                            var diff = new Date() - request_start;
                            self.dashboard.busy = false;
                            requestCanceller.resetCanceller(constants.DASHBOARD_CANCELLER);
                            if (result.status == "success" && !angular.isString(result.data)) {
                                self.dashboard.active = {
                                    total: result.data.data.active.total,
                                    ontrack: result.data.data.active.ontrack,
                                    underperforming: result.data.data.active.underperforming
                                };
                                self.dashboard.draft = result.data.data.draft;
                                self.dashboard.ready = result.data.data.ready;
                                self.dashboard.completed = result.data.data.completed.total;
                                self.dashboard.paused = result.data.data.paused;
                                self.dashboard.allOtherTotal = result.data.data.na.total != undefined ? result.data.data.na.total : 0;
                                self.dashboard.total = result.data.data.total;
                                //forceLoadFilter - is used to identify whether the user has come from dashboard by clicking campaign performance widget's ontrack or performance section.
                                if (forceLoadFilter !== undefined) {
                                    self.dashboard.displayFilterSection = true;
                                    if (forceLoadFilter === constants.ACTIVE_ONTRACK) {
                                        self.setQuickFilter(constants.ACTIVE_ONTRACK);
                                    } else if (forceLoadFilter === constants.ACTIVE_UNDERPERFORMING) {
                                        self.setQuickFilter(constants.ACTIVE_UNDERPERFORMING);
                                    }
                                } else {
                                    self.dashboard.displayFilterSection = false;
                                    self.dashboard.filterTotal = result.data.data.total;
                                    if (self.dashboard.total > 0) {
                                        self.dashboard.filterSelectAll = false;
                                        self.resetFilters();
                                        self.setQuickFilter(self.appliedQuickFilter);
                                    } else {
                                        self.resetFilters();
                                    }
                                }
                                self.totalCount = result.data.data.total;
                            }
                        });
                    },
                    fetchCostData = function() {
                        var self = this;
                        var hideLoader = function() {
                            _.each(costidsList, function(value) {
                                self.costList[value].costDataLoading = false
                            });
                        }
                        var costidsList = this.costIds.split(",")
                        _.each(costidsList, function(value) {
                            self.costList[value] = {
                                costDataLoading: true
                            }
                        })
                        campaignListService.getCampaignCostData(this.costIds, moment(this.costDate.startDate).format("YYYY-MM-DD"), moment(this.costDate.endDate).format("YYYY-MM-DD"), function(result) {
                            if (result.status == "success" && !angular.isString(result.data) && result.data.data.length >0) {
                                angular.forEach(result.data.data, function(cost) {
                                    self.costList[cost.id] = modelTransformer.transform(cost, campaignCost);
                                    hideLoader();
                                });
                            } else {
                                hideLoader();
                            }
                        }, function() {
                            hideLoader();
                        });
                    },
                    dashboardFilter = function(type, state) {
                        requestCanceller.cancelLastRequest(constants.CAMPAIGN_LIST_CANCELLER);
                        if((state == 'endingSoon') || (this.dashboard.status.active.endingSoon == constants.ACTIVE)){
                            this.sortParam = 'end_date';
                            this.sortDirection = 'asc';
                        }
                        //get the campaign list
                        this.campaignList = [];
                        this.costBreakdownList = [];
                        resetCostBreakdown.call(this);
                        this.scrollFlag = 1;
                        fetchData.call(this);
                        analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_STATUS_FILTER, (state ? state : type), loginModel.getLoginName());
                    },
                    filterCostType = function(type) {
                        this.selectedCostType = type;
                    },
                    filterByTimePeriod = function(timePeriod) {
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
                        filters.timePeriod && (this.timePeriod = timePeriod.key);
                        fetchDashboardData.call(this); //populating dashboard filter with new data
                    },
                    filterByBrand = function(brand) {
                        $("#cdbDropdown").toggle();
                        if (brand != undefined) {
                            this.brandId = brand.id;
                            fetchDashboardData.call(this);
                        }
                    },
                    sortCampaigns = function(fieldName) {
                        if (this.sortParam) {
                            if (this.sortParam == fieldName) {
                                var sortDirection = toggleSortDirection(this.sortDirection);
                               // this.resetSortParams();
                                this.resetFilters();
                                this.sortDirection = sortDirection;
                            } else {
                                //this.resetSortParams();
                                this.resetFilters();
                            }
                        } else {
                            //this.resetSortParams();
                            this.resetFilters();
                        }!this.sortDirection && (this.sortDirection = 'asc');
                        this.sortParam = fieldName;
                        this.sortFieldList.forEach(function(field) {
                            if (fieldName == field.key) {
                                field.className = 'active';
                            } else {
                                field.className = '';
                            }
                        });
                        this.scrollFlag = 1;
                        //fetchCampaigns.call(this);
                        fetchData.call(this);
                        analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_LIST_SORTING, (fieldName + '_' + (sortDirection ? sortDirection : 'asc')), loginModel.getLoginName());
                    },
                    setActiveSortElement = function(fieldName) {
                        this.sortParam = fieldName;
                        this.sortFieldList.forEach(function(field) {
                            if (fieldName == field.key) {
                                field.className = 'active';
                            } else {
                                field.className = '';
                            }
                        });
                    },
                    sortIcon = function(fieldName) {

                        if (this.sortParam == fieldName) {
                            return this.sortDirection == 'asc' ? 'ascending' : 'descending';
                        } else {
                            return 'ascending';
                        }
                    },
                    findShortCutKey = function(campaign, ev) {
                        if (ev.metaKey == true) {
                            this.editCampaign(campaign, true);
                        } else {
                            this.editCampaign(campaign, false);
                        }
                    },

                    editCampaign = function(campaign, status) {
                        /*
                         ga('send', 'event', 'edit-campaign', 'click', campaign.campaignTitle, {
                         'hitCallback': function() {
                         document.location = "/#/campaigns/" + campaign.orderId;
                         }
                         });
                         */
                        analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_CARD_ACTIVITY, constants.GA_CAMPAIGN_ACTIVITY_BUBBLE_COUNT, loginModel.getLoginName(), campaign.actionsCount);
                        if (status == false) {
                            $location.path("/campaigns/" + campaign.orderId);
                        }
                    },

                    campaignReports = function(campaign) {
                        ga('send', 'event', 'campaign-report', 'click', campaign.campaignTitle, {
                            'hitCallback': function() {
                                $location.path("reports/reports/" + campaign.orderId);
                            }
                        });
                    }

                unSelectQuickFilter = function() {
                        this.dashboard.status.active.bothItem = "";
                        this.dashboard.status.active.ontrack = "";
                        this.dashboard.status.active.underperforming = "";
                        this.dashboard.status.active.endingSoon = "";
                        this.dashboard.status.draft = "";
                        this.dashboard.status.ready = "";
                        this.dashboard.status.paused = "";
                        this.dashboard.status.completed = "";
                }

                setQuickFilter = function(filterToApply) {
                      this.unSelectQuickFilter();
                      this.resetFilters();
                      this.appliedQuickFilter = filterToApply;
                      var state = "";
                      var type = "";
                      switch(filterToApply) {
                        case constants.ACTIVE_CONDITION:
                          this.appliedQuickFilterText = constants.DASHBOARD_STATUS_ACTIVE;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.bothItem= constants.ACTIVE;
                          type = constants.ACTIVE;
                          break;
                        case constants.ACTIVE_ONTRACK:
                          this.appliedQuickFilterText = getCapitalizeString(constants.ONTRACK);
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active[constants.ONTRACK];
                          this.dashboard.status.active.ontrack = constants.ACTIVE;
                          state = constants.ontrack;
                          break;
                        case constants.ACTIVE_UNDERPERFORMING:
                          this.appliedQuickFilterText = getCapitalizeString(constants.UNDERPERFORMING);
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active[constants.UNDERPERFORMING.toLowerCase()];
                          this.dashboard.status.active.underperforming  = constants.ACTIVE;
                          state = constants.UNDERPERFORMING;
                          break;
                        case constants.ENDING_SOON_CONDITION:
                          this.appliedQuickFilterText = constants.ENDING_SOON;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.endingSoon = constants.ACTIVE;
                          this.appliedQuickFilter = constants.ENDING_SOON_CONDITION;
                          state = constants.ENDING_SOON.toLowerCase();
                          this.sortParam = 'end_date';
                          this.sortDirection = 'asc';
                          break;
                        case constants.DRAFT_CONDITION:
                            this.appliedQuickFilterText = constants.DRAFT;
                            this.dashboard.quickFilterSelectedCount = this.dashboard[(constants.DRAFT).toLowerCase()];
                            this.dashboard.status.draft = constants.ACTIVE;
                            type = constants.DRAFT.toLowerCase();
                            break;
                        case constants.READY_CONDITION:
                            this.appliedQuickFilterText = constants.READY;
                            this.dashboard.quickFilterSelectedCount = this.dashboard[constants.READY.toLowerCase()];
                            this.dashboard.status.ready= constants.ACTIVE;
                            type = constants.READY.toLowerCase();
                            break;
                        case constants.PAUSED_CONDITION:
                            this.appliedQuickFilterText = constants.PAUSED;
                            this.dashboard.quickFilterSelectedCount = this.dashboard[constants.PAUSED.toLowerCase()];
                            this.dashboard.status.paused= constants.ACTIVE;
                            type = constants.PAUSED.toLowerCase();
                            break;
                        case constants.COMPLETED_CONDITION:
                          this.appliedQuickFilterText = constants.COMPLETED;
                          this.dashboard.quickFilterSelectedCount = this.dashboard[constants.COMPLETED.toLowerCase()];
                          this.dashboard.status.completed = constants.ACTIVE;
                          type = constants.COMPLETED.toLowerCase();
                          break;
                        default :
                          this.appliedQuickFilterText = constants.DASHBOARD_STATUS_ACTIVE;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.bothItem= constants.ACTIVE;
                          type = constants.ACTIVE;
                      }
                    this.dashboard.filterTotal = this.dashboard.quickFilterSelectedCount;
                    this.campaignList = [];
                    this.costBreakdownList = [];
                    resetCostBreakdown.call(this);
                    this.scrollFlag = 1;
                    fetchData.call(this);
                    analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_STATUS_FILTER, (state ? state : type), loginModel.getLoginName());
                }

                    _campaignServiceUrl = function(from) {
                     //var isWorkFlow = RoleBasedService.getUserRole() && RoleBasedService.getUserRole().workFlowUser;
                     // console.log(RoleBasedService.getUserRole() && RoleBasedService.getUserRole().workFlowUser);
                        //if(RoleBasedService.getUserRole() && RoleBasedService.getUserRole().workFlowUser){
                          //  return apiPaths.WORKFLOW_APIUrl + '/campaigns';
                        //}else{
                            var nextPageNumber = from == 'costBreakdown' ? this.CBdownParams.nextPage : this.nextPage;
                            var params = [
                                'date_filter=' + this.timePeriod,
                                'page=' + nextPageNumber,
                                'callback=JSON_CALLBACK'
                            ];
                            this.brandId > 0 && params.push('advertiser_filter=' + this.brandId);
                            this.sortParam && params.push('sort_column=' + this.sortParam);
                            this.sortDirection && params.push('sort_direction=' + this.sortDirection);
                            this.client_id && params.push('client_id='+this.client_id);
                            if(this.appliedQuickFilter == constants.ENDING_SOON_CONDITION) {
                                params.push('conditions=' + constants.ACTIVE_CONDITION);
                            } else {
                                params.push('conditions=' + this.appliedQuickFilter);
                            }
                            return apiPaths.apiSerivicesUrl_NEW + '/campaigns/bystate?' + params.join('&');
                         //}

                    },
                    toggleSortDirection = function(dir) {
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
                            display: 'Advertiser',
                            key: 'advertiser'
                        }, {
                            display: 'Flight Dates',
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
                    },
                    timePeriodApiMapping = function(key) {
                        var apiObj = {
                            'last_week': 'last_7_days',
                            'last_month': 'last_30_days',
                            'life_time': 'life_time'
                        };
                        return apiObj[key];
                    },
                    getCapitalizeString = function(string) {
                        return string[0].toUpperCase() + string.substring(1);
                    };

                return {
                    reloadGraphs: reloadGraphs,
                    fetchCampaigns: fetchCampaigns,
                    compareCostDates: compareCostDates,
                    fetchDashboardData: fetchDashboardData,
                    fetchCostData: fetchCostData,
                    dashboardFilter: dashboardFilter,
                    filterCostType: filterCostType,
                    filterByTimePeriod: filterByTimePeriod,
                    filterByBrand: filterByBrand,
                    sortCampaigns: sortCampaigns,
                    setActiveSortElement: setActiveSortElement,
                    sortIcon: sortIcon,
                    findShortCutKey: findShortCutKey,
                    editCampaign: editCampaign,
                    campaignReports: campaignReports,
                    _campaignServiceUrl: _campaignServiceUrl,
                    buildTimePeriodList: buildTimePeriodList,
                    fetchData: fetchData,
                    resetCostBreakdown: resetCostBreakdown,
                    getData: getData,
                    findScrollerFromContainer: findScrollerFromContainer,
                    setQuickFilter: setQuickFilter,
                    unSelectQuickFilter: unSelectQuickFilter
                }

            }();
            return Campaigns;
        }
    ]);
