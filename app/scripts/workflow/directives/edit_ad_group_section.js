define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive("editAdGroupSection", function ($http, $compile) {
        return {
            restrict:'EAC',
            controller : function($scope, momentService, workflowService, constants) {
                $scope.editAdGroupFlag = false;
                $scope.processAdGroupEditData = function(formElem, adGroupsData, adGroupsIndex) {

                    $scope.adgroupId = adGroupsData.adGroup.id;
                    $scope.adGroupName = adGroupsData.adGroup.name;
                    $scope.tags = workflowService.recreateLabels(_.uniq(adGroupsData.labels));
                    $scope.adIGroupBudget = adGroupsData.adGroup.deliveryBudget;
                    $scope.updatedAt = adGroupsData.adGroup.updatedAt;

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

                    //reset the ad group max and min budget flag.
                    $scope.resetAdsBudgetsFlag();

                    $scope.adGroupMaxBudget = (Math.ceil($scope.workflowData.campaignData.deliveryBudget) -
                        adGroupsBudget) + Math.ceil(adsBudget) ;

                    var startTime = momentService.utcToLocalTime(adGroupsData.adGroup.startTime);
                    var highestEndTime = momentService.utcToLocalTime(adGroupsData.adGroup.endTime);

                    var getADsForGroupData = $scope.workflowData['getADsForGroupData'][adGroupsIndex];
                    var startDateElem = formElem.find(".adGrpStartDateInput");
                    var endDateElem = formElem.find(".adGrpEndDateInput");

                    if (getADsForGroupData && getADsForGroupData.length > 0 ) {
                        $scope.extractor(getADsForGroupData, formElem);
                    } else {
                        $scope.resetAdsData();
                        startDateElem.datepicker("setStartDate", $scope.campaignStartTime);
                        startDateElem.datepicker("setEndDate", $scope.campaignEndTime);

                        endDateElem.datepicker("setStartDate", $scope.campaignStartTime);
                        endDateElem.datepicker("setEndDate", $scope.campaignEndTime);
                    }

                    startDateElem.datepicker("update", startTime);
                    endDateElem.datepicker("update", highestEndTime);
                };
            },

            link: function($scope, element, attrs) {
                var template;
                element.bind('click', function() {
                    $(".editAdgroupDiv").hide();
                    $(".adgroupDiv").show();
                    element.closest('.adGroup').find('.adgroupDiv').hide();
                    element.closest('.adGroup').find('.editAdgroupDiv').show();
                    element.closest('.adGroup').find(".overlay").show();
                    $http.get(assets.html_edit_adgroup).then(function (tmpl) {
                        var labels,
                            i,
                            len,
                            regex = /(<([^>]+)>)/ig,
                            formElem;

                        template = $compile(tmpl.data)($scope);
                        element.closest('.adGroup').find('.editAdgroupDiv').html(template);
                        $scope.adGroupsData = JSON.parse(attrs.adGroupData);

                        $scope.adGroupsIndex = JSON.parse(attrs.adGroupIndex);
                        $scope.editAdGroupFlag = true;
                        $scope.showCreateAdGrp = true;
                        formElem = element.closest('.adGroup').find('.editAdgroupDiv form');

                        // Temp variable for resetting in case of cancel
                        $scope.adGroupsDataTemp = $scope.adGroupsData;

                        // Strip <mark> tags from labels, if any.
                        labels = $scope.adGroupsData.labels;
                        len = labels.length;
                        for (i = 0; i < len; i ++) {
                            labels[i] = labels[i].replace(regex, '');
                        }

                        $scope.processAdGroupEditData(formElem, $scope.adGroupsData, $scope.adGroupsIndex);
                    });
                });

                $scope.cancelEditAdGroup = function () {
                    // Restore Adgroup data to previous state before edit. This is especially for the labels,
                    // as we strip out the <mark> tags of the lighlighted labels for editing.
                    $scope.workflowData.campaignGetAdGroupsData[$scope.adGroupsIndex] = $scope.adGroupsDataTemp;

                    element.closest('.adGroup').find(".editAdgroupDiv").hide();
                    element.closest('.adGroup').find('.adgroupDiv').show();
                    element.closest('.adGroup').find(".overlay").hide();
                };
            }
        };
    });
});
