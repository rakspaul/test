var angObj = angObj || {};
(function () {
    'use strict';

    angObj.controller('CampaignAdsCreateController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, campaignListService, requestCanceller, $filter, loginModel, $q, dataService, apiPaths, audienceService) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $(".bodyWrap").addClass('bodyWrapOverview');
        $("html").css('background', '#fff');
        var winHeaderHeight = $(window).height() - 50;
        $(".workflowPreloader").css('height', winHeaderHeight + 'px');

        // This sets dynamic width to line to take 100% height
        function colResize() {
            var winHeight = $(window).height() - 110;
            $(".campaignAdCreateWrap, .campaignAdCreatePage, .left_column_nav").css('min-height', winHeight + 'px');
            $(".adStepOne .tab-pane").css('min-height', winHeight - 30 + 'px');
        }

        if ($(window).height() < 596) {
            setTimeout(function () {
                $(".workflowPreloader").fadeOut("slow");
            }, 1500);
        } else {
            var winHeight = $(window).height() - 126;
            colResize();

            setTimeout(function () {
                colResize();
                $(".workflowPreloader").fadeOut("slow");
            }, 1500);
        }

        $(window).resize(function () {
            colResize();
        });


        // This is for the drop down list. Perhaps adding this to a more general controller
        $(document).on('click', '.dropdown-menu li.available a', function () {
            $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
            $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        });

        $('.dropdown-workflow a').each(function () {
            var text = $(this).text()
            if (text.length > 14)
                $(this).val(text).text(text.substr(0, 20) + '…')
        });

        $scope.mode = workflowService.getMode();
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {};
        $scope.unitType = '';
        $scope.adData.screenTypes = [];
        $scope.creativeData = {};
        $scope.creativesLibraryData = {};
        $scope.creativesLibraryData['creativesData'] = [];
        $scope.showHidePopup = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.adGroupId = $routeParams.adGroupId;
        $scope.adId = $routeParams.adId;
        $scope.selectedArr = [];
        $scope.unchecking = false;
        $scope.enableSaveBtn = true;
        $scope.isAddCreativePopup = false;
        $scope.IsVisible = false;//To show hide view tag in creatives listing
        $scope.currentTimeStamp = moment.utc().valueOf();
        $scope.adData.setSizes = constants.WF_NOT_SET;
        $scope.numberOnlyPattern = /[^0-9]/g;
        $scope.adArchive = false;
        $scope.adPause = false;
        $scope.adResume = false;
        $scope.changePlatformPopup = false;
        $scope.archiveMessage = "Do you want to Archive / Delete the Ad?";
        $scope.changePlatformMessage = "Your entries for the following settings are not compatible with [Platform Name]: [Settings list]. Would you like to clear these settings and switch platforms? (OK/Cancel).";
        $scope.partialSaveAlertMessage = {'message': '', 'isErrorMsg': 0};
        $scope.preDeleteArr = [];
        $scope.TrackingIntegrationsSelected = false;
        $scope.preSelectArr = [];
        $scope.sortDomain = false;
        $scope.isAdsPushed = false;
        $scope.editedAdSourceId = null;
        $scope.dayPartData = {};
        localStorage.setItem('campaignData', '');
        localStorage.removeItem('adPlatformCustomInputs');
        $scope.adData.budgetTypeLabel = 'Impressions';
        $scope.adData.budgetType = 'Impressions';
        $scope.downloadingTracker=false;
        $scope.selectedAudience = [];
        $scope.selectedDayParts = [];
        $scope.adData.setSizes = constants.WF_NOT_SET;
        $scope.editCampaign = function (workflowcampaignData) {
            window.location.href = '/mediaplan/' + workflowcampaignData.id + '/edit';

        }

        $scope.msgtimeoutReset = function () {
            $timeout(function () {
                $scope.resetPartialSaveAlertMessage();
            }, 3000);
        }

        $scope.convertEST = function (date, format) {
            return utils.convertToEST(date, format);
        }

        $scope.archiveAd = function (event) {
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $scope.partialSaveAlertMessage.message = $scope.textConstants.WF_AD_ARCHIVE_FAILURE;
                $scope.partialSaveAlertMessage.isErrorMsg = 1;
                $scope.partialSaveAlertMessage.isMsg = 0;
            }

            workflowService.deleteAd($scope.campaignId, $scope.adId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.adArchive = false;
                    var url = '/mediaplan/' + $scope.campaignId + '/overview';
                    $location.url(url);
                    localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_ARCHIVE_SUCCESS);
                } else {
                    errorAchiveAdHandler();
                }
            }, errorAchiveAdHandler);


        }

        $scope.pauseAd = function () {//console.log($scope.getAd_result);
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $scope.partialSaveAlertMessage.message = $scope.textConstants.WF_AD_PAUSE_FAILURE;
                $scope.partialSaveAlertMessage.isErrorMsg = 1;
                $scope.partialSaveAlertMessage.isMsg = 0;
            }
            var pauseAdDataObj = {};
            pauseAdDataObj.name = $scope.getAd_result.name;
            pauseAdDataObj.id = $scope.getAd_result.id;
            pauseAdDataObj.campaignId = $scope.getAd_result.campaignId;
            pauseAdDataObj.updatedAt = $scope.getAd_result.updatedAt;
            workflowService.pauseAd(pauseAdDataObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.adArchive = false;
                    var url = '/mediaplan/' + $scope.campaignId + '/overview';
                    $location.url(url);
                    localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_PAUSE_SUCCESS);
                } else {
                    errorAchiveAdHandler();
                }
            }, errorAchiveAdHandler);

        }
        $scope.resumeAd = function () {//console.log($scope.getAd_result);
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $scope.partialSaveAlertMessage.message = $scope.textConstants.WF_AD_RESUME_FAILURE;
                $scope.partialSaveAlertMessage.isErrorMsg = 1;
                $scope.partialSaveAlertMessage.isMsg = 0;
            }
            var resumeAdDataObj = {};
            resumeAdDataObj.name = $scope.getAd_result.name;
            resumeAdDataObj.id = $scope.getAd_result.id;
            resumeAdDataObj.campaignId = $scope.getAd_result.campaignId;
            resumeAdDataObj.updatedAt = $scope.getAd_result.updatedAt;
            workflowService.resumeAd(resumeAdDataObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.adArchive = false;
                    var url = '/mediaplan/' + $scope.campaignId + '/overview';
                    $location.url(url);
                    localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_RESUME_SUCCESS);
                } else {
                    errorAchiveAdHandler();
                }
            }, errorAchiveAdHandler);
        }

        $scope.numbersOnly = function (scopeVar) {
            if (scopeVar === 'budgetAmount')
                $scope.adData.budgetAmount = $scope.adData.budgetAmount.replace($scope.numberOnlyPattern, '');
            if (scopeVar === 'quantity')
                $scope.adData.quantity = $scope.adData.quantity.replace($scope.numberOnlyPattern, '');
        }

        $scope.cancelAdArchive = function () {
            $scope.adArchive = !$scope.adArchive;
        }
        $scope.cancelAdPause = function () {
            if ($scope.disable_pause != 'disabled')
                $scope.adPause = !$scope.adPause;

        }
        $scope.cancelAdResume = function () {
            $scope.resumeMessage = "Resume delivery for flight dates " + utils.convertToEST($scope.getAd_result.startTime, 'DD MMM YYYY') + " to " + utils.convertToEST($scope.getAd_result.endTime, 'DD MMM YYYY') + " ?";

            if ($scope.disable_resume != 'disabled')
                $scope.adResume = !$scope.adResume;
        }
        $scope.msgtimeoutReset();
        $scope.close_msg_box = function (event) {
            $scope.resetPartialSaveAlertMessage();
        };

        $scope.resetPartialSaveAlertMessage = function () {
            $scope.partialSaveAlertMessage.message = '';
            $scope.partialSaveAlertMessage.isErrorMsg = 0;
            $scope.partialSaveAlertMessage.isMsg = 0;
        }

        $scope.dropBoxItemSelected = function (item, type, event) {
            if (item.name == 'CPC') {
                $scope.adData.budgetTypeLabel = 'Clicks';
            } else if (item.name == 'CPA') {
                $scope.adData.budgetTypeLabel = 'Actions';
            } else {
                $scope.adData.budgetTypeLabel = 'Impressions';
            }
            // if(item.name !==  $scope.adData.unitType) {
            //    $scope.adData.unitCost = 0;
            // }
            if ($scope.adData.budgetType && $scope.adData.budgetType.toLowerCase() !== 'cost') {
                $scope.adData.budgetType = $scope.adData.budgetTypeLabel;
            }
            $scope.adData[type] = item;
        }

        $scope.ShowHide = function (obj) {
            $scope.IsVisible = $scope.IsVisible ? false : true;
            $scope.creativeObj = obj;
        }

        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {'display': 'image', 'video': 'video', 'rich media': 'rich-media', 'social': 'social'}
            return adFormatMapper[adFormat.toLowerCase()];
        }

        $scope.getScreenTypeIconName = function (screenType) {
            var screenTypeMapper = {'desktop': 'desktop', 'mobile': 'mobile', 'tablet': 'tablet'}
            return screenTypeMapper[screenType.toLowerCase()];
        }

        $scope.getGoalIconName = function (goal) {
            var goalMapper = {'performance': 'performance', 'brand': 'brand'}
            return goalMapper[goal.toLowerCase()];
        }

        $scope.getPlatformIconName = function (platform) {
            var platformMapper = {
                'collective bidder': 'logo_C_bidder',
                "collective bidder - test": 'logo_C_bidder',
                'appnexus': 'logo_C_appnexus',
                'appnexus - test': 'logo_C_appnexus',
                'facebook': 'facebook-FBexchange',
                'dbm': 'doubleclick-DFP',
                'dfp': 'doubleclick-DFP',
                'place media': 'placemedia',
                'telemetry': 'telemetry',
                'xad': 'xad',
                'twitter': 'twitter',
                'ad theorent': 'ad_theorent',
                'dstillery': 'dstillery',
                'adap.tv': 'adaptv',
                'youtube': 'youtube',
                'brightroll': 'brightroll',
                'doubleClick': 'doubleclick-DFP',
                'yahoo': 'yahoo',
                'fb exchange': 'facebook-FBexchange',
                'dfp-tracking': 'doubleclick-DFP',
                'doubleclick': 'doubleclick-DFP',
                'facebook-tracking': 'facebook-FBexchange',
                'appnexus-tracking': 'logo_C_appnexus',
                'dorado-tracking': 'logo_C_bidder',
                'dbm-tracking': 'doubleclick-DFP'
            };
            if (platform)
                return platformMapper[platform.toLowerCase()];
        }

        $scope.getPlatformDesc = function (platform) {
            var platformMapper = {
                'collective bidder': 'The programmactic solution for all screens and formats.',
                'appnexus': 'The programmactic solution for all screens and formats',
                'facebook': 'All-in-one customer<br />support application',
                'dbm': 'All-in-one customer<br />support application',
                'dfp': 'A revenue management<br />solution for publishers'
            }
            return platformMapper[platform.toLowerCase()];
        }

        var saveDataInLocalStorage = function (data) {
            localStorage.removeItem('campaignData');
            var campaignData = {
                'advertiserId': data.advertiserId,
                'advertiserName': data.advertiserName,
                'clientId': data.clientId,
                'clientName': data.clientName
            };
            localStorage.setItem('campaignData', JSON.stringify(campaignData))
        };


        $scope.switchPlatform = function (event) {
            $scope.resetPartialSaveAlertMessage();
            $scope.$broadcast('switchPlatformFunc');
        };

        //edit mode data population

        function processEditMode(result, startDateElem) {
            var responseData = result.data.data;
            $scope.workflowData['adsData'] = responseData;
            if (responseData.adPlatformCustomInputs) {
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify(responseData.adPlatformCustomInputs))
            }
            workflowService.setAdsDetails(angular.copy(responseData));
            console.log("set ad details process edit mode == ",responseData);

            $scope.updatedAt = responseData.updatedAt;
            $scope.state = responseData.state;
            // $scope.editTrackerAd=responseData.is_Tracker;
            if (responseData.sourceId) {
                $scope.editedAdSourceId = responseData.sourceId;
            }
            if (responseData.isTracking) {
                $scope.TrackingIntegrationsSelected = true;
                campaignOverView.fetchPlatforms();
            }
            if (responseData.name)
                $scope.adData.adName = responseData.name;


            if (responseData.adFormat) {
                var format = $filter('toTitleCase')(responseData.adFormat);
                $scope.adFormatSelection(format);
                $scope.adData.adFormat = format;
            }

            //if(responseData.goal){
            //    var goal = $filter('toTitleCase')(responseData.goal);
            //    $scope.goalSelection(goal);
            //    $scope.adData.goal = goal;
            //}

            if (responseData.goal) {
                $scope.adData.primaryKpi = responseData.goal;
            }

            if (responseData.screens) {
                for (var i = 0; i < responseData.screens.length; i++) {
                    var index = _.findIndex($scope.workflowData.screenTypes, function (item) {
                        return item.id == responseData.screens[i].id
                    });

                    $scope.workflowData.screenTypes[index].active = true;
                    $scope.screenTypeSelection($scope.workflowData.screenTypes[index]);
                }
            }

            //budget tab
            if (responseData.budgetType) {
                $scope.adData.budgetType = $scope.adData.budgetTypeLabel = $filter('toTitleCase')(responseData.budgetType);
                if ($scope.adData.budgetType) {
                    var budgetElem = $(".budget_" + $scope.adData.budgetType.toLowerCase());
                }
                if (budgetElem.length > 0) {
                    budgetElem.closest("div.miniToggle").find("label").removeClass('active');
                    budgetElem.addClass('active').find('input').attr("checked", "checked");
                }
            }
            var dateObj = {};
            if (responseData.startTime) {
                dateObj['adStartDate'] = $scope.adData.startTime = utils.convertToEST(responseData.startTime, "MM/DD/YYYY");
            }

            if (responseData.endTime) {
                dateObj['adEndDate'] = $scope.adData.endTime = utils.convertToEST(responseData.endTime, "MM/DD/YYYY");
            }
            localStorage.setItem('adsDates', JSON.stringify(dateObj));
            $scope.initiateDatePicker();

            if (responseData.rateValue !== '') {
                $scope.adData.unitCost = responseData.rateValue;
            }

            if (responseData.budgetValue) {
                $scope.adData.budgetAmount = responseData.budgetValue;
            }

            if (responseData.rateType) {
                var idx = _.findIndex($scope.workflowData.unitTypes, function (item) {
                    return item.name == responseData.rateType
                });

                $scope.adData.unitType = $scope.workflowData.unitTypes[idx]; // cpm ..... dropdown
                $('#unitcostType').parents(".dropdown").find('.btn').html($scope.adData.unitType.name + ' <span class="icon-arrow-down"></span>');
            }

            $('.cap_no input').attr("checked", "checked");
            $('.spend_evenly input').attr("checked", "checked");
            if (responseData.frequencyCaps && responseData.frequencyCaps.length > 1) {
                $scope.adData.setCap = true;
                $('.cap_yes').addClass('active');
                $('.cap_no').removeClass('active');
                $('.cap_yes input').attr("checked", "checked");
                $scope.adData.budgetAmount = responseData.frequencyCaps[0]['quantity'];
                $scope.adData.quantity = responseData.frequencyCaps[responseData.frequencyCaps.length - 1]['quantity'];
                $scope.capsPeriod = responseData.frequencyCaps[responseData.frequencyCaps.length - 1]['frequencyType'];
                var freqType = responseData.frequencyCaps[responseData.frequencyCaps.length - 1]['frequencyType'];
                if (freqType == "LIFETIME")
                    $scope.selectedFreq = 'Lifetime';
                else if (freqType == "DAILY")
                    $scope.selectedFreq = 'Daily';
//                $scope.selectedFreq = responseData.frequencyCaps[responseData.frequencyCaps.length -1]['frequencyType'];
                var pacingType = responseData.frequencyCaps[0]['pacingType'];
                if (pacingType != "EVENLY") {
                    $('.spend_asap').addClass('active');
                    $('.spend_asap input').attr("checked", "checked");
                    $('.spend_evenly').removeClass('active');
                }
            }

            //platform tab
            if (responseData.platform) {
                $scope.$broadcast('updatePlatform', [responseData.platform]);
                if (responseData.pushStatus == "PUSHED")
                    $scope.isAdsPushed = true;
            }


            //creative tags
            if (responseData.creatives)
                $scope.selectedArr = responseData.creatives;

            $scope.$broadcast('updateCreativeTags');

            if (responseData.targets && responseData.targets.geoTargets && _.size(responseData.targets.geoTargets) > 0) {
                $scope.selectedTargeting = {};
                $scope.selectedTargeting['geography'] = true;
                $timeout(function () {
                    $scope.$broadcast("updateGeoTagName");
                }, 2000)
            }
            //day part edit
            if (responseData.targets && responseData.targets.adDaypartTargets && _.size(responseData.targets.adDaypartTargets) > 0) {
                $timeout(function () {
                    $scope.$broadcast("UpdateDayPart");
                }, 2000)

            }

            //audience targetting load
            if (responseData.targets && responseData.targets.segmentTargets && _.size(responseData.targets.segmentTargets) > 0) {
                $timeout(function () {
                    $scope.$broadcast("triggerAudienceLoading");
                }, 2000)

            }
        }

        function disablePauseEnableResume(getAd_resultData) {
            $scope.disable_resume = 'disabled';//disable resume button
            if ((getAd_resultData.state == 'IN_FLIGHT' || getAd_resultData.state == 'SCHEDULED' ) && !(getAd_resultData.isTracking))//do not let Ad to pause if tracking
                $scope.disable_pause = '';//enable pause button
            else
                $scope.disable_pause = 'disabled';//disable pause button
            if (getAd_resultData.state == 'PAUSED') {
                //$scope.disable_pause="disabled";
                $scope.disable_resume = '';//enable resume if ad is paused
            }
        }


        var campaignOverView = {
            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        saveDataInLocalStorage(responseData);
                        if ($scope.mode === 'edit') {
                            if (!$scope.adGroupId) {
                                workflowService.getAd({
                                    campaignId: $scope.campaignId,
                                    adId: $scope.adId
                                }).then(function (result) {
                                    $scope.getAd_result = result.data.data;
                                    disablePauseEnableResume($scope.getAd_result);
                                    processEditMode(result);
                                })
                            } else {
                                workflowService.getDetailedAdsInAdGroup($scope.campaignId, $scope.adGroupId, $scope.adId).then(function (result) {
                                    $scope.getAd_result = result.data.data;
                                    disablePauseEnableResume($scope.getAd_result);
                                    processEditMode(result);
                                })
                            }
                        } else {
                            $scope.initiateDatePicker();
                        }
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            fetchGoals: function () {
                $scope.workflowData['goals'] = [{id: 1, name: 'Performance', active: true}, {
                    id: 2,
                    name: 'Brand',
                    active: false
                }]
                $scope.adData.goal = 'Performance'; //default value
            },

            fetchPrimaryKpis: function () {
                $scope.workflowData['primaryKpi'] = [{
                    kpi_category: 'DELIVERY',
                    kpi_values: [{id: 1, name: 'Impressions'}, {id: 2, name: 'Clicks'}, {id: 3, name: 'Actions'}]
                }, {
                    kpi_category: 'PERFORMANCE',
                    kpi_values: [{id: 1, name: 'Clickthrough Rate'}, {id: 2, name: 'View to Completion'}, {
                        id: 3,
                        name: 'Cost Per Click'
                    }, {id: 4, name: 'Viewabilty Rate'}]
                }];
            },

            fetchAdFormats: function () {
                $scope.workflowData['adFormats'] = [{id: 1, name: 'Display', active: true}, {
                    id: 2,
                    name: 'Video',
                    active: false
                }, {id: 3, name: 'Rich Media', active: false}, {id: 4, name: 'Social', active: false}]
                $scope.adData.adFormat = 'Display'; //default value
            },

            fetchScreenType: function () {
                if ($scope.mode != 'edit') {
                    $scope.workflowData['screenTypes'] = [{id: 1, name: 'Desktop', active: true}, {
                        id: 2,
                        name: 'Mobile',
                        active: false
                    }, {id: 3, name: 'Tablet', active: false}]
                    $scope.adData.screenTypes = [{id: 1, name: 'Desktop', active: true}] //default value
                }
                else {
                    $scope.workflowData['screenTypes'] = [{id: 1, name: 'Desktop', active: false}, {
                        id: 2,
                        name: 'Mobile',
                        active: false
                    }, {id: 3, name: 'Tablet', active: false}]
                    $scope.adData.screenTypes = [] //default value
                }

            },

            fetchUnitTypes: function () {
                $scope.workflowData['unitTypes'] = [{id: 1, name: 'CPM'}, {id: 2, name: 'CPC'}, {
                    id: 3,
                    name: 'CPA'
                }];
            },

            fetchPlatforms: function () {
                workflowService.getPlatforms({cache: false}).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        //console.log(responseData);
                        if ($scope.mode == 'edit') {
                            if ($scope.TrackingIntegrationsSelected) {
                                for (var i in responseData.fullIntegrationsPlatforms) {
                                    responseData.fullIntegrationsPlatforms[i].active = false;
                                }
                                $scope.workflowData['platforms'] = responseData.fullIntegrationsPlatforms;

                                campaignOverView.trackingPlatformCarouselData(responseData);
                            } else {

                                $scope.workflowData['platforms'] = responseData.fullIntegrationsPlatforms;
                                for (var i in responseData.trackingPlatforms) {
                                    responseData.trackingPlatforms[i].active = false;
                                }
                                campaignOverView.trackingPlatformCarouselData(responseData);
                                //$scope.workflowData['tracking_integrations']=responseData.trackingPlatforms;
                            }
                        } else {
                            $scope.workflowData['platforms'] = responseData.fullIntegrationsPlatforms;
                            campaignOverView.trackingPlatformCarouselData(responseData);
                        }

                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);

            },

            trackingPlatformCarouselData: function (responseData) {
                $scope.workflowData['tracking_integrations'] = {};
                var tempData = responseData.trackingPlatforms;
                var slides = Math.ceil((responseData.trackingPlatforms.length) / 3);
                for (var i = 0; i < slides; i++) {
                    $scope.workflowData['tracking_integrations'][i] = tempData.splice(0, 3);
                }
                console.log("data", $scope.workflowData['tracking_integrations']);
            },

            saveAds: function (postDataObj, isDownloadTrackerClicked) {
                //console.log(window.location.href);
                if (window.location.href.indexOf("adGroup") > -1) {
                    postDataObj.adGroupId = $scope.adGroupId;
                }//save adGroup Ad


                if ($scope.adId) {
                    postDataObj['adId'] = $scope.adId;
                    postDataObj['updatedAt'] = $scope.updatedAt;
                    postDataObj['state'] = $scope.state;

                }
                var promiseObj = $scope.adId ? workflowService.updateAd(postDataObj) : workflowService.createAd(postDataObj);
                promiseObj.then(function (result) {
                    var responseData = result.data.data;
                    if (result.status === "OK" || result.status === "success") {
                        $scope.state = responseData.state;
                        $scope.adId = responseData.id;
                        $scope.updatedAt = responseData.updatedAt;
                        if (!isDownloadTrackerClicked) {
                            $scope.partialSaveAlertMessage.message = $scope.textConstants.PARTIAL_AD_SAVE_SUCCESS;
                            $scope.partialSaveAlertMessage.isErrorMsg = 0;
                            $scope.partialSaveAlertMessage.isMsg = 1;
                            localStorage.setItem('adPlatformCustomInputs', JSON.stringify(responseData.adPlatformCustomInputs))
                            $scope.msgtimeoutReset();
                            //if ($scope.state && $scope.state.toLowerCase() != 'incomplete') {
                            var url = '/mediaplan/' + result.data.data.campaignId + '/overview';
                            $location.url(url);
                            localStorage.setItem('topAlertMessage', $scope.textConstants.AD_CREATED_SUCCESS);
                            //}
                        }
                    }
                    else {
                        $scope.partialSaveAlertMessage.message = responseData.message;
                        $scope.partialSaveAlertMessage.isErrorMsg = 1;
                        $scope.partialSaveAlertMessage.isMsg = 1;
                        $scope.msgtimeoutReset();
                    }
                }, function (errorObj) {
                    console.log(errorObj);
                    $scope.partialSaveAlertMessage.message = $scope.textConstants.PARTIAL_AD_SAVE_FAILURE;
                    $scope.partialSaveAlertMessage.isErrorMsg = 1;
                    $scope.partialSaveAlertMessage.isMsg = 1;
                    $scope.msgtimeoutReset();
                });
            },
            /*Function to get creatives for list view*/
            getTaggedCreatives: function (campaignId, adId) {
                workflowService.getTaggedCreatives(campaignId, adId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        if (responseData.creatives.length > 0)
                            $scope.emptyCreativesFlag = false;
                        else
                            $scope.emptyCreativesFlag = true;
                        $scope.creativeData['creativeInfo'] = responseData;
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);

            },


            errorHandler: function (errData) {
                console.log(errData);
            }
        }

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.fetchAdFormats();
        campaignOverView.fetchGoals();
        campaignOverView.fetchPrimaryKpis();
        campaignOverView.fetchScreenType();
        campaignOverView.fetchUnitTypes();
