var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, performanceService, utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues()['campaign'];

        $scope.selectedStrategy = domainReports.getDefaultValues()['strategy'];

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.selected_filters.tab = 'byscreens';

        $scope.download_urls = {
            screens: null,
            daysOfWeek: null
        };


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');

        $scope.noTacticsFound = false;

        $scope.tacticList = {};

        $scope.strategyPerfDataByScreen = {};
        $scope.strategyPerfDataByFormat = {};
        $scope.strategyPerfDataByDOW = {};


        $scope.tacticsPerfDataListByScreen = {};
        $scope.tacticsPerfDataListByFormat = {};
        $scope.tacticsPerfDataListByDOW = {};


        $scope.dataNotFoundForScreen = false;
        $scope.dataNotFoundForFormat = false;
        $scope.dataNotFoundForDOW = false;
        $scope.dataNotFound = false;

        $scope.tacticPerfData = function (param) {


            if ($scope.noTacticsFound !== true) { //} && Object.getOwnPropertyNames($scope.tacticList).length === 0 ) {

                performanceService.getTacticsForStrategy(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.tacticList = result.data.data;
                        $scope.dataNotFound = false;
                        $scope.noTacticsFound = false;

                        var _tacticsPerfList = [];

                        if ($scope.tacticList !== 'undefined') {

                            var tacticParams = {
                                campaignId: param.campaignId,
                                strategyId: param.strategyId,
                                tacticId: '',
                                tacticName: '',
                                startDate: '',
                                endDate: '',
                                tab: $scope.selected_filters.tab,
                                timeFilter: param.timeFilter
                            };


                            if ($scope.selected_filters.tab == 'bydaysofweek') { // && Object.getOwnPropertyNames($scope.tacticsPerfDataListByDOW).length === 0) {

                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;

                                    console.log(" tactics params are");
                                    console.log(tacticParams);


                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {

                                            var _tacticPerfData = result.data.data;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByDOW = _tacticsPerfList;

                                        }

                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }
                            } else if ($scope.selected_filters.tab == 'byformats') { //} && Object.getOwnPropertyNames($scope.tacticsPerfDataListByFormat).length === 0) {


                                for (var index in $scope.tacticList) {

                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;



                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {

                                            var _tacticPerfData = result.data.data;

                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByFormat = _tacticsPerfList;

                                        }
                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }

                            } else if ($scope.selected_filters.tab == 'byscreens') { // && Object.getOwnPropertyNames($scope.tacticsPerfDataListByScreen).length === 0) {

                                for (var index in $scope.tacticList) {
                                    tacticParams.tacticId = $scope.tacticList[index].id;
                                    tacticParams.tacticName = $scope.tacticList[index].description;
                                    tacticParams.startDate = $scope.tacticList[index].startDate;
                                    tacticParams.endDate = $scope.tacticList[index].endDate;


                                    performanceService.getTacticPerfData(tacticParams).then(function (result) {
                                        if (result.status === "OK" || result.status === "success") {
                                            var _tacticPerfData = result.data.data;
                                            for (var i in _tacticPerfData) {
                                                _tacticPerfData[i].description = tacticParams.tacticName;
                                            }
                                            _tacticsPerfList.push(_tacticPerfData);
                                            $scope.tacticsPerfDataListByScreen = _tacticsPerfList;
                                        }

                                        else {
                                            $scope.dataNotFound = true;
                                        }
                                    });
                                }

                            }
                        }


                    } else {
                        // No tactics for a given strategy
                        $scope.noTacticsFound = true;
                    }

                });
            }
        };

        $scope.strategyPerformanceData = function (param) {

            if ($scope.selected_filters.tab === 'bydaysofweek' && Object.getOwnPropertyNames($scope.strategyPerfDataByDOW).length === 0) {

                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByDOW = result.data.data;
                        $scope.tacticPerfData(param);
                    }
                    else {
                        $scope.dataNotFoundForDOW = true;
                    }
                });
            } else if ($scope.selected_filters.tab === 'byformats' && Object.getOwnPropertyNames($scope.strategyPerfDataByFormat).length  === 0) {
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByFormat = result.data.data;
                        console.log(" Got Strategy data by fromat successfully ");

                        $scope.tacticPerfData(param);
                    }
                    else {
                        $scope.dataNotFoundForFormat = true;
                    }
                });

            } else if ($scope.selected_filters.tab === 'byscreens'  && Object.getOwnPropertyNames($scope.strategyPerfDataByScreen).length === 0) {
                performanceService.getStrategyPerfData(param).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $scope.strategyPerfDataByScreen = result.data.data;
                        $scope.tacticPerfData(param);
                    }
                    else {
                        $scope.dataNotFoundForScreen = true;
                    }
                });
            }
        };

        $scope.updateStrategyObjects = function (strategy) {
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name, $scope.strategies[0].startDate, $scope.strategies[0].endDate);
                $scope.selectedStrategy.id = strategyObj.id;
                $scope.selectedStrategy.name = strategyObj.name;
                $scope.selectedStrategy.startDate = strategyObj.startDate;
                $scope.selectedStrategy.endDate = strategyObj.endDate;

                $scope.strategyFound = true;
                $scope.dataNotFound = false;
                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.tacticNotFound = true;
                $scope.dataNotFound = true;
            }
        };


        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if (dataTransferService.getCampaignStrategyList(campaignId) === false) {
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId, strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            } else {
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };

        //This will be called from directive_controller.js
        $scope.callBackCampaignsSuccess = function () {
            var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/performance/';

            $scope.download_urls = {
                screens: urlPath + 'screensandformats/download?date_filter=' + $scope.selected_filters.time_filter,
                daysOfWeek: urlPath + 'daysofweek/download?date_filter=' + $scope.selected_filters.time_filter
            };
        };

        //Called from directive_controller.js,  this is required, do not remove;
        $scope.callBackCampaignsFailure = function () {
            console.log('This function is required : callBackCampaignsFailure');
        };

        //Called from directive_controller.js,  when the user selects the campaign dropdown option
        $scope.callBackCampaignChange = function () {
            if ($scope.selectedCampaign.id !== -1) {
                $scope.callBackCampaignsSuccess();
                $scope.strategylist($scope.selectedCampaign.id);
            } else {
                $scope.$parent.selectedStrategy = domainReports.getNotFound()['strategy'];
            }
        };

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function () {
            //Call  to load with the changed campaign id and strategyid
            $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
        };

        $(document).ready(function () {
            $(".each_tab").click(function () {
                var tab_id = $(this).attr("id").split("_tab")
                console.log("tab is clicked");
                $scope.selected_filters.tab = tab_id[0];
                $(".reports_tabs_holder").find(".active").removeClass("active");
                $(this).addClass("active");
                $(".reports_block").hide();
                $("#reports_" + tab_id[0] + "_block").show();

                $scope.strategyPerformanceData({campaignId: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, strategyStartDate: $scope.selectedStrategy.startDate, strategyEndDate: $scope.selectedStrategy.endDate, tab: $scope.selected_filters.tab, timeFilter: $scope.selected_filters.time_filter });
            });
        });


