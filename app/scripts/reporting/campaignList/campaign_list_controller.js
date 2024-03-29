define(['angularAMD', 'kpi-select-model', 'campaign-list-model', 'campaign-select-model', 'strategy-select-service', 'common-utils', 'gauge-model',
    'campaign-list-filter-directive', 'campaign-cost-sort', 'campaign-card', 'campaign-list-sort', 'quartiles-graph', 'campaign-chart', 'campaign-cost-card'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignListController', ['$scope', '$rootScope', '$routeParams', '$location', 'kpiSelectModel', 'campaignListModel', 'campaignSelectModel',
        'strategySelectModel', 'utils', 'constants', 'vistoconfig', 'brandsModel', 'loginModel', 'gaugeModel', 'RoleBasedService', 'urlBuilder', 'featuresService',
        'campaignListService', 'localStorageService', 'pageLoad',
        function ($scope, $rootScope, $routeParams, $location, kpiSelectModel, campaignListModel, campaignSelectModel, strategySelectModel, utils, constants, vistoconfig,
                  brandsModel, loginModel, gaugeModel, RoleBasedService, urlBuilder, featuresService, campaignListService, localStorageService, pageLoad) {
            var fParams = featuresService.getFeatureParams(),
                forceLoadCampaignsFilter,

                enableFeaturePermission = function () {
                    $scope.showCreateMediaPlan = fParams[0].create_mediaplan;
                    $scope.showCostTab = fParams[0].cost;
                };

            console.log('CAMPAIGN LIST (Media Plans List) controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            // Hot fix to show the campaign tab selected
            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#campaigns_nav_link')
                .addClass('active');

            $('.main_navigation_holder')
                .find('.active_tab')
                .removeClass('active_tab');

            // Resets Header
            $('.main_navigation_holder .main_nav .main_navigation .each_nav_link.active .arrowSelect').show();
            $('.each_nav_link').removeClass('active_tab');
            $('#campaigns_nav_link').addClass('active_tab');

            enableFeaturePermission();

            if(vistoconfig.getNoMediaPlanFoundMsg()) {
                utils.cleanSearchParameter();
                $rootScope.setErrAlertMessage(vistoconfig.getNoMediaPlanFoundMsg());
                vistoconfig.setNoMediaPlanFoundMsg(null);
            }

            $rootScope.$on('features', function () {
                var fParams = featuresService.getFeatureParams();

                $scope.showPerformanceTab = fParams[0].performance;
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

            $scope.$watch('campaigns.realTimeData', function(val){
                campaignListService.setIsRealTimeData(val);
                var scopeCampaigns = $scope.campaigns;
                scopeCampaigns.noData = false;
                scopeCampaigns.resetSortingField('start_date');
                scopeCampaigns.resetFilters();
                scopeCampaigns.fetchData();
            });


            $scope.selectCardView = function (event, type) {
                var elem = $(event.currentTarget);

                type = type && type.toLowerCase();

                if ( !elem.hasClass('active')) {
                    $scope.campaigns.realTimeData = !$scope.campaigns.realTimeData;
                    $('#realTimeToggleBtn').find('.active').removeClass('active');
                    elem.addClass('active');
                    if(type==='realtime') {
                        $('#realTimeMessage').show();
                    } else {
                        $('#realTimeMessage').hide();
                    }
                    localStorageService.mediaPlanView.set(type);
                    $location.search('dataView', type);
                }
            };

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

            $('html').css('background', '#fff');

            // Based on gauge click, load the filter and reset data set after gauge click.
            if (gaugeModel.dashboard.selectedFilter !== '') {
                forceLoadCampaignsFilter = gaugeModel.dashboard.selectedFilter;
            }

            $scope.campaigns.fetchDashboardData(forceLoadCampaignsFilter);
            gaugeModel.resetDashboardFilters();

            $scope.$on('fromCampaignDetails', function (event, args) {
                $scope.loadMoreStrategies(args.campaignId);
            });

            // broadcasting from campaignListModel.js
            $scope.$on('updateCampaignAsBrandChange', function (event, campaignData) {
                campaignSelectModel.setSelectedCampaign(campaignData);
            });

            $scope.viewReports = function (campaign) {
                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {
                    url += '/sa/' + $routeParams.subAccountId;
                }

                url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                url += '/mediaplans/' + campaign.id + '/overview';
                $location.url(url);
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

            var fetchDataOnScroll = function() {
                // Don't attempt to scroll if:
                // - there's no data, or
                // - last page is already loaded.
                if ($scope.campaigns.dashboard.quickFilterSelectedCount <= 5 || (($scope.campaigns.performanceParams.nextPage - 1) * 5 >=
                    $scope.campaigns.dashboard.quickFilterSelectedCount)) {
                    $scope.campaigns.loadMoreCampaigns = false;
                    return;
                }
                if (!$scope.campaigns.busy && ($(window).scrollTop() + $(window).height() > $(document).height() - 100)) {
                    $scope.campaigns.loadMoreCampaigns = true;

                    if ($scope.campaigns.searchTerm) {
                        $scope.campaigns.fetchData($scope.campaigns.searchTerm);
                    } else {
                        $scope.campaigns.fetchData();
                    }
                }

            };

            //the function will be called after it stops being called for N milliseconds.
            $(window).on('scroll', _.debounce(fetchDataOnScroll, 200));


            $scope.navigateToMediaPlanCreatePage = function() {
                $location.url(urlBuilder.mediaPlanCreateUrl());
            };

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
        }]);
});
