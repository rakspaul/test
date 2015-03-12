(function () {
    'use strict';

    campaignSelectModule.controller('campaignSelectController', function ($scope, $rootScope , domainReports, campaignSelectModel ,apiPaths, dataTransferService, constants , brandsModel, loginModel, analytics,utils ) {

        $scope.campaignData = {
            campaigns : {},
            selectedCampaign :  {
                id: -1,
                name : 'Loading...',
                kpi : 'ctr',
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

            if(selectedCampaign == undefined || selectedCampaign.id == -1) {

                selectedCampaign = {
                    id: -1,
                    name: 'No Campaign Found',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                };
            }

            campaignSelectModel.setSelectedCampaign(selectedCampaign);
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED, selectedCampaign);


        };

        $scope.fetchCampaigns = function(search,set_campaign){
            campaignSelectModel.getCampaigns(brandsModel.getSelectedBrand().id,searchCriteria).then(function(){

                //TODO : rewrite what to do in search condiiton

                var campObj = campaignSelectModel.getCampaignObj();

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
            });

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
            //  console.log("Campaing controller init method ");
            if(campaignSelectModel.getSelectedCampaign().id == -1){
                //     console.log(" selected campaing id is -1 so fetching more ");
                $scope.fetchCampaigns(true,true);
            }
            else {
                $scope.setCampaign(campaignSelectModel.getCampaignObj().selectedCampaign);
            }

        };

        $scope.init();


        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').click(function (e) {
            var selectedCampaign = {
                id : $(e.target).attr('value'),
                name :  $(e.target).text(),
                kpi : $(e.target).attr('_kpi'),
                startDate : $(e.target).attr('_startDate'),
                endDate :  $(e.target).attr('_endDate')

            };
            console.log("Campaign Name is changed ");
            $scope.setCampaign(selectedCampaign );


            $scope.$apply();
            $(this).hide();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
        });




    });
}());
