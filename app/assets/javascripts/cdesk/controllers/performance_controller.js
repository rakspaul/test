var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('performanceController', function ($scope, viewablityService, utils, dataTransferService, domainReports, apiPaths) {


        $scope.selectedCampaign = domainReports.getDefaultValues();

        $scope.selectedStrategy = domainReports.getDefaultValues();

        $scope.selected_filters = domainReports.getDurationKpi();

        $scope.filters = domainReports.getReportsDropDowns();

        $scope.strategiesList={
            tacticsList:[]
        };

        $scope.setCampaigns = function(campaigns) {
            $scope.campaingns = campaigns;
            if (typeof  $scope.campaingns !== 'undefined' && $scope.campaingns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.selectedCampaign =  domainReports.getFound($scope.campaingns[0])['campaign'];
                //Set the KPI Type here
                dataTransferService.updateExistingStorageObjects({
                    filterKpiType: dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaingns[0].kpi_type,
                    filterKpiValue : dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaingns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaingns[0].kpi_type
                });
                //TODO
            }  else {
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
                    if(result.status == 'success') {
                    var campaigns = result.data.data.slice(0,1000);
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaigns(campaigns);
                    }
                });
            }else{
                $scope.setCampaigns(domainReports.getCampaignListForUser());
            }
        };


        $scope.updateStrategyObjects = function(strategy){
            $scope.strategies = strategy;
            if ($scope.strategies !== 'undefined' && $scope.strategies.length > 0) {
                //If a different campaign is selected, then load the first strategy data
                var strategyObj = domainReports.loadFirstStrategy($scope.strategies[0].id, $scope.strategies[0].name);
                $scope.selectedStrategy.id =  strategyObj.id;
                $scope.selectedStrategy.name =  strategyObj.name;
                $scope.strategyFound=true;
                //Call the chart to load with the changed campaign id and strategyid
                $scope.chartForStrategy=true;

            } else { //  means empty strategy list
                $scope.selectedStrategy = domainReports.getNotFound()['strategy'];
                $scope.chartForStrategy=false;
                $scope.tacticNotFound=true;

            }
        };

        $scope.strategylist = function (campaignId) {
            $scope.selectedStrategy.name = "Loading...";
            if(dataTransferService.getCampaignStrategyList(campaignId) === false){
                domainReports.getCampaignStrategyList(campaignId).then(function (result) {
                    var strategy = result.data.data;
                    dataTransferService.setCampaignStrategyList(campaignId , strategy);
                    $scope.updateStrategyObjects(strategy);
                });
            }else{
                $scope.updateStrategyObjects(domainReports.getCampaignStrategyList(campaignId));
            }
        };

        $scope.campaignlist();


        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();
            $scope.selectedCampaign.id = id;
            $scope.selectedCampaign.name = txt;
            $scope.selected_filters.kpi_type = $(e.target).attr('_kpi');
            $scope.selected_filters.kpi_type_text = ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi'),
                dataTransferService.updateExistingStorageObjects({
                    'campaignId' : id,
                    'campaignName' :  txt,
                    'previousCampaignId' : dataTransferService.getDomainReportsValue('campaignId'),
                    'filterKpiValue': $scope.selected_filters.kpi_type_text,
                    'filterKpiType': $scope.selected_filters.kpi_type
                });
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

        //Function is called from startegylist directive
        $scope.callBackStrategyChange = function() {
            //Call the chart to load with the changed campaign id and strategyid
            //$scope.getStrategyList({campaign_id: $scope.selectedCampaign.id, strategyId: $scope.selectedStrategy.id, kpi_type: $scope.selected_filters.kpi_type, time_filter: $scope.selected_filters.time_filter });
        };


        //Hot fix to show the campaign tab selected
        $("ul.nav:first").find('.active').removeClass('active').end().find('li:contains(Reports)').addClass('active');
    });
}());