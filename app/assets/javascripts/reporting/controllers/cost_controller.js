var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CostController', function ($scope, $window, campaignSelectModel, kpiSelectModel,
                                                  strategySelectModel, brandsModel, dataService, utils,
                                                  domainReports, apiPaths,constants, timePeriodModel,
                                                  loginModel, analytics, urlService) {

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

        $scope.getMessageForDataNotAvailable = function (dataSetType) {
            if ($scope.api_return_code == 404 || $scope.api_return_code >=500)
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
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
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
            $scope.isCostModelTransparent = true;

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
                if(result && result.status == 204) {
                    $scope.isCostModelTransparent = true;
                }
                $scope.dataNotFound = true;
                $scope.strategyCostBusy = false;
                $scope.tacticCostBusy = false;
            }
            $scope.api_return_code=200;

            var queryObj = {
                clientId: loginModel.getSelectedClient().id,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key
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
                        $scope.strategyCostData = result.data.data ;
                        if(typeof $scope.strategyCostData != "undefined" && $scope.strategyCostData != null && $scope.strategyCostData.length >0){
                            $scope.dataNotFound = false;
                            $scope.isCostModelTransparent = $scope.strategyCostData[0].cost_transparency;
                            if($scope.isCostModelTransparent ===  false) {
                                $scope.isCostModelTransparentMsg = $scope.strategyCostData[0].message;
                            }
                            $scope.strategyCostBusy = false;
                            $scope.strategyMarginValue =  $scope.strategyCostData[0].margin ;
                            if ($scope.strategyCostData[0].pricing_method && $scope.strategyCostData[0].pricing_method === constants.PRICING_METHOD_CPM)
                                $scope.strategyMarginUnit = constants.SYMBOL_DOLLAR;
                            if(param.strategyId >= 0 ) {
                                $scope.tacticsCostData = $scope.strategyCostData[0].tactics ;

                                /* COMMENTING THIS OUT AS PER DISCUSSION WITH ANAND XAVIER.  THIS MIGHT COME BACK IN FUTURE.  sriram: July 2nd, 2015 */
                                /*
                                if(localStorage.getItem(loginModel.getUserId()+'_cost_sort') === undefined || localStorage.getItem(loginModel.getUserId()+'_cost_sort') === null) {
                                    $scope.sortFunction($scope.sortByColumn);
                                } else {
                                    $scope.sortByColumn = localStorage.getItem(loginModel.getUserId() + '_cost_sort');
                                    var sortCoulumName = $scope.sortByColumn.replace('-', '');
                                    $scope.sortFunction(sortCoulumName);
                                }
                                */
                            }
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

/* COMMENTING THIS OUT AS PER DISCUSSION WITH ANAND XAVIER.  THIS MIGHT COME BACK IN FUTURE.  sriram: July 2nd, 2015 */
/*
        $scope.sortFunction = function (sortby) {
            for(var i in $scope.sort_field){
                if($scope.sort_field[i].key === sortby){
                    if($scope.sort_field[i]['class']==='active') //simply toggle previous state if the same sortby was previously active
                        $scope.sortByColumn=($scope.sortByColumn.indexOf('-')>=0)?sortby:'-'+sortby;
                    else
                        $scope.sortByColumn = (sortby==='name')?sortby : '-'+sortby;
                    $scope.sort_field[i]['class'] = 'active';
                    $scope.sort_field[i].sortDirection = ($scope.sortByColumn.indexOf('-')>=0 ?'descending':'ascending')
                    var tacticsData = _.chain($scope.tacticsCostData).sortBy(sortby).value();
                    $scope.tacticsCostData = ($scope.sort_field[i].sortDirection === 'ascending') ?  tacticsData : tacticsData.reverse();
                    localStorage.setItem(loginModel.getUserId()+'_cost_sort' ,   $scope.sortByColumn );
                }
                else{
                    $scope.sort_field[i]['class'] = '';
                    $scope.sort_field[i].sortDirection = '';
                }

            }
        };
        */

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === constants.ALL_STRATEGIES_OBJECT.id ? 'Campaign total' : 'Ad Group total';
            $scope.selected_filters.time_filter = strategy;
            $scope.createDownloadReportUrl();
            $scope.callBackStrategyChange();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === constants.ALL_STRATEGIES_OBJECT.id ? 'Campaign total' : 'Ad Group total';


            /* COMMENTING THIS LINE BELOW AS PER DISCUSSION WITH ANAND XAVIER.  THIS MIGHT COME BACK IN FUTURE.  sriram: July 2nd, 2015 */
            // $scope.more_options = Number($scope.selectedStrategy.id) === 0 ?  false : true;


            $scope.callBackStrategyChange();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            //var clientId =  loginModel.getSelectedClient().id;
            //var urlPath = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + '/campaigns/' + $scope.selectedCampaign.id + '/cost/';
            $scope.strategyMarginValue = -1 ;
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            $scope.download_report = [
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 16,
                    'report_type' : 'all',
                    'report_cat' : 'cost',
                    'label' : 'Cost Report',
                    'className' : 'report_cost'
                }
            ];
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
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
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
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
}());
