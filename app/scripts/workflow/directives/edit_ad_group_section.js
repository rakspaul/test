define(['angularAMD'],function (angularAMD) {
    'use strict';
    angularAMD.directive("editAdGroupSection", function ($http, $compile) {
        return {
            restrict:'EAC',
            controller : function($scope, momentService, workflowService) {
                $scope.processAdGroupEditData = function(formElem, adGroupsData) {
                    console.log("adGroupsData", adGroupsData);
                    $scope.adgroupId = adGroupsData.adGroup.id;
                    $scope.adIGroupName = adGroupsData.adGroup.name;
                    $scope.editAgGroupLabels = workflowService.recreateLabels(adGroupsData.labels);
                    $scope.adIGroupBudget = adGroupsData.adGroup.deliveryBudget;

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
                        return memo + obj.cost;
                    }, 0);

                    $scope.adGroupMaxBudget = $scope.workflowData.campaignData.deliveryBudget - (adGroupsBudget + adsBudget);

                    var startTime = momentService.utcToLocalTime(adGroupsData.adGroup.startTime);
                    var highestEndTime = momentService.utcToLocalTime(adGroupsData.adGroup.endTime);


                    var startDateElem = formElem.find("#individualAdsStartDateInput");
                    startDateElem.datepicker("update", startTime);

                    var endDateElem = formElem.find("#individualAdsEndDateInput");
                    endDateElem.datepicker("update", highestEndTime);

                    $scope.$watch('setStartdateIndependant', function () {
                        $scope.extractor(campaignAdsData, formElem);
                    });
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
                        var formElem = element.closest('.adGroup').find('.editAdgroupDiv form');
                        $scope.processAdGroupEditData(formElem, $scope.adGroupsData);
                    });
                });

                $scope.cancelEditAdGroup = function () {
                    element.closest('.adGroup').find(".editAdgroupDiv").hide();
                    element.closest('.adGroup').find('.adgroupDiv').show();
                };


            }
        };
    })
});
