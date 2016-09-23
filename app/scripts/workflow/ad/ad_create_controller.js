define(['angularAMD', 'audience-service', 'video-service', 'common-utils', 'budget-delivery-controller', 'buying-platform-controller', 'targetting-controller',
    'geo-targetting-controller', 'audience-targetting-controller', 'daypart-create-controller', 'video-targetting-controller', 'inventory-filters-controller',
    'creative-controller', 'creative-list-controller', 'creative-tag-controller', 'platform-custom-module', 'ad-clone-controller'],
    function (angularAMD) {

    angularAMD.controller('CampaignAdsCreateController', ['$scope', '$modal', '$rootScope', '$routeParams', '$locale', '$location', '$filter', '$timeout', 'constants',
        'workflowService', 'loginModel', 'dataService', 'audienceService', 'RoleBasedService', 'momentService', 'vistoconfig', 'videoService', 'utils', 'urlBuilder',
        'accountService', 'pageLoad',
        function ($scope, $modal, $rootScope, $routeParams, $locale, $location,  $filter, $timeout, constants, workflowService, loginModel, dataService, audienceService,
                  RoleBasedService, momentService, vistoconfig, videoService, utils, urlBuilder, accountService, pageLoad) {
            var winHeaderHeight = $(window).height() - 50,
                winHeight,

                campaignOverView = {
                    getCampaignData: function (clientId, campaignId) {
                        workflowService
                            .getCampaignData(clientId, campaignId)
                            .then(function (result) {
                                var responseData,
                                    clientId,
                                    advertiserId;

                                if (result.status === 'OK' || result.status === 'success') {
                                    responseData = result.data.data;

                                    // redirect user to media plan list screen if new or edited ad
                                    // is from archived campaign
                                    if (responseData.isArchived) {
                                        $scope.isMediaPlanArchive = true;
                                    }

                                    $scope.workflowData.campaignData = responseData;

                                    if ($scope.workflowData.campaignData.selectedObjectives &&
                                        $scope.workflowData.campaignData.selectedObjectives.length > 0) {
                                        $scope.brandIcon = _.filter(
                                            $scope.workflowData.campaignData.selectedObjectives,
                                            function (item) {
                                                return item.objective === 'Branding';
                                            }
                                        );

                                        $scope.performanceIcon =
                                            _.filter(
                                                $scope.workflowData.campaignData.selectedObjectives,
                                                function (item) {
                                                    return item.objective === 'Performance';
                                                }
                                            );
                                    }

                                    clientId = responseData.clientId;
                                    advertiserId = responseData.advertiserId;

                                    workflowService
                                        .getAdGroup(clientId, $scope.campaignId, $scope.adGroupId)
                                        .then(function (result) {
                                            var responseData,
                                                adGroupData = {};

                                            if (result.status === 'OK' || result.status === 'success') {
                                                responseData = result.data.data;
                                                adGroupData = responseData;
                                                adGroupData.startDate =
                                                    momentService
                                                        .utcToLocalTime(
                                                            responseData.startTime
                                                        );
                                                adGroupData.endDate =
                                                    momentService
                                                        .utcToLocalTime(
                                                            responseData.endTime
                                                        );

                                                adGroupData.clientCurrency = accountService.currencySymbol;
                                                $scope.workflowData.adGroupData = adGroupData;
                                            } else {
                                                campaignOverView.errorHandler(result);
                                            }
                                        }, campaignOverView.errorHandler);

                                    if ($scope.mode === 'edit') {
                                        // to get all ads with in ad group
                                        workflowService
                                            .getDetailedAdsInAdGroup(clientId, $scope.campaignId,
                                                $scope.adGroupId, $scope.adId)
                                            .then(function (result) {
                                                $scope.getAd_result = result.data.data;

                                                // redirect user to campaingn overview screen
                                                // if ad is archived
                                                if ($scope.getAd_result.isArchived) {
                                                    $scope.isMediaPlanArchive = true;
                                                    $scope.archivedAdFlag = true;
                                                }

                                                disablePauseEnableResume($scope.getAd_result);
                                                processEditMode(result, clientId, advertiserId);
                                            });
                                    } else {
                                        $scope.$broadcast('getDominList', [{
                                            clientId: clientId,
                                            advertiserId: advertiserId
                                        }]);

                                        $timeout(function() {
                                            $scope.initiateDatePicker();
                                        }, 2000);
                                    }
                                } else {
                                    campaignOverView.errorHandler(result);
                                }
                            }, campaignOverView.errorHandler);
                    },

                    fetchGoals: function () {
                        $scope.workflowData.goals = [
                            {id: 1, name: 'Performance', active: true},
                            {id: 2, name: 'Brand',       active: false}
                        ];

                        // default value
                        $scope.adData.goal = 'Performance';
                    },

                    fetchPrimaryKpis: function () {
                        $scope.workflowData.primaryKpi = [
                            {
                                kpiCategory: 'DELIVERY',

                                kpiValues: [
                                    {id: 1, name: 'Impressions',                    disabled: false},
                                    {id: 2, name: 'Impressions within demographic', disabled: true},
                                    {id: 3, name: 'Viewable Impressions',           disabled: true},
                                    {id: 4, name: 'Clicks',                         disabled: false},
                                    {id: 5, name: 'Actions',                        disabled: false}
                                ]
                            },
                            {
                                kpiCategory: 'PERFORMANCE',

                                kpiValues: [
                                    {id: 1, name: 'Clickthrough Rate', disabled: false},
                                    {id: 2, name: 'Cost Per Click',    disabled: false},
                                    {id: 3, name: 'Cost Per Action',   disabled: true},
                                    // id 4 is not working due to some problem please debug if you can
                                    {id: 5, name: 'Viewabilty Rate',   disabled: false},
                                    {id: 6, name: 'In-Demo Rate',      disabled: true}
                                ]
                            }
                        ];
                    },

                    fetchAdFormats: function () {
                        $scope.workflowData.adFormats = [
                            {id: 1, name: 'Display',    active: true},
                            {id: 2, name: 'Video',      active: false},
                            {id: 3, name: 'Rich Media', active: false},
                            {id: 4, name: 'Social',     active: false},
                            {id: 5, name: 'Native',     active: false}

                        ];

                        // default value
                        $scope.adData.adFormat = 'Display';
                    },

                    fetchScreenType: function () {
                        if ($scope.mode !== 'edit') {
                            $scope.workflowData.screenTypes = [
                                {id: 1, name: 'Desktop', active: true},
                                {id: 2, name: 'Mobile',  active: false},
                                {id: 3, name: 'Tablet',  active: false}
                            ];

                            // default value
                            $scope.adData.screenTypes = [{id: 1, name: 'Desktop', active: true}];
                        } else {
                            $scope.workflowData.screenTypes = [
                                {id: 1, name: 'Desktop', active: false},
                                {id: 2, name: 'Mobile',  active: false},
                                {id: 3, name: 'Tablet',  active: false}
                            ];

                            // default value
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

                    fetchVerificationSettings: function () {
                        //fetch verification settings
                        workflowService.getVerificationSettings().then(function(result){

                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.adData.verificationSettings = result.data.data;
                                var defaultObj = {name: constants.VERIFICATION_DEFAULT, id: -1};
                                $scope.adData.verificationSettings.unshift(defaultObj);
                            }

                        });
                    },

                    saveAds: function (postDataObj) {
                        var promiseObj,
                            clientId = vistoconfig.getSelectedAccountId();

                        function adSaveErrorHandler (data) {
                            var errMsg = $scope.textConstants.PARTIAL_AD_SAVE_FAILURE;

                            data = data || '';

                            //  $scope.downloadingTracker = false;
                            if (data && data.data && data.data[0] && data.data[0].AdBudget) {
                                errMsg = data.data[0].AdBudget;
                            }

                            $rootScope.setErrAlertMessage(errMsg);
                        }

                        // save adGroup Ad
                        if (window.location.href.indexOf('adGroup') > -1) {
                            postDataObj.adGroupId = $scope.adGroupId;
                        }

                        if ($scope.adId) {
                            postDataObj.adId = $scope.adId;
                            postDataObj.updatedAt = $scope.updatedAt;
                            postDataObj.state = $scope.state;
                        }

                        if($scope.adData.selectedSetting.id !== -1){
                            postDataObj.verificationVendorConfigId = $scope.adData.selectedSetting.id;
                        }

                        promiseObj = workflowService[$scope.adId ? 'updateAd' : 'createAd'](clientId, postDataObj);

                        promiseObj.then(function (result) {
                            var responseData = result.data.data;

                            $scope.adCreateLoader = false;

                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.state = responseData.state;
                                $scope.adId = responseData.id;
                                $scope.updatedAt = responseData.updatedAt;
                                $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_SUCCESS, 0);

                                localStorage.setItem('adPlatformCustomInputs',
                                    window.JSON.stringify(responseData.adPlatformCustomInputs));

                                $location.url(urlBuilder.mediaPlanOverviewUrl(result.data.data.campaignId));

                                localStorage.setItem('topAlertMessage', $scope.textConstants.AD_CREATED_SUCCESS);
                            } else {
                                if (responseData.statusCode === 400) {
                                    adSaveErrorHandler(responseData);
                                } else {
                                    $rootScope.setErrAlertMessage(responseData.message);
                                }
                            }
                        }, function () {
                            adSaveErrorHandler();
                        });
                    },

                    errorHandler: function (errData) {
                        if (errData.data.status === 404) {
                            $location.url(urlBuilder.mediaPlansListUrl());
                        }
                    }
                };

            // This sets dynamic width to line to take 100% height
            function colResize() {
                var winHeight = $(document).height() - 110;

                $('.campaignAdCreateWrap, .campaignAdCreatePage, .left_column_nav').css('min-height', winHeight + 'px');
                $('.adStepOne .tab-pane').css('min-height', winHeight - 30 + 'px');
            }

            // edit mode data population
            function processEditMode(result, clientId, advertiserId) {
                var responseData = result.data.data,
                    format,
                    budgetElem,
                    dateObj= {},
                    index,
                    idx,
                    i,
                    videoTargetsData,
                    pacingType,

                    findFunc = function (item) {
                        return item.id === responseData.screens[i].id;
                    };

                $scope.$broadcast('EditAdResponseData');
                $scope.workflowData.adsData = responseData;

                if (responseData.adPlatformCustomInputs) {
                    localStorage.setItem(
                        'adPlatformCustomInputs',
                        window.JSON.stringify(responseData.adPlatformCustomInputs)
                    );
                }

                if ($scope.workflowData.adsData.labels && $scope.workflowData.adsData.labels.length > 0){
                    $scope.tags = workflowService.recreateLabels($scope.workflowData.adsData.labels);
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

                    $scope.adFormatSelection(format, '', 'editData');
                    $scope.adData.adFormat = format;
                }

                if (responseData.goal) {
                    $scope.adData.primaryKpi = responseData.goal;
                }

                if (responseData.verificationVendorConfigId) {
                    var verificationVendorConfigIndex = _.findIndex($scope.adData.verificationSettings ,function(setting) {
                        return setting.id === responseData.verificationVendorConfigId;
                    });

                    if(verificationVendorConfigIndex !== -1) {
                        $scope.adData.selectedSetting.name = $scope.adData.verificationSettings[verificationVendorConfigIndex].name;
                        $scope.adData.selectedSetting.id = $scope.adData.verificationSettings[verificationVendorConfigIndex].id;
                    }

                }

                if (responseData.screens) {
                    for (i = 0; i < responseData.screens.length; i++) {
                        index = _.findIndex($scope.workflowData.screenTypes, findFunc);

                        $scope.workflowData.screenTypes[index].active = true;
                        $scope.screenTypeSelection($scope.workflowData.screenTypes[index]);
                    }
                }

                // budget tab
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

                if (responseData.startTime) {
                    $scope.adAPIStartTime = responseData.startTime;

                    $scope.adData.startTime = momentService.utcToLocalTime(responseData.startTime);

                    dateObj.adStartDate = $scope.adData.startTime;
                }

                if (responseData.endTime) {
                    $scope.adAPIEndTime = responseData.endTime;

                    $scope.adData.endTime = momentService.utcToLocalTime(responseData.endTime);

                    dateObj.adEndDate = $scope.adData.endTime;
                }

                localStorage.setItem('adsDates', window.JSON.stringify(dateObj));
                $scope.initiateDatePicker();

                if (responseData.rateValue !== '') {
                    $scope.adData.unitCost = responseData.rateValue;
                }

                if (responseData.totalBudget >= 0) {
                    $scope.adData.totalAdBudget=responseData.totalBudget;
                    $scope.adData.existingAdBudget = responseData.totalBudget;
                }

                function selectKpi(type,isAutoComputeSet) {
                    var kpiTypeSymbolMap = {
                            '%': ['VTC', 'CTR', 'ACTION RATE', 'SUSPICIOUS ACTIVITY RATE', 'VIEWABLE RATE'],
                            '#': ['IMPRESSIONS', 'VIEWABLE IMPRESSIONS']
                        },
                        autoComputeKpiTypeMap = {
                            '.targetActions':['CPA', 'POST CLICK CPA'],
                            '.targetImpressions':['CPM'],
                            '.targetClicks':['CPC', 'CTR']
                        };


                    var symbol = '';

                    for (var i in kpiTypeSymbolMap) {
                        if ($.inArray(type, kpiTypeSymbolMap[i]) !== -1) {
                            symbol = i;
                            break;
                        }
                    }

                    if (symbol === '') {
                        symbol = constants.currencySymbol;
                    }

                    $('#primaryKpiDiv').find('.KPI_symbol').html(symbol);

                    var flag = false;
                    $('#kpiFieldsDiv').find('.targetInputHolder').find('.targetImpressions').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                    for (var j in autoComputeKpiTypeMap) {
                        if ($.inArray(type, autoComputeKpiTypeMap[j]) !== -1) {
                            var autoCompute = $('#autoComputeDiv');
                            autoCompute.closest('.targetInputHolder').find('.targetInputs').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                            autoCompute.detach();
                            var kpiFieldsDiv = $('#kpiFieldsDiv').find(j);
                            if(isAutoComputeSet){
                                kpiFieldsDiv.find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                            }
                            kpiFieldsDiv.after(autoCompute);
                            autoCompute.show();
                            flag = true;
                            break;
                        }
                    }

                    if(!flag) {
                        var autoComputeOld = $('#autoComputeDiv');
                        autoComputeOld.closest('.targetInputHolder').find('.targetInputs').find('input[type="text"]').attr('disabled', false).removeClass('disabled-field');
                        autoComputeOld.hide();
                        if(type.toLowerCase() === 'impressions') {
                            $('#kpiFieldsDiv').find('.targetInputHolder').find('.targetImpressions').find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                        }
                    }

                }

                if (responseData.kpiType){
                    $scope.adData.primaryKpi= vistoconfig.kpiList.find(function(obj) {
                        return obj.kpiType === responseData.kpiType;
                    }).displayName;
                    $scope.adData.targetValue=Number(responseData.kpiValue);
                    selectKpi(responseData.kpiType,responseData.autoCompute);
                }

                if (responseData.budgetValue >= 0) {
                    $scope.adData.budgetAmount = Number(responseData.budgetValue);
                }

                if (responseData.targetImpressions && responseData.targetImpressions >=0) {
                    $scope.adData.targetImpressions = Number(responseData.targetImpressions);
                }

                if (responseData.targetClicks && responseData.targetClicks >=0) {
                    $scope.adData.targetClicks = Number(responseData.targetClicks);
                }

                if (responseData.targetActions && responseData.targetActions >=0) {
                    $scope.adData.targetActions = Number(responseData.targetActions);
                }

                if (responseData.autoCompute) {
                    $scope.adData.autoCompute = responseData.autoCompute;
                } else {
                    $scope.adData.autoCompute = false;
                }

                if (responseData.fetchValue) {
                    $scope.adData.fetchValue = responseData.fetchValue;
                    $('#budgetHolder').find('.budgetFields').find('input[type="text"]').attr('disabled', true).addClass('disabled-field');
                } else {
                    $scope.adData.fetchValue = false;
                }

                if (responseData.rateType) {
                    idx = _.findIndex($scope.workflowData.unitTypes, function (item) {
                        return item.name === responseData.rateType;
                    });

                    $scope.unitName=responseData.rateType;

                    // cpm ..... dropdown
                    $scope.adData.unitType = $scope.workflowData.unitTypes[idx];

                    $('#unitcostType')
                        .parents('.dropdown')
                        .find('.btn')
                        .html($scope.adData.unitType.name + '<span class="icon-arrow-solid-down"></span>');
                }

                $('.cap_no input').attr('checked', 'checked');
                $('.spend_evenly input').attr('checked', 'checked');

                pacingType = responseData.pacingType;

                if (pacingType !== 'EVENLY') {
                    $('.spend_asap').addClass('active');
                    $('.spend_asap input').attr('checked', 'checked');
                    $('.spend_evenly').removeClass('active');
                }

                if (responseData.frequencyCaps && responseData.frequencyCaps.length >= 1) {
                    $scope.adData.setCap = true;
                    $scope.enableFreqCap = true;
                    angular.forEach(responseData.frequencyCaps, function (frequencyCap) {
                        var freqType;
                        $('.dynamicChkBox').addClass('after');
                        $('.cap_yes input').attr('checked', 'checked');
                        $scope.adData.quantity = frequencyCap.quantity;
                        $scope.capsPeriod = frequencyCap.frequencyType;
                        freqType = frequencyCap.frequencyType;

                        if (freqType === 'LIFETIME') {
                            $scope.selectedFreq = 'Lifetime';
                        } else if (freqType === 'DAILY') {
                            $scope.selectedFreq = 'Daily';
                        }
                    });
                }

                // platform tab
                if (responseData.platform) {
                    if (responseData.sourceId) {
                        $scope.isAdsPushed = true;
                    }

                    if (responseData.isTracking) {
                        $scope.TrackingIntegrationsSelected = true;
                    }
                }

                $scope.$broadcast('updatePlatform', responseData.platform);

                // creative tags
                if (responseData.creatives) {
                    $scope.selectedArr = responseData.creatives;
                }

                $scope.$broadcast('updateCreativeTags');

                if (responseData.targets && responseData.targets.geoTargets &&
                    _.size(responseData.targets.geoTargets) > 0) {
                    $scope.$broadcast('setTargeting', ['Geography']);
                }

                // day part edit
                if (responseData.targets && responseData.targets.adDaypartTargets &&
                    _.size(responseData.targets.adDaypartTargets) > 0) {
                    $scope.$broadcast('setTargeting', ['Daypart']);
                }

                // audience targeting load
                if (responseData.targets &&
                    responseData.targets.segmentTargets &&
                    _.size(responseData.targets.segmentTargets) > 0 &&
                    responseData.targets.segmentTargets.segmentList &&
                    _.size(responseData.targets.segmentTargets.segmentList) > 0 ) {
                    $scope.$broadcast('setTargeting', ['Audience']);
                }

                // video part edit
                videoTargetsData = responseData.targets;
                if (videoTargetsData.videoTargets &&
                    (videoTargetsData.videoTargets.sizes.length > 0 ||
                    videoTargetsData.videoTargets.positions.length > 0 ||
                    videoTargetsData.videoTargets.playbackMethods.length > 0)) {
                    $scope.$broadcast('setTargeting', ['Video']);
                }

                $scope.$broadcast('getDominList', [{
                    clientId: clientId,
                    advertiserId: advertiserId
                }]);
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
                    // disable pause button
                    $scope.disablePause = 'disabled';
                }

                if (getAdResultData.state === 'PAUSED') {
                    // enable resume if ad is paused
                    $scope.disableResume = '';
                }
            }

            function getfreqCapParams(formData) {
                var freqCap = [],
                    isSetCap,
                    selectedFreqObj;

                isSetCap = formData.setCap ? true : false;
                if (isSetCap && formData.quantity) {
                    selectedFreqObj = {};
                    selectedFreqObj.frequencyType = formData.frequencyType.toUpperCase();
                    selectedFreqObj.quantity = Number(utils.stripCommaFromNumber(formData.quantity));
                    freqCap.push(selectedFreqObj);
                }

                return freqCap;
            }

            console.log('AD CREATE controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            // Flag to denote that ad format has changed
            $scope.adFormatChanged = false;

            $scope.adCreateLoader = false;
            $scope.isChecked=true;

            $scope.showClonePopup = function () {
                $modal.open({
                    templateUrl: assets.html_ad_campaign_popup,
                    controller: 'AdClone',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        getMediaPlansForClone: function () {}
                    }
                });
            };

            // function to display the primaryKPI selected on left Nav
            $scope.displayKpiInSideBar=function(selectedKpi){
                if (((selectedKpi).toUpperCase() === 'CTR') ||
                    ((selectedKpi).toUpperCase() === 'VTC') ||
                    ((selectedKpi).toUpperCase() === 'CPM') ||
                    ((selectedKpi).toUpperCase() === 'CPC') ||
                    ((selectedKpi).toUpperCase() === 'CPA')) {
                    return selectedKpi.toUpperCase();
                } else {
                    return selectedKpi.replace(/\w\S*/g, function(txt){
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                }
            };


            $scope.displayVerificationInSideBar = function (selectedSetting) {
                if (selectedSetting && selectedSetting === constants.VERIFICATION_DEFAULT) {
                    return constants.VERIFICATION_DEFAULT_SMALL;
                } else {
                    return selectedSetting;
                }
            };

            $scope.redirectUser = function (isAdArchived) {
                var url;

                $scope.isMediaPlanArchive = false;
                $scope.archivedAdFlag = false;
                $scope.archivedCampaignFlag = false;

                url = urlBuilder.mediaPlansListUrl();

                if (isAdArchived) {
                    if (!$scope.workflowData.campaignData.isArchived) {
                        $scope.isMediaPlanArchive = false;
                        $scope.archivedAdFlag = false;
                        url = urlBuilder.mediaPlanOverviewUrl($scope.campaignId);
                    }
                }

                $location.url(url);
            };

            $scope.editCampaign = function (workflowCampaignData) {
                $location.url('/mediaplan/' + workflowCampaignData.id + '/edit');
            };

            $scope.utcToLocalTime = function (date, format) {
                return momentService.utcToLocalTime(date, format);
            };

            $scope.archiveAd = function () {
                var errorAchiveAdHandler,
                    clientId = vistoconfig.getSelectedAccountId();

                $scope.adArchiveLoader = true;

                errorAchiveAdHandler = function () {
                    $scope.adArchive = false;
                    $scope.adArchiveLoader = false;
                    $rootScope.setErrAlertMessage(constants.WF_AD_ARCHIVE_FAILURE);
                };

                workflowService
                    .deleteAd(clientId, $scope.campaignId, $scope.adId)
                    .then(function (result) {

                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.adArchive = false;
                            $scope.adArchiveLoader = false;

                            $location.url(urlBuilder.mediaPlanOverviewUrl($scope.campaignId));
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
                    clientId = vistoconfig.getSelectedAccountId(),

                    pauseAdDataObj = {
                        name: $scope.getAd_result.name,
                        id: $scope.getAd_result.id,
                        campaignId: $scope.getAd_result.campaignId,
                        adGroupId : $scope.adGroupId,
                        lineitemId : $scope.adData.lineItemId,
                        updatedAt: $scope.getAd_result.updatedAt,
                        totalBudget : $scope.workflowData.adsData.totalBudget,
                        budgetValue : $scope.workflowData.adsData.budgetValue
                    };

                workflowService
                    .pauseAd(clientId, pauseAdDataObj)
                    .then(function (result) {
                        var url;

                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.adArchive = false;
                            url = '/mediaplan/' + $scope.campaignId + '/overview';
                            localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_PAUSE_SUCCESS);
                            $location.url(urlBuilder.mediaPlanOverviewUrl($scope.campaignId));
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

                    clientId = vistoconfig.getSelectedAccountId(),

                    resumeAdDataObj = {
                        name: $scope.getAd_result.name,
                        id: $scope.getAd_result.id,
                        adGroupId: $scope.adGroupId,
                        lineitemId: $scope.adData.lineItemId,
                        campaignId: $scope.getAd_result.campaignId,
                        updatedAt: $scope.getAd_result.updatedAt,
                        totalBudget : $scope.workflowData.adsData.totalBudget,
                        budgetValue : $scope.workflowData.adsData.budgetValue
                    };

                workflowService
                    .resumeAd(clientId, resumeAdDataObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.adArchive = false;
                            localStorage.setItem('topAlertMessage', $scope.textConstants.WF_AD_RESUME_SUCCESS);
                            $location.url(urlBuilder.mediaPlanOverviewUrl($scope.campaignId));
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
                    momentService.utcToLocalTime($scope.getAd_result.startTime, 'DD MMM YYYY') +
                    ' to ' +
                    momentService.utcToLocalTime($scope.getAd_result.endTime, 'DD MMM YYYY') +
                    ' ?';

                if ($scope.disableResume !== 'disabled') {
                    $scope.adResume = !$scope.adResume;
                }
            };

            $scope.resetPartialSaveAlertMessage = function () {
                $rootScope.setErrAlertMessage('', 0);
            };

            $scope.dropBoxItemSelected = function (item, type) {
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

            $scope.getPreviewUrl = function(creativeData) {
                var previewUrl,
                    isLeafNode;


                previewUrl = '/a/' + $routeParams.accountId;
                isLeafNode = accountService.getSelectedAccount().isLeafNode;

                if(!isLeafNode) {
                    previewUrl += '/sa/' + $routeParams.subAccountId;
                }

                previewUrl +=  '/adv/'+ creativeData.advertiserId;

                if($scope.adId) {
                    previewUrl += '/campaign/'+ $scope.campaignId +'/ad/'+ $scope.adId +
                        '/creative/'+ creativeData.id +'/preview';
                } else {
                    previewUrl +=  '/creative/' + creativeData.id +'/preview';
                }
                window.open(previewUrl);
            };

            $scope.ShowHide = function (obj) {
                $scope.IsVisible = $scope.IsVisible ? false : true;
                $scope.creativeObj = obj;
            };

            $scope.getAdFormatIconName = function (adFormat) {
                var adFormatMapper = {
                    display: 'image',
                    video: 'video',
                    'rich media': 'rich-media',
                    social: 'social',
                    native : 'native'
                };

                return adFormatMapper[adFormat.toLowerCase()];
            };

            $scope.getScreenTypeIconName = function (screenType) {
                var screenTypeMapper = {
                    desktop: 'desktop',
                    mobile: 'mobile',
                    tablet: 'tablet'
                };

                return screenTypeMapper[screenType.toLowerCase()];
            };

            $scope.getGoalIconName = function (goal) {
                var goalMapper = {
                    performance: 'performance',
                    brand: 'brand'
                };

                return goalMapper[goal.toLowerCase()];
            };

            $scope.getPlatformIconName = function (platform) {
                var platformMapper = {
                    'visto bidder': 'Visto_fav_icon',
                    'visto bidder - test': 'Visto_fav_icon',
                    appnexus: 'logo_C_appnexus',
                    'appnexus - test': 'logo_C_appnexus',
                    facebook: 'facebook-FBexchange',
                    dbm: 'doubleclick-DFP',
                    dfp: 'doubleclick-DFP',
                    'plat-dbclick': 'doubleclick-DFP',
                    'place media': 'place_media',
                    telemetry: 'telemetry',
                    xad: 'xad',
                    twitter: 'twitter',
                    'ad theorent': 'ad_theorent',
                    dstillery: 'dstillery',
                    'adap.tv': 'adap_tv',
                    youtube: 'youtube',
                    brightroll: 'br-logo_0',
                    doubleClick: 'doubleclick-DFP',
                    yahoo: 'yahoo',
                    'fb exchange': 'facebook-FBexchange',
                    'dfp-tracking': 'doubleclick-DFP',
                    doubleclick: 'doubleclick-DFP',
                    'facebook-tracking': 'facebook-FBexchange',
                    'appnexus-tracking': 'logo_C_appnexus',
                    'dorado-tracking': 'Visto_fav_icon',
                    'dbm-tracking': 'doubleclick-DFP',
                    beeswax: 'beeswax',
                    'aerserv': 'aerserv-logo',
                    'liverail': 'liverail-logo',
                    'millennial media': 'millenialmedia',
                    'mopub': 'mopub-logo',
                    'openx': 'openx',
                    'pubmatic': 'pubmatic-logo',
                    'pulsepoint': 'pulsepoint-logo',
                    'rubicon': 'rubicon-logo',
                    'the trade desk': 'thetradedesk',
                    'adx' : 'doubleclick-DFP',
                    'visto tracker':'Visto_fav_icon'
                };

                if (platform) {
                    return platformMapper[platform.toLowerCase()];
                }
            };

            $scope.getPlatformDesc = function (platform) {
                var platformMapper = {
                    'collective bidder': 'The programmactic solution for all screens and format.',
                    appnexus: 'The programmactic solution for all screens and formats',
                    facebook: 'All-in-one customer<br>support application',
                    dbm: 'All-in-one customer<br>support application',
                    dfp: 'A revenue management<br>solution for publishers'
                };

                return platformMapper[platform.toLowerCase()];
            };

            $scope.utc = function (date) {
                return moment(date).utc().valueOf();
            };

            //Date Conf Start
            $scope.checkForPastDate = function (startDate, endDate) {
                endDate = moment(endDate).format(constants.DATE_US_FORMAT);

                return moment().isAfter(endDate, 'day');
            };

            $scope.handleEndFlightDate = function (data) {
                var endDateElem = $('#endDateInput'),
                    endDate = data.endTime,
                    adsDate = JSON.parse(localStorage.getItem('adsDates')),
                    changeDate;

                // if End Date is in Past
                if (!endDate && adsDate) {
                    endDate = adsDate.adEndDate;
                    changeDate = endDate;
                    $scope.adData.endTime = changeDate;

                    if (moment().isAfter(endDate)) {
                        endDateElem.datepicker('setStartDate',
                            moment().format(constants.DATE_US_FORMAT));
                    }
                }
            };

            $scope.handleStartFlightDate = function (data) {
                var endDateElem = $('#endDateInput'),
                    startDate = data.startTime,
                    endDate = data.endTime,
                    campaignEndTime,
                    changeDate,
                    adsDate;

                if (!$scope.workflowData.campaignData) {
                    return;
                }

                campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime);

                if ($scope.mode !== 'edit') {
                    endDateElem
                        .attr('disabled', 'disabled')
                        .css({'background': '#eee'});

                    if (startDate) {
                        endDateElem
                            .removeAttr('disabled')
                            .css({'background': 'transparent'});

                        changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
                        endDateElem.datepicker('setStartDate', changeDate);

                        if (location.href.indexOf('adGroup') > -1) {
                            endDateElem.datepicker('setEndDate',
                                momentService.utcToLocalTime(localStorage.getItem('edTime')));
                        } else {
                            endDateElem.datepicker('setEndDate', campaignEndTime);
                        }

                        endDateElem.datepicker('update', changeDate);
                    }
                } else {
                    changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
                    adsDate = JSON.parse(localStorage.getItem('adsDates'));

                    // if start Date is in Past
                    if (!startDate && adsDate) {
                        changeDate = startDate = adsDate.adStartDate;
                        $scope.adData.startTime = changeDate;

                        if (moment().isAfter(endDate, 'day')) {
                            endDateElem
                                .datepicker('setStartDate',
                                    moment().format(constants.DATE_US_FORMAT));
                        }
                    } else {
                        endDateElem.datepicker('setStartDate', changeDate);
                    }

                    if (moment(startDate).isAfter(endDate, 'day')) {
                        endDateElem.datepicker('update', changeDate);
                    }
                }
            };

            $scope.setDateInEditMode = function (campaignStartTime, campaignEndTime) {
                var endDateElem = $('#endDateInput'),
                    startDateElem = $('#startDateInput'),
                    adsDate = JSON.parse(localStorage.getItem('adsDates')),
                    startDate,
                    endDate,
                    currentDate;

                if (adsDate) {
                    startDate = adsDate.adStartDate;
                    endDate = adsDate.adEndDate;
                }

                // ads start Date in Past
                if (campaignStartTime > startDate) {
                    startDateElem.datepicker('setStartDate', campaignStartTime);
                }

                if (startDate > campaignStartTime) {
                    startDateElem.datepicker('update', startDate);
                }

                if (campaignEndTime >= endDate) {
                    startDateElem.datepicker('setEndDate', campaignEndTime);
                }

                // ads start Date in Past
                if (moment(endDate).isAfter(campaignEndTime, 'day')) {
                    endDateElem.datepicker('setEndDate', endDate);
                    endDateElem.datepicker('setStartDate', endDate);
                    endDateElem.datepicker('update', endDate);
                } else {
                    endDateElem.datepicker('setStartDate', startDate);
                    endDateElem.datepicker('setEndDate', campaignEndTime);
                    endDateElem.datepicker('update', endDate);
                }

                // this is to disable the enddate before today
                currentDate = moment().format(constants.DATE_US_FORMAT);

                if (startDate < currentDate) {
                    endDateElem.datepicker('setStartDate', currentDate);
                }
            };

            $scope.$parent.initiateDatePicker = function () {
                var endDateElem = $('#endDateInput'),
                    startDateElem = $('#startDateInput'),
                    campaignData = $scope.workflowData.campaignData,
                    campaignStartTime = momentService.utcToLocalTime(campaignData.startTime),
                    campaignEndTime = momentService.utcToLocalTime(campaignData.endTime),
                    adGroupStartDate,
                    adGroupEndDate,
                    currentDate = moment().format(constants.DATE_US_FORMAT);

                if (moment().isAfter(campaignStartTime, 'day')) {
                    campaignStartTime = moment().format(constants.DATE_US_FORMAT);
                }

                $scope.mode === 'edit' && endDateElem.removeAttr('disabled').css({'background': 'transparent'});

                // If we are handling an ad of an Adgroup
                if (location.href.indexOf('adGroup') > -1) {
                    if ($scope.mode === 'edit') {
                        if (momentService.isDateBefore($scope.workflowData.adGroupData.startDate, currentDate)) {
                            adGroupStartDate = currentDate;
                        } else {
                            adGroupStartDate = $scope.workflowData.adGroupData.startDate;
                        }

                        adGroupEndDate = $scope.workflowData.adGroupData.endDate;
                        startDateElem.datepicker('setStartDate', adGroupStartDate);
                        startDateElem.datepicker('setEndDate', adGroupEndDate);
                        $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);
                    } else {
                        // When creating a new Adgroup ad, if Adgroup start date is:
                        // 1) before currrent date (in the past), default start & end dates will be current date
                        // 2) else (in the future)m default current date will be Adgroup start date.
                        adGroupStartDate = momentService.utcToLocalTime(localStorage.getItem('stTime'));
                        adGroupEndDate = momentService.utcToLocalTime(localStorage.getItem('edTime'));

                        if (momentService.isDateBefore(adGroupStartDate, currentDate)) {
                            startDateElem.datepicker('setStartDate', currentDate);
                            startDateElem.datepicker('update', currentDate);
                        } else {
                            startDateElem.datepicker('setStartDate', adGroupStartDate);
                            startDateElem.datepicker('update', adGroupStartDate);
                        }

                        startDateElem.datepicker('setEndDate', adGroupEndDate);
                        endDateElem.datepicker('update',$scope.workflowData.adGroupData.endDate);
                    }
                } else {
                    // Normal ad (non-Adgroup)
                    startDateElem.datepicker('setStartDate', campaignStartTime);
                    endDateElem.datepicker('setEndDate', campaignEndTime);

                    if ($scope.mode === 'edit') {
                        $scope.setDateInEditMode(campaignStartTime, campaignEndTime);
                    } else {
                        startDateElem.datepicker('setEndDate', campaignEndTime);
                        startDateElem.datepicker('update', campaignStartTime);
                    }
                }
            };
            //Date Conf End

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

                if ($scope.adData.adFormat === 'Video') {
                    $scope.workflowData.primaryKpi[1].kpiValues.push(videoKpiObj);
                } else {
                    index =
                        _.findIndex($scope.workflowData.primaryKpi[1].kpiValues, function (item) {
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
                    height ,
                    relativeX,
                    relativeY,
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
                        height =  $(event.target).closest('.goalBtnGroup').height() ;
                        relativeX = left - $(event.target).closest('.goalBtnWithPopup').offset().left - 110;
                        relativeY = top - $(event.target).closest('.goalBtnWithPopup').offset().top + height;
                        $('.goalBtnWithPopup .popUpCue').css({left: relativeX, bottom:relativeY , top : 'auto'});
                    }
                } else {
                    // populating first time in editmode
                    $scope.adformatName = adformatName;
                    $scope.$broadcast('adFormatChanged', $scope.adformatName);

                    adFormatsData = $scope.workflowData.adFormats;

                    _.each(adFormatsData, function (obj) {
                        var objectName = $filter('toTitleCase')(obj.name);

                        objectName === $scope.adformatName ? obj.active = true : obj.active = false;
                    });
                }

                if (adformatName.trim() !== 'Video') {
                    $scope.adData.isVideoSelected = false;

                    $scope.adData.videoTargets.sizes = [];
                    $scope.adData.videoTargets.positions = [];
                    $scope.adData.videoTargets.playbackMethods = [];

                    $scope.adData.videoPreviewData.sizes = '';
                    $scope.adData.videoPreviewData.positions = '';
                    $scope.adData.videoPreviewData.playbackMethods = '';

                    $scope.videoTypes = [];
                }
            };

            $scope.goalSelection = function (goal) {
                var goalData = $scope.workflowData.goals;

                _.each(goalData, function (obj) {
                    obj.name === goal ? obj.active = true : obj.active = false;
                });
            };

            $scope.toggleBtn = function (event) {
                var target,
                    parentElem;

                target = $(event.target);
                parentElem = target.parents('.miniToggle');
                parentElem.find('label').removeClass('active');
                target.parent().addClass('active');
                target.attr('checked', 'checked');
            };

            // Create Tag Slide Page
            $scope.showCreateNewWindow = function () {
                workflowService.setCreativeEditMode('create');
                workflowService.setCreativeEditData(null);
                $('#formCreativeCreate')[0].reset();
                $scope.isAddCreativePopup = true;
                $scope.enableOnlyCreativeTab=true;

                // new call has to be made when platforms are changed hence seletion on new template.
                // therefore broadcast to reset
                $scope.$broadcast('creativeAdserverTemplateReset');

                // enable cancel, save button on load
                $scope.disableCancelSave = false;

                $('.newCreativeSlide .popCreativeLib')
                    .show()
                    .delay(300)
                    .animate({
                        left: '50%',
                        marginLeft: '-325px',
                        paddingLeft: '30px'
                    }, 'slow');

                $('.saveCreativeBtn').css('margin','-64px 0 0 0');

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
                $('.saveContinueBtn').hide();

            };

            $scope.frequencySelected = function (freqSelected) {
                $scope.selectedFreq = freqSelected;
            };

            $scope.campaignAdSave = function () {
                var formElem = $('#formAdCreate'),
                    formData = formElem.serializeArray(),
                    customFieldErrorElem,
                    creativesData,
                    postAdDataObj,
                    postGeoTargetObj,
                    buildGeoTargetingParams,
                    geoTargetData,
                    selectedAudience,
                    segmentObj,
                    dayPart,
                    domainTargetObj,
                    appTargetObj,
                    i,
                    domainListIds = [],
                    appListsIds = [],
                    adData,
                    videoTargetsData,
                    inventoryLists,

                    wrapperToReplaceCustomPlatformHiddenValues = function(customPlatformData) {
                        _.each(customPlatformData, function(obj) {
                            if (obj.value === '$AD_KPI') {
                                obj.value = $scope.adData.primaryKpi.toUpperCase();
                            }

                            if (obj.value === '$AD_KPI_VALUE') {
                                obj.value = utils.stripCommaFromNumber($scope.adData.targetValue);

                            }
                        });

                        return customPlatformData;
                    };

                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));

                if ((formData.budgetAmount &&
                    $scope.formAdCreate.budgetAmount.$error.mediaCostValidator) ||
                    ($scope.budgetErrorObj.mediaCostValidator ||
                    $scope.budgetErrorObj.availableRevenueValidator ||
                    $scope.budgetErrorObj.impressionPerUserValidator ||
                    $scope.budgetErrorObj.availableMaximumAdRevenueValidator) ||
                    !formData.targetImpressions) {
                    $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                    if(!formData.targetImpressions) {
                        $scope.budgetErrorObj.targetImpressionValidator = true;
                    }
                    return false;
                }

                customFieldErrorElem = $('.customFieldErrorMsg');

                if (customFieldErrorElem.length > 0) {
                    $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                    return false;
                } else {
                    creativesData = $scope.creativeData.creativeInfo;
                    postAdDataObj = {};
                    postAdDataObj.name = formData.adName;
                    postAdDataObj.labels = _.pluck($scope.tags, 'label');
                    postAdDataObj.campaignId = Number($scope.campaignId);

                    if (formData.adFormat) {
                        postAdDataObj.adFormat = formData.adFormat.toUpperCase();
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

                    postAdDataObj.startTime = momentService.postDateModifier(formData.startTime, $scope.adAPIStartTime, 'startTime');
                    postAdDataObj.endTime = momentService.postDateModifier(formData.endTime, $scope.adAPIEndTime, 'endTime');

                    postAdDataObj.lineitemId = $scope.adData.lineItemId;

                    if ((
                            !formData.startTime ||
                            !formData.endTime ||
                            !postAdDataObj.screens ||
                            !formData.adFormat
                        ) &&
                        $scope.mode === 'edit' &&
                        $scope.isAdsPushed === true
                    ) {
                        $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
                    } else {
                        $scope.adCreateLoader = true;

                        if (formData.targetValue){
                            postAdDataObj.kpiType=formData.primaryKpi.toUpperCase();
                            postAdDataObj.kpiValue=utils.stripCommaFromNumber(formData.targetValue);
                        }

                        if (formData.unitCost) {
                            postAdDataObj.rateValue = utils.stripCommaFromNumber(formData.unitCost);

                            if (formData.unitCost && formData.unitType === '') {
                                postAdDataObj.rateType = 'CPM';
                            } else {
                                postAdDataObj.rateType = formData.unitType;
                            }
                        }

                        if (formData.totalAdBudget){
                            postAdDataObj.totalBudget = utils.stripCommaFromNumber(formData.totalAdBudget);
                            postAdDataObj.enabledBudgetCalculation = false;
                            //($('#targetUnitCost_squaredFour').prop('checked') === false) ? false : true; this wouldn't be required anymore as total budget is a normal value now
                        }

                        if (formData.targetImpressions){
                            postAdDataObj.targetImpressions = formData.targetImpressions;
                        }

                        if (formData.targetClicks){
                            postAdDataObj.targetClicks = formData.targetClicks;
                        }

                        if (formData.targetActions){
                            postAdDataObj.targetActions = formData.targetActions;
                        }

                        if (formData.autoCompute) {
                            postAdDataObj.autoCompute = formData.autoCompute;
                        }

                        if (formData.fetchValue){
                            postAdDataObj.fetchValue = formData.fetchValue;
                        }

                        if (getfreqCapParams(formData).length > 0) {
                            postAdDataObj.frequencyCaps = getfreqCapParams(formData);
                        }

                        postAdDataObj.pacingType = formData.pacingType;

                        if (formData.budgetType && formData.budgetAmount) {
                            postAdDataObj.budgetType = formData.budgetType;
                            postAdDataObj.budgetValue =
                                Number(utils.stripCommaFromNumber(formData.budgetAmount));
                        }

                        if (formData.platformId) {
                            postAdDataObj.platformId = Number(formData.platformId);

                            if (formData.platformSeatId) {
                                postAdDataObj.platformSeatId = Number(formData.platformSeatId);
                            }

                            if ($scope.TrackingIntegrationsSelected) {
                                postAdDataObj.isTracking = true;
                            }
                            // custom field section.
                            if ($.isEmptyObject($scope.postPlatformDataObj)) {
                                $scope.saveCustomeFieldForPlatform(1);
                            }

                            postAdDataObj.adPlatformCustomInputs =
                                wrapperToReplaceCustomPlatformHiddenValues($scope.postPlatformDataObj);

                        }

                        if (creativesData && creativesData.creatives) {
                            _.each(creativesData.creatives,
                                function (obj) {
                                    obj.sizeId = obj.size?obj.size.id:'';
                                });

                            postAdDataObj.creatives = _.pluck(creativesData.creatives, 'id');
                        }

                        if (!$scope.TrackingIntegrationsSelected) {
                            postAdDataObj.targets = {};

                            if (workflowService.getSavedGeo()) {
                                $scope.adData.geoTargetingData = workflowService.getSavedGeo().original;
                                postGeoTargetObj = postAdDataObj.targets.geoTargets = {};

                                buildGeoTargetingParams = function (data) {
                                    var obj = {};

                                    obj.isIncluded = _.uniq(_.pluck(data, 'included'))[0];
                                    obj.geoTargetList = _.pluck(data, 'id');

                                    return obj;
                                };

                                geoTargetData = $scope.adData.geoTargetingData;

                                if (geoTargetData.countries.selected.length > 0) {
                                    postGeoTargetObj.COUNTRY =
                                        buildGeoTargetingParams(geoTargetData.countries.selected, 'countries');
                                }

                                if (geoTargetData.regions.selected.length > 0) {
                                    postGeoTargetObj.REGION =
                                        buildGeoTargetingParams(geoTargetData.regions.selected, 'regions');
                                }

                                if (geoTargetData.cities.selected.length > 0) {
                                    postGeoTargetObj.CITY =
                                        buildGeoTargetingParams(geoTargetData.cities.selected, 'cities');
                                }

                                if (geoTargetData.dmas.selected.length > 0) {
                                    postGeoTargetObj.DMA = buildGeoTargetingParams(geoTargetData.dmas.selected, 'dmas');
                                }

                                if (geoTargetData.zip.selected.length > 0) {

                                    postGeoTargetObj.ZIPCODE = {
                                        isIncluded: true
                                    };

                                    postGeoTargetObj.ZIPCODE.geoTargetList = _.map(geoTargetData.zip.selected,
                                        function (zip) { // jshint ignore:line
                                            return {
                                                countryCode : zip.countryCode,
                                                zipcodes : utils.rangeValue(zip.data)
                                            };
                                        }
                                    );
                                }
                            } else {
                                if ($scope.mode === 'edit') {
                                    adData = angular.copy(workflowService.getAdsDetails());
                                    postGeoTargetObj = adData.targets.geoTargets;

                                    if (postGeoTargetObj) {
                                        if (postGeoTargetObj.COUNTRY) {
                                            postGeoTargetObj.COUNTRY.geoTargetList = _.pluck(
                                                postGeoTargetObj.COUNTRY.geoTargetList, 'id');
                                        }

                                        if (postGeoTargetObj.REGION) {
                                            postGeoTargetObj.REGION.geoTargetList = _.pluck(
                                                postGeoTargetObj.REGION.geoTargetList, 'id');
                                        }

                                        if (postGeoTargetObj.CITY) {
                                            postGeoTargetObj.CITY.geoTargetList = _.pluck(
                                                postGeoTargetObj.CITY.geoTargetList, 'id');
                                        }

                                        if (postGeoTargetObj.DMA) {
                                            postGeoTargetObj.DMA.geoTargetList = _.pluck(
                                                postGeoTargetObj.DMA.geoTargetList, 'id');
                                        }

                                        if (postGeoTargetObj.ZIP_CODE) {
                                            postGeoTargetObj.ZIPCODE = {
                                                isIncluded: true
                                            };

                                            postGeoTargetObj.ZIPCODE.geoTargetList=[];

                                            postGeoTargetObj.ZIPCODE.geoTargetList = _.map(postGeoTargetObj.ZIP_CODE.geoTargetList,
                                                function (zip) { // jshint ignore:line
                                                    return {
                                                        countryCode : zip.countryCode,
                                                        zipcodes : utils.rangeValue(zip.zipcodes.replace(/\s*,\s*/g, ',').split(','))
                                                    };
                                                }
                                            );

                                            delete postGeoTargetObj.ZIP_CODE;
                                        }
                                    }

                                    postAdDataObj.targets.geoTargets = postGeoTargetObj;
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

                            // DayPart Segment
                            dayPart = audienceService.getDayPartdata();

                            if (dayPart) {
                                postAdDataObj.targets.adDaypartTargets = dayPart;
                            }

                            // video Segment
                            videoTargetsData = videoService.getVideoData();

                            if (videoTargetsData.videoTargets &&
                                (videoTargetsData.videoTargets.sizes.length > 0 ||
                                videoTargetsData.videoTargets.positions.length > 0 ||
                                videoTargetsData.videoTargets.playbackMethods.length > 0)) {
                                postAdDataObj.targets.videoTargets = videoTargetsData.videoTargets;
                            } else {
                                if ($scope.mode === 'edit') {
                                    if ($scope.adData.isVideoSelected) {
                                        adData = workflowService.getAdsDetails();
                                        videoTargetsData = adData.targets && adData.targets.videoTargets;
                                    }

                                    if (videoTargetsData) {
                                        postAdDataObj.targets.videoTargets = videoTargetsData;
                                    }
                                }
                            }
                        }

                        inventoryLists = workflowService.segrigateInventory($scope.workflowData.selectedLists);

                        domainListIds.length = 0;
                        appListsIds.length = 0;

                        if(inventoryLists.domainList.length > 0){
                            domainListIds = inventoryLists.domainList;
                        }

                        if (inventoryLists.appList.length > 0){
                            appListsIds = inventoryLists.appList;
                        }

                        // domains save
                        if ($scope.adData.inventory &&
                            !$scope.TrackingIntegrationsSelected &&
                            domainListIds.length > 0) {
                            domainTargetObj = postAdDataObj.targets.domainTargets = {};

                            domainTargetObj.inheritedDomainList = {
                                'ADVERTISER': domainListIds
                            };

                            postAdDataObj.domainInherit = 'APPEND';
                            postAdDataObj.domainAction = $scope.adData.inventory.domainAction;
                        }

                        // app save
                        if ($scope.adData.inventory && !$scope.TrackingIntegrationsSelected && appListsIds.length > 0) {
                            appTargetObj = postAdDataObj.targets.appTargets = {};

                            appTargetObj.inheritedAppList = {
                                'ADVERTISER': appListsIds
                            };

                            postAdDataObj.appInherit = 'APPEND';
                            postAdDataObj.appAction = $scope.adData.inventory.domainAction;
                        }
                        // end of inventory save



                        campaignOverView.saveAds(postAdDataObj);
                    }
                }
            };

            $scope.triggerBudgetTab = function () {
                $timeout(function() {
                    $('a[data-target="#setting"]').trigger('click');
                }, 100);
            };

            $scope.triggerPlatformTab = function () {
                $timeout(function() {
                    $('a[data-target="#buying"]').trigger('click');
                }, 100);
            };

            $scope.triggerTargetting = function () {
                $timeout(function() {
                    $('a[data-target="#targetting"]').trigger('click');
                }, 100);
            };

            $scope.triggerInventory = function () {
                $timeout(function() {
                    $('a[data-target="#inventoryView"]').trigger('click');
                }, 100);
            };

            $scope.triggerCreativeTag = function () {
                $timeout(function() {
                    $('a[data-target="#creative"]').trigger('click');
                }, 100);
            };

            $scope.changePlatform = function (platformId) {
                $timeout(function() {
                    $scope.isPlatformId = platformId;
                    $scope.isPlatformSelected = platformId ? true : false;
                    $scope.$broadcast('renderTargetingUI', platformId);
                }, 100);
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
                    // special case when we remove tag from selected list
                    $scope.$broadcast('removeCreativeTags', [[clickedTagData], 'special']);
                }
            };

            $scope.isSaveBtnEnable = function() {
                var adData = $scope.adData;

                return (
                    adData.budgetExceeded ||
                    adData.adBudgetExceedUnallocated ||
                    !adData.adName ||
                    (adData.targetValue && (adData.targetValue.length === 0) ) ||
                    (adData.unitCost && (adData.unitCost.length === 0)) ||
                    (adData.totalAdBudget && (adData.totalAdBudget.length === 0 ))||
                    (adData.budgetAmount && (adData.budgetAmount.length === 0))
                );
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

                if ($(window).height() > 596) {
                    colResize();
                }
            });

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this)
                    .parents('.dropdown')
                    .find('.btn')
                    .html($(this).text() + '<span class="icon-arrow-solid-down"></span>');

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
            $scope.enableOnlyCreativeTab=false;
            $scope.selectedFreq = 'Daily';

            // To show hide view tag in creatives listing
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

            $scope.selectedAudience = [];
            $scope.selectedDayParts = [];
            $scope.adData.setSizes = constants.WF_NOT_SET;
            $scope.dayPartTotal = 0;
            $scope.isPlatformSelected = false;
            $scope.isMediaPlanArchive = false;
            $scope.archivedAdFlag = false;
            $scope.archivedCampaignFlag = false;
            $scope.showCloneAdPopup = false;
            $scope.mediaPlanList = [];
            $scope.adGroupList = [];
            $scope.mediaPlanName = null;
            $scope.adGroupName = null;
            $scope.adData.platformSeatId = null;
            campaignOverView.fetchVerificationSettings();

            $scope.adData.domainEnable = false;
            $scope.adData.appEnable = false;

            RoleBasedService.setCurrencySymbol();
            $scope.tags = [];
            localStorage.setItem('campaignData', '');
            localStorage.removeItem('adPlatformCustomInputs');

            if ($routeParams.lineItemId) {
                $scope.adData.lineItemId = Number($routeParams.lineItemId);
            }

            $(document).ready(function() {
                var clientId = vistoconfig.getSelectedAccountId();
                var campaignId = vistoconfig.getSelectedCampaignId();

                campaignOverView.getCampaignData(clientId, campaignId);
                campaignOverView.fetchAdFormats();
                campaignOverView.fetchGoals();
                campaignOverView.fetchPrimaryKpis();
                campaignOverView.fetchScreenType();
                campaignOverView.fetchUnitTypes();
            });

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
            $('.masterContainer').on('shown.bs.tab', '.leftNavLink', function () {
                var target;

                $('.leftNavLink')
                    .parents('li')
                    .removeClass('active');

                $(this)
                    .parents('li')
                    .addClass('active');

                target = $(this).attr('data-target');

                $('#myTabs')
                    .find(target + '-tab')
                    .closest('li')
                    .addClass('active');

                $(target).css('bottom', '-' + $(window).width() + 'px');
                $(target).animate({'bottom': '0px'}, '10');

                $scope.$broadcast('switchPlatformFunc', [target]);
            });

            $scope.$on('creativePopUpClosed',function () {
                $scope.enableOnlyCreativeTab=false;
            });

            $scope.changeStatus = function () {
                _.each($scope.selectedArr, function (obj) {
                    obj.checked = obj.userSelectedEvent;
                });
            };

            $scope.updateCreativeData = function (data) {
                $scope.creativeData.creativeInfo = {creatives: data.slice()};

                // set sizes on side bar.
                $scope.setSizes($scope.creativeData.creativeInfo);
            };

            $scope.setSizes = function (selectedCreatives) {
                var creativeSizeArrC = [],
                    arrC,
                    str,
                    result,
                    i,

                    noRepeatC = function (arrC) {
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
                    };

                if (typeof selectedCreatives.creatives !== 'undefined') {
                    if (selectedCreatives.creatives.length === 1) {
                        $scope.sizeString = selectedCreatives.creatives[0].size?selectedCreatives.creatives[0].size.size:'';
                    } else if (selectedCreatives.creatives.length > 1) {
                        $scope.sizeString = '';

                        for (i in selectedCreatives.creatives) {
                            creativeSizeArrC.push(selectedCreatives.creatives[i].size ?
                                selectedCreatives.creatives[i].size.size : null);
                        }
                        $scope.sizeString = creativeSizeArrC.filter(Boolean);
                        if($scope.sizeString.length === 0){
                            $scope.sizeString='Unspecified Size';
                        }else{
                            arrC = creativeSizeArrC.filter(Boolean);
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
                    }
                } else {
                    $scope.sizeString = constants.WF_NOT_SET;
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

            $scope.redirectToMediaPlanOverviewPage = function() {
                var campaignId = vistoconfig.getSelectedCampaignId();
                $location.url(urlBuilder.mediaPlanOverviewUrl(campaignId));
            };

            // on Broswers back button customreport behaving wierdly, this piece of code fixes it
            $scope.$on('$locationChangeStart', function (event, next) {
                if(next.indexOf('customreport') > -1){
                    var customReportUrl = next.split('/')[3];
                    $location.url('/' + customReportUrl);
                }
            });
        }]);
});
