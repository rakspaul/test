define(['angularAMD', 'common/services/constants_service', 'workflow/services/workflow_service', 'common/moment_utils',
    'common/services/vistoconfig_service', 'workflow/controllers/get_adgroups_controller',
    'workflow/directives/edit_ad_group_section'],
    function (angularAMD) {
        angularAMD.controller('CampaignOverViewController', function ($scope, $rootScope, $routeParams, $timeout,
                                                                      $location, $route, constants, workflowService,
                                                                      momentService, vistoconfig, featuresService) {
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
            if ($('.adGroupSelectionWrap').length) {
                $('html').css({'background-color': '#eef5fc'});
            }

            $scope.sizeString = '';
            $scope.textConstants = constants;
            $scope.workflowData = {};
            $scope.workflowData.getADsForGroupData = {};
            $scope.disablePushBtn = true;
            //$scope.notPushed = false; // this is not used anywhere
            $scope.showHideToggle = false;
            $scope.showIndividualAds = false;
            $scope.showCreateAdGrp = false;
            $scope.createGroupMessage = false;
            $scope.showPushAdsLoader = false;
            $scope.brand = [];
            $scope.performance = [];
            $scope.redirectFlag = false;
            localStorage.setItem('campaignData', '');
            $scope.tags = [];
            $scope.loadingBtn = false;

            //$scope.moreThenThree = '';// not used
            $scope.campaignArchiveLoader = false;
            $scope.editCampaign = function (workflowcampaignData) {
                $location.url('/mediaplan/' + workflowcampaignData.id + '/edit');
            };

            $scope.utcToLocalTime = function (date, format) {
                return momentService.utcToLocalTime(date, format);
            };

            $scope.resetAlertMessage = function () {
                localStorage.removeItem('topAlertMessage');
                $rootScope.setErrAlertMessage('', 0);
            };

            $('.bodyWrap').css('padding', '0');

            var fparams = featuresService.getFeatureParams();
            $scope.showAdSetUp = 'fparams[0].ad_setup';

            $rootScope.$on('features',function() {
                var fparams = featuresService.getFeatureParams();
                $scope.showAdSetUp = 'fparams[0].ad_setup';
            });

            //show selected targets in ads card
            $scope.displaySelectedTargets = function (adsData) {
                var selectedStr = '';
                if (adsData) {
                    if ((adsData.targets.geoTargets.REGION &&
                        adsData.targets.geoTargets.REGION.geoTargetList.length > 0) ||
                        (adsData.targets.geoTargets.DMA &&
                        adsData.targets.geoTargets.DMA.geoTargetList.length > 0) ||
                        (adsData.targets.geoTargets.ZIP_CODE &&
                        adsData.targets.geoTargets.ZIP_CODE.geoTargetList.length > 0) ||
                        (adsData.targets.geoTargets.CITY &&
                        adsData.targets.geoTargets.CITY.geoTargetList.length > 0)) {
                        selectedStr += 'Geo';
                    }

                    if ((adsData.targets.segmentTargets.segmentList &&
                        adsData.targets.segmentTargets.segmentList.length > 0)) {
                        if (selectedStr !== '') {
                            selectedStr += ', Audience';
                        } else {
                            selectedStr += 'Audience';
                        }
                    }

                    if (adsData.targets.adDaypartTargets.schedule &&
                        adsData.targets.adDaypartTargets.schedule.length > 0) {
                        if (selectedStr !== '') {
                            selectedStr += ', Daypart';
                        } else {
                            selectedStr += 'Daypart';
                        }
                    }

                    if (selectedStr === '') {
                        selectedStr = constants.WF_NOT_SET;
                    }
                }

                return selectedStr;
            };

            //Archive save func more
            $scope.archiveCampaign = function (event) {
                var campaignId = $scope.workflowData.campaignData.id,
                    campaignArchiveErrorHandler = function () {
                        $scope.campaignArchive = false;
                        $scope.campaignArchiveLoader = false;
                        $rootScope.setErrAlertMessage();
                    };

                $scope.campaignArchiveLoader = true;
                event.preventDefault();

                workflowService
                    .deleteCampaign(campaignId)
                    .then(function (result) {
                        var campaignName;

                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.campaignArchive = false;
                            $scope.campaignArchiveLoader = false;
                            campaignName = $scope.workflowData.campaignData.name;
                            localStorage.setItem('topAlertMessage', campaignName + ' has been archived');
                            $location.url(vistoconfig.MEDIA_PLANS_LINK);
                        } else {
                            campaignArchiveErrorHandler();
                        }
                    }, campaignArchiveErrorHandler);
            };

            $scope.cancelArchiveCampaign = function () {
                $scope.campaignArchive = !$scope.campaignArchive;
            };

            $scope.processObjectiveData = function (objectiveObj) {
                var brandingArr = _.filter(objectiveObj, function (obj) {
                        return obj.objective === 'Branding';
                    }),
                    performanceArr = _.filter(objectiveObj, function (obj) {
                        return obj.objective === 'Performance';
                    }),
                    tooltip,
                    i;

                if (brandingArr.length > 0) {
                    $scope.brand = brandingArr[0].subObjectives;
                    tooltip = 'Branding: ' + $scope.brand[0];
                    for (i = 1; i < $scope.brand.length; i++) {
                        tooltip += ',' + $scope.brand[i];
                    }
                    $scope.brandTooltip = tooltip;
                }

                if (performanceArr.length > 0) {
                    $scope.performance = performanceArr[0].subObjectives;
                    tooltip = 'Performance: ' + $scope.performance[0];
                    for (i = 1; i < $scope.performance.length; i++) {
                        tooltip += ',' + $scope.performance[i];
                    }
                    $scope.performanceTooltip = tooltip;
                }
            };

            var campaignOverView = {
                modifyCampaignData: function () {
                    var campaignData = $scope.workflowData.campaignData,
                        end = momentService.utcToLocalTime(campaignData.endTime),
                        start = momentService.utcToLocalTime(campaignData.startTime);

                    campaignData.numOfDays = moment(end).diff(moment(start), 'days');
                },

                getCampaignData: function (campaignId) {
                    workflowService
                        .getCampaignData(campaignId)
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                //redirect user to media plan list screen if campaign is archived campaign
                                if (result.data.data.isArchived) {
                                    $scope.redirectFlag = true;
                                }

                                responseData = result.data.data;
                                $scope.workflowData.campaignData = responseData;

                                if (responseData.selectedObjectives && responseData.selectedObjectives.length > 0) {
                                    $scope.processObjectiveData(responseData.selectedObjectives);
                                }

                                if (responseData.primaryKpi) {
                                    if (responseData.primaryKpi === 'IMPRESSIONS') {
                                        $scope.primaryKpiSelected = 'Impressions';
                                    } else if (responseData.primaryKpi === 'CLICKS') {
                                        $scope.primaryKpiSelected = 'Clicks';
                                    } else if (responseData.primaryKpi === 'ACTIONS') {
                                        $scope.primaryKpiSelected = 'Actions';
                                    } else if (responseData.primaryKpi === 'VIEWABLE_IMPRESSIONS') {
                                        $scope.primaryKpiSelected = 'Impressions';
                                    }
                                }

                                $scope.campaignStartTime =
                                    momentService.utcToLocalTime($scope.workflowData.campaignData.startTime);
                                $scope.campaignEndTime =
                                    momentService.utcToLocalTime($scope.workflowData.campaignData.endTime);

                                if ($scope.workflowData.campaignData.pushable) {
                                    $scope.disablePushBtn = false;
                                }

                                campaignOverView.modifyCampaignData();
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                adsDataMofiderFunc: function (adsData) {
                    var budgetType,
                        rateType,
                        labelObj = {
                            'cpm': 'Imps.',
                            'cpc': 'Clicks',
                            'cpa': 'Actions'
                        };

                    //calculatedValue =  impression , clicks and actions value
                    _.each(adsData, function (data) {
                        budgetType = data.budgetType && data.budgetType.toLowerCase();
                        rateType = data.rateType && data.rateType.toLowerCase();

                        if (budgetType === 'impressions') {
                            data.budgetType = 'Imps.';
                        }

                        data.label = labelObj[rateType];

                        if (budgetType === 'cost') {
                            data.cost = data.budgetValue;
                            if (rateType === 'cpm') {
                                data.calculatedValue = (data.budgetValue / data.rateValue) * 1000;
                            }

                            if (rateType === 'cpc' || rateType === 'cpa') {
                                data.calculatedValue = data.budgetValue / data.rateValue;
                            }
                        } else {
                            data.calculatedValue = data.budgetValue;
                            if (rateType === 'cpm') {
                                data.cost = (data.budgetValue / 1000) * (data.rateValue);
                            }
                            if (rateType === 'cpc' || rateType === 'cpa') {
                                data.cost = data.budgetValue * data.rateValue;
                            }
                        }
                    });
                    return adsData;
                },

                getAdsForCampaign: function (campaignId) {
                    workflowService
                        .getAdsForCampaign(campaignId)
                        .then(function (result) {
                            var responseData,
                                i,
                                isAdsInProgressState;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;

                                for (i in responseData) {
                                    if (responseData[i].state === 'IN_FLIGHT') {
                                        responseData[i].state = 'IN FLIGHT';
                                    }
                                    if (responseData[i].state === 'IN_PROGRESS') {
                                        responseData[i].state = 'DEPLOYING';
                                    }
                                }

                                // call extract method if
                                $scope.workflowData['campaignAdsData'] =
                                    campaignOverView.adsDataMofiderFunc(responseData);

                                isAdsInProgressState = _.filter(responseData, function (obj) {
                                    return obj.state === 'DEPLOYING';
                                });

                                if (isAdsInProgressState && isAdsInProgressState.length > 0) {
                                    $timeout(function () {
                                        campaignOverView.getAdsForCampaign($routeParams.campaignId);
                                    }, 15000);
                                }
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                getAdgroups: function (campaignId) {
                    workflowService
                        .getAdgroups(campaignId)
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;
                                $scope.workflowData.campaignGetAdGroupsData = responseData;
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                getAdsInAdGroup: function (campaignId, adGroupId, index) {
                    workflowService
                        .getAdsInAdGroup(campaignId, adGroupId)
                        .then(function (result) {
                            var responseData,
                                i,
                                isAdsInProgressState;

                            if (result.status === 'OK' || result.status === 'success') {
                                responseData = result.data.data;

                                for (i in responseData) {
                                    if (responseData[i].state === 'IN_FLIGHT') {
                                        responseData[i].state = 'IN FLIGHT';
                                    }
                                    if (responseData[i].state === 'IN_PROGRESS') {
                                        responseData[i].state = 'DEPLOYING';
                                    }
                                }

                                $scope.workflowData.getADsForGroupData[index] =
                                    campaignOverView.adsDataMofiderFunc(responseData);

                                isAdsInProgressState = _.filter(responseData, function (obj) {
                                    return obj.state === 'DEPLOYING';
                                });

                                if (isAdsInProgressState && isAdsInProgressState.length > 0) {
                                    $timeout(function () {
                                        campaignOverView.getAdsInAdGroup($routeParams.campaignId, adGroupId, index);
                                    }, 15000);
                                }
                            } else {
                                campaignOverView.errorHandler(result);
                            }
                        }, campaignOverView.errorHandler);
                },

                pushSavedCampaign: function (campaignId) {
                    $scope.showPushAdsLoader = true;

                    workflowService
                        .pushCampaign(campaignId)
                        .then(function (result) {
                            $scope.showPushAdsLoader = false;
                            if (result.status === 'OK' || result.status === 'success') {
                                $route.reload();
                            }
                        });
                },

                errorHandler: function (errData) {
                    if (errData.data.status === 404) {
                        $location.url('/mediaplans');
                    }
                }
            };

            $scope.redirectUserFromArchivedCampaign = function () {
                $scope.redirectFlag = false;
                $location.url(vistoconfig.MEDIA_PLANS_LINK);
            };

            $scope.utc = function (date) {
                return moment(date).utc().valueOf();
            };

            $scope.getAdFormatIconName = function (adFormat) {
                var adFormatMapper = {
                    display: 'picture',
                    video: 'film',
                    'rich media': 'paperclip',
                    social: 'user'
                };

                return adFormatMapper[adFormat.toLowerCase()];
            };

            campaignOverView.getCampaignData($routeParams.campaignId);
            campaignOverView.getAdsForCampaign($routeParams.campaignId);
            campaignOverView.getAdgroups($routeParams.campaignId);

            $(function () {
                $('#pushCampaignBtn').on('click', function () {
                    campaignOverView.pushSavedCampaign($routeParams.campaignId);
                });
            });

            $scope.navigateToAdCreatePage = function () {
                var redirectUrl = '/mediaplan/' + $scope.workflowData.campaignData.id + '/ads/create';
                $location.url(redirectUrl);
            };


            $scope.appendSizes = function (creative) {
                var creativeSizeArr = [],
                    i,
                    arr,
                    result,
                    creativeSizeLimit,
                    remainingCreativeSize,
                    amountLeft;

                if (typeof creative !== 'undefined' && creative.length > 0 && creative[0].size) {
                    if (creative.length === 1) {
                        $scope.sizeString = creative[0].size.size;
                    } else if (creative.length > 1) {
                        $scope.sizeString = '';
                        for (i in creative) {
                            creativeSizeArr.push(creative[i].size.size);
                        }

                        $scope.sizeString = creativeSizeArr;
                        arr = creativeSizeArr;
                        result = noRepeat(arr);

                        if (result[0].length > 3) {
                            creativeSizeLimit = result[0].splice(0, 3);
                            remainingCreativeSize = result[0].join(', ');
                            amountLeft = result[0].length;
                            $scope.sizeString = creativeSizeLimit.join(', ').replace(/X/g, 'x') +
                                ' <span class="blueTxt" title="' +
                                remainingCreativeSize +
                                '" >+' +
                                amountLeft +
                                '</span>';
                        } else {
                            $scope.sizeString = result[0] && result[0].join(', ');
                        }
                    }

                } else {
                    $scope.sizeString = constants.WF_NOT_SET;
                }

                function noRepeat(arr) {
                    var a = [],
                        b = [],
                        prev,
                        i;

                    arr.sort();
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i] !== prev) {
                            a.push(arr[i]);
                            b.push(1);
                        } else {
                            b[b.length - 1]++;
                        }
                        prev = arr[i];
                    }

                    return [a, b];
                }

                return $scope.sizeString;
            };

            $scope.ToggleAdGroups = function (context, adGrpId, index, event) {
                var elem = $(event.target);

                if (context.showHideToggle) {
                    //Closes
                    elem.closest('.adGroup').removeClass('openInstance').addClass('closedInstance') ;
                    elem.closest('.collapseIcon span').removeClass('icon-minus').addClass('icon-plus') ;
                    context.showHideToggle = !context.showHideToggle
                } else {
                    //Opens
                    elem.closest('.adGroup').removeClass('closedInstance').addClass('openInstance') ;
                    elem.closest('.collapseIcon span').removeClass('icon-plus').addClass('icon-minus') ;
                    context.showHideToggle = !context.showHideToggle;
                    campaignOverView.getAdsInAdGroup($routeParams.campaignId, adGrpId, index);
                }
            };

            $scope.createAdGrp = function () {
                var adGroupCreateformElem = $('.adGroupCreate').find('form'),
                    endDateElem,
                    startDateElem,
                    setStartDate;

                $scope.showCreateAdGrp = !$scope.showCreateAdGrp;
                adGroupCreateformElem[0].reset();
                $scope.$broadcast('show-errors-reset');
                $('.adGroupSelectionWrap, .singleCardWrap').toggleClass('active');
                $scope.createGroupMessage = false;
                $scope.createGroupMessage = false;
                $scope.tags = [];
                $scope.adGroupMinBudget = 0;
                $scope.adGroupMaxBudget =
                    $scope.workflowData.campaignData.deliveryBudget - $scope.workflowData.campaignData.bookedSpend;

                if ($scope.workflowData.campaignAdsData.length > 0) {
                    var campaignAdsData  = $scope.workflowData.campaignAdsData;
                    $scope.adGroupMinBudget = campaignAdsData.reduce(function(memo, obj) {
                        return memo + obj.cost;
                    }, 0);
                    $scope.adIGroupBudget = $scope.adGroupMinBudget;
                    $scope.extractor($scope.workflowData.campaignAdsData, adGroupCreateformElem);
                } else {
                    $scope.resetAdsData();
                    startDateElem = adGroupCreateformElem.find('.adGrpStartDateInput');
                    endDateElem = adGroupCreateformElem.find('.adGrpEndDateInput');
                    setStartDate = $scope.campaignStartTime;

                    if (moment().isAfter(setStartDate, 'day')) {
                        setStartDate = moment().format(constants.DATE_US_FORMAT);
                    }

                    startDateElem.datepicker('setStartDate', setStartDate);
                    startDateElem.datepicker('setEndDate', $scope.campaignEndTime);
                }
            };

            $scope.isMinimumAdGroupBudget = true;
            $scope.isMaximumAdGroupBudget = true;

            $scope.validateAdGroupSpend = function (event) {
                var target = event.target,
                    newadGroupBudget = Number(target.value),
                    minValue = Number($(target).attr('min-value')),
                    maxValue = Number($(target).attr('max-value'));

                if (newadGroupBudget < minValue) {
                    $scope.isMinimumAdGroupBudget = false;
                } else if (newadGroupBudget > maxValue) {
                    $scope.isMaximumAdGroupBudget = false;
                } else {
                    $scope.isMinimumAdGroupBudget = true;
                }
            };

            $scope.resetAdsData  = function() {
                $scope.independantAdData = {};
            };

            $scope.extractor = function (IndividualAdsData, formElem) {
                var startDatelow = [],
                    endDateHigh = [],
                    ascending = _.sortBy(startDatelow, function (o) {//method to find lowest startTime
                        return o.startTime;
                    }),
                    startDateElem = formElem.find('.adGrpStartDateInput'),
                    i,
                    lowestStartTime,
                    ind,
                    //method to find the highest endTime
                    descending = _.sortBy(endDateHigh, function (o) {
                        return o.endTime;
                    }),
                    endDateElem,
                    highestEndTime;

                $scope.independantAdData = IndividualAdsData;
                console.log('inside extractor  independantAdData', $scope.independantAdData);

                //find lowest startDate
                for (i in IndividualAdsData) {
                    if (IndividualAdsData[i].startTime) {
                        startDatelow.push(IndividualAdsData[i]);
                    }
                }

                if (ascending.length > 0) {
                    lowestStartTime = momentService.utcToLocalTime(ascending[0].startTime);
                    startDateElem.datepicker('setStartDate', $scope.campaignStartTime);
                    startDateElem.datepicker('setEndDate', lowestStartTime);
                } else {
                    startDateElem.datepicker('setStartDate', $scope.campaignStartTime);
                    startDateElem.datepicker('setEndDate', $scope.campaignStartTime);
                }

                //find highest end date.
                for (ind in IndividualAdsData) {
                    if (IndividualAdsData[ind].endTime) {
                        endDateHigh.push(IndividualAdsData[ind]);
                    }
                }

                descending.reverse();

                endDateElem = formElem.find('.adGrpEndDateInput');
                if (descending.length > 0) {
                    highestEndTime = momentService.utcToLocalTime(descending[0].endTime);
                    endDateElem.datepicker('setStartDate', highestEndTime);
                    endDateElem.datepicker('setEndDate', $scope.campaignEndTime);
                } else {
                    endDateElem.datepicker('setStartDate', $scope.campaignEndTime);
                    endDateElem.datepicker('setEndDate', $scope.campaignEndTime);
                }
            };

            $scope.handleFlightDate = function (formElem, startTime) {
                //var formElem = $(event.target).closest('form');
                var endDateElem = formElem.find('.adGrpEndDateInput'),
                    campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime),
                    changeDate;

                if (!$scope.workflowData.campaignData) {
                    return;
                }

                endDateElem
                    .attr('disabled', 'disabled')
                    .css({'background': '#eee'});

                if (startTime) {
                    endDateElem
                        .removeAttr('disabled')
                        .css({'background': 'transparent'});
                    changeDate = moment(startTime).format(constants.DATE_US_FORMAT);
                    endDateElem.datepicker('setStartDate', changeDate);
                    endDateElem.datepicker('setEndDate', campaignEndTime);
                    if (moment(startTime).isAfter(changeDate, 'day')) {
                        endDateElem.datepicker('update', changeDate);
                    }
                }
            };

            $scope.createAdGroup = function (event) {
                var formElem,
                    formData,
                    dataArray = [],
                    i,
                    postCreateAdObj,
                    adGroupSaveErrorHandler = function(data) {
                        data = data || '';
                        $scope.downloadingTracker = false;
                        if (data && data.data && data.data.data.data[0]) {
                            var errMsg = _.values(data.data.data.data[0])[0];
                        }
                        $rootScope.setErrAlertMessage(errMsg);
                    },
                    isCampaignHasAds =  $scope.workflowData.campaignAdsData &&
                        $scope.workflowData.campaignAdsData.length > 0 ? true : false;

                $scope.$broadcast('show-errors-check-validity');
                $scope.loadingBtn = true;

                if ($scope.isMinimumAdGroupBudget && $scope.isMaximumAdGroupBudget) {
                    formElem = $(event.target).closest('form');
                    formData = formElem.serializeArray();
                    formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                    postCreateAdObj = {};
                    postCreateAdObj.name = formData.adGroupName;
                    postCreateAdObj.startTime = momentService.localTimeToUTC(formData.startTime, 'startTime');
                    postCreateAdObj.endTime = momentService.localTimeToUTC(formData.endTime, 'endTime');
                    postCreateAdObj.createdAt = '';
                    postCreateAdObj.updatedAt = formData.adgroupId ? formData.updatedAt : '';
                    postCreateAdObj.deliveryBudget = formData.adIGroupBudget;
                    postCreateAdObj.labels = _.pluck(JSON.parse(formData.ad_label), 'label');
                    if (formData.adgroupId) {
                        postCreateAdObj.adgroupId = Number(formData.adgroupId);
                    }

                    if (isCampaignHasAds || formData.adgroupId) {
                        postCreateAdObj.id = '-9999';
                        for (i in $scope.independantAdData) {
                            dataArray.push($scope.independantAdData[i].id);
                        }

                        postCreateAdObj.adIds = dataArray;
                    }

                    workflowService[formData.adgroupId ? 'editAdGroups' : 'createAdGroups']
                        ($routeParams.campaignId, postCreateAdObj).then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.loadingBtn = false;
                                formElem[0].reset();
                                $scope.$broadcast('show-errors-reset');
                                $scope.showCreateAdGrp = !$scope.showCreateAdGrp;
                                $scope.createGroupMessage = !$scope.createGroupMessage;
                                if (formData.adgroupId) {
                                    $scope.createAdGroupMessage = 'Ad Group Edited Successfully';
                                    localStorage.setItem('topAlertMessage', $scope.textConstants.AD_GROUP_EDITED_SUCCESS);
                                } else {
                                    $scope.createAdGroupMessage =
                                        isCampaignHasAds ? 'Successfully grouped Ads' : 'Ad Group Created Successfully';
                                    localStorage.setItem('topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS);
                                }
                                $route.reload();

                            } else {
                                $scope.loadingBtn = false;
                                if (result.status === 'error' && result.data.status === 400) {
                                    adGroupSaveErrorHandler(result);
                                } else {
                                    $scope.createGroupMessage = !$scope.createGroupMessage;
                                    $scope.createAdGroupMessage = 'Ad Group not Created';
                                }
                            }
                        });
                }
            };


            $scope.goEdit = function ( adsData ,unallocatedBudget,groupBudget) {
                var campaignId = adsData.campaignId,
                    adsId = adsData.id,
                    groupId = adsData.adGroupId;

                workflowService.setUnallocatedAmount(unallocatedBudget);
                localStorage.setItem('unallocatedAmount',unallocatedBudget);
                localStorage.setItem('groupBudget',Number(groupBudget));
                $scope.editAdforAdGroup(campaignId , adsData.startTime, adsData.endTime, adsId, groupId);
            };

            $scope.editAdforAdGroup = function (campaignId, stTime, edTime, adsId, groupId) {
                var path = '/mediaplan/' + campaignId + '/ads/' + adsId + '/edit';

                if (typeof(Storage) !== 'undefined') {
                    localStorage.setItem('stTime', stTime); //convert this to EST in ads page
                    localStorage.setItem('edTime', edTime); //convert this to EST in ads create page
                }

                if (groupId && adsId) {
                    path = '/mediaplan/' + campaignId + '/adGroup/' + groupId + '/ads/' + adsId + '/edit';
                }

                $location.path(path);
            };

            // Switch BTN Animation
            $('.btn-toggle').click(function () {
                $(this).find('.btn').toggleClass('active');

                if ($(this).find('.btn-success').size() > 0) {
                    $(this).find('.btn').toggleClass('btn-success');
                }

                $(this).find('.btn').toggleClass('btn-default');

            });

            $scope.$watch($scope.tags, function () {
                //console.log('log == ',$scope.tags);
            });

            $scope.calculateBudget = function(adGroupsData){
                if ((adGroupsData.deliveryBudget)) {
                    return adGroupsData.deliveryBudget;
                } else {
                    if (adGroupsData.bookedSpend){
                        return adGroupsData.bookedSpend;
                    } else {
                        return 0;
                    }

                    // return $scope.workflowData.campaignData.deliveryBudget -
                    // $scope.workflowData.campaignData.bookedSpend + adGroupsData.bookedSpend;
                }
            };

            $scope.calculateSpendBudget = function(adGroupsData){
                var deliveryBudget = $scope.calculateBudget(adGroupsData);

                if (parseInt(deliveryBudget) === 0 ){
                    return 0;
                } else{
                    if (adGroupsData.bookedSpend && adGroupsData.bookedSpend > 0){
                        return deliveryBudget - adGroupsData.bookedSpend;
                    } else {
                        return deliveryBudget;
                    }
                }
            };

            //Search Hide / Show
            $scope.searchShowInput = function () {
                var searchInputForm = $('.searchInputForm');

                $('.searchInputBtn').hide();
                searchInputForm.show();
                searchInputForm.animate({width: '400px'}, 'fast');
            };

            $scope.searchHideInput = function () {
                var inputSearch = $('.searchInputForm input');

                //isSearch = false; // TODO: This global var has no impact ???

                $('.searchInputForm').animate({width: '44px'}, 'fast');
                inputSearch.val('');
                setTimeout(function(){ $('.searchInputForm').hide(); }, 300);
                setTimeout(function(){ $('.searchInputBtn').fadeIn(); }, 300);
            };

            $(document).on('changeDate', '.adGrpStartDateInput', function(ev) {
                var formElem = $(ev.target).closest('form'),
                    startTime = $(ev.target).val();
                
                $scope.startTime = startTime;
                $scope.handleFlightDate(formElem, startTime);
            });
    });
});
