var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, $window, viewablityService, campaignSelectModel,kpiSelectModel, strategySelectModel, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, analytics) {
        $scope.textConstants = constants;

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.strategyLoading =  true;
        $scope.api_return_code = 200;
        var redirectWidget = $scope.selectedCampaign.redirectWidget;
        if(redirectWidget) {
            $scope.videoMode = redirectWidget === "videoViewability";
        }
        $scope.sortType     = '-view_metrics.ias_imps_delivered'; // set the default sort type
        $scope.sortTypeForVidView     = '-view_metrics.video_viewability_metrics.videos_deliverable_imps'; // set the default sort type
        $scope.sortReverse  = false; // set the default sort order
        $scope.sortReverseDefaultSelection  = true;

        $scope.sortTypeForVideos    = '-view_metrics.video_viewability_metrics.videos_deliverable_imps';
        $scope.sortReverseForVidView  = true;

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
            else if (dataSetType == 'viewability')
                return constants.MSG_METRICS_NOT_TRACKED;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };
        $scope.filters = domainReports.getReportsTabs();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
        };
        $scope.strategyLoading =  true;

        $scope.init = function (){

            $scope.viewData = {};
            $scope.strategyBusy = false;
            $scope.tacticBusy = false ;
            $scope.strategyFound = false;
            $scope.isStrategyDropDownShow = true;
            $scope.strategyLoading =  true;
            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        };

        $scope.init();
        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
            var strategiesList = {};
            $scope.strategyBusy = true;
            var errorHandler = function() {
                $scope.dataNotFound = true;
                $scope.strategyBusy = false;
            }
            $scope.api_return_code = 200;
            viewablityService.getStrategyViewData(param).then(function (result) {
                $scope.strategyLoading =  false;
                if (result.status === "OK" || result.status === "success" || result.status == 204) {
                    if(result.data != '' ){ // if data not empty
                        strategiesList = result.data.data;
                        $scope.viewData = strategiesList;
                        $scope.videoMode = true;
                        $scope.strategyBusy = false;
                        $scope.adFormats = domainReports.checkForCampaignFormat(result.data.data.adFormats);
                        if($scope.adFormats.displayAds && !$scope.adFormats.videoAds) {
                            $scope.videoMode = false;
                        }
                        if (strategiesList) {
                            $scope.dataNotFound = false;
                            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
                        } else {
                            errorHandler();
                        }
                    }else{ // if data is empty set as data not found
                        errorHandler();
                    }
                    
                } // Means no strategy data found
                else {

                    if (result.status ==='error')
                        $scope.api_return_code= result.data.status;
                    errorHandler();
                }
            }, errorHandler);
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
            $scope.download_report = [
                {
                    'report_url': urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_tactic',
                    'label' : 'Quality by Tactic'
                },
                {
                    'report_url' : urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_domain',
                    'label' : 'Quality by Domain'
                },
                {
                    'report_url' : urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : 'by_publisher',
                    'label' : 'Quality by Publisher'
                }
            ];
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.createDownloadReportUrl();
            $scope.videoMode = false;
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.callBackStrategyChange();
        });

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};
            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;
            } else {
                $scope.strategyFound = true;
                $scope.strategyViewData({
                    campaign_id: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    kpi_type: $scope.selected_filters.kpi_type,
                    time_filter: $scope.selected_filters.time_filter
                });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
                //Call the chart to load with the changed campaign id and strategyid
            $scope.viewabilityBusy = false ;
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

        $scope.removeActivesForVidSelect = function () {
            $(".icon_text_holder").removeClass( "active" );
            $(".viewability_header .sec_col .icon_text_holder").addClass( "active" );
        }

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === b ) ?  'active' : '';
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

        $scope.removeKpiActive = function(){
            $(".viewability_header .sec_col .icon_text_holder").removeClass( "active" );
            $('.dropdown_ul_text').removeClass( "active" );
            $(".kpi_arrow_sort").removeClass( "active" );
            $(".kpi-dd-holder").removeClass( "active" );
            $('.drop_list li').removeClass( "active" );
            $(".kpi_arrow_sort").removeClass( "is_active_point_down" );
            $(".kpi_arrow_sort").removeClass( "is_active_point_up" );
            $(".drop_list li").css("color", "#000");
        };


        $scope.$on('dropdown-arrow-clicked', function(event, args,sortorder) {
            $scope.sortType = "view_metrics."+args;
            $scope.sortTypeSubSort ="tactic."+args;
            $scope.sortReverse  = sortorder;
        });
        // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function(){ 
            $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ; 
            $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#quality").addClass("active_tab") ; 
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown


    });


}());