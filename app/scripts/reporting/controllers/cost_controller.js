define(['angularAMD', 'campaign-select-model', 'kpi-select-model', 'strategy-select-service', 'common-utils', 'url-service', 'time-period-model', 'strategy-select-directive',
    'strategy-select-controller', 'time-period-pick-directive', 'kpi-select-directive'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('CostController', ['$scope', '$window', 'campaignSelectModel', 'kpiSelectModel', 'advertiserModel', 'strategySelectModel', 'brandsModel', 'dataService',
        'utils', 'loginModel', 'urlService', 'constants', 'timePeriodModel', 'domainReports', 'vistoconfig', 'pageLoad',
        function ($scope, $window, campaignSelectModel, kpiSelectModel, advertiserModel, strategySelectModel, brandsModel, dataService, utils, loginModel, urlService,
                  constants, timePeriodModel, domainReports, vistoconfig, pageLoad) {
        var dataHeader = function () {
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ?
                constants.MEDIA_PLAN_TOTALS:
                constants.LINE_ITME_TOTALS;

            $scope.viewLabelTxt = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ?
                constants.INCLUDES_FIXED_COSTS :
                constants.EXCLUDES_MEDIA_PLAN_FIXED_COSTS;
        };

        console.log('COST controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $scope.textConstants = constants;

        // highlight the header menu - Dashboard, Campaigns, Reports
        domainReports.highlightHeaderMenu();
        //domainReports.highlightSubHeaderMenu();

        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy();
        $scope.apiReturnCode = 200;
        $scope.strategyMarginValue = -1;
        $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

        $scope.getMessageForDataNotAvailable = function (campaign) {
            campaign = campaign || $scope.campaign;

            if (!campaign || campaign.id === -1) {
                return constants.MSG_DATA_NOT_AVAILABLE;
            } else if ($scope.apiReturnCode === 404 || $scope.apiReturnCode >=500) {
                return constants.MSG_UNKNOWN_ERROR_OCCURED;
            } else if (campaignSelectModel.durationLeft() === 'Yet to start') {
                return utils.formatStringWithDate(constants.MSG_CAMPAIGN_YET_TO_START ,campaign.startDate,constants.REPORTS_DATE_FORMAT);
            } else if (campaignSelectModel.daysSinceEnded() > 1000) {
                return constants.MSG_CAMPAIGN_VERY_OLD;
            } else if ($scope.selectedCampaign.kpi === 'null') {
                return constants.MSG_CAMPAIGN_KPI_NOT_SET;
            } else {
                return constants.MSG_DATA_NOT_AVAILABLE;
            }
        };

        $scope.filters = domainReports.getReportsTabs();

        // set the default sort type
        $scope.sortType = '-impressions';

        // set the default sort order
        $scope.sortReverse  = false;

        $scope.sortReverseDefaultSelection  = true;
        $scope.sortByColumn = 'name';
        $scope.strategyLoading =  true;

        $scope.download_urls = {
            cost: null
        };

        $scope.clickToSort = function(type){
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
            $scope.removeKpiActive();
        }

        $scope.sortClassFunction = function(a){
            var isActive = (a === $scope.sortType) ?  'active' : '',
                sortDirection = ($scope.sortReverse === true) ?  'sort_order_up' : 'sort_order_down';

            $('.direction_arrows div.kpi_arrow_sort.active').hide();

            if ($('.kpi-dd-holder').hasClass('active')) {
                $('.each_cost_col').removeClass('active');
                return sortDirection;
            } else{
                return isActive + ' ' + sortDirection;
            }
        }

        $scope.init = function () {
            $scope.strategyCostData = [];
            $scope.tacticsCostData = [];
            $scope.tacticList = {};

            $scope.dataNotFound = false;
            $scope.strategyFound = false;
            $scope.strategyLoading =  true;

            $scope.strategyCostBusy = false;
            $scope.tacticListCostBusy = false;
            $scope.costReportDownloadBusy = false;
            $scope.isStrategyDropDownShow = true;
            $scope.strategyMarginValue = -1;
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            $scope.selectedFilters = {};
            $scope.selectedFilters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase();
            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
        };

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();
        $scope.init();


        $scope.strategiesCostData = function (param) {
            var errorHandler =  function () {
                    $scope.dataNotFound = true;
                    $scope.strategyCostBusy = false;
                    $scope.tacticCostBusy = false;
                },

                dateFilter = timePeriodModel.getTimePeriod(timePeriodModel.timeData.selectedTimePeriod.key),
                clientId = vistoconfig.getSelectedAccountId(),
                advertiserId = vistoconfig.getSelectAdvertiserId(),
                brandId = vistoconfig.getSelectedBrandId(),

                queryObj = {
                    clientId: clientId,
                    advertiserId: advertiserId,
                    brandId: brandId,
                    dateFilter: dateFilter
                },

                url;

            $scope.strategyCostBusy = true;
            $scope.tacticCostBusy = false;
            $scope.apiReturnCode=200;

            if (_.has(param, 'strategyId') && param.strategyId >= 0) {
                queryObj.queryId = 15;
                queryObj.campaignId = param.campaignId;
                queryObj.strategyId = param.strategyId;
            } else {
                queryObj.queryId = 14;
                queryObj.campaignIds = param.campaignId;
            }

            url = urlService.APIVistoCustomQuery(queryObj);

            dataService
                .fetch(url)
                .then(function (result) {
                    var data,

                        marginPercentage = function (item) {
                            if (item.gross_rev && item.gross_rev !== 0) {
                                item.margin = item.margin * 100 / item.gross_rev;
                            }
                        },

                        sumTechFeesNServiceFees = function (item) {
                            if (item.tech_fees === null && item.service_fees === null) {
                                item.tech_service_fees_total = null;
                            } else {
                                item.tech_service_fees_total = (item.tech_fees === null ?
                                        0 :
                                        item.tech_fees) + (item.service_fees === null ?
                                        0 :
                                        item.service_fees);
                            }
                        };

                    $scope.strategyLoading =  false;

                    if (result.status === 'OK' || result.status === 'success') {
                        data = result.data.data;

                        if (typeof data !== 'undefined' && data !== null && data.length > 0) {
                            $scope.dataNotFound = false;

                            $scope.strategyHeading = Number($scope.selectedStrategy.id) === vistoconfig.LINE_ITEM_DROPDWON_OBJECT.id ?
                                constants.MEDIA_PLAN_TOTALS:
                                constants.LINE_ITEM_TOTALS;

                            _.each(data,function (item) {
                                if (item.ad_id === undefined || item.ad_id === -1) {
                                    $scope.strategyCostBusy = false;
                                    $scope.strategyMarginValue =  item.margin;

                                    if (item.pricing_method && item.pricing_method === constants.PRICING_METHOD_CPM) {
                                        $scope.strategyMarginUnit = constants.SYMBOL_DOLLAR;
                                    }

                                    if (!utils.hasItem($scope.strategyCostData,'campaign_id', item.campaign_id)) {
                                        item.kpi_type = $scope.selectedFilters.campaign_default_kpi_type;
                                        sumTechFeesNServiceFees(item);
                                        marginPercentage(item);
                                        $scope.strategyCostData.push(item);
                                    }
                                } else {
                                    if (!utils.hasItem($scope.tacticsCostData,'ad_id', item.ad_id)) {
                                        sumTechFeesNServiceFees(item);
                                        marginPercentage(item);
                                        $scope.tacticsCostData.push(item);
                                    }
                                }
                            });
                        } else {
                            errorHandler(result);
                        }
                    } else {
                        $scope.apiReturnCode=result.data.status;
                        errorHandler(result);
                    }
                }, errorHandler);
        };

        $scope.$watch('selectedCampaign', function () {
            $scope.createDownloadReportUrl();
        });

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function () {
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name;
            $scope.createDownloadReportUrl();
            $scope.callBackStrategyChange();
            dataHeader();
        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED, function () {
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name;
            $scope.callBackStrategyChange();
            dataHeader();
        });

        // creating download report url
        $scope.createDownloadReportUrl = function () {
            $scope.strategyMarginValue = -1;
            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            $scope.download_report = [
                {
                    url: '/reportBuilder/customQueryDownload',
                    query_id: 16,
                    label: 'Cost Report',
                    className: 'report_cost',
                    download_config_id: 1
                }
            ];
        };

        // Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            $scope.strategyCostData = [];
            $scope.tacticsCostData = [];
            $scope.tacticList = {};
            $scope.dataNotFound = false;

            // resetting strategy margin before each strategy call
            $scope.strategyMarginValue = -1;

            $scope.strategyMarginUnit = constants.SYMBOL_PERCENT;

            if ($scope.selectedStrategy.id === -99) {
                $scope.strategyFound = false;
            } else {
                $scope.strategyFound = true;
                $scope.strategiesCostData({
                    campaignId: $scope.selectedCampaign.id,
                    strategyId: Number($scope.selectedStrategy.id),
                    startDate: $scope.selectedCampaign.startDate,
                    endDate: $scope.selectedCampaign.endDate
                });
            }
        };
        $scope.callBackStrategyChange();

        $scope.$on('dropdown-arrow-clicked', function (event, args, sortorder) {
            $scope.sortType = args;
            $scope.sortReverse = sortorder;
        });

        $scope.clickToSort = function(type){
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
        };

        $scope.removeKpiActive = function () {
            var dropListLi = $('.drop_list li');

            dropListLi.css('color', '#57606d');
            $('.kpi-dd-holder').removeClass('active');
            $('.dropdown_ul_text').removeClass('active');
            dropListLi.removeClass('active');
            $('.direction_arrows div.kpi_arrow_sort').removeClass('active');
        };

        $scope.sortClassFunction = function (a,b,c) {
            var isActive = (a === $scope.sortType) ?  'active' : '',
                sortDirection = ($scope.sortReverse === true) ?  'sort_order_up' : 'sort_order_down';

            return isActive + ' ' + sortDirection;
        };

        $scope.$on(constants.EVENT_KPI_CHANGED, function() {
            $scope.selectedFilters.kpi_type = kpiSelectModel.getSelectedKpi();
        });

        // hot fix for the enabling the active link in the reports dropdown
        setTimeout(function () {
            var mainNavigation = $('.main_navigation');

            mainNavigation.find('.header_tab_dropdown').removeClass('active_tab');
            mainNavigation.find('.reports_sub_menu_dd_holder').find('#cost').addClass('active_tab');
        }, 200);
        // end of hot fix for the enabling the active link in the reports dropdown
    }]);
});
