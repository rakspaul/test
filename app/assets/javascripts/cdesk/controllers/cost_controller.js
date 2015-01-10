var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('costController', function ($scope, costService, utils, dataTransferService, domainReports, apiPaths,constants, timePeriodModel) {

        //Hot fix to show the campaign tab selected
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');

        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.filter = { sortByColumn : 'default', ascendingDir : false };

        $scope.cost_sort = {
            sortBy : '',
            ascendingDir : ''
        }

        $scope.sort_field = [{
            display: 'Tactic Name',
            key: 'name',
            class: '',
            sortDirection: '',
            ascendingDir: true

        }, {
            display: 'Imps',
            key: 'impressions',
            class: '',
            sortDirection: '',
            ascendingDir : false
        }, {
            display: 'Total Spend',
            key: 'total',
            class: '',
            sortDirection: '',
            ascendingDir : false

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
            $scope.selectedKpi = 'cpa';
            $scope.strategyCostBusy = false ;
            $scope.tacticListCostBusy = false ;

            if(localStorage.getItem(user_id+'_cost_sort') === undefined || localStorage.getItem(user_id+'_cost_sort') === null){
                $scope.cost_sort.sortBy = 'default';
                $scope.cost_sort.ascendingDir = false ;
            } else {
                $scope.cost_sort.sortBy = localStorage.getItem(user_id+'cost_sort') ;
                $scope.cost_sort.ascendingDir = localStorage.getItem(user_id+'_cost_sort_dir') ;
                for(var i in $scope.sort_field){
                    if($scope.sort_field[i].key ===  $scope.cost_sort.sortBy){
                        $scope.sort_field[i].class = 'active';
                        $scope.sort_field[i].ascendingDir =  $scope.cost_sort.ascendingDir ;
                        $scope.filter.ascendingDir =  $scope.sort_field[i].ascendingDir ;
                    }
                }
            }

        };

       $scope.init();

        $scope.strategiesCostData = function (param) {
       //     console.log("######### strategy cost data entered ##########");
            $scope.strategyCostBusy = true;
            $scope.tacticCostBusy = true;
            costService.getStrategyCostData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyCostData = result.data.data.costData ;


                        if(typeof $scope.strategyCostData != "undefined" && $scope.strategyCostData != null && $scope.strategyCostData.length >0 ){
                            $scope.dataNotFound = false;
                            $scope.strategyCostBusy = false ;
                            $scope.tacticListCostData(param);
                        }
                        else{
                            $scope.dataNotFound = true;
                            $scope.strategyCostBusy = false;
                            $scope.tacticCostBusy = false;
                        }
                    }
                    else {
                        $scope.dataNotFound = true;
                        $scope.strategyCostBusy = false;
                        $scope.tacticCostBusy = false;

                    }
                });

        };

        $scope.tacticListCostData = function(param) {
            $scope.tacticCostBusy = true;

            costService.getTacticsForStrategy(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.tacticList = result.data.data;
                    $scope.noTacticsFound = false;

                    if ($scope.tacticList !== 'undefined') {

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
                                $scope.dataNotFound = true;
                                $scope.tacticCostBusy = false;
                            }
                        });

                     }

                }
            });

        };

        $scope.updateStrategyObjects = function(strategy) {
          //  console.log("<*********** update Strategy object call***********");
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name, $scope.strategies[0].startDate, $scope.strategies[0].endDate);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.selectedStrategy.startDate = strategyObj.startDate;
                $scope.selectedStrategy.endDate = strategyObj.endDate;
                $scope.strategyFound = true;
              //  console.log($scope.selectedStrategy);

                if ($scope.selectedStrategy.id == -1) {
                    $scope.strategyFound = false;
                }
                else {
                    $scope.strategiesCostData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, startDate: $scope.selectedStrategy.startDate, endDate: $scope.selectedStrategy.endDate, timeFilter: $scope.selected_filters.time_filter });
                }
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.strategyFound = false;
                // $scope.dataNotFound = true;
            }
        };


        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    if (result.status == 'success') {
                        var strategy = result.data.data;
                        $scope.updateStrategyObjects(strategy);
                    } else {
                        $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                    }
                });
        };


        $scope.callBackCampaignsSuccess= function(){
            //TODO, logic needs to be done
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/cost/';

            $scope.download_urls = {
                cost: urlPath + 'download?date_filter=' + $scope.selected_filters.time_filter
            };

        };

        $scope.callBackCampaignsFailure= function(){
            //TODO, logic needs to be done
          //  console.log('This function is required');
        };


        $scope.callBackCampaignChange = function(){
            $scope.init();
            if ($scope.selectedCampaign.id !== -1) {
                $scope.callBackCampaignsSuccess();
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
          //  $scope.$apply();
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
          //  console.log("strategy is changed");
            $scope.strategyCostData = {};
            $scope.tacticsCostData = {} ;
            $scope.tacticList = {};
            $scope.strategiesCostData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, startDate: $scope.selectedStrategy.startDate, endDate: $scope.selectedStrategy.endDate, timeFilter: $scope.selected_filters.time_filter });

        };

        $scope.callBackKpiDurationChange = function (kpiType) {
          //  $scope.init();

            if (kpiType == 'duration') {
                $scope.strategyCostData = {};
                $scope.tacticsCostData = {} ;

                $scope.strategiesCostData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, startDate: $scope.selectedStrategy.startDate, endDate: $scope.selectedStrategy.endDate, timeFilter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});

                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/cost/';

                $scope.download_urls = {
                    cost: urlPath + 'download?date_filter=' + $scope.selected_filters.time_filter
                };
            } else {
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
            }
        };



        $scope.sortFunction = function (sortby) {
            $scope.filter.sortByColumn = sortby;
            for(var i in $scope.sort_field){
                if($scope.sort_field[i].key === sortby){
                    $scope.sort_field[i].class = 'active';
                 //   $scope.filter.ascendingDir = !$scope.filter.ascendingDir;
                    $scope.sort_field[i].ascendingDir =   ! $scope.sort_field[i].ascendingDir ;
                    $scope.filter.ascendingDir =  $scope.sort_field[i].ascendingDir ;

                    ($scope.filter.ascendingDir === true)?($scope.sort_field[i].sortDirection = 'descending'):($scope.sort_field[i].sortDirection = 'ascending'  );
                    localStorage.setItem(user_id+'_cost_sort_dir' ,  $scope.filter.ascendingDir );
                    localStorage.setItem(user_id+'_cost_sort' ,   $scope.filter.sortByColumn );
                }
                else{
                    $scope.sort_field[i].class = '';
                    $scope.sort_field[i].sortDirection = '';
                }

            }

        };

        $scope.$on(constants.EVENT_TIMEPERIOD_CHANGED, function(event) {
          $scope.callBackKpiDurationChange('duration');
        });



    });
}());
