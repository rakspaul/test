var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CreativeTagController', function ($scope, $window, $routeParams, constants, workflowService) {
        var addFromLibrary = {
            modifyCreativesData: function (respData) {
                var arr;

                _.each(respData, function (data) {
                    if ($scope.selectedArr.length > 0) {
                        arr = _.filter($scope.selectedArr, function (obj) {
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

            getCreativesFromLibrary: function (clientID, adID, format, query) {
                // remove spaces.
                format = format.replace(/\s/g, '');

                workflowService
                    .getCreatives(clientID, adID, format, query, {cache: false}, $scope.TrackingIntegrationsSelected)
                    .then(function (result) {
                        var responseData;
console.log('getCreativesFromLibrary: $scope.selectedArr = ', $scope.selectedArr);
                        $scope.creativesLibraryData.creativesData = [];
                        if (result.status === 'OK' || result.status === 'success' && result.data.data.length > 0) {
                            responseData = result.data.data;
                            $scope.creativeListLoading = false;
                            $scope.creativesLibraryData.creativesData = addFromLibrary.modifyCreativesData(responseData);
                            if ($scope.mode === 'edit') {
                                _.each($scope.selectedArr, function (obj) {
                                    var idx;

                                    obj.checked = true;
                                    $('#' + obj.id).attr('checked', true);
                                    idx = _.findIndex($scope.creativesLibraryData.creativesData, function (item) {
                                        return item.id === obj.id;
                                    });
                                    $scope.creativesLibraryData.creativesData[idx].checked = true;
                                });
                                console.log('creative_tag_controller.js -- workflowService.getCreatives(): EDIT mode!!!');
                            } else {
                                console.log('creative_tag_controller.js -- workflowService.getCreatives(): CREATE mode!!!');
                                //$scope.selectedArr = [];
                                $scope.creativesLibraryData.creativesData.map(function (obj) {
                                    //obj.checked = false;
                                });
                            }
                        } else {
                            addFromLibrary.errorHandler(result);
                            $scope.loadingFlag = false;
                        }
                    }, addFromLibrary.errorHandler);
            },

            errorHandler: function (errData) {
                $scope.creativesLibraryData.creativesData = [];
                $scope.creativeListLoading = false;
            }
        };

        $scope.creativeSearchFunc = function () {
            var campaignId = $scope.workflowData.campaignData.clientId,
                advertiserId = $scope.workflowData.campaignData.advertiserId,
                searchVal = $scope.adData.creativeSearch,
                qryStr = '',
                formats = 'VIDEO,DISPLAY';

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
            $scope.updateCreativeData($scope.selectedArr);
        };

        $scope.closePop = function () {
            var idx;
            $scope.showHidePopup = false;
            $scope.changeStatus();
console.log('creative_tag_controller.js -- closePop: $scope.preDeleteArr = ', $scope.preDeleteArr,
    ', $scope.preSelectArr = ', $scope.preSelectArr,
    ', $scope.selectedArr = ', $scope.selectedArr);
            if ($scope.preDeleteArr.length > 0) {
                $scope.preDeleteArr = _.uniq($scope.preDeleteArr);
                _.each($scope.preDeleteArr, function (obj) {
                    obj.checked = true;
                    $scope.selectedArr.push(obj);
                    $('#' + obj.id).attr('checked', true);
                });
            }
            if ($scope.preSelectArr.length > 0) {
                $scope.preSelectArr = _.uniq($scope.preSelectArr);
                _.each($scope.preSelectArr, function (obj) {
                    idx = _.findIndex($scope.selectedArr, function (item) {
                        return item.id === obj.id;
                    });
                    $scope.selectedArr.splice(idx, 1);
                    $('#' + obj.id).attr('checked', false);
                });
            }
            $scope.preSelectArr = [];
            $scope.selectedArr = _.uniq($scope.selectedArr);
            $scope.updateCreativeData($scope.selectedArr);
        };

        $scope.changeStatus = function () {
            _.each($scope.selectedArr, function (obj) {
                obj.checked = obj.userSelectedEvent;
            });
        };

        $scope.updateCreativeData = function (data) {
            $scope.creativeData.creativeInfo = {'creatives': data.slice()};
            // set sizes on side bar.
            $scope.setSizes($scope.creativeData.creativeInfo);
        };

        $scope.setSizes = function (selectedcreatives) {
            var creativeSizeArrC = [],
                arrC,
                resultC,
                str,
                result,
                i;

            if (typeof selectedcreatives.creatives !== 'undefined') {
                if (selectedcreatives.creatives.length === 1) {
                    $scope.sizeString = selectedcreatives.creatives[0].size.size;
                } else if (selectedcreatives.creatives.length > 1) {
                    $scope.sizeString = '';
                    for (i in selectedcreatives.creatives) {
                        creativeSizeArrC.push(selectedcreatives.creatives[i].size.size);
                    }
                    $scope.sizeString = creativeSizeArrC;
                    arrC = creativeSizeArrC;
                    resultC = noRepeatC(arrC);
                    str = '';
                    result = noRepeatC(arrC);
                    for (i = 0; i < result[0].length; i++) {
                        if (result[1][i] > 1) {
                            str += result[0][i] + '(' + result[1][i] + ')' + ', ';
                        } else {
                            str += result[0][i] + ', ';
                        }
                    }
                    $scope.sizeString = str.substr(0, str.length - 2).replace(/X/g, 'x');
                }
            } else {
                $scope.sizeString = constants.WF_NOT_SET;
            }

            function noRepeatC(arrC) {
                var aC = [],
                bC = [],
                prevC,
                i;

                arrC.sort();
                for (i = 0; i < arrC.length; i++) {
                    if (arrC[i] !== prevC) {
                        aC.push(arrC[i]);
                        bC.push(1);
                    } else {
                        bC[bC.length - 1]++;
                    }
                    prevC = arrC[i];
                }
                return [aC, bC];
            }

            if (selectedcreatives.creatives.length === 0) {
                $scope.sizeString = constants.WF_NOT_SET;
            }
            $scope.adData.setSizes = $scope.sizeString;
        };

        $scope.stateChanged = function ($event, screenTypeObj) {
            var checkbox = $event.target,
                selectedChkBox,
                idx,
                preIdx;
console.log('$scope.stateChanged()!!!!');
            // temporary user old selected status before cancel
            screenTypeObj.userSelectedEvent = checkbox.checked;
            selectedChkBox = _.filter($scope.selectedArr, function (obj) {
                return obj.id === screenTypeObj.id;
            });
            if (selectedChkBox.length > 0) {
                idx = _.findIndex($scope.selectedArr, function (item) {
                    return item.id === screenTypeObj.id;
                });
                preIdx = _.findIndex($scope.preDeleteArr, function (item) {
                    return item.id === screenTypeObj.id;
                });
                $scope.selectedArr.splice(idx, 1);
                if (preIdx === -1) {
                    $scope.preDeleteArr.push(screenTypeObj);
                }
            } else {
                $scope.selectedArr.push(screenTypeObj);
                $scope.preSelectArr.push(screenTypeObj);
            }
        };

        $scope.emptyCreativesFlag = true;
        $scope.loadingFlag = true;
        $scope.$on('updateNewCreative', function () {
            var creativeTag = workflowService.getNewCreative();

            $scope.selectedArr.push(creativeTag);
            $scope.changeStatus();
            $scope.updateCreativeData($scope.selectedArr);
        });

        $scope.$on('updateCreativeTags', function () {
            var responseData;

            if ($scope.mode === 'edit') {
                responseData = workflowService.getAdsDetails();
                //creative tags
                if (responseData.creatives) {
                    $scope.selectedArr = responseData.creatives;
                }
                $scope.changeStatus();
                $scope.updateCreativeData($scope.selectedArr);
            }
        });

        $scope.$on('showCreativeLibrary', function () {
            var campaignId = $scope.workflowData.campaignData.clientId,
                advertiserId = $scope.workflowData.campaignData.advertiserId;

            $scope.showHidePopup = true;
            $scope.creativeListLoading = true;
            addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, $scope.adData.adFormat.toUpperCase());
        });

        $scope.$on('removeCreativeTags', function ($event, arg) {
            var selectedCreativeTag = arg[0],
                actionFrom = arg[1],
                idx,
                currIndx;
console.log('CreativeTagController: removeCreativeTags: $event = ', $event, ', arg = ', arg);
            if (selectedCreativeTag.length > 0) {
                idx = _.findLastIndex($scope.selectedArr, function(obj){
                    return obj.id === Number(selectedCreativeTag[0].id);
                });
                //_.findLastIndex($scope.selectedArr, selectedCreativeTag[0]);
                $scope.selectedArr.splice(idx, 1);
                if (actionFrom !== 'popup') {
                    $scope.updateCreativeData($scope.selectedArr);
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
})();
