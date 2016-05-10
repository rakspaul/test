define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignClone', function( $scope , $routeParams, $location, $modalInstance, constants, vistoconfig, campaignCloneAction, workflowService, localStorageService, momentService) {
        $scope.showCloneLoader = false;
        $scope.cloneMediaPlanExists = false;
        $scope.checkUniqueNameNotFound = false;
        $scope.cloneLineItems = true;
        $scope.textConstants = constants;
        $scope.newMediaPlanStartDate = false ;
        $scope.newMediaPlanDate = "" ;

        $scope.close=function(){
            $modalInstance.dismiss();
        };

        $scope.campaignCloneAction = function() {
            var cloneMediaPlanName = $scope.cloneMediaPlanName;
            var cloneLineItems = $scope.cloneLineItems;
            var cloneAdGroups = $scope.cloneAdGroups;
            var cloneStartDate = $scope.newMediaPlanDate;
            var flightDateChosen = $("input[name='chooseFlightDate']:checked").val() ;

            var params = {
                'id': Number($routeParams.campaignId),
                'name': cloneMediaPlanName
            }

            $scope.showCloneLoader = true;
            if(cloneLineItems && cloneAdGroups) {
                params['cloneLineitems'] = cloneLineItems;
                params['cloneAdGroups'] = cloneAdGroups;
                params['cloneAds'] = true;
                if( cloneAdGroups &&  (flightDateChosen == "automaticFlightDates") && $scope.newMediaPlanDate ) {
                    params['startDate'] = momentService.localTimeToUTC(cloneStartDate) ;
                }
                var errorMediaPlanHandler = function () {
                    $scope.showCloneLoader = false;
                };
                workflowService.cloneCampaign(params).then(function (results) {
                    var url;
                    if (results.status === 'OK' || results.status === 'success') {
                        var responseData = results.data.data;
                        url = '/mediaplan/' + responseData.id + '/overview';
                        $location.url(url);
                        $scope.close();
                    } else {
                        errorMediaPlanHandler();
                    }
                }, errorMediaPlanHandler);
            } else {
                workflowService.setMediaPlanClone(params);
                $location.url(vistoconfig.MEDIAPLAN_CREATE);
                $scope.close();
            }
        };

        $scope.showDuplicateAdGroupSection = function() {
           
            $scope.newMediaPlanStartDate = false ;
            var startDateElem = $('#cloneStartDateInput');
            var today = momentService.utcToLocalTime();
            startDateElem.datepicker("setStartDate", today);

            if( $("#duplicateAdGroup").is(":checked") ) {
                 $scope.newMediaPlanStartDate = true ;
                $(".duplicateAdGroupSection").find(".disabled_div").hide() ;
                 $scope.chooseFlightDate() ;
            } else {
                $scope.newMediaPlanStartDate = false ;
                $(".duplicateAdGroupSection").find(".disabled_div").show() ;

            }
            
        };
        $scope.chooseFlightDate = function(type) {
                var flightDateChosen = $("input[name='chooseFlightDate']:checked").val() ;
                $scope.newMediaPlanStartDate = true ;
                if( flightDateChosen != "automaticFlightDates" ) {
                    $scope.newMediaPlanStartDate = false ;
                    $("#cloneStartDateInput").attr("disabled" , true) ;
                } else {
                    $scope.newMediaPlanDateChange() ;
                    $("#cloneStartDateInput").attr("disabled" , false) ;
                }
        }
        $scope.newMediaPlanDateChange = function() {
            if( $scope.newMediaPlanDate ) {
                $scope.newMediaPlanStartDate = false ;
             } else {
                $scope.newMediaPlanStartDate = true ;
             }
        }
       
        $scope.isMediaPlanNameExist = function(event){
            var target =  event.target,
                cloneMediaPlanName = target.value,
                advertiserId = $scope.workflowData.campaignData.advertiserId;

            $scope.checkUniqueNameNotFound = true;
            $scope.cloneMediaPlanExists = false;
            if(advertiserId) {
                workflowService.checkforUniqueMediaPlan(advertiserId, cloneMediaPlanName).then(function (results) {
                    var url;
                    if (results.status === 'OK' || results.status === 'success') {
                        var responseData = results.data.data;
                        $scope.cloneMediaPlanExists = responseData.isExists;

                    }
                    $scope.checkUniqueNameNotFound = false;
                });
            }
            if( $scope.cloneMediaPlanName ) {
                $scope.newMediaPlanStartDate = false ;
                $scope.showDuplicateAdGroupSection();
            } else {
                $scope.newMediaPlanStartDate = true ;

            }
        };

       

    });
});
