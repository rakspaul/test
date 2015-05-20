var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('costController', function ($scope, $window, campaignSelectModel, kpiSelectModel, strategySelectModel, brandsModel, costService, dataService, utils, domainReports, apiPaths,constants, timePeriodModel, loginModel, analytics) {

        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];
        $scope.api_return_code = 200;
        $scope.strategyMarginPercentage = -1 ;
        var selectedBrand = brandsModel.getSelectedBrand();

        var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
        if(isAgencyCostModelTransparent &&  selectedBrand.id !== -1) {
            $scope.isCostModelTransparent = $scope.selectedBrand.cost_transparency;
        } else {
            $scope.isCostModelTransparent = isAgencyCostModelTransparent;
        }


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

        $scope.sortByColumn = 'name';
        $scope.strategyLoading =  true;

        $scope.sort_field = [{
            display: 'Tactic Name',
            key: 'name',
            'class': '',
            sortDirection: ''
        }, {
            display: 'Imps',
            key: 'impressions',
            'class': '',
            sortDirection: ''
        }, {
            display: 'Total Spend',
            key: 'total',
            'class': '',
            sortDirection: ''
        }] ;


        $scope.init = function(){
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
            $scope.tacticList = {};

            $scope.dataNotFound = false;
            $scope.strategyFound = false;

            $scope.strategyCostBusy = false ;
            $scope.tacticListCostBusy = false ;
            $scope.costReportDownloadBusy = false;
            $scope.isStrategyDropDownShow = false;
            $scope.strategyMarginPercentage = -1 ;
            $scope.isCostModelTransparent = true;

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

            var selectedBrand = brandsModel.getSelectedBrand();
            $scope.isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
            if($scope.isAgencyCostModelTransparent && selectedBrand.id !== -1) { // if agency cost model is transparent
                $scope.isCostModelTransparent = selectedBrand.cost_transparency;
            }
        };

       $scope.init();

        $scope.strategiesCostData = function (param) {
            $scope.strategyCostBusy = true;
            $scope.tacticCostBusy = false;
            var errorHandler =  function() {
                $scope.dataNotFound = true;
                $scope.strategyCostBusy = false;
                $scope.tacticCostBusy = false;
            }
            $scope.api_return_code=200;
            costService.getStrategyCostData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyCostData = result.data.data ;
                        if(typeof $scope.strategyCostData != "undefined" && $scope.strategyCostData != null){
                            $scope.dataNotFound = false;
                            if($scope.strategyCostData[0].cost_transparency) {
                               $scope.isCostModelTransparent = $scope.strategyCostData[0].cost_transparency;
                            }
                            $scope.strategyCostBusy = false;
                            $scope.strategyMarginPercentage =  $scope.strategyCostData[0].margin ;
                            if(param.strategyId >0 ) {
                                $scope.tacticsCostData = $scope.strategyCostData[0].tactics ;

                                if(localStorage.getItem(loginModel.getUserId()+'_cost_sort') === undefined || localStorage.getItem(loginModel.getUserId()+'_cost_sort') === null) {
                                    $scope.sortFunction($scope.sortByColumn);
                                } else {
                                    $scope.sortByColumn = localStorage.getItem(loginModel.getUserId() + '_cost_sort');
                                    var sortCoulumName = $scope.sortByColumn.replace('-', '');
                                    $scope.sortFunction(sortCoulumName);
                                }
                            }
                        }
                        else{
                            errorHandler();
                        }
                    }
                    else {
                        $scope.api_return_code=result.data.status;
                        errorHandler();
                    }
                }, errorHandler);

        };


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

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.init();
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.createDownloadReportUrl();

        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.strategyHeading = Number($scope.selectedStrategy.id) === 0 ? 'Campaign total' : 'Strategy total';
            $scope.more_options = Number($scope.selectedStrategy.id) === 0 ?  false : true;
            $scope.callBackStrategyChange();
        });

        //creating download report url
        $scope.createDownloadReportUrl = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/cost/';
            $scope.strategyMarginPercentage = -1 ;
            var download_report = [
                {
                    'report_url': urlPath + 'reportDownload?date_filter=' + $scope.selected_filters.time_filter,
                    'report_name' : '',
                    'label' : 'Cost Report'
                }
            ];

            var isAgencyCostModelTransparent = loginModel.getIsAgencyCostModelTransparent();
            if(!isAgencyCostModelTransparent) { //if agency level cost model is opaque
                 download_report[0].report_url = '';
            }
            $scope.download_report = download_report;
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
            $scope.tacticList = {};
            $scope.dataNotFound = false ;
            $scope.strategyMarginPercentage = -1 ; // resetting strategy margin before each strategy call

            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
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

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
        });
    });
}());
