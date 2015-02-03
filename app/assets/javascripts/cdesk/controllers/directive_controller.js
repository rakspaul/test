(function () {
    'use strict';
    angObj.controller('directiveController', function ($scope, domainReports, apiPaths, dataTransferService , constants , brandsModel, loginModel, analytics ) {

        $scope.campaigns = {};
        $scope.allCampaigns = {};
        $scope.originalAllCampaingList={};
        $scope.originalCampaingList = {};

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event,brand) {

            // clear the existing campaignDetails object present is localStroage.
            dataTransferService.updateExistingStorageObjects({ 'campaignId':'','campaignName': '', 'strategyId' : '', 'strategyName' :  ''});

            $scope.campaignlist();
        });

        $scope.setCampaigns = function (campaigns , allCampaigns) {
            $scope.campaigns = campaigns;
            $scope.allCampaigns = allCampaigns ;

            $scope.originalCampaingList = campaigns;
            $scope.originalAllCampaingList = allCampaigns ;
            //   $scope.campaignFullList = campaigns;
            if (typeof  $scope.campaigns !== 'undefined' && $scope.campaigns.length > 0) {
                if(dataTransferService.getDomainReportsValue('campaignId')== false){ // Means No campaing selected in localStorage.
                    $scope.$parent.selectedCampaign = domainReports.getFound($scope.campaigns[0])['campaign'];
                }
                else{
                    $scope.$parent.selectedCampaign.id = dataTransferService.getDomainReportsValue('campaignId');
                    $scope.$parent.selectedCampaign.name = dataTransferService.getDomainReportsValue('campaignName');
                }
                if($scope.$parent.selected_filters !== undefined) {
                    $scope.$parent.selected_filters.kpi_type = dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaigns[0].kpi_type;
                    $scope.$parent.selected_filters.kpi_type_text = dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaigns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaigns[0].kpi_type,
                    dataTransferService.updateExistingStorageObjects({
                        filterKpiType: $scope.$parent.selected_filters.kpi_type,
                        filterKpiValue: $scope.$parent.selected_filters.kpi_type_text
                    });
                }
              //  $scope.$parent.callBackCampaignsSuccess();
                $scope.$parent.callBackCampaignChange();
            }
            else {
                if (typeof  $scope.campaigns !== 'undefined' && $scope.campaigns.length > 0) {
                    $scope.$parent.selectedCampaign = domainReports.getNotFound()['campaign'];
                    $scope.$parent.callBackCampaignsFailure();
                }
            }

//            if ($scope.$parent.selectedCampaign.id !== -1) {
//                console.log("directive controller calls callBackCampaignChange");
//                $scope.$parent.callBackCampaignChange();
//              //   $scope.$parent.strategylist($scope.$parent.selectedCampaign.id);
//            }
        };



        //This function is used to call the campaign list from api, localstorage adapted
        $scope.campaignlist = function () {
            var allCampaigns = {};
            if (dataTransferService.getAllCampaignList(brandsModel.getSelectedBrand().id) === false) {
                domainReports.getAllCampaignListForUser(brandsModel.getSelectedBrand().id).then(function (result) {
                    if (result.status == 'success') {
                         allCampaigns = result.data.data ;
                        dataTransferService.setAllCampaignList(allCampaigns,(brandsModel.getSelectedBrand().id));
                        $scope.setCampaigns(allCampaigns.slice(0,200),allCampaigns);
                    }
                });
            } else {
                 allCampaigns = domainReports.getAllCampaignListForUser(brandsModel.getSelectedBrand().id);
                $scope.setCampaigns(allCampaigns.slice(0,200),allCampaigns);
            }
        };
        $scope.campaignlist();

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var selectedCampaign = {
                id : $(e.target).attr('value'),
                name :  $(e.target).text(),
                kpi : $(e.target).attr('_kpi'),
                kpi_text : ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi')
            };

            // clear the strategy data in localStorage
            dataTransferService.updateExistingStorageObjects({'strategyId' : '', 'strategyName' :  ''});

            $scope.$parent.selectedCampaign.id = selectedCampaign.id;
            $scope.$parent.selectedCampaign.name = selectedCampaign.name;
            if($scope.$parent.selected_filters !== undefined) {
                $scope.$parent.selected_filters.kpi_type = selectedCampaign.kpi;
                $scope.$parent.selected_filters.kpi_type_text = selectedCampaign.kpi_text
            }
            dataTransferService.updateExistingStorageObjects({
                'campaignId': selectedCampaign.id ,
                'campaignName': selectedCampaign.name,
                'previousCampaignId': dataTransferService.getDomainReportsValue('campaignId')
            });
            if($scope.$parent.selected_filters !== undefined) {
                dataTransferService.updateExistingStorageObjects({
                    'filterKpiValue': $scope.$parent.selected_filters.kpi_type_text,
                    'filterKpiType': $scope.$parent.selected_filters.kpi_type
                });
            }
            $scope.$apply();
            $(this).hide();
            $scope.$parent.callBackCampaignChange();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());

        });
    });
}());
