
define(['angularAMD','common/services/constants_service','workflow/services/workflow_service'],function (angularAMD) {
  angularAMD.controller('CreativeTagController', function($scope, constants, workflowService) {

        var addFromLibrary = {
            modifyCreativesData: function (respData) {
                var arr;

                _.each(respData, function (data) {
                    if ($scope.$parent.selectedArr.length > 0) {
                        arr = _.filter($scope.$parent.selectedArr, function (obj) {
                            return obj.id === data.id;
                        });
                        if (arr.length > 0) {
                            data.checked = arr[0].checked;
                        }
                    } else {
                        data.checked = false;
                    }
                });
                return respData;
            },

            getCreativesFromLibrary: function (clientID, adID, format, query,state) {
                // If adFormat has changed (Eg: from Display to RichMedia, etc.),
                // reset selected creatives array
                if ($scope.$parent.adFormatChanged) {
                    $scope.$parent.selectedArr.length = 0;
                    // Reset flag variable as it has served its purpose
                    $scope.$parent.adFormatChanged = false;
                }

                // remove spaces.
                format = format.replace(/\s/g, '');
                workflowService
                    .getCreatives(clientID, adID, format, query, {cache: false}, $scope.TrackingIntegrationsSelected,state)
                    .then(function (result) {
                        var responseData,
                            selectedCreative;

                        $scope.creativesLibraryData.creativesData = [];
                        if (result.status === 'OK' || result.status === 'success' && result.data.data.length > 0) {
                            responseData = result.data.data;
                            $scope.creativeListLoading = false;
                            $scope.creativesLibraryData.creativesData = addFromLibrary.modifyCreativesData(responseData);
                            if ($scope.mode === 'edit') {
                                _.each($scope.$parent.selectedArr, function (obj) {
                                    var idx;

                                    obj.checked = true;
                                    $('#' + obj.id).attr('checked', true);
                                    idx = _.findIndex($scope.creativesLibraryData.creativesData, function (item) {
                                        return item.id === obj.id;
                                    });
                                    selectedCreative = $scope.creativesLibraryData.creativesData[idx];
                                    if (selectedCreative) {
                                        selectedCreative.checked = true;
                                    }
                                });
                            }
                        } else {
                            addFromLibrary.errorHandler(result);
                            $scope.loadingFlag = false;
                        }
                    }, addFromLibrary.errorHandler);
            },

            errorHandler: function (/*errData*/) {
                $scope.creativesLibraryData.creativesData = [];
                $scope.creativeListLoading = false;
            }
        };

        $scope.creativeSearchFunc = function () {
            var format;

            if ($scope.adData.adFormat === constants.WF_RICH_MEDIA) {
                format = constants.WF_RICH_MEDIA_SEARCH;
            } else if ($scope.adData.adFormat === constants.WF_DISPLAY) {
                format = constants.WF_DISPLAY_SEARCH;
            } else if ($scope.adData.adFormat === constants.WF_VIDEO){
                format = constants.WF_VIDEO_SEARCH;
            } else if ($scope.adData.adFormat === constants.WF_SOCIAL){
                format = constants.WF_SOCIAL_SEARCH;
            }

            var campaignId = $scope.workflowData.campaignData.clientId,
                advertiserId = $scope.workflowData.campaignData.advertiserId,
                searchVal = $scope.adData.creativeSearch,
                qryStr = '',
                formats = format;

            if (searchVal.length > 0) {
                qryStr += '&query=' + searchVal;
            }
            addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, formats, qryStr);
        };

        $scope.saveCreativeTags = function () {
            $scope.showHidePopup = false;
            $scope.preDeleteArr = [];
            $scope.preSelectArr = [];
            $scope.changeStatus();
            $scope.updateCreativeData($scope.$parent.selectedArr);
        };

        $scope.closePop = function () {
            var idx;

            $scope.showHidePopup = false;
            $scope.changeStatus();
            if ($scope.preDeleteArr.length > 0) {
                $scope.preDeleteArr = _.uniq($scope.preDeleteArr);
                _.each($scope.preDeleteArr, function (obj) {
                    obj.checked = true;
                    $scope.$parent.selectedArr.push(obj);
                    $('#' + obj.id).attr('checked', true);
                });
            }
            if ($scope.preSelectArr.length > 0) {
                $scope.preSelectArr = _.uniq($scope.preSelectArr);
                _.each($scope.preSelectArr, function (obj) {
                    idx = _.findIndex($scope.$parent.selectedArr, function (item) {
                        return item.id === obj.id;
                    });
                    $scope.$parent.selectedArr.splice(idx, 1);
                    $('#' + obj.id).attr('checked', false);
                });
            }
            $scope.preSelectArr = [];
            $scope.$parent.selectedArr = _.uniq($scope.$parent.selectedArr);
            $scope.updateCreativeData($scope.$parent.selectedArr);
        };

        $scope.stateChanged = function ($event, screenTypeObj) {
            var checkbox = $event.target,
                selectedChkBox,
                idx,
                preIdx;

            // temporary user old selected status before cancel
            screenTypeObj.userSelectedEvent = checkbox.checked;
            selectedChkBox = _.filter($scope.$parent.selectedArr, function (obj) {
                return obj.id === screenTypeObj.id;
            });
            if (selectedChkBox.length > 0) {
                idx = _.findIndex($scope.$parent.selectedArr, function (item) {
                    return item.id === screenTypeObj.id;
                });
                preIdx = _.findIndex($scope.preDeleteArr, function (item) {
                    return item.id === screenTypeObj.id;
                });
                $scope.$parent.selectedArr.splice(idx, 1);
                if (preIdx === -1) {
                    $scope.preDeleteArr.push(screenTypeObj);
                }
            } else {
                $scope.$parent.selectedArr.push(screenTypeObj);
                $scope.preSelectArr.push(screenTypeObj);
            }
        };

        $scope.emptyCreativesFlag = true;
        $scope.loadingFlag = true;
        $scope.$on('updateNewCreative', function () {
            var creativeTag = workflowService.getNewCreative();

            $scope.$parent.selectedArr.push(creativeTag);
            $scope.changeStatus();
            $scope.updateCreativeData($scope.$parent.selectedArr);
        });

        $scope.$on('updateCreativeTags', function () {
            var responseData;

            if ($scope.mode === 'edit') {
                responseData = workflowService.getAdsDetails();
                //creative tags
                if (responseData.creatives) {
                    $scope.$parent.selectedArr = responseData.creatives;
                }
                $scope.changeStatus();
                $scope.updateCreativeData($scope.$parent.selectedArr);
            }
        });

        $scope.$on('showCreativeLibrary', function () {
            var campaignId = $scope.workflowData.campaignData.clientId,
                advertiserId = $scope.workflowData.campaignData.advertiserId;

            $scope.showHidePopup = true;
            $scope.creativeListLoading = true;
            addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, $scope.adData.adFormat.toUpperCase(),'','READY');
        });

        $scope.$on('removeCreativeTags', function ($event, arg) {
            var selectedCreativeTag = arg[0],
                actionFrom = arg[1],
                idx,
                currIndx;

            if (selectedCreativeTag.length > 0) {
                idx = _.findLastIndex($scope.$parent.selectedArr, function(obj){
                    return obj.id === Number(selectedCreativeTag[0].id);
                });
                //_.findLastIndex($scope.selectedArr, selectedCreativeTag[0]);
                $scope.$parent.selectedArr.splice(idx, 1);
                if (actionFrom !== 'popup') {
                    $scope.updateCreativeData($scope.$parent.selectedArr);
                } else {
                    //insert into predelete array
                    $scope.preDeleteArr.push(selectedCreativeTag[0]);
                }
                currIndx = _.findLastIndex($scope.creativesLibraryData.creativesData, {'id': selectedCreativeTag[0].id});
                if ($scope.creativesLibraryData.creativesData[currIndx]) {
                    $scope.creativesLibraryData.creativesData[currIndx].checked = false;
                }
            }
            // TODO: Enable save button of popup library if elements exists
        });
    });
});
