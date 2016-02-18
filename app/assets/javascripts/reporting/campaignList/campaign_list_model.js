    //originally part of controllers/campaign_controller.js
    campaignListModule.factory("campaignListModel", ['$rootScope', '$http', '$location', 'dataService', 'campaignListService', 'apiPaths',
        'modelTransformer', 'campaignCDBData', 'campaignCost',
        'dataStore', 'requestCanceller', 'constants',
        'brandsModel', 'loginModel', 'analytics','RoleBasedService','advertiserModel','urlService','dashboardModel',
        function($rootScope, $http, $location, dataService, campaignListService, apiPaths,
            modelTransformer, campaignCDBData, campaignCost,
            dataStore, requestCanceller, constants,
            brandsModel, loginModel, analytics, RoleBasedService,advertiserModel,urlService,dashboardModel) {
            //var scrollFlag = 1;
            var Campaigns = function() {
                this.timePeriodList = buildTimePeriodList();
                this.selectedTimePeriod = this.timePeriodList[2];
                this.displayTimePeriod = angular.uppercase(this.selectedTimePeriod.display);
                this.sortFieldList = buildSortFieldList();
                this.cdbDataMap = {};
                this.campaignList = [];
                this.costBreakdownList = [];
                this.performanceParams = {
                    nextPage: 1,
                    lastPage: false
                }
                this.CBdownParams = {
                    nextPage: 1,
                    lastPage: false
                };
                this.pageSize = 5;
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
                this.nextPage = 1;
                this.sortParam = 'start_date';
                this.sortDirection = 'desc';
                this.brandId = brandsModel.getSelectedBrand().id;
                this.client_id=loginModel.getSelectedClient().id;
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
                    this.performanceParams = {
                        nextPage: 1,
                        lastPage: false
                    }
                    this.sortParam = 'start_date';
                    this.sortDirection = 'desc';
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
                        if (!this.performanceParams.lastPage && (this.dashboard.filterTotal > 0) && (this.scrollFlag > 0)) {
                            this.scrollFlag = 0; //Reseting scrollFlag
                            this.busy = true;
                            var self = this,
                                url = _campaignServiceUrl.call(this);
                            campaignListService.getCampaigns(url, function(result) {
                                requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);
                                self.busy = false;
                                if(result.status != "success"){
                                    self.performanceParams.lastPage = true;
                                    return;
                                }
                                var data = result.data.data;
                                self.performanceParams.nextPage += 1;
                                if (data.length > 0) {
                                    var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
                                    var campaignData = campaignListService.setActiveInactiveCampaigns(data, timePeriodApiMapping(self.timePeriod))
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

                                }else{
                                    self.performanceParams.lastPage = true;
                                }
                            }, function(result) {
                                self.busy = false;
                            });
                        }
                    },
                    hasCampaignId = function(campaignData, id){
                        var retVal = false;
                        _.each(campaignData,function(item){
                            if(item.id == id){
                                retVal = true;
                            }
                        });
                        return retVal;
                    },
                    fetchCostBreakdown = function() {
                        findScrollerFromContainer.call(this);
                        if (!this.CBdownParams.lastPage && (this.dashboard.filterTotal > 0) && (this.scrollFlag > 0)) {
                            this.scrollFlag = 0; //Reseting scrollFlag
                            this.busy = true;
                            $("#load_more").show();
                            var self = this,
                                url = _campaignServiceUrl.call(this, 'costBreakdown');
                            campaignListService.getCampaigns(url, function(result) {
                                requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);
                                self.busy = false;
                                $("#load_more").hide();
                                if(result.status != "success"){
                                    self.CBdownParams.lastPage = true;
                                    return;
                                }
                                var data = result.data.data;

                                self.CBdownParams.nextPage += 1;
                                if (data.length > 0) {
                                    var cdbApiKey = timePeriodApiMapping(self.selectedTimePeriod.key);
                                    var campaignData = campaignListService.setActiveInactiveCampaigns(data, timePeriodApiMapping(self.timePeriod))
                                    angular.forEach(campaignData, function(campaign) {
                                        if(!hasCampaignId(this, campaign.id)) {
                                            this.push(campaign);
                                        }
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
                                }else{
                                    self.CBdownParams.lastPage = true;
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
                        var clientId = loginModel.getSelectedClient().id;
                        var advertiserId = advertiserModel.getSelectedAdvertiser().id;
                        var brandId = brandsModel.getSelectedBrand().id;
                        var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/summary/counts?date_filter=' + this.timePeriod + '&advertiser_id=' + advertiserId,
                            self = this;
                        //applying brand filter if active
                        if (brandId > 0) {
                            url += '&brand_id=' + brandId;
                        }
                        //timePeriod, clientId, advertiserId, brandId, status
                       //var url = urlService.APICampaignCountsSummary(this.timePeriod,selectedClientId,advertiserId,brandId);
                        campaignListService.getDashboardData(url, function(result) {
                            self.dashboard.busy = false;
                            requestCanceller.resetCanceller(constants.DASHBOARD_CANCELLER);
                            if (result.status == "success" && !angular.isString(result.data)) {
                                // active is an object with total, ontrack and underperforming
                                self.dashboard.active = result.data.data.active;
                                self.dashboard.draft = result.data.data.draft;
                                self.dashboard.ready = result.data.data.ready;
                                self.dashboard.completed = result.data.data.completed.total;
                                self.dashboard.archived = result.data.data.archived;
//                                self.dashboard.paused = result.data.data.paused;
//                                self.dashboard.allOtherTotal = result.data.data.na.total != undefined ? result.data.data.na.total : 0;
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
                        var self = this,
                            advertiserId = advertiserModel.getSelectedAdvertiser().id,
                            brandId = brandsModel.getSelectedBrand().id;
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
                        campaignListService.getCampaignCostData(this.costIds, moment(this.costDate.startDate).format("YYYY-MM-DD"), moment(this.costDate.endDate).format("YYYY-MM-DD"), advertiserId, brandId, function(result) {                            if (result.status == "success" && !angular.isString(result.data) && result.data.data.length >0) {
                                angular.forEach(result.data.data, function(cost) {
                                    self.costList[cost.campaign_id] = modelTransformer.transform(cost, campaignCost);
                                    self.costList[cost.campaign_id].cost_transparency = true;
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
                            //fetchCampaigns();
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
                            $location.path("/mediaplans/" + campaign.orderId);
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
                        this.dashboard.status.archived = "";
                }

                setQuickFilter = function(filterToApply) {
                      this.unSelectQuickFilter();
                      this.resetFilters();
                      this.appliedQuickFilter = filterToApply;
                      var kpiStatus = "";
                      var type = "";
                      switch(filterToApply) {
                        case constants.ACTIVE_CONDITION:
                          this.appliedQuickFilterText = constants.INFLIGHT_LABEL;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.bothItem = constants.ACTIVE;
                          type = constants.ACTIVE;
                          break;
                        case constants.ACTIVE_ONTRACK:
                          this.appliedQuickFilterText = getCapitalizeString(constants.ONTRACK);
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active[constants.ONTRACK];
                          this.dashboard.status.active.ontrack = constants.ACTIVE;
                          kpiStatus = constants.ontrack;
                          break;
                        case constants.ACTIVE_UNDERPERFORMING:
                          this.appliedQuickFilterText = getCapitalizeString(constants.UNDERPERFORMING);
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active[constants.UNDERPERFORMING.toLowerCase()];
                          this.dashboard.status.active.underperforming  = constants.ACTIVE;
                          kpiStatus = constants.UNDERPERFORMING;
                          break;
                        case constants.ENDING_SOON_CONDITION:
                          this.appliedQuickFilterText = constants.ENDING_SOON;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.endingSoon = constants.ACTIVE;
                          this.appliedQuickFilter = constants.ENDING_SOON_CONDITION;
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
                            this.appliedQuickFilterText = constants.SCHEDULED;
                            this.dashboard.quickFilterSelectedCount = this.dashboard[constants.READY.toLowerCase()];
                            this.dashboard.status.ready= constants.ACTIVE;
                            type = constants.READY.toLowerCase();
                            break;
//                        case constants.PAUSED_CONDITION:
//                            this.appliedQuickFilterText = constants.PAUSED;
//                            this.dashboard.quickFilterSelectedCount = this.dashboard[constants.PAUSED.toLowerCase()];
//                            this.dashboard.status.paused= constants.ACTIVE;
//                            type = constants.PAUSED.toLowerCase();
//                            break;
                        case constants.COMPLETED_CONDITION:
                          this.appliedQuickFilterText = constants.ENDED;
                          this.dashboard.quickFilterSelectedCount = this.dashboard[constants.COMPLETED.toLowerCase()];
                          this.dashboard.status.completed = constants.ACTIVE;
                          type = constants.COMPLETED.toLowerCase();
                          break;
                        case constants.ARCHIVED_CONDITION:
                          this.appliedQuickFilterText = constants.ARCHIVED;
                          this.dashboard.quickFilterSelectedCount = this.dashboard[constants.ARCHIVED.toLowerCase()];
                          this.dashboard.status.archived = constants.ACTIVE;
                          type = constants.ARCHIVED.toLowerCase();
                          break;
                        default :
                          this.appliedQuickFilterText = constants.DASHBOARD_STATUS_IN_FLIGHT;
                          this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                          this.dashboard.status.active.bothItem = constants.ACTIVE;
                          type = constants.ACTIVE;
                      }
                    this.dashboard.appliedFilterType = type;
                    this.dashboard.filterTotal = this.dashboard.quickFilterSelectedCount;
                    this.campaignList = [];
                    this.costBreakdownList = [];
                    resetCostBreakdown.call(this);
                    this.scrollFlag = 1;
                    fetchData.call(this);
                    analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_STATUS_FILTER, (kpiStatus ? kpiStatus : type), loginModel.getLoginName());
                }

                    _campaignServiceUrl = function(from) {
                        var clientId = loginModel.getSelectedClient().id;
                        var nextPageNumber = from == 'costBreakdown' ? this.CBdownParams.nextPage : this.performanceParams.nextPage;
                        var params = [
                            'client_id=' + loginModel.getSelectedClient().id,
                            'advertiser_id=' + advertiserModel.getSelectedAdvertiser().id,
                            'brand_id=' + brandsModel.getSelectedBrand().id,
                            'date_filter=' + this.timePeriod,
                            'page_num=' + nextPageNumber,
                            'page_size=' + this.pageSize
                        ];
                        this.sortParam && params.push('sort_column=' + this.sortParam);
                        this.sortDirection && params.push('sort_direction=' + this.sortDirection);
                        if(this.appliedQuickFilter == constants.ENDING_SOON_CONDITION) {
                            params.push('condition=' + constants.ACTIVE_CONDITION);
                        } else {
                            params.push('condition=' + this.appliedQuickFilter);
                        }
                        if(this.appliedQuickFilter == constants.ARCHIVED_CONDITION){
                            params.push('cond_type=' + constants.ARCHIVED_CONDITION);
                        }else if(this.appliedQuickFilter == constants.ACTIVE_ONTRACK || this.appliedQuickFilter == constants.ACTIVE_UNDERPERFORMING){
                            params.push('cond_type=kpi_status');
                        }else {
                            params.push('cond_type=status');
                        }
                        return apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery?query_id=42&' + params.join('&');
                    },
                    toggleSortDirection = function(dir) {
                        if (dir == 'asc') {
                            return 'desc';
                        }
                        return 'asc';
                    },
                    buildSortFieldList = function() {
                        return [{
                            display: 'Media Plan',
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
