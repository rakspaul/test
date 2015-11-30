var angObj = angObj || {};
(function () {
    'use strict';
angObj.controller('BuyingPlatformController', function($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location,$filter, platformCustomeModule,$rootScope) {
        $scope.$watch('adData.platformId', function(newValue) {
            $scope.$parent.changePlatform(newValue);
        })
        $scope.trackingIntegrationId ='';
        var tempPlatform ;
        var storedResponse;

        $scope.$on('updatePlatform',function(event,platform){
          $scope.defaultPlatform = platform[0];
          $scope.selectPlatform((platform[0].switchPlatform ? event : '') , platform[0]);
        })

        $scope.selectPlatform =  function(event, platform) {
           // $scope.TrackingIntegrationsSelected=false;localStorage.setItem("trackingIntegration",false);  //Enable Targetting and Inventory filters
            storedResponse = workflowService.getAdsDetails();
            var settings = "";

            if($scope.mode === 'edit'){
                if(storedResponse.targets.geoTargets)
                    settings = "Geography";

                if(storedResponse.platform){
                    if(storedResponse.platform.name === platform.name) {
                        //directly set  the platform if it is the same
                        $scope.setPlatform(event, platform);
                    }
                    else {
                        //if the platform is changed but no targets were selected allow change
                        if(_.size(storedResponse.targets.geoTargets) == 0 ){
                            $scope.setPlatform(event, platform);
                        }
                        else{
                            //display warnign popup
                            if($scope.defaultPlatform.id !== platform.id) {
                              tempPlatform = platform;
                              $scope.changePlatformMessage = "Your entries for the following settings are not compatible with "+$filter('toPascalCase')(platform.name)+": "+settings+". Would you like to clear these settings and switch platforms? (OK/Cancel).";
                              $scope.changePlatformPopup = true;
                            } else {
                              $scope.setPlatform(event, platform);
                            }
                        }

                    }
                }
                else{
                    $scope.setPlatform(event,platform);
                }

            }
            else{
                $scope.setPlatform(event, platform);
            }


        }

        $scope.setPlatform = function(event, platform){
            $scope.selectedPlatform = {};
            workflowService.setPlatform(platform);
            $rootScope.$emit('triggerAudienceLoading');
            //localStorage.setItem("trackingIntegration",false);
           // workflowService.setTrackingPlatform(false);
           if($scope.mode!='edit'){
                $scope.$parent.TrackingIntegrationsSelected = false;
           }
            var name = platform.displayName ? platform.displayName : platform.name;
            $scope.adData.platform =  name;
            $scope.adData.platformId = platform.id;
            $scope.selectedPlatform[platform.id] = name; console.log($scope.selectedPlatform);
            event && $scope.platformCustomInputs();
        }

          $scope.selectTrackingIntegrations=function(trackingIntegration){
                //localStorage.setItem("trackingIntegration",true);
                //workflowService.setTrackingPlatform(true);
                if($scope.mode!='edit'){
                    $scope.$parent.TrackingIntegrationsSelected=true;
                }
                $scope.selectedPlatform = {};
                $scope.selectedPlatform[trackingIntegration.id] = trackingIntegration.name;
                /*To populate the newly selected Platform in sideBar*/
                $scope.adData.platform =  trackingIntegration.name;
                $scope.adData.platformId = trackingIntegration.id;


                /*code to make creatives already set to empty*/
                 $scope.adData.setSizes = constants.WF_NOT_SET;
                 $scope.creativeData['creativeInfo']="undefined";
                 $scope.selectedArr.length=0;
            }

        $scope.showCustomeFieldBox =function() {
          $(".platform-custom").show().delay( 300 ).animate({left: "50%" , marginLeft: "-323px"}, 'slow');
          $(".offeringsWrap").hide();
        }


        $scope.platformCustomInputs = function() {
          var platformWrap =  $(".platWrap");
          workflowService.getPlatformCustomInputs($scope.adData.platformId).then(function (result) {
              var adPlatformCustomInputs, platformCustomeJson;
              if (result.status === "OK" || result.status === "success") {
                platformCustomeJson = JSON.parse(result.data.data.customInputJson);
                if($scope.mode === 'edit' ) {
                  $scope.showCustomeFieldBox();
                  //if($scope.adData.platformId == $scope.workflowData['adsData'].platform.id) {
                    var adPlatformCustomInputsLocalStorageValue = localStorage.getItem('adPlatformCustomInputs');
                    adPlatformCustomInputs =  (adPlatformCustomInputsLocalStorageValue && JSON.parse(adPlatformCustomInputsLocalStorageValue))  || platformCustomeJson;
                    platformCustomeModule.init(platformCustomeJson, platformWrap, adPlatformCustomInputs);
                  //} else {
                    //$scope.showCustomeFieldBox();
                    //platformCustomeModule.init(platformCustomeJson, platformWrap);
                  //}
                } else {
                  $scope.showCustomeFieldBox();
                    //maintain state of building platform strategy when user selects it navigtes to other places
                    if(!$scope.postPlatformDataObj){
                        platformCustomeModule.init(platformCustomeJson, platformWrap);
                    }

                }
              }
          });
        }

        $scope.$on('switchPlatformFunc', function() {
          $(".platform-custom").delay( 300 ).animate({left: "100%" , marginLeft: "0px"}, function() {
              $(this).hide();
              $scope.showPlatformBox =  false;
          });
          $(".offeringsWrap").show();

        })


        $scope.cancelChangePlatform  = function(){
            $scope.changePlatformPopup = !$scope.changePlatformPopup;
            tempPlatform = [];
        }

        $scope.confirmChange = function() {
            $scope.setPlatform(null, tempPlatform);
            $scope.changePlatformPopup = false;
            storedResponse.targets.geoTargets = {};
            workflowService.setAdsDetails(storedResponse);
            $scope.$broadcast('resetGeoTags');
            $scope.platformCustomInputs()

        }
    });

})();