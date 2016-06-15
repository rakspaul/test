define(['angularAMD','reporting/campaignSelect/campaign_select_model', 'common/services/constants_service', 'reporting/brands/brands_model',
                      'login/login_model', 'common/utils'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignSelectController', function ($location, $scope, $rootScope, $routeParams,
                                                                campaignSelectModel, constants, brandsModel,
                                                                loginModel, utils, strategySelectModel) {

        console.log('CampaignSelectController initialized');

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
        var setMediaPlan = function() {
            var locationUrl = $location.url();
            if(locationUrl == '/reports/list') {
                $scope.isAllMediaPlan = true;
            } else {
                $scope.isAllMediaPlan = false;
            }
        }

        setMediaPlan();

        $scope.campAll = [{id: 0, name: 'All Media Plans', kpi: 'ctr', startDate: '-1', endDate: '-1'}];


        //if list is exhausted and nothing more to scroll. This variable prevents making calls to the server.
        $scope.exhausted = false;
        //This prevents from making too many calls during rapid scroll down.
        $scope.fetching = false;

        $scope.$parent.strategyLoading = true;

        var searchCriteria = utils.typeaheadParams;

        function resetSearchCriteria() {
            searchCriteria.offset = constants.DEFAULT_OFFSET_START;
            searchCriteria.key = '';
        };

        // $scope.$on(constants.EVENT_BRAND_CHANGED, function (event, args) {
        //     if(args.event_type === 'clicked') {
        //         resetSearchCriteria(); //Get Campaign for the selected brand
        //         $scope.exhausted = false;
        //         campaignSelectModel.removeSelectedCampaign();
        //         $scope.fetchCampaigns(true, true);
        //     }

        // });

       /* $scope.$on(constants.EVENT_SUB_ACCOUNT_CHANGED, function (event, args) {
            if(args.event_type === 'clicked') {
                resetSearchCriteria(); //Get Campaign for the selected brand
                $scope.exhausted = false;
                campaignSelectModel.removeSelectedCampaign();
                $scope.fetchCampaigns(true, true);
            }

        });*/




        // $scope.setCampaign = function (selectedCampaign) { // set campaign in campaign controller scope. and fire change in campaign event.
        //     setMediaPlan();

        //     if (selectedCampaign == undefined || selectedCampaign.id == -1) {
        //         selectedCampaign = {
        //             id: -1,
        //             name: constants.NO_MEDIAPLANS_FOUND,
        //             kpi: 'ctr',
        //             startDate: '-1',
        //             endDate: '-1'
        //         };
        //     } else if (($scope.isAllMediaPlan == "true" || $scope.isAllMediaPlan == true) && selectedCampaign.id == 0) {
        //         selectedCampaign = {
        //             id: 0,
        //             name: 'All Media Plans',
        //             kpi: 'ctr',
        //             startDate: '-1',
        //             endDate: '-1'
        //         };
        //     }

        //     if(selectedCampaign.id ===0  && ($scope.isAllMediaPlan ===  undefined || $scope.isAllMediaPlan ===  "")) {
        //         selectedCampaign = campaignSelectModel.getSelectedCampaign();
        //     }

        //     var selectedBrand = brandsModel.getSelectedBrand();
        //     if (selectedBrand.id !== -1) {
        //         selectedCampaign['cost_transparency'] = selectedBrand.cost_transparency;
        //     }
        //     campaignSelectModel.setSelectedCampaign(selectedCampaign, $scope.fileIndex, $scope.isAllMediaPlan);
        //     $rootScope.$broadcast(constants.EVENT_CAMPAIGN_CHANGED);
        // };

        $scope.fetchCampaigns = function (search, set_campaign) {
            delete searchCriteria.clientId;
            delete searchCriteria.advertiserId;
            console.log('fetchCampaigns');

            campaignSelectModel.getCampaigns(searchCriteria).then(function () {

                //TODO : rewrite what to do in search condiiton

                var campObj = campaignSelectModel.getCampaignObj();
                var campArrObj = campObj.campaigns

                if (search) {
                    if ($scope.isAllMediaPlan == "true" || $scope.isAllMediaPlan == true) {
                        campArrObj.unshift.apply(campArrObj, $scope.campAll);
                        $scope.campaignData.campaigns = campArrObj;
                    } else {
                        $scope.campaignData.campaigns = campObj.campaigns;
                    }
                } else {
                    $scope.campaignData.campaigns = $scope.campaignData.campaigns.concat(campObj.campaigns);
                }

                _.uniq($scope.campaignData.campaigns);

                // if (set_campaign) {
                //     $scope.setCampaign(campObj.campaigns[0]);
                // }
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

        var loadCampaigns = true;
        $('.campaign_name_selected').click(function (event) {
            var elem = $(event.target);
            if (loadCampaigns) {
                $scope.fetchCampaigns(false, false);
                loadCampaigns = false;
            }
            if($scope.multiCampaign == undefined) {
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
                var campaignListElem = target.parent().find(".campaigns_list");
                if (campaignListElem.css('display') === 'block') {
                    campaignListElem.hide();
                } else {
                    campaignListElem.show();
                }
                event.preventDefault();
                event.stopImmediatePropagation();
            }

            // to close the other media plan dropdown which is open
            $(".mediaplan-dd-open").removeClass("mediaplan-dd-open") ;
            $(".report-type-col .dropdown-menu").hide() ;
            elem.siblings(".dropdown_type1").addClass("mediaplan-dd-open") ;
            $(".dropdown_type1").not(".mediaplan-dd-open").hide() ;
            $(".mediaplan-dd-open").show() ;


        });
        // $scope.init = function () {
        //     var pathArray = window.location.pathname.split('/');
        //     var firstLevelLocation = pathArray[1];
        //     var secondLevelLocation = pathArray[2];
        //     if (firstLevelLocation === "mediaplans" && secondLevelLocation !== undefined) {
        //         var selectedCampaignNew = {
        //             id: secondLevelLocation,
        //             name: 'All Media Plans',
        //             kpi: 'ctr',
        //             startDate: '-1',
        //             endDate: '-1'
        //         };
        //         campaignSelectModel.setSelectedCampaign(selectedCampaignNew);
        //     }
        //     if ($scope.isAllMediaPlan == "true" || $scope.isAllMediaPlan == true) {
        //         resetSearchCriteria();
        //         $scope.fetchCampaigns(true, true);
        //     } else if ((campaignSelectModel.getSelectedCampaign().id == -1)) {
        //         $scope.fetchCampaigns(true, true);
        //     } else {
        //         $scope.setCampaign(campaignSelectModel.getCampaignObj().selectedCampaign);
        //         $scope.fetchCampaigns(true, false);
        //         $scope.campaignData.campaigns = [campaignSelectModel.getCampaignObj().selectedCampaign];
        //     }

        //     localStorage.setItem('isNavigationFromCampaigns', false);

        // };

        // $scope.init();

        // $rootScope.$on('CAMPAIGN_CHANGE', function() {
        //     campaignSelectModel.removeSelectedCampaign();
        //     $scope.fetchCampaigns(true, true);
        // })

        //Function called when the user clicks on the campaign dropdown
         $('.campaigns_list').on('click', function () {
           $(".campaigns_list").not(this).hide();

        });

        $scope.selectCampaign = function(campaign) {
            $scope.$parent.strategyLoading = true;
            //$scope.$parent.isFetchStrategiesCalled = false;
            // $scope.setCampaign(campaign);

            if(campaign.id == 0) {
                 resetSearchCriteria();
                 $scope.fetchCampaigns(false, false);
            }

            $('.campaigns_list').hide();
            //grunt analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
            // e.preventDefault();
            // e.stopImmediatePropagation();
            var url = "/a/" + $routeParams.accountId;
            if ($routeParams.subAccountId) {
                url += "/sa/" + $routeParams.subAccountId;
            }
            var reportName = _.last($location.path().split('/'));
            url += "/mediaplans/" + campaign.campaign_id + '/' + reportName;
            $routeParams.advertiser_id && (url += '?advertiser_id=' + $routeParams.advertiser_id);
            $routeParams.advertiser_id && $routeParams.brand_id && (url += '&brand_id=' + $routeParams.brand_id);
            console.log('url', url);
            $location.url(url);
        }
        // $('.campaigns_list').on('click', 'li', function (e) {
            
        //     $scope.$parent.strategyLoading = true;
        //     //$scope.$parent.isFetchStrategiesCalled = false;
        //     var selectedCampaign = {
        //         id: $(e.target).attr('value'),
        //         name: $(e.target).text(),
        //         kpi: $(e.target).attr('_kpi'),
        //         startDate: $(e.target).attr('_startDate'),
        //         endDate: $(e.target).attr('_endDate')

        //     };
        //     $scope.setCampaign(selectedCampaign);

        //     if(selectedCampaign.id == 0) {
        //          resetSearchCriteria();
        //          $scope.fetchCampaigns(false, false);
        //     }


        //     $('.campaigns_list').hide();
        //     //grunt analytics.track(loginModel.getUserRole(), constants.GA_USER_CAMPAIGN_SELECTION, selectedCampaign.name, loginModel.getLoginName());
        //     e.preventDefault();
        //     e.stopImmediatePropagation();

        // });
    });
});
