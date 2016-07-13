define(['angularAMD', 'reporting/kpiSelect/kpi_select_model', // jshint ignore:line
    'reporting/campaignList/campaign_list_model', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_model', 'common/utils', 'common/services/constants_service',
    'common/services/vistoconfig_service', 'reporting/brands/brands_model', 'login/login_model',
    'reporting/models/gauge_model', 'common/services/role_based_service',
    'reporting/campaignList/campaign_list_filter_directive', 'reporting/directives/campaign_cost_sort',
    'reporting/directives/campaign_sort', 'reporting/directives/campaign_card',
    'reporting/directives/campaign_list_sort', 'reporting/common/d3/quartiles_graph',
    'reporting/common/d3/campaign_chart', 'reporting/directives/campaign_cost_card'], function (angularAMD) {
        angularAMD.controller('CampaignListController',
            function ($scope, $rootScope, $location, kpiSelectModel, campaignListModel, campaignSelectModel,
                      strategySelectModel, utils, constants, vistoconfig, brandsModel, loginModel, gaugeModel,
                      RoleBasedService, featuresService) {
                var fparams = featuresService.getFeatureParams(),
                    forceLoadCampaignsFilter,

                    enableFeaturePermission = function () {
                        $scope.showCreateMediaPlan = fparams[0].create_mediaplan;
                        $scope.showCostTab = fparams[0].cost;
                    };

                //Hot fix to show the campaign tab selected
                $('.main_navigation')
                    .find('.active')
                    .removeClass('active')
                    .end()
                    .find('#campaigns_nav_link')
                    .addClass('active');

                $('.main_navigation_holder')
                    .find('.active_tab')
                    .removeClass('active_tab');

                //Resets Header
                $('.main_navigation_holder .main_nav .main_navigation .each_nav_link.active .arrowSelect').show();
                $('.each_nav_link').removeClass('active_tab');
                $('#campaigns_nav_link').addClass('active_tab');

                enableFeaturePermission();

                $rootScope.$on('features', function () {
                    var fparams = featuresService.getFeatureParams();
                    $scope.showPerformanceTab = fparams[0].performance;
                    enableFeaturePermission();
                });

                $scope.campaigns = new campaignListModel();
                $scope.campaigns.initializeFilter();
                $scope.sortReverse = false;
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                $scope.textConstants = constants;

                $scope.searchTerm = '';
                $scope.campaigns.searchTerm = '';

                $scope.campaigns.loadMoreCampaigns = false;

                $scope.campaignSearchFunc = function (e) {
                    // Perform search if enter key is pressed, or search button is clicked & user has entered something.
                    // NOTE: The event object (e) is not passed if called from search button.
                    if (!e || e.keyCode === 13) {
                        $scope.campaigns.noData = false;
                        $scope.campaigns.resetFilters();

                        if ($scope.campaigns.searchTerm && $scope.campaigns.searchTerm.trim()) {
                            // Search term is entered
                            $scope.campaigns.fetchData($scope.campaigns.searchTerm);
                        } else {
                            // Empty search term
                            $scope.campaigns.fetchData();
                        }

                        $scope.isCampaignSearched = true;
                    }
                };

                $scope.$on(constants.EVENT_BRAND_CHANGED, function () {

                    //below line empty the search text on subaccount change
                    $scope.campaigns.searchTerm = '';

                    $scope.campaigns.filterByBrand(brandsModel.getSelectedBrand());
                });

                $('html').css('background', '#fff');

                $scope.isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

                //Based on gauge click, load the filter and reset data set after gauge click.
                if (gaugeModel.dashboard.selectedFilter !== '') {
                    forceLoadCampaignsFilter = gaugeModel.dashboard.selectedFilter;
                }

                $scope.campaigns.fetchDashboardData(forceLoadCampaignsFilter);
                gaugeModel.resetDashboardFilters();

                $scope.$on('fromCampaignDetails', function (event, args) {
                    $scope.loadMoreStrategies(args.campaignId);
                });

                //braodcasting from campaignListModel.js
                $scope.$on('updateCampaignAsBrandChange', function (event, campaignData) {
                    campaignSelectModel.setSelectedCampaign(campaignData);
                });

                $scope.viewReports = function (campaign, source) {
                    var selectedCampaign = {
                        id: campaign.id,
                        name: campaign.name,
                        startDate: campaign.startDate,
                        endDate: campaign.endDate,
                        kpi: campaign.kpiType
                    };

                    campaignSelectModel.setSelectedCampaign(selectedCampaign);
                    kpiSelectModel.setSelectedKpi(selectedCampaign.kpi);
                    strategySelectModel.setSelectedStrategy(vistoconfig.LINE_ITEM_DROPDWON_OBJECT);
                    $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
                    $location.path('/mediaplans/' + campaign.id);

                    if (source === 'campaignCard') {
                        $('.main_navigation .each_nav_link').removeClass('active_tab');
                        $('#reports_nav_link').addClass('active_tab');
                    }
                };

                $scope.loadMoreStrategies = function (campaignId) {
                    var pageSize = 3,

                        campaign = _.find($scope.campaigns.campaignList, function (c) { // jshint ignore:line
                            return c.orderId === parseInt(campaignId);
                        }),

                        loadMoreData = campaign.campaignStrategiesLoadMore,
                        moreData;

                    if (loadMoreData.length) {
                        moreData = loadMoreData.splice(0, pageSize);

                        _.each(moreData, function (s) { // jshint ignore:line
                            campaign.campaignStrategies.push(s);
                        });
                    }
                };

                $scope.loadMoreTactics = function (strategyId, campaignId) {
                    var pageSize = 3,

                        campaign = _.find($scope.campaigns.campaignList, function (c) { // jshint ignore:line
                            return c.orderId === parseInt(campaignId);
                        }),

                        strategy = _.find(campaign.campaignStrategies, function (s) { // jshint ignore:line
                            return s.id === parseInt(strategyId);
                        }),

                        loadMoreData = strategy.strategyTacticsLoadMore,
                        moreData;

                    if (loadMoreData.length) {
                        moreData = loadMoreData.splice(0, pageSize);

                        _.each(moreData, function (t) { // jshint ignore:line
                            strategy.strategyTactics.push(t);
                        });
                    }
                };

                $scope.goToLocation = function (url) {
                    utils.goToLocation(url);
                };

                $scope.highlightSearch = function (text, search) {
                    return utils.highlightSearch(text, search);
                };

                // Search Clear Data
                $scope.searchHideInput = function () {
                    $('.searchInputForm input').val('');

                    if ($scope.isCampaignSearched) {
                        $scope.isCampaignSearched = false;
                        $scope.campaigns.searchTerm = '';
                        $scope.searchTerm = '';
                        $scope.campaigns.resetFilters();
                        $scope.campaigns.fetchData();
                    }
                };

                //Lazy Loader
                $(window).scroll(function () {
                    // Don't attempt to scroll if:
                    // - there's no data, or
                    // - last page is already loaded.
                    if ($scope.campaigns.dashboard.quickFilterSelectedCount <= 5 ||
                        (($scope.campaigns.performanceParams.nextPage - 1) * 5 >=
                        $scope.campaigns.dashboard.quickFilterSelectedCount)) {
                        $scope.campaigns.loadMoreCampaigns = false;
                        return;
                    }

                    if (!$scope.campaigns.busy && ($(window).scrollTop() +
                        $(window).height() > $(document).height() - 100)) {
                        $scope.campaigns.loadMoreCampaigns = true;
                        if ($scope.campaigns.searchTerm) {
                            $scope.campaigns.fetchData($scope.campaigns.searchTerm);
                        } else {
                            $scope.campaigns.fetchData();
                        }
                    }
                });

                $scope.$on('$locationChangeStart', function (event, next) {
                    var currentLocation = next,
                        isMediaPlanList;

                    if (currentLocation.indexOf('mediaplans?filter') <= -1) {
                        isMediaPlanList = currentLocation.split('/')[4];

                        if (!isMediaPlanList) {
                            $(window).unbind('scroll');
                        }
                    }
                });
            }
        );
    }
);
