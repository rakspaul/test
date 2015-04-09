var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ( $rootScope, $scope, $location, $window, $anchorScroll, campaignSelectModel, kpiSelectModel, strategySelectModel,  dataService, optimizationService, utils,  $http, actionChart, $timeout, domainReports, apiPaths, actionColors, campaignListService,constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.api_return_code=200;

        $scope.getMessageForDataNotAvailable = function (dataSetType) {
            if ($scope.api_return_code == 404 || $scope.api_return_code >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            }

            else if ( campaignSelectModel.durationLeft() == 'Yet to start')
                return constants.MSG_CAMPAIGN_YET_TO_START;
            else if (campaignSelectModel.daysSinceEnded() > 1000)
                return constants.MSG_CAMPAIGN_VERY_OLD;
            else if ( $scope.selectedCampaign.kpi =='null')
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            else if (dataSetType == 'activities' && campaignSelectModel.durationLeft() !== 'Ended')
                return Number($scope.selectedStrategy.id) === 0 ?
                    constants.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED :
                    constants.MSG_STRATEGY_YET_TO_BE_OPTIMIZED;
            else
                return constants.MSG_DATA_NOT_AVAILABLE;
        };
        $scope.selectedStrategy.action = {};
        $scope.selectedStrategy.action.id = -1 ;
        $scope.strategyLoading =  true;
        $scope.selected_filters = {};
        $scope.selected_filters.time_filter = 'life_time'; //
        $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
        $scope.selected_filters.kpi_type =  kpiSelectModel.getSelectedKpi();;


        // $scope.selected_filters = domainReports.getDurationKpi();

        $scope.is_network_user = loginModel.getIsNetworkUser();

        $scope.download_urls = {
            optimization: null
        };

        $scope.seeDate = {
            value : '',
            className: ''
        };

        $scope.dataInit = function () {
            $scope.tacticList = [];
            $scope.actionItems= {}; // action item for selected Strategy.

            $scope.campaignActionList = [];

            $scope.tacticNotFound = true;

            $scope.filters = domainReports.getReportsDropDowns();
            $scope.orderByField = 'created_at';
            $scope.reverseSort = true;

            if(localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') === undefined || localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') === null){
                $scope.seeDate.value = false;
                $scope.seeDate.className = '';
            } else {
                $scope.seeDate.value = localStorage.getItem(loginModel.getUserId()+'_opt_seeDate');
                $scope.seeDate.className = (localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') == "true" ? 'see_dates_selected' : '');
            }
        };

        $scope.dataInit();


        $scope.sorting = function (orderBy, sortingOrder) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;

        };

        $scope.createActionItems = function() {
            var counter = 0;
            var actionItems = $scope.campaignActionList;
            var actionItemsArray = [];
            if (actionItems.length > 0 && $scope.selectedStrategy.id != -1) {
                for (var i = 0; i < actionItems.length; i++) {
                    if (actionItems[i].lineitemId == $scope.selectedStrategy.id) {
                        for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                            actionItems[i].action[j].action_color = actionColors[counter % 9];
                            // $scope.clicked.strategy.action = actionItems[i].action; //TODO: remove it.
                            $scope.selectedStrategy.action = actionItems[i].action;

                            actionItemsArray.push(actionItems[i].action[j]);
                            counter++;
                        }
                    } else if ($scope.selectedStrategy.id == 0) {
                        for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                            actionItems[i].action[j].action_color = actionColors[counter % 9];
                            $scope.selectedStrategy.action = actionItems[i].action;
                            actionItemsArray.push(actionItems[i].action[j]);
                            counter++;
                        }
                    }
                }
                $scope.actionItems = actionItemsArray;
            }

            var selectedAction = (typeof localStorage.getItem('selectedAction') == 'undefined') ? {} : JSON.parse(localStorage.getItem('selectedAction')) ;
            if( typeof $scope.actionItems != 'undefined' && !$.isEmptyObject(selectedAction) && selectedAction.id !== undefined ){
                $scope.actionId =  selectedAction.id ;  //action.ad_id + '' + action.id;

                $scope.showSelected(selectedAction.ad_id+''+selectedAction.id,selectedAction.make_external);
            }
        };

        $scope.actionDataError = function(){
            $scope.tacticNotFound = true;
        };

        $scope.actionDataForTactic = function() {
            $scope.createActionItems();
            if ($scope.actionItems && $scope.actionItems.length > 0) {
                $scope.tacticNotFound = false;
                $scope.loadTableData();
            } else {
                $scope.tacticNotFound = true;
                $scope.actionDataError();
            }
        };

        $scope.actionDataForSelectedStrategy = function () {
            $scope.createActionItems();
            if($scope.actionItems && $scope.actionItems.length > 0 && !$scope.isActionDataForTacticNotCalled) {
                $scope.actionDataForTactic();
            }else{
                $scope.actionDataError();
            }
            // It is possible that the selected strategy has no action still it can have cdb data
            if ($scope.selectedStrategy.id != -1) {
                $scope.loadCdbDataForStrategy();
            }
            else {
                $scope.chartForStrategy = false;
            }

        };

        $scope.actionDataForSelectedCampaign = function () {
            var param = {
                campaignId: $scope.selectedCampaign.id
            };
            $scope.isActionDataForTacticNotCalled = true;
            if (typeof $scope.campaignActionList === 'undefined' || $scope.campaignActionList.length === 0) {
                // get action data for the selected campaign.
                optimizationService.getActionsForSelectedCampaign(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                            $scope.tacticNotFound = false;
                            $scope.campaignActionList = result.data.data;
                            $scope.actionDataForTactic();
                            $scope.isActionDataForTacticNotCalled = false;
                    }
                    else {
                        $scope.tacticNotFound = true;
                    }
                })
            }
        };


        $scope.getCampaignDetails = function () {
            if ($scope.selectedCampaign) {
                //API call for campaign details
                var url = apiPaths.apiSerivicesUrl + "/campaigns/" + $scope.selectedCampaign.id;
                dataService.getSingleCampaign(url).then(function (result) {
                    if (result.data.data !== undefined) {
                        var res = result.data.data;

                        $scope.selectedCampaign.kpiValue = res.kpi_value;
                        $scope.selectedCampaign.kpi = res.kpi_type;
                        if ($scope.selectedCampaign.kpi == 'null')
                            $scope.selectedCampaign.kpi = 'ctr';
                    }
                }, function (result) {
                    console.log('call failed');
                });
            }
        };


        $scope.actionSelected = function (id) {
            var myContainer = $('.reports_section_details_container');//$('#action-container:first');
            var scrollTo = $('#actionItem_' + id);
            if (scrollTo.length) {
                myContainer.find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + this.id).addClass('action_selected');
               if ( scrollTo != undefined && scrollTo.offset() != undefined )
                    myContainer.animate({
                        scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });
            }
            localStorage.removeItem('actionSel');
        };

        $scope.loadTableData = function () {
            var tacticList = [],  actionItems;
            if( $scope.selectedStrategy.id == 0){
                actionItems = $scope.actionItems ; // for all strategies
            } else if( $scope.selectedStrategy.id == -1 ||  $scope.selectedStrategy.id == -99 ){
               console.log("Selected strategy id is -1 or -99");
            } else {
                actionItems = $scope.selectedStrategy.action ; //$scope.clicked.strategy.action;
            }

            for (var index in actionItems) {
                var tactic_id = actionItems[index].ad_id;
                var grouped = false;
                if (tacticList.length > 0) {

                    for (var i in tacticList) {
                        if (tactic_id === tacticList[i].ad_id) {
                            grouped = true;
                            tacticList[i].actionList.push(actionItems[index]);
                            break;
                        }
                    }
                    if (!grouped) {
                        var tactic = {};
                        tactic.ad_id = actionItems[index].ad_id;
                        tactic.ad_name = actionItems[index].ad_name;
                        tactic.actionList = [];
                        tactic.actionList.push(actionItems[index]);
                        tacticList.push(tactic);
                    }
                }
                else {
                    var tactic = {};
                    tactic.ad_id = actionItems[index].ad_id;
                    tactic.ad_name = actionItems[index].ad_name;
                    tactic.actionList = [];
                    tactic.actionList.push(actionItems[index]);
                    tacticList.push(tactic);
                }
            }
            $scope.tacticList = tacticList;
            if ($scope.actionId !== null) {
                $timeout(function () {
                    $scope.actionSelected($scope.actionId);
                }, 7000);
            }
        };


        $scope.colorCoding = function (val1, val2, matricImpacted) {
            if (val1 == val2)
                return "";
            else if (matricImpacted === "CPC" || matricImpacted === "CPA" || matricImpacted === "CPM")
                return ((val1 - val2) > 0) ? 'negative_td' : 'positive_td';

            else
                return ((val1 - val2) > 0 ) ? 'positive_td' : 'negative_td';

        };

        $scope.roundOff = function (value, places) {
            var factor = Math.pow(10, places);
            var rounded = Math.round(value * factor) / factor;
            return Math.abs(rounded);
        };

        $scope.goToGraph = function (id) {
            $("html,body").animate({scrollTop: 0}, '300');
        };

        $scope.showSelected = function (id,isActionExternal) {
            var circleId = 0;
            var getActivityCount =0 ;
            $( "circle[id_list*="+id+"]" ).each(function(index, element) {
                circleId=parseInt(this['id']);
                getActivityCount = this.getAttribute('activityCount');
            });
            var newId = circleId > 0 ? circleId : id;
            $('#action-container:first').find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + id).addClass('action_selected');
            $('.reports_section_details_container').find('.action_selected').removeClass('action_selected').end().find('#actionItem_' + id).addClass('action_selected');
            $('circle').attr({fill: '#fff'});
            $('text').attr({fill:'#000'});
            $('circle#'+ newId).attr({ fill:(isActionExternal==false ) ? '#777':'#0072bc'});
            if(getActivityCount > 1){
                $('text#t' + newId).css({fill:'#fff'});
            }
            localStorage.setItem('actionSel', 'actionItem_' + id);
            analytics.track(loginModel.getUserRole(), constants.GA_OPTIMIZATION_TAB, constants.GA_OPTIMIZATION_TAB_ACTIVITY_SELECTED, loginModel.getLoginName());
        };



        $scope.chartForStrategy = true;

        $scope.loadCdbDataForStrategy = function () {

            var param = {
                orderId : Number($scope.selectedCampaign.id),
                startDate : $scope.selectedCampaign.startDate ,
                endDate : $scope.selectedCampaign.endDate
            };

            var strategyId = Number($scope.selectedStrategy.id);
            $scope.api_return_code=200;
            dataService.getCdbChartData(param, 'lifetime', 'strategies',  strategyId , true).then(function (result) {
                var lineData = [];
                if (result.status == "success" && !angular.isString(result.data)) {
                    if(param.orderId === Number($scope.selectedCampaign.id)){

                        var kpiType = $scope.selectedCampaign.kpi ;
                        var actionItems = $scope.actionItems ;
                        var kpiValue = $scope.selectedCampaign.kpiValue ;
                        if (!angular.isUndefined(kpiType)) {
                            if (result.data.data.measures_by_days.length > 0) {
                                // $scope.chartForStrategy = true;
                                // Double check if selected campaign and strategy is same as for which we got CDB data

                                if ($scope.selectedCampaign.id == param.orderId && $scope.selectedStrategy.id == strategyId) {
                                    //  $scope.chartForStrategy = true ;
                                    var maxDays = result.data.data.measures_by_days;
                                    for (var i = 0; i < maxDays.length; i++) {
                                        maxDays[i]['ctr'] *= 100;
                                        var kpiTypeLower = angular.lowercase(kpiType);
                                        kpiTypeLower =  ((kpiTypeLower == 'null' || kpiTypeLower == undefined)? 'ctr' : kpiTypeLower );
                                        lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                    }

                                    $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(kpiValue), kpiType, actionItems, 990, 250, true, $scope.actionId, $scope.clicked, $scope.navigationFromReports);

                                }
                                else {
                                    // CDB data obtained is not for currently selected campaing and strategy id
                                    $scope.chartForStrategy = false;
                                }
                            }
                        } else {
                            $scope.chartForStrategy = false;
                        }
                    }
                } else {
                    if (result.status ==='error')
                        $scope.api_return_code= result.data.status;
                    $scope.chartForStrategy = false;
                }
            }, function() {
                $scope.chartForStrategy = false;
            });
        };

        $scope.showIcon = function (id) {
            $scope.iconIdToShow = id;
        };
        $scope.hideIcon = function (id) {
            $scope.iconIdToShow = -1;
        };


        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        $scope.callBackCampaignsSuccess = function () {
            // As campaign is changed.Populate Campaing details and then get actionData for selected Campaign
            $scope.getCampaignDetails();
            $scope.actionDataForSelectedCampaign();
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/optimization/';
            $scope.download_urls = {
                optimization: urlPath + 'download?date_filter=' + $scope.selected_filters.time_filter
            };

        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,_actionData){
            $scope.dataInit();
            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            // populate campaign kpi value by calling getCampaignDetails();
            $scope.callBackCampaignsSuccess();
        });

        var eventKpiChanged = $rootScope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

        });

        $scope.$on('$destroy', function() {
            eventKpiChanged();
        });


        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.callStrategyChange();
        });

        $scope.$on(constants.EVENT_CAMPAIGN_STRATEGY_CHANGED , function(obj){
            $scope.dataInit();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.selectedStrategy = strategySelectModel.getSelectedStrategy() ;
            $scope.callBackCampaignsSuccess();
        });

        //Function is called from startegylist directive
        $scope.callStrategyChange = function () {

            $scope.tacticList = [];
            $scope.actionItems= {}; // action item for selected Strategy.

            $scope.isStrategyDropDownShow = (strategySelectModel.getStrategyCount() === 1) ? false : true;

            $scope.chartForStrategy = true;
            if ($scope.selectedStrategy.id !== -1) { // Means selected campaing has valid strategy
                $scope.actionDataForSelectedStrategy();
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            } else {
                $scope.chartForStrategy = false;// means selected strategy id is not valid
                $scope.tacticNotFound = true;
            }
        };

        $("#optimization_squaredFour").click( function() {
            if( $(this).is(":checked") == true ) {
                localStorage.setItem(loginModel.getUserId()+'_opt_seeDate',true);
                $scope.seeDate.value = true;
                $scope.seeDate.className = 'see_dates_selected' ;
                $(".details_with_heading_total").addClass("see_dates_selected") ;
                analytics.track(loginModel.getUserRole(), constants.GA_OPTIMIZATION_TAB, constants.GA_OPTIMIZATION_TAB_SEE_DATES, loginModel.getLoginName());
            } else {
                localStorage.setItem(loginModel.getUserId()+'_opt_seeDate',false);
                $scope.seeDate.value = false;
                $scope.seeDate.className = '' ;
                $(".details_with_heading_total").removeClass("see_dates_selected") ;
            }
            $scope.$apply();
        });



        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
            $scope.callBackKpiDurationChange('duration');
        });

        $scope.downloadOptimizationReport = function(report_url) {
            if (!loginModel.cookieExists())
                loginModel.checkCookieExpiry();
            else {
                $scope.optReportDownloadBusy = true;
                dataService.downloadFile(report_url).then(function (response) {
                    if (response.status === "success") {
                        $scope.optReportDownloadBusy = false;
                        saveAs(response.file, response.fileName);
                    } else {
                        $scope.optReportDownloadBusy = false;
                    }
                }, function() {
                    $scope.optReportDownloadBusy = false;
                });
                analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'optimization_report', loginModel.getLoginName());
            }
        }

    });
}());