define(['angularAMD','reporting/campaignSelect/campaign_select_model',
    'common/services/constants_service', 'reporting/brands/brands_model', 'login/login_model', 'common/utils'],
    function (angularAMD) {
    'use strict';

        angularAMD.controller('CampaignSelectController', function ($location, $scope, $rootScope, $routeParams,
                                                                campaignSelectModel, constants, brandsModel,
                                                                loginModel, utils, pageFinder) {
            var searchCriteria = utils.typeaheadParams,
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
                console.log('fetchCampaigns');

                campaignSelectModel.getCampaigns(searchCriteria).then(function () {

                    //TODO : rewrite what to do in search condiiton

                    var campObj = campaignSelectModel.getCampaignObj();
                    var campArrObj = campObj.campaigns;

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
                $('.dropdown_type1').not('.mediaplan-dd-open').hide() ;
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

                url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                url += '/mediaplans/' + campaign.campaign_id;
                var page = pageFinder.pageBuilder($location.path());
                if (page.isCannedReportsPage()) {
                    var reportName = _.last($location.path().split('/'));
                    url += '/' +reportName;
                    console.log('url', url);
                    $location.url(url);
                } else if (page.isUploadReportsPage()) {
                   console.log('isUploadReportsPage');
                } else if (page.isUploadedReportsListPage()) {
                    url += '/reports/list';
                    $location.url(url);
                }
            };
        });
    }
);
