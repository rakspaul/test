define(['angularAMD','workflow/services/workflow_service','workflow/services/audience_service'],function (angularAMD) {
  angularAMD.controller('targettingController', function($scope, $rootScope, $timeout, workflowService,audienceService, videoService) {

        var _targeting = this;
        var targeting = {};

        $scope.showDeleteConfirmationPopup = false;
        $scope.adData.isGeographySelected = false;
        $scope.adData.isAudienceSelected = false;
        $scope.adData.isDaypartSelected = false;
        $scope.adData.isVideoSelected = false;
        $scope.geoTargetingPreviewObj = null;
        $scope.showSwitchBox = true;
        $scope.isDayPartTriggered = false;


        _targeting.showAudienceInfo =  function() {
            $scope.audienceDataForPreview = [];
            var fetchedObj = angular.copy(workflowService.getAdsDetails()),
                previouslySelectedAudience = fetchedObj.targets.segmentTargets.segmentList;
            _.each(previouslySelectedAudience, function(audienceObj) {
                audienceObj.segment.isIncluded = audienceObj.isIncluded;
                $scope.audienceDataForPreview.push(audienceObj.segment);
            })
            audienceService.setSelectedAudience(angular.copy($scope.audienceDataForPreview));
        };


        _targeting.setTargetingForPreview = function(targetingName) {
            var fetchedObj = angular.copy(workflowService.getAdsDetails());
            $scope.selectedTargeting = {};
            $scope.adData.targetName = targetingName;
            $scope.selectedTargeting[targetingName.toLowerCase()] = true;

            switch(targetingName) {

                case 'Geography' :
                    $scope.adData.isGeographySelected = true;
                break;

                case 'Audience' :
                    $scope.adData.isAudienceSelected = true;
                    if(audienceService.getSelectedAudience()){
                        $scope.$broadcast('setSelectedAudience');
                    } else {
                        if($scope.mode === 'edit') {
                            _targeting.showAudienceInfo();
                        }
                    }
                break;

                case 'Daypart' :
                    $scope.adData.isDaypartSelected = true;
                    if(fetchedObj && fetchedObj.targets.adDaypartTargets && _.size(fetchedObj.targets.adDaypartTargets) > 0 && $scope.mode === 'edit' &&  !$scope.isDayPartTriggered) {
                        $timeout(function() {
                            $scope.$broadcast("updateDayPart", true);
                            $scope.isDayPartTriggered = true;
                        }, 2000)
                    }
                break;

                case 'Video' :
                    $scope.adData.isVideoSelected = true;
                break;
            }
        };

        /****************** START : AUDIENCE TARGETING  ***********************/

        $scope.saveAudience = function(selectedAudience) {
            $scope.audienceDataForPreview = selectedAudience;
        };

        // Audience Targeting Trigger -- Onclick
        $scope.selectAudTarget = function () {
            $scope.$broadcast('triggerAudience');
            _targeting.setTargetingForPreview('Audience');
        };

        $scope.deleteAudienceTargetting = function () {
            $scope.adData.isAudienceSelected = null;
            var audienceData = $scope.audienceDataForPreview;
            if(audienceData) audienceData.length = 0;
            $scope.adData.isAudienceSelected = null;

            if($scope.mode === 'edit') {
                var adData = angular.copy(workflowService.getAdsDetails());
                adData.targets.segmentTargets.segmentList = null;
                workflowService.setAdsDetails(adData);
                audienceService.resetAudienceData();
            }
        };

        /****************** START : DAY PARTING TARGETING  ***********************/

        $scope.saveDayPartForPreview = function () {
            $scope.selectedDayParts.selected = audienceService.getDayTimeSelectedObj();
            $scope.selectedDayParts.data = audienceService.getDaytimeObj();
            $scope.dayPartTotal = $scope.selectedDayParts.data ? $scope.selectedDayParts.data.length : 0;
        };

        // Day Targeting Trigger
        $scope.selectDayTarget = function () {
            $scope.$broadcast('triggerDayPart');
            _targeting.setTargetingForPreview('Daypart');
        };

        $scope.deleteDayPartTargetting = function () {
            $scope.adData.isDaypartSelected = false;
            var dayPartData = $scope.selectedDayParts['data'];
            if(dayPartData) dayPartData.length = 0;
            $scope.adData.isDaypartSelected = false;
            localStorage.removeItem("dayPart");
            localStorage.removeItem("dayTimeSelected");
            localStorage.removeItem("daytimeArr");
            if($scope.mode === 'edit') {
                var adData = angular.copy(workflowService.getAdsDetails());
                adData.targets.adDaypartTargets = null;
                audienceService.resetDayPartdata();
                workflowService.setAdsDetails(adData);
            }
        };

        /****************** START : GEO TARGETING  ***********************/

        _targeting.showgeoTargetingInfo = function(adData) {
            var data = adData.targets ? adData.targets.geoTargets : adData;
            var previewObj = {}
            var includedCount = 0;
            var excludeCount = 0;
            var includeLabel = [];
            var excludeLabel = [];
            var str='';

            if(data.REGION && data.REGION.geoTargetList.length >0) {
                if(data.REGION.isIncluded) {
                    includedCount = data.REGION.geoTargetList.length;
                    str =  data.REGION.geoTargetList.length + ' Region' + ((data.REGION.geoTargetList.length > 1) ? 's' : '') ;
                    includeLabel.push(str);
                } else {
                    excludeCount = data.REGION.geoTargetList.length;
                    str = data.REGION.geoTargetList.length + ' Region' + ((data.REGION.geoTargetList.length > 1) ? 's' : '') ;
                    excludeLabel.push(str);
                }

            }
            if(data.DMA && data.DMA.geoTargetList.length > 0) {
                if (data.DMA.isIncluded) {
                    includedCount += data.DMA.geoTargetList.length;
                    str = data.DMA.geoTargetList.length + ' Metro' + ((data.DMA.geoTargetList.length > 1) ? 's' : '') ;
                    includeLabel.push(str);
                } else {
                    excludeCount += data.DMA.geoTargetList.length;
                    str = data.DMA.geoTargetList.length + ' Metro' + ((data.DMA.geoTargetList.length > 1) ? 's' : '') ;
                    excludeLabel.push(str);
                }
            }
            if(data.CITY &&  data.CITY.geoTargetList.length >0) {
                if(data.CITY.isIncluded) {
                    includedCount += data.CITY.geoTargetList.length;
                    str = data.CITY.geoTargetList.length +  ((data.CITY.geoTargetList.length > 1) ? ' Cities' : ' City') ;
                    includeLabel.push(str);
                } else {
                    excludeCount += data.CITY.geoTargetList.length;
                    str = data.CITY.geoTargetList.length +  ((data.CITY.geoTargetList.length > 1) ? ' Cities' : ' City') ;
                    excludeLabel.push(str);
                }
            }

            if(data.ZIP_CODE && data.ZIP_CODE.geoTargetList.length >0) {
                if(data.ZIP_CODE.isIncluded) {
                    includedCount += data.ZIP_CODE.geoTargetList.length;
                    str = data.ZIP_CODE.geoTargetList.length + ' Postal Code' + ((data.ZIP_CODE.geoTargetList.length > 1) ? 's' : '') ;
                    includeLabel.push(str);
                } else {
                    excludeCount += data.ZIP_CODE.geoTargetList.length;
                    str = data.ZIP_CODE.geoTargetList.length + ' Postal Code' + ((data.ZIP_CODE.geoTargetList.length > 1) ? 's' : '') ;
                    excludeLabel.push(str);
                }
            }

            previewObj.include =  {'count' : includedCount, 'label' : includeLabel.join(' ')};
            previewObj.exclude =  {'count' : excludeCount, 'label' : excludeLabel.join(' ')};

            $scope.geoTargetingPreviewObj = previewObj;
        };


        $scope.showGeoTargetingForPreview = function() {
            $scope.geoTargetingPreviewData = workflowService.getSavedGeo();
            _targeting.showgeoTargetingInfo($scope.geoTargetingPreviewData.modify)
        };

        // geo Targeting Trigger
        $scope.selectGeoTarget = function () {
            $scope.$broadcast('triggerGeography');
            _targeting.setTargetingForPreview('Geography'); // show targeting in side bar

        };

        $scope.deleteGeoTargetting = function () {
            $scope.adData.isGeographySelected = false;
            $scope.geoTargetingPreviewObj = null;
            workflowService.resetDeleteModule();
            workflowService.setSavedGeo(null);
            $scope.adData.isGeographySelected  = null;
            $scope.$broadcast('resetVariables');
            if($scope.mode === 'edit') {
                var adData = angular.copy(workflowService.getAdsDetails());
                adData.targets.geoTargets= null;
                workflowService.setAdsDetails(adData);
            }
        };



        $scope.cancelTargettingDelete = function () {
            $scope.deleteType = "";
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
        };

        /****************** END : GEO TARGETING  ***********************/



        /****************** START : VIDEO TARGETING  ***********************/

        $scope.selectVideoTarget = function () {
            $scope.$broadcast('triggerVideo');
            _targeting.setTargetingForPreview('Video');
        };

        $scope.showVideoPreviewData = function(videoData) {
          if(videoData && (videoData.videoTargets.sizes.length >0 || videoData.videoTargets.positions.length >0 || videoData.videoTargets.playbackMethods.length > 0)) {
              $scope.adData.videoPreviewData['sizes'] = _.pluck(videoData.videoTargets.sizes, 'name').join(', ');
              $scope.adData.videoPreviewData['positions'] = _.pluck(videoData.videoTargets.positions, 'name').join(', ');
              $scope.adData.videoPreviewData['playbackMethods'] = _.pluck(videoData.videoTargets.playbackMethods, 'name').join(', ');
          }
        };

      _targeting.showVideoTargetingInfo = function(adData) {
            var data = adData.targets;
            $scope.showVideoPreviewData(data);
        };

        $scope.deleteVideoTargetting = function() {
            $scope.adData.isVideoSelected = false;
            $scope.adData.videoPreviewData = {};
            workflowService.resetDeleteModule();
            videoService.saveVideoData(null);
            if($scope.mode === 'edit') {
                var adData = angular.copy(workflowService.getAdsDetails());
                adData.targets.videoTargets= null;
                workflowService.setAdsDetails(adData);
            }
        };

        /****************** END : VIDEO TARGETING  ***********************/


        // Targeting Trigger -- Onload.
        $scope.$on('setTargeting' , function($event, args) {
            _targeting.setTargetingForPreview(args[0]);
            if($scope.mode ==='edit') {
                var adData = workflowService.getAdsDetails();

                switch(args[0]) {
                    case 'Geography' :
                        _targeting.showgeoTargetingInfo(adData)
                    break;
                    case 'Video' :
                        _targeting.showVideoTargetingInfo(adData)
                    break;

                }
            }
        })

        $rootScope.$on('resetTargeting',function () {
            $scope.deleteGeoTargetting();
            $scope.deleteDayPartTargetting();
            $scope.deleteAudienceTargetting();
            $scope.deleteVideoTargetting();
        });

        $scope.deleteTargetting = function () {
          $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
          switch($scope.deleteType) {
              case 'AUDIENCE' :
                  workflowService.setDeleteModule('Audience');
                  $scope.deleteAudienceTargetting();
                  break;
              case 'GEO':
                  workflowService.setDeleteModule('Geography');
                  $scope.deleteGeoTargetting();
                  break;
              case 'DAYPART':
                  workflowService.setDeleteModule('dayParting');
                  $scope.deleteDayPartTargetting();
                  break;
              case 'VIDEO' :
                  workflowService.setDeleteModule('video');
                  $scope.deleteVideoTargetting();
                  break;
          }
        };

        $scope.deletetargets = function (type, event) {
            var elem = $(event.target);
            var leftPos = elem.closest(".cardSelectHolder").offset().left - elem.closest(".setTargetOptions").offset().left;
            var msgPopUpHeight = elem.closest(".setTargetOptions").find(".msgPopup").height();
            var topPos = elem.closest(".cardSelectHolder").offset().top - elem.closest(".cardSelectHolder").height() + msgPopUpHeight - 81;
            elem.closest(".setTargetOptions").find(".msgPopup").css("left", leftPos);
            elem.closest(".setTargetOptions").find(".msgPopup").css("top", topPos);
            $scope.showDeleteConfirmationPopup = true;
            $scope.deleteType = type;
        };

        //broadcast from geoTargettingController
        $scope.$on('renderTargetingUI', function (event, platformId) {
            $scope.isPlatformId = platformId;
            $scope.isPlatformSelected = platformId ? true : false;
            $scope.showRegionsTab = true;
            $scope.showCitiesTab = true;
            $scope.isSwitchForVistoBidder = true;
            $scope.searchLabel = $scope.textConstants.SEARCHFORREGIONANDCITY;
            if (($scope.isPlatformId === 1) || ($scope.adData.platformId === 25)) {
                $scope.showCitiesTab = false;  // Hide Cities Tab for Visto Bidder (platform Id 25)
                $scope.isSwitchForVistoBidder = false;
                $scope.searchLabel = $scope.textConstants.SEARCHFORREGION;
            }
        });

        $rootScope.$on('targettingCapability',function (event, platform) {
          $scope.isGeoTargetEnabled = false;
          $scope.isAudienceTargetEnabled = false;
          $scope.isDaypartTargetEnabled = false;
          $scope.isVideoTargetEnabled = false;
          angular.forEach(platform.vendorCapabilities, function(vendorCapability){
              switch (vendorCapability.capability) {

                  case 'Geo Targeting':
                      $scope.isGeoTargetEnabled = true;
                      break;

                  case 'Audience Targeting':
                      $scope.isAudienceTargetEnabled = true;
                      break;

                  case 'Daypart Targeting':
                      $scope.isDaypartTargetEnabled = true;
                      break;

                  case 'Video Creative Serving':
                      $scope.isVideoTargetEnabled = true;
                      break;
              }
          })
        });
  });
});
