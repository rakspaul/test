(function () {
    'use strict';
    angObj.controller('directiveController', function ($scope, domainReports, apiPaths, dataTransferService, constants , brandsModel, loginModel, analytics,utils ) {

        $scope.campaigns = {};
        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during rapid scroll down.
        $scope.fetching = false;


      //TODO: can make a general improvement
      // Don't make calls to server, if previous selected campaign is same as presently selected campaign.

      var searchCriteria = utils.typeaheadParams;

        function resetSearchCriteria(){
          searchCriteria.offset  = constants.DEFAULT_OFFSET_START;
          searchCriteria.key = '';
        }

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event,brand) {
          // clear the existing campaignDetails object present is localStroage.
          dataTransferService.updateExistingStorageObjects({ 'campaignId':'','campaignName': '', 'strategyId' : '', 'strategyName' :  ''});
          resetSearchCriteria();
          $scope.exhausted = false;
          $scope.fetchCampaigns(true,true);
        });

        $scope.setCampaign = function (selectedCampaign) {

          if(selectedCampaign != undefined){
            if(dataTransferService.getDomainReportsValue('campaignId')== false){ // Means No campaing selected in localStorage.
              $scope.$parent.selectedCampaign = domainReports.getFound(selectedCampaign)['campaign'];
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
          } else {
            $scope.$parent.selectedCampaign = domainReports.getNotFound()['campaign'];
            $scope.$parent.callBackCampaignsFailure();
          }
        };

       $scope.fetchCampaigns = function(search,set_campaign){
          //if ($scope.selectedCampaign == undefined) {
            domainReports.getAllCampaignListForUser(brandsModel.getSelectedBrand().id, searchCriteria).then(function (result) {

              var campaigns = result.data.data;
              if(campaigns.length < searchCriteria.limit)
                $scope.exhausted = true;
                $scope.fetching = false;

              if(search)
                $scope.campaigns = campaigns;
              else
                $scope.campaigns = $scope.campaigns.concat(campaigns);

              if(set_campaign)
                $scope.setCampaign($scope.campaigns[0]);
            });
          //}
        };

        $scope.search = function(){
          resetSearchCriteria();
          var search = $("#campaignDropdown").val();
          searchCriteria.key = search;
          $scope.fetchCampaigns(true,false);
          $scope.exhausted = false;
          $scope.fetching = true;
        };

        $scope.loadMore = function() {
          searchCriteria.offset += searchCriteria.limit + 1;
          searchCriteria.key = $("#campaignDropdown").val();
          $scope.fetchCampaigns(false,false);
          $scope.fetching = true;
        };

        if($scope.$parent.selectedCampaign.id === "-1")
          $scope.fetchCampaigns(true,true);
        else {
          //TODO: Remove this hack: assigning campaign_id with id.
          //Note : the following assignment is required as list of campaigns from backend will have campaign_id
          //whereas scope selected campaign is referring it with id.
          $scope.$parent.selectedCampaign.campaign_id = $scope.$parent.selectedCampaign.id;
          $scope.campaigns = [$scope.$parent.selectedCampaign];
          $scope.setCampaign($scope.$parent.selectedCampaign);
        }

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
          $scope.$parent.selectedCampaign.primary_kpi = selectedCampaign.kpi;
          if($scope.$parent.selected_filters !== undefined) {
            $scope.$parent.selected_filters.kpi_type = selectedCampaign.kpi;
            $scope.$parent.selected_filters.kpi_type_text = selectedCampaign.kpi_text;
            dataTransferService.updateExistingStorageObjects({
              'filterKpiValue': $scope.$parent.selected_filters.kpi_type_text,
              'filterKpiType': $scope.$parent.selected_filters.kpi_type
            });
          }
          dataTransferService.updateExistingStorageObjects({
            'campaignId': selectedCampaign.id ,
            'campaignName': selectedCampaign.name,
            'primary_kpi': selectedCampaign.kpi,
            'previousCampaignId': dataTransferService.getDomainReportsValue('campaignId')
          });

          $scope.$apply();
          $(this).hide();
          $scope.$parent.selected_filters = domainReports.getDurationKpi();
          $scope.$parent.callBackCampaignChange();
          analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
        });
    });
}());
