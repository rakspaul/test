var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CampaignAdsCreateController', function ($scope, $rootScope, $window, $routeParams, $locale,
                                                               constants, workflowService, $timeout, utils, $location,
                                                               campaignListService, requestCanceller, $filter,
                                                               loginModel, $q, dataService, apiPaths, audienceService,
                                                               RoleBasedService, momentService, vistoconfig) {
        // Flag to denote that ad format has changed
        $scope.adFormatChanged = false;

        $scope.showDeleteConfirmationPopup = false;
        $scope.adCreateLoader = false;

        var winHeaderHeight = $(window).height() - 50,
            winHeight,

            saveDataInLocalStorage = function (data) {
                var campaignData = {
                    'advertiserId': data.advertiserId,
                    'advertiserName': data.advertiserName,
                    'clientId': data.clientId,
                    'clientName': data.clientName
                };

                localStorage.removeItem('campaignData');
                localStorage.setItem('campaignData', window.JSON.stringify(campaignData));
            },

            campaignOverView = {
                getCampaignData: function (campaignId) {
                    workflowService
                        .getCampaignData(campaignId)
                        .then(function (result) {
                            var responseData,
                                url;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                //redirect user to media plan list screen if new or edited ad is from archived campaign
                                if(responseData.isArchived){
                                    // url = vistoconfig.MEDIA_PLANS_LINK;
                                    // $location.url(url);
                                    $scope.redirectFlag = true;
                                    $timeout(function(){
                                        $scope.redirectUser(false)
                                    },4000);
                                }
                                $scope.workflowData.campaignData = responseData;
                                saveDataInLocalStorage(responseData);

                                if ($scope.workflowData.campaignData.selectedObjectives &&
                                    $scope.workflowData.campaignData.selectedObjectives.length > 0) {
                                    $scope.brandIcon =
                                        _.filter($scope.workflowData.campaignData.selectedObjectives, function (item) {
                                            return item.objective === 'Branding';
                                        });

                                    $scope.performanceIcon =
                                        _.filter($scope.workflowData.campaignData.selectedObjectives, function (item) {
                                            return item.objective === 'Performance';
                                        });
                                }

                                if ($scope.mode === 'edit') {
                                    if (!$scope.adGroupId) {
                                        workflowService
                                            .getAd({
                                                campaignId: $scope.campaignId,
                                                adId: $scope.adId
                                            })
                                            .then(function (result) {
                                                var url;

                                                $scope.getAd_result = result.data.data;
                                                //redirect user to campaingn overview screen if ad is archived
                                                if($scope.getAd_result.isArchived){
                                                    // url = 'mediaplan/'+$scope.campaignId+'/overview';
                                                    // $location.url(url);
                                                    $scope.redirectFlag = true;
                                                    $scope.archivedAdFlag = true;
                                                    $timeout(function(){
                                                        $scope.redirectUser(true);
                                                    },4000);
                                                }
                                                disablePauseEnableResume($scope.getAd_result);
                                                processEditMode(result);
                                            });
                                    } else {
                                        workflowService
                                            .getDetailedAdsInAdGroup($scope.campaignId, $scope.adGroupId, $scope.adId)
                                            .then(function (result) {
                                                // $scope.getAdResult = result.data.data;
                                                // disablePauseEnableResume($scope.getAdResult);
                                                $scope.getAd_result = result.data.data;
                                                //redirect user to campaingn overview screen if ad is archived
                                                if($scope.getAd_result.isArchived){
                                                    $scope.redirectFlag = true;
                                                    $scope.archivedAdFlag = true;
                                                    $timeout(function(){
                                                        $scope.redirectUser(true);
                                                    },4000);
                                                }
                                                disablePauseEnableResume($scope.getAd_result);
                                                processEditMode(result);
                                            });

                                        workflowService
                                            .getAdgroups($scope.campaignId)
                                            .then(function (result) {
                                                var responseData,
                                                    adGroupData = {},
                                                    n,
                                                    i;

                                                if (result.status === 'OK' || result.status === 'success') {
                                                    responseData = result.data.data;
                                                    $scope.workflowData.campaignGetAdGroupsData = responseData;
                                                    n = responseData.length;
                                                    for (i = 0; i < n; i++) {
                                                        if (responseData[i].adGroup.id === $scope.adGroupId) {
                                                            adGroupData.startDate =
                                                                momentService
                                                                    .utcToLocalTime(responseData[i].adGroup.startTime);
                                                            adGroupData.endDate =
                                                                momentService
                                                                    .utcToLocalTime(responseData[i].adGroup.endTime);
                                                        }
                                                    }
                                                    $scope.workflowData.adGroupData = adGroupData;
                                                } else {
                                                    campaignOverView.errorHandler(result);
                                                }
                                            }, campaignOverView.errorHandler);
                                    }
                                } else {
                                    $scope.initiateDatePicker();
                                }
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                fetchGoals: function () {
                    $scope.workflowData.goals = [
                        {id: 1, name: 'Performance', active: true},
                        {id: 2, name: 'Brand', active: false}
                    ];
                    //default value
                    $scope.adData.goal = 'Performance';
                },

                fetchPrimaryKpis: function () {
                    $scope.workflowData.primaryKpi = [
                        {
                            kpiCategory: 'DELIVERY',
                            kpiValues: [
                                {id: 1, name: 'Impressions', disabled: false},
                                {id: 2, name: 'Impressions within demographic', disabled: true},
                                {id: 3, name: 'Viewable Impressions', disabled: true},
                                {id: 4, name: 'Clicks', disabled: false},
                                {id: 5, name: 'Actions', disabled: false}
                            ]
                        },
                        {
                            kpiCategory: 'PERFORMANCE',
                            kpiValues: [
                                {id: 1, name: 'Clickthrough Rate', disabled: false},
                                {id: 2, name: 'Cost Per Click', disabled: false},
                                {id: 3, name: 'Cost Per Action', disabled: true},
                                // id 4 is not working due to some problem please debug if you can
                                {id: 5, name: 'Viewabilty Rate', disabled: false},
                                {id: 6, name: 'In-Demo Rate', disabled: true}
                            ]
                        }
                    ];
                },

                fetchAdFormats: function () {
                    $scope.workflowData.adFormats = [
                        {id: 1, name: 'Display', active: true},
                        {id: 2, name: 'Video', active: false},
                        {id: 3, name: 'Rich Media', active: false},
                        {id: 4, name: 'Social', active: false}
                    ];
                    //default value
                    $scope.adData.adFormat = 'Display';
                },

                fetchScreenType: function () {
                    if ($scope.mode !== 'edit') {
                        $scope.workflowData.screenTypes = [
                            {id: 1, name: 'Desktop', active: true},
                            {id: 2, name: 'Mobile', active: false},
                            {id: 3, name: 'Tablet', active: false}
                        ];
                        //default value
                        $scope.adData.screenTypes = [{id: 1, name: 'Desktop', active: true}];
                    } else {
                        $scope.workflowData.screenTypes = [
                            {id: 1, name: 'Desktop', active: false},
                            {id: 2, name: 'Mobile', active: false},
                            {id: 3, name: 'Tablet', active: false}
                        ];
                        //default value
                        $scope.adData.screenTypes = [];
                    }
                },

                fetchUnitTypes: function () {
                    $scope.workflowData.unitTypes = [
                        {id: 1, name: 'CPM'},
                        {id: 2, name: 'CPC'},
                        {id: 3, name: 'CPA'}
                    ];
                    $scope.adData.unitType = $scope.workflowData.unitTypes[0];
                },

                saveTrackerFile : function() {
                    var clientId, url;

                    if ($scope.adId) {
                        clientId = loginModel.getSelectedClient().id;
                        url = apiPaths.WORKFLOW_API_URL +
                            '/clients/' + clientId +
                            '/campaigns/' + $scope.campaignId +
                            '/ads/' + $scope.adId +
                            '/creatives?format=csv';

                        dataService
                            .downloadFile(url)
                            .then(function (response) {
                                if (response.status === 'success') {
                                    $scope.downloadingTracker = false;
                                    saveAs(response.file, response.fileName);
                                } else {
                                    $scope.downloadingTracker = false;
                                }
                            });
                    }
                },

                saveAds: function (postDataObj, isDownloadTrackerClicked) {
                    var promiseObj;

                    //save adGroup Ad
                    if (window.location.href.indexOf('adGroup') > -1) {
                        postDataObj.adGroupId = $scope.adGroupId;
                    }

                    if ($scope.adId) {
                        postDataObj.adId = $scope.adId;
                        postDataObj.updatedAt = $scope.updatedAt;
                        postDataObj.state = $scope.state;

                    }

                    promiseObj = $scope.adId ?
                        workflowService.updateAd(postDataObj) :
                        workflowService.createAd(postDataObj);
                    promiseObj.then(function (result) {
                        var responseData = result.data.data,
                            url;

                        $scope.adCreateLoader = false;
                        //$('.workflowPreloader, .workflowPreloader .adSavePre').hide();
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.state = responseData.state;
                            $scope.adId = responseData.id;
                            $scope.updatedAt = responseData.updatedAt;

                            if (!isDownloadTrackerClicked) {
                                $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_SUCCESS, 0);
                                localStorage.setItem('adPlatformCustomInputs',
                                    window.JSON.stringify(responseData.adPlatformCustomInputs));
                                url = '/mediaplan/' + result.data.data.campaignId + '/overview';
                                $location.url(url);
                                localStorage.setItem('topAlertMessage', $scope.textConstants.AD_CREATED_SUCCESS);
                            }

                            if(isDownloadTrackerClicked) {
                                campaignOverView.saveTrackerFile();
                            }
                        } else {
                            $scope.downloadingTracker = false;
                            $rootScope.setErrAlertMessage(responseData.message);
                        }
                    }, function (errorObj) {
                        $scope.downloadingTracker = false;
                        $scope.abc = $scope.textConstants.PARTIAL_AD_SAVE_FAILURE;
                        $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_FAILURE);
                    });
                },

                // Function to get creatives for list view
                getTaggedCreatives: function (campaignId, adId) {
                    workflowService
                        .getTaggedCreatives(campaignId, adId)
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                if (responseData.creatives.length > 0) {
                                    $scope.emptyCreativesFlag = false;
                                } else {
                                    $scope.emptyCreativesFlag = true;
                                }
                                $scope.creativeData.creativeInfo = responseData;
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                errorHandler: function (errData) {
                    if (errData.data.status === 404) {
                        $location.url('/mediaplans');
                    }
                    console.log(errData);
                }
            };

        // Flag to denote that ad format has changed
        $scope.adFormatChanged = false;

        $scope.showDeleteConfirmationPopup = false;
        $scope.adCreateLoader = false;

        $scope.deleteTargets = function (type, event) {
            var elem = $(event.target),
                leftPos = elem.closest('.cardSelectHolder').offset().left -
                          elem.closest('.setTargetOptions').offset().left;

            elem
                .closest('.setTargetOptions')
                .find('.msgPopup')
                .css('left', leftPos);

            $scope.showDeleteConfirmationPopup = true;
            $scope.deleteType = type;
        };

        $scope.redirectUser = function(isAdArchived){
            $scope.redirectFlag = false;
            $scope.archivedAdFlag = false;
            $scope.archivedCampaignFlag = false;
            if(isAdArchived){
                if($scope.workflowData.campaignData.isArchived){
                    var url = vistoconfig.MEDIA_PLANS_LINK;
                    $location.url(url);
                }else{
                    $scope.redirectFlag = false;
                    $scope.archivedAdFlag = false;
                    var url = 'mediaplan/'+$scope.campaignId+'/overview';
                    $location.url(url);
                }

            }
            else{
                var url = vistoconfig.MEDIA_PLANS_LINK;
                $location.url(url);
            }

        }

        $scope.deleteTargetting = function () {
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
            if ($scope.deleteType === 'AUDIENCE') {
                $scope.deleteAudienceTargetting();
            } else if ($scope.deleteType === 'GEO') {
                $scope.deleteGeoTargetting();
            } else if ($scope.deleteType === 'DAYPART') {
                $scope.deleteDayPartTargetting();
            }
        };

        $scope.cancelTargettingDelete = function () {
            $scope.deleteType = '';
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
        };

        $scope.deleteAudienceTargetting = function () {
            $scope.selectedAudience.length = 0;
            $scope.adData.isAudienceSelected = null;
        };

        $scope.deleteDayPartTargetting = function () {
            $scope.selectedDayParts.data.length = 0;
            $scope.$broadcast('deleteDayPartTarget');
        };

        $scope.deleteGeoTargetting = function () {
            $scope.$broadcast('deleteGeoTarget');
        };

        // This sets dynamic width to line to take 100% height
        function colResize() {
            winHeight = $(window).height() - 110;
            $('.campaignAdCreateWrap, .campaignAdCreatePage, .left_column_nav').css('min-height', winHeight + 'px');
            $('.adStepOne .tab-pane').css('min-height', winHeight - 30 + 'px');
            $('.targetingSlide .tab-pane').css('min-height', winHeight - 130 + 'px');
            $('.dayTargetLower').css('min-height', winHeight - 290 + 'px');
        }

        //edit mode data population
        function processEditMode(result, startDateElem) {
            var responseData = result.data.data,
                format,
                budgetElem,
                dateObj,
                index,
                idx,
                i;

            $scope.workflowData.adsData = responseData;

            if (responseData.adPlatformCustomInputs) {
                localStorage.setItem(
                    'adPlatformCustomInputs',
                    window.JSON.stringify(responseData.adPlatformCustomInputs)
                );
            }

            workflowService.setAdsDetails(angular.copy(responseData));
            $scope.updatedAt = responseData.updatedAt;
            $scope.state = responseData.state;

            if (responseData.sourceId) {
                $scope.editedAdSourceId = responseData.sourceId;
            }

            if (responseData.name) {
                $scope.adData.adName = responseData.name;
            }

            if (responseData.adFormat) {
                format = $filter('toTitleCase')(responseData.adFormat);
                if (format === 'Richmedia') {
                    format = 'Rich Media';
                }
                $scope.adFormatSelection(format, '', 'editData');
                $scope.adData.adFormat = format;
            }

            if (responseData.goal) {
                $scope.adData.primaryKpi = responseData.goal;
            }

            if (responseData.screens) {
                for (i = 0; i < responseData.screens.length; i++) {
                    index = _.findIndex($scope.workflowData.screenTypes, function (item) {
                        return item.id === responseData.screens[i].id;
                    });

                    $scope.workflowData.screenTypes[index].active = true;
                    $scope.screenTypeSelection($scope.workflowData.screenTypes[index]);
                }
            }

            //budget tab
            if (responseData.budgetType) {
                if (responseData.budgetType.toLowerCase() === 'cost') {
                    $scope.adData.budgetType = $filter('toTitleCase')(responseData.budgetType);
                } else {
                    $scope.adData.budgetType = $filter('toTitleCase')(responseData.budgetType);
                    $scope.adData.budgetTypeLabel = $scope.adData.budgetType;
                }

                if ($scope.adData.budgetType) {
                    budgetElem = $('.budget_' + $scope.adData.budgetType.toLowerCase());
                }

                if (budgetElem.length > 0) {
                    budgetElem
                        .closest('div.miniToggle')
                        .find('label')
                        .removeClass('active');
                    budgetElem
                        .addClass('active')
                        .find('input')
                        .attr('checked', 'checked');
                }
            }

            dateObj = {};

            if (responseData.startTime) {
                $scope.adData.startTime = momentService.utcToLocalTime(responseData.startTime);
                dateObj.adStartDate = $scope.adData.startTime;
            }

            if (responseData.endTime) {
                $scope.adData.endTime = momentService.utcToLocalTime(responseData.endTime);
                dateObj.adEndDate = $scope.adData.endTime;
            }

            localStorage.setItem('adsDates', window.JSON.stringify(dateObj));
            $scope.initiateDatePicker();

            if (responseData.rateValue !== '') {
                $scope.adData.unitCost = responseData.rateValue;
            }

            if (responseData.budgetValue) {
                $scope.adData.budgetAmount = responseData.budgetValue;
            }

            if (responseData.rateType) {
                idx = _.findIndex($scope.workflowData.unitTypes, function (item) {
                    return item.name === responseData.rateType;
                });

                // cpm ..... dropdown
                $scope.adData.unitType = $scope.workflowData.unitTypes[idx];
                $('#unitcostType')
                    .parents('.dropdown')
                    .find('.btn')
                    .html($scope.adData.unitType.name + ' <span class="icon-arrow-down"></span>');
            }

            $('.cap_no input').attr('checked', 'checked');
            $('.spend_evenly input').attr('checked', 'checked');

            if (responseData.frequencyCaps && responseData.frequencyCaps.length >= 1) {
                angular.forEach(responseData.frequencyCaps, function (frequencyCap) {
                    var pacingType,
                        freqType;

                    if (frequencyCap.targetType === 'ALL') {
                        pacingType = frequencyCap.pacingType;
                        if (pacingType !== 'EVENLY') {
                            $('.spend_asap').addClass('active');
                            $('.spend_asap input').attr('checked', 'checked');
                            $('.spend_evenly').removeClass('active');
                        }
                    }

                    if (frequencyCap.targetType === 'PER_USER') {
                        $scope.adData.setCap = true;
                        $('.cap_yes').addClass('active');
                        $('.cap_no').removeClass('active');
                        $('.cap_yes input').attr('checked', 'checked');
                        $scope.adData.quantity = frequencyCap.quantity;
                        $scope.capsPeriod = frequencyCap.frequencyType;
                        freqType = frequencyCap.frequencyType;

                        if (freqType === 'LIFETIME') {
                            $scope.selectedFreq = 'Lifetime';
                        } else if (freqType === 'DAILY') {
                            $scope.selectedFreq = 'Daily';
                        }
                    }
                });
            }

            //platform tab
            if (responseData.platform) {
                if (responseData.sourceId) {
                    $scope.isAdsPushed = true;
                }

                if (responseData.isTracking) {
                    $scope.TrackingIntegrationsSelected = true;
                }
            }

            $scope.$broadcast('updatePlatform', [responseData.platform]);

            // creative tags
            if (responseData.creatives) {
                $scope.selectedArr = responseData.creatives;
            }

            $scope.$broadcast('updateCreativeTags');

            if (responseData.targets &&
                responseData.targets.geoTargets &&
                _.size(responseData.targets.geoTargets) > 0
            ) {
                $scope.selectedTargeting = {};
                $scope.selectedTargeting.geography = true;
                $timeout(function () {
                    $scope.$broadcast('updateGeoTagName');
                }, 2000);
            }

            //day part edit
            if (responseData.targets &&
                responseData.targets.adDaypartTargets &&
                _.size(responseData.targets.adDaypartTargets) > 0
            ) {
                $timeout(function () {
                    $scope.$broadcast('UpdateDayPart');
                }, 2000);
            }

            //audience targeting load
            if (responseData.targets && responseData.targets.segmentTargets &&
                _.size(responseData.targets.segmentTargets) > 0
            ) {
                $timeout(function () {
                    $scope.$broadcast('triggerAudienceLoading');
                }, 2000);
            }
        }

        function disablePauseEnableResume(getAdResultData) {
            $scope.disableResume = 'disabled';

            if ((getAdResultData.state === 'IN_FLIGHT' || getAdResultData.state === 'SCHEDULED' ) &&
                !(getAdResultData.isTracking)
            ) {
                // do not let Ad to pause if tracking
                // enable pause button
                $scope.disablePause = '';
            } else {
                //disable pause button
                $scope.disablePause = 'disabled';
            }

            if (getAdResultData.state === 'PAUSED') {
                //$scope.disablePause='disabled';
                //enable resume if ad is paused
                $scope.disableResume = '';
            }
        }

        function getfreqCapParams(formData) {
            var freqCap = [],
                budgetType = formData.budgetType.toLowerCase() === 'cost' ? 'Budget' : 'impressions',
                targetType = budgetType.toLowerCase === 'budget' ? 'ALL' : 'PER_USER',
                isSetCap,
                freqDefaultCapObj,
                selectedFreqObj;

            if (formData.budgetAmount) {
                freqDefaultCapObj = {'frequencyType': 'LIFETIME'};
                freqDefaultCapObj.quantity = Number(formData.budgetAmount);
                freqDefaultCapObj.capType = budgetType.toUpperCase();
                freqDefaultCapObj.pacingType = formData.pacingType;
                freqDefaultCapObj.targetType = 'ALL';
                freqCap.push(freqDefaultCapObj);
            }

            isSetCap = formData.setCap ? true : false;

            if (isSetCap && formData.quantity) {
                selectedFreqObj = {};
                selectedFreqObj.capType = 'IMPRESSIONS';
                selectedFreqObj.frequencyType = formData.frequencyType.toUpperCase();
                selectedFreqObj.quantity = Number(formData.quantity);
                selectedFreqObj.targetType = 'PER_USER';
                selectedFreqObj.pacingType = 'EVENLY';
                freqCap.push(selectedFreqObj);
            }

            return freqCap;
        }

        $scope.editCampaign = function (workflowCampaignData) {
            $location.url('/mediaplan/' + workflowCampaignData.id + '/edit');
        };

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date, format);
        };

        $scope.archiveAd = function (event) {
            var errorAchiveAdHandler;

            $scope.adArchiveLoader = true;
            errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $scope.adArchiveLoader = false;
                $rootScope.setErrAlertMessage(constants.WF_AD_ARCHIVE_FAILURE);
            };

            workflowService
                .deleteAd($scope.campaignId, $scope.adId)
                .then(function (result) {
                    var url;

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.adArchive = false;
                        $scope.adArchiveLoader = false;
                        url = '/mediaplan/' + $scope.campaignId + '/overview';
                        $location.url(url);
                        localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_ARCHIVE_SUCCESS);
                    } else {
                        errorAchiveAdHandler();
                    }
                }, errorAchiveAdHandler);
        };

        $scope.pauseAd = function () {
            var errorAchiveAdHandler = function () {
                    $scope.adArchive = false;
                    $rootScope.setErrAlertMessage($scope.textConstants.WF_AD_PAUSE_FAILURE);
                },

                pauseAdDataObj = {
                    name: $scope.getAdResult.name,
                    id: $scope.getAdResult.id,
                    campaignId: $scope.getAdResult.campaignId,
                    updatedAt: $scope.getAdResult.updatedAt
                };

            workflowService
                .pauseAd(pauseAdDataObj)
                .then(function (result) {
                    var url;

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.adArchive = false;
                        url = '/mediaplan/' + $scope.campaignId + '/overview';
                        $location.url(url);
                        localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_PAUSE_SUCCESS);
                    } else {
                        errorAchiveAdHandler();
                    }
                }, errorAchiveAdHandler);
        };

        $scope.resumeAd = function () {
            var errorAchiveAdHandler = function () {
                    $scope.adArchive = false;
                    $rootScope.setErrAlertMessage($scope.textConstants.WF_AD_RESUME_FAILURE);
                },

                resumeAdDataObj = {
                    name: $scope.getAdResult.name,
                    id: $scope.getAdResult.id,
                    campaignId: $scope.getAdResult.campaignId,
                    updatedAt: $scope.getAdResult.updatedAt
                };

            workflowService
                .resumeAd(resumeAdDataObj)
                .then(function (result) {
                    var url;

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.adArchive = false;
                        url = '/mediaplan/' + $scope.campaignId + '/overview';
                        $location.url(url);
                        localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_RESUME_SUCCESS);
                    } else {
                        errorAchiveAdHandler();
                    }
                }, errorAchiveAdHandler);
        };

        $scope.numbersOnly = function (scopeVar) {
            if (scopeVar === 'budgetAmount') {
                $scope.adData.budgetAmount = $scope.adData.budgetAmount.replace($scope.numberOnlyPattern, '');
            }

            if (scopeVar === 'quantity') {
                $scope.adData.quantity = $scope.adData.quantity.replace($scope.numberOnlyPattern, '');
            }
        };

        $scope.cancelAdArchive = function () {
            $scope.adArchive = !$scope.adArchive;
        };

        $scope.cancelAdPause = function () {
            if ($scope.disablePause !== 'disabled') {
                $scope.adPause = !$scope.adPause;
            }
        };

        $scope.cancelAdResume = function () {
            $scope.resumeMessage =
                'Resume delivery for flight dates ' +
                momentService.utcToLocalTime($scope.getAdResult.startTime, 'DD MMM YYYY') +
                ' to ' +
                momentService.utcToLocalTime($scope.getAdResult.endTime, 'DD MMM YYYY') +
                ' ?';

            if ($scope.disableResume !== 'disabled') {
                $scope.adResume = !$scope.adResume;
            }
        };

        $scope.resetPartialSaveAlertMessage = function () {
            $rootScope.setErrAlertMessage('', 0);
        };

        $scope.dropBoxItemSelected = function (item, type, event) {
            if (item.name === 'CPC') {
                $scope.adData.budgetTypeLabel = 'Clicks';
            } else if (item.name === 'CPA') {
                $scope.adData.budgetTypeLabel = 'Actions';
            } else {
                $scope.adData.budgetTypeLabel = 'Impressions';
            }
            if ($scope.adData.budgetType && $scope.adData.budgetType.toLowerCase() !== 'cost') {
                $scope.adData.budgetType = $scope.adData.budgetTypeLabel;
            }
            $scope.adData[type] = item;
        };

        $scope.ShowHide = function (obj) {
            $scope.IsVisible = $scope.IsVisible ? false : true;
            $scope.creativeObj = obj;
        };

        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {
                'display': 'image',
                'video': 'video',
                'rich media': 'rich-media',
                'social': 'social'
            };

            return adFormatMapper[adFormat.toLowerCase()];
        };

        $scope.getScreenTypeIconName = function (screenType) {
            var screenTypeMapper = {
                'desktop': 'desktop',
                'mobile': 'mobile',
                'tablet': 'tablet'
            };

            return screenTypeMapper[screenType.toLowerCase()];
        };

        $scope.getGoalIconName = function (goal) {
            var goalMapper = {
                'performance': 'performance',
                'brand': 'brand'
            };

            return goalMapper[goal.toLowerCase()];
        };

        $scope.getPlatformIconName = function (platform) {
            var platformMapper = {
                'visto bidder': 'Visto_fav_icon',
                'visto bidder - test': 'Visto_fav_icon',
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
                'dorado-tracking': 'Visto_fav_icon',
                'dbm-tracking': 'doubleclick-DFP'
            };

            if (platform) {
                return platformMapper[platform.toLowerCase()];
            }
        };

        $scope.getPlatformDesc = function (platform) {
            var platformMapper = {
                'collective bidder': 'The programmactic solution for all screens and format.',
                'appnexus': 'The programmactic solution for all screens and formats',
                'facebook': 'All-in-one customer<br>support application',
                'dbm': 'All-in-one customer<br>support application',
                'dfp': 'A revenue management<br>solution for publishers'
            };

            return platformMapper[platform.toLowerCase()];
        };

        $scope.utc = function (date) {
            return moment(date).utc().valueOf();
        };

        $scope.screenTypeSelection = function (screenTypeObj) {
            var screenTypeFound = _.filter($scope.adData.screenTypes, function (obj) {
                    return obj.name === screenTypeObj.name;
                }),
                idx,
                k;

            if (screenTypeFound.length > 0) {
                for (k in $scope.adData.screenTypes) {
                    if ($scope.adData.screenTypes[k].name === screenTypeObj.name) {
                        idx = k;
                    }
                }
                $scope.adData.screenTypes.splice(idx, 1);
            } else {
                $scope.adData.screenTypes.push(screenTypeObj);
            }
        };

        $scope.changeAdFormatContinue = function () {
            var adFormatsData,
                videoKpiObj,
                index;

            $scope.changeAdFormat = false;

            // code to make creatives already set to empty
            //$scope.adData.setSizes = constants.WF_NOT_SET;
            //$scope.creativeData.creativeInfo = 'undefined';
            //$scope.selectedArr.length = 0;
            $scope.resetCreatives();

            // Flag to denote that ad format has changed
            $scope.adFormatChanged = true;

            // left nav
            $scope.adData.adFormat = $scope.adformatName;

            // adFormatSelection code
            $scope.$broadcast('adFormatChanged', $scope.adformatName);
            adFormatsData = $scope.workflowData.adFormats;
            _.each(adFormatsData, function (obj) {
                obj.name === $scope.adformatName ? obj.active = true : obj.active = false;
            });

            videoKpiObj = {
                id: 4,
                name: 'View to Completion'
            };

            $scope.adData.primaryKpi = '';

            if ($scope.adData.adFormat === 'Video') {
                $scope.workflowData.primaryKpi[1].kpiValues.push(videoKpiObj);
            } else {
                index = _.findIndex($scope.workflowData.primaryKpi[1].kpiValues, function (item) {
                    return item.id === videoKpiObj.id;
                });
                if (index > 0) {
                    $scope.workflowData.primaryKpi[1].kpiValues =
                        $scope.workflowData.primaryKpi[1].kpiValues.slice(0, index);
                }
            }
        };

        $scope.changeAdFormatCancel = function () {
            $scope.changeAdFormat = false;
        };

        $scope.adFormatSelection = function (adformatName, event, editdata) {
            var offset,
                left,
                top,
                relativeX,
                adFormatsData;

            // If clicking on active button, don't do anything.
            if (event && event.target.attributes.checked) {
                return;
            }

            if (editdata !== 'editData') {
                $scope.adformatName = adformatName;

                if ($scope.selectedArr.length > 0) {
                    $scope.changeAdFormat = true;
                } else {
                    $scope.changeAdFormatContinue();
                }

                if (event) {
                    offset = $(event.target).offset();
                    left = offset.left;
                    top = offset.top;
                    relativeX = left - $(event.target).closest('.goalBtnWithPopup').offset().left - 110;
                    $('.goalBtnWithPopup .popUpCue').css({left: relativeX});
                }
            } else {
                // populating first time in editmode
                $scope.adformatName = adformatName;
                $scope.$broadcast('adFormatChanged', $scope.adformatName);

                adFormatsData = $scope.workflowData.adFormats;
                _.each(adFormatsData, function (obj) {
                    obj.name === $scope.adformatName ? obj.active = true : obj.active = false;
                });
            }
        };

        $scope.goalSelection = function (goal) {
            var goalData = $scope.workflowData.goals;

            _.each(goalData, function (obj) {
                obj.name === goal ? obj.active = true : obj.active = false;
            });
        };

        $scope.toggleBtn = function (event) {
            var target = $(event.target),
                parentElem = target.parents('.miniToggle');

            parentElem.find('label').removeClass('active');
            target.parent().addClass('active');
            target.attr('checked', 'checked');
        };

        // Create Tag Slide Page
        $scope.showCreateNewWindow = function () {
            $('#formCreativeCreate')[0].reset();
            $scope.isAddCreativePopup = true;

            // enable cancel, save button on load
            $scope.disableCancelSave = false;

            $('.newCreativeSlide .popCreativeLib')
                .show()
                .delay(300)
                .animate({
                    left: '50%',
                    marginLeft: '-325px'
                }, 'slow');

            $('#creative')
                .delay(300)
                .animate({minHeight: '950px'}, 'slow');
        };

        // Buying Platform Slide Page
        $scope.showBuyingPlatformWindow = function () {
            $('.platform-custom')
                .show()
                .delay(300)
                .animate({
                    left: '50%',
                    marginLeft: '-323px'
                }, 'slow');
            $('.offeringsWrap').hide();
        };

        $scope.frequencySelected = function (freqSelected) {
            $scope.selectedFreq = freqSelected;
        };


        $scope.campaignAdSave = function (isDownloadTrackerClicked) {
            var formElem = $('#formAdCreate'),
                formData = formElem.serializeArray(),
                customFieldErrorElem,
                creativesData,
                postAdDataObj,
                postGeoTargetObj,
                buildGeoTargetingParams,
                geoTargetData,
                zipObj,
                zipPostArr,
                selectedAudience,
                segmentObj,
                dayPart,
                domainTargetObj,
                i;

            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));

            if ((formData.budgetAmount &&
                $scope.formAdCreate.budgetAmount.$error.mediaCostValidator) ||
                ($scope.budgetErrorObj.mediaCostValidator ||
                $scope.budgetErrorObj.availableRevenueValidator ||
                $scope.budgetErrorObj.impressionPerUserValidator ||
                $scope.budgetErrorObj.availableMaximumAdRevenueValidator)) {
                $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                return false;
            }

            customFieldErrorElem = $('.customFieldErrorMsg');

            if (customFieldErrorElem.length > 0) {
                $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                return false;
            } else {
                //$('.workflowPreloader, .workflowPreloader .adSavePre').show();
                creativesData = $scope.creativeData.creativeInfo;
                postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);

                if (formData.adFormat) {
                    postAdDataObj.adFormat = formData.adFormat.replace(/\s+/g, '').toUpperCase();
                }

                if ($scope.editedAdSourceId) {
                    postAdDataObj.sourceId = $scope.editedAdSourceId;
                }

                if (formData.screens) {
                    postAdDataObj.screens = _.pluck(JSON.parse(formData.screens), 'id');
                }

                if (formData.goal) {
                    postAdDataObj.goal = formData.goal;
                }

                if (formData.startTime) {
                    postAdDataObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');
                }

                if (formData.endTime) {
                    postAdDataObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');
                }

                if ((
                        !formData.startTime ||
                        !formData.endTime ||
                        !postAdDataObj.screens ||
                        !formData.adFormat ||
                        !formData.goal
                    ) &&
                    $scope.mode === 'edit' &&
                    $scope.isAdsPushed === true
                ) {
                    $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                } else {
                    if(!isDownloadTrackerClicked) {
                        $scope.adCreateLoader = true;
                    }

                    if (formData.unitCost) {
                        postAdDataObj.rateValue = formData.unitCost;

                        if (formData.unitCost && formData.unitType === '') {
                            postAdDataObj.rateType = 'CPM';
                        } else {
                            postAdDataObj.rateType = formData.unitType;
                        }
                    }

                    if (getfreqCapParams(formData).length > 0) {
                        postAdDataObj.frequencyCaps = getfreqCapParams(formData);
                    }

                    if (formData.budgetType && formData.budgetAmount) {
                        postAdDataObj.budgetType = formData.budgetType;
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
                                obj.sizeId = obj.size.id;
                            });

                        postAdDataObj.creatives = _.pluck(creativesData.creatives, 'id');
                    }

                    if (!$scope.TrackingIntegrationsSelected) {
                        postAdDataObj.targets = {};

                        if ($scope.adData.geoTargetingData) {
                            postGeoTargetObj = postAdDataObj.targets.geoTargets = {};
                            buildGeoTargetingParams = function (data, type) {
                                var obj = {};

                                obj.isIncluded = _.uniq(_.pluck(data, type + 'Included'))[0];
                                obj.geoTargetList = _.pluck(data, 'id');

                                return obj;
                            };

                            geoTargetData = $scope.adData.geoTargetingData;

                            if (geoTargetData.regions.length > 0) {
                                postGeoTargetObj.REGION = buildGeoTargetingParams(geoTargetData.regions, 'regions');
                            }

                            if (geoTargetData.cities.length > 0) {
                                postGeoTargetObj.CITY = buildGeoTargetingParams(geoTargetData.cities, 'cities');
                            }

                            if (geoTargetData.dmas.length > 0) {
                                postGeoTargetObj.DMA = buildGeoTargetingParams(geoTargetData.dmas, 'dmas');
                            }

                            if ($scope.adData.geoTargetingData.zip.length > 0) {
                                zipObj = $scope.adData.geoTargetingData.zip;
                                zipPostArr = [];

                                _.each(zipObj, function (zipArr) {
                                    if (zipArr.added) {
                                        _.each(zipArr.added, function (obj) {
                                            var arr = obj.split('-');
                                            if (arr.length > 1) {
                                                var start = Number(arr[0]), end = Number(arr[1]);
                                                for (var i = start; i <= end; i++) {
                                                    zipPostArr.push(String(i));
                                                }
                                            } else {
                                                zipPostArr.push(arr[0]);
                                            }
                                        });
                                    }
                                });

                                postGeoTargetObj.ZIPCODE = {
                                    'isIncluded': true,
                                    'geoTargetList': zipPostArr
                                };
                            }
                        }

                        // audience segment
                        selectedAudience = audienceService.getSelectedAudience();
                        if (selectedAudience) {
                            segmentObj = postAdDataObj.targets.segmentTargets = {};
                            segmentObj.segmentList = [];

                            for (i = 0; i < selectedAudience.length; i++) {
                                segmentObj.segmentList[i] = {};
                                segmentObj.segmentList[i].segmentId = selectedAudience[i].id;
                                segmentObj.segmentList[i].isIncluded = selectedAudience[i].isIncluded;
                            }

                            segmentObj.operation = audienceService.getAndOr().toUpperCase();
                        }

                        //DayPart Segment
                        dayPart = audienceService.getDayPartdata();

                        if (dayPart) {
                            postAdDataObj.targets.adDaypartTargets = dayPart;
                        }
                    }

                    if ($scope.adData.inventory && !$scope.TrackingIntegrationsSelected) {
                        domainTargetObj = postAdDataObj.targets.domainTargets = {};
                        domainTargetObj.inheritedList = {'ADVERTISER': $scope.adData.inventory.domainListId};
                        postAdDataObj.domainInherit = 'APPEND';
                        postAdDataObj.domainAction = $scope.adData.inventory.domainAction;
                        // TODO: Save Inventory Domain Lists
                        postAdDataObj.selectedList = $scope.workflowData.selectedList;
                    }

                    if (!$scope.TrackingIntegrationsSelected) {
                        if ($.isEmptyObject($scope.postPlatformDataObj)) {
                            $scope.saveCustomeFieldForPlatform(1);
                        }
                        postAdDataObj.adPlatformCustomInputs = $scope.postPlatformDataObj;
                    }
