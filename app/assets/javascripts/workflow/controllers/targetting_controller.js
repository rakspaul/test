var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('targettingController', function ($scope, $rootScope, $window, $routeParams, $timeout, constants, workflowService, audienceService) {

        var _targeting = this;

        $scope.showDeleteConfirmationPopup = false;
        $scope.adData.isGeographySelected = false;
        $scope.adData.isAudienceSelected = false;
        $scope.adData.isDaypartSelected = false;
        $scope.geoTargetingPreviewObj = null;
        $scope.showSwitchBox = true;


        var targeting = {};

        _targeting.showAudienceInfo =  function() {
            $scope.audienceDataForPreview = [];
            var fetchedObj = angular.copy(workflowService.getAdsDetails()),
                previouslySelectedAudience = fetchedObj.targets.segmentTargets.segmentList;
            _.each(previouslySelectedAudience, function(audienceObj) {
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
                if(fetchedObj && fetchedObj.targets.adDaypartTargets && _.size(fetchedObj.targets.adDaypartTargets) > 0 && $scope.mode === 'edit') {
                    $timeout(function() {
                        $scope.$broadcast("updateDayPart", true);
                    }, 2000)

                }
                $scope.adData.isDaypartSelected = true;
            }
        };

        /****************** START : AUDIENCE TARGETING  ***********************/

        $scope.saveAudience = function(selectedAudience) {
            $scope.audienceDataForPreview = selectedAudience;
        };

        // Audience Targeting Trigger -- Onclick
        $scope.selectAudTarget = function () {
            _targeting.setTargetingForPreview('Audience');
            $scope.$broadcast('triggerAudience');
        };

        $scope.deleteAudienceTargetting = function () {
            $scope.adData.isAudienceSelected = null;
            var audienceData = $scope.audienceDataForPreview;
            if(audienceData) audienceData.length = 0;
            workflowService.setDeleteModule('Audience');
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
            _targeting.setTargetingForPreview('Daypart');
            $scope.$broadcast('triggerDayPart');

        };

        $scope.deleteDayPartTargetting = function () {
            $scope.adData.isDaypartSelected = false;
            var dayPartData = $scope.selectedDayParts['data'];
            if(dayPartData) dayPartData.length = 0;
            workflowService.setDeleteModule('dayParting');
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
            _targeting.setTargetingForPreview('Geography'); // show targeting in side bar
            $scope.$broadcast('triggerGeography');

        };

        $scope.deleteGeoTargetting = function () {
            $scope.adData.isGeographySelected = false;
            $scope.geoTargetingPreviewObj = null;
            $scope.adData.targetName = null;
            workflowService.resetDeleteModule();
            workflowService.setSavedGeo(null);
            workflowService.setDeleteModule('Geography');
            if($scope.mode === 'edit') {
                var adData = angular.copy(workflowService.getAdsDetails());
                adData.targets.geoTargets= null;
                workflowService.setAdsDetails(adData);
            }
        };

        $scope.deleteTargetting = function () {
            $scope.showDeleteConfirmationPopup = !$scope.showDeleteConfirmationPopup;
            if ($scope.deleteType == "AUDIENCE")
                $scope.deleteAudienceTargetting();
            else if ($scope.deleteType == "GEO")
                $scope.deleteGeoTargetting();
            else if ($scope.deleteType == "DAYPART")
                $scope.deleteDayPartTargetting();
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
            $scope.showSwitchBox = true;
            if (($scope.isPlatformId === 1) || ($scope.adData.platformId === 25)) {
                $scope.showCitiesTab = false;  // Hide Cities Tab for Visto Bidder (platform Id 25)
                $scope.showSwitchBox = false;
            }
        });
    });

})();
