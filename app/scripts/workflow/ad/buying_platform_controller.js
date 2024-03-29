define(['angularAMD', 'platform-custom-module', 'direct-Inventory-controller'], function (angularAMD) {
    'use strict';

    angularAMD.controller('BuyingPlatformController', ['$scope', '$timeout', '$modal', '$filter', '$rootScope',
        'constants', 'workflowService', 'vistoconfig', 'platformCustomeModule',

        function ($scope, $timeout, $modal, $filter, $rootScope, constants, workflowService, vistoconfig, platformCustomeModule) {
        var tempPlatform,
            storedResponse,
            oldPlatformName,

            _buyingPlatform = {
                trackingPlatformCarouselData: function (responseData) {
                    var tempData = responseData.trackingPlatforms,
                        slides = Math.ceil((responseData.trackingPlatforms.length) / 3),
                        i;

                    $scope.workflowData.tracking_integrations = {};

                    for (i = 0; i < slides; i++) {
                        $scope.workflowData.tracking_integrations[i] = tempData.splice(0, 3);
                    }
                },

                platformWrapper: function (platform) {
                    var selectedSeats,
                        selectedSeat,

                        selectedPlatformIndex =
                            _.findIndex($scope.workflowData.platforms, function (item) {
                                return item.id === platform.id;
                            });

                    if (selectedPlatformIndex !== -1) {
                        selectedSeat = _.findIndex($scope.workflowData.platforms[selectedPlatformIndex].seats, function (item) {
                            return item.id === platform.vendorSeatId;
                        });

                        selectedSeats = $scope.workflowData.platforms[selectedPlatformIndex].seats[selectedSeat];
                    }

                    if (selectedSeats && platform) {
                        $scope.adData.platfromSeatId = platform.vendorSeatId;
                    } else {
                        $scope.adData.platfromSeatId = null;
                    }

                    $scope.selectPlatform(null, platform, selectedSeats);
                },

                fetchPlatforms: function (clientId, advertiserId, platform) {
                    var brandId = $scope.workflowData.campaignData.brandId || -1;

                    workflowService
                        .getPlatforms(clientId, advertiserId, brandId, {cache: false})
                        .then(function (result) {
                            var responseData,
                                adsDetails,
                                platformStatus,
                                i;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;

                                // wrapper to transform new API response to old one
                                responseData = workflowService.platformResponseModifier(responseData);
                                adsDetails = workflowService.getAdsDetails();

                                if ($scope.mode === 'edit' && platform) {
                                    platformStatus = !$scope.isAdsPushed;

                                    if ($scope.isAdsPushed) {
                                        if ($scope.TrackingIntegrationsSelected) {
                                            for (i in responseData.fullIntegrationsPlatforms) {
                                                responseData.fullIntegrationsPlatforms[i].active = false;
                                            }

                                            $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;

                                            for (i in responseData.trackingPlatforms) {
                                                responseData.trackingPlatforms[i].active = platformStatus;
                                            }

                                            _buyingPlatform.trackingPlatformCarouselData(responseData);
                                        } else {
                                            for (i in responseData.fullIntegrationsPlatforms) {
                                                if (adsDetails.platform.id === responseData.fullIntegrationsPlatforms[i].id) {
                                                    responseData.fullIntegrationsPlatforms[i].active = true;
                                                } else {
                                                    responseData.fullIntegrationsPlatforms[i].active = responseData.fullIntegrationsPlatforms[i].active ? platformStatus : false;
                                                }
                                            }

                                            $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;

                                            for (i in responseData.trackingPlatforms) {
                                                responseData.trackingPlatforms[i].active = false;
                                            }

                                            _buyingPlatform.trackingPlatformCarouselData(responseData);
                                        }
                                    } else {
                                        $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                        _buyingPlatform.trackingPlatformCarouselData(responseData);
                                    }

                                    _buyingPlatform.platformWrapper(platform);
                                } else {
                                    $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                    _buyingPlatform.trackingPlatformCarouselData(responseData);
                                }
                            } else {
                                _buyingPlatform.errorHandler(result);
                            }
                        }, _buyingPlatform.errorHandler);
                },

                // select a platform one of the seat of the platform
                _selectPlatform: function (event, platform, seat) {
                    var settings = '';

                    // showing card view when you change the platform.
                    _buyingPlatform.hideTargetingBox();

                    // Stop propagation to parent element
                    event && event.stopImmediatePropagation();

                    storedResponse = workflowService.getAdsDetails();

                    if ($scope.mode === 'edit') {
                        if (storedResponse.targets.geoTargets) {
                            settings = 'Geography';
                        }

                        if (seat && storedResponse.platform) {
                            if (storedResponse.platform.id === seat.platform_id) {
                                // directly set  the platform if it is the same
                                _buyingPlatform.setPlatform(event, platform, seat);
                            } else {
                                // if the platform is changed but no targets were selected allow change
                                if (_.size(storedResponse.targets.geoTargets) === 0) {
                                    _buyingPlatform.setPlatform(event, platform, seat);
                                } else {
                                    // display warning popup
                                    if ($scope.defaultPlatform.id !== platform.id ||
                                        $scope.defaultPlatform.vendorSeatId !== seat.id) {
                                        tempPlatform = platform;

                                        $scope.changePlatformMessage = 'Your entries for the following settings are not compatible with ' +
                                            $filter('toPascalCase')(platform.name) + ': ' +
                                            settings + '. Would you like to clear these settings and switch platforms?';

                                        $scope.changePlatformPopup = true;
                                    } else {
                                        _buyingPlatform.setPlatform(event, platform, seat);
                                    }
                                }
                            }
                        } else {
                            _buyingPlatform.setPlatform(event, platform, seat);
                        }
                    } else {
                        _buyingPlatform.setPlatform(event, platform, seat);
                    }

                    $rootScope.$broadcast('targettingCapability', platform);
                },

                resetCreatives:function () {
                    $scope.adData.setSizes = constants.WF_NOT_SET;
                    $scope.creativeData.creativeInfo = 'undefined';
                    $scope.$parent.selectedArr.length = 0;
                },

                setPlatform: function (event, platform, seat) {
                    $scope.selectedPlatform = {};
                    $scope.selectedSeat = {};

                    // reset the targeting and platform while changing the platform
                    if (event && !$scope.changePlatformPopup) {
                        if ($scope.adData && platform.id !== $scope.adData.platformId) {
                            $rootScope.$broadcast('resetTargeting');
                            _buyingPlatform.resetCreatives();

                            // reseting the custom field values on change of platform.
                            $scope.$parent.postPlatformDataObj = null;

                            localStorage.removeItem('adPlatformCustomInputs');
                        }
                    }

                    workflowService.setPlatform(platform);
                    workflowService.setVendorExecutionType(platform.executionVendorType);

                    if (seat) {
                        workflowService.setPlatformSeat(seat);
                        $scope.$parent.TrackingIntegrationsSelected = false;
                        $scope.adData.platformName = seat.name;
                        $scope.adData.platformSeatId = seat.id;
                        $scope.selectedPlatform[seat.id + '_' + platform.id] = seat.name;
                        $scope.selectedSeat[seat.id] = seat.name;
                    } else {
                        $scope.adData.platformName = platform.name;
                        $scope.selectedPlatform[platform.id] = platform.name;
                    }

                    $scope.adData.platform = platform.displayName;
                    $scope.adData.platformId = platform.id;
                    event && $scope.platformCustomInputs();
                },

                errorHandler: function (errData) {
                    console.log(errData);
                },

                hideCustomPlatformBox: function () {
                    $('.platform-custom')
                        .delay(300)
                        .animate({
                            left: '100%',
                            marginLeft: '0px'
                        }, function () {
                            $(this).hide();
                            $scope.showPlatformBox = false;
                        });

                    $('.offeringsWrap').show();
                    $('.saveContinueBtn').show();
                },

                hideTargetingBox: function () {
                    $('#geographyTargeting')
                        .delay(300).animate({left: '100%', marginLeft: '0', opacity: '0'}, function () {
                            $(this).hide();
                        }
                    );

                    $('#dayTargeting')
                        .delay(300).animate({left: '100%', marginLeft: '0px', opacity: '0.0'}, function () {
                            $(this).hide();
                        }
                    );

                    $('#audienceTargeting')
                        .delay(300)
                        .animate({left: '100%', marginLeft: '0', opacity: '0.0'}, function () {
                            $(this).hide();
                        });

                    $('#sellerTargeting')
                    .delay(300)
                        .animate({left: '100%', marginLeft: '0', opacity: '0.0'}, function () {
                            $(this).hide();
                         });
                },

                showCustomFieldBox: function () {
                    var heightBuying = $('#buying').height();

                    $('.platform-custom')
                        .show()
                        .delay(300)
                        .height(heightBuying + 5)
                        .animate({
                            left: '50%',
                            marginLeft: '-323px'
                        }, 'slow');

                    $('.offeringsWrap').hide();
                    $('.saveContinueBtn').hide();


                    $('html, body').animate({
                        scrollTop: 0
                    }, 300);
                }
            },

            getplatformCustomNameSpace =  function(customPlatformData) {
                var ids = _.pluck(customPlatformData, 'platformCustomInputId'),
                    value,
                    customInpChildrenData;

                _.each($scope.adData.customInpNameSpaceList, function(customInpNameSpaceList) {
                    _.each(customInpNameSpaceList.platformCustomInputGroupList, function(platformCustomInputGroupList) {

                        var inputObj = _.filter(platformCustomInputGroupList.platformCustomInputList, function(obj) {
                            return _.indexOf(ids, obj.id) !== -1;
                        });

                        if (!value && inputObj.length > 0) {
                            value =  customInpNameSpaceList.name;
                        }
                    });
                });

                if(!value) {
                    customInpChildrenData = _.filter($scope.adData.customInpNameSpaceList, function(obj) {
                        return !((obj.displayName === 'Deal' || obj.displayName === 'Direct')  &&
                            $scope.adData.budgetType.toLowerCase() === 'cost') &&
                            obj.hasChildren;
                    });
                    if(customInpChildrenData && customInpChildrenData.length > 0) {
                        value = customInpChildrenData[0].name;
                    }
                }

                return value;
            };

        $scope.adData.customPlatformLoader = false;

        $scope.selectPlatform = function (event, platform, seat) {
            $scope.defaultPlatform = platform;

            // reseting the direct inevntory data while changing the data;
            $scope.adData.resetInventroy();

            _buyingPlatform._selectPlatform(event, platform, seat);
        };

       var _selectTrackingIntegrations = function(trackingIntegration) {

           trackingIntegration = $scope.trackingIntegration || trackingIntegration;

           $scope.$parent.TrackingIntegrationsSelected = true;
           $scope.selectedPlatform = {};
           $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.displayName;

           // To populate the newly selected Platform in sideBar
           $scope.adData.platform = trackingIntegration.displayName;
           $scope.adData.platformId = trackingIntegration.id;
           $scope.adData.platformName = trackingIntegration.name;
           workflowService.setVendorExecutionType(trackingIntegration.executionVendorType);

       };

        $scope.selectTrackingIntegrations = function (trackingIntegration) {
            $('.buying-platform-popup').hide();
            $scope.$parent.postPlatformDataObj = [];
            _selectTrackingIntegrations(trackingIntegration);
        };

        $scope.platformCustomInputs = function (trackingIntegration,  callback) {
            var platformWrap = $('.platWrap'),
                tabName = 'buying_strategy',
                clientId = vistoconfig.getSelectedAccountId();

            platformWrap.html('');
            $scope.adData.customInpNameSpaceList = [];
            $scope.adData.customPlatformLoader = true;

            if(!trackingIntegration) {

                _buyingPlatform.showCustomFieldBox();

            }

            $('.eachBuyingSection.staticMarkup').hide();

            workflowService
                .getPlatformCustomInputs(clientId, $scope.adData.platformId)
                .then(function (result) {
                    var platformCustomeJson,
                        adPlatformCustomInputsLocalStorageValue;

                    if (result.status === 'OK' || result.status === 'success') {

                        $scope.adData.customPlatformLoader = false;

                        // invoke wrapper
                        result.data.data = workflowService.platformCreateObj(result.data.data);

                        if (result.data.data.customInputJson !== '') {
                            platformCustomeJson = JSON.parse(result.data.data.customInputJson);

                            if (platformCustomeJson && platformCustomeJson.uiTabLayout === 'TRUE') {
                                $scope.adData.customInpNameSpaceList = _.sortBy(platformCustomeJson.platformCustomInputNamespaceList, 'displayOrder');

                                _.each($scope.adData.customInpNameSpaceList, function (obj, idx) {
                                    obj.hasChildren = obj.platformCustomInputGroupList && obj.platformCustomInputGroupList.length > 0 ? true : false;
                                    obj.className = idx === 0 ? 'active' : '';
                                });
                            }

                            if ($scope.mode === 'edit') {
                                adPlatformCustomInputsLocalStorageValue = localStorage.getItem('adPlatformCustomInputs');

                                $scope.$parent.postPlatformDataObj = (adPlatformCustomInputsLocalStorageValue &&
                                    JSON.parse(adPlatformCustomInputsLocalStorageValue)) || platformCustomeJson;
                            }

                            if ($scope.$parent.postPlatformDataObj) {
                                tabName = getplatformCustomNameSpace($scope.$parent.postPlatformDataObj);
                                platformCustomeModule.init(platformCustomeJson, platformWrap, $scope.$parent.postPlatformDataObj);

                            } else {
                                if (oldPlatformName !== $scope.adData.platform) {
                                    // maintain state of building platform strategy when user selects it
                                    // navigates to other places
                                    oldPlatformName = workflowService.getPlatform() && workflowService.getPlatform().displayName;
                                    platformCustomeModule.init(platformCustomeJson, platformWrap);
                                } else if (!$scope.$parent.postPlatformDataObj ||
                                    $scope.$parent.postPlatformDataObj.length === 0) {
                                    platformCustomeModule.init(platformCustomeJson, platformWrap);
                                }
                                tabName = getplatformCustomNameSpace($scope.adData.customInpNameSpaceList);
                            }

                            if (tabName) {
                                $timeout(function () {
                                    if($('#' + tabName).attr('disabled') !== 'disabled') { //Abhimanyu TODO
                                        $('#' + tabName).trigger('click');
                                    }
                                }, 500);
                            }
                        }

                        if(trackingIntegration) {
                            if(result.data.data.customInputJson)  {
                                _buyingPlatform.showCustomFieldBox();
                            }
                            callback && callback(result.data.data.customInputJson);
                        }


                    }
                });
        };

        $scope.cancelChangePlatform = function () {
            $scope.changePlatformPopup = !$scope.changePlatformPopup;
            tempPlatform = [];
        };

        $scope.confirmChange = function () {
            $scope.changePlatformPopup = false;
            $scope.$parent.postPlatformDataObj = null;
            localStorage.removeItem('adPlatformCustomInputs');
            _buyingPlatform.setPlatform(null, tempPlatform, tempPlatform.seats[0]);
            storedResponse.targets.geoTargets = {};
            $rootScope.$broadcast('resetTargeting');
            $scope.platformCustomInputs();
        };

        $scope.showTrackingSetupInfoPopUp = function (event, trackingIntegration) {

            var currentTarget = $(event.currentTarget);
            $scope.adData.platform = trackingIntegration.displayName;
            $scope.adData.platformId = trackingIntegration.id;
            $scope.adData.platformName = trackingIntegration.name;
            $scope.$parent.TrackingIntegrationsSelected = true;
            $scope.selectedPlatform ={};

            $scope.platformCustomInputs(trackingIntegration, function(data) {

                if(!data) {
                    var relativeX = currentTarget
                            .closest('.offeringWrap')
                            .offset().left - currentTarget
                            .closest('.carousel-inner')
                            .offset()
                            .left + 50;

                    $scope.trackingIntegration = trackingIntegration;

                    setTimeout(function () {
                        $('.buyingPlatformHolder .popUpCue').css({
                            top: '-10px',
                            left: relativeX + 'px'
                        });
                    }, 5);
                    $('.buying-platform-popup').show();
                }

                $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.displayName;
                workflowService.setVendorExecutionType(trackingIntegration.executionVendorType);
            });
        };

        $scope.hideTrackingSetupInfoPopUp = function () {
            $('.buying-platform-popup').hide();

        };

        $scope.$parent.switchPlatform = function (event) {
            // clicked on back to platform link
            if (event) {
                $scope.adData.resetInventroy();
            }

            $scope.resetPartialSaveAlertMessage();
            $scope.$broadcast('switchPlatformFunc');
        };

        $scope.$parent.showRespectiveSection = function (event, type) {
            var elem = $(event.target),
                platformName,
                customInpArr;

            elem.closest('.btn-group').find('.active').removeClass('active');
            elem.closest('.btn').addClass('active');

            $('.eachBuyingSection').hide();

            $('.' + type + '_div').show();

            platformName = $scope.adData.platform.toLowerCase();
            if(platformName) {
                platformName = platformName.replace(/\./g, '_').replace(/\s/g, '_');
            }
            customInpArr = ['buying_strategy_div' , platformName +'_deal_div', platformName + '_direct_div'];

            _.each(customInpArr, function(id) {
                    if (id === (type + '_div')) {
                        $('.'+id).find('input, select').removeAttr('disabled');
                    } else {
                        $('.'+id).find('input, select').attr('disabled', 'disabled');
                    }
                });

            $scope.inventoryTabSelected = type;
            if (type === (platformName +'_direct')) {
                $rootScope.$broadcast('directInvenotry', $scope.adData);
            }
        };

        $scope.$parent.saveCustomeFieldForPlatform = function (flag) {
            var customFieldErrorElem = $('.customFieldErrorMsg'),
                customPlatformFormData = $('#customPlatformForm').serializeArray(),
                selectedPlacementsData,
                selectedPlacementIds,
                platformName = $scope.adData.platform.toLowerCase();

            $scope.$parent.postPlatformDataObj = [];

            if (customFieldErrorElem.length === 0 && customPlatformFormData.length > 0) {
                _.each(customPlatformFormData, function (data) {
                    var d = data.name.split('$$');

                    if (d[0] === 'placements' || d[0] === 'placements_display') {
                        if ($scope.inventoryTabSelected && $scope.inventoryTabSelected === platformName + '_direct') {
                            selectedPlacementsData = $scope.adData.directInvenotryData.placements.selected;
                            selectedPlacementIds = _.pluck(selectedPlacementsData, 'sourceId');

                            if (d[0] === 'placements') {
                                $scope.$parent.postPlatformDataObj.push({
                                    platformCustomInputId: Number(d[1]),
                                    value: selectedPlacementIds.join(',')
                                });
                            }

                            if (d[0] === 'placements_display') {
                                $scope.$parent.postPlatformDataObj.push({
                                    platformCustomInputId: Number(d[1]),
                                    value: JSON.stringify(selectedPlacementsData)
                                });
                            }
                        }
                    } else {
                        if (d.length >1 && $.trim(data.value) !== '') {
                            $scope.$parent.postPlatformDataObj.push({
                                platformCustomInputId: Number(d[1]),
                                value: data.value
                            });
                        }
                    }
                });
            } else {
                if ($scope.workflowData.adsData && $scope.workflowData.adsData.adPlatformCustomInputs && $scope.workflowData.adsData.adPlatformCustomInputs.length > 0) {
                    $scope.$parent.postPlatformDataObj = $scope.workflowData.adsData.adPlatformCustomInputs;
                }
            }

            if ($scope.mode === 'edit') {
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify($scope.$parent.postPlatformDataObj));
            }

            if ($scope.inventoryTabSelected !== platformName + '_direct') {
                $scope.adData.clearAllSelectedPlacements();
            }

            $scope.switchPlatform();

            if (!flag && customFieldErrorElem.length === 0) {
                $scope.triggerTargetting();
            }
        };

        $('.buying-platform-popup').hide();

        $scope.trackingIntegrationId = '';

        $scope.$watch('adData.platformId', function (newValue) {
            $scope.$parent.changePlatform(newValue);
        });

        $scope.$on('updatePlatform', function (event, platform) {
            var clientId = vistoconfig.getSelectedAccountId(),
                advertiserId = vistoconfig.getSelectAdvertiserId();

            _buyingPlatform.fetchPlatforms(clientId, advertiserId, platform);
        });

        $scope.$on('switchPlatformFunc', function (obj, tab) {

            var clientId = vistoconfig.getSelectedAccountId(),
                advertiserId = vistoconfig.getSelectAdvertiserId();

            if ($scope.mode === 'create') {
                _buyingPlatform.fetchPlatforms(clientId, advertiserId);
            }

            var customFieldErrorElem = $('.customFieldErrorMsg'),
                $modalInstance,
                platformId;

            if (customFieldErrorElem.length > 0) {
                $modalInstance = $modal.open({
                    templateUrl: assets.html_confirmation_modal,
                    controller: 'ConfirmationModalController',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return 'Custom Field';
                        },

                        mainMsg: function () {
                            return 'Address the validation errors or clear the values to proceed';
                        },

                        buttonName: function () {
                            return 'Reset';
                        },

                        execute: function () {
                            return function () {
                                var customPlatformForm = $('#customPlatformForm');

                                $('.customFieldErrorMsg').remove();

                                if (customPlatformForm && customPlatformForm.length > 0) {
                                    customPlatformForm[0].reset();
                                    $timeout(function () {
                                        customPlatformForm.find('select').trigger('change');
                                    }, 200);
                                }

                                _buyingPlatform.hideCustomPlatformBox();
                            };
                        }
                    }
                });

                return false;
            }

            if (!$scope.TrackingIntegrationsSelected && $scope.adData.platform !== undefined && (tab !== undefined && tab[0] === '#buying')) {
                platformId =  $('input[name=platformId]').val();
                $('#platformId_' + platformId).trigger('click');
            } else {
                _buyingPlatform.hideCustomPlatformBox();
            }
        });

        $scope.navigateToCreative = function () {
            $timeout(function () {
                $('#creative-tab').find('a[data-target="#creative"]').click();
            }, 100);
        };
    }]);
});
