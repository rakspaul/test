angObj.controller('CreativeTagController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
    $scope.emptyCreativesFlag = true;
    $scope.loadingFlag = true; //loading flag
    $scope.$on('updateNewCreative', function () {
        var creativeTag = workflowService.getNewCreative();
        $scope.selectedArr.push(creativeTag);
        $scope.changeStatus();
        $scope.updateCreativeData($scope.selectedArr);

    })

    $scope.$on('updateCreativeTags', function () {
        if ($scope.mode === 'edit') {
            var responseData = workflowService.getAdsDetails();
            //creative tags
            if (responseData.creatives)
                $scope.selectedArr = responseData.creatives;

            $scope.changeStatus();
            $scope.updateCreativeData($scope.selectedArr);
        }
    })

    var addFromLibrary = {
        modifyCreativesData: function (respData) {
            var arr;
            _.each(respData, function (data) {
                if ($scope.selectedArr.length > 0) {
                    arr = _.filter($scope.selectedArr, function (obj) {
                        return obj.id === data.id
                    });
                    if (arr.length > 0) {
                        data['checked'] = arr[0].checked;
                    }
                } else {
                    data['checked'] = false;
                }
            });
            return respData;
        },

        getCreativesFromLibrary: function (clientID, adID, format, query) {
            var format= format.replace(/\s/g, '');// remove spaces.
            workflowService.getCreatives(clientID, adID, format, query, {cache: false}, $scope.TrackingIntegrationsSelected).then(function (result) {
                $scope.creativesLibraryData['creativesData'] = [];
                if (result.status === "OK" || result.status === "success" && result.data.data.length > 0) {
                    var responseData = result.data.data;
                    $scope.creativeListLoading = false;
                    $scope.creativesLibraryData['creativesData'] = addFromLibrary.modifyCreativesData(responseData);

                    if ($scope.mode === 'edit') {
                        _.each($scope.selectedArr, function (obj) {
                            obj.checked = true;
                            $("#" + obj.id).attr('checked', true);
                            var idx = _.findIndex($scope.creativesLibraryData['creativesData'], function (item) {
                                return item.id == obj.id
                            });
                            $scope.creativesLibraryData['creativesData'][idx]['checked'] = true;


                        })
                    }


                }
                else {
                    addFromLibrary.errorHandler(result);
                    $scope.loadingFlag = false;

                }
            }, addFromLibrary.errorHandler);
        },
        errorHandler: function (errData) {
            $scope.creativesLibraryData['creativesData'] = [];
            $scope.creativeListLoading = false;
        }
    };

    $scope.creativeSearchFunc = function () {
        var campaignId = $scope.workflowData['campaignData'].clientId;
        var advertiserId = $scope.workflowData['campaignData'].advertiserId;
        var searchVal = $scope.adData.creativeSearch;
        var qryStr = '';
        var formats = 'VIDEO,DISPLAY'
        if (searchVal.length > 0) {
            qryStr += '&query=' + searchVal;
        }
        addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, formats, qryStr);
    }

    $scope.$on('showCreativeLibrary', function () {
        var campaignId = $scope.workflowData['campaignData'].clientId;
        var advertiserId = $scope.workflowData['campaignData'].advertiserId;
        $scope.showHidePopup = true;
        $scope.creativeListLoading = true;
        addFromLibrary.getCreativesFromLibrary(campaignId, advertiserId, $scope.adData.adFormat.toUpperCase());
    })

    $scope.saveCreativeTags = function () {
        $scope.showHidePopup = false;
        $scope.preDeleteArr = [];
        $scope.preSelectArr = [];
        $scope.changeStatus();
        $scope.updateCreativeData($scope.selectedArr);
    };

    $scope.closePop = function () {
        $scope.showHidePopup = false;
        $scope.changeStatus();
        if ($scope.preDeleteArr.length > 0) {
            $scope.preDeleteArr = _.uniq($scope.preDeleteArr);
            _.each($scope.preDeleteArr, function (obj) {
                obj.checked = true;
                $scope.selectedArr.push(obj);
                $("#" + obj.id).attr('checked', true);
            })
        }
        if ($scope.preSelectArr.length > 0) {
            $scope.preSelectArr = _.uniq($scope.preSelectArr);
            _.each($scope.preSelectArr, function (obj) {
                var idx = _.findIndex($scope.selectedArr, function (item) {
                    return item.id == obj.id
                });

                $scope.selectedArr.splice(idx, 1);
                $("#" + obj.id).attr('checked', false);
            })
        }
        $scope.preSelectArr = [];
        $scope.selectedArr = _.uniq($scope.selectedArr);
        $scope.updateCreativeData($scope.selectedArr);
    };

    $scope.changeStatus = function () {
        _.each($scope.selectedArr, function (obj) {
            obj['checked'] = obj['userSelectedEvent'];
        })
    }

    $scope.updateCreativeData = function (data) {
        $scope.creativeData['creativeInfo'] = {'creatives': data.slice()};
        $scope.setSizes($scope.creativeData['creativeInfo']);// set sizes on side bar.
    };


    $scope.setSizes = function (selectedcreatives) {
        var creativeSizeArrC = []
        if (typeof selectedcreatives.creatives != 'undefined') {
            if (selectedcreatives.creatives.length == 1) {
                $scope.sizeString = selectedcreatives.creatives[0].size.size;
            } else if (selectedcreatives.creatives.length > 1) {
                $scope.sizeString = "";
                for (var i in selectedcreatives.creatives) {
                    creativeSizeArrC.push(selectedcreatives.creatives[i].size.size)
                }
                $scope.sizeString = creativeSizeArrC;
                var arrC = creativeSizeArrC;
                var resultC = noRepeatC(arrC);

                var str = '';
                var result = noRepeatC(arrC);
                for (var i = 0; i < result[0].length; i++) {
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
            var aC = [], bC = [], prevC;

            arrC.sort();
            for (var i = 0; i < arrC.length; i++) {
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

        if (selectedcreatives.creatives.length == 0)
            $scope.sizeString = constants.WF_NOT_SET;
        $scope.adData.setSizes = $scope.sizeString;
    }

    $scope.$on('removeCreativeTags', function ($event, arg) {
        //$scope.xyz=$scope.selectedArr;
        var selectedCreativeTag = arg[0]
        var actionFrom = arg[1];
        if (selectedCreativeTag.length > 0) {

            var idx = _.findLastIndex($scope.selectedArr, selectedCreativeTag[0]);
            $scope.selectedArr.splice(idx, 1);

            if (actionFrom !== 'popup') {

                $scope.updateCreativeData($scope.selectedArr)
            }
            else {
                //insert into predelete array
                $scope.preDeleteArr.push(selectedCreativeTag[0]);
            }
            var currIndx = _.findLastIndex($scope.creativesLibraryData['creativesData'], {'id': selectedCreativeTag[0].id});
            if ($scope.creativesLibraryData['creativesData'][currIndx])  $scope.creativesLibraryData['creativesData'][currIndx]['checked'] = false;
        }

        /*Enable save button of popup library if elements exists*/
    })

    $scope.stateChanged = function ($event, screenTypeObj) {

        var checkbox = $event.target;
        screenTypeObj.userSelectedEvent = checkbox.checked; // temporary user old selected status before cancel
        //screenTypeObj['checked'] = checkbox.checked;

        var selectedChkBox = _.filter($scope.selectedArr, function (obj) {
            return obj.id === screenTypeObj.id
        });

        if (selectedChkBox.length > 0) {
            var idx = _.findIndex($scope.selectedArr, function (item) {
                return item.id == screenTypeObj.id
            });
            var preidx = _.findIndex($scope.preDeleteArr, function (item) {
                return item.id == screenTypeObj.id
            });

            $scope.selectedArr.splice(idx, 1);
            if (preidx == -1)
                $scope.preDeleteArr.push(screenTypeObj);

        } else {
            $scope.selectedArr.push(screenTypeObj);
            $scope.preSelectArr.push(screenTypeObj);
        }
    };
});