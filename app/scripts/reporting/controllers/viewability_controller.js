define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_service', 'common/services/data_service',
    'reporting/models/domain_reports', 'common/services/constants_service', 'common/services/vistoconfig_service',
    'reporting/timePeriod/time_period_model', 'login/login_model', 'common/services/url_service',
    'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model',
    'reporting/strategySelect/strategy_select_directive', 'reporting/strategySelect/strategy_select_controller',
    'reporting/timePeriod/time_period_pick_directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('ViewabilityController', function ($scope, kpiSelectModel, campaignSelectModel,
                                                             strategySelectModel, dataService, domainReports, constants,
                                                             vistoconfig, timePeriodModel, loginModel, urlService,
                                                             advertiserModel, brandsModel) {
        var extractAdFormats =  function () {
            $scope.adFormats = domainReports.checkForCampaignFormat(strategySelectModel.allAdFormats());
            $scope.videoMode = $scope.adFormats && $scope.adFormats.videoAds;
        };

        $scope.textConstants = constants;

        // highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.strategyLoading = true;
        $scope.apiReturnCode = 200;

        // set the default sort type
        $scope.sortType = '-view_metrics.ias_imps_delivered';

        // set the default sort type
        $scope.sortTypeForVidView = '-view_metrics.video_viewability_metrics.videos_deliverable_imps';

        $scope.sortReverse = false;

        // set the default sort order
        $scope.sortReverseDefaultSelection  = true;

        $scope.sortTypeForVideos = '-view_metrics.video_viewability_metrics.videos_deliverable_imps';
        $scope.sortReverseForVidView = true;

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;

            if (!campaign || campaign.id === -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >= 500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() === 'Yet to start') {
                return constants.MSG_CAMPAIGN_YET_TO_START;
            }  else if (campaignSelectModel.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            }  else if ($scope.selectedCampaign.kpi === 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else if (dataSetType === 'viewability') {
                return constants.MSG_METRICS_NOT_TRACKED;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };

        $scope.filters = domainReports.getReportsTabs();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null
        };

        $scope.strategyLoading =  true;

        $scope.init = function () {
            var fromLocStore;

            $scope.viewData = {};
            $scope.strategyBusy = false;
            $scope.tacticBusy = false;
            $scope.strategyFound = false;
            $scope.isStrategyDropDownShow = true;
            $scope.strategyLoading =  true;
            $scope.selectedFilters = {};

            fromLocStore = localStorage.getItem('timeSetLocStore');

            if (fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selectedFilters.time_filter = fromLocStore;
            } else {
                $scope.selectedFilters.time_filter = 'life_time';
            }

            $scope.selectedFilters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase();
            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
        };

        $scope.init();

        // Function called to show Strategy list
        $scope.strategyViewData = function (param) {
            var strategiesList = {},

                errorHandler = function () {
                    $scope.dataNotFound = true;
                    $scope.strategyBusy = false;
                },

                dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),
                url,

                queryObj = {
                    campaignId: $scope.selectedCampaign.id,
                    clientId:  loginModel.getSelectedClient().id,
                    advertiserId: advertiserModel.getSelectedAdvertiser().id,
                    brandId: brandsModel.getSelectedBrand().id,
                    dateFilter: dateFilter
                };

            $scope.strategyBusy = true;
            $scope.apiReturnCode = 200;

            if (_.has(param, 'strategyId') && param.strategyId >= 0) {
                queryObj.queryId =  13;
                queryObj.strategyId = param.strategyId;
            } else {
                queryObj.queryId =  12;
            }

            url = urlService.APIVistoCustomQuery(queryObj);

            dataService.fetch(url).then(function (result) {
                $scope.strategyLoading =  false;
                if (result.status === 'OK' || result.status === 'success' || result.status === 204) {

                    // if data not empty
                    if (result.data !== '') {
                        strategiesList = result.data.data;
                        $scope.viewData = strategiesList;
                        $scope.strategyBusy = false;

                        ($scope.selectedStrategy.id >= 0) && (
                            _.each(strategiesList.viewability_metrics, function (item) {
                                if (item.ad_group_id === -1 && item.ad_id === -1) {
                                    $scope.viewData.view_metrics = angular.copy(item);
                                }
                            }),

                            $scope.viewData.viewability_metrics =
                                _.filter($scope.viewData.viewability_metrics, function (item) {
                                    return (item.ad_group_id !== -1 && item.ad_id !== -1);
                                })
                        );

                        if (strategiesList) {
                            $scope.dataNotFound = false;

                            $scope.strategyHeading = Number($scope.selectedStrategy.id) ===
                                vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ?
                                constants.MEDIA_PLAN_TOTAL : constants.LINE_ITME_TOTAL;
                        } else {
                            errorHandler();
                        }
                    } else {
                        // if data is empty set as data not found
                        errorHandler();
                    }
                } else {
                    // Means no strategy data found
                    if (result.status ==='error') {
                        $scope.apiReturnCode= result.data.status;
                    }

                    errorHandler();
                }
            }, errorHandler);
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function () {
            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
        });

        // creating download report url
        $scope.createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 30,
                    label: 'Quality by Ad',
                    download_config_id: 1
                },

                {
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 31,
                    label: 'Quality by Domain',
                    download_config_id: 1
                }
            ];
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function () {
            $scope.init();

            // update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        });

        $scope.$watch('selectedCampaign', function () {
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED, function () {
            extractAdFormats();
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name;

            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ?
                constants.CAMPAIGN_TOTAL : constants.AD_GROUP_TOTAL;

            $scope.callBackStrategyChange();
        });


        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
            $scope.selectedFilters.time_filter = strategy;
            $scope.callBackStrategyChange();
            $scope.createDownloadReportUrl();
        });

        // Function is called from startegyList directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};

            if ($scope.selectedStrategy.id === -99) {
                $scope.strategyFound = false;
            } else {
                $scope.strategyFound = true;

                $scope.strategyViewData({
                    campaign_id: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    kpi_type: $scope.selectedFilters.kpi_type,
                    time_filter: $scope.selectedFilters.time_filter
                });
            }

            // Call the chart to load with the changed campaign id and strategyid
            $scope.viewabilityBusy = false;
        };

        $scope.removeActivesForVidSelect = function () {
            $('.icon_text_holder').removeClass('active');
            $('.viewability_header .sec_col .icon_text_holder').addClass('active');
        };

        $scope.sortClassFunction = function (a, b, c) {
            var isActive = (a === b) ?  'active' : '',
                sortDirection = (c === true) ?  'sort_order_up' : 'sort_order_down';

            if ($('.kpi-dd-holder').hasClass('active')) {
                $('.each_cost_col').removeClass('active');
                return sortDirection;
            } else{
                return isActive + ' ' + sortDirection;
            }
        };

        $scope.removeKpiActive = function () {
            var kpiArrowSort = $('.kpi_arrow_sort'),
                dropListLi = $('.drop_list li');

            $('.dropdown_ul_text').removeClass('active');
            kpiArrowSort.removeClass('active');
            $('.kpi-dd-holder').removeClass('active');
            dropListLi.removeClass('active');
            kpiArrowSort.removeClass('is_active_point_down');
            kpiArrowSort.removeClass('is_active_point_up');
            dropListLi.css('color', '#000');
        };


        $scope.$on('dropdown-arrow-clicked', function (event, args, sortOrder) {
            $scope.sortType = 'view_metrics.' + args;
            $scope.sortTypeSubSort = 'tactic.' + args;
            $scope.sortReverse  = sortOrder;
        });

        // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function () {
            var mainNavigation = $('.main_navigation');

            mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
            mainNavigation.find('.reports_sub_menu_dd_holder').find('#quality').addClass('active_tab');
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown
    });
});
