var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CampaignAdsCreateController', function ($scope, $rootScope, $window, $routeParams, $locale,  constants, workflowService, $timeout, utils, $location, campaignListService, requestCanceller, $filter, loginModel, $q, dataService, apiPaths, audienceService, RoleBasedService, momentService) {
        $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
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
        //constants.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
        RoleBasedService.setCurrencySymbol();
        $scope.locale = $locale;
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
        $scope.dayPartTotal = 0;

        $scope.editCampaign = function (workflowcampaignData) {
            $location.url('/mediaplan/' + workflowcampaignData.id + '/edit');

        }

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date,format);
        }

        $scope.archiveAd = function (event) {
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $rootScope.setErrAlertMessage();
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

        $scope.pauseAd = function () {
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $rootScope.setErrAlertMessage($scope.textConstants.WF_AD_PAUSE_FAILURE);
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
        $scope.resumeAd = function () {
            var errorAchiveAdHandler = function () {
                $scope.adArchive = false;
                $rootScope.setErrAlertMessage($scope.textConstants.WF_AD_RESUME_FAILURE);
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
            $scope.resumeMessage = "Resume delivery for flight dates " + momentService.utcToLocalTime($scope.getAd_result.startTime, 'DD MMM YYYY') + " to " + momentService.utcToLocalTime($scope.getAd_result.endTime, 'DD MMM YYYY') + " ?";

            if ($scope.disable_resume != 'disabled')
                $scope.adResume = !$scope.adResume;
        }
        $scope.resetPartialSaveAlertMessage = function () {
            $rootScope.setErrAlertMessage("",0);
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
                'visto bidder': 'Visto_fav_icon',
                "visto bidder - test": 'Visto_fav_icon',
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
            if (platform)
                return platformMapper[platform.toLowerCase()];
        }

        $scope.getPlatformDesc = function (platform) {
            var platformMapper = {
                'collective bidder': 'The programmactic solution for all screens and format.',
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

        //edit mode data population

        function processEditMode(result, startDateElem) {
            var responseData = result.data.data;
            $scope.workflowData['adsData'] = responseData;
            if (responseData.adPlatformCustomInputs) {
                localStorage.setItem('adPlatformCustomInputs', JSON.stringify(responseData.adPlatformCustomInputs))
            }
            workflowService.setAdsDetails(angular.copy(responseData));

            $scope.updatedAt = responseData.updatedAt;
            $scope.state = responseData.state;
            // $scope.editTrackerAd=responseData.is_Tracker;
            if (responseData.sourceId) {
                $scope.editedAdSourceId = responseData.sourceId;
            }

            if (responseData.name)
                $scope.adData.adName = responseData.name;


            if (responseData.adFormat) {
                var format = $filter('toTitleCase')(responseData.adFormat);
                if(format==="Richmedia"){
                    format="Rich Media";
                }
                $scope.adFormatSelection(format,"","editData");
                $scope.adData.adFormat = format;

            }

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
                if(responseData.budgetType.toLowerCase() === 'cost') {
                    $scope.adData.budgetType = $filter('toTitleCase')(responseData.budgetType);
                } else {
                    $scope.adData.budgetTypeLabel = $scope.adData.budgetType = $filter('toTitleCase')(responseData.budgetType);
                }

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
                dateObj['adStartDate'] = $scope.adData.startTime = momentService.utcToLocalTime(responseData.startTime);
            }

            if (responseData.endTime) {
                dateObj['adEndDate'] = $scope.adData.endTime = momentService.utcToLocalTime(responseData.endTime);
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

                angular.forEach(responseData.frequencyCaps, function(frequencyCap) {
                    if(frequencyCap["targetType"] == "ALL"){
                        //$scope.adData.budgetAmount = frequencyCap['quantity'];
                        var pacingType = frequencyCap['pacingType'];
                        if (pacingType != "EVENLY") {
                            $('.spend_asap').addClass('active');
                            $('.spend_asap input').attr("checked", "checked");
                            $('.spend_evenly').removeClass('active');

                        }
                    }
                    if(frequencyCap["targetType"] == "PER_USER"){
                        $scope.adData.quantity = frequencyCap['quantity'];
                        $scope.capsPeriod = frequencyCap['frequencyType'];
                        var freqType = frequencyCap['frequencyType'];
                        if (freqType == "LIFETIME")
                            $scope.selectedFreq = 'Lifetime';
                        else if (freqType == "DAILY")
                            $scope.selectedFreq = 'Daily';
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
                        if($scope.workflowData['campaignData'].selectedObjectives &&$scope.workflowData['campaignData'].selectedObjectives.length>0){
                            $scope.brandIcon=_.filter($scope.workflowData['campaignData']. selectedObjectives,function(item){return item.objective==="Branding"});
                            $scope.performanceIcon=_.filter($scope.workflowData['campaignData']. selectedObjectives,function(item){return item.objective==="Performance"});
                        }
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
                $scope.workflowData['primaryKpi'] = [{ kpi_category: 'DELIVERY',
                    kpi_values: [{id: 1, name: 'Impressions', disabled:false},
                        {id: 2, name: 'Impressions within demographic', disabled:true},
                        {id: 3, name: 'Viewable Impressions', disabled:true},
                        {id: 4, name: 'Clicks', disabled:false},
                        {id: 5, name: 'Actions', disabled:false}

                    ]
                }, {
                    kpi_category: 'PERFORMANCE',
                    kpi_values: [{id: 1, name: 'Clickthrough Rate', disabled:false},
                        {id: 2, name: 'Cost Per Click', disabled:false},
                        {id: 3, name: 'Cost Per Action', disabled:true},
                        {id: 5, name: 'Viewabilty Rate', disabled:false}, // id 4 is not working due to some problem please debug if you can
                        {id: 6, name: 'In-Demo Rate', disabled:true}
                    ]
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

                $scope.adData.unitType = $scope.workflowData['unitTypes'][0];
            },

            saveAds: function (postDataObj, isDownloadTrackerClicked) {
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
                    if(result.status === "OK" || result.status === "success") {
                        $scope.state = responseData.state;
                        $scope.adId = responseData.id;
                        $scope.updatedAt = responseData.updatedAt;
                        if (!isDownloadTrackerClicked) {
                            $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_SUCCESS,0);
                            localStorage.setItem('adPlatformCustomInputs', JSON.stringify(responseData.adPlatformCustomInputs))
                            var url = '/mediaplan/' + result.data.data.campaignId + '/overview';
                            $location.url(url);
                            localStorage.setItem('topAlertMessage', $scope.textConstants.AD_CREATED_SUCCESS);
                        }
                    }
                    else {
                        $rootScope.setErrAlertMessage(responseData.message);
                    }
                }, function (errorObj) {
                    $scope.abc =  pe.textConstants.PARTIAL_AD_SAVE_FAILURE;
                    $rootScope.setErrAlertMessage($scope.textConstants.PARTIAL_AD_SAVE_FAILURE);
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
                if(errData.data.status === 404) {
                    $location.url('/mediaplans');
                }
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
        $scope.changeAdFormatContinue=function(){
            $scope.changeAdFormat=false;
            /*code to make creatives already set to empty*/
            $scope.adData.setSizes = constants.WF_NOT_SET;
            $scope.creativeData['creativeInfo'] = "undefined";
            $scope.selectedArr.length = 0;
            /*left nav*/
            $scope.adData.adFormat= $scope.adformatName;

            /*adFormatSelection code*/
            $scope.$broadcast('adFormatChanged', $scope.adformatName);
            var adFormatsData = $scope.workflowData['adFormats'];
            _.each(adFormatsData, function (obj) {
                obj.name === $scope.adformatName ? obj.active = true : obj.active = false;
            })
            var vedioKpiObj = {id: 4, name: 'View to Completion'};
            $scope.adData.primaryKpi = '';
            if($scope.adData.adFormat === 'Video') {
                $scope.workflowData['primaryKpi'][1]['kpi_values'].push(vedioKpiObj);
            } else {
                var index = _.findIndex($scope.workflowData['primaryKpi'][1]['kpi_values'], function(item) { return item.id === vedioKpiObj.id });
                if(index > 0) {
                    $scope.workflowData['primaryKpi'][1]['kpi_values'] = $scope.workflowData['primaryKpi'][1]['kpi_values'].slice(0, index);
                }
            }

        }
        $scope.changeAdFormatCancel=function(){
            $scope.changeAdFormat=false;
        }

        $scope.adFormatSelection = function (adformatName , event, editdata) {
            if(editdata!=="editData"){
                $scope.changeAdFormat=true;
                $scope.adformatName=adformatName;
                if(event) {
                    var offset = $(event.target).offset();
                    var left = offset.left;
                    var top = offset.top;
                    var relativeX = left - $(event.target).closest(".goalBtnWithPopup").offset().left - 110;
                    $(".goalBtnWithPopup .popUpCue").css({left: relativeX});
                }
            }else if(editdata==="editData"){ /*populating first time in editmode*/
                $scope.adformatName=adformatName;

                //if(angular.lowercase(adformatName)=="display")
                 //   $scope.adformatName="Display"
               // else if(angular.lowercase(adformatName)=="richmedia")
                 //   $scope.adformatName="Rich Media"

                $scope.$broadcast('adFormatChanged', $scope.adformatName);
                var adFormatsData = $scope.workflowData['adFormats'];
                _.each(adFormatsData, function (obj) {
                    obj.name === $scope.adformatName ? obj.active = true : obj.active = false;
                })
            }


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
        };

        // Buying Platform Slide Page
        $scope.showBuyingPlatformWindow = function () {
            $(".platform-custom").show().delay(300).animate({left: "50%", marginLeft: "-323px"}, 'slow');
            $(".offeringsWrap").hide();
        };

        $scope.frequencySelected = function (freqSelected) {
            $scope.selectedFreq = freqSelected;
        };

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
                    var clientId =  loginModel.getSelectedClient().id;
                    var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId + '/campaigns/' + $scope.campaignId + '/ads/' + $scope.adId + '/creatives?format=csv';
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

        $scope.CampaignADsave = function (isDownloadTrackerClicked) {
            var formElem = $("#formAdCreate");
            var formData = formElem.serializeArray();
            formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
            if ((formData.budgetAmount && $scope.formAdCreate.budgetAmount.$error.mediaCostValidator) ||  ($scope.budgetErrorObj.mediaCostValidator || $scope.budgetErrorObj.availableRevenueValidator || $scope.budgetErrorObj.impressionPerUserValidator || $scope.budgetErrorObj.availableMaximumAdRevenueValidator)) {
                $rootScope.setErrAlertMessage("Mandatory fields need to be specified for the Ad");
                return false;
            }

            var customFieldErrorElem = $(".customFieldErrorMsg");
            if (customFieldErrorElem.length > 0) {
                $rootScope.setErrAlertMessage("Mandatory fields need to be specified for the Ad");
                return false;
            } else {
                $(".workflowPreloader, .workflowPreloader .adSavePre").show();
                var creativesData = $scope.creativeData['creativeInfo'];
                var postAdDataObj = {};
                postAdDataObj.name = formData.adName;
                postAdDataObj.campaignId = Number($scope.campaignId);
                //postAdDataObj.state = $scope.workflowData['campaignData'].status;

                if (formData.adFormat)
                    postAdDataObj.adFormat = formData.adFormat.replace(/\s+/g, '').toUpperCase();

                if ($scope.editedAdSourceId)
                    postAdDataObj.sourceId = $scope.editedAdSourceId;

                if (formData.screens)
                    postAdDataObj.screens = _.pluck(JSON.parse(formData.screens), 'id');

                if (formData.goal)
                    postAdDataObj.goal = formData.goal;

                if (formData.startTime)
                    postAdDataObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');

                if (formData.endTime)
                    postAdDataObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');

                if ((!formData.startTime || !formData.endTime || !postAdDataObj.screens || !formData.adFormat || !formData.goal) && $scope.mode == 'edit' && $scope.isAdsPushed == true) {
                    $rootScope.setErrAlertMessage("Mandatory fields need to be specified for the Ad");
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
                        if ($.isEmptyObject($scope.postPlatformDataObj)) {
                            $scope.saveCustomeFieldForPlatform(1);
                        }
                        postAdDataObj['adPlatformCustomInputs'] = $scope.postPlatformDataObj;
                    }
                    campaignOverView.saveAds(postAdDataObj, isDownloadTrackerClicked)
                }
            }
        }


        $scope.triggerbudgetTab = function(){
            angular.element('.budget-tab-link').trigger('click');
        }

        $scope.triggerPlatformTab = function(){
            angular.element('.buying-platform-tab-link').trigger('click');
        }

        $scope.triggerTargetting = function(){
            //$('.targetting-tab-link').trigger('click');
            angular.element('.targetting-tab-link').trigger('click');
        }
        $scope.triggerInventory = function(){
            angular.element('.inventory-tab-link').trigger('click');
        }
        $scope.trigerCreativeTag = function(){
            angular.element('.creative-tab-link').trigger('click');
        }


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
            $scope.dayPartTotal =  ($scope.selectedDayParts['data'])?$scope.selectedDayParts['data'].length:0;
        }
    });
})();