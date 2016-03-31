define(['angularAMD', 'reporting/kpiSelect/kpi_select_model', 'reporting/campaignList/campaign_list_model',
    'reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model', 'common/utils',
    'common/services/constants_service', 'reporting/brands/brands_model', 'login/login_model',
    'reporting/models/gauge_model', 'common/services/role_based_service',
    'reporting/campaignList/campaign_list_filter_directive', 'reporting/directives/campaign_cost_sort',
    'reporting/directives/campaign_sort', 'reporting/directives/campaign_card',
    'reporting/directives/campaign_list_sort', 'reporting/common/d3/campaign_chart',
    'reporting/directives/campaign_cost_card'],
    function (angularAMD) {
        angularAMD.controller('CampaignListController',
            function ($scope, $rootScope, $location, kpiSelectModel, campaignListModel, campaignSelectModel,
                      strategySelectModel, utils, constants, brandsModel, loginModel, gaugeModel, RoleBasedService,
                      featuresService) {
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

                var fparams = featuresService.getFeatureParams();
                var enableFeaturePermission = function () {
                    $scope.showCreateMediaPlan = fparams[0].create_mediaplan;
                    $scope.showCostTab = fparams[0].cost;
                };
                enableFeaturePermission();

                var featuredFeatures = $rootScope.$on('features', function () {
                    var fparams = featuresService.getFeatureParams();
                    $scope.showPerformanceTab = fparams[0].performance;
                    enableFeaturePermission();
                });

                $scope.campaigns = new campaignListModel();
                $scope.sortReverse = false;
                $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                $scope.textConstants = constants;

                $scope.searchTerm = '';
                $scope.campaigns.searchTerm = '';
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

                $scope.isWorkFlowUser =
                    RoleBasedService.getClientRole() && RoleBasedService.getClientRole().workFlowUser;

                $scope.$on(constants.EVENT_BRAND_CHANGED, function (event) {
                    $scope.campaigns.filterByBrand(brandsModel.getSelectedBrand());
                    //$scope.campaigns.fetchData();
                });

                $('html').css('background', '#fff');

                // var selectedBrand = brandsModel.getSelectedBrand(); // NOT USED

                $scope.isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

                // NOT USED
                /*var accountChanged = $rootScope.$on(constants.ACCOUNT_CHANGED, function () {
                    $scope.campaigns.fetchData();
                });*/

                /* $rootScope.$on(constants.EVENT_SUB_ACCOUNT_CHANGED, function () {
                    $scope.campaigns.fetchDashboardData();
                });
                */

                //Based on gauge click, load the filter and reset data set after gauge click.
                var forceLoadCampaignsFilter;
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

                $scope.viewReports = function (campaign) {
                    var selectedCampaign = {
                        id: campaign.id,
                        name: campaign.name,
                        startDate: campaign.startDate,
                        endDate: campaign.endDate,
                        kpi: campaign.kpiType
                    };

                    campaignSelectModel.setSelectedCampaign(selectedCampaign);
                    kpiSelectModel.setSelectedKpi(selectedCampaign.kpi);
                    strategySelectModel.setSelectedStrategy(constants.ALL_STRATEGIES_OBJECT);
                    $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
                    //$location.path('/performance');//reportOverview
                    $location.path('/mediaplans/' + campaign.id);
                };

                $scope.loadMoreStrategies = function (campaignId) {
                    var pageSize = 3,
                        campaign = _.find($scope.campaigns.campaignList, function (c) {
                            return c.orderId === parseInt(campaignId);
                        }),
                        loadMoreData = campaign.campaignStrategiesLoadMore,
                        moreData;

                    if (loadMoreData.length) {
                        moreData = loadMoreData.splice(0, pageSize);
                        _.each(moreData, function (s) {
                            campaign.campaignStrategies.push(s);
                        });
                    }
                };

                $scope.loadMoreTactics = function (strategyId, campaignId) {
                    var pageSize = 3,
                        campaign = _.find($scope.campaigns.campaignList, function (c) {
                            return c.orderId === parseInt(campaignId);
                        }),
                        strategy = _.find(campaign.campaignStrategies, function (s) {
                            return s.id === parseInt(strategyId);
                        }),
                        loadMoreData = strategy.strategyTacticsLoadMore,
                        moreData;

                    if (loadMoreData.length) {
                        moreData = loadMoreData.splice(0, pageSize);
                        _.each(moreData, function (t) {
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

                //     $(function () {
                //         $( '#cost_block,#performance_block' ).scroll(function () {
                //             var window_scrollTop = $(window).scrollTop();
                //             /*             var scroll_to_element= $('.squaredFour').offset().top -15;
                //              if (scroll_to_element < window_scrollTop) {
                //              window.scrollTo(0,scroll_to_element);
                //              }*/
                ////             if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
                ////                 var test_height = parseInt($(this).height())+1;
                ////                 $(this).height(test_height);
                ////             }
                //             if (!$scope.campaigns.busy && ($(this).scrollTop() + $(this).innerHeight() >=
                //              $(this)[0].scrollHeight)) {
                //                 $scope.campaigns.fetchData();
                //             }
                //         });
                //     });

                // Search show / hide
                $scope.searchShowInput = function () {
		    $('.searchInputBtn').hide();
                    var searchInputForm = $('.searchInputForm');
		    $('.searchInputBtnInline').show();
                    searchInputForm.show();
                    searchInputForm.animate({width: '400px'}, 'fast');
		    setTimeout(function () { $('.searchClearInputBtn').fadeIn(); }, 300);
                };

                $scope.searchHideInput = function () {
                    var inputSearch = $('.searchInputForm input');

		    $('.searchInputBtn').show();
		    $('.searchClearInputBtn, .searchInputBtnInline').hide();
		    $('.searchInputForm').animate({width: '34px'}, 'fast');
		    setTimeout(function () { $('.searchInputForm').hide(); }, 100);

                    if ($scope.isCampaignSearched) {
                        $scope.isCampaignSearched = false;
                        $scope.campaigns.searchTerm = '';
                        $scope.searchTerm = '';
                        $scope.campaigns.resetFilters();
                        $scope.campaigns.fetchData();
                    }
                };

		$scope.searchClearInput = function () {
		    var inputSearch = $('.searchInputForm input');
		    inputSearch.val('');
		};

		$('body').click(function(e) {
		    if ($(e.target).closest('.searchInput').length === 0) {
			$scope.searchHideInput();
		    }
		});

                //Lazy Loader
                $(window).scroll(function () {
                    // Don't attempt to scroll if:
                    // - there's no data, or
                    // - last page is already loaded.
                    if ($scope.campaigns.dashboard.quickFilterSelectedCount <= 5 ||
                        (($scope.campaigns.performanceParams.nextPage - 1) * 5 >=
                        $scope.campaigns.dashboard.quickFilterSelectedCount)) {
                        return;
                    }

                    if (!$scope.campaigns.busy && ($(window).scrollTop() + $(window).height() >
                        $(document).height() - 100)) {
                        if ($scope.campaigns.searchTerm) {
                            $scope.campaigns.fetchData($scope.campaigns.searchTerm);
                        } else {
                            $scope.campaigns.fetchData();
                        }
                    }
                });

                $scope.$on('$locationChangeStart', function (event, next) {
                    $(window).unbind('scroll');
                });
            }
        );
    }
);
