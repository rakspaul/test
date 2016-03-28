define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model',
        'common/services/data_service', 'reporting/models/domain_reports', 'common/services/constants_service',
        'reporting/timePeriod/time_period_model', 'reporting/brands/brands_model', 'login/login_model',
        'common/services/url_service', 'reporting/advertiser/advertiser_model','reporting/timePeriod/time_period_controller','reporting/kpiSelect/kpi_select_directive',
       'reporting/strategySelect/strategy_select_directive','reporting/strategySelect/strategy_select_controller','reporting/timePeriod/time_period_pick_directive'
    ],

    function (angularAMD) {
    'use strict';
        angularAMD.controller('PerformanceController', function ($scope,$rootScope, kpiSelectModel, campaignSelectModel, strategySelectModel,
                                                                 dataService, domainReports, constants,
                                                                 timePeriodModel, brandsModel, loginModel,
                                                                 urlService, advertiserModel) {

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

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;
            if (!campaign || campaign.id == -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if ( campaignSelectModel.durationLeft() == 'Yet to start')
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
        $scope.vendorList = [];
        var performaceTabMap = [ {'byscreens' : 'Screen'}, {'byformats' : 'Format'}, {'byplatforms' : 'Platform'}, {'bydaysofweek' : 'DOW'}, {'bycreatives' : 'Creatives'}, {'byadsizes' : 'Adsizes'}, {'bydiscrepancy' : 'Discrepancy'}];
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
            var performanceQueryIdMapperWithAllAdsGroup = { 'screen' : 7, 'format' : 8, 'adsizes' : 9, 'creatives' :10, 'dow' :11, 'discrepancy' : 44};
            var performanceQueryIdMapperWithSelectedAdsGroup = { 'screen' : 17, 'format' : 18, 'adsizes' : 19, 'creatives' :20, 'dow' :21, 'discrepancy' : 22};

            var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);

            var param = {
                campaignId: $scope.selectedCampaign.id,
                clientId:  loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: ($scope.selected_tab == "bydiscrepancy") ? "life_time" : datefilter,
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
                $scope['dataNotFoundFor'+tab] = true;
                $scope.showPerfMetrix = false;
            }

            $scope.api_return_code=200;

            var url = urlService.APIVistoCustomQuery(param);
            return dataService.fetch(url).then(function (result) {
                $scope.strategyLoading =  false;
                $scope.vendorList = [];
                if (result.status === "OK" || result.status === "success") {
                    $scope['dataNotFoundFor'+tab] = false;
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
                            // Ad group total
                            $scope.showPerfMetrix = true;
                            $scope['strategyPerfDataBy'+tab]  = _.filter(result.data.data, function(item) { return item.ad_id == -1; })
                            $scope['strategyPerfDataByTactic'+tab]  =_.filter(result.data.data, function(item) { return item.ad_id != -1; });
                            $scope.groupThem = _.chain($scope['strategyPerfDataByTactic'+tab])
                                .groupBy('ad_name')
                                .map(function(value, key) {
                                    return {
                                        name: key,
                                        perf_metrics: value
                                    }
                                })
                                .value();
                        }
                        else{
                            // Media Plan total
                            $scope.showPerfMetrix = false;
                            $scope['strategyPerfDataBy'+tab]  = result.data.data;
                        }
                        if(param.tab == "bydiscrepancy") {
                            _.each($scope['strategyPerfDataBy' + tab], function (item) {
                                var vendorName = (item.nodes.length === 1) ? item.nodes[0].name : item.category;
                                $scope.vendorList.push({"name": vendorName, "imps": item.imps});
                                if(!$scope.selectedVendor){
                                    $scope.selectedVendor = vendorName;
                                    $scope.selectedVendorImps = item.imps;
                                }
                            });
                        }
                    }
                } else {
                    errorHandlerForPerformanceTab(result);
                }
            }, errorHandlerForPerformanceTab);


        };

        $scope.select_vender_option = function(arg){
            $scope.selectedVendor = arg;
            _.each($scope.vendorList, function(item){
                if(item.name == arg){
                    $scope.selectedVendorImps = item.imps;
                }
            });
        }

        $scope.discrepancy_click_first_level = function(index , event){
            $("#discrepancy_2nd_level_"+index).slideToggle();
            var elem = $(event.target);
            elem.closest(".discrepancyTplRow").toggleClass("open");
        }

        $scope.getRateOfDiscrepancy = function(imps1, imps2){
            if(!imps1 && !imps2){
                return "0 %";
            }
            var G_imps, L_imps;
            (imps1 > imps2) ? (G_imps = imps1, L_imps = imps2) : (G_imps = imps2, L_imps = imps1);
            //var L_imps = imps1 > imps2 ? imps1
            return ((G_imps - L_imps) / G_imps) * 100 + "%";
        }

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign) {
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
        });

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

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            var selectedStrategyObj = strategySelectModel.getSelectedStrategy();
            var strategyObj = strategySelectModel.getStrategyObj();
            extractAdFormats();
            $scope.selectedStrategy.id = selectedStrategyObj.id;
            $scope.selectedStrategy.name = selectedStrategyObj.name;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) >= 0 ? 'Ad-Group total' : 'Media Plan total';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    'url': '/reportBuilder/customQueryDownload',
                    'query_id': 29,
                    'label': 'Performance by Screens & Formats',
                    'download_config_id': 1

                },
                {
                    'url': '/reportBuilder/customQueryDownload',
                    'query_id': 19,
                    'label': 'Performance by Ad Sizes',
                    'download_config_id': 1
                },
                {
                    'url' : '/reportBuilder/customQueryDownload',
                    'query_id': 20,
                    'label' : 'Performance by Creatives',
                    'download_config_id': 1
                },
                {
                    'url' : '/reportBuilder/customQueryDownload',
                    'query_id': 21,
                    'label' : 'Performance by Days Of Week',
                    'download_config_id': 1
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
               // grunt analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
        };

        /*$scope.$on(constants.EVENT_SUB_ACCOUNT_CHANGED,function(){
                getPerformanceData();
        });
*/
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
                $rootScope.$broadcast(constants.TAB_CHANGED);
                var tab_id = $(this).attr("id").split("_tab");
                if($scope.kpiDropdownActive == true){
                    $('.icon_text_holder').removeClass( "active" );
                }
                $scope.selected_tab = tab_id[0];
                $scope.isStrategyDropDownShow = ($scope.selected_tab == "bydiscrepancy") ? false : true;
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
});
