var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CreativeListController', function ($scope,$rootScope, $window, $routeParams, constants, workflowService, 
        $timeout, utils, $location) {
        var creativeList = {
            getCreativesList: function (campaignId, advertiserId, formats, query) {
                workflowService
                    .getCreatives(campaignId, advertiserId, formats, query)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success' && result.data.data.length > 0) {
                            $scope.creativeListLoading = false;
                            $scope.creativesNotFound = false;
                            $scope.creativeData.creatives = result.data.data;
                            $scope.creativeData.creatives_count = result.data.data.length;
                        } else {
                            creativeList.errorHandler();
                        }
                    }, creativeList.errorHandler);
            },

            errorHandler: function () {
                $scope.creativesNotFound = true;
                $scope.creativeListLoading = false;
                $scope.creativeData.creatives = [];
                $scope.creativeData.creatives_count = 0;
            }
        };

        $scope.resetAlertMessage = function (){
           localStorage.removeItem('topAlertMessage');
           $rootScope.setErrAlertMessage('', 0);
        };

        $scope.getAdFormatIconName = function (adFormat) {
            var adFormatMapper = {
                'display': 'icon-image', 
                'video': 'icon-video', 
                'richmedia': 'icon-rich-media', 
                'social': 'icon-social'
            };

            adFormat = adFormat || 'display';
            return adFormatMapper[adFormat.toLowerCase()];
        };

        $scope.formatDate = function (date) {
            return moment(date).format('DD MMM YYYY');
        };

        $scope.creativeSearchFunc = function () {
            var searchVal = $scope.creativeSearch,
                qryStr = '',
                formats = 'VIDEO,DISPLAY';

            if (searchVal.length > 0) {
                qryStr += '&query=' + searchVal;
            }
            creativeList.getCreativesList($scope.campaignId, $scope.advertiserId, formats, qryStr);
        };

        $scope.prarentHandler = function (campaignId, campaignName, advertiserId, advertiserName) {
            var campaignData;

            $scope.creativeData = {};
            if (campaignId && advertiserId) {
                $scope.creativeListLoading = true;
                $scope.creativesNotFound = false;
                campaignData = {
                    'advertiserId': advertiserId,
                    'advertiserName': advertiserName,
                    'clientId': campaignId,
                    'clientName': campaignName
                };
                localStorage.setItem('campaignData', JSON.stringify(campaignData));
                $scope.campaignId = campaignId;
                $scope.advertiserId = advertiserId;
                $scope.creativeSearch = '';
                creativeList.getCreativesList(campaignId, advertiserId);
            } else {
                $scope.creativeListLoading = false;
                $scope.creativesNotFound = true;
            }
        };

        $scope.updateCreative = function () {
            var putCrDataObj = {};

            putCrDataObj.name = $scope.selectedCreativeData.name;
            putCrDataObj.tag = $scope.editableTag;
            putCrDataObj.sizeId = $scope.selectedCreativeData.size.id;
            putCrDataObj.creativeFormat = $scope.selectedCreativeData.creativeFormat;
            putCrDataObj.creativeType = $scope.selectedCreativeData.creativeType;
            putCrDataObj.sslEnable = 'true';
            putCrDataObj.updatedAt = $scope.selectedCreativeData.updatedAt;
            $scope.updateForceSaveData = putCrDataObj;
            workflowService
                .updateCreative(
                    $scope.selectedCreativeData.clientId, 
                    $scope.selectedCreativeData.advertiserId, 
                    $scope.selectedCreativeData.id, 
                    putCrDataObj
                )
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.selectedCreativeData.updatedAt = result.data.data.updatedAt;
                        $scope.creativeData.creatives[$scope.selectedCreativePos] = result.data.data;
                        $scope.showViewTagPopup = false;
                    } else if (result.data.data.message ===
                            'Creative with this tag already exists. If you still want to save, use force save') {
                        $scope.showDuplicateTagPopup = true;
                        $scope.IncorrectTag = false;
                    }
                    else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_TAG_UPDATE_ERROR;
                    }
                });
        };

        $scope.updateTag = function (context) { 
            var PatternOutside = new RegExp(/<script.*>.*(https:).*<\/script>.*/),
                PatternInside = new RegExp(/<script.*(https:).*>.*<\/script>.*/),
                tagLower = $scope.editableTag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');

            if (tagLower.match(PatternOutside)) {
               if ((tagLower.indexOf('%%tracker%%') > -1)) {
                   $scope.updateCreative();
               } else {
                   $scope.IncorrectTag = true;
                   $scope.incorrectTagMessage =$scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
               }
            } else if (tagLower.match(PatternInside)) {
                if ((tagLower.indexOf('%%tracker%%') > -1)){
                   $scope.updateCreative();
                } else {
                   $scope.IncorrectTag = true;
                   $scope.incorrectTagMessage =$scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
               }
            } else {
                context.IncorrectTag = true;
                context.incorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG;
            }
        };

        $scope.ShowHideTag = function (obj, pos) {
            $scope.selectedCreativeData = obj;
            $scope.selectedCreativePos = pos;
            $scope.showViewTagPopup = true;
            $scope.editorEnabled = false;
            $scope.creativeTag = obj.tag;
        };

        $scope.enableEditor = function () {
            $scope.editorEnabled = true;
            $scope.editableTag =  $scope.creativeTag;
        };

        $scope.disableEditor = function () {
            $scope.IncorrectTag = false;
            $scope.showViewTagPopup = false;
            $scope.editorEnabled = false;
        };

        $scope.saveDuplicate = function () {
            workflowService
                .forceSaveCreatives(
                    $scope.selectedCreativeData.clientId, 
                    $scope.selectedCreativeData.advertiserId, 
                    $scope.updateForceSaveData
                )
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.showDuplicateTagPopup = false;
                        $scope.creativeData.creatives[$scope.selectedCreativePos] = result.data.data;
                        $scope.disableEditor();
                    } else {
                        $scope.IncorrectTag = true;
                        $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_FORCESAVE;
                    }
                });
        };

        $scope.toggleBtn = function (event) {
            var target = $(event.target),
                parentElem =  target.parents('.miniToggle');

            parentElem
                .find('label')
                .removeClass('active');
            target
                .parent()
                .addClass('active');
            target.attr('checked', 'checked');
        };

        $scope.cancelDuplicate = function () {
            $scope.showDuplicateTagPopup = false;
            $scope.IncorrectTag = true;
            $scope.incorrectTagMessage = $scope.textConstants.WF_CREATIVE_TAG_UPDATE_ERROR;
            // enable cancel, save button on cancel duplicate
            $scope.disableUpdateCancel = false;
        };

        $('.main_navigation')
            .find('.active')
            .removeClass('active')
            .end()
            .find('#creative_nav_link')
            .addClass('active');
        $('html').css('background', '#ececec');

        $scope.textConstants = constants;
        $scope.creativeData = {};
        $scope.adData = {};
        $scope.adData.screenTypes = [];
        $scope.creativeListLoading = true;
        $scope.creativesNotFound = false;
        $scope.showViewTagPopup = false;
        $scope.edittrue = true;
        $scope.IncorrectTag = false;
        $scope.showDuplicateTagPopup = false;
        $scope.campaignId = $routeParams.campaignId;
        
        //Search Hide / Show
        $scope.searchShowInput = function () {
            $(".searchInputBtn").hide();
            var searchInputForm = $(".searchInputForm");
            searchInputForm.show();
            searchInputForm.animate({width: '300px'}, 'fast');
        };
        
        $scope.searchHideInput = function () {
            $(".searchInputForm").animate({width: '44px'}, 'fast');
            setTimeout(function(){ $(".searchInputForm").hide(); }, 300);
            setTimeout(function(){ $(".searchInputBtn").fadeIn(); }, 300);
        };
        
        //Header Hide Show Details
        $scope.headerToggle = function () {
            $(".vistoTable .thead .childRow").toggle();
            $(".vistoTable .thead .icon-arrow-down-thick").toggleClass('arrowLookDown');
            
        }
        
        
        
    });
})();
