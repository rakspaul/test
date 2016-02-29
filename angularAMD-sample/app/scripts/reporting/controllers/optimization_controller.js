var angObj = angObj || {};
define(['angularAMD','reporting/kpiSelect/kpi_select_model', 'reporting/campaignSelect/campaign_select_model', 'reporting/strategySelect/strategy_select_model',
        'reporting/common/charts/column_line', 'common/services/data_service', 'common/services/constants_service',
        'reporting/timePeriod/time_period_model', 'login/login_model', 'reporting/advertiser/advertiser_model',
        'reporting/brands/brands_model', 'common/services/url_service'
    ],

    function (angularAMD) {
    'use strict';
        angularAMD.controller('OptimizationController', function (campaignSelectModel, kpiSelectModel, strategySelectModel,
                                                                  dataService, utils, actionChart,
                                                                  domainReports, actionColors,constants, timePeriodModel, loginModel, momentService, urlService, advertiserModel, brandsModel, analytics, apiPaths, $timeout, $rootScope, $scope) {

        $scope.textConstants = constants;

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.api_return_code=200;

        $scope.isStrategyDropDownShow = true;

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;
            if (!campaign || campaign.id == -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.api_return_code == 404 || $scope.api_return_code >= 500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() == 'Yet to start') {
                return constants.MSG_CAMPAIGN_YET_TO_START;
            } else if (campaignSelectModel.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            } else if ($scope.selectedCampaign.kpi == 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else if (dataSetType == 'activities' && campaignSelectModel.durationLeft() !== 'Ended') {
                return Number($scope.selectedStrategy.id) === 0 ? constants.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED : constants.MSG_STRATEGY_YET_TO_BE_OPTIMIZED;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };
        $scope.strategyLoading =  true;
        $scope.selectedStrategy.action = {};
        $scope.selectedStrategy.action.id = -1 ;
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
        $scope.selected_filters.kpi_type =  kpiSelectModel.getSelectedKpi();;

        $scope.download_urls = { optimization: null  };
        $scope.seeDate = { value : '', className: ''};

        $scope.dataInit = function () {
            $scope.tacticList = [];
            $scope.actionItems= {}; // action item for selected Strategy.

            $scope.campaignActionList = [];
            $scope.chartForStrategy = true;
            $scope.strategyLoading =  true;

            $scope.tacticNotFound = false;
            $scope.tacticLoading = true;
            $scope.filters = domainReports.getReportsTabs();
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
            localStorage.removeItem('activityLocalStorage');
        };

        $scope.loadTableData = function () {
            var tacticList = [],  actionItems;
            if( $scope.selectedStrategy.id == -1){
                actionItems = $scope.actionItems ; // for all strategies
            } else if( $scope.selectedStrategy.id == -99 ){
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
            var circle_slno = 0;
            $( "circle[id_list*="+id+"]" ).each(function(index, element) {
                circleId=parseInt(this['id']);
                getActivityCount = this.getAttribute('number_of_activity');
                circle_slno = this.getAttribute('circle_slno');
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
            var activityLocalStorage={"actionSelStatusFlag":isActionExternal,"actionSelActivityCount":getActivityCount,"actionSel":'actionItem_' + id,"selectedCircleSLNo":circle_slno};
                localStorage.setItem('activityLocalStorage',JSON.stringify(activityLocalStorage));
            analytics.track(loginModel.getUserRole(), constants.GA_OPTIMIZATION_TAB, constants.GA_OPTIMIZATION_TAB_ACTIVITY_SELECTED, loginModel.getLoginName());
        };



        $scope.loadCdbDataForStrategy = function () {

            var param = {
                orderId : Number($scope.selectedCampaign.id),
                startDate : $scope.selectedCampaign.startDate ,
                endDate : $scope.selectedCampaign.endDate
            };

            var strategyId = Number($scope.selectedStrategy.id);
            strategyId = strategyId === -1 ? 0 : strategyId;

            $scope.api_return_code=200;
            dataService.getCdbChartData(param, $scope.selected_filters.time_filter, 'strategies',  strategyId , true).then(function (result) {
                var lineData = [];
                $scope.strategyLoading =  false;
                if (result.status == "success" && !angular.isString(result.data)) {
                    if(param.orderId === Number($scope.selectedCampaign.id)){

                        var kpiType = $scope.selectedCampaign.kpi ;
                        var actionItems = $scope.actionItems ;
                        var kpiValue = $scope.selectedCampaign.kpiValue ;
                        if (!angular.isUndefined(kpiType)) {
                            if (result.data.data.measures_by_days.length > 0) {
                                if ($scope.selectedCampaign.id == param.orderId) {
                                    var maxDays = result.data.data.measures_by_days;
                                    for (var i = 0; i < maxDays.length; i++) {
                                        var kpiTypeLower = angular.lowercase(kpiType);
                                        kpiTypeLower = (kpiTypeLower === 'delivery' ? 'impressions' : kpiTypeLower);
                                        kpiTypeLower =  ((kpiTypeLower == 'null' || kpiTypeLower == undefined)? 'ctr' : kpiTypeLower );
                                        lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
                                    }

                                    $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(kpiValue), kpiType.toUpperCase(), actionItems, 990, 250, true, $scope.actionId, $scope.clicked, $scope.navigationFromReports);
                                    var today = moment(new Date()).format('YYYY-MM-DD');
                                    var chartEnd = (today < $scope.selectedCampaign.endDate ? today : $scope.selectedCampaign.endDate);
                                    //D3 chart object for action performance chart
                                    $scope.lineChart = {
                                        data: lineData,
                                        kpiValue: parseFloat(kpiValue),
                                        kpiType: kpiType.toUpperCase(),
                                        from: 'action_performance',
                                        deliveryData: {
                                            "startDate" : $scope.selectedCampaign.startDate,
                                            "endDate" : $scope.selectedCampaign.endDate,
                                            "totalDays" :  momentService.dateDiffInDays($scope.selectedCampaign.startDate, $scope.selectedCampaign.endDate) +1,
                                            "deliveryDays": momentService.dateDiffInDays($scope.selectedCampaign.startDate, chartEnd) +1,
                                            "bookedImpressions": maxDays[maxDays.length-1]['booked_impressions'] //REVIEW: $scope.campaign.total_impressions
                                        },
                                        //customisation
                                        defaultGrey: true,
                                        activityList: actionItems,
                                        showExternal: $scope.clicked,
                                        selected: $scope.actionId

                                    };

                                }
                                else {
                                    // CDB data obtained is not for currently selected campaing and strategy id
                                    $scope.chartForStrategy = false;
                                }
                            } else {
                                $scope.chartForStrategy = false;
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

        $scope.actionDataError = function(){
            $scope.campaignActionList = [];
            $scope.tacticNotFound = true;
            $scope.tacticLoading = false;
        };

        $scope.createActionItems = function() {
            var counter = 0;
            var actionItems = $scope.campaignActionList;
            var actionItemsArray = [];
            if (actionItems.length > 0) {
                for (var i = 0; i < actionItems.length; i++) {
                    if (actionItems[i].lineitemId == $scope.selectedStrategy.id) {
                        for (var j = actionItems[i].action.length - 1; j >= 0; j--) {
                            actionItems[i].action[j].action_color = actionColors[counter % 9];
                            // $scope.clicked.strategy.action = actionItems[i].action; //TODO: remove it.
                            $scope.selectedStrategy.action = actionItems[i].action;

                            actionItemsArray.push(actionItems[i].action[j]);
                            counter++;
                        }
                    } else if ($scope.selectedStrategy.id == -1) {
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

        $scope.actionDataForTactic = function() {
            $scope.createActionItems();
            if ($scope.actionItems && $scope.actionItems.length > 0) {
                $scope.tacticNotFound = false;
                $scope.strategyBusy = false;
                $scope.loadTableData();
            } else {
                $scope.actionDataError();
            }
        };

        $scope.actionDataForSelectedStrategy = function () {
            $scope.actionDataForTactic();
            if ($scope.selectedStrategy.id != -99) { // It is possible that the selected strategy has no action still it can have cdb data
                $scope.loadCdbDataForStrategy();
            } else {
                $scope.chartForStrategy = false;
            }
        };

        function getCustomQueryParams(queryId) {
            return {
                queryId:queryId,
                campaignId: $scope.selectedCampaign.id,
                clientId:  loginModel.getSelectedClient().id,
                advertiserId: advertiserModel.getSelectedAdvertiser().id,
                brandId: brandsModel.getSelectedBrand().id,
                dateFilter: timePeriodModel.timeData.selectedTimePeriod.key,
                make_external : false

            };
        }

        $scope.actionDataForSelectedCampaign = function (callback) {
            var params=getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_REPORTS_FOR_OPTIMIZATION_IMPACT);
            var actionUrl = urlService.APIVistoCustomQuery(params);
            dataService.getActionItems(actionUrl).then(function(result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.tacticNotFound = false;
                    $scope.tacticLoading = false;
                    $scope.campaignActionList = result.data.data;
                }
                else {
                    $scope.actionDataError();
                }
                callback && callback();
            })

        };


        $scope.getCampaignDetails = function (callback) {
            if ($scope.selectedCampaign && $scope.selectedCampaign.id != 0 && $scope.selectedCampaign.id != -1) {
                //API call for campaign details
                var clientId =  loginModel.getSelectedClient().id;
                var url = apiPaths.apiSerivicesUrl_NEW + '/clients/' + clientId + "/campaigns/" + $scope.selectedCampaign.id;
                dataService.getSingleCampaign(url).then(function (result) {
                    if (result.data.data !== undefined) {
                        var res = result.data.data;

                        $scope.selectedCampaign.kpiValue = res.kpi_value;
                        $scope.selectedCampaign.kpi = res.kpi_type;
                        if ($scope.selectedCampaign.kpi == 'null')
                            $scope.selectedCampaign.kpi = 'ctr';
                    }
                    callback && callback();

                }, function (result) {
                    console.log('call failed');
                });
            }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    'url' : '/reportBuilder/reportDownload',
                    'query_id': 32,
                    'label' : 'Optimization Report',
                    'report_type' : 'all',
                    'report_cat' : 'optimization_impact'
                }
            ];
        };

        $scope.cbStrategyChange = function() {
            $scope.tacticList = [];
            $scope.actionItems= {}; // action item for selected Strategy.
            $scope.isStrategyDropDownShow = (strategySelectModel.getStrategyCount() === 1) ? false : true;
            if ($scope.selectedStrategy.id !== -99) { // Means selected campaing has valid strategy
                    $scope.chartForStrategy = true;
                    $scope.actionDataForSelectedStrategy();
                    analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            } else {
                $scope.chartForStrategy = false;// means selected strategy id is not valid
                $scope.tacticNotFound = true;
            }
        };

        //Function is called from startegylist directive
        $scope.callStrategyChange = function () {
            $scope.actionDataForSelectedCampaign($scope.cbStrategyChange);
        };

        $scope.setStrategyInScope = function() {
            var selectedStrategyID =  $scope.selectedStrategy.id =  Number(strategySelectModel.getSelectedStrategy().id);
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = selectedStrategyID === 0 ? 'Media Plan total' : 'Ad Group total';
        };

        $scope.callBackCampaignsSuccess = function () {
            $scope.getCampaignDetails($scope.callStrategyChange); // As campaign is changed.Populate Campaing details and then get actionData for selected Campaign
        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,_actionData){
            $scope.dataInit();
            $scope.paramObj = {isCampaignChanged: true};
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ; //update the selected Campaign
        });

        $scope.$watch('selectedCampaign', function() {
            $scope.createDownloadReportUrl();
            $scope.callBackCampaignsSuccess(); // populate campaign kpi value by calling getCampaignDetails();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function() {
            $scope.paramObj = $scope.paramObj || {};
            if(!$scope.paramObj.isCampaignChanged) { //if action Items is not set
                $scope.setStrategyInScope();
                $scope.cbStrategyChange();
            } else {
                $scope.paramObj.isCampaignChanged = false;
            }
        });

        var eventKpiChanged = $rootScope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

        });

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



        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event,strategy) {
            $scope.selected_filters.time_filter = strategy;
            $scope.callBackCampaignsSuccess();

        });

        $scope.$on('$destroy', function() {
            eventKpiChanged();
        });
         // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function(){
            $(".main_navigation").find(".header_tab_dropdown").removeClass("active_tab") ;
            $(".main_navigation").find(".reports_sub_menu_dd_holder").find("#optimization").addClass("active_tab") ;
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown

    });
});
