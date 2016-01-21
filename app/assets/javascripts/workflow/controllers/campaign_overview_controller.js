var angObj = angObj || {};
(function () {
    'use strict';

    angObj.controller('CampaignOverViewController', function ($scope,$rootScope, $window, $routeParams, constants, workflowService, $timeout,$location, utils, momentService) {
        $(".main_navigation_holder").find('.active_tab').removeClass('active_tab') ;
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
        $(".bodyWrap").addClass('bodyWrapOverview');
        if( $('.adGroupSelectionWrap').length ) { $("html").css({'background-color':'#eef5fc'}); };
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.workflowData['getADsForGroupData'] = {}
        $scope.disablePushBtn = true;
        $scope.notPushed = false;
        $scope.sizeString = "";
        $scope.showHideToggle = false;
        $scope.showIndividualAds = false;
        $scope.showCreateAdGrp=false;
        $scope.createGroupMessage=false;
        $scope.createGroupMessage=false;
        $scope.brand=[];
        $scope.performance=[];
        localStorage.setItem('campaignData','');
        $scope.moreThenThree = '';
        $scope.editCampaign=function(workflowcampaignData){
            $location.url('/mediaplan/'+workflowcampaignData.id+'/edit');
        }
        $scope.utcToLocalTime=function(date, format){
            return momentService.utcToLocalTime(date,format);
        }
        $scope.resetAlertMessage = function(){
            localStorage.removeItem('topAlertMessage');
            $rootScope.setErrAlertMessage("",0);
        }

        //show selected targets in ads card
        $scope.displaySelectedTargets = function (adsData) {
            var selectedStr = '';

            if(adsData){
                if((adsData.targets.geoTargets.REGION && adsData.targets.geoTargets.REGION.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.DMA && adsData.targets.geoTargets.DMA.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.ZIP_CODE && adsData.targets.geoTargets.ZIP_CODE.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.CITY && adsData.targets.geoTargets.CITY.geoTargetList.length > 0)) {
                    selectedStr += 'Geo';

                }

                if ((adsData.targets.segmentTargets.segmentList && adsData.targets.segmentTargets.segmentList.length > 0)) {
                    if(selectedStr != ''){
                        selectedStr += ', Audience';
                    }
                    else{
                        selectedStr += 'Audience';

                    }
                }

                if (adsData.targets.adDaypartTargets.schedule && adsData.targets.adDaypartTargets.schedule.length > 0) {
                    if(selectedStr != ''){
                        selectedStr += ', Daypart';
                    }
                    else{
                        selectedStr += 'Daypart';

                    }
                }

                if(selectedStr == '')
                    selectedStr = constants.WF_NOT_SET;
            }

            return selectedStr;
        };

        //Archive save func more
        $scope.archiveCampaign=function(event){
            event.preventDefault();
            var campaignId = $scope.workflowData['campaignData'].id;
            var campaignArchiveErrorHandler=function(){
                $scope.campaignArchive=false;
                $rootScope.setErrAlertMessage();
            }
            workflowService.deleteCampaign(campaignId).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    $scope.campaignArchive=false;
                    var url = '/mediaplans';
                    var campaignName = $scope.workflowData['campaignData'].name;
                    localStorage.setItem('topAlertMessage', campaignName+" has been archived");
                    $location.url(url);
                }else{
                    campaignArchiveErrorHandler();
                }
            },campaignArchiveErrorHandler);
        }
        $scope.cancelArchiveCampaign=function(){
            $scope.campaignArchive=!$scope.campaignArchive;
        }
        $scope.processObjectiveData=function(objectiveObj){
            var brandingArr=_.filter(objectiveObj,function(obj){return obj.objective==="Branding"})
            if(brandingArr.length>0){
                $scope.brand=brandingArr[0].subObjectives;
                var tooltip="Branding: " + $scope.brand[0];
                for(var i=1;i<$scope.brand.length;i++){
                    tooltip+=","+$scope.brand[i];
                }
                $scope.brandTooltip=tooltip;
            }
            var performanceArr=_.filter(objectiveObj,function(obj){return obj.objective==="Performance"})
            if(performanceArr.length>0){
                $scope.performance=performanceArr[0].subObjectives;
                var tooltip="Performance: " + $scope.performance[0];
                for(var i=1;i<$scope.performance.length;i++){
                    tooltip+=","+$scope.performance[i];
                }
                $scope.performanceTooltip=tooltip;
            }

        }

        var campaignOverView = {

            modifyCampaignData: function () {
                var campaignData = $scope.workflowData['campaignData'];
                var end=momentService.utcToLocalTime(campaignData.endTime);
                var start=momentService.utcToLocalTime(campaignData.startTime);
                campaignData.numOfDays = moment(end).diff(moment(start), 'days');
                // campaignData.numOfDays = moment(campaignData.endTime).diff(moment(campaignData.startTime), 'days');
            },

            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        if(responseData.selectedObjectives && responseData.selectedObjectives.length>0){
                            $scope.processObjectiveData(responseData.selectedObjectives);
                        }
                        if(responseData.primaryKpi){
                            if(responseData.primaryKpi==="IMPRESSIONS")
                                $scope.primaryKpiSelected="Impressions"
                            else if(responseData.primaryKpi==="CLICKS")
                                $scope.primaryKpiSelected="Clicks"
                            else if(responseData.primaryKpi==="ACTIONS")
                                $scope.primaryKpiSelected="Actions"
                            else if(responseData.primaryKpi==="VIEWABLE_IMPRESSIONS")
                                $scope.primaryKpiSelected="Impressions"
                        }
                        var startDateElem = $('#adGrpStartDateInput');
                        $scope.setStartdateIndependant=momentService.utcToLocalTime($scope.workflowData['campaignData'].startTime);

                        var campaignStartTime = momentService.utcToLocalTime($scope.workflowData['campaignData'].startTime);
                        if(moment().isAfter(campaignStartTime, 'day')) {
                            campaignStartTime = moment().format(constants.DATE_US_FORMAT);
                        }
                        var campaignEndTime = momentService.utcToLocalTime($scope.workflowData['campaignData'].endTime);
                        startDateElem.datepicker("setStartDate", campaignStartTime);
                        startDateElem.datepicker("setEndDate", campaignEndTime);
                        $scope.startTimeFormated = campaignStartTime;
                        $scope.campaignEndTime = campaignEndTime;
                        if ($scope.workflowData['campaignData'].pushable) {
                            $scope.disablePushBtn = false;
                        }
                        campaignOverView.modifyCampaignData();
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            adsDataMofiderFunc : function(adsData) {
                var budgetType, rateType;
                var labelObj = {
                    'cpm' : 'Imps.',
                    'cpc' : 'Clicks',
                    'cpa' : 'Actions'
                }

                //calculatedValue =  impression , clicks and actions value

                _.each(adsData, function(data) {

                    budgetType = data.budgetType && data.budgetType.toLowerCase();
                    rateType = data.rateType && data.rateType.toLowerCase();

                    data.label = labelObj[rateType];

                    if(budgetType === "cost" && rateType) {
                        data['cost'] = data.budgetValue;
                        if(rateType === 'cpm') {
                            data['calculatedValue'] = (data.budgetValue/data.rateValue)*1000;
                        }

                        if(rateType === 'cpc' || rateType === 'cpa') {
                            data['calculatedValue'] = data.budgetValue/data.rateValue;
                        }
                    } else {
                        data['calculatedValue'] = data.budgetValue;
                        if(rateType === 'cpm') {
                            data['cost'] = (data.budgetValue/1000)* (data.rateValue);
                        }
                        if(rateType === 'cpc' || rateType === 'cpa') {
                            data['cost'] = data.budgetValue * data.rateValue;

                        }
                    }
                });
                return adsData;
            },

            getAdsForCampaign: function (campaignId) {
                workflowService.getAdsForCampaign(campaignId).then(function (result) {

                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        for(var i in responseData){
                            if(responseData[i].state==="IN_FLIGHT")
                                responseData[i].state="IN FLIGHT";
                            if(responseData[i].state==="IN_PROGRESS")
                                responseData[i].state="DEPLOYING";
                        }
                        if(responseData.length>0){
                            $scope.noIndependantAds=false;
                            $scope.$watch('setStartdateIndependant', function() {
                                $scope.extractor(responseData);
                            });
                        }else{
                            $scope.noIndependantAds=true;
                        }
                        // call extract method if
                        $scope.workflowData['campaignAdsData'] = campaignOverView.adsDataMofiderFunc(responseData);

                        var isAdsInProgressState = _.filter(responseData, function(obj) { return obj.state == "DEPLOYING" });

                        if(isAdsInProgressState && isAdsInProgressState.length >0) {
                            $timeout(function() {
                                campaignOverView.getAdsForCampaign($routeParams.campaignId);
                            }, 15000);
                        }
                    } else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            getAdgroups: function (campaignId) {
                workflowService.getAdgroups(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData.campaignGetAdGroupsData = responseData;
                    } else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            getAdsInAdGroup: function (campaignId, adGroupId, index) {
                workflowService.getAdsInAdGroup(campaignId, adGroupId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        for(var i in responseData){
                            if(responseData[i].state==="IN_FLIGHT")
                                responseData[i].state="IN FLIGHT";
                            if(responseData[i].state==="IN_PROGRESS")
                                responseData[i].state="DEPLOYING";
                        }
                        $scope.workflowData['getADsForGroupData'][index] = campaignOverView.adsDataMofiderFunc(responseData);

                        var isAdsInProgressState = _.filter(responseData, function(obj) { return obj.state == "DEPLOYING" });

                        if(isAdsInProgressState && isAdsInProgressState.length >0) {
                            $timeout(function() {
                                campaignOverView.getAdsForCampaign($routeParams.campaignId);
                            }, 15000);
                        }
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            pushSavedCampaign: function (campaignId) {
                workflowService.pushCampaign(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        location.reload();
                    }
                });
            },

            errorHandler: function (errData) {
                if(errData.data.status === 404) {
                    $location.url('/mediaplans');
                }
            }
        }

        $scope.utc = function (date) {
            return moment(date).utc().valueOf()
        }
        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {'display': 'picture', 'video': 'film', 'rich media': 'paperclip', 'social': 'user'}
            return adFormatMapper[adFormat.toLowerCase()];
        }

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.getAdsForCampaign($routeParams.campaignId);
        campaignOverView.getAdgroups($routeParams.campaignId);

        $(function () {
            $("#pushCampaignBtn").on('click', function () {
                campaignOverView.pushSavedCampaign($routeParams.campaignId);
            })

        })

        $scope.navigateToAdCreatePage = function () {
            var redirectUrl ='/mediaplan/' + $scope.workflowData.campaignData.id + '/ads/create';
            $location.url(redirectUrl);
        }


        $scope.appendSizes = function (creative) {
            var creativeSizeArr = []
            if (typeof creative != 'undefined' && creative.length>0) {
                if (creative.length == 1) {
                    $scope.sizeString = creative[0].size.size;
                } else if (creative.length > 1) {
                    $scope.sizeString = "";
                    for (var i in creative) {
                        //$scope.sizeString += creative[i].size.size + ", ";
                        creativeSizeArr.push(creative[i].size.size)
                    }
                    $scope.sizeString = creativeSizeArr;
                    var arr = creativeSizeArr;
                    var result = noRepeat(arr);

                    if (result[0].length > 3) {
                        var creativeSizeLimit = result[0].splice(0,3);
                        var remainingCreativeSize = result[0].join(", ");
                        var amountLeft = result[0].length;
                        $scope.sizeString = creativeSizeLimit.join(', ').replace(/X/g, 'x')  + ' <span class="blueTxt" title="'+remainingCreativeSize+'" >+' + amountLeft + '</span>';

                    }
                    else {
                        $scope.sizeString = result[0] && result[0].join(', ');
                    }
                }

            } else {
                $scope.sizeString = constants.WF_NOT_SET;
            }



            function noRepeat(arr) {
                var a = [], b = [], prev;

                arr.sort();
                for ( var i = 0; i < arr.length; i++ ) {
                    if ( arr[i] !== prev ) {
                        a.push(arr[i]);
                        b.push(1);
                    } else {
                        b[b.length-1]++;
                    }
                    prev = arr[i];
                }

                return [a, b];
            }

            return $scope.sizeString;
        }



        $scope.ToggleAdGroups = function (context, adGrpId, index, event) {
            var elem = $(event.target);
            if (context.showHideToggle) {
                elem.removeClass("icon-minus").addClass("icon-plus") ;
                context.showHideToggle = !context.showHideToggle
            } else {
                elem.removeClass("icon-plus").addClass("icon-minus") ;
                context.showHideToggle = !context.showHideToggle
                campaignOverView.getAdsInAdGroup($routeParams.campaignId, adGrpId, index);
            }
        };

        $scope.groupIndividualAds = function () {
            $scope.showIndividualAds = !$scope.showIndividualAds;
            $('#createIndependantAdsGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap, .singleCardWrap').toggleClass('active');
            $scope.createGroupMessage=false;
            $scope.createGroupMessage=false;
        };

        $scope.createAdGrp = function () {
            $scope.showCreateAdGrp = !$scope.showCreateAdGrp;
            $('#createNewAdGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap, .singleCardWrap').toggleClass('active');
            $scope.createGroupMessage = false;
            $scope.createGroupMessage = false;
        };

        $scope.extractor = function (IndividualAdsData) {
            $scope.independantAdData=IndividualAdsData;
            //find lowest startDate
            var startDatelow=new Array;
            for(var i in IndividualAdsData){
                if(IndividualAdsData[i].startTime){
                    startDatelow.push(IndividualAdsData[i]);

                }
            }
            var ascending = _.sortBy(startDatelow, function (o) {//method to find lowest startTime
                return o.startTime;
            });

            if(ascending.length>0){
                $scope.lowestStartTime = momentService.utcToLocalTime(ascending[0].startTime);
                var startDateElem = $('#individualAdsStartDateInput');
                startDateElem.datepicker("setStartDate",$scope.setStartdateIndependant);
                startDateElem.datepicker("setEndDate", $scope.lowestStartTime);
            }else{
                var startDateElem = $('#individualAdsStartDateInput');
                startDateElem.datepicker("setStartDate",$scope.setStartdateIndependant);
                startDateElem.datepicker("setEndDate", $scope.setStartdateIndependant);
            }

            //find highest end date.
            var endDateHigh= new Array;
            for(var ind in IndividualAdsData){
                if(IndividualAdsData[ind].endTime){
                    endDateHigh.push(IndividualAdsData[ind]);

                }
            }
            var descending = _.sortBy(endDateHigh, function (o) {//method to find the highest endTime
                return o.endTime;
            });descending.reverse();
            if(descending.length>0){
                $scope.highestEndTime = momentService.utcToLocalTime(descending[0].endTime);
                var endDateElem = $('#individualAdsEndDateInput');
                endDateElem.datepicker("setStartDate", $scope.highestEndTime);
                endDateElem.datepicker("setEndDate",$scope.campaignEndTime);
            }else{
                var endDateElem = $('#individualAdsEndDateInput');
                endDateElem.datepicker("setStartDate", $scope.campaignEndTime);
                endDateElem.datepicker("setEndDate",$scope.campaignEndTime);

            }
        }

        $scope.createIndependantAdsGroup = function () {
            //api call here to group individual ads into a group
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.createIndependantAdsGrp.$valid){
                var formElem = $("#createIndependantAdsGrp");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postCreateAdObj = {};
                postCreateAdObj.name = formData.adIGroupName;
                postCreateAdObj.startTime = momentService.localTimeToUTC(formData.lowestStartTime,'startTime');
                postCreateAdObj.endTime = momentService.localTimeToUTC(formData.highestEndTime,'endTime');
                postCreateAdObj.createdAt = "";
                postCreateAdObj.updatedAt = "";
                postCreateAdObj.id="-9999";

                var dataArray = new Array;
                for(var i in $scope.independantAdData) {
                    dataArray.push($scope.independantAdData[i].id);
                }

                postCreateAdObj.adIds = dataArray;
                workflowService.createAdGroups($routeParams.campaignId,postCreateAdObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        $('#createIndependantAdsGrp')[0].reset();
                        $scope.$broadcast('show-errors-reset');
                        $scope.showIndividualAds = !$scope.showIndividualAds;
                        $scope.independantMessage=!$scope.independantMessage;
                        $scope.independantGroupMessage="Successfully grouped Ads";
                        localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS);
                        location.reload();
                    } else {
                        $scope.independantMessage=!$scope.independantMessage;
                        $scope.independantGroupMessage="unable to  group Ads";
                        $rootScope.setErrAlertMessage($scope.textConstants.AD_GROUP_CREATED_FAILURE);
                    }
                });
            }
        };

        $scope.goEdit = function ( adsData ) {
            var campaignId = adsData.campaignId;
            var adsId = adsData.id;
            var groupId = adsData.adGroupId;
            $scope.editAdforAdGroup(campaignId , adsData.startTime, adsData.endTime, adsId, groupId);
        };

        $scope.editAdforAdGroup=function(campaignId, stTime, edTime, adsId, groupId) {
            var path = "/mediaplan/"+campaignId+"/ads/"+adsId+"/edit";
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem("stTime", stTime); //convert this to EST in ads page
                localStorage.setItem("edTime", edTime); //convert this to EST in ads create page
            }
            if(groupId && adsId) {
                path = "/mediaplan/"+campaignId+"/adGroup/"+groupId+"/ads/"+adsId+"/edit";
            }
            $location.path(path);
        }

        // Switch BTN Animation
        $('.btn-toggle').click(function () {
            $(this).find('.btn').toggleClass('active');

            if ($(this).find('.btn-success').size() > 0) {
                $(this).find('.btn').toggleClass('btn-success');
            }

            $(this).find('.btn').toggleClass('btn-default');

        });
    });
})();
/*var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CampaignOverViewController', function ($scope,$rootScope, $window, $routeParams, constants, workflowService, 
        $timeout,$location, utils, momentService) {
        var campaignOverView = {
            modifyCampaignData: function () {
                var campaignData = $scope.workflowData.campaignData,
                    end = momentService.utcToLocalTime(campaignData.endTime),
                    start = momentService.utcToLocalTime(campaignData.startTime);

                campaignData.numOfDays = moment(end).diff(moment(start), 'days');
            },

            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    var responseData,
                        startDateElem,
                        campaignStartTime,
                        campaignEndTime;

                    if (result.status === 'OK' || result.status === 'success') {
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
                        startDateElem = $('#adGrpStartDateInput');
                        $scope.setStartdateIndependant = momentService.utcToLocalTime($scope.workflowData.campaignData.startTime);
                        campaignStartTime = momentService.utcToLocalTime($scope.workflowData.campaignData.startTime);
                        if (moment().isAfter(campaignStartTime, 'day')) {
                            campaignStartTime = moment().format(constants.DATE_US_FORMAT);
                        }
                        campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime);
                        startDateElem.datepicker('setStartDate', campaignStartTime);
                        startDateElem.datepicker('setEndDate', campaignEndTime);
                        $scope.startTimeFormated = campaignStartTime;
                        $scope.campaignEndTime = campaignEndTime;
                        if ($scope.workflowData.campaignData.pushable) {
                            $scope.disablePushBtn = false;
                        }
                        campaignOverView.modifyCampaignData();
                    } else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            adsDataModifierFunc : function (adsData) {
                var budgetType, rateType,
                    labelObj = {
                        'cpm' : 'Imps.',
                        'cpc' : 'Clicks',
                        'cpa' : 'Actions'
                    };

                _.each(adsData, function (data) {
                    budgetType = data.budgetType && data.budgetType.toLowerCase();
                    rateType = data.rateType && data.rateType.toLowerCase();
                    data.label = labelObj[rateType];

                    if (budgetType === 'cost' && rateType) {
                        data['cost'] = data.budgetValue;
                        if (rateType === 'cpm') {
                            data['calculatedValue'] = (data.budgetValue/data.rateValue) * 1000;
                        }
                        if (rateType === 'cpc' || rateType === 'cpa') {
                            data['calculatedValue'] = data.budgetValue/data.rateValue;
                        }
                    } else {
                        data['calculatedValue'] = data.budgetValue;
                        if (rateType === 'cpm') {
                            data['cost'] = (data.budgetValue/1000) * (data.rateValue);
                        }
                        if (rateType === 'cpc' || rateType === 'cpa') {
                            data['cost'] = data.budgetValue * data.rateValue;
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
                            isAdsInProgressState,
                            i;

                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;
                            for (i in responseData) {
                                if(responseData[i].state === 'IN_FLIGHT') {
                                    responseData[i].state="IN FLIGHT";
                                }
                                if (responseData[i].state === 'IN_PROGRESS') {
                                    responseData[i].state="DEPLOYING";
                                }
                            }
                            if (responseData.length > 0) {
                                $scope.noIndependantAds=false;
                                $scope.$watch('setStartdateIndependant', function() {
                                    $scope.extractor(responseData);
                                });
                            } else {
                                $scope.noIndependantAds=true;
                            }
                            // call extract method if
                            $scope.workflowData.campaignAdsData = campaignOverView.adsDataModifierFunc(responseData);
                            isAdsInProgressState = _.filter(responseData, function(obj) { 
                                return obj.state === 'DEPLOYING';
                            });
                            if(isAdsInProgressState && isAdsInProgressState.length > 0) {
                                $timeout(function() {
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
                            isAdsInProgressState,
                            i;

                        if (result.status === 'OK' || result.status === 'success') {
                            responseData = result.data.data;
                            for(i in responseData){
                                if (responseData[i].state === 'IN_FLIGHT') {
                                    responseData[i].state="IN FLIGHT";
                                }
                                if (responseData[i].state === 'IN_PROGRESS') {
                                    responseData[i].state="DEPLOYING";
                                }
                            }
                            $scope.workflowData.getAdsForGroupData[index] = campaignOverView.adsDataModifierFunc(responseData);
                            isAdsInProgressState = _.filter(responseData, function(obj) { 
                                return obj.state === 'DEPLOYING';
                            });
                            if(isAdsInProgressState && isAdsInProgressState.length > 0) {
                                $timeout(function() {
                                    campaignOverView.getAdsForCampaign($routeParams.campaignId);
                                }, 15000);
                            }
                        } else {
                            campaignOverView.errorHandler(result);
                        }
                    }, campaignOverView.errorHandler);
            },

            pushSavedCampaign: function (campaignId) {
                workflowService
                    .pushCampaign(campaignId)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            location.reload();
                        }
                    });
            },

            errorHandler: function (errData) {
                if (errData.data.status === 404) {
                    $location.url('/mediaplans');
                }
            }
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

        if ($('.adGroupSelectionWrap').length) { 
            $('html').css({'background-color':'#eef5fc'}); 
        };

        $scope.editCampaign = function (workflowcampaignData) {
            $location.url('/mediaplan/' + workflowcampaignData.id + '/edit');
        };

        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date,format);
        };

        $scope.resetAlertMessage = function () {
            localStorage.removeItem('topAlertMessage');
            $rootScope.setErrAlertMessage('', 0);
        }

        //show selected targets in ads card
        $scope.displaySelectedTargets = function (adsData) {
            var selectedStr = '';

            if (adsData) {
                if ((adsData.targets.geoTargets.REGION && adsData.targets.geoTargets.REGION.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.DMA && adsData.targets.geoTargets.DMA.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.ZIP_CODE && adsData.targets.geoTargets.ZIP_CODE.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.CITY && adsData.targets.geoTargets.CITY.geoTargetList.length > 0)) {
                    selectedStr += 'Geo';
                }
                if ((adsData.targets.segmentTargets.segmentList && adsData.targets.segmentTargets.segmentList.length > 0)) {
                    if (selectedStr !== '') {
                        selectedStr += ', Audience';
                    } else {
                        selectedStr += 'Audience';
                    }
                }
                if (adsData.targets.adDaypartTargets.schedule && adsData.targets.adDaypartTargets.schedule.length > 0) {
                    if (selectedStr !== '') {
                        selectedStr += ', Daypart';
                    } else {
                        selectedStr += 'Daypart';
                    }
                }
                if (selectedStr == '') {
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
                    $rootScope.setErrAlertMessage();
                };

            event.preventDefault();
            workflowService
                .deleteCampaign(campaignId)
                .then(function (result) {
                    var url = '/mediaplans',
                        campaignName;

                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.campaignArchive = false;
                        url = '/mediaplans';
                        campaignName = $scope.workflowData.campaignData.name;
                        localStorage.setItem('topAlertMessage', campaignName+' has been archived');
                        $location.url(url);
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
                    return obj.objective ==='Branding';
                }),
                tooltip,
                performanceArr,
                i;

            if (brandingArr.length > 0) {
                $scope.brand = brandingArr[0].subObjectives;
                tooltip = 'Branding: ' + $scope.brand[0];
                for (i = 1; i < $scope.brand.length; i++) {
                    tooltip+=','+$scope.brand[i];
                }
                $scope.brandTooltip = tooltip;
            }
            performanceArr = _.filter(objectiveObj, function (obj) {
                return obj.objective === 'Performance';
            });
            if (performanceArr.length > 0) {
                $scope.performance = performanceArr[0].subObjectives;
                tooltip = 'Performance: ' + $scope.performance[0];
                for (i = 1;i<$scope.performance.length;i++) {
                    tooltip+=','+$scope.performance[i];
                }
                $scope.performanceTooltip = tooltip;
            }
        };

        $scope.utc = function (date) {
            return moment(date).utc().valueOf();
        };

        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {
                'display': 'picture', 
                'video': 'film', 
                'rich media': 'paperclip', 
                'social': 'user'
            };

            return adFormatMapper[adFormat.toLowerCase()];
        };

        $scope.navigateToAdCreatePage = function () {
            $location.url('/mediaplan/' + $scope.workflowData.campaignData.id + '/ads/create');
        };

        $scope.appendSizes = function (creative) {
            var creativeSizeArr = [],
                arr,
                result,
                creativeSizeLimit,
                amountLeft,
                remainingCreativeSize,
                i;

            if (typeof creative !== 'undefined' && creative.length > 0) {
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
                        $scope.sizeString = creativeSizeLimit.join(', ').replace(/X/g, 'x')  + 
                            ' <span class="blueTxt" title="' + remainingCreativeSize + '">+' + amountLeft + '</span>';
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
                for (i = 0; i < arr.length; i++ ) {
                    if ( arr[i] !== prev ) {
                        a.push(arr[i]);
                        b.push(1);
                    } else {
                        b[b.length-1]++;
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
                elem.removeClass('icon-minus').addClass('icon-plus') ;
                context.showHideToggle = !context.showHideToggle
            } else {
                elem.removeClass('icon-plus').addClass('icon-minus') ;
                context.showHideToggle = !context.showHideToggle
                campaignOverView.getAdsInAdGroup($routeParams.campaignId, adGrpId, index);
            }
        };

        $scope.groupIndividualAds = function () {
            $scope.showIndividualAds = !$scope.showIndividualAds;
            $('#createIndependantAdsGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap, .singleCardWrap').toggleClass('active');
            $scope.createGroupMessage = false;
            $scope.createGroupMessage = false;
        };

        $scope.createAdGrp = function () {
            $scope.showCreateAdGrp = !$scope.showCreateAdGrp;
            $('#createNewAdGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap, .singleCardWrap').toggleClass('active');
            $scope.createGroupMessage = false;
            $scope.createGroupMessage = false;
        };

        $scope.extractor = function (IndividualAdsData) {
            var startDatelow = [],
                endDateHigh = [],
                ascending,
                descending,
                startDateElem,
                endDateElem,
                ind,
                i;

            $scope.independantAdData = IndividualAdsData;

            // find lowest startDate
            for (i in IndividualAdsData) {
                if (IndividualAdsData[i].startTime) {
                    startDatelow.push(IndividualAdsData[i]);

                }
            }

            // method to find lowest startTime
            ascending = _.sortBy(startDatelow, function (o) {
                return o.startTime;
            });
            if (ascending.length > 0) {
                $scope.lowestStartTime = momentService.utcToLocalTime(ascending[0].startTime);
                startDateElem = $('#individualAdsStartDateInput');
                startDateElem.datepicker('setStartDate', $scope.setStartdateIndependant);
                startDateElem.datepicker('setEndDate', $scope.lowestStartTime);
            } else {
                startDateElem = $('#individualAdsStartDateInput');
                startDateElem.datepicker('setStartDate', $scope.setStartdateIndependant);
                startDateElem.datepicker('setEndDate', $scope.setStartdateIndependant);
            }

            // find highest end date.
            for (ind in IndividualAdsData) {
                if (IndividualAdsData[ind].endTime) {
                    endDateHigh.push(IndividualAdsData[ind]);

                }
            }
            
            //method to find the highest endTime
            descending = _.sortBy(endDateHigh, function (o) {
                return o.endTime;
            });
            descending.reverse();
            if (descending.length > 0) {
                $scope.highestEndTime = momentService.utcToLocalTime(descending[0].endTime);
                endDateElem = $('#individualAdsEndDateInput');
                endDateElem.datepicker('setStartDate', $scope.highestEndTime);
                endDateElem.datepicker('setEndDate', $scope.campaignEndTime);
            } else {
                endDateElem = $('#individualAdsEndDateInput');
                endDateElem.datepicker('setStartDate', $scope.campaignEndTime);
                endDateElem.datepicker('setEndDate', $scope.campaignEndTime);
            }
        };

        $scope.createIndependantAdsGroup = function () {
            var formElem,
                formData,
                postCreateAdObj,
                dataArray = [],
                i;

            //api call here to group individual ads into a group
            $scope.$broadcast('show-errors-check-validity');
            if ($scope.createIndependantAdsGrp.$valid) {
                formElem = $('#createIndependantAdsGrp');
                formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                postCreateAdObj = {};
                postCreateAdObj.name = formData.adIGroupName;
                postCreateAdObj.startTime = momentService.localTimeToUTC(formData.lowestStartTime, 'startTime');
                postCreateAdObj.endTime = momentService.localTimeToUTC(formData.highestEndTime, 'endTime');
                postCreateAdObj.createdAt = '';
                postCreateAdObj.updatedAt = '';
                postCreateAdObj.id = '-9999';

                for (i in $scope.independantAdData) {
                    dataArray.push($scope.independantAdData[i].id);
                }

                postCreateAdObj.adIds = dataArray;
                workflowService
                    .createAdGroups($routeParams.campaignId,postCreateAdObj)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $('#createIndependantAdsGrp')[0].reset();
                            $scope.$broadcast('show-errors-reset');
                            $scope.showIndividualAds = !$scope.showIndividualAds;
                            $scope.independantMessage = !$scope.independantMessage;
                            $scope.independantGroupMessage = 'Successfully grouped Ads';
                            localStorage.setItem('topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS);
                            location.reload();
                        } else {
                            $scope.independantMessage = !$scope.independantMessage;
                            $scope.independantGroupMessage = 'unable to group Ads';
                            $rootScope.setErrAlertMessage($scope.textConstants.AD_GROUP_CREATED_FAILURE);
                        }
                    });
            }
        };

        $scope.goEdit = function (adsData) {
            $scope.editAdforAdGroup(adsData.campaignId , adsData.startTime, adsData.endTime, adsData.id, adsData.adGroupId);
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
        
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.workflowData.getAdsForGroupData = {};
        $scope.disablePushBtn = true;
        $scope.notPushed = false;
        $scope.sizeString = '';
        $scope.showHideToggle = false;
        $scope.showIndividualAds = false;
        $scope.showCreateAdGrp=false;
        $scope.createGroupMessage=false;
        $scope.createGroupMessage=false;
        $scope.brand=[];
        $scope.performance=[];
        localStorage.setItem('campaignData', '');
        $scope.moreThenThree = '';

        campaignOverView.getCampaignData($routeParams.campaignId);
        campaignOverView.getAdsForCampaign($routeParams.campaignId);
        campaignOverView.getAdgroups($routeParams.campaignId);

        $(function () {
            $('#pushCampaignBtn').on('click', function () {
                campaignOverView.pushSavedCampaign($routeParams.campaignId);
            });
        });

        // Switch BTN Animation
        $('.btn-toggle').click(function () {
            $(this).find('.btn').toggleClass('active');
            if ($(this).find('.btn-success').size() > 0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');
        });
    });
})();
*/