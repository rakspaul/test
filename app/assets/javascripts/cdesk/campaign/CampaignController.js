(function () {
    'use strict';
    campaignModule.controller('campaignController', function ($scope, $rootScope , domainReports, campaignModel ,apiPaths, dataTransferService, constants , brandsModel, loginModel, analytics,utils ) {

        $scope.campaignData = {
            campaigns : {},
            selectedCampaign :  {
                id: -1,
                name : 'Loading...',
                kpi : 'NA',
                startDate : '-1',
                endDate : '-1'
            }
        };

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
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event,brand) {
            //Get Campaign for the selected brand
            resetSearchCriteria();
            $scope.exhausted = false;
            $scope.fetchCampaigns(true,true);

        });

        $scope.setCampaign = function (selectedCampaign) { // set campaign in campaign controller scope. and fire change in campaign event.

            console.log("Set Campaing called ");
            console.log(selectedCampaign);
            if(selectedCampaign == undefined || selectedCampaign.id == -1) {

                var selectedCampaign = {
                    id: -1,
                    name: 'No Campaign Found',
                    kpi: 'NA',
                    startDate: '-1',
                    endDate: '-1'
                };
            }

//                $scope.campaignData.selectedCampaign.id = selectedCampaign.id;
//                $scope.campaignData.selectedCampaign.name = selectedCampaign.name ;
//                $scope.campaignData.selectedCampaign.kpi = selectedCampaign.kpi ;
//                $scope.campaignData.selectedCampaign.startDate = selectedCampaign.startDate ;
//                $scope.campaignData.selectedCampaign.endDate = selectedCampaign.endDate ;


          //      campaignModel.setSelectedCampaign(selectedCampaign);
          //      $scope.$parent.callBackCampaignChange();
//                if(dataTransferService.getDomainReportsValue('campaignId')== false){ // Means No campaing selected in localStorage.
//                    $scope.$parent.selectedCampaign = domainReports.getFound(selectedCampaign)['campaign'];
//                }
//                else{
//                    $scope.$parent.selectedCampaign.id = dataTransferService.getDomainReportsValue('campaignId');
//                    $scope.$parent.selectedCampaign.name = dataTransferService.getDomainReportsValue('campaignName');
//                }
//                if($scope.$parent.selected_filters !== undefined) {
//                    $scope.$parent.selected_filters.kpi_type = dataTransferService.getDomainReportsValue('filterKpiType') ? dataTransferService.getDomainReportsValue('filterKpiType') : $scope.campaigns[0].kpi_type;
//                    $scope.$parent.selected_filters.kpi_type_text = dataTransferService.getDomainReportsValue('filterKpiValue') ? dataTransferService.getDomainReportsValue('filterKpiValue') : ($scope.campaigns[0].kpi_type === 'action_rate') ? 'Action Rate' : $scope.campaigns[0].kpi_type,
//                        dataTransferService.updateExistingStorageObjects({
//                            filterKpiType: $scope.$parent.selected_filters.kpi_type,
//                            filterKpiValue: $scope.$parent.selected_filters.kpi_type_text
//                        });
//                }
                //  $scope.$parent.callBackCampaignsSuccess();

                campaignModel.setSelectedCampaign(selectedCampaign);

             //   $scope.$parent.selectedCampaign = domainReports.getNotFound()['campaign'];
             //   $scope.$parent.callBackCampaignsFailure();
                console.log(campaignModel.getSelectedCampaign());
                console.log("Broad casing campaing change event ");

                $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED, selectedCampaign);


        };

        $scope.fetchCampaigns = function(search,set_campaign){
            //if ($scope.selectedCampaign == undefined) {
        //    domainReports.getAllCampaignListForUser(brandsModel.getSelectedBrand().id, searchCriteria).then(function (result) {

            campaignModel.getCampaigns(brandsModel.getSelectedBrand().id,searchCriteria).then(function(){

               console.log(" fetchCampaing success ");
               //TODO : rewrite what to do in search condiiton

                var campObj = campaignModel.getCampaignObj();

//                $scope.campaignData.campaigns = campObj.allCampaigns ;
//                $scope.campaignData.selectedCampaign = campObj.selectedCampaign ;

                if( $scope.campaignData.campaigns.length < searchCriteria.limit ){
                    $scope.exhausted = true;
                    $scope.fetching = false;
                }

                if(search)
                    $scope.campaignData.campaigns = campObj.campaigns;
                else
                    $scope.campaignData.campaigns = $scope.campaignData.campaigns.concat(campObj.campaigns);

                if(set_campaign)
                    $scope.setCampaign(campObj.campaigns[0]);


//                var campaigns = result.data.data;
//                if(campaigns.length < searchCriteria.limit)
//                    $scope.exhausted = true;
//                $scope.fetching = false;
//
//                if(search)
//                    $scope.campaigns = campaigns;
//                else
//                    $scope.campaigns = $scope.campaigns.concat(campaigns);
//
//                if(set_campaign)
//                    $scope.setCampaign($scope.campaigns[0]);
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

        $scope.init = function(){
            console.log("Campaing controller init method ");
            if(campaignModel.getSelectedCampaign().id == -1){
                console.log(" selected campaing id is -1 so fetching more ");
                $scope.fetchCampaigns(true,true);
            }
            else {
                //TODO: Remove this hack: assigning campaign_id with id.
                //Note : the following assignment is required as list of campaigns from backend will have campaign_id
                //whereas scope selected campaign is referring it with id.TODO: Remove this line
                //    $scope.$parent.selectedCampaign.campaign_id = $scope.$parent.selectedCampaign.id;

                //   $scope.campaigns = [$scope.$parent.selectedCampaign];
                //  $scope.setCampaign($scope.$parent.selectedCampaign);
                console.log("Selected campaing id is "+ campaignModel.getSelectedCampaign().id);
                $scope.setCampaign(campaignModel.getCampaignObj().selectedCampaign);
            }

        };

        $scope.init();


//        if($scope.$parent.selectedCampaign.id === "-1")
//            $scope.fetchCampaigns(true,true);
//        else {
//            //TODO: Remove this hack: assigning campaign_id with id.
//            //Note : the following assignment is required as list of campaigns from backend will have campaign_id
//            //whereas scope selected campaign is referring it with id.
//            $scope.$parent.selectedCampaign.campaign_id = $scope.$parent.selectedCampaign.id;
//            $scope.campaigns = [$scope.$parent.selectedCampaign];
//            $scope.setCampaign($scope.$parent.selectedCampaign);
//        }


//            var selectedCampaign = {
//                id : $(e.target).attr('value'),
//                name :  $(e.target).text(),
//                kpi : $(e.target).attr('_kpi')
//               // kpi_text : ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi')
//            };

        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var selectedCampaign = {
                id : $(e.target).attr('value'),
                name :  $(e.target).text(),
                kpi : $(e.target).attr('_kpi'),
                startDate : $(e.target).attr('_startDate'),
                endDate :  $(e.target).attr('_endDate')

                // kpi_text : ($(e.target).attr('_kpi') === 'action_rate') ? 'Action Rate' : $(e.target).attr('_kpi')
            };
            // clear the strategy data in localStorage
//            dataTransferService.updateExistingStorageObjects({'strategyId' : '', 'strategyName' :  ''});
            campaignModel.setSelectedCampaign(selectedCampaign);
            $scope.setCampaign(selectedCampaign );
           // $rootScope.$broadcast(constants.EVENT_BRAND_CHANGED, brand);

//            $scope.$parent.selectedCampaign.id = selectedCampaign.id;
//            $scope.$parent.selectedCampaign.name = selectedCampaign.name;
//            $scope.$parent.selectedCampaign.primary_kpi = selectedCampaign.kpi;

//            if($scope.$parent.selected_filters !== undefined) {
//                $scope.$parent.selected_filters.kpi_type = selectedCampaign.kpi;
//                $scope.$parent.selected_filters.kpi_type_text = selectedCampaign.kpi_text;
//                dataTransferService.updateExistingStorageObjects({
//                    'filterKpiValue': $scope.$parent.selected_filters.kpi_type_text,
//                    'filterKpiType': $scope.$parent.selected_filters.kpi_type
//                });
//            }
//            dataTransferService.updateExistingStorageObjects({
//                'campaignId': selectedCampaign.id ,
//                'campaignName': selectedCampaign.name,
//                'primary_kpi': selectedCampaign.kpi,
//                'previousCampaignId': dataTransferService.getDomainReportsValue('campaignId')
//            });

            $scope.$apply();
            $(this).hide();
 //           $scope.$parent.selected_filters = domainReports.getDurationKpi();

  //          $scope.$parent.callBackCampaignChange();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
        });



    });
}());
