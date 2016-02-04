var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('ViewabilityController', function ($scope, $window, campaignSelectModel,kpiSelectModel, strategySelectModel, utils, dataService, domainReports, apiPaths, constants, timePeriodModel, loginModel, urlService, analytics, advertiserModel, brandsModel) {
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
            else if (dataSetType == 'viewability')
                return constants.MSG_METRICS_NOT_TRACKED;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };

        $scope.filters = domainReports.getReportsTabs();

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null
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

            var fromLocStore = localStorage.getItem('timeSetLocStore');
            if(fromLocStore) {
                fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
                $scope.selected_filters.time_filter = fromLocStore;
            }
            else {
                $scope.selected_filters.time_filter = 'life_time';
            }

            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        };

        $scope.init();
        //Function called to show Strategy list
        $scope.strategyViewData = function (param) {
          //  console.log('this is param from controller'+JSON.stringify(param));
            var strategiesList = {};
            $scope.strategyBusy = true;
            var errorHandler = function() {
                $scope.dataNotFound = true;
                $scope.strategyBusy = false;
            }
            $scope.api_return_code = 200;

            var queryObj = {
                campaignId: $scope.selectedCampaign.id,
                clientId:  loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key
            };
            if(_.has(param, 'strategyId') && param.strategyId >= 0) {
                queryObj['queryId'] =  13;
                queryObj['strategyId'] = param.strategyId;
            } else {
                queryObj['queryId'] =  12;
            }

            var url = urlService.APIVistoCustomQuery(queryObj);
            dataService.fetch(url).then(function (result) {
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
                            $scope.strategyHeading = Number($scope.selectedStrategy.id) === constants.ALL_STRATEGIES_OBJECT.id ? 'Media Plan total' : 'Ad Group total';
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
            $scope.download_report = [
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 30,
                    'report_type' : 'ad',
                    'report_cat' : 'quality',
                    'label' : 'Quality by Ad'
                },
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 31,
                    'report_type' : 'domain',
                    'report_cat' : 'quality',
                    'label' : 'Quality by Domain'
                },
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 31,
                    'report_type' : 'publisher',
                    'report_cat' : 'quality',
                    'label' : 'Quality by Publisher'
                }
            ];
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.videoMode = false;
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            console.log("EVENT_STRATEGY_CHANGED");
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Ad Group total';
            $scope.callBackStrategyChange();
        });


        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED , function(event,strategy){
            console.log("EVENT_TIMEPERIOD_CHANGED");
            $scope.selected_filters.time_filter = strategy;
            $scope.callBackStrategyChange();
            $scope.createDownloadReportUrl();
        });

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.viewData = {};
            if($scope.selectedStrategy.id == -99){
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
