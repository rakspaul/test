(function () {
    'use strict';

    campaignSelectModule.controller('campaignSelectController', function ($scope, $rootScope , campaignSelectModel ,apiPaths, constants , brandsModel, loginModel, analytics,utils ) {

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

        console.log("in contrl file index: ",$scope.fileIndex);

        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during rapid scroll down.
        $scope.fetching = false;

       $scope.$parent.strategyLoading = true;
       //$scope.$parent.isFetchStrategiesCalled = false;


        var searchCriteria = utils.typeaheadParams;

        function resetSearchCriteria(){
            searchCriteria.offset  = constants.DEFAULT_OFFSET_START;
            searchCriteria.key = '';
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function(event,brand) {
            //Get Campaign for the selected brand
            resetSearchCriteria();
            $scope.exhausted = false;
           // $scope.$parent.isFetchStrategiesCalled = false;
            $scope.fetchCampaigns(true,true);

        });

        $scope.setCampaign = function (selectedCampaign) { // set campaign in campaign controller scope. and fire change in campaign event.

            if (selectedCampaign == undefined || selectedCampaign.id == -1) {

                selectedCampaign = {
                    id: -1,
                    name: 'No Campaign Found',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                };
            }

            var selectedBrand = brandsModel.getSelectedBrand();
            if(selectedBrand.id !== -1) {
                selectedCampaign['cost_transparency'] = selectedBrand.cost_transparency;
            }
console.log('in controller');
            campaignSelectModel.setSelectedCampaign(selectedCampaign,$scope.fileIndex);
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
        };

        $scope.fetchCampaigns = function(search,set_campaign){
            campaignSelectModel.getCampaigns(brandsModel.getSelectedBrand().id,searchCriteria).then(function(){

                //TODO : rewrite what to do in search condiiton

                var campObj = campaignSelectModel.getCampaignObj();

                if(search)
                    $scope.campaignData.campaigns = campObj.campaigns;
                else
                    $scope.campaignData.campaigns = $scope.campaignData.campaigns.concat(campObj.campaigns);

                if(set_campaign)
                    $scope.setCampaign(campObj.campaigns[0]);

                $scope.fetching = false;

                if( $scope.campaignData.campaigns.length < searchCriteria.limit )
                    $scope.exhausted = true;
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
            if(campaignSelectModel.getSelectedCampaign().id == -1){
                $scope.fetchCampaigns(true,true);
            }
            else {
                $scope.setCampaign(campaignSelectModel.getCampaignObj().selectedCampaign);
                $scope.fetchCampaigns(true,false);
                $scope.campaignData.campaigns = [campaignSelectModel.getCampaignObj().selectedCampaign];
            }

            localStorage.setItem('isNavigationFromCampaigns', false);

        };

        $scope.init();


        //Function called when the user clicks on the campaign dropdown
        $('.campaigns_list').on('click', 'li', function (e) { console.log('u clicked me',e);
            $scope.$parent.strategyLoading = true ;
            //$scope.$parent.isFetchStrategiesCalled = false;
            var selectedCampaign = {
                id : $(e.target).attr('value'),
                name :  $(e.target).text(),
                kpi : $(e.target).attr('_kpi'),
                startDate : $(e.target).attr('_startDate'),
                endDate :  $(e.target).attr('_endDate')

            };
            $scope.setCampaign(selectedCampaign );

            $('.campaigns_list').hide();
            //$scope.$apply();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
            e.preventDefault();
            e.stopImmediatePropagation();

        });
        // $(function() {
        //   $("#campaignsDropdownDiv").on('click',  function(){
        //         $('#campaigns_list').scrollTop(0)
        //     });
        // });




    });
}());
