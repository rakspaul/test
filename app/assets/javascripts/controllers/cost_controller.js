var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('costController', function ($scope, $window,campaignSelectModel, kpiSelectModel,strategySelectModel, costService, dataService, utils, domainReports, apiPaths,constants, timePeriodModel, loginModel, analytics) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
        $scope.selectedStrategy = strategySelectModel.getSelectedStrategy(); //domainReports.intValues()['strategy'];

//        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.sortByColumn = 'name';
        $scope.costBusy = true;

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

        $scope.download_urls = {
            cost: null
        };

        $scope.init = function(){
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
            $scope.tacticList = {};

            $scope.dataNotFound = false;
            $scope.strategyFound = false;

            $scope.strategyCostBusy = false ;
            $scope.tacticListCostBusy = false ;
            $scope.costReportDownloadBusy = false;

            $scope.selected_filters = {};
            $scope.selected_filters.time_filter = 'life_time'; //
            $scope.selected_filters.campaign_default_kpi_type = $scope.selectedCampaign.kpi.toLowerCase() ;
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();

            if(localStorage.getItem(loginModel.getUserId()+'_cost_sort') === undefined || localStorage.getItem(loginModel.getUserId()+'_cost_sort') === null)
                $scope.sortByColumn = 'name';
            else
                $scope.sortByColumn = localStorage.getItem(loginModel.getUserId() + '_cost_sort');
            for(var i in $scope.sort_field){
                if($scope.sortByColumn.indexOf($scope.sort_field[i].key)>=0){
                    $scope.sort_field[i]['class']= 'active';
                    $scope.sort_field[i].sortDirection = ($scope.sortByColumn.indexOf('-')>=0 ?'descending':'ascending')
                }
            }
        };

       $scope.init();

        $scope.strategiesCostData = function (param) {
            $scope.strategyCostBusy = true;
            $scope.tacticCostBusy = true;
            var errorHandler =  function() {
                $scope.dataNotFound = true;
                $scope.strategyCostBusy = false;
                $scope.tacticCostBusy = false;
            }
            costService.getStrategyCostData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyCostData = result.data.data.costData ;

                        if(typeof $scope.strategyCostData != "undefined" && $scope.strategyCostData != null && $scope.strategyCostData.length >0 ){
                            $scope.dataNotFound = false;
                            $scope.strategyCostBusy = false ;
                            $scope.tacticListCostData(param);
                        }
                        else{
                            errorHandler();
                        }
                    }
                    else {
                        errorHandler();
                    }
                }, errorHandler);

        };

        $scope.tacticListCostData = function(param) {
            $scope.tacticCostBusy = true;
            costService.getTacticsForStrategy(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.tacticList = result.data.data;
                    $scope.noTacticsFound = false;

                    if ($scope.tacticList !== 'undefined') {
                        var errorTacticCostHandler =  function() {
                            $scope.dataNotFound = true;
                            $scope.tacticCostBusy = false;
                        }
                        costService.getTacticCostData(param).then(function (result){
                            if(result.status === "OK" || result.status === "success"){

                                $scope.tacticsCostData = result.data.data.costData ;

                                for( var i in $scope.tacticList){
                                    var tacticId =  $scope.tacticList[i].id ;
                                    var tacticName = $scope.tacticList[i].description ;

                                    for( var index in $scope.tacticsCostData){
                                        if($scope.tacticsCostData[index].id === tacticId){
                                            $scope.tacticsCostData[index].name = tacticName
                                        }
                                    }
                                }
                                $scope.tacticCostBusy = false;
                            }
                            else{
                                errorTacticCostHandler();
                            }
                        }, errorTacticCostHandler);
                     }
                }
            });

        };

        $scope.$on(constants.EVENT_CAMPAIGN_CHANGED , function(event,campaign){
            $scope.costBusy = true ;
            $scope.init();

            //update the selected Campaign
            $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;
            $scope.callBackCampaignsSuccess();

        });

        $scope.$on(constants.EVENT_STRATEGY_CHANGED , function(event,strategy){
            $scope.costBusy = true ;
            $scope.selectedStrategy.id =  strategySelectModel.getSelectedStrategy().id ;
            $scope.selectedStrategy.name = strategySelectModel.getSelectedStrategy().name ;
            $scope.callBackStrategyChange();
        });

        $scope.callBackCampaignsSuccess= function(){
            //TODO, logic needs to be done
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/cost/';

            $scope.download_urls = {
                cost: urlPath + 'reportDownload?date_filter=' + $scope.selected_filters.time_filter
            };

        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
            $scope.tacticList = {};
            $scope.dataNotFound = false ;

            if($scope.selectedStrategy.id == -99 ||$scope.selectedStrategy.id == -1  ){
                $scope.strategyFound = false ;

            } else {
                $scope.strategyFound = true ;
                $scope.strategiesCostData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, startDate: $scope.selectedCampaign.startDate, endDate: $scope.selectedCampaign.endDate, timeFilter: $scope.selected_filters.time_filter });
                analytics.track(loginModel.getUserRole(), constants.GA_USER_STRATEGY_SELECTION, $scope.selectedStrategy.name, loginModel.getLoginName());
            }
            $scope.costBusy = false ;
        };


        $scope.sortFunction = function (sortby) {
            for(var i in $scope.sort_field){
                if($scope.sort_field[i].key === sortby){
                    if ($scope.sort_field[i]['class']==='active') //simply toggle previous state if the same sortby was previously active
                        $scope.sortByColumn=($scope.sortByColumn.indexOf('-')>=0)?sortby:'-'+sortby;
                    else
                        $scope.sortByColumn = (sortby==='name')?sortby : '-'+sortby;

                    $scope.sort_field[i]['class'] = 'active';
                    $scope.sort_field[i].sortDirection = ($scope.sortByColumn.indexOf('-')>=0 ?'descending':'ascending')
                   localStorage.setItem(loginModel.getUserId()+'_cost_sort' ,   $scope.sortByColumn );
                }
                else{
                    $scope.sort_field[i]['class'] = '';
                    $scope.sort_field[i].sortDirection = '';
                }

            }
            // The sort direction is derived from the code above to match the UI desc/asc icons
            analytics.track(loginModel.getUserRole(), constants.GA_COST_TAB_SORTING, (sortby + ($scope.sortByColumn.indexOf('-')>=0 ? '_desc' : '_asc')), loginModel.getLoginName());
        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });

        $scope.$on(constants.EVENT_KPI_CHANGED, function(e) {
            $scope.selected_filters.kpi_type = kpiSelectModel.getSelectedKpi();
            $scope.$apply();

        });

        $scope.downloadCostReport = function(report_url) {
            if (!loginModel.cookieExists())
                loginModel.checkCookieExpiry();
            else {
                $scope.costReportDownloadBusy = true;
                dataService.downloadFile(report_url).then(function (response) {
                    if (response.status === "success") {
                        $scope.costReportDownloadBusy = false;
                        saveAs(response.file, response.fileName);
                    } else if (response.status === "error") {
                        $scope.costReportDownloadBusy = false;
                    }
                });
                analytics.track(loginModel.getUserRole(), constants.GA_DOWNLOAD_REPORT, 'cost_report', loginModel.getLoginName());
            }
        }
    });
}());
