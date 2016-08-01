define(['angularAMD','reporting/campaignSelect/campaign_select_model',
    'common/services/constants_service', 'reporting/brands/brands_model', 'login/login_model', 'common/utils'],
    function (angularAMD) {
    'use strict';

        angularAMD.controller('CampaignSelectController', function ($location,$scope, $rootScope,
                                                                campaignSelectModel, constants, brandsModel,
                                                                loginModel, utils) {
            var searchCriteria = utils.typeAheadParams,
                campaignsList,

                setMediaPlan = function() {
                    var locationUrl = $location.url();

                    if (locationUrl === '/reports/list') {
                        $scope.isAllMediaPlan = true;
                    } else {
                        $scope.isAllMediaPlan = false;
                    }
                };

            function resetSearchCriteria() {
                searchCriteria.offset = constants.DEFAULT_OFFSET_START;
                searchCriteria.key = '';
            }

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

            setMediaPlan();

            $scope.campAll = [
                {
                    id: 0,
                    name: 'All Media Plans',
                    kpi: 'ctr',
                    startDate: '-1',
                    endDate: '-1'
                }
            ];

            // if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
            $scope.exhausted = false;

            // This prevents from making too many calls during rapid scroll down.
            $scope.fetching = false;

            $scope.$parent.strategyLoading = true;

            $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
                if (args.event_type === 'clicked') {
                    // Get Campaign for the selected brand
                    resetSearchCriteria();

                    $scope.exhausted = false;
                    campaignSelectModel.removeSelectedCampaign();
                    $scope.fetchCampaigns(true, true);
                }
            });

            // set campaign in campaign controller scope. and fire change in campaign event.
            $scope.setCampaign = function (selectedCampaign) {
                var selectedBrand = brandsModel.getSelectedBrand();

                setMediaPlan();

                if (selectedCampaign === undefined || selectedCampaign.id === -1) {
                    selectedCampaign = {
                        id: -1,
                        name: constants.NO_MEDIAPLANS_FOUND,
                        kpi: 'ctr',
                        startDate: '-1',
                        endDate: '-1'
                    };
                } else if (($scope.isAllMediaPlan === 'true' ||
                    $scope.isAllMediaPlan === true) &&
                    selectedCampaign.id === 0) {
                    selectedCampaign = {
                        id: 0,
                        name: 'All Media Plans',
                        kpi: 'ctr',
                        startDate: '-1',
                        endDate: '-1'
                    };
                }

                if (selectedCampaign.id === 0  &&
                    ($scope.isAllMediaPlan === undefined || $scope.isAllMediaPlan === '')) {
                    selectedCampaign = campaignSelectModel.getSelectedCampaign();
                }

                if (selectedBrand.id !== -1) {
                    selectedCampaign.cost_transparency = selectedBrand.cost_transparency;
                }

                campaignSelectModel.setSelectedCampaign(selectedCampaign, $scope.fileIndex, $scope.isAllMediaPlan);
                $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
            };

            $scope.fetchCampaigns = function (search, set_campaign) {
                delete searchCriteria.clientId;
                delete searchCriteria.advertiserId;

                campaignSelectModel
                    .getCampaigns(brandsModel.getSelectedBrand().id, searchCriteria)
                    .then(function () {
                        var campObj = campaignSelectModel.getCampaignObj(),
                            campArrObj = campObj.campaigns;

                        // TODO: rewrite what to do in search condition
                        if (search) {
                            if ($scope.isAllMediaPlan === 'true' || $scope.isAllMediaPlan === true) {
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

                        if ($scope.campaignData.campaigns.length < searchCriteria.limit) {
                            $scope.exhausted = true;
                        }
                    });
            };

            $scope.search = function (fileIndex) {
                var search;

                resetSearchCriteria();

                if ($scope.multiCampaign === undefined) {
                    search = $('#campaignDropdown').val();
                } else {
                    search = $($('.campaignDropdown')[fileIndex]).val();
                }

                searchCriteria.key = search;
                $scope.fetchCampaigns(true, false);
                $scope.exhausted = false;
                $scope.fetching = true;
            };

            $scope.loadMore = function () {
                searchCriteria.offset += searchCriteria.limit + 1;
                searchCriteria.key = $('#campaignDropdown').val();
                $scope.fetchCampaigns(false, false);
                $scope.fetching = true;
            };

            $scope.init = function () {
                var pathArray = window.location.pathname.split('/'),
                    firstLevelLocation = pathArray[1],
                    secondLevelLocation = pathArray[2],
                    selectedCampaignNew;

                if (firstLevelLocation === 'mediaplans' && secondLevelLocation !== undefined) {
                    selectedCampaignNew = {
                        id: secondLevelLocation,
                        name: 'All Media Plans',
                        kpi: 'ctr',
                        startDate: '-1',
                        endDate: '-1'
                    };

                    campaignSelectModel.setSelectedCampaign(selectedCampaignNew);
                }

                if ($scope.isAllMediaPlan === 'true' || $scope.isAllMediaPlan === true) {
                    resetSearchCriteria();
                    $scope.fetchCampaigns(true, true);
                } else if ((campaignSelectModel.getSelectedCampaign().id === -1)) {
                    $scope.fetchCampaigns(true, true);
                } else {
                    // TODO: Commented the below line because when you directly go to a canned report from dashboard
                    // it was still showing Loading.. under mediaplan though it was loaded.
                    // $scope.setCampaign(campaignSelectModel.getCampaignObj().selectedCampaign);
                    $scope.fetchCampaigns(true, false);
                    $scope.campaignData.campaigns = [campaignSelectModel.getCampaignObj().selectedCampaign];
                }

                localStorage.setItem('isNavigationFromCampaigns', false);
            };

            $scope.init();

            $rootScope.$on('CAMPAIGN_CHANGE', function() {
                campaignSelectModel.removeSelectedCampaign();
                $scope.fetchCampaigns(true, true);
            });

            campaignsList = $('.campaigns_list');

            // Function called when the user clicks on the campaign dropdown
            campaignsList.on('click', function () {
                campaignsList.not(this).hide();
            });

            campaignsList.on('click', 'li', function (e) {
                var selectedCampaign = {
                    id: $(e.target).attr('value'),
                    name: $(e.target).text(),
                    kpi: $(e.target).attr('_kpi'),
                    startDate: $(e.target).attr('_startDate'),
                    endDate: $(e.target).attr('_endDate')

                };

                e.preventDefault();
                e.stopImmediatePropagation();

                $scope.$parent.strategyLoading = true;
                $scope.setCampaign(selectedCampaign);

                if (selectedCampaign.id === 0) {
                     resetSearchCriteria();
                     $scope.fetchCampaigns(false, false);
                }

                campaignsList.hide();
            });

            $('.dropdown_list_scroll').on('scroll', function() {
                if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    $scope.loadMore();
                }
            })
        });
    }
);