console.log('postAdDataObj = ', postAdDataObj);
                    campaignOverView.saveAds(postAdDataObj, isDownloadTrackerClicked);
                }
            }
        };

        $scope.downloadTrackerUrls = function () {
            $scope.downloadingTracker = true;
            $scope.campaignAdSave(true);

        };

        $scope.triggerbudgetTab = function () {
            angular.element('.budget-tab-link').trigger('click');
        };

        $scope.triggerPlatformTab = function () {
            angular.element('.buying-platform-tab-link').trigger('click');
        };

        $scope.triggerTargetting = function () {
            angular.element('.targetting-tab-link').trigger('click');
        };

        $scope.triggerInventory = function () {
            angular.element('.inventory-tab-link').trigger('click');
        };

        $scope.trigerCreativeTag = function () {
            console.log('save and continue')
            angular.element('.creative-tab-link').trigger('click');
            console.log('save and continue222')
        };

        $scope.changePlatform = function (platformId) {
            $scope.$broadcast('renderTargetingUI', platformId);
        };

        $scope.showPopup = function () {
            $scope.creativeListLoading = false;
            $scope.creativesLibraryData.creativesData = [];

            if ($scope.selectedArr.length > 0) {
                $scope.unchecking = true;
            } else {
                $scope.unchecking = false;
            }

            $scope.$broadcast('showCreativeLibrary');
        };

        $scope.removeCreativeTags = function (clickedTagData, actionFrom) {
            var selectedCreativeTag = _.filter($scope.selectedArr, function (obj) {
                return obj.id === clickedTagData.id;
            });

            $('#' + clickedTagData.id).removeAttr('checked');

            if (selectedCreativeTag.length > 0 && selectedCreativeTag) {
                $scope.$broadcast('removeCreativeTags', [selectedCreativeTag, actionFrom]);
            } else {
                //special case when we remove tag from selected list
                $scope.$broadcast('removeCreativeTags', [[clickedTagData], 'special']);
            }
        };

        //ad targets summary
        $scope.getSelectedAudience = function () {
            $scope.selectedAudience = audienceService.getSelectedAudience();
            return $scope.selectedAudience ? $scope.selectedAudience.length : 0;
        };

        $scope.getSelectedDays = function () {
            $scope.selectedDayParts.selected = audienceService.getDayTimeSelectedObj();
            $scope.selectedDayParts.data = audienceService.getDaytimeObj();
            $scope.dayPartTotal = $scope.selectedDayParts.data ? $scope.selectedDayParts.data.length : 0;
        };

        $('.main_navigation_holder')
            .find('.active_tab')
            .removeClass('active_tab');

        $('.main_navigation')
            .find('.active')
            .removeClass('active')
            .end()
            .find('#campaigns_nav_link')
            .addClass('active');

        $('.bodyWrap').addClass('bodyWrapOverview');
        $('html').css('background', '#fff');
        $('.workflowPreloader').css('height', winHeaderHeight + 'px');

        if ($(window).height() < 596) {
            setTimeout(function () {
                $('.workflowPreloader').fadeOut('slow');
            }, 1500);
        } else {
            winHeight = $(window).height() - 126;
            colResize();
            setTimeout(function () {
                colResize();
                $('.workflowPreloader').fadeOut('slow');
            }, 1500);
        }

        $(window).resize(function () {
            colResize();
        });

        // This is for the drop down list. Perhaps adding this to a more general controller
        $(document).on('click', '.dropdown-menu li.available a', function () {
            $(this)
                .parents('.dropdown')
                .find('.btn')
                .html($(this).text() + '<span class="icon-arrow-down"></span>');
            $(this)
                .parents('.dropdown')
                .find('.btn')
                .val($(this).data('value'));
        });

        $('.dropdown-workflow a').each(function () {
            var text = $(this).text();

            if (text.length > 14) {
                $(this).val(text).text(text.substr(0, 20) + '…');
            }
        });

        $scope.mode = workflowService.getMode();
        $scope.locale = $locale;
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.adData = {};
        $scope.unitType = '';
        $scope.adData.screenTypes = [];
        $scope.creativeData = {};
        $scope.creativesLibraryData = {};
        $scope.creativesLibraryData.creativesData = [];
        $scope.showHidePopup = false;
        $scope.campaignId = $routeParams.campaignId;
        $scope.adGroupId = $routeParams.adGroupId;
        $scope.adId = $routeParams.adId;
        $scope.selectedArr = [];
        $scope.unchecking = false;
        $scope.enableSaveBtn = true;
        $scope.isAddCreativePopup = false;
        //To show hide view tag in creatives listing
        $scope.IsVisible = false;
        $scope.currentTimeStamp = moment.utc().valueOf();
        $scope.adData.setSizes = constants.WF_NOT_SET;
        $scope.numberOnlyPattern = /[^0-9]/g;
        $scope.adArchive = false;
        $scope.adPause = false;
        $scope.adResume = false;
        $scope.changePlatformPopup = false;
        $scope.preDeleteArr = [];
        $scope.TrackingIntegrationsSelected = false;
        $scope.preSelectArr = [];
        $scope.sortDomain = false;
        $scope.isAdsPushed = false;
        $scope.editedAdSourceId = null;
        $scope.dayPartData = {};
        $scope.adData.budgetTypeLabel = 'Impressions';
        $scope.adData.budgetType = 'Impressions';
        $scope.downloadingTracker = false;
        $scope.selectedAudience = [];
        $scope.selectedDayParts = [];
        $scope.adData.setSizes = constants.WF_NOT_SET;
        $scope.dayPartTotal = 0;
        $scope.isPlatformSelected = false;
        $scope.redirectFlag = false;
        $scope.archivedAdFlag = false;
        $scope.archivedCampaignFlag = false;


        RoleBasedService.setCurrencySymbol();
        localStorage.setItem('campaignData', '');
        localStorage.removeItem('adPlatformCustomInputs');

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.fetchAdFormats();
        campaignOverView.fetchGoals();
        campaignOverView.fetchPrimaryKpis();
        campaignOverView.fetchScreenType();
        campaignOverView.fetchUnitTypes();

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
        $('.masterContainer').on('shown.bs.tab', '.leftNavLink', function (e) {
            var target,
                bottom;

            $('.leftNavLink')
                .parents('li')
                .removeClass('active');

            $(this)
                .parents('li')
                .addClass('active');

            target = $(this).attr('href');

            $('#myTabs')
                .find(target + '-tab')
                .closest('li')
                .addClass('active');

            $(target).css('bottom', '-' + $(window).width() + 'px');
            bottom = $(target).offset().bottom;

            $(target)
                .css({bottom: bottom})
                .animate({'bottom': '0px'}, '10');

            $scope.$broadcast('closeAddCreativePage');
            $scope.$broadcast('switchPlatformFunc');
        });

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

        $scope.setSizes = function (selectedCreatives) {
            var creativeSizeArrC = [],
                arrC,
                resultC,
                str,
                result,
                i;

            if (typeof selectedCreatives.creatives !== 'undefined') {
                if (selectedCreatives.creatives.length === 1) {
                    $scope.sizeString = selectedCreatives.creatives[0].size.size;
                } else if (selectedCreatives.creatives.length > 1) {
                    $scope.sizeString = '';

                    for (i in selectedCreatives.creatives) {
                        creativeSizeArrC.push(selectedCreatives.creatives[i].size.size);
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

            if (selectedCreatives.creatives.length === 0) {
                $scope.sizeString = constants.WF_NOT_SET;
            }
            $scope.adData.setSizes = $scope.sizeString;
        };

        $scope.resetCreatives = function () {
            // Reset creatives if any had been selected.
            if ($scope.adData.setSizes !== constants.WF_NOT_SET) {
                $scope.selectedArr.length = 0;
                $scope.changeStatus();
                $scope.updateCreativeData($scope.selectedArr);
            }
        };
    });
})();