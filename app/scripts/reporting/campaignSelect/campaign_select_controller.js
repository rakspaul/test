define(['angularAMD','campaign-select-model',  'common-utils'], function (angularAMD) {
    'use strict';

        angularAMD.controller('CampaignSelectController', ['$location', '$scope', '$rootScope', '$routeParams',
            'campaignSelectModel', 'constants', 'brandsModel', 'loginModel', 'utils', 'vistoconfig', 'pageFinder',
            function ($location, $scope, $rootScope, $routeParams, campaignSelectModel, constants, brandsModel,
                      loginModel, utils, vistoconfig, pageFinder) {

                $scope.loading_icon_mediaplan = 'loadedDropdownData' ;
            var searchCriteria = utils.typeAheadParams,
                campaignsList,
                loadCampaigns = true,

                setMediaPlan = function() {
                    var locationUrl = $location.url();

                    if (locationUrl === '/reports/list') {
                        $scope.isAllMediaPlan = true;
                    } else {
                        $scope.isAllMediaPlan = false;
                    }
                };
            $('#campaigns_list').hide();
            function resetSearchCriteria() {
                searchCriteria.offset = constants.DEFAULT_OFFSET_START;
                searchCriteria.key = '';
            }

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
                        // TODO: rewrite what to do in search condition
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

                        if ($scope.campaignData.campaigns.length < searchCriteria.limit) {
                            $scope.loading_icon_mediaplan = '' ;
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
                $scope.loading_icon_mediaplan = 'loadedDropdownData' ;
                $scope.fetching = true;
            };

            $scope.loadMore = function () {
                searchCriteria.offset += searchCriteria.limit + 1;
                searchCriteria.key = $('#campaignDropdown').val();
                $scope.fetchCampaigns(false, false);
                $scope.fetching = true;
            };

            $('.campaign_name_selected').click(function (event) {
                var elem = $(event.target);
                if (loadCampaigns) {
                    $scope.fetchCampaigns(false, false);
                    loadCampaigns = false;
                }
                if($scope.multiCampaign === undefined) {
                    if ($('#campaigns_list').css('display') === 'block') {
                        $('#campaigns_list').hide();
                    } else {
                        $('#campaigns_list').show();
                    }

                    var inputValue = $('#campaignDropdown').val();
                    if(inputValue) {
                        $('#campaignDropdown').attr('placeholder', inputValue);
                        $('#campaignDropdown').val('');
                        //if($scope.allCampaign == "true") {
                        $('#campaign_name_selected').val(inputValue);
                        $scope.selectedObj.name = inputValue;
                        //}
                    }
                } else {
                    var target = $(event.target);
                    var campaignListElem = target.parent().find('.campaigns_list');
                    if (campaignListElem.css('display') === 'block') {
                        campaignListElem.hide();
                    } else {
                        campaignListElem.show();
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }

                // to close the other media plan dropdown which is open
                $('.mediaplan-dd-open').removeClass('mediaplan-dd-open') ;
                $('.report-type-col .dropdown-menu').hide() ;
                elem.siblings('.dropdown_type1').addClass('mediaplan-dd-open') ;
            //    $('.dropdown_type1').not('.mediaplan-dd-open').hide() ;
                $('.mediaplan-dd-open').show() ;
            });

            campaignsList = $('.campaigns_list');

            // Function called when the user clicks on the campaign dropdown
            campaignsList.on('click', function () {
                campaignsList.not(this).hide();
            });

            $scope.selectCampaign = function(campaign) {
                var url;

                $scope.$parent.strategyLoading = true;
                $scope.selectedObj = campaign;
                $('.campaigns_list').hide();

                url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {
                    url += '/sa/' + $routeParams.subAccountId;
                }

                if($routeParams.advertiserId) {
                    url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                }
                url += '/mediaplans/' + campaign.campaign_id;
                var page = pageFinder.pageBuilder($location.path());
                if (page.isCannedReportsPage()) {
                    var reportName = _.last($location.path().split('/'));
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
                if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    $scope.loadMore();
                }
            });
        }]);
    }
);
