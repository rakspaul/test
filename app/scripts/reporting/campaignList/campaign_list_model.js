define(['angularAMD', 'reporting/campaignList/campaign_list_service', 'common/services/transformer_service', 'reporting/models/campaign_cdb_data',
    'reporting/models/campaign_cost', 'common/services/request_cancel_service', 'common/services/constants_service', 'reporting/brands/brands_model', 'login/login_model',
    'reporting/advertiser/advertiser_model', 'common/services/url_service', 'common/services/vistoconfig_service','../../common/services/data_service'], function (angularAMD) {
        // originally part of controllers/campaign_controller.js
        angularAMD.factory('campaignListModel', ['$route','$rootScope', '$location', 'campaignListService', 'modelTransformer', 'campaignCDBData', 'campaignCost',
            'requestCanceller', 'constants', 'brandsModel', 'loginModel', 'advertiserModel', 'urlService', 'vistoconfig', 'dataService', 'localStorageService',
            function ($route,$rootScope, $location, campaignListService, modelTransformer, campaignCDBData, campaignCost, requestCanceller, constants, brandsModel, loginModel,
                      advertiserModel, urlService, vistoconfig, dataService, localStorageService) {
                var Campaigns = function () {
                    this.getCapitalizeString = function (string) {
                        return string[0].toUpperCase() + string.substring(1);
                    };

                    this.createTimePeriodObject = function (display, key, className) {
                        return {
                            display: display,
                            key: key,
                            className: className === undefined ? '' : className
                        };
                    };

                    this.timePeriodList = [
                        this.createTimePeriodObject('Last 7 days', 'last_week'),
                        this.createTimePeriodObject('Last 30 days', 'last_month'),
                        this.createTimePeriodObject('Lifetime', 'life_time', 'active')
                    ];

                    this.selectedTimePeriod = this.timePeriodList[2];
                    this.displayTimePeriod = angular.uppercase(this.selectedTimePeriod.display);

                    this.sortFieldList = [
                        {display: 'Media Plan', key: 'campaign_name'},
                        {display: 'Advertiser', key: 'advertiser_name'},
                        {display: 'Flight Dates', key: 'start_date', className: 'active'}
                    ];

                    this.cdbDataMap = {};
                    this.campaignList = [];
                    this.costBreakdownList = [];

                    this.performanceParams = {
                        nextPage: 1,
                        lastPage: false
                    };

                    this.CBdownParams = {
                        nextPage: 1,
                        lastPage: false
                    };

                    this.pageSize = 5;

                    this.tabActivation = {
                        costTab: 0,
                        performanceTab: 0
                    };

                    this.scrollFlag = 1;
                    this.costList = {};
                    this.costIds = '';
                    this.selectedCostType = 'cpa';

                    this.costDate = {
                        startDate: undefined,
                        endDate: undefined
                    };

                    // this.costMargin;
                    this.busy = true;
                    this.timePeriod = this.selectedTimePeriod.key;
                    this.nextPage = 1;
                    this.sortParam = 'start_date';
                    this.sortDirection = 'desc';
                    this.brandId = vistoconfig.getSelectedBrandId();
                    this.client_id = vistoconfig.getSelectedAccountId();

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

                        quickFilterSelected: this.getCapitalizeString(constants.ACTIVE),
                        quickFilterSelectedCount: 0,
                        filterActive: constants.ACTIVE_CONDITION,
                        filterReady: undefined,
                        filterDraft: undefined,
                        filterCompleted: undefined,

                        status: {
                            active: {
                                bothItem: '',
                                underperforming: '',
                                ontrack: '',
                                endingSoon: ''
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

                    this.resetFilters = function (type) {
                        this.campaignList = [];
                        this.timePeriod = 'life_time';

                        if (!this.noData) {
                            this.busy = true;
                        }

                        this.performanceParams = {
                            nextPage: 1,
                            lastPage: false
                        };

                        this.sortParam = 'start_date';
                        (type !== 'sort') && (this.sortDirection = 'desc');
                        this.dashboard.quickFilterSelectedCount = 0;
                        this.resetCostBreakdown.call(this);
                    };

                    this.resetTabActivation = function () {
                        this.tabActivation = {
                            costTab: 0,
                            performanceTab: 0
                        };
                    };
                };

                Campaigns.prototype = function () {
                    var reloadGraphs = function () {
                            campaignListService.loadGraphs(this.campaignList, timePeriodApiMapping(this.selectedTimePeriod.key));
                        },

                        resetCostBreakdown = function () {
                            this.CBdownParams = {
                                nextPage: 1,
                                totalPages: 0
                            };

                            this.costBreakdownList = [];
                            this.resetTabActivation();
                        },

                        fetchData = function (searchTerm) {
                            var performanceTab = $('#performance_tab');

                            if (searchTerm) {
                                this.searchTerm = searchTerm;
                            }

                            if (performanceTab.hasClass('active') === false && $('#cost_tab').hasClass('active') === false) {
                                performanceTab.addClass('active');
                            }

                            if (performanceTab.hasClass('active') === true) {
                                this.tabActivation.performanceTab = 1;
                                fetchCampaigns.call(this);
                            }
                        },

                        findScrollerFromContainer = function () {
                            var self = this;

                            $(window).bind('scroll', function () {
                                self.scrollFlag = 1;
                            });
                        },

                        getData = function (from) {
                            $('#cost_tab,#performance_tab').removeClass('active');
                            $('#' + from).addClass('active');
                            this.scrollFlag = 1;

                            if (from === 'cost_tab') {
                                // if You click costbreakdown if tab is not activated  will fetch data.
                                if (this.tabActivation.costTab === 0) {
                                    fetchCostBreakdown.call(this);
                                    this.tabActivation.costTab = 1;
                                }
                            } else {
                                // if You click performance if tab is not activated fetch data.
                                if (this.tabActivation.performanceTab === 0) {
                                    fetchCampaigns.call(this);
                                    this.tabActivation.performanceTab = 1;
                                }
                            }
                        },

                        fetchCampaigns = function () {
                            var self,
                                url,
                                clientId,
                                advertiserId,
                                brandId;

                            // check scroller only inside container
                            findScrollerFromContainer.call(this);

                            if ((!this.performanceParams.lastPage && (this.dashboard.filterTotal > 0) || (this.scrollFlag > 0)) || this.searchTerm) {
                                // Resetting scrollFlag
                                this.scrollFlag = 0;

                                self = this;
                                self.noData = false;
                                url = _campaignServiceUrl.call(this);

                                clientId = vistoconfig.getSelectedAccountId();
                                advertiserId = vistoconfig.getSelectAdvertiserId();
                                brandId = vistoconfig.getSelectedBrandId();

                                campaignListService.getCampaigns(url, function (result) {
                                    var data = result.data.data;

                                    if (data && data[0] && data[0].count) {
                                        // The total count is now returned as part of the main result set
                                        self.dashboard.quickFilterSelectedCount = data[0].count;

                                        if (!self.dashboard.originalFilterTotal) {
                                            // This stores the original total count on first load
                                            self.dashboard.originalFilterTotal = data[0].count;
                                        }

                                        // Show / Hide 'No Relevant Media Plans' display
                                        self.noData = self.dashboard.quickFilterSelectedCount ? false : true;
                                    } else {
                                        self.noData = true;
                                    }

                                    if (self.noData) {
                                        // when there is no data for busy flag should be false as default is true.
                                        self.busy = false;
                                    }

                                    requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);

                                    if (result.status !== 'success') {
                                        self.performanceParams.lastPage = true;
                                        return;
                                    }

                                    self.performanceParams.nextPage += 1;

                                    if (data.length > 0) {
                                        var campaignData = campaignListService.setActiveInactiveCampaigns(data, timePeriodApiMapping(self.timePeriod));

                                        angular.forEach(campaignData, function (campaign) {
                                            var queryObj = {
                                                    queryId: 14,
                                                    clientId: clientId,
                                                    advertiserId: advertiserId,
                                                    brandId: brandId,
                                                    dateFilter: 'life_time',
                                                    campaignIds: campaign.id
                                                },

                                                spendUrl = urlService.getCampaignSpend(queryObj),
                                                contextThis = this;

                                            contextThis.push(campaign);
                                            self.busy = false;

                                            (function (campaign) {
                                                dataService
                                                    .fetch(spendUrl)
                                                    .then(function (response) {
                                                        self.busy = false;

                                                        if(response.data && response.data.data && response.data.data.length > 0) {
                                                            campaign.spend = response.data.data[0].gross_rev;
                                                        } else {
                                                            campaign.spend = 0;
                                                        }

                                                        if (campaign.kpi_type === 'null') {
                                                            campaign.kpi_type = 'CTR';
                                                            campaign.kpi_value = 0;
                                                        }

                                                        campaignListService.getCdbLineChart(clientId, campaign, self.timePeriod, function (cdbData) {
                                                            if (cdbData) {
                                                                self.cdbDataMap[campaign.orderId] = modelTransformer.transform(cdbData, campaignCDBData);

                                                                self
                                                                    .cdbDataMap[campaign.orderId]
                                                                    .modified_vtc_metrics =
                                                                        campaignListService.vtcMetricsJsonModifier(self.cdbDataMap[campaign.orderId].video_metrics);
                                                            }
                                                        });
                                                    }, function () {
                                                        self.busy = false;
                                                    });
                                            }(campaign));
                                        }, self.campaignList);

                                    } else {
                                        self.performanceParams.lastPage = true;
                                    }
                                });
                            }
                        },

                        hasCampaignId = function (campaignData, id) {
                            var retVal = false;

                            _.each(campaignData, function (item) {
                                if (item.id === id) {
                                    retVal = true;
                                }
                            });

                            return retVal;
                        },

                        fetchCostBreakdown = function () {
                            findScrollerFromContainer.call(this);

                            if (!this.CBdownParams.lastPage && (this.dashboard.filterTotal > 0) && (this.scrollFlag > 0)) {
                                var self,
                                    url;

                                // Resetting scrollFlag
                                this.scrollFlag = 0;
                                this.busy = true;

                                $('#load_more').show();
                                self = this;
                                url = _campaignServiceUrl.call(this, 'costBreakdown');

                                campaignListService.getCampaigns(url, function (result) {
                                    var data = result.data.data,
                                        campaignData;

                                    requestCanceller.resetCanceller(constants.CAMPAIGN_LIST_CANCELLER);
                                    self.busy = false;
                                    $('#load_more').hide();

                                    if (result.status !== 'success') {
                                        self.CBdownParams.lastPage = true;
                                        return;
                                    }

                                    self.CBdownParams.nextPage += 1;

                                    if (data.length > 0) {
                                        campaignData = campaignListService.setActiveInactiveCampaigns(data, timePeriodApiMapping(self.timePeriod));

                                        angular.forEach(campaignData, function (campaign) {
                                            if (!hasCampaignId(this, campaign.id)) {
                                                this.push(campaign);
                                            }

                                            self.costIds += campaign.orderId + ',';
                                            compareCostDates.call(self, campaign.startDate, campaign.endDate);

                                            if (campaign.kpi_type === 'null') {
                                                campaign.kpi_type = 'CTR';
                                                campaign.kpi_value = 0;
                                            }
                                        }, self.costBreakdownList);

                                        self.costIds = self.costIds.substring(0, self.costIds.length - 1);

                                        if (self.costIds !== '') {
                                            fetchCostData.call(self);
                                            self.costIds = '';
                                        }
                                    } else {
                                        self.CBdownParams.lastPage = true;
                                    }
                                }, function () {
                                    self.busy = false;
                                });
                            }
                        },

                        compareCostDates = function (startDate, endDate) {
                            var smallestDate,
                                highestDate,
                                tempDate;

                            if (this.costDate.startDate === undefined) {
                                this.costDate.startDate = new Date(startDate);
                            } else {
                                smallestDate = new Date(this.costDate.startDate);
                                tempDate = new Date(startDate);

                                if (tempDate < smallestDate) {
                                    this.costDate.startDate = tempDate;
                                }
                            }

                            if (this.costDate.endDate === undefined) {
                                this.costDate.endDate = new Date(endDate);
                            } else {
                                highestDate = new Date(this.costDate.endDate);
                                tempDate = new Date(endDate);

                                if (highestDate < tempDate) {
                                    this.costDate.endDate = tempDate;
                                }
                            }
                        },

                        /* fetchDashboardData will be called initially from the controller and when brand is selected.
                         * forceLoad Filter will be undefined if you are coming directly to this page else if you are
                         * coming from dashboard then (active, ontrack)/(active, under performing)
                         */
                        fetchDashboardData = function (forceLoadFilter) {
                            var clientId = vistoconfig.getSelectedAccountId(),
                                advertiserId = vistoconfig.getSelectAdvertiserId(),
                                brandId = vistoconfig.getSelectedBrandId(),

                                url = vistoconfig.apiPaths.apiSerivicesUrl_NEW +
                                    '/clients/' + clientId +
                                    '/campaigns/summary/counts?date_filter=' + this.timePeriod +
                                    '&advertiser_id=' + advertiserId,

                                self = this;

                            this.dashboard.busy = true;

                            // applying brand filter if active
                            if (brandId > 0) {
                                url += '&brand_id=' + brandId;
                            }

                            campaignListService.getDashboardData(url, function (result) {
                                self.dashboard.busy = false;
                                requestCanceller.resetCanceller(constants.DASHBOARD_CANCELLER);

                                if (result.status === 'success' && !angular.isString(result.data)) {
                                    //  active is an object with total, onTrack and underPerforming
                                    self.dashboard.active = result.data.data.active;
                                    self.dashboard.draft = result.data.data.draft;
                                    self.dashboard.ready = result.data.data.ready;
                                    self.dashboard.completed = result.data.data.completed.total;
                                    self.dashboard.archived = result.data.data.archived;
                                    self.dashboard.total = result.data.data.total;
                                    self.dashboard.all = result.data.data.all;
                                    self.noData = true;

                                    // forceLoadFilter - is used to identify whether the user has come from dashboard
                                    // by clicking campaign performance widget's ontrack or performance section.
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
                                            self.noData = false;
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

                        fetchCostData = function () {
                            var self = this,
                                advertiserId = vistoconfig.getSelectAdvertiserId(),
                                brandId = vistoconfig.getSelectedBrandId(),

                                hideLoader = function () {
                                    _.each(costidsList, function (value) {
                                        self.costList[value].costDataLoading = false;
                                    });
                                },

                                costidsList = this.costIds.split(',');

                            _.each(costidsList, function (value) {
                                self.costList[value] = {
                                    costDataLoading: true
                                };
                            });

                            campaignListService.getCampaignCostData(
                                this.costIds,
                                moment(this.costDate.startDate).format('YYYY-MM-DD'),
                                moment(this.costDate.endDate).format('YYYY-MM-DD'),
                                advertiserId, brandId,

                                function (result) {
                                    if (result.status === 'success' &&
                                        !angular.isString(result.data) &&
                                        result.data.data.length > 0) {
                                        angular.forEach(result.data.data, function (cost) {
                                            self.costList[cost.campaign_id] =
                                                modelTransformer.transform(cost, campaignCost);

                                            self.costList[cost.campaign_id].cost_transparency = true;
                                            hideLoader();
                                        });
                                    } else {
                                        hideLoader();
                                    }
                                }, function () {
                                    hideLoader();
                                }
                            );
                        },

                        dashboardFilter = function (type, state) {
                            requestCanceller.cancelLastRequest(constants.CAMPAIGN_LIST_CANCELLER);

                            if ((state === 'endingSoon') || (this.dashboard.status.active.endingSoon === constants.ACTIVE)) {
                                this.sortParam = 'end_date';
                                this.sortDirection = 'asc';
                            }

                            // get the campaign list
                            this.campaignList = [];

                            this.costBreakdownList = [];
                            resetCostBreakdown.call(this);
                            this.scrollFlag = 1;
                            fetchData.call(this);
                        },

                        filterCostType = function (type) {
                            this.selectedCostType = type;
                        },

                        filterByTimePeriod = function (timePeriod) {
                            this.selectedTimePeriod = timePeriod;
                            this.displayTimePeriod = angular.uppercase(timePeriod.display);

                            $('#cdbDropdown').toggle();

                            this.timePeriodList.forEach(function (period) {
                                if (period === timePeriod) {
                                    period.className = 'active';
                                } else {
                                    period.className = '';
                                }
                            });

                            // TODO: what is 'filters' below?
                            filters.timePeriod && (this.timePeriod = timePeriod.key); // jshint ignore:line

                            // populating dashboard filter with new data
                            fetchDashboardData.call(this);
                        },

                        filterByBrand = function (brand) {
                            $('#cdbDropdown').toggle();

                            if (brand !== undefined) {
                                this.brandId = brand.id;
                                fetchDashboardData.call(this);
                            }
                        },

                        sortCampaigns = function (fieldName) {
                            var totalItem = this.dashboard.quickFilterSelectedCount,
                                sortDirection;

                            if (this.sortParam) {
                                if (this.sortParam === fieldName) {
                                    sortDirection = toggleSortDirection(this.sortDirection);
                                    this.sortDirection = sortDirection;
                                }
                            }

                            this.resetFilters('sort');

                            !this.sortDirection && (this.sortDirection = 'asc');
                            this.sortParam = fieldName;
                            this.dashboard.quickFilterSelectedCount = totalItem;

                            this.sortFieldList.forEach(function (field) {
                                if (fieldName === field.key) {
                                    field.className = 'active';
                                } else {
                                    field.className = '';
                                }
                            });

                            this.scrollFlag = 1;
                            fetchData.call(this);
                        },

                        setActiveSortElement = function (fieldName) {
                            this.sortParam = fieldName;

                            this.sortFieldList.forEach(function (field) {
                                if (fieldName === field.key) {
                                    field.className = 'active';
                                } else {
                                    field.className = '';
                                }
                            });
                        },

                        sortIcon = function (fieldName) {
                            if (this.sortParam === fieldName) {
                                return this.sortDirection === 'asc' ? 'ascending' : 'descending';
                            } else {
                                return 'ascending';
                            }
                        },

                        findShortCutKey = function (campaign, ev) {
                            if (ev.metaKey === true) {
                                this.editCampaign(campaign, true);
                            } else {
                                this.editCampaign(campaign, false);
                            }
                        },

                        editCampaign = function (campaign, status) {
                            if (status === false) {
                                $location.path('/mediaplans/' + campaign.orderId);
                            }
                        },

                        campaignReports = function (campaign) {
                            // TODO: what is 'ga' below?
                            ga('send', 'event', 'campaign-report', 'click', // jshint ignore:line
                                campaign.campaignTitle, {
                                    hitCallback: function () {
                                        $location.path('reports/reports/' + campaign.orderId);
                                    }
                                });
                        },

                        unSelectQuickFilter = function () {
                            this.dashboard.status.active.bothItem = '';
                            this.dashboard.status.active.ontrack = '';
                            this.dashboard.status.active.underperforming = '';
                            this.dashboard.status.active.endingSoon = '';
                            this.dashboard.status.draft = '';
                            this.dashboard.status.ready = '';
                            this.dashboard.status.paused = '';
                            this.dashboard.status.completed = '';
                            this.dashboard.status.archived = '';
                            this.dashboard.status.active.all = '';
                        },

                        setQuickFilter = function (filterToApply) {
                            var kpiStatus = '',
                                type = '';

                            this.loadMoreCampaigns = false;
                            this.unSelectQuickFilter();
                            this.resetFilters();
                            this.appliedQuickFilter = filterToApply;

                            localStorageService.campaignListFilter.set(filterToApply);

                            switch (filterToApply) {
                                case constants.ACTIVE_CONDITION:
                                    this.appliedQuickFilterText = constants.INFLIGHT_LABEL;
                                    this.dashboard.quickFilterSelectedCount = this.dashboard.active.total;
                                    this.dashboard.status.active.bothItem = constants.ACTIVE;
                                    type = constants.ACTIVE;
                                    break;

                                case constants.ACTIVE_ONTRACK:
                                    this.appliedQuickFilterText = this.getCapitalizeString(constants.ONTRACK);
                                    this.dashboard.quickFilterSelectedCount = this.dashboard.active[constants.ONTRACK];
                                    this.dashboard.status.active.ontrack = constants.ACTIVE;
                                    kpiStatus = constants.ontrack;
                                    break;

                                case constants.ACTIVE_UNDERPERFORMING:
                                    this.appliedQuickFilterText = this.getCapitalizeString(constants.UNDERPERFORMING);

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard.active[constants.UNDERPERFORMING.toLowerCase()];

                                    this.dashboard.status.active.underperforming = constants.ACTIVE;
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

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard[(constants.DRAFT).toLowerCase()];

                                    this.dashboard.status.draft = constants.ACTIVE;
                                    type = constants.DRAFT.toLowerCase();
                                    break;

                                case constants.READY_CONDITION:
                                    this.appliedQuickFilterText = constants.SCHEDULED;

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard[constants.READY.toLowerCase()];

                                    this.dashboard.status.ready = constants.ACTIVE;
                                    type = constants.READY.toLowerCase();
                                    break;

                                case constants.COMPLETED_CONDITION:
                                    this.appliedQuickFilterText = constants.ENDED;

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard[constants.COMPLETED.toLowerCase()];

                                    this.dashboard.status.completed = constants.ACTIVE;
                                    type = constants.COMPLETED.toLowerCase();
                                    break;

                                case constants.ARCHIVED_CONDITION:
                                    this.appliedQuickFilterText = constants.ARCHIVED;

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard[constants.ARCHIVED.toLowerCase()];

                                    this.dashboard.status.archived = constants.ACTIVE;
                                    type = constants.ARCHIVED.toLowerCase();
                                    break;

                                case constants.ALL_CONDITION:
                                    this.appliedQuickFilterText = constants.ALL;

                                    this.dashboard.quickFilterSelectedCount =
                                        this.dashboard[constants.ALL.toLowerCase()];

                                    this.dashboard.status.all = constants.ALL.toLowerCase();
                                    this.dashboard.status.active.all = constants.ACTIVE;
                                    type = constants.ALL.toLowerCase();
                                    break;

                                default:
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

                            if (filterToApply === 'all') {
                                $location.search('filter', null);
                            } else {
                                $location.search('filter', filterToApply);
                            }
                        },

                        initializeFilter = function () {
                            var filterStatus = $location.url().split('filter=')[1],
                                $tmpSavedFilter;

                            if (filterStatus === undefined) {
                                $tmpSavedFilter = localStorageService.campaignListFilter.get();

                                if ($tmpSavedFilter) {
                                    this.setQuickFilter($tmpSavedFilter);
                                } else {
                                    this.setQuickFilter(constants.ALL_CONDITION);
                                }
                            } else {
                                this.setQuickFilter(filterStatus);
                            }
                        },

                        _campaignServiceUrl = function (from) {
                            var clientId = vistoconfig.getSelectedAccountId(),
                                advertiserId = vistoconfig.getSelectAdvertiserId(),
                                brandId = vistoconfig.getSelectedBrandId(),
                                nextPageNumber,
                                params;

                            if (from === 'costBreakdown') {
                                nextPageNumber = this.CBdownParams.nextPage;
                            } else {
                                nextPageNumber = this.performanceParams.nextPage;
                            }

                            params = [
                                'client_id=' + clientId,
                                'advertiser_id=' + advertiserId,
                                'brand_id=' + brandId,
                                'date_filter=' + this.timePeriod,
                                'page_num=' + nextPageNumber,
                                'page_size=' + this.pageSize
                            ];

                            if (this.searchTerm) {
                                params.push('search_term=' + this.searchTerm);
                            }

                            // NOTE: Please avoid these kind of cryptic code in the following 2 lines
                            // (Comment by Lalding)
                            this.sortParam && params.push('sort_column=' + this.sortParam);
                            this.sortDirection && params.push('sort_direction=' + this.sortDirection);

                            if (this.appliedQuickFilter === constants.ENDING_SOON_CONDITION) {
                                params.push('condition=' + constants.ACTIVE_CONDITION);
                            } else {
                                params.push('condition=' + this.appliedQuickFilter);
                            }

                            if (this.appliedQuickFilter === constants.ARCHIVED_CONDITION) {
                                params.push('cond_type=' + constants.ARCHIVED_CONDITION);
                            } else if (this.appliedQuickFilter === constants.ACTIVE_ONTRACK || this.appliedQuickFilter === constants.ACTIVE_UNDERPERFORMING) {
                                params.push('cond_type=kpi_status');
                            } else {
                                params.push('cond_type=status');
                            }

                            if (this.searchTerm) {
                                return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/search/campaigns?' + params.join('&');
                            } else {
                                return vistoconfig.apiPaths.apiSerivicesUrl_NEW + '/reportBuilder/customQuery?query_id=42&' + params.join('&');
                            }
                        },

                        toggleSortDirection = function (dir) {
                            if (dir === 'asc') {
                                return 'desc';
                            }

                            return 'asc';
                        },

                        timePeriodApiMapping = function (key) {
                            var apiObj = {
                                last_week: 'last_7_days',
                                last_month: 'last_30_days',
                                life_time: 'life_time'
                            };

                            return apiObj[key];
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
                        fetchData: fetchData,
                        resetCostBreakdown: resetCostBreakdown,
                        getData: getData,
                        findScrollerFromContainer: findScrollerFromContainer,
                        setQuickFilter: setQuickFilter,
                        unSelectQuickFilter: unSelectQuickFilter,
                        initializeFilter:initializeFilter
                    };
                }();

                return Campaigns;
            }
        ]);
    }
);
