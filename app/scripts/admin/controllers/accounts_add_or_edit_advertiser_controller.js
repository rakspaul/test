define(['angularAMD', 'custom-date-picker', 'url-service', 'common-utils', 'admin-account-service', 'lrInfiniteScroll'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AccountsAddOrEditAdvertiser', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'adminAccountsService', 'constants', 'momentService',
        'dataService', 'urlService', 'utils', function ($scope, $timeout, $rootScope, $modalInstance, adminAccountsService, constants,
                                                        momentService, dataService, urlService, utils) {
            var _currCtrl = this,
                searchAdvertisersTimer = 0;
            $scope.showInfoMessage = false;
            $scope.loadingBtnFlag = false;

            _currCtrl.downloadPixelIds = [];

            _currCtrl.getIABCategoryList = function () {
                adminAccountsService
                    .getIABCategoryList()
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            $scope.advertiserAddOrEditData.IABCategoryList = res.data.data;
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            };

            _currCtrl.getIABSubCategoryList = function (groupId) {
                adminAccountsService
                    .getIABSubCategoryList(groupId)
                    .then(function (res) {
                        if ((res.status === 'OK' || res.status === 'success') && res.data.data) {
                            $scope.advertiserAddOrEditData.IABSubCategoryList = res.data.data;
                        } else {
                            console.log('Error: To get the sub-category list');
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            };

            _currCtrl.verifyCreateAdvInputs = function () {
                var ret = true,
                    errMsg = 'Error';

                if ($scope.advertiserCodeExist){
                    return false;
                }

                if (!$scope.selectedAdvertiserId || $scope.selectedAdvertiserId === '') {
                    $rootScope.setErrAlertMessage(constants.EMPTY_ADV_SELECTION);
                    return false;
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

            // Validate the Advertiser URL entered
            $scope.validateURL = function(url){
                var re = utils.regExp().validateUrl;

                $scope.urlValidation = '';

                if (!re.test(url)) {
                    $scope.urlValidation = 'Incorrect URL: Please add valid url in the field';
                }
            };

            function createAdvertiserUnderClient(advId) {
                var requestData = {
                    clientId: $scope.client.id,
                    companyUrl: $scope.topCtrlData.companyUrl,
                    lookbackImpressions : 14,
                    lookbackClicks : 14,
                    adChoice: '',
                    iabCategoryId: null
                };

                if (!$scope.isEditMode){
                    requestData.code = $scope.setSelectedAdvertiserCode === 'Others' ?
                        $scope.customAdvertiserCode :
                        $scope.setSelectedAdvertiserCode;
                }

                if ($scope.advertiserAddOrEditData.adChoiceCode) {
                    requestData.adChoice = $scope.advertiserAddOrEditData.adChoiceCode;
                }

                if ($scope.advertiserAddOrEditData.selectedIABSubCategoryId) {
                    requestData.iabCategoryId = Number($scope.advertiserAddOrEditData.selectedIABSubCategoryId);
                } else {
                    if ($scope.advertiserAddOrEditData.selectedIABCategory) {
                        requestData.iabCategoryId = Number($scope.advertiserAddOrEditData.selectedIABCategoryId);
                    }
                }

                adminAccountsService
                    .createAdvertiserUnderClient($scope.client.id, advId, requestData)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.fetchAllAdvertisersforClient($scope.client.id);
                            $scope.resetBrandAdvertiserAfterEdit();
                            $scope.close();

                            if ($scope.topCtrlData.pixels.length) {
                                createPixelsforAdvertiser($scope.clientId, advId);
                            } else {
                                $scope.fetchAllClients();
                            }

                            if ($scope.isEditMode) {
                                $rootScope.setErrAlertMessage('Advertiser updated successfully', 0);
                            } else {
                                $rootScope.setErrAlertMessage('Advertiser added successfully', 0);
                            }
                            $('#infoPopup').remove();
                            $scope.loadingBtnFlag = false;
                        } else {
                            $rootScope.setErrAlertMessage(result.data.data.message);
                        }
                    }, function (err) {
                        $scope.close();
                        console.log('Error = ', err);

                        if ($scope.isEditMode) {
                            $rootScope.setErrAlertMessage('Error in updating advertiser under client.', 0);
                        } else {
                            $rootScope.setErrAlertMessage('Error in creating advertiser under client.', 0);
                        }
                    });
            }

            function getRequestDataforPixel(clientId, advertiserId) {
                _.each($scope.topCtrlData.pixels, function (item, index) {
                    $scope.topCtrlData.pixels[index] = {
                        name: item.name,
                        clientId: clientId,
                        pixelType: item.pixelType,
                        poolSize: 0,
                        description: item.description,
                        createdBy: item.createdBy,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        impLookbackWindow: item.impLookbackWindow,
                        clickLookbackWindow: item.clickLookbackWindow,
                        expiryDate: momentService.localTimeToUTC(item.expiryDate, 'endTime')
                    };

                    if(advertiserId) {
                        $scope.topCtrlData.pixels[index].advertiserId = advertiserId;
                    }

                    if (item.id) {
                        $scope.topCtrlData.pixels[index].id = item.id;
                    }
                });

                return $scope.topCtrlData.pixels;
            }

            function createPixelsforAdvertiser(clientId, advId) {
                adminAccountsService
                    .createPixels(clientId, getRequestDataforPixel(clientId, advId))
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.fetchAllClients();
                            $scope.resetBrandAdvertiserAfterEdit();
                            $scope.close();
                            $rootScope.setErrAlertMessage('Advertiser created successfully', 0);
                        }
                    }, function (err) {
                        $scope.close();
                        console.log('Error = ', err);
                        $rootScope.setErrAlertMessage('Error in creating advertiser under client.');
                    });
            }

            $scope.topCtrlData.disableDownLoadPixel = true;

            $scope.selectedRateType = 'Select';

            $scope.showUserModeText = function () {
                return ($scope.mode === 'create'? 'Add Advertiser' : 'Edit Advertiser ( ' + $scope.advObj.name + ' )');
            };

            $scope.close = function () {
                $scope.resetBrandAdvertiserAfterEdit();
                $modalInstance.dismiss();
                $scope.advertiserAddOrEditData.duplicatePixelName = false;
            };

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

            $scope.saveAdvertisers = function (showPopupFlag) {
                if (!_currCtrl.verifyCreateAdvInputs()) {
                    return;
                }
                if($scope.isEditMode == false && showPopupFlag) {
                    $scope.showInfoMessage = true;
                } else {
                    $scope.loadingBtnFlag = true ;
                    createAdvertiserUnderClient($scope.selectedAdvertiserId);
                }

            };

            $scope.showRespectiveMethod = function (type) {
                $scope.selectedBillType = type;
            };

            $scope.downLoadPixel = function () {
                var url = urlService.downloadAdminAdvPixel($scope.client.id, $scope.selectedAdvertiserId);

                if (!_currCtrl.downloadPixelIds.length) {
                    return false;
                }

                if (_currCtrl.downloadPixelIds.length &&
                    (_currCtrl.downloadPixelIds.length < $scope.topCtrlData.pixels.length)) {
                    if(url.indexOf('?') > -1) {
                        url += '&';
                    } else {
                        url += '?';
                    }
                    url += 'ids=' + _currCtrl.downloadPixelIds.join(',');
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
                    }, function (err) {
                        console.log('Error = ', err);
                        $rootScope.setErrAlertMessage(constants.PIXEL_DOWNLOAD_ERR);
                    });
            };

            $scope.selectPixel = function (pixelId, isSelected) {
                if (isSelected) {
                    $scope.topCtrlData.disableDownLoadPixel = false;

                    if (_currCtrl.downloadPixelIds.indexOf(pixelId) === -1) {
                        _currCtrl.downloadPixelIds.push(pixelId);
                    }
                } else {
                    _currCtrl.downloadPixelIds =
                        _.filter(_currCtrl.downloadPixelIds, function (item) {
                            return item !== pixelId;
                        });

                    if (!_currCtrl.downloadPixelIds.length) {
                        $scope.topCtrlData.disableDownLoadPixel = true;
                    }
                }
            };

            $scope.selectAllPixels = function () {
                var checkBoxes = $('.pixelSelect');

                checkBoxes.prop('checked', !checkBoxes.prop('checked'));

                if (checkBoxes.prop('checked')) {
                    $scope.topCtrlData.disableDownLoadPixel = false;
                    _currCtrl.downloadPixelIds = _.pluck($scope.topCtrlData.pixels, 'id');
                } else {
                    $scope.topCtrlData.disableDownLoadPixel = true;
                    _currCtrl.downloadPixelIds = [];
                }
            };

            $scope.checkDuplicatePixel = function (name) {
                $scope.advertiserAddOrEditData.duplicatePixelName = false;

                _.each($scope.topCtrlData.pixels, function (item, i) {
                    if (!$scope.advertiserAddOrEditData.duplicatePixelName) {
                        $scope.advertiserAddOrEditData.duplicatePixelName =
                            ((item.name === name) && ($scope.pixelIndex !== i)) ? true : false;
                    }
                });
            };

            $scope.leaveFocusCustomAdvertiserCode = function(){
                adminAccountsService
                    .checkAdvertiserCodeExist($scope.customAdvertiserCode)
                    .then(function(result){
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.advertiserCodeExist = result.data.data.isExists;
                        }
                    }, function (err) {
                        console.log('Error = ', err);
                    });
            };

            $scope.selectAdvertiser = function (advertiser) {
                $scope.selectedAdvertiserId = advertiser.id;
                $scope.selectedAdvertiser = advertiser.name;
                $scope.setSelectedAdvertiserCode = advertiser.code;
            };

            $scope.selectAdvertiserCode = function(ev, code){
                $scope.setSelectedAdvertiserCode = code;
            };

            // NEW Advertisers Dropdown
            $scope.showAdvertisersDropDown = function (event) {
                var advertiserSelected = $('#advertiserSelected'),
                    iconArrowSolidDown = $('.icon-arrow-solid-down'),
                    adminAdvertisersDropdownList = $('.admin-advertisers-dropdown-menu');

                event && event.stopPropagation();

                advertiserSelected.css('display', 'none');
                iconArrowSolidDown.css('display', 'none');
                adminAdvertisersDropdownList.css('display', 'block');
                $('#advertisersSearchBox').focus();
            };

            $scope.hideAdvertisersDropDown = function () {
                var advertiserSelected = $('#advertiserSelected'),
                    iconArrowSolidDown = $('.icon-arrow-solid-down'),
                    adminAdvertisersDropdownList = $('.admin-advertisers-dropdown-menu');

                adminAdvertisersDropdownList.css('display', '');
                advertiserSelected.css('display', 'block');
                iconArrowSolidDown.css('display', 'block');
            };

            $scope.searchAdvertisers = function () {
                if (searchAdvertisersTimer) {
                    clearTimeout(searchAdvertisersTimer);
                }

                searchAdvertisersTimer = setTimeout(function () {
                    $scope.$parent.advertisersLoading = true;
                    $scope.$parent.advertisersPageNo = 0;
                    $scope.$parent.advertisersData = [];
                    $scope.fetchAllAdvertisers($scope.clientId, $scope.advertisersQuery, $scope.$parent.advertisersPageSize, $scope.$parent.advertisersPageNo);
                }, 400);
            };

            $scope.selectAdvertiserAndClose = function (advertiser) {
                $scope.selectAdvertiser(advertiser);
                $scope.hideAdvertisersDropDown();
            };

            $scope.loadMoreAdvertisers = function () {
                if (!$scope.$parent.noMoreAdvertisersToLoad) {
                    $scope.fetchAllAdvertisers($scope.clientId, $scope.advertisersQuery, $scope.$parent.advertisersPageSize, $scope.$parent.advertisersPageNo);
                }
            };

            $(document).click(function (event) {
                if (event.target.id === 'adminAdvertisersDropDownList' || event.target.id === 'advertisersSearchBox') {
                    return;
                }

                $scope.hideAdvertisersDropDown();
            });
            // END NEW Advertisers Dropdown

            $('.miniTabLinks.sub .btn').removeClass('active');
            $('.miniTabLinks.sub .subBasics').addClass('active');

            $modalInstance
                .opened
                .then(function () {
                    $('popup-msg').appendTo(document.body);
                    $timeout(function() {
                        $('#pixelExpDate').datepicker('setEndDate', momentService.addDays('YYYY-MM-DD', 364));
                        $('#infoPopup').appendTo(document.body);
                    }, 5000);

                });

            _currCtrl.getIABCategoryList();

            if ($scope.isEditMode) {
                // Prefill saved data for editing
                $scope.selectedAdvertiserId = $scope.savedAdvertiserData.advertiserId;

                // 1. Ad Choice
                $scope.advertiserAddOrEditData.adChoiceCode = $scope.savedAdvertiserData.adChoice;

                // 2. IAB Category
                if ($scope.savedAdvertiserData.iabCategory) {
                    $scope.advertiserAddOrEditData.selectedIABCategory = $scope.savedAdvertiserData.iabCategory.groupName;
                    $scope.advertiserAddOrEditData.selectedIABCategory = $scope.savedAdvertiserData.iabCategory.groupName;
                    $scope.advertiserAddOrEditData.selectedIABCategoryId = $scope.savedAdvertiserData.iabCategory.groupId;

                    // If sub-category has been selected & saved
                    if ($scope.savedAdvertiserData.iabCategory.groupName !== $scope.savedAdvertiserData.iabCategory.name) {
                        $scope.advertiserAddOrEditData.selectedIABSubCategory = $scope.savedAdvertiserData.iabCategory.name;
                        $scope.advertiserAddOrEditData.selectedIABSubCategoryId = $scope.savedAdvertiserData.iabCategory.id;
                    } else {
                        $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
                        $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
                    }

                    _currCtrl.getIABSubCategoryList($scope.advertiserAddOrEditData.selectedIABCategoryId);
                } else {
                    $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
                    $scope.advertiserAddOrEditData.selectedIABCategoryId = null;
                    $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
                    $scope.advertiserAddOrEditData.selectedIABSubCategoryId = null;
                }

                setTimeout(function () {
                    $('#advertiser, .setSelectedAdvertiserCode').addClass('disabled');
                }, 100);
            } else {
                // Create mode
                $scope.advertiserAddOrEditData.selectedIABCategory = 'Select';
                $scope.advertiserAddOrEditData.selectedIABSubCategory = 'Select';
            }

            $scope.$on('$locationChangeSuccess', function () {
            $scope.close();
        });
    }]);
});
