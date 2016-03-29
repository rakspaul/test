define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive("editAdGroupSection", function ($http, $compile) {
        return {
            restrict:'EAC',
            controller : function($scope, momentService, workflowService, constants) {
                $scope.editAdGroupFlag = false;
                $scope.processAdGroupEditData = function(formElem, adGroupsData, adGroupsIndex) {
                    console.log("adGroupsData", adGroupsData);
                    $scope.adgroupId = adGroupsData.adGroup.id;
                    $scope.adGroupName = adGroupsData.adGroup.name;
                    $scope.tags = workflowService.recreateLabels(adGroupsData.labels);
                    $scope.adIGroupBudget = adGroupsData.adGroup.deliveryBudget;
                    $scope.updatedAt = adGroupsData.adGroup.updatedAt

                    $scope.adGroupMinBudget = adGroupsData.adGroup.bookedSpend;

                    //total budget for ad group
                        var campaignGetAdGroupsData = $scope.workflowData.campaignGetAdGroupsData;
                    var adGroupsBudget = campaignGetAdGroupsData.reduce(function(memo, obj) {
                        return memo + obj.adGroup.deliveryBudget;
                    }, 0);

                    adGroupsBudget = adGroupsBudget - $scope.adIGroupBudget;

                    //total budget for no ad group
                    var campaignAdsData  = $scope.workflowData.campaignAdsData;
                    var adsBudget = campaignAdsData.reduce(function(memo, obj) {
                        return memo + (obj.cost ||0);
                    }, 0);

                    $scope.adGroupMaxBudget = (Math.ceil($scope.workflowData.campaignData.deliveryBudget) - adGroupsBudget) + Math.ceil(adsBudget) ;

                    var startTime = momentService.utcToLocalTime(adGroupsData.adGroup.startTime);
                    var highestEndTime = momentService.utcToLocalTime(adGroupsData.adGroup.endTime);

                    var getADsForGroupData = $scope.workflowData['getADsForGroupData'][adGroupsIndex];
                    var startDateElem = formElem.find(".adGrpStartDateInput");
                    var endDateElem = formElem.find(".adGrpEndDateInput");;

                    if(getADsForGroupData.length >0 ) {
                        $scope.extractor(getADsForGroupData, formElem);
                    } else {
                        $scope.resetAdsData();
                        if (moment().isAfter(startTime, 'day')) {
                            startTime = moment().format(constants.DATE_US_FORMAT);
                        }

                        startDateElem.datepicker("setStartDate", startTime);
                        startDateElem.datepicker("setEndDate", $scope.campaignEndTime);

                        endDateElem.datepicker("setStartDate", startTime);
                        endDateElem.datepicker("setEndDate", $scope.campaignEndTime);
                    }

                    startDateElem.datepicker("update", startTime);

                    endDateElem.datepicker("update", highestEndTime);

                }
            },

            link: function($scope, element, attrs) {
                var template;
                element.bind('click', function() {
                    $(".editAdgroupDiv").hide();
                    $(".adgroupDiv").show();
                    element.closest('.adGroup').find('.adgroupDiv').hide();
                    element.closest('.adGroup').find('.editAdgroupDiv').show();
                    $http.get(assets.html_edit_adgroup).then(function (tmpl) {
                        template = $compile(tmpl.data)($scope);
                        element.closest('.adGroup').find('.editAdgroupDiv').html(template);
                        $scope.adGroupsData = JSON.parse(attrs.adGroupData);
                        $scope.adGroupsIndex = JSON.parse(attrs.adGroupIndex);
                        $scope.editAdGroupFlag = true;
                        $scope.showCreateAdGrp = true;
                        var formElem = element.closest('.adGroup').find('.editAdgroupDiv form');
                        $scope.processAdGroupEditData(formElem, $scope.adGroupsData, $scope.adGroupsIndex);
                    });
                });

                $scope.cancelEditAdGroup = function () {
                    element.closest('.adGroup').find(".editAdgroupDiv").hide();
                    element.closest('.adGroup').find('.adgroupDiv').show();
                    element.closest('.adGroup').find(".overlay").hide();
                    $scope.isMinimumAdGroupBudget = true;
                    $scope.isMaximumAdGroupBudget = true;
                };



            }
        };
    })
});
