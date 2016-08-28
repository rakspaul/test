define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignClone', ['$scope', '$routeParams', '$location', '$timeout', '$modalInstance',
        'constants', 'vistoconfig', 'campaignCloneAction', 'workflowService',
        'localStorageService', 'momentService', 'urlBuilder', function ($scope, $routeParams, $location, $timeout, $modalInstance,
                                                     constants, vistoconfig, campaignCloneAction, workflowService,
                                                     localStorageService, momentService, urlBuilder) {
        var today = momentService.utcToLocalTime();

        $scope.showCloneLoader = false;
        $scope.cloneMediaPlanExists = false;
        $scope.checkUniqueNameNotFound = false;
        $scope.cloneLineItems = true;
        $scope.textConstants = constants;
        $scope.newMediaPlanStartDate = false;
        $scope.newMediaPlanDate = '';
        $scope.cloneAdGroups = false;

        $timeout(function () {
            var cloneStartDateInput = $('#cloneStartDateInput');

            cloneStartDateInput.datepicker('update', today);
            cloneStartDateInput.datepicker('setStartDate', today);
        }, 200);

        $scope.close=function (){
            $modalInstance.dismiss();
        };

        $scope.campaignCloneAction = function () {
            var cloneMediaPlanName = $scope.cloneMediaPlanName,
                cloneLineItems = $scope.cloneLineItems,
                cloneAdGroups = $scope.cloneAdGroups,
                cloneStartDate = $scope.newMediaPlanDate,
                errorMediaPlanHandler,
                flightDateSelected = $('input[name="chooseFlightDate"]:checked').val(),
                clientId = vistoconfig.getSelectedAccountId(),

                params = {
                    id: Number($routeParams.campaignId),
                    name: cloneMediaPlanName,
                    date: cloneStartDate,
                    originalFlightdates: flightDateSelected
                };

            $scope.showCloneLoader = true;

            if (cloneLineItems  && cloneAdGroups) {
                params.cloneLineitems = cloneLineItems;
                params.cloneAdGroups = cloneAdGroups;
                params.cloneAds = true;

                if (cloneAdGroups && (flightDateSelected ===
                    'automaticFlightDates') && $scope.newMediaPlanDate) {
                    params.startDate = momentService.localTimeToUTC(cloneStartDate, 'startTime');
                }

                errorMediaPlanHandler = function () {
                    $scope.showCloneLoader = false;
                };

                workflowService
                    .cloneCampaign(clientId, params)
                    .then(function (results) {
                        var responseData;

                        if (results.status === 'OK' || results.status === 'success') {
                            responseData = results.data.data;
                            $location.url(urlBuilder.mediaPlanOverviewUrl(responseData.id));
                            $scope.close();
                        } else {
                            errorMediaPlanHandler();
                        }
                    }, errorMediaPlanHandler);
            } else {
                workflowService.setMediaPlanClone(params);
                $location.url(urlBuilder.mediaPlanCreateUrl());
                $scope.close();
            }
        };

        $scope.makeCloneLineItemsTrue = function () {
            $scope.cloneLineItems = true;
        };

        $scope.showDuplicateAdGroupSection = function () {
            var startDateElem = $('#cloneStartDateInput');

            $scope.newMediaPlanStartDate = false;
            startDateElem.datepicker('setStartDate', today);

            if ($('#duplicateAdGroup').is(':checked')) {
                 $scope.newMediaPlanStartDate = true;
                 $scope.chooseFlightDate();
            } else {
                $scope.newMediaPlanStartDate = false;
            }
        };

        $scope.chooseFlightDate = function () {
            $scope.flightDateChosen = $('input[name="chooseFlightDate"]:checked').val();
            $scope.newMediaPlanStartDate = true;

            if ($scope.flightDateChosen !== 'automaticFlightDates') {
                $scope.newMediaPlanStartDate = false;
                $('#cloneStartDateInput').attr('disabled', true);
            } else {
                $scope.newMediaPlanDateChange();
                $('#cloneStartDateInput').attr('disabled', false);
            }
        };

        $scope.newMediaPlanDateChange = function () {
            if ($scope.newMediaPlanDate) {
                $scope.newMediaPlanStartDate = false;
             } else {
                $scope.newMediaPlanStartDate = true;
             }
        };

        $scope.isMediaPlanNameExist = function (event){
            var target =  event.target,
                cloneMediaPlanName = target.value,
                advertiserId = $scope.workflowData.campaignData.advertiserId,
                clientId = $scope.workflowData.campaignData.clientId,

                cloneObj={
                    advertiserId:advertiserId,
                    cloneMediaPlanName:cloneMediaPlanName
                };

            $scope.checkUniqueNameNotFound = true;
            $scope.cloneMediaPlanExists = false;

            if (advertiserId) {
                workflowService
                    .checkforUniqueMediaPlan(clientId, cloneObj)
                    .then(function (results) {
                        if (results.status === 'OK' || results.status === 'success') {
                            var responseData = results.data.data;
                            $scope.cloneMediaPlanExists = responseData.isExists;

                        }

                        $scope.checkUniqueNameNotFound = false;
                    });
            }

            if ($scope.cloneMediaPlanName) {
                $scope.newMediaPlanStartDate = false;
                $scope.showDuplicateAdGroupSection();
            } else {
                $scope.newMediaPlanStartDate = true;

            }
        };
    }]);
});
