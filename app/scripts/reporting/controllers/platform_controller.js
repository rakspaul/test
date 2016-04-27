define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model',
        'common/services/data_service', 'common/services/constants_service', 'reporting/models/domain_reports',
        'reporting/timePeriod/time_period_model', 'login/login_model', 'common/services/role_based_service',
        'reporting/advertiser/advertiser_model', 'reporting/brands/brands_model',
        'common/services/url_service', 'common/services/features_service', 'common/services/request_cancel_service',
        'reporting/strategySelect/strategy_select_directive','reporting/strategySelect/strategy_select_controller','reporting/timePeriod/time_period_pick_directive',
        'reporting/kpiSelect/kpi_select_directive'
    ],

    function (angularAMD) {    'use strict';
        angularAMD.controller('PlatformController', function ($scope, $rootScope, kpiSelectModel, campaignSelectModel, strategySelectModel,
                                                      dataService, constants, domainReports,
                                                      timePeriodModel, loginModel, RoleBasedService,
                                                      advertiserModel, brandsModel,
                                                      urlService, featuresService, requestCanceller) {
        var _currCtrl = this;

        $scope.textConstants = constants;

        $scope.sortType = 'impressions'; // set the default sort type


        $scope.sortTypebyPerformance = '-impressions';
        $scope.sortTypebyCost = '-impressions';
        $scope.sortTypebyViewability = '-other_view_impressions';
        $scope.sortTypebyMargin = '-impressions';
//        $scope.sortTypeSubSort           = 'impressions'; // set the default sort type

        $scope.sortReverse = false; // set the default sort order
        $scope.sortReverseForPerfImps = true;
        $scope.sortReverseForCostImps = true;
        $scope.sortReverseForQualImps = true;
        $scope.sortReverseForMarginImps = true;
        $scope.sortReverseKpiDropdown = true; // set the default sort order
        $scope.sortReverseForCostscpm = true;
        $scope.sortReverseForCostscpa = true;
        $scope.sortReverseForCostscpc = true;
        $scope.kpiDropdownActive = {};

        $scope.isStrategyDropDownShow = true;

        if ($scope.selected_tab == "performance") {
            $scope.sortType = 'impressions';
//            $scope.sortTypeSubSort = 'impressions'
        }
        else if ($scope.selected_tab == "viewability") {
            $scope.sortType = 'other_view_impressions';
//            $scope.sortTypeSubSort = 'other_view_impressions';
        }
        else {
            $scope.sortType = 'impressions';
//            $scope.sortTypeSubSort = 'impressions';
        }
        $scope.strategyLoading = true;
        $scope.strategyFound = true;
        $scope.videoMode = true;

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        //setting selected campaign into $scope.
        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();

        //setting selected strategy into $scope.
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();

        //building the reports tab (Performance, Cost, Platform, Inventory, Viewability, Optmization Report)
        $scope.filters = domainReports.getReportsTabs();

        //set default api return code 200
        $scope.api_return_code = 200;

        $scope.usrRole = RoleBasedService.getClientRole() && RoleBasedService.getClientRole().ui_exclusions;


        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;
            if (!campaign || campaign.id == -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.api_return_code == 404 || $scope.api_return_code >= 500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ($scope.selectedCampaign.kpi == 'null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };

        //set default selected tab to Performance.
        $scope.selected_tab = 'performance';


        $scope.getPlatformData = function () {
            var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);
            var param = {
                campaignId: $scope.selectedCampaign.id,
                clientId: loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: datefilter
            };

            if ($scope.selected_tab === "margin") {
                param.dateFilter = "life_time";
                if (Number($scope.selectedStrategy.id) >= 0) {
                    param.queryId = 41;
                    param.strategyId = Number($scope.selectedStrategy.id);
                } else {
                    param.queryId = 40;
                }
            } else {
                if (Number($scope.selectedStrategy.id) >= 0) {
                    param.queryId = 24;
                    param.strategyId = Number($scope.selectedStrategy.id);
                }
                else {
                    param.queryId = 23;
                }
            }


            $scope.performanceBusy = true;
            $scope.costBusy = true;
            $scope.viewabilityBusy = true;
            $scope.marginBusy = true;

            var tab = $scope.selected_tab.substr(0, 1).toUpperCase() + $scope.selected_tab.substr(1);

            var errorHandlerForPerformanceTab = function(result){
                if(result.data.status != 0) {
                    $scope['dataNotFoundFor' + tab] = true;
                }
            }

            $scope.api_return_code = 200;
            var url = urlService.APIVistoCustomQuery(param);
            requestCanceller.cancelLastRequest(constants.PLATFORM_TAB_CANCELLER);
            var canceller = requestCanceller.initCanceller(constants.PLATFORM_TAB_CANCELLER);
            dataService.fetchCancelable(url, canceller, function (result) {
                $scope.strategyLoading = false;
                if (result.status === "OK" || result.status === "success") {
                    $scope.performanceBusy = false;
                    $scope.videoMode = true;
                    $scope.costBusy = false;
                    $scope.viewabilityBusy = false;
                    $scope.marginBusy = false;

                    if (/*$scope.isCostModelTransparent === false && */result.data.data.length === 0) {
                        errorHandlerForPerformanceTab();
                    } else {
                        //  $scope.isCostModelTransparentMsg = result.data.data.message;
                        if (Number($scope.selectedStrategy.id) >= 0) {
                            // strategy selected
                            $scope['platformData'] = _.filter(result.data.data, function (item) {
                                return item.ad_id == -1;
                            });
                            _.each($scope['platformData'], function(item) {
                                item.kpi_type = $scope.selected_filters.campaign_default_kpi_type;
                            });
                            $scope['tacticPlatformData'] = _.filter(result.data.data, function (item) {
                                return item.ad_id != -1;
                            });
                        } else {
                            $scope['platformData'] = result.data.data;
                            _.each($scope['platformData'], function(item) {
                                item.kpi_type = $scope.selected_filters.campaign_default_kpi_type;
                            });
                            $scope['dataNotFoundFor'+tab] = false;
                        }
                    }
                } else {
                    errorHandlerForPerformanceTab(result);
                }
            }, errorHandlerForPerformanceTab);
        },


            //strategy change handler
            $scope.strategyChangeHandler = function () {
                $scope.reportDownloadBusy = false;
                if ($scope.selectedStrategy.id == -99) {
                    $scope.strategyFound = false;
                } else {
                    $scope.strategyFound = true;
                    $scope.getPlatformData();
                    // grunt analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
                }
            };

        //whenever strategy change either by broadcast or from dropdown
        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED, function (event, campaign) {
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
        });

        $scope.$watch('selectedCampaign', function () {
            $scope.createDownloadReportUrl();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var download_report = [
                {
                    'url': '/reportBuilder/customQueryDownload',
                    'query_id': 24,
                    'label': 'Platform by Performance',
                    'download_config_id': 1
                },
                {
                    'url': '/reportBuilder/customQueryDownload',
                    'query_id': 24,
                    'label': 'Platform by Cost',
                    'className': 'report_cost',
                    'download_config_id': 2

                },
                {
                    'url': '/reportBuilder/customQueryDownload',
                    'query_id': 24,
                    'label': 'Platform by Quality',
                    'download_config_id': 3
                }
            ];

            var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
            if (!isAgencyCostModelTransparent) { //if agency level cost model is opaque
                download_report = _.filter(download_report, function (obj, idx) {
                    return obj.report_name !== 'by_cost'
                });
            }

            $scope.download_report = download_report;
        };

        var extractAdFormats=  function() {
            var strategyObj = strategySelectModel.getStrategyObj();
            var selectedStrategyObj = strategySelectModel.getSelectedStrategy();
            if(strategyObj.strategies && strategyObj.strategies.length > 0) {
                if (Number(selectedStrategyObj.id) === -1) {
                    var adFormatsArr = [];
                    _.each(strategyObj.strategies, function (obj) {
                        if(obj.ad_formats && obj.ad_formats.length >0) {
                            _.each(obj.ad_formats, function (value) {
                                adFormatsArr.push(value)
                            });
                        }
                    })
                    adFormatsArr = _.compact(_.uniq(adFormatsArr))
                    $scope.adFormats = domainReports.checkForCampaignFormat(adFormatsArr);

                } else {
                    adFormatsArr = _.filter(strategyObj.strategies, function (obj) {
                        return obj.id === Number(selectedStrategyObj.id)
                    });
                    if (adFormatsArr && adFormatsArr.length > 0) {
                        $scope.adFormats = domainReports.checkForCampaignFormat(adFormatsArr[0].ad_formats);
                    }
                }
                if ($scope.adFormats.length > 0 && $scope.adFormats.displayAds && !$scope.adFormats.videoAds) {
                    $scope.videoMode = false;
                }
            }
        }

        //whenever strategy change either by broadcast or from dropdown
        $scope.$on(constants.EVENT_STRATEGY_CHANGED, function (event, strategy) {
            var selectedStrategyObj = strategySelectModel.getSelectedStrategy();
            var strategyObj = strategySelectModel.getStrategyObj();
            extractAdFormats();
            $scope.selectedStrategy.id = selectedStrategyObj.id;
            $scope.selectedStrategy.name = selectedStrategyObj.name;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === constants.ALL_STRATEGIES_OBJECT.id ? 'Media Plan total' : 'Ad Group total';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        //resetting the variable
        $scope.resetVariables = function () {
            $scope.performanceBusy = false;
            $scope.costBusy = false;
            $scope.viewabilityBusy = false;
            $scope.marginBusy = false;

            $scope.platformData = [];
            $scope.tacticPlatformData = [];

            $scope.dataNotFoundForPerformance = false;
            $scope.dataNotFoundForCost = false;
            $scope.dataNotFoundForViewability = false;
            $scope.dataNotFoundForMargin = false;
        };

        //event handler which toggle platform
        $scope.togglePlatformRow = function (e) {
            var targetRow = $(e.currentTarget);
            var platformRow = targetRow.closest('.each_row_list');
            if (platformRow.hasClass('expandRow')) {
                platformRow.removeClass('expandRow');
                platformRow.addClass('collapseRow');
            } else {
                platformRow.removeClass('collapseRow');
                platformRow.addClass('expandRow');
            }
            platformRow.find('.platform_row').toggle("slow", function () {
            })
        };


        //Initializing the variable.
        $scope.init = function () {
            $scope.strategyFound = false;
            $scope.strategyLoading = true;
            $scope.api_return_code = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.videoMode = false;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selected_filters = {};

            var fromLocStore = localStorage.getItem('timeSetLocStore');
            if (fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selected_filters.time_filter = fromLocStore;
            }
            else {
                $scope.selected_filters.time_filter = 'life_time';
            }


            $scope.selected_filters.campaign_default_kpi_type = campaignSelectModel.getSelectedCampaign().kpi;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

            $scope.selected_filters.kpi_type = 'cpm';
            $scope.selected_filters2 = {};
            $scope.selected_filters2.kpi_type = 'cpm';
            $scope.someDummyVarDeleteLater = kpiSelectModel.setSelectedKpi('cpm');

        }

        $scope.init();

        //Binding click event on tab and fetch strategy method.
        $(function () {
            $(".each_tab").click(function (event) {
                var tab_id = $(this).attr("id").split("_tab");
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $scope.selected_tab = tab_id[0].split("_")[1];
                $(".view_mode_switch_container").hide();

                var tabImps = ['cpc', 'cpa', 'cpm', 'vtc', 'action_rate', 'ctr'];

                if ($scope.selected_tab === "viewability") {
                    if (jQuery.inArray($scope.sortTypebyViewability, tabImps) != '-1') {
                        $scope.sortTypebyViewability = $scope.sortTypebyViewability;
                        $('.kpi-dd-holder').addClass("active");

                    }
                    else {
                        $scope.sortTypebyViewability = $scope.sortTypebyViewability;
                        $scope.removeKpiActive();
                    }
                }
                else if ($scope.selected_tab === "performance") {
                    if (jQuery.inArray($scope.sortTypebyPerformance, tabImps) != '-1') {
                        $scope.sortTypebyPerformance = $scope.sortTypebyPerformance;
                        $('.kpi-dd-holder').addClass("active");
                    }
                    else {
                        $scope.sortTypebyPerformance = $scope.sortTypebyPerformance;
                        $scope.removeKpiActive();
                    }
                }
                else if ($scope.selected_tab === "cost") {
                    if (jQuery.inArray($scope.sortTypebyCost, tabImps) != '-1') {
                        $scope.sortTypebyCost = $scope.sortTypebyCost;
                        $('.kpi-dd-holder').addClass("active");
                    }
                    else {
                        $scope.sortTypebyCost = $scope.sortTypebyCost;
                        $scope.removeKpiActive();
                    }
                }
                else if ($scope.selected_tab === "margin") {
                    if (jQuery.inArray($scope.sortTypebyCost, tabImps) != '-1') {
                        $scope.sortTypebyMargin = $scope.sortTypebyMargin;
                        $('.kpi-dd-holder').addClass("active");
                    }
                    else {
                        $scope.sortTypebyMargin = $scope.sortTypebyMargin;
                        $scope.removeKpiActive();
                    }
                }
                if ($scope.selected_tab === "viewability") {
                    $(".view_mode_switch_container").show();
                    $(".lifetime_filter").css("display", "block");
                    if(localStorage.getItem('timeSetTextLocStore') === '"Custom"'){
                        $("#newDatePickerBox").show();
                    }
                }
                 else if ($scope.selected_tab === "cost") {
                    $(".lifetime_filter").css("display", "block");
                    if(localStorage.getItem('timeSetTextLocStore') === '"Custom"'){
                        $("#newDatePickerBox").show();
                    }
                }
                else if ($scope.selected_tab === "performance") {
                    $(".lifetime_filter").css("display", "block");
                    if(localStorage.getItem('timeSetTextLocStore') === '"Custom"'){
                        $("#newDatePickerBox").show();
                    }
                }
                else if ($scope.selected_tab === "margin") {
                    $(".lifetime_filter").css("display", "none");
                    $("#newDatePickerBox").css("display", "none");
                }
                else {
                    $(".view_mode_switch_container").hide();
                }
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.strategyChangeHandler();
                event.preventDefault();
            });
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
            $scope.selected_filters.time_filter = strategy;
            $scope.resetVariables();
            $scope.strategyChangeHandler();

        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function (e) {
            if ($scope.selected_filters == undefined)
                $scope.selected_filters = {};
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.selected_filters2 = {};
            $scope.selected_filters2.kpi_type = kpiSelectModel.getSelectedKpiAlt();
        });

       _currCtrl.filter_download_report = function(type){
            $scope.download_report = _.filter($scope.download_report, function (val, i) {
                if(type == "cost") {
                    return val.className !== "report_cost";
                }
            });
        }
        var fparams = featuresService.getFeatureParams();
        $scope.showCostWidget = fparams[0]['cost'];
        if(!$scope.showCostWidget){
            _currCtrl.filter_download_report("cost");
        }

        var featuredFeatures = $rootScope.$on('features', function () {
            var fparams = featuresService.getFeatureParams();
            $scope.showCostWidget = fparams[0]['cost'];
            if(!$scope.showCostWidget){
                _currCtrl.filter_download_report("cost");
            }
        });


        $scope.$on('dropdown-arrow-clicked', function (event, args, sortorder) {
            if ($scope.selected_tab === "viewability") {
                $scope.sortTypebyViewability = args;
                $scope.sortReverse = sortorder;
//                $scope.sortTypeSubSort = args;
            }
            else if ($scope.selected_tab === "performance") {
                $scope.sortTypebyPerformance = args;
                $scope.sortReverse = sortorder;
//                $scope.sortTypeSubSort = args;
            }
            else if ($scope.selected_tab === "cost") {
                $scope.sortTypebyCost = args;
                $scope.sortReverse = sortorder;
//                $scope.sortTypeSubSort = args;
            }
            else if ($scope.selected_tab === "margin") {
                $scope.sortTypebyMargin = args;
                $scope.sortReverse = sortorder;
//                $scope.sortTypeSubSort = args;
            }
        });


        $scope.removeKpiActive = function () {
            $('.kpi-dd-holder').removeClass("active");
            $('.dropdown_ul_text').removeClass("active");
            $('.drop_list li').removeClass("active");
            $(".drop_list li").css("color", "#57606d");
            $('.direction_arrows div.kpi_arrow_sort.active').hide();
            $('.direction_arrows div.kpi_arrow_sort').removeClass("active");
        };

        $scope.sortClassFunction = function (a, b, c) {
            var isActive = (a === b ) ? 'active' : '';
            var sortDirection = (c === true ) ? 'sort_order_up' : 'sort_order_down';
            if ($('.kpi-dd-holder').hasClass("active")) {
                $('.each_cost_col').removeClass("active");
                return sortDirection;
            }
            else {
                return isActive + " " + sortDirection;
            }
        };

        $scope.platformIconUrl = function (name, iconUrl) {
            return '/images/platform_favicons/' + (iconUrl == 'Unknown' ? 'platform_logo.png' : name.toLowerCase().replace(/ /g, '_') + '.png');
        };

        // hot fix for the enabling the active link in the reports dropdown
        $(function () {
            $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab");
            $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#platform").addClass("active_tab");
        });
        // end of hot fix for the enabling the active link in the reports dropdown
    });
});
