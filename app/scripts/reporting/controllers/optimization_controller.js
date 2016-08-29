define(['angularAMD','kpi-select-model', 'campaign-select-model',
    'strategy-select-service', 'time-period-model', 'url-service', 'common-utils', 'charts-actions', 'time-period-controller',
    'kpi-select-directive', 'strategy-select-directive', 'strategy-select-controller', 'time-period-pick-directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('OptimizationController', ['$timeout', '$rootScope', '$scope', 'kpiSelectModel',
        'campaignSelectModel', 'strategySelectModel', 'dataService',
        'utils', 'actionChart', 'domainReports', 'constants',
        'timePeriodModel', 'loginModel', 'momentService', 'urlService',
        'advertiserModel', 'brandsModel', 'vistoconfig', function ($timeout, $rootScope, $scope, kpiSelectModel,
                                                              campaignSelectModel, strategySelectModel, dataService,
                                                              utils, actionChart, domainReports, constants,
                                                              timePeriodModel, loginModel, momentService, urlService,
                                                              advertiserModel, brandsModel, vistoconfig) {

        var fromLocStore = localStorage.getItem('timeSetLocStore'),
            getCustomQueryParams,
            actionDataForSelectedCampaign,
            actionDataForSelectedStrategy,
            actionDataForTactic,
            createActionItems,
            actionDataError,
            createDownloadReportUrl,
            cbCampaignSelected,
            callStrategyChange,
            cbStrategySelected,
            setStrategyInScope;

        $scope.textConstants = constants;

        // highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.apiReturnCode=200;

        $scope.isStrategyDropDownShow = true;

        $scope.getMessageForDataNotAvailable = function (campaign, dataSetType) {
            campaign = campaign || $scope.campaign;

            if (!campaign || campaign.id === -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >= 500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() === 'Yet to start') {
                return utils.formatStringWithDate(constants.MSG_CAMPAIGN_YET_TO_START ,campaign.startDate,constants.REPORTS_DATE_FORMAT);
            } else if (campaignSelectModel.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            } else if ($scope.selectedCampaign.kpi === 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else if (dataSetType === 'activities' && campaignSelectModel.durationLeft() !== 'Ended') {
                return Number($scope.selectedStrategy.id) === 0 ?
                    constants.MSG_CAMPAIGN_YET_TO_BE_OPTIMIZED : constants.MSG_STRATEGY_YET_TO_BE_OPTIMIZED;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };

        $scope.strategyLoading =  true;
console.log('$scope.selectedStrategy = ', $scope.selectedStrategy);
        $scope.selectedStrategy.action = {};
        $scope.selectedStrategy.action.id = -1;
        $scope.selectedFilters = {};

        if (fromLocStore) {
            fromLocStore = JSON.parse(localStorage.getItem('timeSetLocStore'));
            $scope.selectedFilters.time_filter = fromLocStore;
        } else {
            $scope.selectedFilters.time_filter = 'life_time';
        }

        $scope.download_urls = {optimization: null};
        $scope.seeDate = {value : '', className: ''};

        $scope.dataInit = function () {
            $scope.tacticList = [];

            // action item for selected Strategy.
            $scope.actionItems= {};

            $scope.campaignActionList = [];
            $scope.chartForStrategy = true;
            $scope.strategyLoading =  true;

            $scope.tacticNotFound = false;
            $scope.tacticLoading = true;
            $scope.filters = domainReports.getReportsTabs();
            $scope.orderByField = 'created_at';
            $scope.reverseSort = true;

            if (localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') === undefined ||
                localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') === null) {
                $scope.seeDate.value = false;
                $scope.seeDate.className = '';
            } else {
                $scope.seeDate.value = localStorage.getItem(loginModel.getUserId()+'_opt_seeDate');

                $scope.seeDate.className = (localStorage.getItem(loginModel.getUserId()+'_opt_seeDate') === 'true' ?
                    'see_dates_selected' : '');
            }
        };

        $scope.dataInit();

        $scope.sorting = function (orderBy) {
            $scope.orderByField = orderBy;
            $scope.reverseSort = !$scope.reverseSort;
        };

        $scope.actionSelected = function (id) {
            var myContainer = $('.reports_section_details_container'),
                scrollTo = $('#actionItem_' + id);

            if (scrollTo.length) {
                myContainer
                    .find('.action_selected')
                    .removeClass('action_selected')
                    .end()
                    .find('#actionItem_' + this.id)
                    .addClass('action_selected');

                if (scrollTo !== undefined && scrollTo.offset() !== undefined ) {
                    myContainer.animate({
                        scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });
                }
            }

            localStorage.removeItem('activityLocalStorage');
        };

        $scope.loadTableData = function () {
            var actionItems,
                groupedByAdId;

            if ($scope.selectedStrategy.id === -1) {
                // for all strategies
                actionItems = $scope.actionItems;
            } else if ($scope.selectedStrategy.id === -99 ) {
                console.log('Selected strategy id is -1 or -99');
            } else {
                actionItems = $scope.selectedStrategy.action;
            }

            groupedByAdId = _.groupBy(actionItems, function (item) {
                return item.ad_id;
            });

            $scope.tacticList = _.map(_.keys(groupedByAdId), function (adId) {
                var actionList = groupedByAdId[adId];

                return {
                    ad_id: actionList[0].ad_id,
                    ad_name: actionList[0].ad_name,
                    actionList: actionList
                };
            });

            if ($scope.actionId !== null) {
                $timeout(function () {
                    $scope.actionSelected($scope.actionId);
                }, 7000);
            }
        };

        $scope.colorCoding = function (val1, val2, metricImpacted) {
            if (val1 === val2) {
                return '';
            } else if (metricImpacted === 'CPC' || metricImpacted === 'CPA' || metricImpacted === 'CPM') {
                return ((val1 - val2) > 0) ? 'negative_td' : 'positive_td';
            } else {
                return ((val1 - val2) > 0 ) ? 'positive_td' : 'negative_td';
            }
        };

        $scope.roundOff = function (value, places) {
            var factor = Math.pow(10, places),
                rounded = Math.round(value * factor) / factor;

            return Math.abs(rounded);
        };

        $scope.goToGraph = function () {
            $('html,body').animate({scrollTop: 0}, '300');
        };

        $scope.showSelected = function (id, isActionExternal) {
            var circleId = 0,
                getActivityCount = 0,
                circleSlNo = 0,
                newId,
                activityLocalStorage;

            $('circle[id_list*=' + id + ']' ).each(function () {
                circleId = parseInt(this.id);
                getActivityCount = this.getAttribute('number_of_activity');
                circleSlNo = this.getAttribute('circleSlNo');
            });

            newId = circleId > 0 ? circleId : id;

            $('#action-container:first')
                .find('.action_selected')
                .removeClass('action_selected')
                .end()
                .find('#actionItem_' + id)
                .addClass('action_selected');

            $('.reports_section_details_container')
                .find('.action_selected')
                .removeClass('action_selected')
                .end()
                .find('#actionItem_' + id)
                .addClass('action_selected');

            $('circle').attr({fill: '#fff'});
            $('text').attr({fill: '#000'});
            $('circle#' + newId).attr({fill:(isActionExternal === false ) ? '#777' : '#0072bc'});

            if (getActivityCount > 1) {
                $('text#t' + newId).css({fill: '#fff'});
            }

            activityLocalStorage = {
                actionSelStatusFlag: isActionExternal,
                actionSelActivityCount: getActivityCount,
                actionSel: 'actionItem_' + id,
                selectedCircleSLNo: circleSlNo
            };

            localStorage.setItem('activityLocalStorage', JSON.stringify(activityLocalStorage));
        };

        $scope.loadCdbDataForStrategy = function () {
            var param = {
                    orderId: Number($scope.selectedCampaign.id),
                    startDate: moment($scope.selectedCampaign.startDate).format('YYYY-MM-DD'),
                    endDate: moment($scope.selectedCampaign.endDate).format('YYYY-MM-DD')
                },

                clientId = vistoconfig.getSelectedAccountId(),
                strategyId = Number($scope.selectedStrategy.id);

                strategyId = Number($scope.selectedStrategy.id);

            $scope.apiReturnCode = 200;

            dataService
                .getCdbChartData(clientId, param, $scope.selectedFilters.time_filter, strategyId === -1 ?
                    'campaigns' : 'lineitems',  strategyId , true)
                .then(function (result) {
                    var lineData = [],
                        kpiType,
                        actionItems,
                        kpiValue,
                        maxDays,
                        i,
                        kpiTypeLower,
                        today,
                        chartEnd,
                        kpiData;

                    $scope.strategyLoading =  false;

                    if (result.status === 'success' && !angular.isString(result.data)) {
                        if (param.orderId === Number($scope.selectedCampaign.id)) {
                            kpiType = $scope.selectedCampaign.kpi;
                            actionItems = $scope.actionItems;
                            kpiValue = $scope.selectedCampaign.kpiValue;

                            if (!angular.isUndefined(kpiType)) {
                                if (result.data.data.measures_by_days.length > 0) {
                                    if (Number($scope.selectedCampaign.id) === param.orderId) {
                                        maxDays = result.data.data.measures_by_days;

                                        for (i = 0; i < maxDays.length; i++) {
                                            kpiTypeLower = angular.lowercase(kpiType);

                                            kpiTypeLower = ((kpiTypeLower === 'null' || kpiTypeLower === undefined) ?
                                                'ctr' : kpiTypeLower );

                                            kpiData = (kpiTypeLower === 'vtc') ?
                                                (maxDays[i].video_metrics.vtc_rate):(maxDays[i][kpiTypeLower]);

                                            lineData.push({
                                                x: i + 1,
                                                y: utils.roundOff(kpiData, 2),
                                                date: maxDays[i].date
                                            });
                                        }

                                        $scope.chartForStrategy = actionChart.lineChart(lineData, parseFloat(kpiValue),
                                            kpiType.toUpperCase(), actionItems, 990, 250, true, $scope.actionId,
                                            $scope.clicked, $scope.navigationFromReports);

                                        today = moment(new Date()).format('YYYY-MM-DD');

                                        chartEnd = (today < $scope.selectedCampaign.endDate ?
                                            today : $scope.selectedCampaign.endDate);

                                        // D3 chart object for action performance chart
                                        $scope.lineChart = {
                                            data: lineData,
                                            kpiValue: parseFloat(kpiValue),
                                            kpiType: kpiType.toUpperCase(),
                                            from: 'action_performance',

                                            deliveryData: {
                                                startDate: $scope.selectedCampaign.startDate,
                                                endDate: $scope.selectedCampaign.endDate,

                                                totalDays: momentService.dateDiffInDays($scope
                                                    .selectedCampaign.startDate, $scope.selectedCampaign.endDate) + 1,

                                                deliveryDays: momentService.dateDiffInDays($scope
                                                    .selectedCampaign.startDate, chartEnd) + 1,

                                                bookedImpressions: maxDays[maxDays.length - 1].booked_impressions
                                            },

                                            // customisation
                                            defaultGrey: true,
                                            activityList: actionItems,
                                            showExternal: $scope.clicked,
                                            selected: $scope.actionId
                                        };
                                    } else {
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
                        if (result.status ==='error') {
                            $scope.apiReturnCode= result.data.status;
                        }

                        $scope.chartForStrategy = false;
                    }
                }, function () {
                    $scope.chartForStrategy = false;
                });
        };

        $scope.showIcon = function (id) {
            $scope.iconIdToShow = id;
        };

        $scope.hideIcon = function () {
            $scope.iconIdToShow = -1;
        };

        getCustomQueryParams = function (queryId) {
            var dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key);

            return {
                queryId: queryId,
                campaignId: $scope.selectedCampaign.id,
                clientId:  vistoconfig.getSelectedAccountId(),
                advertiserId: vistoconfig.getSelectAdvertiserId(),
                brandId: vistoconfig.getSelectedBrandId(),
                dateFilter: dateFilter,
                make_external : false
            };
        };

        actionDataForSelectedCampaign = function (callback) {
            var params = getCustomQueryParams(constants.QUERY_ID_CAMPAIGN_REPORTS_FOR_OPTIMIZATION_IMPACT),
                actionUrl = urlService.APIVistoCustomQuery(params);

            dataService
                .getActionItems(actionUrl)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.tacticNotFound = false;
                        $scope.tacticLoading = false;
                        $scope.campaignActionList = result.data.data;
                    } else {
                        actionDataError();
                    }

                    callback && callback();
                });
        };

        actionDataForSelectedStrategy = function () {
            actionDataForTactic();

            if ($scope.selectedStrategy.id !== -99) {
                // It is possible that the selected strategy has no action still it can have cdb data
                $scope.loadCdbDataForStrategy();
            } else {
                $scope.chartForStrategy = false;
            }
        };

        actionDataForTactic = function () {
            createActionItems();

            if ($scope.actionItems && $scope.actionItems.length > 0) {
                $scope.tacticNotFound = false;
                $scope.strategyBusy = false;
                $scope.loadTableData();
            } else {
                actionDataError();
            }
        };

        createActionItems = function () {
            var counter = 0,
                actionItems = $scope.campaignActionList,
                actionItemsArray = [],
                i,
                j,
                selectedAction;

            if (actionItems.length > 0) {
                for (i = 0; i < actionItems.length; i++) {
                    if (actionItems[i].lineitemId === $scope.selectedStrategy.id) {
                        for (j = actionItems[i].action.length - 1; j >= 0; j--) {
                            actionItems[i].action[j].action_color = vistoconfig.actionColors[counter % 9];
                            $scope.selectedStrategy.action = actionItems[i].action;
                            actionItemsArray.push(actionItems[i].action[j]);
                            counter++;
                        }
                    } else if ($scope.selectedStrategy.id === -1) {
                        for (j = actionItems[i].action.length - 1; j >= 0; j--) {
                            // convert the date string into date object so that angular can apply date filter
                            actionItems[i].action[j].created_at = new Date(actionItems[i].action[j].created_at);

                            actionItems[i].action[j].from_date_before =
                                new Date(actionItems[i].action[j].from_date_before);

                            actionItems[i].action[j].to_date_before =
                                new Date(actionItems[i].action[j].to_date_before);

                            actionItems[i].action[j].from_date_after =
                                new Date(actionItems[i].action[j].from_date_after);

                            actionItems[i].action[j].to_date_after =
                                new Date(actionItems[i].action[j].to_date_after);

                            actionItems[i].action[j].action_color = vistoconfig.actionColors[counter % 9];
                            $scope.selectedStrategy.action = actionItems[i].action;
                            actionItemsArray.push(actionItems[i].action[j]);
                            counter++;
                        }
                    }
                }

                $scope.actionItems = actionItemsArray;
            }

            selectedAction = (typeof localStorage.getItem('selectedAction') === 'undefined') ?
                {} : JSON.parse(localStorage.getItem('selectedAction'));

            if (typeof $scope.actionItems !== 'undefined' &&
                !$.isEmptyObject(selectedAction) &&
                selectedAction.id !== undefined ) {
                $scope.actionId =  selectedAction.id;
                $scope.showSelected(selectedAction.ad_id+''+selectedAction.id,selectedAction.make_external);
            }
        };

        actionDataError = function () {
            $scope.campaignActionList = [];
            $scope.tacticNotFound = true;
            $scope.tacticLoading = false;
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        // creating download report url
        createDownloadReportUrl = function () {
            $scope.download_report = [
                {
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 32,
                    label: 'Optimization Report',
                    download_config_id: 1
                }
            ];
        };

        cbCampaignSelected = function () {
            // As campaign is changed.Populate Campaign details and then get actionData for selected Campaign
            callStrategyChange();
        };



        callStrategyChange = function () {
            actionDataForSelectedCampaign(cbStrategySelected);
        };

        cbStrategySelected = function () {
            $scope.tacticList = [];

            // action item for selected Strategy.
            $scope.actionItems= {};

            $scope.isStrategyDropDownShow = (strategySelectModel.getStrategyCount() === 1) ? false : true;

            if ($scope.selectedStrategy.id !== -99) {
                // Means selected campaign has valid strategy
                $scope.chartForStrategy = true;

                actionDataForSelectedStrategy();
            } else {
                // means selected strategy id is not valid
                $scope.chartForStrategy = false;

                $scope.tacticNotFound = true;
            }
        };

        setStrategyInScope = function () {
            var selectedStrategyID =
                $scope.selectedStrategy.id = Number(strategySelectModel.getSelectedStrategy().id);

            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name;
            $scope.strategyHeading = selectedStrategyID === 0 ? constants.MEDIA_PLAN_TOTAL : constants.LINE_ITME_TOTAL;
        };


        $scope.$watch('selectedCampaign', function () {
            createDownloadReportUrl();

            // populate campaign kpi value by calling getCampaignDetails();
            cbCampaignSelected();
        });

        $('#optimization_squaredFour').click(function () {
            if ($(this).is(':checked') === true ) {
                localStorage.setItem(loginModel.getUserId() + '_opt_seeDate',true);
                $scope.seeDate.value = true;
                $scope.seeDate.className = 'see_dates_selected';
                $('.details_with_heading_total').addClass('see_dates_selected');
            } else {
                localStorage.setItem(loginModel.getUserId() + '_opt_seeDate',false);
                $scope.seeDate.value = false;
                $scope.seeDate.className = '';
                $('.details_with_heading_total').removeClass('see_dates_selected');
            }

            $scope.$apply();
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function (event, strategy) {
            $scope.selectedFilters.time_filter = strategy;
            callStrategyChange();
        });

         // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function () {
            var mainNavigation = $('.main_navigation');

            mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
            mainNavigation.find('.reports_sub_menu_dd_holder').find('#optimization').addClass('active_tab');
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown
    }]);
});
