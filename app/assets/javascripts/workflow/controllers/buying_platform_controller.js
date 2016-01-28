var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('BuyingPlatformController', function ($scope, $window, $routeParams, constants, workflowService, 
        $timeout, utils, $location, $modal, $filter, platformCustomeModule, $rootScope) {
        var tempPlatform,
            storedResponse,
            oldPlatformName,
            hideCustomPlatfromBox = function () {
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
            };

        $scope.fetchPlatforms =  function (platform) {
            var errorHandler =  function (errData) {
                console.log(errData);
            }

            workflowService
                .getPlatforms({cache: false})
                .then(function (result) {
                    var responseData,
                        adsDetails,
                        platformStatus,
                        i;

                    if (result.status === 'OK' || result.status === 'success') {
                        responseData = result.data.data;
                        adsDetails = workflowService.getAdsDetails();
                        if ($scope.mode == 'edit' && platform) {
                            platformStatus = !$scope.isAdsPushed;
                            if ($scope.TrackingIntegrationsSelected) {
                                for (i in responseData.fullIntegrationsPlatforms) {
                                    responseData.fullIntegrationsPlatforms[i].active = false;
                                }
                                $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                for (i in responseData.trackingPlatforms) {
                                    responseData.trackingPlatforms[i].active = platformStatus;
                                }
                                $scope.trackingPlatformCarouselData(responseData);
                            } else {
                                for (i in responseData.fullIntegrationsPlatforms) {
                                    if (adsDetails.platform.id == responseData.fullIntegrationsPlatforms[i].id) {
                                        responseData.fullIntegrationsPlatforms[i].active = true;
                                    } else {
                                        responseData.fullIntegrationsPlatforms[i].active = 
                                            responseData.fullIntegrationsPlatforms[i].active ? platformStatus : false;
                                    }
                                }
                                $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                for (i in responseData.trackingPlatforms) {
                                    responseData.trackingPlatforms[i].active = false;
                                }
                                $scope.trackingPlatformCarouselData(responseData);
                            }
                        } else {
                            $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                            $scope.trackingPlatformCarouselData(responseData);
                        }
                    } else {
                        errorHandler(result);
                    }
                }, errorHandler);
        };

        $scope.trackingPlatformCarouselData = function (responseData) {
            var tempData = responseData.trackingPlatforms,
                slides = Math.ceil((responseData.trackingPlatforms.length) / 3),
                i;

            $scope.workflowData['tracking_integrations'] = {};
            for (i = 0; i < slides; i++) {
                $scope.workflowData['tracking_integrations'][i] = tempData.splice(0, 3);
            }
        };

        $scope.selectPlatform = function (event, platform) {
    console.log('selectPlatform(): platform = ', platform);
    console.log('$scope.selectedArr = ', $scope.selectedArr);
            var settings = '';

            storedResponse = workflowService.getAdsDetails();
console.log('storedResponse = ', storedResponse);
console.log('$scope.$parent.TrackingIntegrationsSelected = ', $scope.$parent.TrackingIntegrationsSelected);
console.log('$scope.adData = ', $scope.adData);
$scope.adData.setSizes = constants.WF_NOT_SET;
console.log('$scope.adData = ', $scope.adData);
//console.log('creativeData.creativeInfo.creatives = ', $scope.creativeData.creativeInfo.creatives);
//$scope.creativeData.creativeInfo.creatives = [];
console.log('typeof $scope.creativeData.creativeInfo.creatives = ', typeof $scope.creativeData.creativeInfo);
if (typeof $scope.creativeData.creativeInfo !== 'undefined') {
    $scope.creativeData.creativeInfo.creatives = [];
    $scope.selectedArr = [];
    $scope.selectedArr.length = 0;
}
            if ($scope.mode === 'edit') {
                if (storedResponse.targets.geoTargets) {
                    settings = 'Geography';
                }
                if (storedResponse.platform) {
                    if (storedResponse.platform.name === platform.name) {
                        //directly set  the platform if it is the same
                        $scope.setPlatform(event, platform);
                    } else {
                        //if the platform is changed but no targets were selected allow change
                        if (_.size(storedResponse.targets.geoTargets) == 0) {
                            $scope.setPlatform(event, platform);
                        } else {
                            //display warning popup
                            if ($scope.defaultPlatform.id !== platform.id) {
                                tempPlatform = platform;
                                $scope.changePlatformMessage = 
                                    'Your entries for the following settings are not compatible with ' + 
                                    $filter('toPascalCase')(platform.name) + 
                                    ': ' + 
                                    settings + 
                                    '. Would you like to clear these settings and switch platforms? (OK/Cancel).';
                                $scope.changePlatformPopup = true;
                            } else {
                                $scope.setPlatform(event, platform);
                            }
                        }
                    }
                } else {
                    $scope.setPlatform(event, platform);
                }
            } else {
                $scope.setPlatform(event, platform);
            }
        };

        $scope.setPlatform = function (event, platform) {
            var name;

            $scope.selectedPlatform = {};
            workflowService.setPlatform(platform);
            //audience targetting
            $rootScope.$emit('triggerAudienceLoading');
            if ($scope.mode != 'edit') {
                $scope.$parent.TrackingIntegrationsSelected = false;
            }
            name = platform.displayName ? platform.displayName : platform.name;
            $scope.adData.platform = name;
            $scope.adData.platformId = platform.id;
            $scope.adData.platformName = platform.name;
            $scope.selectedPlatform[platform.id] = name;
            event && $scope.platformCustomInputs();
        };

        $scope.selectTrackingIntegrations = function (trackingIntegration) {
    console.log('selectTrackingIntegrations');
            $scope.showtrackingSetupInfoPopUp = false;
            $scope.$parent.postPlatformDataObj = [];
            $scope.platformCustomInputs();
            trackingIntegration =  $scope.trackingIntegration || trackingIntegration;
            if ($scope.mode != 'edit') {
                $scope.$parent.TrackingIntegrationsSelected = true;
            }
            $scope.selectedPlatform = {};
            $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.displayName;
            // To populate the newly selected Platform in sideBar
            $scope.adData.platform = trackingIntegration.displayName;
            $scope.adData.platformId = trackingIntegration.id;
            $scope.adData.platformName = trackingIntegration.name;
    console.log('$scope.selectedPlatform = ', $scope.selectedPlatform);
    console.log('$scope.adData = ', $scope.adData);
    console.log('$scope.$parent.TrackingIntegrationsSelected = ', $scope.$parent.TrackingIntegrationsSelected);

            // code to make creatives already set to empty
            $scope.adData.setSizes = constants.WF_NOT_SET;
            $scope.creativeData.creativeInfo = 'undefined';
            $scope.selectedArr.length = 0;
        };

        $scope.showCustomeFieldBox = function () {
            $('.platform-custom')
                .show()
                .delay(300)
                .animate({
                    left: '50%', 
                    marginLeft: '-323px'
                }, 'slow');
            $('.offeringsWrap').hide();
        };

        $scope.platformCustomInputs = function () {
            var platformWrap = $('.platWrap');

            workflowService
                .getPlatformCustomInputs($scope.adData.platformId)
                .then(function (result) {
                    var adPlatformCustomInputs, 
                        platformCustomeJson,
                        adPlatformCustomInputsLocalStorageValue;

                    if (result.status === 'OK' || result.status === 'success') {
                        if (result.data.data.customInputJson != '') {
                            platformCustomeJson = JSON.parse(result.data.data.customInputJson);
                            if ($scope.mode === 'edit') {
                                $scope.showCustomeFieldBox();
                                adPlatformCustomInputsLocalStorageValue = localStorage.getItem('adPlatformCustomInputs');
                                adPlatformCustomInputs = 
                                    (adPlatformCustomInputsLocalStorageValue && JSON.parse(adPlatformCustomInputsLocalStorageValue)) || 
                                    platformCustomeJson;
                                platformCustomeModule.init(platformCustomeJson, platformWrap, adPlatformCustomInputs);
                            } else {
                                $scope.showCustomeFieldBox();
                                //maintain state of building platform strategy when user selects it navigtes to other places
                                if (oldPlatformName !== $scope.adData.platform) {
                                    oldPlatformName = workflowService.getPlatform().displayName;
                                    platformCustomeModule.init(platformCustomeJson, platformWrap);
                                } else if (!$scope.$parent.postPlatformDataObj) {
                                    platformCustomeModule.init(platformCustomeJson, platformWrap);
                                }
                            }
                        }
                    }
                });
        };

        $scope.cancelChangePlatform = function () {
            $scope.changePlatformPopup = !$scope.changePlatformPopup;
            tempPlatform = [];
        }

        $scope.confirmChange = function () {
            $scope.setPlatform(null, tempPlatform);
            $scope.changePlatformPopup = false;
            storedResponse.targets.geoTargets = {};
            $scope.$broadcast('resetGeoTags');
            $scope.platformCustomInputs();
        };

        $scope.showTrackingSetupInfoPopUp = function (event, trackingIntegration) {
            var offset = $(event.target).offset(),
                left = offset.left,
                top = offset.top,
                relativeX = $(event.target).closest('.offeringWrap').offset().left  -  
                    $(event.target).closest('.carousel-inner').offset().left + 50;

            $scope.trackingIntegration = trackingIntegration;
            $('.buyingPlatformHolder .popUpCue').css({
                top: 125 , 
                left: relativeX
            });
            $scope.showtrackingSetupInfoPopUp = true;
        };

        $scope.hideTrackingSetupInfoPopUp = function () {
            $scope.showtrackingSetupInfoPopUp = false;
        }

        $scope.$parent.switchPlatform = function (event) {
            $scope.resetPartialSaveAlertMessage();
            $scope.$broadcast('switchPlatformFunc');
        };

        $scope.$parent.saveCustomeFieldForPlatform = function (editModeFlag) {
            var customFieldErrorElem = $('.customFieldErrorMsg'),
                customPlatformFormData = $('#customPlatformForm').serializeArray();

            $scope.$parent.postPlatformDataObj = [];
            if (customFieldErrorElem.length === 0 && customPlatformFormData.length > 1) {
                _.each(customPlatformFormData, function (data) {
                    var d = data.name.split('$$');

                    $scope.$parent.postPlatformDataObj.push({
                        'platformCustomInputId': Number(d[1]), 
                        'value': data.value
                    });
                });
            } else {
                if ($scope.workflowData['adsData'] && 
                    $scope.workflowData['adsData'].adPlatformCustomInputs && 
                    $scope.workflowData['adsData'].adPlatformCustomInputs.length > 0) {
                    $scope.$parent.postPlatformDataObj = $scope.workflowData['adsData'].adPlatformCustomInputs;
                }
            }
            if ($scope.mode == 'edit') {
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify($scope.$parent.postPlatformDataObj));
            }
            //trigger targeting tab link only when intentionally clicked not on edit mode by default
            if (!editModeFlag) {
                $scope.triggerTargetting();
            }
            $scope.switchPlatform();
        };

        $scope.showtrackingSetupInfoPopUp = false;
        $scope.trackingIntegrationId = '';

        $scope.$watch('adData.platformId', function (newValue) {
            $scope.$parent.changePlatform(newValue);
        });

        if ($scope.mode === 'create') {
            $scope.fetchPlatforms();
        }

        $scope.$on('updatePlatform', function (event, platform) {
            $scope.fetchPlatforms(platform[0]);
            if (platform[0]) {
                $scope.defaultPlatform = platform[0];
                $scope.selectPlatform((platform[0].switchPlatform ? event : ''), platform[0]);
                $scope.saveCustomeFieldForPlatform(true);
            }
        });

        $scope.$on('switchPlatformFunc', function () {
            var customFieldErrorElem = $('.customFieldErrorMsg'),
                $modalInstance;

            if (customFieldErrorElem.length > 0) {
                $modalInstance = $modal.open({
                    templateUrl: assets.html_confirmation_modal,
                    controller: 'ConfirmationModalController',
                    scope:$scope,
                    windowClass: 'delete-dialog',
                    resolve: {
                        headerMsg: function () {
                            return 'Custom Field';
                        },
                        mainMsg: function () {
                            return 'Address the validation errors or clear the values to proceed';
                        },
                        buttonName: function () {
                            return 'Reset'
                        },
                        execute: function () {
                            return function () {
                                $('.customFieldErrorMsg').remove();
                                if ($('#customPlatformForm') && $('#customPlatformForm').length >0) {
                                    $('#customPlatformForm')[0].reset();
                                }
                                hideCustomPlatfromBox();
                            }
                        }
                    }
                });
                return false;
            }
            hideCustomPlatfromBox();
        });
    });
})();