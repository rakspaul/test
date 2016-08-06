define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdClone', function($scope ,$rootScope, $timeout, $routeParams, $location, $modalInstance,
                                              vistoconfig, getMediaPlansForClone, workflowService, constants,
                                              localStorageService) {

        var selectedMediaPlanId,
            selectedAdGroupId = -1,

            clone = {
                getAllMediaPlan: function () {
                    var clientId = vistoconfig.getSelectedAccountId(),
                        advertiserId = Number(vistoconfig.getSelectAdvertiserId());

                    // make api call to fetch all media plan - used in ad clone popup
                    workflowService.getAllCampaignsForAdClone(clientId, advertiserId).then(function(result){
                        var responseData,
                            index;

                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;
                            $scope.mediaPlanList = responseData;
                            // sort media plan list
                            $scope.mediaPlanList =  _.sortBy($scope.mediaPlanList , 'name');

                            index = _.findIndex($scope.mediaPlanList,function(plan){
                                return parseInt(plan.id) === parseInt($scope.campaignId);
                            });
                            if (index !== -1){
                                $scope.mediaPlanName = $scope.mediaPlanList[index].name +
                                    '<span class="greyTxt">(Current)</span>';
                                selectedMediaPlanId = $scope.mediaPlanList[index].id;
                            }
                            clone.getAdGroups(selectedMediaPlanId);
                        } else {
                            clone.errorHandler(result);
                        }
                    });
                },

                getAdGroups: function(selectedMediaPlanId){
                    // var campaignId = vistoconfig.getSelectedCampaignId();
                    // make api call to fetch all media plan - used in ad clone popup
                    var clientId = vistoconfig.getSelectedAccountId();

                    workflowService
                        .getAdgroups(clientId, selectedMediaPlanId, false,true)
                        .then(function (result) {
                            var responseData,
                                index;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = workflowService.wrapperForActiveAdGroups(result.data.data);

                                $scope.adGroupList = responseData.ad_groups;

                                index = _.findIndex($scope.adGroupList,function(obj){
                                    return obj.adGroup.id === Number($scope.adGroupId);
                                });

                                if (index >= 0){
                                    $scope.adGroupName = $scope.adGroupList[index].adGroup.name +
                                        '<span class="greyTxt">(Current)</span>';
                                    selectedAdGroupId = $scope.adGroupList[index].adGroup.id;
                                }
                            } else {
                                clone.errorHandler(result);
                            }
                        });
                },

                cloneAd: function () {
                    var requestData = {
                            source_ad_id: $scope.adId,
                            ad_group: selectedAdGroupId
                        },

                        responseData,
                        clientId = vistoconfig.getSelectedAccountId();

                    workflowService
                        .cloneAd(clientId, requestData,selectedMediaPlanId)
                        .then(function(result){
                            var url;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;

                                url = '/a/' + $routeParams.accountId;

                                if ($routeParams.subAccountId) {
                                    url += '/sa/' + $routeParams.subAccountId;
                                }

                                url += '/adv/'+$routeParams.advertiserId

                                url += '/mediaplan/'+responseData.campaignId;

                                if (responseData.lineitemId) {
                                    url += '/lineItem/'+responseData.lineitemId;
                                }

                                if (responseData.adGroupId){
                                    url += '/adGroup/'+responseData.adGroupId;
                                }

                                url += '/ads/'+ responseData.id + '/edit';
                                

                                clone.updateLocalStorage(requestData.ad_group);

                                $scope.close();

                                $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_CLONE_SUCCESS, 0);

                                $timeout(function(){
                                    $location.url(url);
                                },500);
                            } else {
                                $scope.close();
                                $scope.adArchiveLoader = false;
                                clone.errorHandler(result);
                            }
                        });
                },
                errorHandler: function (errData) {
                    if (errData.data.status === 404) {
                        $location.url('/mediaplans');
                    }
                    console.log(errData);
                },

                updateLocalStorage: function (newAdGroupId) {
                    var adGroupObjIndex = _.findIndex($scope.adGroupList,function(group){
                        return group.adGroup.id === newAdGroupId;
                    });

                    localStorageService.adGroupDetails.set($scope.adGroupList[adGroupObjIndex].adGroup);
                }
            };

        $scope.textConstants = constants;

        $scope.getMediaPlansForClone = function() {
            clone.getAllMediaPlan();
        };

        $scope.selectMediaPlan = function (mediaPlan) {
            selectedMediaPlanId = mediaPlan.id;

            if (parseInt(selectedMediaPlanId) === parseInt($scope.campaignId)){
                $scope.mediaPlanName = mediaPlan.name + '<span class="greyTxt">(Current)</span>';
            } else {
                $scope.mediaPlanName = mediaPlan.name;
            }

            // reset selected ad group
            selectedAdGroupId = -1;
            $scope.adGroupName = null;

            clone.getAdGroups(selectedMediaPlanId);
        };

        $scope.defaultDropdownToggle = function (event) {
            var elem = $(event.target);

            if ( elem.closest('.dropdown').find('.dropdown-menu').is(':hidden') ) {
                $('.clone-ad-popup ul.dropdown-menu').hide();
                elem.closest('.dropdown').find('.dropdown-menu').toggle();
            } else {
                elem.closest('.dropdown').find('.dropdown-menu').hide();
            }
        };

        $scope.selectAdGroup = function (adGroup) {
            if (adGroup){
                selectedAdGroupId = adGroup.id;

                if (parseInt(adGroup.id) === parseInt($scope.adGroupId)){
                    $scope.adGroupName = adGroup.name + '<span class="greyTxt">(Current)</span>';
                } else {
                    $scope.adGroupName = adGroup.name;
                }
            } else {
                selectedAdGroupId = -1;
                $scope.adGroupName = constants.WF_NO_AD_GROUP;
            }
        };

        $scope.close=function(){
            $modalInstance.dismiss();
        };

        $scope.beginAdClone = function(){
            $scope.adArchiveLoader = true;
            clone.cloneAd();
        };

        $scope.cancelAdClone = function () {
            $scope.adArchiveLoader = false;
            $scope.showCloneAdPopup = !$scope.showCloneAdPopup;
        };

        $(document).ready(function() {
            $scope.getMediaPlansForClone();
        });

    });
});
