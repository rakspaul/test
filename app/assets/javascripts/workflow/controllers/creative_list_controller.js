var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('CreativeListController', function ($scope,$rootScope, $window, $routeParams, constants, workflowService, 
        $timeout, utils, $location,momentService) {
        var checkedCreativeArr=[];
        $scope.creativeAds={};
        $scope.creativeAds['creativeAdData'] = {};
        $scope.showHideToggle=false;
        $scope.creativeData={}
        $scope.creativeData['creatives']=[];
        $scope.pageSize=20;
        $scope.pageNo = 1;

        $scope.textConstants = constants;
        $scope.adData = {};
        $scope.adData.screenTypes = [];
        $scope.creativeListLoading = true;
        $scope.creativesNotFound = false;
        $scope.showViewTagPopup = false;
        $scope.edittrue = true;
        $scope.IncorrectTag = false;
        $scope.showDuplicateTagPopup = false;
        $scope.campaignId = $routeParams.campaignId;


        var creativeList = {
            getCreativesList: function (campaignId, formats, query,pageSize,pageNo) {console.log("initialPg:",pageNo)
                console.log("later:",pageNo)
                workflowService
                    .getCreativesforCreativeList(campaignId, formats, query,pageSize,pageNo)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {

                            $scope.creativeListLoading = false;
                            $scope.creativesNotFound = false;
                            if($scope.creativeData['creatives'].length === 0) {
                                $scope.creativeData['creatives'] = result.data.data
                                $scope.pageNo ++;
                            } else {
                                _.each(result.data.data , function (obj) {
                                    $scope.creativeData['creatives'].push(obj);
                                });
                                $scope.pageNo ++;
                            }

                            $scope.creativeData.creatives_count += result.data.data.length;
                        } else {
                            creativeList.errorHandler();
                        }
                    }, creativeList.errorHandler);
            },
            getCreativeAds:function(creativeId,index){
                workflowService
                    .getCreativeAds(creativeId)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.creativeAds['creativeAdData'][index]=result.data.data;

                        } else {
                            creativeList.errorHandler();
                        }
                    });

                },


            errorHandler: function () {
                $scope.creativesNotFound = true;
                $scope.creativeListLoading = false;
                $scope.creativeData.creatives = [];
                $scope.creativeData.creatives_count = 0;
            }
        };
        $scope.selectAllCreative=function(){
            if($scope.creativeData.creatives[0].active){
                for(var i in $scope.creativeData.creatives){
                    $scope.creativeData.creatives[i].active=false;
                }
            }else{
                for(var i in $scope.creativeData.creatives){
                    $scope.creativeData.creatives[i].active=true;
                }
                $scope.selectedCreativeCheckbox("","allSelected")
            }
        }
        $scope.selectedCreativeCheckbox=function(creative,selectedType){
            if(selectedType!="allSelected"){
               var creativeAlreadySelected = checkedCreativeArr.indexOf(creative.id)
                if(creativeAlreadySelected===-1){
                    checkedCreativeArr.push(creative.id)
                }else{
                    checkedCreativeArr.splice(Number(creativeAlreadySelected),1);
                }
            }else{
                checkedCreativeArr=[];
                for(var i in $scope.creativeData.creatives){
                    checkedCreativeArr.push($scope.creativeData.creatives[i].id);
                }
            }

        }

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
            var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
            creativeList.getCreativesList(JSON.parse(localStorage.selectedClient).id,formats, qryStr);
        };

        function init() {
            var campaignData, clientId, clientName;
            var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
            if(selectedClientObj) {
                clientId = JSON.parse(localStorage.selectedClient).id;
                clientName = JSON.parse(localStorage.selectedClient).name;
                if (clientId) {
                    $scope.creativeListLoading = true;
                    $scope.creativesNotFound = false;
                    campaignData = {
                        'clientId': clientId,
                        'clientName': clientName
                    };
                    localStorage.setItem('campaignData', JSON.stringify(campaignData));
                    $scope.clientId =  clientId
                    $scope.creativeSearch = '';
                    creativeList.getCreativesList(clientId,'','',$scope.pageSize,$scope.pageNo);
                } else {
                    $scope.creativeListLoading = false;
                    $scope.creativesNotFound = true;
                }
            }

        };

        init();

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

        $scope.toggleCreativeAds=function(context,creativeId,index,event){
            var elem = $(event.target);
            if (context.showHideToggle) {
                elem.removeClass("icon-arrow-down-open") ;
                context.showHideToggle = !context.showHideToggle
                if($('.adsList').is(':hidden')) {
                    $( ".childRowHead" ).hide();
                }
            } else {
                elem.addClass("icon-arrow-down-open") ;
                context.showHideToggle = !context.showHideToggle
                creativeList.getCreativeAds(creativeId,index);
                $( ".childRowHead" ).show();
            }

        };
        $scope.utcToLocalTime = function (date, format) {
            return momentService.utcToLocalTime(date, format);
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
        
        $scope.headerToggle = function () {
            $(".vistoTable .thead .childRow").toggle();
            $(".vistoTable .thead .icon-arrow-down-thick").toggleClass('arrowLookDown');   
        }
        
        //Sticky Header
        $(window).scroll(function() {
            if ($(this).scrollTop() > 200){  
                $('.vistoTable .thead').addClass("sticky");
            } else{
                $('.vistoTable .thead').removeClass("sticky");
            }
        });
        $(function() {
            $(".tbody").scroll(function(){
                if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
                    var test_height = parseInt($(this).height())+1;
                    $(this).height(test_height);
                }

                if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    console.log("$(this).scrollTop():"+$(this).scrollTop()+"$(this).innerHeight():"+$(this).innerHeight()+"$(this)[0].scrollHeight:"+$(this)[0].scrollHeight)
                    var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
                    console.log("$scope.pageNo");
                    if(selectedClientObj) {
                        creativeList.getCreativesList(JSON.parse(localStorage.selectedClient).id,'','',$scope.pageSize, $scope.pageNo);
                    }
                }
            });
        });
        
    });
})();
