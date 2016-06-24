define(['angularAMD', 'reporting/campaignSelect/campaign_select_model', 'reporting/kpiSelect/kpi_select_model', 'reporting/advertiser/advertiser_model',
    'reporting/strategySelect/strategy_select_model', 'reporting/brands/brands_model', 'common/services/data_service',
    'common/utils', 'login/login_model', 'common/services/url_service',
    'common/services/constants_service', 'reporting/timePeriod/time_period_model', 'reporting/models/domain_reports',
    'common/services/vistoconfig_service','reporting/strategySelect/strategy_select_directive','reporting/strategySelect/strategy_select_controller',
    'reporting/timePeriod/time_period_pick_directive','reporting/kpiSelect/kpi_select_directive'],function (angularAMD) {
    'use strict';
    angularAMD.controller('CostController', function ( $scope, $window,
                                                       campaignSelectModel, kpiSelectModel, advertiserModel,
                                                       strategySelectModel, brandsModel, dataService,
                                                       utils, loginModel, urlService,
                                                       constants, timePeriodModel, domainReports,
                                                       vistoconfig) {

        $scope.textConstants = constants;

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();
        domainReports.highlightSubHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];
        $scope.api_return_code = 200;
        $scope.strategyMarginValue = -1 ;
        $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;
        var selectedBrand = brandsModel.getSelectedBrand();

        var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;
            if (!campaign || campaign.id == -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.api_return_code == 404 || $scope.api_return_code >=500)
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            else if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };

        $scope.filters = domainReports.getReportsTabs();

        $scope.sortType     = '-impressions'; // set the default sort type
        $scope.sortReverse  = false; // set the default sort order
        $scope.sortReverseDefaultSelection  = true;

        $scope.sortByColumn = 'name';
        $scope.strategyLoading =  true;

        $scope.download_urls = {
            cost: null
        };

        $scope.init = function(){
            $scope.strategyCostData = [];
            $scope.tacticsCostData = [];
            $scope.tacticList = {};

            $scope.dataNotFound = false;
            $scope.strategyFound = false;
            $scope.strategyLoading =  true;

            $scope.strategyCostBusy = false ;
            $scope.tacticListCostBusy = false ;
            $scope.costReportDownloadBusy = false;
            $scope.isStrategyDropDownShow = true;
            $scope.strategyMarginValue = -1 ;
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;
//            $scope.isCostModelTransparent = true;

            $scope.selected_filters = {};
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

            var fromLocStore = localStorage.getItem('timeSetLocStore');
             if(fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selected_filters.time_filter = fromLocStore;
             }
             else {
                $scope.selected_filters.time_filter = 'life_time';
             }
        };

       $scope.init();

        $scope.strategiesCostData = function (param) {
            $scope.strategyCostBusy = true;
            $scope.tacticCostBusy = false;
            var errorHandler =  function(result) {
//                if(result && result.status == 204) {
//                    $scope.isCostModelTransparent = true;
//                }
                $scope.dataNotFound = true;
                $scope.strategyCostBusy = false;
                $scope.tacticCostBusy = false;
            }
            $scope.api_return_code=200;
            var datefilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);
            var queryObj = {
                clientId: loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: datefilter
            };
            if (_.has(param, 'strategyId') && param.strategyId >= 0) {
                queryObj.queryId = 15; // cost_report_for_given_ad_group_id
                queryObj.campaignId = param.campaignId,
                queryObj.strategyId = param.strategyId;

            } else {
                queryObj.queryId = 14; // cost_report_for_one_or_more_campaign_ids
                queryObj.campaignIds = param.campaignId;
            }

            var url = urlService.APIVistoCustomQuery(queryObj);
            dataService.fetch(url).then(function(result) {
                    $scope.strategyLoading =  false;
                    if (result.status === "OK" || result.status === "success") {
                        var data = result.data.data ;
                        if(typeof data != "undefined" && data != null && data.length >0){
                            $scope.dataNotFound = false;
//                            $scope.isCostModelTransparent = $scope.strategyCostData[0].cost_transparency;
//                            if($scope.isCostModelTransparent ===  false) {
//                                $scope.isCostModelTransparentMsg = $scope.strategyCostData[0].message;
//                            }
                            var marginPercentage = function(item) {
                                if (item.gross_rev && item.gross_rev != 0) {
                                    item.margin = item.margin * 100 / item.gross_rev;
                                }
                            };
                            var sumTechFeesNServiceFees = function(item) {
                                if (item.tech_fees == null && item.service_fees == null) {
                                    item.tech_service_fees_total = null;
                                } else {
                                    item.tech_service_fees_total = (item.tech_fees == null ? 0 : item.tech_fees) + (item.service_fees == null ? 0 : item.service_fees);
                                }
                            };
                            _.each(data,function(item){
                                if(item.ad_id == undefined || item.ad_id == -1){
                                    $scope.strategyCostBusy = false;
                                    $scope.strategyMarginValue =  item.margin;
                                    if (item.pricing_method && item.pricing_method === constants.PRICING_METHOD_CPM){
                                        $scope.strategyMarginUnit = constants.SYMBOL_DOLLAR;
                                    }
                                    if(!utils.hasItem($scope.strategyCostData,"campaign_id", item.campaign_id)) {
                                        item.kpi_type = $scope.selected_filters.campaign_default_kpi_type;
                                        sumTechFeesNServiceFees(item);
                                        marginPercentage(item);
                                        $scope.strategyCostData.push(item);
                                    }
                                }else{
                                    if(!utils.hasItem($scope.tacticsCostData,"ad_id", item.ad_id)) {
                                        sumTechFeesNServiceFees(item);
                                        marginPercentage(item);
                                        $scope.tacticsCostData.push(item);
                                    }
                                }
                            });
                        }
                        else{
                            errorHandler(result);
                        }
                    }
                    else {
                        $scope.api_return_code=result.data.status;
                        errorHandler(result);
                    }
                }, errorHandler);

        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
        });

        var dataHeader = function() {
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ? constants.MEDIA_PLAN_TOTAL : constants.LINE_ITME_TOTAL;
            $scope.viewLabelTxt = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ? constants.INCLUDES_FIXED_COSTS : constants.EXCLUDES_MEDIA_PLAN_FIXED_COSTS;
        }

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.selected_filters.time_filter = strategy;
            $scope.createDownloadReportUrl();
            $scope.callBackStrategyChange();
            dataHeader();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.callBackStrategyChange();
            dataHeader();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            //var clientId =  loginModel.getSelectedClient().id;
            $scope.strategyMarginValue = -1 ;
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            $scope.download_report = [
                {
                    'url' : '/reportBuilder/customQueryDownload',
                    'query_id': 16,
                    'label' : 'Cost Report',
                    'className' : 'report_cost',
                    'download_config_id': 1
                }
            ];
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            $scope.strategyCostData = [];
            $scope.tacticsCostData = [];
            $scope.tacticList = {};
            $scope.dataNotFound = false ;
            $scope.strategyMarginValue = -1 ; // resetting strategy margin before each strategy call
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            if($scope.selectedStrategy.id == -99) {
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.strategiesCostData({
                    campaignId: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    startDate: $scope.selectedCampaign.startDate,
                    endDate: $scope.selectedCampaign.endDate,
                    timeFilter: $scope.selected_filters.time_filter
                });
              // grunt  analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
        };


        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        });
        $scope.$on('dropdown-arrow-clicked', function(event, args,sortorder) {
            $scope.sortType = "kpi_metrics."+args;
            $scope.sortTypeSubSort ="kpi_metrics."+args;
            $scope.sortReverse  = sortorder;
        });

        $scope.removeKpiActive = function(){
           /* $('#kpi_dropdown').removeClass( "active" );*/
            $(".drop_list li").css("color", "#57606d");
            $('.kpi-dd-holder').removeClass( "active" );
            $('.dropdown_ul_text').removeClass( "active" );
            $('.drop_list li').removeClass( "active" );
            $('.direction_arrows div.kpi_arrow_sort').removeClass( "active" );

        };

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === b ) ?  'active' : '';
            var sortDirection = (c === true ) ?  'sort_order_up' : 'sort_order_down';

            return isActive + " " + sortDirection;
        };
        // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function(){
            $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ;
            $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#cost").addClass("active_tab") ;
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown

    });
});
