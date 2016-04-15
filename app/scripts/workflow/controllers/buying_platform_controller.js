define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'workflow/services/platform_custome_module'], function (angularAMD) {
    angularAMD.controller('BuyingPlatformController', function ($scope, $timeout, $modal, $filter, $rootScope, constants, workflowService, platformCustomeModule) {

        var tempPlatform,
            storedResponse,
            oldPlatformName,
            hideCustomPlatformBox = function () {
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
            },
            hideTargetingBox = function() {
                $('#geographyTargeting').delay(300).animate({left: '100%', marginLeft: '0', opacity: '0'}, function () {
                    $(this).hide();
                });

                $('#dayTargeting').delay(300).animate({left: '100%', marginLeft: '0px', opacity: '0.0'}, function () {
                    $(this).hide();
                });

                $('#audienceTargeting')
                    .delay(300)
                    .animate({left: '100%', marginLeft: '0', opacity: '0.0'}, function () {
                        $(this).hide();
                    });
            };



        $scope.fetchPlatforms = function (platform) {
            var errorHandler = function (errData) {
                console.log(errData);
            };

            workflowService
                .getPlatforms({cache: false})
                .then(function (result) {
                    var responseData,
                        adsDetails,
                        platformStatus,
                        i;

                    if (result.status === 'OK' || result.status === 'success') {
                        responseData = result.data.data;
                        //wrapper to transform new API response to old one
                        responseData = workflowService.platformResponseModifier(responseData);
                        adsDetails = workflowService.getAdsDetails();
                        if ($scope.mode == 'edit' && platform) {
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

            $scope.workflowData.tracking_integrations = {};
            for (i = 0; i < slides; i++) {
                $scope.workflowData.tracking_integrations[i] = tempData.splice(0, 3);
            }
        };


        $scope.selectPlatform = function (event, platform, seat) {
            //showing card view when you change the platform.
            hideTargetingBox();

            var settings = '';
            console.log(seat)
            console.log(platform)
            //remove creatives only if Tracking-only is changed to Full integrations
            if ($scope.wasFullIntegration() === -1) {
                $scope.resetCreatives();
            }

            storedResponse = workflowService.getAdsDetails();
            if ($scope.mode === 'edit') {
                if (storedResponse.targets.geoTargets) {
                    settings = 'Geography';
                }
                if (storedResponse.platform) {
                    if (storedResponse.platform.name === seat.name) {
                        //directly set  the platform if it is the same
                        $scope.setPlatform(event, platform, seat);
                    } else {
                        //if the platform is changed but no targets were selected allow change
                        if (_.size(storedResponse.targets.geoTargets) == 0) {
                            $scope.setPlatform(event, platform);
                        } else {
                            //display warning popup
                            if ($scope.defaultPlatform.id !== platform.id || $scope.defaultSeat.id !== seat.id) {
                                tempPlatform = platform;
                                $scope.changePlatformMessage =
                                    'Your entries for the following settings are not compatible with ' +
                                    $filter('toPascalCase')(platform.name) +
                                    ': ' +
                                    settings +
                                    '. Would you like to clear these settings and switch platforms? (OK/Cancel).';
                                $scope.changePlatformPopup = true;
                            } else {
                                $scope.setPlatform(event, platform, seat);
                            }
                        }
                    }
                } else {
                    $scope.setPlatform(event, platform, seat);
                }
            } else {
                $rootScope.$broadcast('resetTargeting');
                $scope.setPlatform(event, platform, seat);
            }
            $rootScope.$broadcast('targettingCapability', platform)
        };

        $scope.setPlatform = function (event, platform, seat) {

            //reset the targeting and platform while changing the platform
            if (event && !$scope.changePlatformPopup) {
                if ($scope.adData && platform.id !== $scope.adData.platformId) {
                    $rootScope.$broadcast('resetTargeting');
                    //reseting the custom field values on change of platform.
                    $scope.$parent.postPlatformDataObj = null;
                    localStorage.removeItem('adPlatformCustomInputs');
                }
            }

            $scope.selectedPlatform = {};
            $scope.selectedSeat = {};
            workflowService.setPlatform(platform);
            workflowService.setPlatformSeat(seat);

            //audience targetting
            if ($scope.mode != 'edit' || ($scope.defaultPlatform && $scope.defaultPlatform.id !== platform.id)) {
                $scope.$parent.TrackingIntegrationsSelected = false;
            }

            //remove creatives only if tracking integrations is changed to Full integrations
            if($scope.adData.platformId) {
                var wasPrevTrackingInt = _.findIndex($scope.workflowData.platforms, function (item) {
                    return item.id === $scope.adData.platformId;
                });
            }
            // code to make creatives already set to empty
            if (event && wasPrevTrackingInt < 0) {
                $scope.adData.setSizes = constants.WF_NOT_SET;
                $scope.creativeData.creativeInfo = 'undefined';
                $scope.$parent.selectedArr.length = 0;
                $scope.$parent.TrackingIntegrationsSelected = false;
            }

            // To populate the newly selected Platform in sideBar

            $scope.adData.platform = seat.name;
            $scope.adData.platformId = platform.id;
            $scope.adData.platformName = seat.name;
            $scope.adData.platformSeatId = seat.id
            $scope.selectedPlatform[platform.id] = seat.name;
            $scope.selectedSeat[seat.id] = seat.name
            event && $scope.platformCustomInputs();
        };

        $scope.selectTrackingIntegrations = function (trackingIntegration) {
            if($scope.adData.platformId==undefined){
                $scope.resetCreatives();
            }

            $scope.showtrackingSetupInfoPopUp = false;
            $scope.$parent.postPlatformDataObj = [];
            //$scope.platformCustomInputs();
            trackingIntegration = $scope.trackingIntegration || trackingIntegration;
            // if ($scope.mode !== 'edit') {
            $scope.$parent.TrackingIntegrationsSelected = true;
            //}
            $scope.selectedPlatform = {};
            $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.displayName;

            //remove creatives only if Full integrations is changed to Tracking-only
            if ($scope.wasFullIntegration() >= 0) {
                $scope.resetCreatives();
            }

            // To populate the newly selected Platform in sideBar
            $scope.adData.platform = trackingIntegration.displayName;
            $scope.adData.platformId = trackingIntegration.id;
            $scope.adData.platformName = trackingIntegration.name;
        };

        $scope.showCustomFieldBox = function () {
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
                        //invoke wrapper
                        result.data.data = workflowService.platformCreateObj(result.data.data);
                        if (result.data.data.customInputJson != '') {
                            platformCustomeJson = JSON.parse(result.data.data.customInputJson);
                            if ($scope.mode === 'edit') {
                                $scope.showCustomFieldBox();
                                adPlatformCustomInputsLocalStorageValue = localStorage.getItem('adPlatformCustomInputs');
                                adPlatformCustomInputs =
                                    (adPlatformCustomInputsLocalStorageValue &&
                                    JSON.parse(adPlatformCustomInputsLocalStorageValue)) ||
                                    platformCustomeJson;
                                platformCustomeModule.init(platformCustomeJson, platformWrap, adPlatformCustomInputs);
                            } else {
                                $scope.showCustomFieldBox();
                                // maintain state of building platform strategy when user selects it navigates to other places
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
        };

        $scope.confirmChange = function () {

            $scope.changePlatformPopup = false;
            $scope.$parent.postPlatformDataObj = null;
            localStorage.removeItem('adPlatformCustomInputs');
            $scope.setPlatform(null, tempPlatform);

            storedResponse.targets.geoTargets = {};
            $rootScope.$broadcast('resetTargeting');
            $scope.platformCustomInputs();
        };

        $scope.showTrackingSetupInfoPopUp = function (event, trackingIntegration) {
            var offset = $(event.target).offset(),
                left = offset.left,
                top = offset.top,
                relativeX = $(event.target).closest('.offeringWrap').offset().left -
                    $(event.target).closest('.carousel-inner').offset().left + 50;

            $scope.trackingIntegration = trackingIntegration;
            $('.buyingPlatformHolder .popUpCue').css({
                top: 125,
                left: relativeX
            });
            $scope.showtrackingSetupInfoPopUp = true;
        };

        $scope.hideTrackingSetupInfoPopUp = function () {
            $scope.showtrackingSetupInfoPopUp = false;
        };

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
                if ($scope.workflowData.adsData &&
                    $scope.workflowData.adsData.adPlatformCustomInputs &&
                    $scope.workflowData.adsData.adPlatformCustomInputs.length > 0) {
                    $scope.$parent.postPlatformDataObj = $scope.workflowData.adsData.adPlatformCustomInputs;
                }
            }
            if ($scope.mode == 'edit') {
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify($scope.$parent.postPlatformDataObj));
            }
            $scope.switchPlatform();
        };

        $scope.showtrackingSetupInfoPopUp = false;
        $scope.trackingIntegrationId = '';

        $scope.$watch('adData.platformId', function (newValue) {
            $scope.$parent.changePlatform(newValue);
        });

        $rootScope.$on('adCampaignDataSet',function (event) {
            if ($scope.mode === 'create') {
                $scope.fetchPlatforms();
            }
        });

        $scope.$on('updatePlatform', function (event, platform) {
            $scope.fetchPlatforms(platform[0]);
            if (platform[0]) {
                $scope.defaultPlatform = platform[0];
                $scope.selectPlatform((platform[0].switchPlatform ? event : ''), platform[0]);
                $scope.adData.platformId = platform[0].id
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
                                $('.customFieldErrorMsg').remove();
                                if ($('#customPlatformForm') && $('#customPlatformForm').length > 0) {
                                    $('#customPlatformForm')[0].reset();
                                    $timeout(function () {
                                        $("#customPlatformForm").find("select").trigger("change");
                                    }, 200)

                                }
                                hideCustomPlatformBox();
                            };
                        }
                    }
                });
                return false;
            }
            hideCustomPlatformBox();
        });

        $scope.resetCreatives = function () {
            // Reset creatives if any had been selected.
            if ($scope.adData.setSizes !== constants.WF_NOT_SET) {
                $scope.$parent.selectedArr.length = 0;
                $scope.changeStatus();
                $scope.updateCreativeData($scope.$parent.selectedArr);
            }
        };

        $scope.wasFullIntegration = function () {
            if($scope.adData.platformId){
                return _.findIndex($scope.workflowData.platforms, function (item) {
                    return item.id === $scope.adData.platformId;
                });
            }
        };
    });
});
