var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('platformController', function ($rootScope, $scope, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;

        //platform icon mapping object.
        var platform_icon_map= {
            'Facebook':'',
            'Everyscreen Media':'assets/images/platform_logos/dstillery_logo.png',
            'ATT Network':'https://www.att.com/favicon.ico',
            'DoubleClick':'assets/images/platform_logos/double_logo.png',
            'AppNexus':'assets/images/platform_logos/appnexus_logo.png',
            'Telemetry':'assets/images/platform_logos/telemetry_logo.png',
            'Collective Bidder':'assets/images/platform_logos/collective_logo.png',
            'Collective Publishers':'assets/images/platform_logos/collective_logo.png',
            'Adap.tv':'https://adap.tv/favicon.ico',
            'Google Ad Exchange':'assets/images/platform_logos/double_logo.png',
            'Prog_Mechanics':'',
            'Yahoo Ad Exchange':'https://www.yahoo.com/favicon.ico',
            'TriVu Media - YouTube':'assets/images/platform_logos/trivumedia_logo.png',
            'Admeld':'assets/images/platform_logos/double_logo.png',
            'Beanstock':'assets/images/platform_logos/beanstock_logo.png',
            'LiveRail':'assets/images/platform_logos/liverail_logo.png',
            'OpenX':'assets/images/platform_logos/openx_logo.png',
            'Pubmatic':'',
            'Rubicon':'assets/images/platform_logos/rubicon_logo.png',
            'Miscellaneous':'assets/images/platform_logos/platform_logo.png',
            'Collective Test Media':'assets/images/platform_logos/collective_logo.png',
            'Microsoft':'https://www.msn.com/favicon.ico'
        };


        $scope.sortType     = 'platformType_aggregation.impression'; // set the default sort type
        $scope.sortTypeSubSort     = 'platformType_aggregation.impression'; // set the default sort type
        $scope.sortReverse  = false; // set the default sort order

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

        //set default selected tab to Performance.
        $scope.selected_tab = 'performance';

        //filtering the platform icon based on platform name from the platform icon mapping object
        $scope.getPlatformIcon=function(platformName) {
            var pIcon=platform_icon_map[platformName];
            return (pIcon!== undefined && pIcon!=='')  ? pIcon:platform_icon_map['Miscellaneous'];
        }

        $scope.getPlatformData =  function() {
            var param = {
                campaignId: $scope.selectedCampaign.id,
                strategyId: Number($scope.selectedStrategy.id),
                strategyStartDate: $scope.selectedCampaign.startDate,
                strategyEndDate: $scope.selectedCampaign.endDate,
                tab: $scope.selected_tab,
                timeFilter: $scope.selected_filters.time_filter
            }

            $scope.performanceBusy = true;
            $scope.costBusy = true;
            $scope.viewabilityBusy = true;

            var tab = param.tab.substr(0, 1).toUpperCase() + param.tab.substr(1);

            var errorHandlerForPerformanceTab = function(result) {
                if(tab === 'Cost' && result && result.status === 204) {
                    $scope.isCostModelTransparent = true;
                }
                $scope.dataNotFoundForPerformance = true;
                $scope.dataNotFoundForCost = true;
                $scope.dataNotFoundForViewability = true;
            }

            $scope.api_return_code=200;
            platformService.getStrategyPlatformData(param).then(function (result) {
                if(param.tab == "performance"){
                    $scope.sortType = 'performanceData.platformType_aggregation.impressions';
                    $scope.sortTypeSubSort='impressions'
                }
                else if(param.tab == "viewability"){
                    $scope.sortType = 'ViewabilityData.platformType_aggregation.ias_imps_delivered';
                    $scope.sortTypeSubSort='platform.ias_imps_delivered';
                }
                else{
                    $scope.sortType = 'platformType_aggregation.impressions';
                    $scope.sortTypeSubSort='platform.impressions';

                }

                if (result.status === "OK" || result.status === "success") {
                    $scope.isCostModelTransparent = result.data.data.cost_transparency;
                    $scope.performanceBusy = false;
                    $scope.costBusy = false;
                    $scope.viewabilityBusy = false;
                    if($scope.isCostModelTransparent === false && result.data.data.platform_metrics[tab.toLowerCase()].length === 0) {
                        errorHandlerForPerformanceTab();
                    } else {
                        $scope.isCostModelTransparentMsg = result.data.data.message;
                        $scope['strategyDataBy' + tab] = result.data.data;
                    }
                } else {
                    errorHandlerForPerformanceTab(result);
                }
            }, errorHandlerForPerformanceTab);
        },



            //strategy change handler
            $scope.strategyChangeHandler = function () {
                $scope.reportDownloadBusy = false;
                if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                    $scope.strategyFound = false ;
                } else {
                    $scope.strategyFound = true;
                    $scope.getPlatformData();
                    analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
                }
            };

        //whenever strategy change either by broadcast or from dropdown
        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();  //update the selected Campaign
            $scope.createDownloadReportUrl();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/platforms/';
            var download_report = [
                {
                    'report_url': urlPath + 'performance/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_performance',
                    'label' : 'Platform by Performance'
                },
                {
                    'report_url' : urlPath + 'cost/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_cost',
                    'label' : 'Platform by Cost',
                    'className' : 'report_cost'
                },
                {
                    'report_url' : urlPath + 'viewability/reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_viewability',
                    'label' : 'Platform By Viewability'
                }
            ];

            var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
            if(!isAgencyCostModelTransparent) { //if agency level cost model is opaque
                download_report =  _.filter(download_report, function(obj, idx) {  return obj.report_name !== 'by_cost'});
            }

            $scope.download_report = download_report;
        };

        //whenever strategy change either by broadcast or from dropdown
        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.isStrategyDataEmpty = false;
            $scope.resetVariables();
            $scope.strategyChangeHandler();
        });

        //resetting the variable
        $scope.resetVariables =  function() {
            $scope.performanceBusy = false;
            $scope.costBusy = false;
            $scope.viewabilityBusy = false;

            $scope.strategyDataByPerformance = [];
            $scope.strategyDataByCost = [];
            $scope.strategyDataByViewability = [];


            $scope.dataNotFoundForPerformance = false;
            $scope.dataNotFoundForCost = false;
            $scope.dataNotFoundForViewability = false;
        };

        //event handler which toggle platform
        $scope.togglePlatformRow = function(e) {
            var targetRow = $(e.currentTarget);
            var platformRow = targetRow.closest('.each_row_list');
            if(platformRow.hasClass('expandRow')) {
                platformRow.removeClass('expandRow'); platformRow.addClass('collapseRow');
            } else {
                platformRow.removeClass('collapseRow'); platformRow.addClass('expandRow');
            }
            platformRow.find('.platform_row').toggle( "slow", function() {
            })
        };

        //Initializing the variable.
        $scope.init= function(){
            $scope.strategyFound = false ;
            $scope.api_return_code = 200;
            $scope.isStrategyDataEmpty = false;
            $scope.strategies = {};
            $scope.resetVariables();
            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
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
        $(function() {
            $(".each_tab").click(function (event) {
                var tab_id = $(this).attr("id").split("_tab")
                $(".reports_tabs_holder").find(".active").removeClass("active");
                /*$("body").find(".seventh_col").removeClass("active");*/
                /*$('.kpi-dd-holder').removeClass( "active" );*/


                $(this).addClass("active");
                $(".reports_block").hide();
                $scope.selected_tab = tab_id[0].split("_")[1];
                if($scope.selected_tab === "viewability") {
                    $(".view_mode_switch_container").show();
                } else {
                    $(".view_mode_switch_container").hide();
                }
                $("#reports_" + tab_id[0] + "_block").show();
                $scope.strategyChangeHandler();
                event.preventDefault();
            });
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
            $scope.callBackKpiDurationChange('duration');
        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            if($scope.selected_filters == undefined)
                $scope.selected_filters = {} ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.selected_filters2 = {};
            $scope.selected_filters2.kpi_type = kpiSelectModel.getSelectedKpiAlt();
        });
        $scope.$on('dropdown-arrow-clicked', function(event, args) {
            $scope.sortType = "platformType_aggregation."+args;
            $scope.sortTypeSubSort ="tactic."+args;
            $scope.sortReverse  = !$scope.sortReverse;
        });


        $scope.removeKpiActive = function(){
            $('.kpi-dd-holder').removeClass( "active" );
        };

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === b ) ?  'active' : '';
            $('.direction_arrows div.kpi_arrow_sort.active').hide();
            var sortDirection = (c === true ) ?  'sort_order_up' : 'sort_order_down';
            return isActive + " " + sortDirection;
        };
    });
}());