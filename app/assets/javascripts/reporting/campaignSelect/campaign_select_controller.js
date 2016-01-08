(function () {
    'use strict';

    campaignSelectModule.controller('CampaignSelectController', function ($scope, $rootScope, campaignSelectModel, apiPaths, constants, brandsModel, loginModel, analytics, utils) {

        $scope.campaignData = {
            campaigns: {},
            selectedCampaign: {
                id: -1,
                name: 'Loading...',
                kpi: 'ctr',
                startDate: '-1',
                endDate: '-1'
            }
        };
        $scope.campAll = [{id: 0, name: 'All Media Plans', kpi: 'ctr', startDate: '-1', endDate: '-1'}];

        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during rapid scroll down.
        $scope.fetching = false;

        $scope.$parent.strategyLoading = true;
        //$scope.$parent.isFetchStrategiesCalled = false;


        var searchCriteria = utils.typeaheadParams;

        function resetSearchCriteria() {
            searchCriteria.offset = constants.DEFAULT_OFFSET_START;
            searchCriteria.key = '';
        };

        $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
            if(args.event_type === 'clicked') {
                resetSearchCriteria(); //Get Campaign for the selected brand
                $scope.exhausted = false;
                $scope.fetchCampaigns(true, true);
            }

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
            } else if ($scope.allCampaign == "true" && selectedCampaign.id == 0) {
                selectedCampaign = {
                    id: 0,
                    name: 'All Media Plans',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                };
            }

            var selectedBrand = brandsModel.getSelectedBrand();
            if (selectedBrand.id !== -1) {
                selectedCampaign['cost_transparency'] = selectedBrand.cost_transparency;
            }
            campaignSelectModel.setSelectedCampaign(selectedCampaign, $scope.fileIndex, $scope.allCampaign);
            $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
        };

        $scope.fetchCampaigns = function (search, set_campaign) {
            campaignSelectModel.getCampaigns(brandsModel.getSelectedBrand().id, searchCriteria).then(function () {

                //TODO : rewrite what to do in search condiiton

                var campObj = campaignSelectModel.getCampaignObj();
                var campArrObj = campObj.campaigns

                if (search) {
                    if ($scope.allCampaign == "true") {
                        campArrObj.unshift.apply(campArrObj, $scope.campAll);
                        $scope.campaignData.campaigns = campArrObj;
                    } else {
                        $scope.campaignData.campaigns = campObj.campaigns;
                    }
                } else {
                    $scope.campaignData.campaigns = $scope.campaignData.campaigns.concat(campObj.campaigns);
                }

                _.uniq($scope.campaignData.campaigns);

                if (set_campaign) {
                    $scope.setCampaign(campObj.campaigns[0]);
                }
                $scope.fetching = false;

                if ($scope.campaignData.campaigns.length < searchCriteria.limit)
                    $scope.exhausted = true;
            });

        };

        $scope.search = function (fileIndex) {
            resetSearchCriteria();
            if ($scope.multiCampaign == undefined) {
                var search = $("#campaignDropdown").val();
            } else {
                var search = $($(".campaignDropdown")[fileIndex]).val();
            }
            searchCriteria.key = search;
            $scope.fetchCampaigns(true, false);
            $scope.exhausted = false;
            $scope.fetching = true;
        };

        $scope.loadMore = function () {
            searchCriteria.offset += searchCriteria.limit + 1;
            searchCriteria.key = $("#campaignDropdown").val();
            $scope.fetchCampaigns(false, false);
            $scope.fetching = true;
        };

        $scope.init = function () {
            var pathArray = window.location.pathname.split('/');
            var firstLevelLocation = pathArray[1];
            var secondLevelLocation = pathArray[2];

            if (firstLevelLocation === "mediaplans" && secondLevelLocation !== undefined) {
                var selectedCampaignNew = {
                    id: secondLevelLocation,
                    name: 'All Media Plans',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                };
                campaignSelectModel.setSelectedCampaign(selectedCampaignNew);
            }
            if ($scope.allCampaign == "true") {
                $scope.fetchCampaigns(true, true);
            } else if ((campaignSelectModel.getSelectedCampaign().id == -1)) {
                $scope.fetchCampaigns(true, true);
            } else {
                $scope.setCampaign(campaignSelectModel.getCampaignObj().selectedCampaign);
                $scope.fetchCampaigns(true, false);
                $scope.campaignData.campaigns = [campaignSelectModel.getCampaignObj().selectedCampaign];
            }

            localStorage.setItem('isNavigationFromCampaigns', false);

        };

        $scope.init();

        $rootScope.$on('CAMPAIGN_CHANGE', function() {
            campaignSelectModel.removeSelectedCampaign();
            $scope.fetchCampaigns(true, true);
        })

        //Function called when the user clicks on the campaign dropdown
        $('.campaigns_list').on('click', 'li', function (e) {
            $scope.$parent.strategyLoading = true;
            //$scope.$parent.isFetchStrategiesCalled = false;
            var selectedCampaign = {
                id: $(e.target).attr('value'),
                name: $(e.target).text(),
                kpi: $(e.target).attr('_kpi'),
                startDate: $(e.target).attr('_startDate'),
                endDate: $(e.target).attr('_endDate')

            };
            $scope.setCampaign(selectedCampaign);

            $('.campaigns_list').hide();
            analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
            e.preventDefault();
            e.stopImmediatePropagation();

        });
    });
}());
