define(['angularAMD', 'common/services/vistoconfig_service', 'workflow/services/workflow_service', 'login/login_model',
    'common/services/data_service', 'workflow/services/audience_service', 'common/services/role_based_service',
    'common/moment_utils', 'common/services/vistoconfig_service', 'workflow/services/video_service', 'common/utils',
    'workflow/ad/budget_delivery_controller', 'workflow/ad/buying_platform_controller',
    'workflow/ad/targetting_controller', 'workflow/ad/geo_targetting_controller',
    'workflow/ad/audience_targetting_controller', 'workflow/ad/daypart_create_controller',
    'workflow/ad/video_targetting_controller', 'workflow/ad/inventory_filters_controller',
    'workflow/creative/creative_controller', 'workflow/creative/creative_list_controller',
    'workflow/creative/creative_tag_controller', 'workflow/services/platform_custom_module',
    'workflow/ad/ad_clone_controller'], function (angularAMD) {
    angularAMD.controller('CampaignAdsCreateController', function ($scope, $modal, $rootScope, $routeParams,
                                                                   $locale, $location,  $filter, $timeout,
                                                                   constants, workflowService, loginModel,
                                                                   dataService, audienceService, RoleBasedService,
                                                                   momentService, vistoconfig, videoService, utils) {
        var winHeaderHeight = $(window).height() - 50,
            winHeight,

            saveDataInLocalStorage = function (data) {
                var campaignData = {
                    advertiserId: data.advertiserId,
                    advertiserName: data.advertiserName,
                    clientId: data.clientId,
                    clientName: data.clientName
                };

                localStorage.removeItem('campaignData');
                localStorage.setItem('campaignData', window.JSON.stringify(campaignData));
                $rootScope.$broadcast('adCampaignDataSet');
            },

            campaignOverView = {
                fetchSubAccounts: function (callabck) {
                    workflowService
                        .getSubAccounts('write')
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                callabck && callabck(result.data.data);
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                getCampaignData: function (campaignId) {
                    workflowService
                        .getCampaignData(campaignId)
                        .then(function (result) {
                            var responseData, clientId, advertiserId;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;

                                // redirect user to media plan list screen if new or edited ad
                                // is from archived campaign
                                if (responseData.isArchived) {
                                    $scope.isMediaPlanArchive = true;
                                }

                                $scope.workflowData.campaignData = responseData;
                                saveDataInLocalStorage(responseData);

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

                                campaignOverView.fetchSubAccounts(function(subAccountData) {
                                    subAccountData = _.find(subAccountData, function(data) {
                                        return data.id === clientId;
                                    });
                                    workflowService.setSubAccountTimeZone(subAccountData.timezone);
                                });

                                if ($scope.mode === 'edit') {
                                    if (!$scope.adGroupId) {
                                        workflowService
                                            .getAd({
                                                campaignId: $scope.campaignId,
                                                adId: $scope.adId
                                            })
                                            .then(function (result) {
                                                $scope.getAd_result = result.data.data;

                                                // redirect user to campaingn overview screen if ad is archived
                                                if ($scope.getAd_result.isArchived){
                                                    $scope.isMediaPlanArchive = true;
                                                    $scope.archivedAdFlag = true;
                                                }

                                                disablePauseEnableResume($scope.getAd_result);
                                                processEditMode(result, clientId, advertiserId);
                                            });
                                    } else {
                                        workflowService
                                            .getAdgroups($scope.campaignId)
                                            .then(function (result) {
                                                var responseData,
                                                    adGroupData = {},
                                                    n,
                                                    i;

                                                if (result.status === 'OK' || result.status === 'success') {
                                                    responseData = result.data.data.ad_groups;
                                                    $scope.workflowData.campaignGetAdGroupsData = responseData;
                                                    n = responseData.length;

                                                    for (i = 0; i < n; i++) {
                                                        if (responseData[i].adGroup.id ===
                                                            parseInt($scope.adGroupId)) {
                                                            adGroupData.startDate =
                                                                momentService
                                                                    .utcToLocalTime(
                                                                        responseData[i].adGroup.startTime
                                                                    );
                                                            adGroupData.endDate =
                                                                momentService
                                                                    .utcToLocalTime(
                                                                        responseData[i].adGroup.endTime
                                                                    );
                                                        }
                                                    }

                                                    $scope.workflowData.adGroupData = adGroupData;

                                                    // to get all ads with in ad group
                                                    workflowService
                                                        .getDetailedAdsInAdGroup($scope.campaignId,
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
                                                    campaignOverView.errorHandler(result);
                                                }
                                            }, campaignOverView.errorHandler);
                                    }
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
                        {id: 4, name: 'Social',     active: false}
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

                saveAds: function (postDataObj) {
                    var promiseObj;

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

                    promiseObj = $scope.adId ?
                        workflowService.updateAd(postDataObj) :
                        workflowService.createAd(postDataObj);

                    promiseObj.then(function (result) {
                        var responseData = result.data.data,
                            url;

                        $scope.adCreateLoader = false;

                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.state = responseData.state;
                            $scope.adId = responseData.id;
                            $scope.updatedAt = responseData.updatedAt;
                            $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_SUCCESS, 0);

                            localStorage.setItem('adPlatformCustomInputs',
                                window.JSON.stringify(responseData.adPlatformCustomInputs));

                            url = '/mediaplan/' + result.data.data.campaignId + '/overview';
                            $location.url(url);
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
                $scope.apiStartTime = responseData.startTime;

                $scope.adData.startTime = $scope.modifiedAPIStartTime =
                    momentService.utcToLocalTime(responseData.startTime);

                dateObj.adStartDate = $scope.adData.startTime;
            }

            if (responseData.endTime) {
                $scope.apiEndTime = responseData.endTime;

                $scope.adData.endTime = $scope.modifiedAPIEndTime =
                    momentService.utcToLocalTime(responseData.endTime);

                dateObj.adEndDate = $scope.adData.endTime;
            }

            localStorage.setItem('adsDates', window.JSON.stringify(dateObj));
            $scope.initiateDatePicker();

            if (responseData.rateValue !== '') {
                $scope.adData.unitCost = responseData.rateValue;
            }

            if (responseData.totalBudget >= 0) {
                $scope.adData.totalAdBudget=responseData.totalBudget;
                $('#targetUnitCost_squaredFour').prop('checked',responseData.enabledBudgetCalculation);

                $('.totalBudgetInputClass').attr('disabled', responseData.enabledBudgetCalculation);

                // disabled checkBox if its primary!=Impression && UnitCost!=CPM
                if (((responseData.kpiType && (responseData.kpiType).toUpperCase() !== 'IMPRESSIONS') ||
                    (responseData.rateType).toUpperCase()!== 'CPM') && responseData.enabledBudgetCalculation) {
                    $('.impressions_holder').find('input[type="checkbox"]').attr('disabled', true);
                } else {
                    $('.impressions_holder').find('input[type="checkbox"]').attr('disabled', false);
                }

                if (((responseData.kpiType && (responseData.kpiType).toUpperCase() === 'IMPRESSIONS')) &&
                    (responseData.rateType).toUpperCase() === 'CPM') {
                    $('.external_chkbox').show();
                } else {
                    $('.external_chkbox').hide();
                }
            }

            if (responseData.kpiType){
                $scope.adData.primaryKpi=responseData.kpiType;
                $scope.adData.targetValue=Number(responseData.kpiValue);

                if (((responseData.kpiType).toUpperCase() === 'CPM') ||
                    ((responseData.kpiType).toUpperCase() === 'CPA') ||
                    ((responseData.kpiType).toUpperCase() === 'CPC')) {
                    $('.KPI_symbol').html('$');
                } else if (((responseData.kpiType).toUpperCase() === 'VTC') ||
                    ((responseData.kpiType).toUpperCase() === 'CTR') ||
                    ((responseData.kpiType).toUpperCase() === 'ACTION RATE')) {
                    $('.KPI_symbol').html('%');
                } else {
                    $('.KPI_symbol').html('#');
                }
            }

            if (responseData.budgetValue >= 0) {
                $scope.adData.budgetAmount = Number(responseData.budgetValue);
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
                angular.forEach(responseData.frequencyCaps, function (frequencyCap) {
                    var freqType;

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

        $scope.redirectUser = function (isAdArchived) {
            var url;

            $scope.isMediaPlanArchive = false;
            $scope.archivedAdFlag = false;
            $scope.archivedCampaignFlag = false;

            if (isAdArchived) {
                if ($scope.workflowData.campaignData.isArchived) {
                    url = vistoconfig.MEDIA_PLANS_LINK;
                } else {
                    $scope.isMediaPlanArchive = false;
                    $scope.archivedAdFlag = false;
                    url = 'mediaplan/' + $scope.campaignId + '/overview';
                }
            } else {
                url = vistoconfig.MEDIA_PLANS_LINK;
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
            var previewUrl =  '/clientId/'+ creativeData.clientId +'/adv/'+ creativeData.advertiserId;
            if($scope.adId) {
                previewUrl += '/campaignId/'+ $scope.campaignId +'/adId/'+ $scope.adId +
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
                social: 'social'
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
                utcStartTime,
                utcEndTime,
                inventoryLists,
                dateTimeZone

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
                $scope.budgetErrorObj.availableMaximumAdRevenueValidator)) {
                $rootScope.setErrAlertMessage('Mandatory fields need to be specified for the Ad');
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

                dateTimeZone = workflowService.getSubAccountTimeZone();

                if (formData.startTime) {
                    utcStartTime = momentService.localTimeToUTC(formData.startTime, 'startTime', dateTimeZone);

                    // fixed for CW-4102
                    if ($scope.mode ==='edit') {
                        utcStartTime = (moment(formData.startTime)
                            .isSame($scope.modifiedAPIStartTime, 'day')) ?
                            $scope.apiStartTime : utcStartTime;
                    }

                    postAdDataObj.startTime = utcStartTime;
                }

                if (formData.endTime) {
                    utcEndTime = momentService.localTimeToUTC(formData.endTime, 'endTime', dateTimeZone);

                    // fixed for CW-4102
                    if ($scope.mode ==='edit') {
                        utcEndTime = (moment(formData.endTime)
                            .isSame($scope.modifiedAPIEndTime, 'day')) ?
                            $scope.apiEndTime :  utcEndTime;
                    }
                    postAdDataObj.endTime = utcEndTime;
                }

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
                        postAdDataObj.enabledBudgetCalculation =
                            ($('#targetUnitCost_squaredFour').prop('checked') === false) ? false : true;
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

                                        postGeoTargetObj.ZIPCODE.geoTargetList.push({
                                            countryCode:'US',
                                            zipcodes: _.pluck(
                                                postGeoTargetObj.ZIP_CODE.geoTargetList, 'code')
                                        });

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

                    // custom field section.
                    if (!$scope.TrackingIntegrationsSelected) {
                        if ($.isEmptyObject($scope.postPlatformDataObj)) {
                            $scope.saveCustomeFieldForPlatform(1);
                        }

                        postAdDataObj.adPlatformCustomInputs =
                            wrapperToReplaceCustomPlatformHiddenValues($scope.postPlatformDataObj);
                    }

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
                adData.targetValue.length === 0 ||
                adData.unitCost.length === 0 ||
                adData.totalAdBudget.length === 0 ||
                adData.budgetAmount.length === 0
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
        $scope.adData.budgetType = 'Cost';

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
            campaignOverView.getCampaignData($routeParams.campaignId);
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

        // on Broswers back button customreport behaving wierdly, this piece of code fixes it
        $scope.$on('$locationChangeStart', function (event, next) {
            if(next.indexOf('customreport') > -1){
                var customReportUrl = next.split('/')[3];
                $location.url('/' + customReportUrl);
            }
        });
    });
});
