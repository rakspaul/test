define(['angularAMD','workflow/services/workflow_service','workflow/services/audience_service'],function (angularAMD) {
  angularAMD.controller('targettingController', function($scope, $rootScope, $timeout, workflowService,audienceService) {

        var _targeting = this;

        $scope.showDeleteConfirmationPopup = false;
        $scope.adData.isGeographySelected = false;
        $scope.adData.isAudienceSelected = false;
        $scope.adData.isDaypartSelected = false;
        $scope.geoTargetingPreviewObj = null;
        $scope.showSwitchBox = true;
        $scope.isDayPartTriggered = false;
        $scope.isGeoTargetEnabled = false;
        $scope.isAudienceTargetEnabled = false;
        $scope.isDaypartTargetEnabled = false;


        $rootScope.$on('targettingCapability',function (event, platform) {
          console.log("Targetting Cap : ",platform);
            angular.forEach(platform.vendorCapabilities, function(vendorCapability){
                console.log("Capability", vendorCapability.capability)
                switch (vendorCapability.capability) {
                    case 'Geo Targeting': $scope.isGeoTargetEnabled = true;
                                            break;
                    case 'Audience Targeting': $scope.isAudienceTargetEnabled = true;
                                            break;
                    case 'Daypart Targeting': $scope.isDaypartTargetEnabled = true;
                                            break;
                }
            })
        });

        var targeting = {};

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

            if (targetingName === 'Geography') {
                $scope.adData.isGeographySelected = true;

            }

            if (targetingName === 'Audience') {
                $scope.adData.isAudienceSelected = true;
                if(audienceService.getSelectedAudience()){
                    $scope.$broadcast('setSelectedAudience');
                } else {
                    if($scope.mode === 'edit') {
                        _targeting.showAudienceInfo();
                    }
                }
            }

            if (targetingName === 'Daypart') {
                $scope.adData.isDaypartSelected = true;
                if(fetchedObj && fetchedObj.targets.adDaypartTargets && _.size(fetchedObj.targets.adDaypartTargets) > 0 && $scope.mode === 'edit' &&  !$scope.isDayPartTriggered) {
                    $timeout(function() {
                        $scope.$broadcast("updateDayPart", true);
                        $scope.isDayPartTriggered = true;
                    }, 2000)

                }

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

        $scope.deleteTargetting = function () {
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
            if ($scope.deleteType == "AUDIENCE") {
                workflowService.setDeleteModule('Audience');
                $scope.deleteAudienceTargetting();
            } else if ($scope.deleteType == "GEO") {
                workflowService.setDeleteModule('Geography');
                $scope.deleteGeoTargetting();
            } else if ($scope.deleteType == "DAYPART") {
                workflowService.setDeleteModule('dayParting');
                $scope.deleteDayPartTargetting();
            }
        };

        $scope.cancelTargettingDelete = function () {
            $scope.deleteType = "";
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
        };

        /****************** END : GEO TARGETING  ***********************/

            // Targeting Trigger -- Onload.
        $scope.$on('setTargeting' , function($event, args) {
            _targeting.setTargetingForPreview(args[0]);
            if($scope.mode ==='edit' && args[0] === 'Geography'){
                var adData = workflowService.getAdsDetails();
                _targeting.showgeoTargetingInfo(adData)
            }
        })

        $rootScope.$on('resetTargeting',function () {
            $scope.deleteGeoTargetting();
            $scope.deleteDayPartTargetting();
            $scope.deleteAudienceTargetting();

        });

        $scope.deletetargets = function (type, event) {
            var elem = $(event.target);
            var leftPos = elem.closest(".cardSelectHolder").offset().left - elem.closest(".setTargetOptions").offset().left;
            elem.closest(".setTargetOptions").find(".msgPopup").css("left", leftPos);
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
    });

});