//        campaignOverView.fetchSelfServicePlatforms();
//        campaignOverView.fetchManagedServicePlatforms();
        campaignOverView.fetchPlatforms();

        $scope.screenTypeSelection = function (screenTypeObj) {
            var screenTypeFound = _.filter($scope.adData.screenTypes, function (obj) {
                return obj.name === screenTypeObj.name
            });
            var idx;
            if (screenTypeFound.length > 0) {
                for (var k in $scope.adData.screenTypes) {
                    if ($scope.adData.screenTypes[k].name == screenTypeObj.name)
                        idx = k;
                }
                $scope.adData.screenTypes.splice(idx, 1);
            } else {
                $scope.adData.screenTypes.push(screenTypeObj);
            }
        }

        $scope.adFormatSelection = function (adformatName) {
            var adFormatsData = $scope.workflowData['adFormats'];
            _.each(adFormatsData, function (obj) {
                obj.name === adformatName ? obj.active = true : obj.active = false;
            })
        };

        $scope.goalSelection = function (goal) {
            var goalData = $scope.workflowData['goals'];
            _.each(goalData, function (obj) {
                obj.name === goal ? obj.active = true : obj.active = false;
            })
        };

        $scope.toggleBtn = function (event) {
            var target = $(event.target);
            var parentElem = target.parents('.miniToggle')
            parentElem.find("label").removeClass('active');
            target.parent().addClass('active');
            target.attr("checked", "checked");
        };


        // Switch BTN Animation
        $('.btn-toggle').click(function () {
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-primary').size() > 0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-success').size() > 0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');
        });


        // Create AD Tab Animation
        $(".masterContainer").on('shown.bs.tab', '.leftNavLink', function (e) {
            $('.leftNavLink').parents("li").removeClass('active');
            $(this).parents('li').addClass('active');

            var target = $(this).attr('href');
            $("#myTabs").find(target + "-tab").closest("li").addClass("active");
            $(target).css('bottom', '-' + $(window).width() + 'px');
            var bottom = $(target).offset().bottom;
            $(target).css({bottom: bottom}).animate({"bottom": "0px"}, "10");
            $scope.$broadcast('closeAddCreativePage');
            $scope.$broadcast('switchPlatformFunc');

        });

        // Create Tag Slide Page
        $scope.showCreateNewWindow = function () {
            $("#formCreativeCreate")[0].reset();
            $scope.isAddCreativePopup = true;
            /*enable cancel, save button on load*/
            $scope.disableCancelSave = false;
            $(".newCreativeSlide .popCreativeLib").show().delay(300).animate({
                left: "50%",
                marginLeft: "-325px"
            }, 'slow');
            $("#creative").delay(300).animate({minHeight: "950px"}, 'slow');
        }

        // Buying Platform Slide Page
        $scope.showBuyingPlatformWindow = function () {
            $(".platform-custom").show().delay(300).animate({left: "50%", marginLeft: "-323px"}, 'slow');
            $(".offeringsWrap").hide();
        }
        $scope.frequencySelected = function (freqSelected) {
            $scope.selectedFreq = freqSelected;
        }
        function getfreqCapParams(formData) {
            var freq_cap = [];
            var budgetType = formData.budgetType.toLowerCase() === 'cost' ? 'Budget' : 'impressions';
            var targetType = budgetType.toLowerCase === 'budget' ? 'ALL' : 'PER_USER';
            if (formData.budgetAmount) {
                var freqDefaultCapObj = {'frequencyType': 'LIFETIME'};
                freqDefaultCapObj['quantity'] = Number(formData.budgetAmount);
                freqDefaultCapObj['capType'] = budgetType.toUpperCase();
                freqDefaultCapObj['pacingType'] = formData.pacingType;
                freqDefaultCapObj['targetType'] = 'ALL';
                freq_cap.push(freqDefaultCapObj);
            }
            var isSetCap = formData.setCap === 'true' ? true : false;
            if (isSetCap && formData.quantity) {
                var selectedfreqObj = {};
                selectedfreqObj['capType'] = "IMPRESSIONS";
                selectedfreqObj['frequencyType'] = formData.frequencyType.toUpperCase();
                selectedfreqObj['quantity'] = Number(formData.quantity);
                selectedfreqObj['targetType'] = "PER_USER";
                selectedfreqObj['pacingType'] = 'EVENLY';
                freq_cap.push(selectedfreqObj);
            }
            return freq_cap;
        }

        $scope.downloadTrackerUrls = function () {
            $scope.CampaignADsave(true);
            $scope.$watch('adId', function () {
                $scope.downloadingTracker = true;
                if ($scope.adId) {
                    var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + $scope.campaignId + '/ads/' + $scope.adId + '/creatives?format=csv';
                    dataService.downloadFile(url).then(function (response) {
                        if (response.status == "success") {
                            $scope.downloadingTracker = false;
                            saveAs(response.file, response.fileName)
                        } else {
                            $scope.downloadingTracker = false;
                        }
                    });
                }
            });

        }

        $scope.CampaignADsave = function (isDownloadTrackerClicked) {//console.log("ejwdewd",$scope.dayPartData);
            var formElem = $("#formAdCreate");
            var formData = formElem.serializeArray();
            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));//console.log(formData);
            if (formData.budgetAmount && $scope.formAdCreate.budgetAmount.$error.mediaCostValidator) {
                return false;
            }

            var customFieldErrorElem = $(".customFieldErrorMsg");
            if (customFieldErrorElem.length > 0) {
                $scope.partialSaveAlertMessage.message = "Mandatory fields need to be specified for the Ad";
                $scope.partialSaveAlertMessage.isErrorMsg = 1;
                $scope.partialSaveAlertMessage.isMsg = 1;
                $scope.msgtimeoutReset();
                //return false;
            } else {
                var creativesData = $scope.creativeData['creativeInfo'];
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                //postAdDataObj.state = $scope.workflowData['campaignData'].status;

                if (formData.adFormat)
                    postAdDataObj.adFormat = formData.adFormat.toUpperCase();

                if ($scope.editedAdSourceId)
                    postAdDataObj.sourceId = $scope.editedAdSourceId;

                if (formData.screens)
                    postAdDataObj.screens = _.pluck(JSON.parse(formData.screens), 'id');

                if (formData.goal)
                    postAdDataObj.goal = formData.goal;

                if (formData.startTime)
                    postAdDataObj.startTime = utils.convertToUTC(formData.startTime, 'ST');

                if (formData.endTime)
                    postAdDataObj.endTime = utils.convertToUTC(formData.endTime, 'ET');

                if ((!formData.startTime || !formData.endTime || !postAdDataObj.screens || !formData.adFormat || !formData.goal) && $scope.mode == 'edit' && $scope.isAdsPushed == true) {
                    $scope.partialSaveAlertMessage.message = "Mandatory fields need to be specified for the Ad";
                    $scope.partialSaveAlertMessage.isErrorMsg = 1;
                    $scope.partialSaveAlertMessage.isMsg = 1;
                    $scope.msgtimeoutReset();

                } else {
                    if (formData.unitCost) {
                        postAdDataObj.rateValue = formData.unitCost;
                        if (formData.unitCost && formData.unitType == "")
                            postAdDataObj.rateType = 'CPM';
                        else
                            postAdDataObj.rateType = formData.unitType;
                    }

                    if (getfreqCapParams(formData).length > 0) {
                        postAdDataObj.frequencyCaps = getfreqCapParams(formData);
                    }

                    if (formData.budgetType && formData.budgetAmount) {
                        postAdDataObj.budgetType = formData.budgetType
                        postAdDataObj.budgetValue = Number(formData.budgetAmount);
                    }

                    if (formData.platformId) {
                        postAdDataObj.platformId = Number(formData.platformId);
                        if ($scope.TrackingIntegrationsSelected) {
                            postAdDataObj.isTracking = true;
                        }
                    }

                    if (creativesData && creativesData.creatives) {
                        _.each(creativesData.creatives,
                            function (obj) {
                                obj['sizeId'] = obj.size.id;
                            });
                        postAdDataObj['creatives'] = _.pluck(creativesData.creatives, 'id');

                    }
                    if (!$scope.TrackingIntegrationsSelected) {
                        postAdDataObj['targets'] = {};
                        if ($scope.adData.geoTargetingData) {
                            var postGeoTargetObj = postAdDataObj['targets']['geoTargets'] = {}


                            var buildGeoTargetingParams = function (data, type) {
                                var obj = {};
                                obj['isIncluded'] = _.uniq(_.pluck(data, type + 'Included'))[0];
                                obj['geoTargetList'] = _.pluck(data, 'id');
                                return obj;
                            }

                            var geoTargetData = $scope.adData.geoTargetingData;
                            if (geoTargetData.regions.length > 0) {
                                postGeoTargetObj['REGION'] = buildGeoTargetingParams(geoTargetData.regions, 'regions');
                            }

                            if (geoTargetData.cities.length > 0) {
                                postGeoTargetObj["CITY"] = buildGeoTargetingParams(geoTargetData.cities, 'cities');
                            }

                            if (geoTargetData.dmas.length > 0) {
                                postGeoTargetObj["DMA"] = buildGeoTargetingParams(geoTargetData.dmas, 'dmas');
                            }

                            if ($scope.adData.geoTargetingData.zip.length > 0) {
                                var zipObj = $scope.adData.geoTargetingData.zip;
                                var zipPostArr = [];
                                _.each(zipObj, function (zipArr) {
                                    if (zipArr.added) {
                                        _.each(zipArr.added, function (obj) {
                                            var arr = obj.split("-");
                                            if (arr.length > 1) {
                                                var start = Number(arr[0]), end = Number(arr[1]);
                                                for (var i = start; i <= end; i++) {
                                                    zipPostArr.push(String(i));
                                                }
                                            } else {
                                                zipPostArr.push(arr[0]);
                                            }
                                        })
                                    }
                                })
                                postGeoTargetObj['ZIPCODE'] = {
                                    "isIncluded": true,
                                    "geoTargetList": zipPostArr

                                }
                            }
                        }

                        // audience segment
                        var selectedAudience = audienceService.getSelectedAudience();

                        if (selectedAudience) {
                            var segmentObj = postAdDataObj['targets']['segmentTargets'] = {};
                            segmentObj['segmentList'] = [];

                            for (var i = 0; i < selectedAudience.length; i++) {
                                segmentObj['segmentList'][i] = {};
                                segmentObj['segmentList'][i].segmentId = selectedAudience[i].id;
                                segmentObj['segmentList'][i].isIncluded = selectedAudience[i].isIncluded;
                            }
                            segmentObj.operation = audienceService.getAndOr().toUpperCase();

                        }
                        //DayPart Segment
                        var dayPart = audienceService.getDayPartdata();
                        if (dayPart) {
                            postAdDataObj['targets']['adDaypartTargets'] = dayPart;
                        }

                    }

                    if ($scope.adData.inventory && !$scope.TrackingIntegrationsSelected) {
                        var domainTargetObj = postAdDataObj['targets']['domainTargets'] = {};
                        domainTargetObj['inheritedList'] = {'ADVERTISER': $scope.adData.inventory.domainListId};
                        postAdDataObj['domainInherit'] = 'APPEND';
                        postAdDataObj['domainAction'] = $scope.adData.inventory.domainAction;
                    }
                    if (!$scope.TrackingIntegrationsSelected) {
                        if (!$.isEmptyObject($scope.postPlatformDataObj)) {
                            postAdDataObj['adPlatformCustomInputs'] = $scope.postPlatformDataObj;
                        }
                    }
                    campaignOverView.saveAds(postAdDataObj, isDownloadTrackerClicked)
                }
            }
        }

        $scope.saveCustomeFieldForPlatform = function () {
            var customFieldErrorElem = $(".customFieldErrorMsg");
            var customPlatformFormData = $("#customPlatformForm").serializeArray();
            $scope.postPlatformDataObj = [];
            if (customFieldErrorElem.length === 0 && customPlatformFormData.length > 1) {
                _.each(customPlatformFormData, function (data) {
                    var d = data.name.split("$$");
                    $scope.postPlatformDataObj.push({'platformCustomInputId': Number(d[1]), 'value': data.value});
                })
            } else {
                if ($scope.workflowData['adsData'] && $scope.workflowData['adsData'].adPlatformCustomInputs && $scope.workflowData['adsData'].adPlatformCustomInputs.length > 0) {
                    $scope.postPlatformDataObj = $scope.workflowData['adsData'].adPlatformCustomInputs;
                }
            }

            if ($scope.mode == 'edit')
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify($scope.postPlatformDataObj));

            //trigger targeting tab link
            $('.targetting-tab-link').trigger('click');
        };


        $scope.isPlatformSelected = false;

        $scope.changePlatform = function (platformId) {
            $scope.$broadcast('renderTargetingUI', platformId)
        };

        $scope.showPopup = function () {
            $scope.creativeListLoading = false
            $scope.creativesLibraryData['creativesData'] = [];
            if ($scope.selectedArr.length > 0) {
                $scope.unchecking = true;
            } else {
                $scope.unchecking = false;
            }
            $scope.$broadcast('showCreativeLibrary');
        };

        $scope.removeCreativeTags = function (clickedTagData, actionFrom) {
            var selectedCreativeTag = _.filter($scope.selectedArr, function (obj) {
                return obj.id === clickedTagData.id
            });
            $("#" + clickedTagData.id).removeAttr("checked");
            if (selectedCreativeTag.length > 0 && selectedCreativeTag)
                $scope.$broadcast('removeCreativeTags', [selectedCreativeTag, actionFrom]);
            else
                $scope.$broadcast('removeCreativeTags', [[clickedTagData], 'special']); //special case when we remove tag from selected list
        };

        //ad targets summary
        $scope.getSelectedAudience = function(){
            $scope.selectedAudience = audienceService.getSelectedAudience();
            return ($scope.selectedAudience)?$scope.selectedAudience.length:0;
        }

        $scope.getSelectedDays = function(){
            $scope.selectedDayParts['selected'] = audienceService.getDayTimeSelectedObj();
            $scope.selectedDayParts['data'] = audienceService.getDaytimeObj();
            return ($scope.selectedDayParts['data'])?$scope.selectedDayParts['data'].length:0;
        }

    });

    angObj.controller('CreativeTagController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $scope.emptyCreativesFlag = true;
        //$scope.mode = workflowService.getMode();
        $scope.loadingFlag = true; //loading flag
//        $scope.$parent.$watch('trackingIntegration', function(newValue) {
//        if($scope.$parent.trackingIntegration){
//                delete $scope.selectedArr;
//                $scope.sizeString = constants.WF_NOT_SET;
//                delete $scope.creativeData['creativeInfo'];
////delete $scope.selectedArr;
//        }
//
//        });

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

    angObj.controller('BudgetDeliveryController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location, $filter) {

        $scope.checkForPastDate = function (startDate, endDate) {
            var endDate = moment(endDate).format("MM/DD/YYYY");
            return moment().isAfter(endDate, 'day')
        };

        $scope.handleEndFlightDate = function (data) {
            var endDateElem = $('#endDateInput');
            var startDateElem = $('#startDateInput');

            var startDate = data.startTime;
            var endDate = data.endTime;
            var adsDate = JSON.parse(localStorage.getItem('adsDates'));
            if (!endDate && adsDate) { // if End Date is in Past
                var changeDate = endDate = adsDate.adEndDate;
                $scope.adData.endTime = changeDate;
                if (moment().isAfter(endDate)) {
                    endDateElem.datepicker("setStartDate", moment().format("MM/DD/YYYY"));
                }
            }
        };

        $scope.handleStartFlightDate = function (data) {
            var endDateElem = $('#endDateInput');
            var startDateElem = $('#startDateInput');

            var startDate = data.startTime;
            var endDate = data.endTime;

            var campaignEndTime = utils.convertToEST($scope.workflowData['campaignData'].endTime, "MM/DD/YYYY");
            var changeDate;
            if ($scope.mode !== 'edit') {
                endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
                if (startDate) {
                    endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                    changeDate = moment(startDate).format('MM/DD/YYYY')
                    endDateElem.datepicker("setStartDate", changeDate);
                    if (window.location.href.indexOf("adGroup") > -1) {
                        endDateElem.datepicker("setEndDate", utils.convertToEST(localStorage.getItem("edTime"), 'MM/DD/YYYY'));
                    } else {
                        endDateElem.datepicker("setEndDate", campaignEndTime);
                    }
                    endDateElem.datepicker("update", changeDate);
                }
            } else {
                changeDate = moment(startDate).format('MM/DD/YYYY');
                var adsDate = JSON.parse(localStorage.getItem('adsDates'));
                if (!startDate && adsDate) { // if start Date is in Past
                    changeDate = startDate = adsDate.adStartDate;
                    $scope.adData.startTime = changeDate;
                    if (moment().isAfter(endDate, 'day')) {
                        endDateElem.datepicker("setStartDate", moment().format("MM/DD/YYYY"));
                    }
                } else {
                    endDateElem.datepicker("setStartDate", changeDate);
                }

                if (moment(startDate).isAfter(endDate, 'day')) {
                    endDateElem.datepicker("update", changeDate);
                }
            }
        }

        $scope.setDateInEditMode = function (campaignStartTime, campaignEndTime) {
            var endDateElem = $('#endDateInput');
            var startDateElem = $('#startDateInput');

            var adsDate = JSON.parse(localStorage.getItem('adsDates'));
            var startDate, endDate;
            if (adsDate) {
                startDate = adsDate.adStartDate;
                endDate = adsDate.adEndDate;
            }
//            console.log("campaignStartTime", campaignStartTime);
//            console.log("startDate", startDate);
//            console.log("endDate", endDate);
//            console.log("campaignEndTime", campaignEndTime);
            if (campaignStartTime > startDate) {// ads start Date in Past
                startDateElem.datepicker("setStartDate", campaignStartTime);
            }
            if (startDate > campaignStartTime) {
                startDateElem.datepicker("update", startDate);
            }
            if (campaignEndTime >= endDate) {
                startDateElem.datepicker("setEndDate", campaignEndTime);
            }
            if (moment(endDate).isAfter(campaignEndTime, 'day')) {// ads start Date in Past
                endDateElem.datepicker("setEndDate", endDate);
                endDateElem.datepicker("setStartDate", endDate);
                endDateElem.datepicker("update", endDate);
            } else {
                endDateElem.datepicker("setStartDate", endDate);
                endDateElem.datepicker("setEndDate", campaignEndTime);
                endDateElem.datepicker("update", endDate);
            }
        };

        $scope.$parent.initiateDatePicker = function () {
            var endDateElem = $('#endDateInput');
            var startDateElem = $('#startDateInput');

            var startDateElem = $('#startDateInput');
            var endDateElem = $('#endDateInput');
            var campaignData = $scope.workflowData['campaignData'];
            var campaignStartTime = utils.convertToEST(campaignData.startTime, "MM/DD/YYYY");
            var campaignEndTime = utils.convertToEST(campaignData.endTime, "MM/DD/YYYY");
            if (moment().isAfter(campaignStartTime, 'day')) {
                campaignStartTime = moment().format('MM/DD/YYYY');
            }
            $scope.mode == 'edit' && endDateElem.removeAttr("disabled").css({'background': 'transparent'});
            if (window.location.href.indexOf("adGroup") > -1) {
                var adGroupStartDate = utils.convertToEST(localStorage.getItem("stTime"), 'MM/DD/YYYY');
                var adGroupEndDate = utils.convertToEST(localStorage.getItem("edTime"), 'MM/DD/YYYY');
                startDateElem.datepicker("setStartDate", adGroupStartDate);
                startDateElem.datepicker("setEndDate", adGroupEndDate);
                if ($scope.mode == 'edit') {
                    $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);
                } else {
                    startDateElem.datepicker("update", adGroupStartDate);
                }
            } else {
                startDateElem.datepicker("setStartDate", campaignStartTime);
                endDateElem.datepicker("setEndDate", campaignEndTime);
                if ($scope.mode == 'edit') {
                    $scope.setDateInEditMode(campaignStartTime, campaignEndTime);
                } else {
                    startDateElem.datepicker("setEndDate", campaignEndTime);
                    startDateElem.datepicker("update", campaignStartTime);
                }
            }
        };


    });

    angObj.controller('InventoryFiltersController', function ($scope, $window, $routeParams, constants, workflowService, Upload, $timeout, utils, $location) {

        $scope.prarentHandler = function (clientId, clientName, advertiserId, advertiserName) {
            $scope.clientId = clientId;
            $scope.advertiserId = advertiserId;
            InventoryFiltersView.getAdvertisersDomainList(clientId, advertiserId)
        };

        $scope.showDomainListPopup = false;


        $scope.inventoryAdsData = {};
        $scope.adData.inventoryName = '';

        var InventoryFiltersView = {
            getAdvertisersDomainList: function (clientId, advertiserId) {
                workflowService.getAdvertisersDomainList(clientId, advertiserId).then(function (result) {
                    $scope.workflowData['inventoryData'] = result.data.data;
                    if ($scope.mode === 'edit') {
                        $scope.$broadcast('updateInventory');
                    }
                });
            },
        }

        $scope.$on('updateInventory', function () {
            var responseData = workflowService.getAdsDetails();
            if (responseData.targets && responseData.targets.domainTargets && responseData.targets.domainTargets.inheritedList.ADVERTISER) {
                $scope.adData.inventory = $scope.workflowData['inventoryData'][0];
            }
        })

        $scope.selectFiles = function (files) {
            if (files != null && files.length > 0) {
                $scope.showDomainListPopup = true;
                $scope.adData.listName = $scope.adData.inventory && $scope.adData.inventory.name;
                $scope.files = files;
                if (!$scope.adData.inventory) {
                    $scope.adData.inventory = {};
                    $scope.adData.inventory.domainAction = 'INCLUDE';
                }
            }
        }

        $scope.uploadDomain = function () {
            var domainId = $scope.adData.inventory && $scope.adData.inventory.id || null;
            var files = $scope.files;
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (!file.$error) {
                        Upload.upload({
                            url: workflowService.createAdvertiseDomainList($scope.clientId, $scope.advertiserId, domainId),
                            fields: {
                                'name': $scope.adData.listName,
                                'domainAction': $scope.adData.inventory.domainAction,
                                'updatedAt': $scope.adData.inventory ? $scope.adData.inventory.updatedAt : ''
                            },
                            fileFormDataName: 'domainList',
                            file: file,
                            method: domainId ? 'PUT' : "POST"
                        }).progress(function (evt) {
                            $scope.domainUploadInProgress = true;
                        }).success(function (response, status, headers, config) {
                            var inventoryData = $scope.workflowData['inventoryData'];
                            _.each(inventoryData, function (obj, idx) {
                                if (obj.id === response.data.id) {
                                    inventoryData[idx] = response.data;
                                }
                            })
                            $scope.workflowData['inventoryData'] = inventoryData;
                            $scope.adData.inventory = response.data;
                            $scope.domainUploadInProgress = false;
                            $scope.showDomainListPopup = false;
                        });
                    }
                }
            }
        };
        $scope.sort = function () {
            $scope.sortDomain = !$scope.sortDomain;
            if ($(".common-sort-icon").hasClass('ascending')) {
                $(".common-sort-icon").removeClass('ascending');
                $(".common-sort-icon").addClass('descending');
            }
            else {
                $(".common-sort-icon").removeClass('descending');
                $(".common-sort-icon").addClass('ascending');
            }


        }


        $scope.closeDomainListPop = function () {
            $scope.showDomainListPopup = false;
        }

    });

})();
