define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AdClone', ['$scope', '$rootScope', '$timeout', '$routeParams', '$location', '$modalInstance',
        'vistoconfig', 'getMediaPlansForClone', 'workflowService', 'constants', 'localStorageService', 'urlBuilder',

        function ($scope, $rootScope, $timeout, $routeParams, $location, $modalInstance, vistoconfig, getMediaPlansForClone, workflowService, constants,
                  localStorageService, urlBuilder) {

            var selectedMediaPlanId,
                selectedAdGroupId = -1,

                clone = {
                    getAllMediaPlan: function () {
                        var clientId = vistoconfig.getSelectedAccountId(),
                            advertiserId = Number(vistoconfig.getSelectAdvertiserId());

                        // make api call to fetch all media plan - used in ad clone popup
                        workflowService.getAllCampaignsForAdClone(clientId, advertiserId).then(function (result) {
                            var responseData,
                                index;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                $scope.mediaPlanList = responseData;
                                // sort media plan list
                                $scope.mediaPlanList = _.sortBy($scope.mediaPlanList, 'name');

                                index = _.findIndex($scope.mediaPlanList, function (plan) {
                                    return parseInt(plan.id) === parseInt($scope.campaignId);
                                });
                                if (index !== -1) {
                                    $scope.mediaPlanName = $scope.mediaPlanList[index].name +
                                        '<span class="greyTxt">(Current)</span>';
                                    $scope.mediaPlanNameTooltip = $scope.mediaPlanList[index].name +
                                        ' (Current)';
                                    selectedMediaPlanId = $scope.mediaPlanList[index].id;
                                }
                                clone.getAdGroups(selectedMediaPlanId);
                            } else {
                                clone.errorHandler(result);
                            }
                        });
                    },

                    /*
                     make api call to fetch all media plan - used in ad clone popup
                     */

                    getAdGroups: function (selectedMediaPlanId) {


                        var clientId = vistoconfig.getSelectedAccountId();

                        workflowService
                            .getAdgroups(clientId, selectedMediaPlanId, false, true)
                            .then(function (result) {
                                var responseData,
                                    index;

                                if (result.status === 'OK' || result.status === 'success') {
                                    responseData = workflowService.wrapperForActiveAdGroups(result.data.data);

                                    $scope.adGroupList = responseData.ad_groups;

                                    index = _.findIndex($scope.adGroupList, function (obj) {
                                        return obj.adGroup.id === Number($scope.adGroupId);
                                    });

                                    if (index >= 0) {
                                        $scope.adGroupName = $scope.adGroupList[index].adGroup.name +
                                            '<span class="greyTxt">(Current)</span>';
                                        $scope.adGroupNameTooltip = $scope.adGroupList[index].adGroup.name +
                                            ' (Current)';
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
                            .cloneAd(clientId, requestData, selectedMediaPlanId)
                            .then(function (result) {
                                var url, params = {};

                                if (result.status === 'OK' || result.status === 'success') {
                                    responseData = result.data.data;

                                    params.advertiserId = $routeParams.advertiserId;

                                    if (responseData.campaignId) {
                                        params.campaignId = responseData.campaignId;
                                    }

                                    if (responseData.lineitemId) {
                                        params.lineItemId  = responseData.lineitemId;
                                    }

                                    if (responseData.adGroupId) {
                                        params.adGroupId = responseData.adGroupId;
                                    }

                                    if (responseData.id) {
                                        params.adId = responseData.id;
                                    }


                                    url = urlBuilder.adUrl(params);

                                    clone.updateLocalStorage(requestData.ad_group);

                                    $scope.close();

                                    $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_CLONE_SUCCESS, 0);

                                    $timeout(function () {
                                        $location.url(url);
                                    }, 500);

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
                        var adGroupObjIndex = _.findIndex($scope.adGroupList, function (group) {
                            return group.adGroup.id === newAdGroupId;
                        });

                        localStorageService.adGroupDetails.set($scope.adGroupList[adGroupObjIndex].adGroup);
                    }
                };

            $scope.textConstants = constants;

            $scope.getMediaPlansForClone = function () {
                clone.getAllMediaPlan();
            };

            $scope.selectMediaPlan = function (mediaPlan) {
                selectedMediaPlanId = mediaPlan.id;

                if (parseInt(selectedMediaPlanId) === parseInt($scope.campaignId)) {
                    $scope.mediaPlanName = mediaPlan.name + '<span class="greyTxt">(Current)</span>';
                    $scope.mediaPlanNameTooltip = mediaPlan.name + ' (Current)';
                } else {
                    $scope.mediaPlanName = mediaPlan.name;
                    $scope.mediaPlanNameTooltip = mediaPlan.name;
                }

                // reset selected ad group
                selectedAdGroupId = -1;
                $scope.adGroupName = null;
                $scope.adGroupNameTooltip = null;

                clone.getAdGroups(selectedMediaPlanId);
            };

            $scope.defaultDropdownToggle = function (event) {
                var elem = $(event.target);

                if (elem.closest('.dropdown').find('.dropdown-menu').is(':hidden')) {
                    $('.clone-ad-popup ul.dropdown-menu').hide();
                    elem.closest('.dropdown').find('.dropdown-menu').toggle();
                } else {
                    elem.closest('.dropdown').find('.dropdown-menu').hide();
                }
            };

            $scope.selectAdGroup = function (adGroup) {

                if (adGroup) {
                    selectedAdGroupId = adGroup.id;

                    if (parseInt(adGroup.id) === parseInt($scope.adGroupId)) {
                        $scope.adGroupName = adGroup.name + '<span class="greyTxt">(Current)</span>';
                        $scope.adGroupNameTooltip = adGroup.name + ' (Current)';
                    } else {
                        $scope.adGroupName = adGroup.name;
                        $scope.adGroupNameTooltip = adGroup.name;
                    }
                } else {
                    selectedAdGroupId = -1;
                    $scope.adGroupName = constants.WF_NO_AD_GROUP;
                    $scope.adGroupNameTooltip = constants.WF_NO_AD_GROUP;
                }

            };

            $scope.close = function () {
                $modalInstance.dismiss();
            };

            $scope.beginAdClone = function () {

                $scope.adArchiveLoader = true;
                clone.cloneAd();

            };

            $scope.cancelAdClone = function () {

                $scope.adArchiveLoader = false;
                $scope.showCloneAdPopup = !$scope.showCloneAdPopup;

            };

            $(document).ready(function () {

                $scope.getMediaPlansForClone();

            });

        }]);
});
