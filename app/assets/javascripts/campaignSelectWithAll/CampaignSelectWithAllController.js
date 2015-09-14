/**
 * Created by sapna on 26/08/15.
 */
(function () {
    'use strict';

    campaignSelectWithAllModule.controller('campaignSelectWithAllController', function ($scope, $rootScope , campaignSelectWithAllModel ,apiPaths, constants , brandsModel, loginModel, analytics,utils ) {

        $scope.campaignData = {
            campaigns : {},
            selectedCampaign :  {
                id: 0,
                name : 'Loading...',
                kpi : 'ctr',
                startDate : '-1',
                endDate : '-1'
            }
        };
        $scope.campAll = [{id:0,name:'All Campaign',kpi : 'ctr',startDate : '-1',endDate : '-1'}];

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

            //console.log("Selected camapign id",selectedCampaign.id);
            if (selectedCampaign == undefined || selectedCampaign.id == 0) {

                selectedCampaign = {
                    id: 0,
                    name: 'All Campaign',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                };
            }

            var selectedBrand = brandsModel.getSelectedBrand();
            if(selectedBrand.id !== -1) {
                selectedCampaign['cost_transparency'] = selectedBrand.cost_transparency;
            }
            campaignSelectWithAllModel.setSelectedCampaign(selectedCampaign);
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
            $('#campaign_name_selected').prop('title', selectedCampaign.name);
        };

        $scope.fetchCampaigns = function(search,set_campaign,fn){
           // console.log('search criteria: ',searchCriteria);
            campaignSelectWithAllModel.getCampaigns(brandsModel.getSelectedBrand().id,searchCriteria).then(function(){

                //TODO : rewrite what to do in search condiiton

                var campObj = campaignSelectWithAllModel.getCampaignObj();
                var campArrObj = campObj.campaigns
                $scope.campaignData.campaigns = [];
               // console.log('search: ',search)
                if(search) {
                    campArrObj.unshift.apply(campArrObj, $scope.campAll);
                    $scope.campaignData.campaigns = campArrObj;//campObj.campaigns;
                }else {
                    $scope.campaignData.campaigns = $scope.campaignData.campaigns.concat(campObj.campaigns);
                }
                if(set_campaign)
                    $scope.setCampaign(campObj.campaigns[0]);

                $scope.fetching = false;

                if( $scope.campaignData.campaigns.length < searchCriteria.limit )
                    $scope.exhausted = true;

                if(fn != undefined) {
                    fn(campArrObj);
                }

            });

        };

        $scope.search = function(){
            resetSearchCriteria();
            var search = $("#campaignDropdown").val();
            searchCriteria.key = search;
            $scope.fetchCampaigns(true,false,function(campaignArrObjs) {
            //    $scope.campaignData.campaigns.push.apply($scope.campaignData.campaigns, campaignArrObjs);
            });
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
                //$scope.setCampaign(campaignSelectWithAllModel.getCampaignObj().selectedCampaign);
                $scope.setCampaign($scope.selectedObj);
                $scope.fetchCampaigns(true,false,function(campaignArrObjs) {
                    $scope.campaignData.campaigns.push.apply($scope.campaignData.campaigns, campaignArrObjs);});

                //  $scope.campaignData.campaigns = [campaignSelectModel.getCampaignObj().selectedCampaign];
                $scope.campaignData.campaigns = campaignSelectWithAllModel.getCampaignObj().selectedCampaign;


            localStorage.setItem('isNavigationFromCampaigns', false);

        };

        $scope.init();


        //Function called when the user clicks on the campaign dropdown
        $('#campaigns_list').on('click', 'li', function (e) {
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

            $('#campaigns_list').hide();
            //$scope.$apply();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
        });
        // $(function() {
        //   $("#campaignsDropdownDiv").on('click',  function(){
        //         $('#campaigns_list').scrollTop(0)
        //     });
        // });




    });
}());
