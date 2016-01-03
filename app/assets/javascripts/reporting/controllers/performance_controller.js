var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('PerformanceController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, performanceService, utils, dataService, domainReports, apiPaths, constants, timePeriodModel,brandsModel, loginModel, analytics,urlService,advertiserModel, $timeout) {

        $scope.textConstants = constants;

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();
        domainReports.highlightSubHeaderMenu();
        $scope.sortType     = 'impressions';

        $scope.sortTypebyformats     = '-impressions';
        $scope.sortTypebyplatforms     = '-impressions';
        $scope.sortTypebydaysofweek     = '-impressions';
        $scope.sortTypebycreatives     = '-impressions';
        $scope.sortTypebyadsizes     = '-impressions';
        $scope.sortTypeScreens     = '-impressions';

        var performaceTabMap = [ {'byscreens' : 'Screen'}, {'byformats' : 'Format'}, {'byplatforms' : 'Platform'}, {'bydaysofweek' : 'DOW'}, {'bycreatives' : 'Creatives'}, {'byadsizes' : 'Adsizes'}];


        $scope.sortReverse  = false; // set the default sort order
        $scope.sortReverseFormatTab  = false;
        $scope.sortReverseAdSizeTab  = false;
        $scope.sortReverseCreativesTab  = false;
        $scope.sortReverseDaysTab  = false;


        $scope.sortReverseForCostscpm  = true;
        $scope.sortReverseForCostscpa  = true;
        $scope.sortReverseForCostscpc  = true;
        $scope.sortReverseAddSizes  = false;

        $scope.sortReverseForCostscpmFormats  = true;
        $scope.sortReverseForCostscpaFormats  = true;
        $scope.sortReverseForCostscpcFormats  = true;
        $scope.sortReverseAddSizesFormats  = true;

        $scope.sortReverseForCostscpmPlatforms  = true;
        $scope.sortReverseForCostscpaPlatforms   = true;
        $scope.sortReverseForCostscpcPlatforms    = true;
        $scope.sortReverseAddSizesPlatforms    = true;

        $scope.sortReverseForCostscpmDaysofweek  = true;
        $scope.sortReverseForCostscpaDaysofweek  = true;
        $scope.sortReverseForCostscpcDaysofweek  = true;
        $scope.sortReverseAddSizesDaysofweek  = true;

        $scope.sortReverseForCostscpmCreatives  = true;
        $scope.sortReverseForCostscpaCreatives  = true;
        $scope.sortReverseForCostscpcCreatives  = true;
        $scope.sortReverseAddSizesCreatives  = true;

        $scope.sortReverseForCostscpmAdsizes  = true;
        $scope.sortReverseForCostscpaAdsizes  = true;
        $scope.sortReverseForCostscpcAdsizes  = true;
        $scope.sortReverseAddSizesAdsizes  = true;

        $scope.isStrategyDropDownShow = true;


        $scope.characterLimit  = 50;

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];

        $scope.api_return_code = 200;

        $scope.redirectWidget = $scope.selectedCampaign.redirectWidget;
        $scope.getMessageForDataNotAvailable = function (dataSetType) {
            if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            }

            if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };
        $scope.filters = domainReports.getReportsTabs();
        // We should not keep selected tab in $scope.selected_filters object because it is altered by directive_controller in callBackCampaingSuccess and then tab info is not set

            if($scope.redirectWidget && $scope.redirectWidget == 'adsizes') {
                $scope.sortByColumn = 'dimension';
                $scope.activeAdSizeClass = 'active';
                $scope.defaultDisplayAdSize = 'display : block';
                $scope.defaultDisplayFormat = 'display : none';
                $scope.defaultDisplayScreen = 'display : none';
                $scope.selected_tab = 'by'+$scope.redirectWidget.toLowerCase();
            }
            else if($scope.redirectWidget == 'formats') {
                $scope.sortByColumn = 'dimension';
                $scope.activeFormatClass = 'active';
                $scope.defaultDisplayFormat = 'display : block';
                $scope.defaultDisplayAdSize = 'display : none';
                $scope.defaultDisplayScreen = 'display : none';
                $scope.selected_tab = 'by'+$scope.redirectWidget.toLowerCase();
            } else {
                $scope.selected_tab = 'byscreens';
                $scope.sortByColumn = 'name';
                $scope.activeScreenClass = 'active';
                $scope.defaultDisplayScreen = 'display : block';
                $scope.defaultDisplayAdSize = 'display : none';
                $scope.defaultDisplayFormat = 'display : none';
            }



        $scope.strategyLoading =  true;
        $scope.strategyFound = true;
        var performaceTabMap = [ {'byscreens' : 'Screen'}, {'byformats' : 'Format'}, {'byplatforms' : 'Platform'}, {'bydaysofweek' : 'DOW'}, {'bycreatives' : 'Creatives'}, {'byadsizes' : 'Adsizes'}];
        $scope.download_urls = {
            screens: null,
            daysOfWeek: null,
            platforms: null
        };

        $scope.checkForSelectedTabData =  function(data, tab) {
            var totalImpression = _.reduce(data, function(sum, d) { return sum + d.impressions  }, 0);
            return totalImpression === 0;
        };

        $scope.getPerformanceData =  function() {
            var performanceQueryIdMapperWithAllAdsGroup = { 'screen' : 7, 'format' : 8, 'adsizes' : 9, 'creatives' :10, 'dow' :11};
            var performanceQueryIdMapperWithSelectedAdsGroup = { 'screen' : 17, 'format' : 18, 'adsizes' : 19, 'creatives' :20, 'dow' :21};
            var param = {
                campaignId: $scope.selectedCampaign.id,
                clientId:  loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key,
                tab: $scope.selected_tab
            };
            var tab = _.compact(_.pluck(performaceTabMap, [param.tab]))[0];

            if (Number($scope.selectedStrategy.id) >= 0) {
                param.queryId = performanceQueryIdMapperWithSelectedAdsGroup[tab.toLowerCase()];
                param.strategyId = Number($scope.selectedStrategy.id);
            } else {
                param.queryId = performanceQueryIdMapperWithAllAdsGroup[tab.toLowerCase()];
            }

            $scope.screenBusy = true;
            $scope.formatBusy = true;
            $scope.dowBusy = true;
            $scope.creativeBusy = true;
            $scope.adSizesBusy = true;
            $scope.showPerfMetrix = false;


            var errorHandlerForPerformanceTab = function() {
                $scope.dataNotFoundForScreen = true;
                $scope.dataNotFoundForFormat = true;
                $scope.dataNotFoundForDOW = true;
                $scope.dataNotFoundForCreative = true;
                $scope.dataNotFoundForAdSizes = true;
                $scope.showPerfMetrix = false;
            }

            $scope.api_return_code=200;

            return performanceService.getStrategyPerfData(param).then(function (result) {
                $scope.strategyLoading =  false;
                if (result.status === "OK" || result.status === "success") {
                    $scope.hidePerformanceReportTab = $scope.checkForSelectedTabData(result.data.data, tab);
                    if($scope.hidePerformanceReportTab) {
                        errorHandlerForPerformanceTab();
                    } else {
                        $scope.screenBusy = false;
                        $scope.formatBusy = false;
                        $scope.dowBusy = false;
                        $scope.creativeBusy = false;
                        $scope.adSizesBusy = false;

                        if (Number($scope.selectedStrategy.id) >= 0) {
                            $scope.showPerfMetrix = true;
                            $scope['strategyPerfDataBy'+tab]  = _.filter(result.data.data, function(item) { return item.ad_id == -1; })
                            $scope['strategyPerfDataByTactic'+tab]  =_.filter(result.data.data, function(item) { return item.ad_id != -1; });
                            $scope.groupThem = _.chain($scope['strategyPerfDataByTactic'+tab])
                                .groupBy('name')
                                .map(function(value, key) {
                                    return {
                                        name: key,
                                        perf_metrics: value
                                    }
                                })
                                .value();
                        }
                        else{
                            $scope.showPerfMetrix = false;
                            $scope['strategyPerfDataBy'+tab]  = result.data.data;
                        }
                        $scope.adFormats = domainReports.checkForCampaignFormat(result.data.data[0].adFormats);
                    }
                } else {
                    errorHandlerForPerformanceTab(result);
                }
            }, errorHandlerForPerformanceTab);


        };



        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign) {
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) >= 0 ? 'Ad-Group total' : 'Media Plan total';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 29,
                    'report_type' : 'screen_format',
                    'report_cat' : 'performance',
                    'label' : 'Performance by Screens & Formats',
                },
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 21,
                    'report_type' : 'days_of_week',
                    'report_cat' : 'performance',
                    'label' : 'Performance by Days Of Week',
                },
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 20,
                    'report_type' : 'creatives',
                    'report_cat' : 'performance',
                    'label' : 'Performance by Creatives',
                },
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 19,
                    'report_type' : 'ad_size',
                    'report_cat' : 'performance',
                    'label' : 'Performance by Ad Sizes',
                }
            ];
        };

        //Function is called from startegylist directive
        $scope.strategyChangeHandler = function () {
            $scope.reportDownloadBusy = false;
            if($scope.selectedStrategy.id == -99  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.getPerformanceData();
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
        };

        //resetting the variable
        $scope.resetVariables =  function() {
            $scope.screenBusy = false;
            $scope.formatBusy = false;
            $scope.dowBusy = false;
            $scope.creativeBusy = true;
            $scope.adSizesBusy = true;

            $scope.strategyPerfDataByScreen = [];
            $scope.strategyPerfDataByFormat = [];
            $scope.strategyPerfDataByDOW = [];
            $scope.strategyPerfDataByCreative = [];
            $scope.strategyPerfDataByAdsizes = [];


            $scope.dataNotFoundForScreen = false;
            $scope.dataNotFoundForFormat = false;
            $scope.dataNotFoundForDOW = false;
            $scope.dataNotFoundForCreative = false;
            $scope.dataNotFoundForAdSizes = false;

        };

        //Initializing the variable.
        $scope.init= function(){
            $scope.strategyFound = false ;
            $scope.api_return_code = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.hidePerformanceReportTab = false;
            $scope.strategyLoading =  true;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selected_filters = {};

            var fromLocStore = localStorage.getItem('timeSetLocStore');
            if(fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selected_filters.time_filter = fromLocStore;
            }
            else {
                $scope.selected_filters.time_filter = 'life_time';
            }

            $scope.selected_filters.campaign_default_kpi_type =  kpiSelectModel.getSelectedKpi();
            $scope.selected_filters.kpi_type = 'cpm';
            $scope.selected_filters2 = {};
            $scope.selected_filters2.kpi_type = 'cpm';
            $scope.someDummyVarDeleteLater = kpiSelectModel.setSelectedKpi('cpm');

        };

        $scope.init();

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED , function(event,strategy){
            $scope.selected_filters.time_filter = strategy;
            $scope.resetVariables();
            $scope.createDownloadReportUrl();
            $scope.strategyChangeHandler();
        });


        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            if($scope.selected_filters == undefined)
                $scope.selected_filters = {} ;
                $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
                $scope.selected_filters2 = {};
                $scope.selected_filters2.kpi_type = kpiSelectModel.getSelectedKpiAlt();
        });


        $scope.$on('dropdown-arrow-clicked', function (event, args, sortorder) {
            if ($scope.selected_tab == 'byformats') {
                $scope.sortTypebyformats = args;
            }
            else if ($scope.selected_tab == 'bydaysofweek') {
                $scope.sortTypebydaysofweek = args;
            }
            else if ($scope.selected_tab == 'bycreatives') {
                $scope.sortTypebycreatives = args;
            }
            else if ($scope.selected_tab == 'byadsizes') {
                $scope.sortTypebyadsizes = args;
            }
            else if ($scope.selected_tab == 'byplatforms') {
                $scope.sortTypebyplatforms = args;
            }
            else if ($scope.selected_tab == 'byscreens') {
                $scope.sortTypeScreens = args;
                if (args === 'cpm') {
                    $scope.sortReverseForCostscpm = sortorder;
                }
                else if (args === 'cpc') {
                    $scope.sortReverseForCostscpc = sortorder;
                }
                else {
                    $scope.sortReverseForCostscpa = sortorder;
                }
            }
            $scope.sortType = args;
            $scope.sortTypeSubSort = 'tactic.' + args;
            $scope.sortReverse = sortorder;
            $scope.kpiDropdownActive = true;
        });

        $scope.removeKpiActive = function(){
            $('.kpi-dd-holder').removeClass( "active" );
            $('.dropdown_ul_text').removeClass( "active" );
            $('.drop_list li').removeClass( "active" );
            $(".drop_list li").css("color", "#57606d");
            $('.direction_arrows div.kpi_arrow_sort.active').hide();
            $('.direction_arrows div.kpi_arrow_sort').removeClass("active");
        };
        $scope.specialSort = function(passedSortype){
            $scope.sortType = passedSortype;
        };

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === b ) ?  'active' : '';
            $('.direction_arrows div.kpi_arrow_sort.active').hide();
            var sortDirection = (c === true ) ?  'sort_order_up' : 'sort_order_down';
            if($('.kpi-dd-holder').hasClass( "active" )){
                $('.each_cost_col').removeClass( "active" );
                return sortDirection;
            }
            else{
                return isActive + " " + sortDirection;
            }
            return isActive + " " + sortDirection;
        };


        //Binding click event on tab and fetch strategy method.
        $(function() {
            $(".each_tab").click(function (event) {
                var tab_id = $(this).attr("id").split("_tab");
                if($scope.kpiDropdownActive == true){
                    $('.icon_text_holder').removeClass( "active" );
                }
                $scope.selected_tab = tab_id[0];
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.strategyChangeHandler();
                event.preventDefault();
            });
            // hot fix for the enabling the active link in the reports dropdown

            $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ;
            $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#performance").addClass("active_tab") ;

            // end of hot fix for the enabling the active link in the reports dropdown
        });

    });
}());