//        //TODO: This function is called from the directive, onchange of the dropdown.It will be done when dropdown is implemented.
//        $scope.callBackKpiDurationChange = function (kpiType) {
//            if (kpiType == 'duration') {
//                $scope.strategyViewData({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
//                dataTransferService.updateExistingStorageObjects({'filterDurationType': $scope.selected_filters.time_filter, 'filterDurationValue': $scope.selected_filters.time_filter_text});
//                var urlPath = apiPaths.apiSerivicesUrl + '/campaigns/' + $scope.selectedCampaign.id + '/viewability/';
//                $scope.download_urls = {
//                    tactics: urlPath + 'tactics/download?date_filter=' + $scope.selected_filters.time_filter,
//                    domains: urlPath + 'domains/download?date_filter=' + $scope.selected_filters.time_filter,
//                    publishers: urlPath + 'publishers/download?date_filter=' + $scope.selected_filters.time_filter,
//                    exchanges: urlPath + 'exchanges/download?date_filter=' + $scope.selected_filters.time_filter
//                };
//            } else {
//                $scope.$apply();
//                dataTransferService.updateExistingStorageObjects({'filterKpiType': $scope.selected_filters.kpi_type, 'filterKpiValue': $scope.selected_filters.kpi_type_text});
//            }
//        };


    });
}());