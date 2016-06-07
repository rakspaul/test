var angObj = angObj || {};

define(['angularAMD', '../../../workflow/services/account_service', '../../services/constants_service',
    'common/moment_utils', 'workflow/directives/custom_date_picker', 'common/services/data_service',
    'common/services/url_service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', function ($scope, $rootScope, $modalInstance,
                                                                   accountsService, constants, momentService,
                                                                   dataService, urlService) {
        var _currCtrl = this;

        $scope.advertiserData.disableDownLoadPixel = true;
        $scope.selectedBillType = 'Select';
        $scope.selectedRateType = 'Select';

        $scope.showUserModeText = function () {
            return ($scope.mode === 'create'? 'Add Advertiser':'Edit Advertiser ( ' + $scope.advObj.name + ' )');
        };

        $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
        $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';

        $scope.close=function () {
            $scope.resetBrandAdvertiserAfterEdit();
            $modalInstance.dismiss();
            _currCtrl.clearAdvInputFiled();
            $scope.advertiserAddOrEditData.duplicatePixelName = false;
        };

        $('.miniTabLinks.sub .btn').removeClass('active');
        $('.miniTabLinks.sub .subBasics').addClass('active');
        $modalInstance.opened.then(function () {
            $('popup-msg').appendTo(document.body);
        });

        _currCtrl.downloadPixelIds = [];

        _currCtrl.clearAdvInputFiled = function () {
            $scope.advertiserAddOrEditData.enableAdChoice = false;
            $scope.advertiserAddOrEditData.adChoiceCode = '';
            _currCtrl.isAdChoiceInClient = false;
            _currCtrl.isAdChoiceInAdv = false;
            $scope.advertiserAddOrEditData.resAdChoiceData = {};
        };

        _currCtrl.clearAdvInputFiled();

        _currCtrl.getIABCategoryList = function () {
            accountsService
                .getIABCategoryList()
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.advertiserAddOrEditData.IABCategoryList = res.data.data;
                    }
                },function (err) {
                });
        };

        _currCtrl.getIABSubCategoryList = function (groupId) {
            accountsService
                .getIABSubCategoryList(groupId)
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        $scope.advertiserAddOrEditData.IABSubCategoryList = res.data.data;
                    } else {
                        console.log('Error: To get the sub-category list');
                    }
                },function (err) {
                    console.log('Error: To get the sub-category list');
                });
        };

        _currCtrl.getIABCategoryList();

        _currCtrl.getIABCategory = function () {
            accountsService
                .getIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (res) {
                    var result = res.data.data;

                    _currCtrl.isAdChoiceInClient = false;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data && res.data.data.id) {
                        _currCtrl.isAdChoiceInClient = true;
                        $scope.advertiserAddOrEditData.selectedIABCategory = result.groupName;
                        $scope.advertiserAddOrEditData.selectedIABCategoryId = result.groupId;

                        if (result.groupId !== result.id) {
                            $scope.advertiserAddOrEditData.selectedIABSubCategory = result.name;
                            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = result.id;
                        }

                        _currCtrl.getIABSubCategoryList($scope.advertiserAddOrEditData.selectedIABCategoryId);
                    }
                },function (err) {
                });
        };

        _currCtrl.saveIABCategory = function () {
            var id = $scope.advertiserAddOrEditData.selectedIABSubCategoryId ?
                    $scope.advertiserAddOrEditData.selectedIABSubCategoryId :
                    $scope.advertiserAddOrEditData.selectedIABCategoryId,
                reqBody = {
                    iabId: id
                };

            accountsService
                .saveIABCategoryForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody)
                .then(function (res) {
                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        // TODO: Do something with the returned data???
                    }
                },function (err) {
                });
        };

        _currCtrl.getAdChoiceDataFromClient = function () {
            accountsService
                .getAdChoiceDataFromClient($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (res) {
                    _currCtrl.isAdChoiceInClient = false;

                    if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                        _currCtrl.isAdChoiceInClient = true;
                        $scope.advertiserAddOrEditData.enableAdChoice = res.data.data.enabled;
                        $scope.advertiserAddOrEditData.adChoiceCode = res.data.data.code;
                        $scope.advertiserAddOrEditData.resAdChoiceData = res.data.data;
                    }
                }, function (err) {
                });
        };

        _currCtrl.getAdChoiceData = function () {
            accountsService
                .getAdChoiceDataFromAdv($scope.client.id, $scope.selectedAdvertiserId)
                .then(function (resAdv) {
                    _currCtrl.isAdChoiceInAdv = false;

                    if ((resAdv.status === 'OK' || resAdv.status === 'success') && resAdv.data.data) {
                        _currCtrl.isAdChoiceInAdv = true;
                        $scope.advertiserAddOrEditData.enableAdChoice = resAdv.data.data.enabled;
                        $scope.advertiserAddOrEditData.adChoiceCode = resAdv.data.data.code;
                        $scope.advertiserAddOrEditData.resAdChoiceData = resAdv.data.data;
                    } else {
                        _currCtrl.getAdChoiceDataFromClient();
                    }
                },function (err) {
                    _currCtrl.getAdChoiceDataFromClient();
                });
        };

        _currCtrl.saveAdChoiceData = function () {
            var reqBody = {
                enabled: $scope.advertiserAddOrEditData.enableAdChoice,
                code: $scope.advertiserAddOrEditData.adChoiceCode
            };
            if(reqBody.enabled !== $scope.advertiserAddOrEditData.resAdChoiceData.enabled || reqBody.code !== $scope.advertiserAddOrEditData.resAdChoiceData.code){
                accountsService
                    .saveAdChoiceDataForAdv($scope.client.id, $scope.selectedAdvertiserId, reqBody)
                    .then(function (res) {
                        if (res.status === 'OK' || res.status === 'success') {
                            // For Save Data
                        } else {
                            console.log('Error: Save Ad Choice in Advertiser');
                        }
                    },function (err) {
                        console.log('Error: Save Ad Choice in Advertiser');
                    });
            }
        };

        // TODO: Why is this commented out???
        /*$rootScope.$on('advertiserDataReceived',function () {
            $scope.getAdnlData();
        });*/

        $scope.selectIABCategory = function (type) {
            $scope.advertiserAddOrEditData.selectedIABCategory = type.name;
            $scope.advertiserAddOrEditData.selectedIABCategoryId = type.id;
            $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
            _currCtrl.getIABSubCategoryList(type.id);
        };

        $scope.selectIABSubCategory = function (type) {
            $scope.advertiserAddOrEditData.selectedIABSubCategory = type.name;
            $scope.advertiserAddOrEditData.selectedIABSubCategoryId = type.id;
        };

        $scope.getAdnlData = function () {
            _currCtrl.getAdChoiceData();
            _currCtrl.getIABCategory();
            // TODO: get data for BillingMethods
        };

        _currCtrl.saveAdnlData = function () {
            _currCtrl.saveAdChoiceData();
            _currCtrl.saveIABCategory();
            // TODO: save for BillingMethods
        };

        _currCtrl.verifyCreateAdvInputs = function () {
            var ret = true,
                errMsg = 'Error';

            if (!$scope.selectedAdvertiserId || $scope.selectedAdvertiserId === '') {
                $rootScope.setErrAlertMessage(constants.EMPTY_ADV_SELECTION);
                return false;
            }

            if ($scope.advertiserAddOrEditData.enableAdChoice && !$scope.advertiserAddOrEditData.adChoiceCode) {
                errMsg = constants.EMPTY_ADCHOICE_CODE;
                ret = false;
            }

            if (!$scope.advertiserAddOrEditData.selectedIABCategory ||
                $scope.advertiserAddOrEditData.selectedIABCategory === 'Select') {
                errMsg = constants.EMPTY_IAB_CATEGORY;
                ret = false;
            }

            if (!ret) {
                $rootScope.setErrAlertMessage(errMsg);
            }

            return ret;
        };

        $scope.saveAdvertisers = function () {
            if (!_currCtrl.verifyCreateAdvInputs()) {
                return;
            }

            createAdvertiserUnderClient($scope.selectedAdvertiserId);
        };

        $scope.showRespectiveMethod = function (type) {
            $scope.selectedBillType = type;
        };

        $scope.downLoadPixel = function () {
            var url = urlService.downloadAdminAdvPixel($scope.client.id, $scope.selectedAdvertiserId);

            if (!_currCtrl.downloadPixelIds.length) {
                return false;
            }

            if (_currCtrl.downloadPixelIds.length && (_currCtrl.downloadPixelIds.length < $scope.advertiserData.pixels.length)) {
                url += '?id='+ _currCtrl.downloadPixelIds.join(',');
            }

            dataService
                .downloadFile(url)
                .then(function (res) {
                    if (res.status === 'OK' || res.status === 'success') {
                        saveAs(res.file, res.fileName);
                        $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_SUCCESS, 0);
                    } else {
                        $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR);
                    }
                },function (err) {
                    $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR);
                });
        };

        $scope.selectPixel = function (pixelId, isSelected) {
            if (isSelected) {
                $scope.advertiserData.disableDownLoadPixel = false;
                if (_currCtrl.downloadPixelIds.indexOf(pixelId) === -1) {
                    _currCtrl.downloadPixelIds.push(pixelId);
                }
            } else {
                _currCtrl.downloadPixelIds = _.filter(_currCtrl.downloadPixelIds, function (item) {
                    return item !== pixelId;
                });

                if (!_currCtrl.downloadPixelIds.length) {
                    $scope.advertiserData.disableDownLoadPixel = true;
                }
            }
        };

        $scope.selectAllPixels = function () {
            var checkBoxes = $('.pixelSelect');

            checkBoxes.prop('checked', !checkBoxes.prop('checked'));

            if (checkBoxes.prop('checked')) {
                $scope.advertiserData.disableDownLoadPixel = false;
                _currCtrl.downloadPixelIds = _.pluck($scope.advertiserData.pixels, 'id');
            } else {
                $scope.advertiserData.disableDownLoadPixel = true;
                _currCtrl.downloadPixelIds = [];
            }
        };

        $scope.checkDuplicatePixel = function (name) {
            $scope.advertiserAddOrEditData.duplicatePixelName = false;
            _.each($scope.advertiserData.pixels, function (item, i) {
                if (!$scope.advertiserAddOrEditData.duplicatePixelName) {
                    $scope.advertiserAddOrEditData.duplicatePixelName = ((item.name === name) && ($scope.pixelIndex != i)) ? true : false;
                }
            });
        };

        function createAdvertiserUnderClient(advId) {
            var requestData = {
                lookbackImpressions : 14,
                lookbackClicks : 14
            };

            accountsService
                .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        _currCtrl.saveAdnlData();
                        $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();

                        if ($scope.advertiserData.pixels.length) {
                            createPixelsforAdvertiser($scope.clientId, advId);
                        } else {
                            //$scope.fetchAllAdvertisersforClient($scope.client.id);
                            $scope.fetchAllClients();
                        }

                        if ($scope.isEditMode) {
                            $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
                        } else {
                            $rootScope.setErrAlertMessage('Advertiser add successfully', 0);
                        }
                    } else {
                    }
                }, function (err) {
                    $scope.close();
                    if ($scope.isEditMode) {
                        $rootScope.setErrAlertMessage('Error in updating advertiser under client.', 0);
                    } else {
                        $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                    }
                });
        }

        function addPixeltoAdvertiserUnderClient(clientId, advId) {
            var requestData = {
                lookbackImpressions : Number($scope.advertiserData.lookbackImpressions),
                lookbackClicks : Number($scope.advertiserData.lookbackClicks)
            };

            accountsService
                .updateAdvertiserUnderClient($scope.client.id, advId, requestData)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $rootScope.setErrAlertMessage('Pixels added successfully', 0);
                    } else {
                        $scope.close();
                        $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage(constants.ERR_ADD_PIXEL);
                });
        }

        function getRequestDataforPixel(clientId, advertiserId) {
            _.each($scope.advertiserData.pixels, function (item, index) {
                $scope.advertiserData.pixels[index] = {
                    name : item.name,
                    clientId : clientId,
                    advertiserId : advertiserId,
                    pixelType : item.pixelType,
                    poolSize : 0,
                    description: item.description,
                    createdBy: item.createdBy,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    impLookbackWindow: item.impLookbackWindow,
                    clickLookbackWindow: item.clickLookbackWindow,
                    expiryDate: momentService.localTimeToUTC(item.expiryDate, 'endTime'),
                    pixelCode: item.pixelCode
                };

                if (item.id) {
                    $scope.advertiserData.pixels[index].id = item.id;
                }
            });

            return $scope.advertiserData.pixels;
        }

        function createPixelsforAdvertiser(clientId, advId) {
            accountsService
                .createPixelsUnderAdvertiser(clientId, advId, getRequestDataforPixel(clientId, advId))
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        // $scope.fetchAllAdvertisersforClient($scope.client.id);
                        $scope.fetchAllClients();
                        $scope.resetBrandAdvertiserAfterEdit();
                        $scope.close();
                        $rootScope.setErrAlertMessage('Advertiser created successfully', 0);
                    }
                }, function (err) {
                    $scope.close();
                    $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                });
        }

        function constructRequestBody(obj) {
            var respBody = {};

            if ($scope.mode === 'edit' && obj) {
                respBody.name = $scope.advertiserName;
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
            } else {
                respBody.name = $scope.advertiserName;
            }
            return respBody;
        }

        $scope.$on('$locationChangeSuccess', function () {
            $scope.close();
        });

        $scope.selectAdvertiser = function (advertiser) {
            $scope.selectedAdvertiserId = advertiser.id;
            $scope.selectedAdvertiser = advertiser.name;
        };

        if ($scope.isEditMode) {
            $scope.getAdnlData();

            setTimeout(function () {
                $('#advertiser').addClass('disabled');
            },100);
        }

        //Search Hide / Show
        $scope.searchShowInput = function () {
            var searchInputForm = $('.searchInputForm');

            $('.searchInputBtn').hide();
            $('.searchInputBtnInline').show();
            searchInputForm.show();
            searchInputForm.animate({width: '250px'}, 'fast');
        };

        $scope.searchHideInput = function (evt) {
            evt && $(evt.target).hide();
            $('.searchInputForm input').val('');
            $('.searchInputBtn').show();
            $('.searchClearInputBtn, .searchInputBtnInline').hide();
            $('.searchInputForm').animate({width: '34px'}, 'fast');

            setTimeout(function () {
                $('.searchInputForm').hide();
            }, 100);
        };

        $('html').click(function (e) {
            if ($(e.target).closest('.searchInput').length === 0) {
                $scope.searchHideInput();
            }
        });
    });
});
