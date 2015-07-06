//originally part of controllers/campaign_controller.js
campaignListModule.factory("campaignListModel", ['$rootScope', '$http', '$location', 'dataService', 'campaignListService', 'apiPaths',
    'modelTransformer', 'campaignCDBData', 'campaignCost',
    'dataStore', 'requestCanceller', 'constants',
    'brandsModel', 'loginModel', 'analytics',
    function($rootScope, $http, $location, dataService, campaignListService, apiPaths,
        modelTransformer, campaignCDBData, campaignCost,
        dataStore, requestCanceller, constants,
        brandsModel, loginModel, analytics) {
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
                displayStatus: {
                    draft: true,
                    ready: true,
                    paused: true,
                    completed: true,
                    underperforming: true,
                    ontrack: true,
                    active: true
                },
                filterActive: '(active,underperforming)',
                filterReady: undefined,
                filterDraft: undefined,
                filterCompleted: undefined,
                status: {
                    active: {
                        bothItem: '',
                        underperforming: 'active',
                        ontrack: ''
                    },
                    pending: {
                        draft: '',
                        ready: ''
                    },
                    completed: {
                        underperforming: '',
                        ontrack: ''
                    }
                },
                topDisplayFilter: {
                    draft: true,
                    ready: true,
                    paused: true,
                    completed: true,
                    active: {
                        underperforming: true,
                        ontrack: true,
                        bothItem: true
                    }

                }
            };
            this.resetDasboard = function() {
                this.campaignList = [];
                this.busy = false;
                this.timePeriod = 'life_time';
                this.nextPage = 1;
                //this.brandId = 0;
                this.sortParam = 'start_date';
                this.sortDirection = 'desc';
                this.totalPages = undefined;
                //this.costMargin = undefined;
                this.setActiveSortElement(this.sortParam);
            };
            this.resetDasboardFilter = function(type, state) {
                if (type == 'active') {
                    if (this.dashboard.status.active.bothItem == 'active') {
                        setTopFiltersStatus.call(this, "activeAll", false, null);
                    }
                }
                if (type != 'activeAll') {
                    this.dashboard.status.active.bothItem = undefined;
                }
                if (type != 'active') {
                    this.dashboard.filterActive = undefined;
                    this.dashboard.status.active.underperforming = undefined;
                    this.dashboard.status.active.ontrack = undefined;
                }
                if (type != 'paused') {
                    setTopFiltersStatus.call(this, "others", false, {
                        "paused": true
                    });
                }
                if (type != 'completed') {
                    setTopFiltersStatus.call(this, "others", false, {
                        "completed": true
                    });
                }
                if (type != 'ready') {
                    setTopFiltersStatus.call(this, "others", false, {
                        "ready": true
                    });
                }
                if (type != 'draft') {
                    setTopFiltersStatus.call(this, "others", false, {
                        "draft": true
                    });
                }
            };

            this.reset = function() {
                this.campaignList = [];
                this.busy = false;
                this.timePeriod = 'life_time';
                this.nextPage = 1;
                this.brandId = brandsModel.getSelectedBrand().id;
                this.sortParam = undefined;
                this.sortDirection = undefined;
                this.totalPages = undefined;
                this.resetCostBreakdown.call(this);

                // this.costMargin = undefined;
            };

            this.resetFilters = function() {
                this.campaignList = [];
                this.busy = false;
                this.nextPage = 1;
                this.sortParam = 'start_date';
                this.sortDirection = 'desc';
                this.totalPages = undefined;
                //      this.totalCount = undefined;
                this.resetCostBreakdown.call(this);
            };

            this.resetSortParams = function() {
                this.campaignList = [];
                this.busy = false;
                this.nextPage = 1;
                this.sortParam = undefined;
                this.sortDirection = undefined;
                this.totalPages = undefined;
                //      this.totalCount = undefined;
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
                getData = function(from) {
                    $("#cost_tab,#performance_tab").removeClass("active");
                    $('#' + from).addClass("active");
                    this.scrollFlag = 1;
                    if (from == 'cost_tab') {
                        if (this.tabActivation.costTab == 0) {
                            fetchCostBreakdown.call(this);
                            this.tabActivation.costTab = 1;
                        }
                    } else {
                        if (this.tabActivation.performanceTab == 0) {
                            fetchCampaigns.call(this);
                            this.tabActivation.performanceTab = 1;
                        }
                    }
                },

                fetchCampaigns = function() {
                    $("#performance_block,#performance_tab,#cost_block,#cost_tab").scroll(function() {
                        this.scrollFlag = 1;
                    });

                    if ((this.dashboard.filterTotal > 0) && (this.scrollFlag >= 0)) {
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
                    $("#performance_block,#performance_tab,#cost_block,#cost_tab").scroll(function(event) {
                        this.scrollFlag = 1;
                    });
                    if ((this.dashboard.filterTotal > 0) && (this.scrollFlag >= 0)) {
                        this.scrollFlag = 0; //Reseting scrollFlag
                        if (this.CBdownParams.totalPages && (this.CBdownParams.totalPages + 1) == this.CBdownParams.nextPage) {
                            return;
                        }
                        this.busy = true;
                        var self = this,
                            url = _campaignServiceUrl.call(this, 'costBreakdown');

                        campaignListService.getCampaigns(url, function(result) {
                            requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);

                            var data = result.data.data;

                            self.CBdownParams.nextPage += 1;
                            self.marketerName = data.marketer_name;
                            self.CBdownParams.totalPages = data.total_pages;
                            self.periodStartDate = data.period_start_date;
                            self.periodEndDate = data.period_end_date;

                            self.busy = false;
                            //console.log("Line Number:279");
                            //console.log(data)
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
                fetchDashboardData = function(forceLoadFilter) {

                    this.dashboard.busy = true;
                    var url = apiPaths.apiSerivicesUrl + '/campaigns/summary/counts?date_filter=' + this.timePeriod,
                        self = this;
                    //applying brand filter if active
                    if (this.brandId > 0) {
                        url += '&advertiser_filter=' + this.brandId;
                    }
                    // console.log('counts api: '+url);
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
                            self.dashboard.displayStatus.draft = self.dashboard.draft > 0 ? true : false;
                            self.dashboard.displayStatus.ready = self.dashboard.ready > 0 ? true : false;
                            self.dashboard.displayStatus.paused = self.dashboard.paused > 0 ? true : false;
                            self.dashboard.displayStatus.completed = self.dashboard.completed > 0 ? true : false;
                            self.dashboard.displayStatus.underperforming = self.dashboard.active.underperforming > 0 ? true : false;
                            self.dashboard.displayStatus.ontrack = self.dashboard.active.ontrack > 0 ? true : false;
                            if (forceLoadFilter !== undefined) {
                                self.dashboard.displayFilterSection = true;
                                if (forceLoadFilter === constants.ACTIVE_ONTRACK) {
                                    loadActiveOntrack();
                                } else if (forceLoadFilter === constants.ACTIVE_UNDERPERFORMING) {
                                    loadActiveUnderperforming();
                                }
                            } else if (self.dashboard.total > 3) {
                                self.dashboard.displayFilterSection = true;
                                if (self.dashboard.active.underperforming == 0) {
                                    loadActiveOntrack();
                                } else {
                                    loadActiveUnderperforming();
                                }
                            } else {
                                self.dashboard.displayFilterSection = false;
                                self.dashboard.filterTotal = result.data.data.total;
                                if (self.dashboard.total > 0) {
                                    self.dashboard.filterSelectAll = false;
                                    self.dashboardSelectedAll();
                                    self.scrollFlag = 1;
                                    //Note: This call is not required as call already initiated by dashboardSelectedAll method.
                                    //fetchCampaigns.call(self);
                                }
                            }
                            self.totalCount = result.data.data.total;
                        }

                    });

                    function loadActiveOntrack() {
                        self.dashboardFilter(constants.ACTIVE, constants.ONTRACK);
                        self.dashboard.filterActive = constants.ACTIVE_ONTRACK;
                        self.dashboard.status.active.ontrack = constants.ACTIVE;
                        self.dashboard.status.active.underperforming = '';
                    };

                    function loadActiveUnderperforming() {
                        self.dashboardFilter(constants.ACTIVE, constants.UNDERPERFORMING)
                        self.dashboard.filterActive = constants.ACTIVE_UNDERPERFORMING;
                        self.dashboard.status.active.ontrack = '';
                        self.dashboard.status.active.underperforming = constants.ACTIVE;
                    }

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
                        if (result.status == "success" && !angular.isString(result.data)) {
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
                    this.resetDasboard();
                    this.resetTabActivation();
                    this.resetDasboardFilter(type, state);
                    this.dashboardRemoveSelectedAll(type, state);
                    this.setDashboardSelection(type, state);
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
                    //ga('send', 'event', 'time-period-filter', 'click', this.displayTimePeriod);
                    _applyFilters.call(this, {
                        timePeriod: timePeriod.key
                    });

                },
                filterByBrand = function(brand) {
                    $("#cdbDropdown").toggle();
                    if (brand != undefined) {
                        //ga('send', 'event', 'brand-filter', 'click', brand.name);
                        _applyFilters.call(this, {
                            brand: brand.id
                        });
                    }
                },
                sortCampaigns = function(fieldName) {
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

            _applyFilters = function(filters) {
                    //   console.log('filter campaigns: ' + JSON.stringify(filters));
                    if (filters == undefined) {
                        return;
                    }
                    this.resetFilters();
                    filters.brand && (this.brandId = filters.brand);
                    filters.timePeriod && (this.timePeriod = filters.timePeriod);

                    if (filters.brand != undefined) {
                        this.dashboard.filterSelectAll = false;
                        this.dashboard.status.active.underperforming = 'active';
                        this.dashboard.filterActive = '(active,underperforming)';
                        setTopFiltersStatus.call(this, "others", false, null);
                        this.dashboard.status.active.bothItem = undefined;
                        this.dashboard.status.active.ontrack = undefined;
                    }

                    fetchDashboardData.call(this); //populating dashboard filter with new data
                },
                dashboardSelectedAll = function() {
                    this.nextPage = 1;
                    //this.dashboard.filterSelectAll=true;
                    //this. dashboardSelectedAllResetFilter(true);
                    this.resetDasboard();
                    if (this.dashboard.filterSelectAll == false) {
                        this.dashboard.filterSelectAll = true;
                        this.dashboardSelectedAllResetFilter(true);
                    } else {
                        this.dashboard.filterSelectAll = false;
                        this.dashboardSelectedAllResetFilter(false);
                    }
                }, //This function will be reseting the dashboard filter based on the top filter selection
                setTopFiltersStatus = function(from, status, selectedElement) {
                    var data = this.dashboard.topDisplayFilter,
                        self = this,
                        setFieldValue = status == true ? 'active' : undefined; // if true set as active else undefined
                    if (from == 'activeAll') {
                        data = data.active;
                    } // if reset only one filter element eg.{draft:true}
                    if (selectedElement != null || selectedElement != undefined) {
                        data = selectedElement;
                    }
                    _.each(data, function(subData, fieldName) {
                        if (from == 'activeAll') {
                            self.dashboard['status']['active'][fieldName] = setFieldValue;
                        } else {
                            if (fieldName != 'active') {
                                self.dashboard['status'][fieldName] = setFieldValue;
                                var filterType = "filter" + getCapitalizeString(fieldName);
                                self.dashboard[filterType] = undefined;
                            }
                        }
                    });
                },
                setDashboardSelection = function(type, state) {
                    var filterType = "filter" + getCapitalizeString(type);
                    switch (true) {
                        case ((type == 'paused' || type == 'completed' || type == 'draft' || type == 'ready') && state == ""):
                            this.dashboard[filterType] = '(' + type + ')';
                            this.dashboard.status[type] = 'active';
                            this.dashboard.filterTotal = this.dashboard[type];
                            break;
                        case ((type == 'active') && (state == "ontrack" || state == "underperforming")):
                            this.dashboard.filterActive = '(active,' + state + ')';
                            this.dashboard.status.active[state] = 'active';
                            if (state == "ontrack") {
                                this.dashboard.status.active.underperforming = '';
                            } else {
                                this.dashboard.status.active.ontrack = '';
                            }
                            this.dashboard.filterTotal = this.dashboard.active[state];
                            break;
                        case (type == 'activeAll'):
                            this.dashboard.filterActive = '(active)';
                            setTopFiltersStatus.call(this, type, true, null);
                            this.dashboard.filterTotal = this.dashboard.active.total;
                            break;
                    }
                },
                dashboardRemoveSelectedAll = function(type, state) {
                    if (this.dashboard.filterSelectAll == true) {
                        this.dashboard.filterSelectAll = false;
                        if (type == 'active') {
                            if (state == 'ontrack') {
                                this.dashboard.status.active.ontrack = undefined;
                            } else {
                                this.dashboard.status.active.underperforming = undefined;

                            }
                        }
                        switch (type) {
                            case (type == "paused" || type == "completed" || type == "draft" || type == "ready"):
                                this.dashboard.status[type] = undefined;
                                break;
                            case "activeAll":
                                setTopFiltersStatus.call(this, type, false, null);
                                break;
                        }
                    }
                },
                dashboardSelectedAllResetFilter = function(status) {
                    setTopFiltersStatus.call(this, "others", status, null);
                    if (status == true) {
                        setTopFiltersStatus.call(this, "activeAll", status, null);
                        this.dashboard.filterActive = undefined;
                        this.dashboard.filterTotal = this.dashboard.total;
                    } else {
                        this.dashboard.status.active.bothItem = undefined;
                        this.dashboard.status.active.ontrack = undefined;
                        if (this.dashboard.active.underperforming == 0) {
                            this.dashboard.filterActive = '(active,ontrack)';
                            this.dashboard.status.active.ontrack = 'active';
                            this.dashboard.status.active.underperforming = undefined;
                            this.dashboard.filterTotal = this.dashboard.active.ontrack;
                        } else {
                            this.dashboard.filterActive = '(active,underperforming)';
                            this.dashboard.status.active.underperforming = 'active';
                            this.dashboard.status.active.ontrack = undefined;
                            this.dashboard.filterTotal = this.dashboard.active.underperforming;
                        }
                    }
                    this.campaignList = [];
                    scrollFlag = 1;
                    this.resetCostBreakdown.call(this);
                    fetchData.call(this);
                    //fetchCampaigns.call(this);
                },
                _campaignServiceUrl = function(from) {
                    var nextPageNumber = from == 'costBreakdown' ? this.CBdownParams.nextPage : this.nextPage;
                    var params = [
                        'date_filter=' + this.timePeriod,
                        'page=' + nextPageNumber,
                        'callback=JSON_CALLBACK'
                    ];
                    this.brandId > 0 && params.push('advertiser_filter=' + this.brandId);
                    this.sortParam && params.push('sort_column=' + this.sortParam);
                    this.sortDirection && params.push('sort_direction=' + this.sortDirection);
                    this.dashboard.filterActive && params.push('conditions=' + this.dashboard.filterActive);
                    this.dashboard.filterReady && params.push('conditions=' + this.dashboard.filterReady);
                    this.dashboard.filterDraft && params.push('conditions=' + this.dashboard.filterDraft);
                    this.dashboard.filterCompleted && params.push('conditions=' + this.dashboard.filterCompleted);
                    this.dashboard.filterPaused && params.push('conditions=' + this.dashboard.filterPaused);
                    return apiPaths.apiSerivicesUrl + '/campaigns/bystate?' + params.join('&');
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
                        display: 'Brand',
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
                _applyFilters: _applyFilters,
                dashboardSelectedAll: dashboardSelectedAll,
                dashboardRemoveSelectedAll: dashboardRemoveSelectedAll,
                setDashboardSelection: setDashboardSelection,
                dashboardSelectedAllResetFilter: dashboardSelectedAllResetFilter,
                _campaignServiceUrl: _campaignServiceUrl,
                buildTimePeriodList: buildTimePeriodList,
                fetchData: fetchData,
                resetCostBreakdown: resetCostBreakdown,
                getData: getData

                //resetSortParams : this.resetSortParams
            }

        }();
        return Campaigns;
    }
]);