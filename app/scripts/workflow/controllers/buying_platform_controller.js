define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'workflow/services/platform_custome_module'], function (angularAMD) {
    angularAMD.controller('BuyingPlatformController', function ($scope, $timeout, $modal, $filter, $rootScope, constants, workflowService, platformCustomeModule) {

        var tempPlatform,
            storedResponse,
            oldPlatformName;


        var _buyingPlatform = {

            trackingPlatformCarouselData : function (responseData) {
                var tempData = responseData.trackingPlatforms,
                    slides = Math.ceil((responseData.trackingPlatforms.length) / 3),
                    i;

                $scope.workflowData.tracking_integrations = {};
                for (i = 0; i < slides; i++) {
                    $scope.workflowData.tracking_integrations[i] = tempData.splice(0, 3);
                }
            },


            platformWrapper : function(platform) {
                var selectedSeats,
                    selectedPlatformIndex = _.findIndex($scope.workflowData.platforms, function (item) {
                        return item.id == platform.id
                    })

                if (selectedPlatformIndex !== -1) {
                    var selectedSeat = _.findIndex($scope.workflowData.platforms[selectedPlatformIndex].seats, function (item) {
                        return item.id == platform.vendorSeatId
                    })
                    selectedSeats = $scope.workflowData.platforms[selectedPlatformIndex].seats[selectedSeat];
                }
                if(selectedSeats && platform) {
                    $scope.adData.platfromSeatId = platform.vendorSeatId
                } else {
                    $scope.adData.platfromSeatId = null;
                }

                $scope.selectPlatform(null, platform, selectedSeats);
            },

            fetchPlatforms : function (platform) {
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
                                        _buyingPlatform.trackingPlatformCarouselData(responseData);
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
                                        _buyingPlatform.trackingPlatformCarouselData(responseData);
                                    }
                                } else {
                                    $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                    _buyingPlatform.trackingPlatformCarouselData(responseData);
                                }
                                _buyingPlatform.platformWrapper(platform)
                            } else {
                                $scope.workflowData.platforms = responseData.fullIntegrationsPlatforms;
                                _buyingPlatform.trackingPlatformCarouselData(responseData);
                            }

                        } else {
                            _buyingPlatform.errorHandler(result);
                        }
                    }, _buyingPlatform.errorHandler);

            },

            //select a platform one of the seat of the platform
            _selectPlatform : function (event, platform, seat) {
                //showing card view when you change the platform.
                _buyingPlatform.hideTargetingBox();

                //Stop propogation to parent element
                event && event.stopImmediatePropagation();

                var settings = '';

                //remove creatives only if Tracking-only is changed to Full integrations
                if (event && $scope.wasFullIntegration() === -1) {
                    _buyingPlatform.resetCreatives();
                }

                storedResponse = workflowService.getAdsDetails();

                if ($scope.mode === 'edit') {
                    if (storedResponse.targets.geoTargets) {
                        settings = 'Geography';
                    }
                    if (seat && storedResponse.platform ) {
                        if (storedResponse.platform.name === seat.name) {
                            //directly set  the platform if it is the same
                            _buyingPlatform.setPlatform(event, platform, seat);
                        } else {
                            //if the platform is changed but no targets were selected allow change
                            if (_.size(storedResponse.targets.geoTargets) == 0) {
                                _buyingPlatform.setPlatform(event, platform, seat);
                            } else {
                                //display warning popup
                                if ($scope.defaultPlatform.id !== platform.id || $scope.defaultPlatform.vendorSeatId !== seat.id) {
                                    tempPlatform = platform;
                                    $scope.changePlatformMessage =
                                        'Your entries for the following settings are not compatible with ' +
                                        $filter('toPascalCase')(platform.name) +
                                        ': ' +
                                        settings +
                                        '. Would you like to clear these settings and switch platforms? (OK/Cancel).';
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
                    $rootScope.$broadcast('resetTargeting');
                    _buyingPlatform.setPlatform(event, platform, seat);
                }
                $rootScope.$broadcast('targettingCapability', platform)
            },

            setPlatform : function (event, platform, seat) {

                $scope.selectedPlatform = {};
                $scope.selectedSeat = {};

                //reset the targeting and platform while changing the platform
                if (event && !$scope.changePlatformPopup) {
                    if ($scope.adData && platform.id !== $scope.adData.platformId) {
                        $rootScope.$broadcast('resetTargeting');
                        //reseting the custom field values on change of platform.
                        $scope.$parent.postPlatformDataObj = null;
                        localStorage.removeItem('adPlatformCustomInputs');
                    }
                }

                workflowService.setPlatform(platform);

                if(seat) {
                    workflowService.setPlatformSeat(seat);
                    $scope.$parent.TrackingIntegrationsSelected = false;
                    $scope.adData.platformName = seat.name;
                    $scope.adData.platformSeatId = seat.id
                    $scope.selectedPlatform[platform.id] = seat.name;
                    $scope.selectedSeat[seat.id] = seat.name
                } else {
                    $scope.adData.platformName = platform.name;
                    $scope.selectedPlatform[platform.id] = platform.name;
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

                $scope.adData.platform = platform.displayName;
                $scope.adData.platformId = platform.id;
                event && $scope.platformCustomInputs();
            },

            resetCreatives : function () {
                // Reset creatives if any had been selected.
                if ($scope.adData.setSizes !== constants.WF_NOT_SET) {
                    $scope.$parent.selectedArr.length = 0;
                    $scope.changeStatus();
                    $scope.updateCreativeData($scope.$parent.selectedArr);
                }
            },


            errorHandler : function (errData) {
                console.log(errData);
            },

            hideCustomPlatformBox : function () {
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

            hideTargetingBox : function() {
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
            },

            showCustomFieldBox : function () {
                $('.platform-custom')
                    .show()
                    .delay(300)
                    .animate({
                        left: '50%',
                        marginLeft: '-323px'
                    }, 'slow');
                $('.offeringsWrap').hide();
            }
        }



        $scope.selectPlatform = function(event, platform, seat) {
            $scope.defaultPlatform = platform;
            _buyingPlatform._selectPlatform(event , platform, seat);
            $scope.saveCustomeFieldForPlatform(true);
        };

        $scope.selectTrackingIntegrations = function (trackingIntegration) {
            if($scope.adData.platformId==undefined){
                _buyingPlatform.resetCreatives();
            }

            $scope.showtrackingSetupInfoPopUp = false;
            $scope.$parent.postPlatformDataObj = [];

            trackingIntegration = $scope.trackingIntegration || trackingIntegration;

            $scope.$parent.TrackingIntegrationsSelected = true;
            $scope.selectedPlatform = {};
            $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.displayName;

            //remove creatives only if Full integrations is changed to Tracking-only
            if ($scope.wasFullIntegration() >= 0) {
                _buyingPlatform.resetCreatives();
            }

            // To populate the newly selected Platform in sideBar
            $scope.adData.platform = trackingIntegration.displayName;
            $scope.adData.platformId = trackingIntegration.id;
            $scope.adData.platformName = trackingIntegration.name;
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
                                _buyingPlatform.showCustomFieldBox();

                                adPlatformCustomInputsLocalStorageValue = localStorage.getItem('adPlatformCustomInputs');

                                adPlatformCustomInputs =
                                    (adPlatformCustomInputsLocalStorageValue &&
                                    JSON.parse(adPlatformCustomInputsLocalStorageValue)) ||
                                    platformCustomeJson;

                                platformCustomeModule.init(platformCustomeJson, platformWrap, adPlatformCustomInputs);
                            } else {
                                _buyingPlatform.showCustomFieldBox();
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
            _buyingPlatform.setPlatform(null, tempPlatform, tempPlatform.seats[0]);

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
                top: 10,
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
                _buyingPlatform.fetchPlatforms();
            }
        });

        $scope.$on('updatePlatform', function (event, platform) {
            _buyingPlatform.fetchPlatforms(platform);
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
                                _buyingPlatform.hideCustomPlatformBox();
                            };
                        }
                    }
                });
                return false;
            }
            _buyingPlatform.hideCustomPlatformBox();
        });


        $scope.wasFullIntegration = function () {
            if($scope.adData.platformId){
                return _.findIndex($scope.workflowData.platforms, function (item) {
                    return item.id === $scope.adData.platformId;
                });
            }
        };
    });
});
