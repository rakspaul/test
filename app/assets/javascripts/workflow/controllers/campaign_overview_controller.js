
var angObj = angObj || {};
(function () {
    'use strict';

    angObj.controller('CampaignOverViewController', function ($scope,$rootScope, $window, $routeParams, constants, workflowService, $timeout,$location, utils) {
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
            window.location.href = '/mediaplan/'+workflowcampaignData.id+'/edit';
        }
        $scope.convertEST=function(date,format){
            return utils.convertToEST(date,format);
        }
        $scope.resetAlertMessage = function(){
           localStorage.removeItem('topAlertMessage');
           $rootScope.setErrAlertMessage("",0);
        }

        //show selected targets in ads card
        $scope.displaySelectedTargets = function(adsData){
            var selectedStr = '';
            if(adsData){
                if((adsData.targets.geoTargets.REGION && adsData.targets.geoTargets.REGION.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.DMA && adsData.targets.geoTargets.DMA.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.ZIP_CODE && adsData.targets.geoTargets.ZIP_CODE.geoTargetList.length > 0) ||
                    (adsData.targets.geoTargets.CITY && adsData.targets.geoTargets.CITY.geoTargetList.length > 0))
                {
                    selectedStr += 'Geo';

                }

                if((adsData.targets.segmentTargets.segmentList && adsData.targets.segmentTargets.segmentList.length > 0)){
                    if(selectedStr != ''){
                        selectedStr += ', Audience';
                    }
                    else{
                        selectedStr += 'Audience';

                    }
                }

                if(adsData.targets.adDaypartTargets.schedule && adsData.targets.adDaypartTargets.schedule.length > 0){
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
        }
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
                    window.location.href = url;
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
                var end=utils.convertToEST(campaignData.endTime);
                var start=utils.convertToEST(campaignData.startTime);
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
                                $scope.primaryKpiSelected="CPM"
                            else if(responseData.primaryKpi==="CLICKS")
                                $scope.primaryKpiSelected="CPC"
                            else if(responseData.primaryKpi==="ACTIONS")
                                $scope.primaryKpiSelected="CPA"
                            else if(responseData.primaryKpi==="VIEWABLE_IMPRESSIONS")
                                $scope.primaryKpiSelected="CPM"
                        }
                        var startDateElem = $('#adGrpStartDateInput');
                        $scope.setStartdateIndependant=utils.convertToEST($scope.workflowData['campaignData'].startTime,"MM/DD/YYYY");//set campaign start date as lower limit startDate

                        var campaignStartTime = utils.convertToEST($scope.workflowData['campaignData'].startTime,"MM/DD/YYYY");//console.log(campaignStartTime);
                       // var campaignStartTime = moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");//console.log(campaignStartTime);
                        if(moment().isAfter(campaignStartTime, 'day')) {
                            campaignStartTime = moment().format('MM/DD/YYYY');
                        }
                        var campaignEndTime = utils.convertToEST($scope.workflowData['campaignData'].endTime,"MM/DD/YYYY");//console.log(campaignEndTime);
                        //var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");//console.log(campaignEndTime);
                        startDateElem.datepicker("setStartDate", campaignStartTime);//console.log(campaignStartTime);
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
                console.log("adsData", adsData);
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
                          }, 10000);
                        }

                        //console.log(responseData)
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            getAdgroups: function (campaignId) {
                 workflowService.getAdgroups(campaignId).then(function (result) {
                        if (result.status === "OK" || result.status === "success") {
                            var responseData = result.data.data;
                            $scope.workflowData['campaignGetAdGroupsData'] = responseData;
                        }
                        else {
                            campaignOverView.errorHandler(result);
                        }
                    }, campaignOverView.errorHandler);
                //$scope.getAdgroups(campaignId);
            },
            getAdsInAdGroup: function (campaignId, adGroupId, index) {
                //console.log(index);
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
                          }, 10000);
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
                console.log(errData);
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
            //console.log(creative);
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
                       var amountLeft = result[0].length;
                       if (amountLeft >= 2) {
                        $scope.sizeString = creativeSizeLimit.join(', ').replace(/X/g, 'x') + ' +' + amountLeft + ' sizes';
                       } else {
                        $scope.sizeString = creativeSizeLimit.join(', ').replace(/X/g, 'x') + ' +' + amountLeft + ' size';
                       }
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
        }
        $scope.groupIndividualAds = function () {
            $scope.showIndividualAds = !$scope.showIndividualAds;
            $('#createIndependantAdsGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap').toggleClass('active');
            $scope.createGroupMessage=false;
            $scope.createGroupMessage=false;
        }
        $scope.createAdGrp = function () {
            $scope.showCreateAdGrp = !$scope.showCreateAdGrp;
            $('#createNewAdGrp')[0].reset();
            $scope.$broadcast('show-errors-reset');
            $('.adGroupSelectionWrap').toggleClass('active');
            $scope.createGroupMessage=false;
            $scope.createGroupMessage=false;
        }

        $scope.extractor = function (IndividualAdsData) { //console.log($scope.setStartdateIndependant);
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
            $scope.lowestStartTime = utils.convertToEST(ascending[0].startTime,"MM/DD/YYYY");//console.log(moment(ascending[0].startTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
            //console.log(moment($scope.lowestStartTime).format('YYYY-MM-DD HH:mm:ss.SSS'));//$scope.lowestStartTime = moment(ascending[0].startTime).format("MM/DD/YYYY");
                var startDateElem = $('#individualAdsStartDateInput');
                startDateElem.datepicker("setStartDate",$scope.setStartdateIndependant);
                startDateElem.datepicker("setEndDate", $scope.lowestStartTime);
            }else{
                var startDateElem = $('#individualAdsStartDateInput');// console.log($scope.setStartdateIndependant);
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
                $scope.highestEndTime = utils.convertToEST(descending[0].endTime,"MM/DD/YYYY");//console.log(moment(descending[0].endTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
                //console.log(moment($scope.highestEndTime).format('YYYY-MM-DD HH:mm:ss.SSS'));//$scope.highestEndTime = moment(descending[0].endTime).format("MM/DD/YYYY");
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
              postCreateAdObj.startTime = utils.convertToUTC(formData.lowestStartTime,'ST');//console.log(postCreateAdObj.startTime);
              postCreateAdObj.endTime = utils.convertToUTC(formData.highestEndTime,'ET');//console.log(postCreateAdObj.endTime);
              postCreateAdObj.createdAt = "";
              postCreateAdObj.updatedAt = "";
              postCreateAdObj.id="-9999";

              var dataArray = new Array;
              for(var i in $scope.independantAdData) {
                  dataArray.push($scope.independantAdData[i].id);
              }
              //console.log(dataArray);
              postCreateAdObj.adIds = dataArray;
              workflowService.createAdGroups($routeParams.campaignId,postCreateAdObj).then(function (result) {
                if (result.status === "OK" || result.status === "success") {
                    console.log("ad group created");
                    $('#createIndependantAdsGrp')[0].reset();
                    $scope.$broadcast('show-errors-reset');
                    $scope.showIndividualAds = !$scope.showIndividualAds;
                    $scope.independantMessage=!$scope.independantMessage;
                    $scope.independantGroupMessage="Successfully grouped Ads";
                    localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS);
                    location.reload();
                } else {
                     console.log("ERROR! adgroup not created");
                     console.log(result);
                     $scope.independantMessage=!$scope.independantMessage;
                     $scope.independantGroupMessage="unable to  group Ads";
                     $rootScope.setErrAlertMessage($scope.textConstants.AD_GROUP_CREATED_FAILURE);
                }
              });
            }
        }

        $scope.goEdit = function ( adsData ) {
          var campaignId = adsData.campaignId;
          var adsId = adsData.id;
          var groupId = adsData.adGroupId;
          $scope.editAdforAdGroup(campaignId , adsData.startTime, adsData.endTime, adsId, groupId)
        };

        $scope.editAdforAdGroup=function(campaignId,stTime,edTime, adsId, groupId){
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem("stTime", stTime);//convert this to EST in ads page
                localStorage.setItem("edTime", edTime);//convert this to EST in ads create page
            }
            var path = path = "/mediaplan/"+campaignId+"/ads/"+adsId+"/edit";
            if(groupId && adsId) {
              var path = "/mediaplan/"+campaignId+"/adGroup/"+groupId+"/ads/"+adsId+"/edit";
            }
            $location.path( path );
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

    angObj.controller('GetAdgroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $scope.numOfDays = function (startTime, endTime) {
            var startTime=utils.convertToEST(startTime);
            var endTime=utils.convertToEST(endTime);
            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');
            return $scope.numofdays;
        }

        $scope.createAdforAdGroup=function(campid,stTime,edTime){
            if(typeof(Storage) !== "undefined") {
                localStorage.setItem("stTime", stTime);//convert this to EST in ads page
                localStorage.setItem("edTime", edTime);//convert this to EST in ads create page
            }
            var navigateUrl = "/mediaplan/"+$routeParams.campaignId+"/adGroup/"+campid+"/ads/create";
            $location.url(navigateUrl)
        }

        $scope.convertEST=function(date,format){
            return utils.convertToEST(date,format);
        }
    });
    angObj.controller('CreateAdGroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {

//        $scope.checkForPastDate = function (date) {
//            return moment().isAfter(date, 'day');
//        }

        $scope.handleFlightDate = function (data) {
            var startTime = data;
            var endDateElem = $('#adGrpEndDateInput');
            var campaignEndTime = utils.convertToEST($scope.$parent.workflowData['campaignData'].endTime,"MM/DD/YYYY");
            //console.log(campaignEndTime);
            var changeDate;
            endDateElem.attr("disabled", "disabled").css({'background': '#eee'});
            if (startTime) {
                endDateElem.removeAttr("disabled").css({'background': 'transparent'});
                changeDate = moment(startTime).format('MM/DD/YYYY')
                endDateElem.datepicker("setStartDate", changeDate);
                endDateElem.datepicker("setEndDate", campaignEndTime);
                endDateElem.datepicker("update", changeDate);
            }
        }


        $scope.createAdGroup = function (createNewAdGrp) {
            $scope.$broadcast('show-errors-check-validity');
                if (createNewAdGrp.$valid){
                var formElem = $("#createNewAdGrp");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                var postCreateAdObj = {}; //console.log(formData);
                postCreateAdObj.name = formData.adGroupName;
                postCreateAdObj.startTime = utils.convertToUTC(formData.startTime,'ST');//console.log(postCreateAdObj.startTime);
                postCreateAdObj.endTime = utils.convertToUTC(formData.endTime,'ET');//console.log(postCreateAdObj.endTime);
                postCreateAdObj.createdAt = "";
                postCreateAdObj.updatedAt = "";
                console.log(postCreateAdObj);

                workflowService.createAdGroups($routeParams.campaignId, postCreateAdObj).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        console.log("ad group created");
                        $('#createNewAdGrp')[0].reset();

                        $scope.$parent.showCreateAdGrp = !$scope.$parent.showCreateAdGrp;
                        $scope.createGroupMessage=!$scope.createGroupMessage;
                        $scope.createAdGroupMessage="Ad Group Created Successfully";
                        //$scope.workflowData['campaignGetAdGroupsData'] = [];
                        //$scope.getAdgroups($routeParams.campaignId);
                        localStorage.setItem( 'topAlertMessage', $scope.textConstants.AD_GROUP_CREATED_SUCCESS );
                        location.reload();
                    } else {
                        $scope.createGroupMessage=!$scope.createGroupMessage;
                        $scope.createAdGroupMessage="Ad Group not Created ";
                        console.log("ERROR! adgroup not created");
                        console.log(result);
                    }
                });


            }
        }
    });
})();
