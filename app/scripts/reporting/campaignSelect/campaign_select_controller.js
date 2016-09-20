define(['angularAMD','campaign-select-model',  'common-utils'], function (angularAMD) {
    'use strict';

        angularAMD.controller('CampaignSelectController', ['$location', '$scope', '$rootScope', '$routeParams',
            'campaignSelectModel', 'constants', 'brandsModel', 'loginModel', 'utils', 'vistoconfig', 'pageFinder',
            function ($location, $scope, $rootScope, $routeParams, campaignSelectModel, constants, brandsModel, loginModel, utils, vistoconfig, pageFinder) {
                var searchCriteria = utils.typeAheadParams,
                    campaignsList,
                    loadCampaigns = true,
                    loadMoreOnScroll = true,
                    searchMoreTimer = 0,

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

                $scope.loading_icon_mediaplan = 'loadedDropdownData';
                $('#campaigns_list').hide();

                $scope.campaignData = {
                    campaigns: [],

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

                $scope.fetchCampaigns = function (search) {
                    delete searchCriteria.clientId;
                    delete searchCriteria.advertiserId;

                    campaignSelectModel
                        .getCampaigns(vistoconfig.getSelectedBrandId(), searchCriteria)
                        .then(function () {
                            var campObj = campaignSelectModel.getCampaignObj(),
                                campArrObj = campObj.campaigns;

                            $scope.loading_icon_mediaplan = '' ;

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
                            $scope.fetching = false;

                            if (campArrObj.length < searchCriteria.limit) {
                                $scope.loading_icon_mediaplan = '' ;
                                $scope.exhausted = true;
                            } else {
                                $scope.exhausted = false;
                            }
                        });
                };

                $scope.search = function (fileIndex) {
                    var search,
                        campaignDropdown = $('.campaignDropdown');

                    if (searchMoreTimer) {
                        clearTimeout(searchMoreTimer);
                    }

                    searchMoreTimer = setTimeout(function () {
                        resetSearchCriteria();

                        if ($scope.multiCampaign === undefined) {
                            search = campaignDropdown.val();
                        } else {
                            search = $(campaignDropdown[fileIndex]).val();
                        }

                        searchCriteria.key = search.trim();

                        // Don't perform search if search key is exactly 1 char. This is in line with the API search implementation.
                        if (searchCriteria.key.length === 1) {
                            return;
                        }

                        $scope.fetchCampaigns(true, false);
                        $scope.exhausted = false;
                        $scope.loading_icon_mediaplan = 'loadedDropdownData';
                        $scope.fetching = true;
                    }, 400);
                };

                $scope.loadMore = function () {
                    if (!$scope.exhausted) {
                        searchCriteria.offset += searchCriteria.limit + 1;
                        searchCriteria.key = $('#campaignDropdown').val();
                        $scope.fetchCampaigns(false, false);
                        $scope.fetching = true;
                    }
                };

                $('.campaign_name_selected').click(function (event) {
                    var elem = $(event.target),
                        campaignList = $('#campaigns_list'),
                        campaignDropdown = $('#campaignDropdown'),
                        inputValue = campaignDropdown.val(),
                        mediaPlanDdOpen = $('.mediaplan-dd-open'),
                        target,
                        campaignListElem;

                    if (loadCampaigns) {
                        $scope.fetchCampaigns(false, false);
                        loadCampaigns = false;
                    }

                    if ($scope.multiCampaign === undefined) {
                        if (campaignList.css('display') === 'block') {
                            campaignList.hide();
                        } else {
                            campaignList.show();
                        }

                        if (inputValue) {
                            campaignDropdown.attr('placeholder', inputValue);
                            campaignDropdown.val('');
                            $('#campaign_name_selected').val(inputValue);
                            $scope.selectedObj.name = inputValue;
                        }
                    } else {
                        target = $(event.target);
                        campaignListElem = target.parent().find('.campaigns_list');

                        if (campaignListElem.css('display') === 'block') {
                            campaignListElem.hide();
                        } else {
                            campaignListElem.show();
                        }

                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    // to close the other media plan dropdown which is open
                    mediaPlanDdOpen.removeClass('mediaplan-dd-open') ;
                    $('.report-type-col .dropdown-menu').hide() ;
                    elem.siblings('.dropdown_type1').addClass('mediaplan-dd-open') ;
                    mediaPlanDdOpen.show() ;
                });

                campaignsList = $('.campaigns_list');

                // Function called when the user clicks on the campaign dropdown
                campaignsList.on('click', function () {
                    campaignsList.not(this).hide();
                });

                $scope.selectCampaign = function(campaign) {
                    var url,
                        page,
                        reportName;

                    $scope.$parent.strategyLoading = true;
                    $scope.selectedObj = campaign;
                    $('.campaigns_list').hide();

                    url = '/a/' + $routeParams.accountId;

                    if ($routeParams.subAccountId) {
                        url += '/sa/' + $routeParams.subAccountId;
                    }

                    if ($routeParams.advertiserId) {
                        url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                    }

                    url += '/mediaplans/' + campaign.campaign_id;
                    page = pageFinder.pageBuilder($location.path());

                    if (page.isCannedReportsPage()) {
                        reportName = _.last($location.path().split('/'));
                        url += '/' +reportName;
                        $location.url(url);
                    } else if (page.isUploadReportsPage()) {
                       console.log('isUploadReportsPage');
                    } else if (page.isUploadedReportsListPage()) {
                        url += '/reports/list';
                        $location.url(url);
                    }
                };

                campaignsList.hide();

                $('.dropdown_list_scroll').on('scroll', function() {
                    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                        if (loadMoreOnScroll) {
                            $scope.loadMore();

                            // No subsequent loads for this scroll session
                            loadMoreOnScroll = false;
                        } else {
                            // Load on next scroll
                            loadMoreOnScroll = true;
                        }
                    }
                });
            }
        ]);
    }
);
