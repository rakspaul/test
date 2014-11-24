(function () {
    'use strict';
    angObj.controller('directiveController', function ($scope, domainReports, apiPaths, dataTransferService) {

        console.log('inside directiveController ');


        $scope.campaigns = {};
        $scope.setCampaigns = function (campaigns) {
            $scope.campaigns = campaigns;
            //   $scope.campaignFullList = campaigns;
            if (typeof  $scope.campaigns !== 'undefined' && $scope.campaigns.length > 0) {
                //Maintain the selected campaign name and id;
                $scope.$parent.selectedCampaign = domainReports.getFound($scope.campaigns[0])['campaign'];
                $scope.$parent.selected_filters.kpi_type = dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaigns[0].kpi_type;
                $scope.$parent.selected_filters.kpi_type_text = dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaigns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaigns[0].kpi_type,
                    dataTransferService.updateExistingStorageObjects({
                        filterKpiType: $scope.$parent.selected_filters.kpi_type,
                        filterKpiValue: $scope.$parent.selected_filters.kpi_type_text
                    });
                //TODO, change the function name, callBackCampaignsSuccess and callBackCampaignsFailure, if required
                //function callBackCampaignsSuccess and callBackCampaignsFailure should be extended in the calling controller
                //Ex: in the optimization_controller.js, you can call a empty function like $scope.callBackCampaignsSuccess = function(){};
                //And The below code will go in viewablity_controller.js, callBackCampaignsSuccess function
                /*var urlPath = apiPaths.apiSerivicesUrl+'/campaigns/'+ $scope.$parent.selectedCampaign.id +'/viewability/';
                 $scope.download_urls = {
                 tactics: urlPath+'tactics/download?date_filter='+  $scope.selected_filters.time_filter,
                 domains:  urlPath+'domains/download?date_filter='+  $scope.selected_filters.time_filter,
                 publishers:  urlPath+'publishers/download?date_filter='+  $scope.selected_filters.time_filter,
                 exchanges: urlPath+'exchanges/download?date_filter='+  $scope.selected_filters.time_filter
                 };*/
                //=========================
                $scope.$parent.callBackCampaignsSuccess();
            }
            else {
                if (typeof  $scope.campaigns !== 'undefined' && $scope.campaigns.length > 0) {
                    $scope.$parent.selectedCampaign = domainReports.getNotFound()['campaign'];
                    $scope.$parent.callBackCampaignsFailure();
                }
            }

            if ($scope.$parent.selectedCampaign.id !== -1) {
                $scope.$parent.strategylist($scope.$parent.selectedCampaign.id);
            }
        };

        //This function is used to call the campaign list from api, localstorage adapted
        $scope.campaignlist = function () {
            if (dataTransferService.getCampaignList() === false) {
                domainReports.getCampaignListForUser().then(function (result) {
                    if (result.status == 'success') {
                        var campaigns = result.data.data;
                        dataTransferService.setCampaignList('campaignList', campaigns);
                        $scope.setCampaigns(campaigns);
                    }
                });
            } else {
                $scope.setCampaigns(domainReports.getCampaignListForUser());
            }
        };
        $scope.campaignlist();

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var id = $(e.target).attr('value'), txt = $(e.target).text();

            $scope.$parent.selectedCampaign.id = id;
            $scope.$parent.selectedCampaign.name = txt;
            $scope.$parent.selected_filters.kpi_type = $(e.target).attr('_kpi');
            $scope.$parent.selected_filters.kpi_type_text = ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi'),
                dataTransferService.updateExistingStorageObjects({
                    'campaignId': id,
                    'campaignName': txt,
                    'previousCampaignId': dataTransferService.getDomainReportsValue('campaignId'),
                    'filterKpiValue': $scope.$parent.selected_filters.kpi_type_text,
                    'filterKpiType': $scope.$parent.selected_filters.kpi_type
                });
            $scope.$apply();
            $scope.$parent.callBackCampaignChange();

        });
    });
}());
