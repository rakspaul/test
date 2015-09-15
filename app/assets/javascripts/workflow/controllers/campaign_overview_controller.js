var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CampaignOverViewController', function ($scope, $window, $routeParams, constants, workflowService, $timeout) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#campaigns_nav_link').addClass('active');
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

        var campaignOverView = {

            modifyCampaignData: function () {
                var campaignData = $scope.workflowData['campaignData'];
                campaignData.numOfDays = moment(campaignData.endTime).diff(moment(campaignData.startTime), 'days');
            },

            getCampaignData: function (campaignId) {
                workflowService.getCampaignData(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['campaignData'] = responseData;
                        var startDateElem = $('#adGrpStartDateInput');
                        $scope.setStartdateIndependant=moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");//set campaign start date as lower limit startDate

                        var campaignStartTime = moment($scope.workflowData['campaignData'].startTime).format("MM/DD/YYYY");//console.log(campaignStartTime);
                        if(moment().isAfter(campaignStartTime, 'day')) {
                            campaignStartTime = moment().format('MM/DD/YYYY');
                        }
                        var campaignEndTime = moment($scope.workflowData['campaignData'].endTime).format("MM/DD/YYYY");//console.log(campaignEndTime);
                        startDateElem.datepicker("setStartDate", campaignStartTime);//console.log(campaignStartTime);
                        startDateElem.datepicker("setEndDate", campaignEndTime);
                        $scope.startTimeFormated = campaignStartTime;
                        $scope.campaignEndTime = campaignEndTime;
                        campaignOverView.modifyCampaignData();
                    }
                    else {
                        campaignOverView.errorHandler(result);
                    }
                }, campaignOverView.errorHandler);
            },

            getAdsForCampaign: function (campaignId) {
                workflowService.getAdsForCampaign(campaignId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        if(responseData.length>0){
                            $scope.noIndependantAds=false;
                            $scope.$watch('setStartdateIndependant', function() {
                                   $scope.extractor(responseData);
                            });
                        }else{
                            $scope.noIndependantAds=true;
                        }
                        // call extract method if
                        $scope.workflowData['campaignAdsData'] = responseData;
                        //console.log(responseData)
                        for (var index in responseData) {
                            if (responseData[index].state.toLowerCase() == "ready") {//ready
                                $scope.disablePushBtn = false;
                                break;
                            }
                        }

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
                console.log(index);
                workflowService.getAdsInAdGroup(campaignId, adGroupId).then(function (result) {
                    if (result.status === "OK" || result.status === "success") {
                        var responseData = result.data.data;
                        $scope.workflowData['getADsForGroupData'][index] = responseData;
                        console.log($scope.workflowData);
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
            window.location.href = '/campaign/' + $scope.workflowData.campaignData.id + '/ads/create';
        }

        $scope.appendSizes = function (creative) {
            //console.log(creative);
            if (typeof creative != 'undefined') {
                if (creative.length == 1) {
                    $scope.sizeString = creative[0].size.size;
                } else if (creative.length > 1) {
                    $scope.sizeString = "";
                    for (var i in creative) {
                        $scope.sizeString += creative[i].size.size + ",";
                    }
                    $scope.sizeString = $scope.sizeString.substring(0, $scope.sizeString.length - 1);
                }
            } else {
                $scope.sizeString = constants.WF_NOT_SET;
            }
            return $scope.sizeString;
        }
        $scope.ToggleAdGroups = function (context, adGrpId, index) {
            if (context.showHideToggle) {
                context.showHideToggle = !context.showHideToggle
            } else {
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
            $scope.createGroupMessage=false;
            $scope.createGroupMessage=false;
        }

        $scope.extractor = function (IndividualAdsData) {console.log($scope.setStartdateIndependant);
        $scope.independantAdData=IndividualAdsData;
        //find lowest startDate
            var startDatelow=new Array;
            for(var i in IndividualAdsData){
                if(IndividualAdsData[i].startTime){
                    startDatelow.push(IndividualAdsData[i]);

                }
            }
            var ascending = _.sortBy(startDatelow, function (o) {
                return o.startTime;
            });

            if(ascending.length>0){
            $scope.lowestStartTime = moment(ascending[0].startTime).format("MM/DD/YYYY");
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
            var descending = _.sortBy(endDateHigh, function (o) {
                return o.endTime;
            });descending.reverse();
            if(descending.length>0){
                $scope.highestEndTime = moment(descending[0].endTime).format("MM/DD/YYYY");
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
            postCreateAdObj.startTime = moment(formData.lowestStartTime).format('YYYY-MM-DD');
            postCreateAdObj.endTime = moment(formData.highestEndTime).format('YYYY-MM-DD');
            postCreateAdObj.createdAt = "";
            postCreateAdObj.updatedAt = "";
            postCreateAdObj.id="-9999";

            var dataArray = new Array;
            for(var i in $scope.independantAdData) {
                dataArray.push($scope.independantAdData[i].id);
            }
            //console.log(dataArray);
            postCreateAdObj.adIds = dataArray;
            console.log(postCreateAdObj);
                            workflowService.createAdGroups($routeParams.campaignId,postCreateAdObj).then(function (result) {
                                    if (result.status === "OK" || result.status === "success") {
                                        console.log("ad group created");
                                        $('#createIndependantAdsGrp')[0].reset();
                                        $scope.$broadcast('show-errors-reset');
                                        $scope.showIndividualAds = !$scope.showIndividualAds;
                                        $scope.independantMessage=!$scope.independantMessage;
                                        $scope.independantGroupMessage="Successfully grouped Ads";
                                        location.reload();

                                    }else {
                                         console.log("ERROR! adgroup not created");
                                         console.log(result);
                                         $scope.independantMessage=!$scope.independantMessage;
                                         $scope.independantGroupMessage="unable to  group Ads";
                                    }
                            });
        }
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

    angObj.controller('getAdgroupsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $scope.numOfDays = function (startTime, endTime) {
            $scope.numofdays = moment(endTime).diff(moment(startTime), 'days');
            return $scope.numofdays;
        }

    });
    angObj.controller('createAdGroups', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {

//        $scope.checkForPastDate = function (date) {
//            return moment().isAfter(date, 'day');
//        }

        $scope.handleFlightDate = function (data) {
            var startTime = data;
            var endDateElem = $('#adGrpEndDateInput');
            var campaignEndTime = moment($scope.$parent.workflowData['campaignData'].endTime).format("MM/DD/YYYY");
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
                var postCreateAdObj = {}; console.log(formData);
                postCreateAdObj.name = formData.adGroupName;
                postCreateAdObj.startTime = moment(formData.startTime).format('YYYY-MM-DD');
                postCreateAdObj.endTime = moment(formData.endTime).format('YYYY-MM-DD');
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

