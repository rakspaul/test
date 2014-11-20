var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('viewabilityController', function ($scope, viewablityService, utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.strategiesList={
            tacticsList:[]
        };

        $scope.download_urls = {
            tactics: null,
            domains: null,
            publishers: null,
            exchanges: null
        };
        var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';


        $scope.getStrategyTacticsChart= function (param, strategiesList) {
            viewablityService.getTacticsViewData(param).then(function (result) {
                if (result.status === "OK" || result.status === "success") {

                    strategiesList.tacticsList = result.data.data[0].tactics;
                    $scope.strategiesList =strategiesList;
                } // Means no strategy data found
                else {
                }
            });
        };


        //Function called to show Strategy list
        $scope.getStrategyList = function (param) {
              var strategiesList = {} ;
              $scope.dataNotFound= true;
                viewablityService.getStrategyViewData(param).then(function (result) {
               //  console.log(result);
                if (result.status === "OK" || result.status === "success") {
                 //   console.log("came insiede");
                  //  console.log(result);
                    strategiesList = result.data.data;
                    if(strategiesList) {
                        $scope.dataNotFound= false;
                        $scope.getStrategyTacticsChart(param, strategiesList);

                    }else{
                        $scope.dataNotFound= true;
                    }

                } // Means no strategy data found
                else {
                    $scope.dataNotFound= true;
                }
            });
        };

        //This function is called from the directive, onchange of the dropdown
        $scope.onKpiDurationChange = function(kpiType) {
            if (kpiType == 'duration') {
                $scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                dataTransferService.updateExistingStorageObjects({'filterDurationType' : $scope.selected_filters.time_filter, 'filterDurationValue' : $scope.selected_filters.time_filter_text});
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }else{
                $scope.$apply();
                dataTransferService.updateExistingStorageObjects({'filterKpiType' : $scope.selected_filters.kpi_type, 'filterKpiValue' : $scope.selected_filters.kpi_type_text});
            }
        };

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        //Campaign Strategy List
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        $scope.setCampaignStrategyList = function(campaigns){
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign = domainReports.getFound($scope.campaingns[0])['campaign'];
                /*$scope.selectedCampaign.id =  dataTransferService.getDomainReportsValue('campaignId') ? dataTransferService.getDomainReportsValue('campaignId') : $scope.campaingns[0].campaign_id;
                $scope.selectedCampaign.name = dataTransferService.getDomainReportsValue('campaignName') ? dataTransferService.getDomainReportsValue('campaignName') :  $scope.campaingns[0].name;*/
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }
            else {
                if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                    $scope.selectedCampaign = domainReports.getNotFound()['campaign'];
                }
            }

            if ($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
            }
        };

        $scope.campaignlist = function () {
            if(dataTransferService.getCampaignList() === false){
                domainReports.getCampaignListForUser().then(function (result) {
                    if(result.status == 'success' ) {
                        var campaigns = result.data.data.slice(0, 1000);
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaignStrategyList(campaigns);
                        $scope.dataNotFound= false;
                    }else{
                        $scope.dataNotFound= true;
                        //console.log('NOT FOUND');
                    }
                });
            }else{
                $scope.setCampaignStrategyList(domainReports.getCampaignListForUser());
            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            viewablityService.getStrategiesForCampaign(campaignId).then(function (result) {
                $scope.strategies = result.data.data;
                if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                    if(dataTransferService.getDomainReportsValue('previousCampaignId') !== dataTransferService.getDomainReportsValue('campaignId')) {
                        $scope.selectedStrategy.id = $scope.strategies[0].id;
                        $scope.selectedStrategy.name = $scope.strategies[0].name;
                    }else {
                        $scope.selectedStrategy.id =  dataTransferService.getDomainReportsValue('strategyId') ? dataTransferService.getDomainReportsValue('strategyId') : $scope.strategies[0].id;
                        $scope.selectedStrategy.name = dataTransferService.getDomainReportsValue('strategyName') ? dataTransferService.getDomainReportsValue('strategyName') :  $scope.strategies[0].name;
                    }
                    $scope.dataNotFound= false;
                    //Call the chart to load with the changed campaign id and strategyid
                     $scope.getStrategyList({campaign_id: campaignId, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
                }
                else { //  means empty strategy list
                    $scope.dataNotFound= true;
                    $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                }
            });
        };

        $scope.campaignlist();


        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            dataTransferService.updateExistingStorageObjects({'campaignId' : id, 'campaignName' :  txt, 'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId')});
            $scope.$apply();
            if($scope.selectedCampaign.id !== -1) {
                $scope.strategylist($scope.selectedCampaign.id);
                var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.selectedCampaign.id +'/viewability/';
                $scope.download_urls = {
                    tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                    domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                    publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                    exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                };
            }else{
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
            }

        });

        //Function called when the user clicks on the strategy dropdown
        $('#strategies_list').click(function (e) {

            if (domainReports.checkStatus($scope.selectedCampaign.name, $scope.selectedStrategy.name)) {
                var id = $(e.target).attr('value'), txt = $(e.target).text();
                $scope.selectedStrategy.id =id;
                $scope.selectedStrategy.name = txt;
              //  console.log( $scope.selectedStrategy.id + " is selected strategy");
                dataTransferService.updateExistingStorageObjects({'strategyId' : id, 'strategyName' :  txt});
                $scope.$apply();
                //Call the chart to load with the changed campaign id and strategyid
                $scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
            }
        });

        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());