define(['angularAMD','common/services/constants_service','workflow/services/workflow_service','common/moment_utils', 'login/login_model', 'reporting/advertiser/advertiser_model', 'workflow/controllers/bulk_creative_controller', 'workflow/directives/filter_directive'], function (angularAMD) {
  angularAMD.controller('CreativeListController', function($scope, $rootScope, $routeParams, $route, $location, constants, domainReports, workflowService, momentService, loginModel, advertiserModel) {
        var checkedCreativeArr=[];
        $scope.creativeAds={};
        $scope.creativeAds['creativeAdData'] = {};
        $scope.showHideToggle=false;
        $scope.creativeData={};
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
        $scope.loadCreativeData=false;
        $scope.deletePopup=false;
        $scope.successfulRecords = [];
        $scope.isCreativeSearched =  false;
        $scope.clientId = loginModel.getSelectedClient().id;

        var creativeDataArr = $scope.creativeData['creatives'];


        //$scope.creativeData.creatives_count=1;
        //highlight the header menu - Dashborad, Campaigns, Reports
        domainReports.highlightHeaderMenu();

        $scope.isLeafNode = loginModel.getMasterClient().isLeafNode;

        var winHeight = $(window).height();
        $(".common-load-more").css({
            'top': winHeight / 2 - 150,
            'position':'absolute',
            'left':'50%',
            'margin':'0 0 0 -15px',
            'z-index':'999'
        });

        var isSearch = false;

        var creativeList = {
            getCreativesList: function (campaignId, formats, query,pageSize,pageNo) {
                var advertiserId = advertiserModel.getSelectedAdvertiser().id;
                workflowService.getCreativesforCreativeList(campaignId, formats, query,pageSize,pageNo,advertiserId, function (result) {
                    $scope.creativeListLoading = false;
                    $scope.creativesNotFound = false;
                    if($scope.creativeData['creatives'].length === 0 || query || pageNo == 1) {
                        $scope.creativeData['creatives'].length = 0;
                        $scope.creativeData['creatives'] = result.data.data;
                    } else {
                        if(result.data.data &&result.data.data.length>0){
                            var alreadyFound=_.filter($scope.creativeData['creatives'], function (obj) {
                                return obj.id === result.data.data[0].id;
                            });
                            if(alreadyFound.length<=0){
                                _.each(result.data.data , function (obj) {
                                    $scope.creativeData['creatives'].push(obj);
                                });
                            }
                        }
                        $scope.loadCreativeData=false;
                    }
                    if(pageNo>=1){
                        $scope.pageNo = Number(pageNo)+1;
                    }
                    $scope.creativeData.creatives_count += result.data.data.length;
                    if(result.data.data.length == 0 && pageNo == 1) {
                        $scope.creativesNotFound = true;
                        $scope.loadCreativeData=false;
                    }

                    creativeDataArr = $scope.creativeData['creatives'];
                    $scope.defineSize();

                }, function (error) {
                    console.log('error');
                });


                //workflowService
                //    .getCreativesforCreativeList(campaignId, formats, query,pageSize,pageNo)
                //    .then(function (result) {
                //        if (result.status === 'OK' || result.status === 'success') {
                //            $scope.creativeListLoading = false;
                //            $scope.creativesNotFound = false;
                //            if($scope.creativeData['creatives'].length === 0 || query) {
                //                $scope.creativeData['creatives'].length=0;
                //                $scope.creativeData['creatives'] = result.data.data;
                //            } else {
                //                if(result.data.data &&result.data.data.length>0){
                //                    var alreadyFound=_.filter($scope.creativeData['creatives'], function (obj) {
                //                        return obj.id === result.data.data[0].id;
                //                    });
                //                    if(alreadyFound<=0){
                //                        _.each(result.data.data , function (obj) {
                //                            $scope.creativeData['creatives'].push(obj);
                //                        });
                //                    }
                //                }
                //                $scope.loadCreativeData=false;
                //            }
                //            if(pageNo>=1){
                //                $scope.pageNo = Number(pageNo)+1;
                //            }
                //            $scope.creativeData.creatives_count += result.data.data.length;
                //        } else {
                //            creativeList.errorHandler();
                //        }
                //    }, creativeList.errorHandler);
                
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
            deleteCreatives:function(clientId, creativeIds){
                workflowService
                    .deleteCreatives(clientId,creativeIds)
                    .then(function(result){
                        if (result.status === 'OK' || result.status === 'success') {
                            $route.reload();
                        }else {
                            creativeList.errorHandler();
                        }
                    })

            },


            errorHandler: function () {
                $scope.creativesNotFound = true;
                $scope.creativeListLoading = false;
                $scope.creativeData.creatives = [];
                $scope.creativeData.creatives_count = 0;
            }
        };
        $scope.redirectAdEditPage=function(adData){
            if(adData.adGroupId){
                $location.url("/mediaplan/"+adData.campaignId+"/lineItem/"+ adData.lineItemId +"/adGroup/"+adData.adGroupId+"/ads/"+adData.adId+"/edit")
            }else{
                $location.url("/mediaplan/"+adData.campaignId+"/ads/"+adData.adId+"/edit")
            }
        }
        $scope.selectAllCreative=function(){
            if($('#select_all_checkbox').prop("checked")==false){
                for(var i in $scope.creativeData.creatives){
                    if( $scope.creativeData.creatives[i].pushedCount<=0){
                        $scope.creativeData.creatives[i].active=false;
                    }
                }
                checkedCreativeArr=[];
            }else{
                for(var i in $scope.creativeData.creatives){
                    if($scope.creativeData.creatives[i].pushedCount<=0) {
                        $scope.creativeData.creatives[i].active = true;
                    }
                }
                $scope.selectedCreativeCheckbox("","allSelected")
            }
        }
        $scope.selectedCreativeCheckbox=function(creative,selectedType){
            if(selectedType!="allSelected"){
                var creativeAlreadySelected = checkedCreativeArr.indexOf(creative.id);
                if(creativeAlreadySelected===-1){
                    checkedCreativeArr.push(creative.id)
                }else{
                    checkedCreativeArr.splice(Number(creativeAlreadySelected),1);
                }
            }else{
                checkedCreativeArr=[];
                for(var i in $scope.creativeData.creatives){
                    if($scope.creativeData.creatives[i].pushedCount<=0) {
                        checkedCreativeArr.push($scope.creativeData.creatives[i].id);
                    }
                }
            }

        }
        $scope.deleteCreatives=function(){
            $scope.deletePopup=!$scope.deletePopup;
            var postDataObj = {};
            postDataObj.idList=checkedCreativeArr;
            var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
            if(selectedClientObj){
                creativeList.deleteCreatives(JSON.parse(localStorage.selectedClient).id,postDataObj);
            }
        }
        $scope.cancelDelete=function(){
            if(checkedCreativeArr.length>0){
                $scope.deletePopup=!$scope.deletePopup;
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
                'rich media': 'icon-rich-media',
                'social': 'icon-social'
            };

            adFormat = adFormat || 'display';
            return adFormatMapper[adFormat.toLowerCase()];
        };

        $scope.formatDate = function (date) {
            return moment(date).format('DD MMM YYYY');
        };

        $scope.creativeSearchFunc = function (e) {
            if (!e || e.keyCode === 13) {

                isSearch = true;
                var searchVal = $scope.creativeSearch,
                    qryStr = '';

                if (searchVal.length > 0) {
                    qryStr += 'query=' + searchVal;
                }
                if (searchVal.length > 2) {
                    $scope.creativeListLoading = true;
                    var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
                    $scope.isCreativeSearched = true;
                    creativeList.getCreativesList($scope.clientId, undefined, qryStr);
                } else if (searchVal.length == 0) {
                    $scope.creativeListLoading = false;
                    $scope.isCreativeSearched = false;
                    $scope.creativeData['creatives'].length = 0;
                    var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
                    creativeList.getCreativesList($scope.clientId, '', '', 20, 1);
                }
            }
        };

      function init() {

          //Note: Not sure if this is required just retaining - Sapna
          var campaignData, clientId, clientName;
          var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
          $scope.pageSize=20;
          $scope.pageNo = 1;
          if(selectedClientObj) {
              clientId = JSON.parse(localStorage.selectedClient).id;
              clientName = JSON.parse(localStorage.selectedClient).name;
              if (clientId) {
                  campaignData = {
                      'clientId': clientId,
                      'clientName': clientName
                  };
                  localStorage.setItem('campaignData', JSON.stringify(campaignData));
              }
              $scope.creativeListLoading = true;
              $scope.creativesNotFound = false;
              $scope.creativeSearch = '';
              $scope.creativeData['creatives']=[];
              creativeList.getCreativesList(clientId,'','',$scope.pageSize,$scope.pageNo);
          }else {
              $scope.creativeListLoading = false;
              $scope.creativesNotFound = true;
          }
      };

      // broadcasted from filter directive once it fetches subaccounts
      $rootScope.$on('filterChanged',function(event, args){
               init();
      });

      if($scope.isLeafNode) {
          init();
      }



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
        $scope.creativeCreate=function(){
            workflowService.setCreativeEditMode("create");
            workflowService.setCreativeEditData(null);
            $location.url("/creative/add");
        }

        $scope.showBulkCreateSection = function() {
            //$scope.displayBulkCreateSection = !$scope.displayBulkCreateSection
            $(".file_upload_container").slideDown();
            $(".moreOptCreative").find('span').remove();
            $(".moreOptCreative").html("<span class='icon-more-options'></span>");
            //broadCast method for calling adServers for bulk Upload page.
            $scope.$broadcast('bulkUploadSelected');
        }

        $scope.showSuccessBulkUpload = function() {
            $("#formCreativeCreate, .successfullBulkUpView").toggle();
        }

        $scope.hideUploadRecordsMessage = function() {
            $scope.showUploadRecordsMessage = false;
            $scope.successfulRecords = [];
            creativeList.getCreativesList(JSON.parse(localStorage.selectedClient).id,'', '',20, 1);
        };

        $scope.downloadBulkCreativeErrorFile = function() {
              workflowService
                  .downloadCreativeErrors($scope.errorRecordsFileName)
                  .then(function(response) {
                  if (response.status === "success") {
                      saveAs(response.file, response.fileName);
                  } else {
                      $scope.downloadBusy = false;
                  }
              });
        }

        $scope.showRecordList = function() {
            $(".showRecordList, .recordList, .hideRecordList").toggle();
        }

        $scope.ShowHideTag = function (obj, pos) {
            workflowService.setCreativeEditMode("edit");
            workflowService.setCreativeEditData(obj);
            //$location.url("/creative/add");
            $scope.$parent.isAddCreativePopup = true;
            $location.url("/creative/"+obj.id+"/edit");


            //$scope.selectedCreativeData = obj;
            //$scope.selectedCreativePos = pos;
            //$scope.showViewTagPopup = true;
            //$scope.editorEnabled = false;
            //$scope.creativeTag = obj.tag;
        };

        $scope.toggleCreativeAds=function(context,creativeId,index,event){
            var elem = $(event.target);
            if (elem.hasClass("icon-arrow-down-open")) {
                elem.removeClass("icon-arrow-down-open");
                elem.closest(".oneDimensionRow").find(".secondDimensionList").hide() ;
                elem.closest(".oneDimensionRow").removeClass('visible') ;
                if( $(".secondDimensionList:visible").length == 0 ) {
                    $( ".childRowHead" ).hide();
                }
            } else {
                elem.addClass("icon-arrow-down-open") ;
                elem.closest(".oneDimensionRow").find(".secondDimensionList").show() ;
                elem.closest(".oneDimensionRow").addClass('visible') ;
                creativeList.getCreativeAds(creativeId,index);
                $( ".childRowHead" ).show();
            }
            //$scope.chkActiveParent();
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

        $('html').css('background', '#fff');
        $('.bodyWrap').css('width', '100%');

        //Search Clear
        $scope.searchHideInput = function (evt) {
            isSearch = false;
            var inputSearch = $(".searchInputForm input");
            $(evt.target).hide();
            inputSearch.val('');
            if($scope.isCreativeSearched) {
                $scope.creativeData['creatives'] = [];
                $scope.creativeListLoading = true;
                var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
                creativeList.getCreativesList(JSON.parse(localStorage.selectedClient).id, '', '', 20, 1);
            }
        };

        $scope.headerToggle = function () {
            $(".vistoTable .thead .childRow").toggle();
            $(".vistoTable .thead .icon-arrow-down-thick").toggleClass('arrowLookDown');
        }

        $scope.defineSize = function () {
            var listSizeCreativeDataArr = creativeDataArr.map(function(sizeCreativeDataArr){return sizeCreativeDataArr.size.size});
            for(var i = 0; i < listSizeCreativeDataArr.length; i++) {
                    var widthHeight = listSizeCreativeDataArr[i].split("X") ;
                    var maxWidth = 68;
                    var maxHeight = 68;   
                    var ratio = 0;  
                    var width = widthHeight[0];
                    var height =widthHeight[1];
                    $scope.creativeData['creatives'][i].width = widthHeight[0];    
                    $scope.creativeData['creatives'][i].height = widthHeight[1];  

                    // Check if the current width is larger than the max
                    if(width > maxWidth){
                        ratio = maxWidth / width;   
                        $scope.creativeData['creatives'][i].width = maxWidth ;
                        $scope.creativeData['creatives'][i].height = height * ratio ;
                        height = height * ratio;    
                        width = width * ratio;  
                    }

                    // Check if current height is larger than max
                    if(height > maxHeight){
                        ratio = maxHeight / height; 
                        $scope.creativeData['creatives'][i].height = maxHeight ;
                        $scope.creativeData['creatives'][i].width =  width * ratio ;
                        width = width * ratio;   
                        height = height * ratio;   
                    }
                }
        }

        //Sticky Header
        $(window).scroll(function() {
            if( $(".vistoTable").length > 0  ) {
                if ($(this).scrollTop() > $(".vistoTable").offset().top) {
                    $('.vistoTable .thead').addClass("sticky");
                    if( $(".thead .childRow:visible").length == 0 ) {
                        $('.vistoTable .tbody').css("margin-top","64px");
                    } else {
                        $('.vistoTable .tbody').css("margin-top","104px");
                    }
                    if( $(".fixedParent").length > 0 ) {
                        $('.vistoTable .tbody').css("margin-top","164px");
                    }
                } else{
                    $('.vistoTable .thead').removeClass("sticky");
                    $('.vistoTable .tbody').css("margin-top","0px");
                }
            }
        });

        //Flexible tbody
        var winBrowserHeight = $(window).height();
        //$('.vistoTable .tbody').css('maxHeight', winBrowserHeight - 341);

        //Pagination
        $(function() {
            $(window).scroll(function(){
                //if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                if($(window).scrollTop() + $(window).height() == $(document).height() && !isSearch) {

                    //console.log("$(this).scrollTop():"+$(this).scrollTop()+"$(this).innerHeight():"+$(this).innerHeight()+"$(this)[0].scrollHeight:"+$(this)[0].scrollHeight)
                    var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);

                    if(selectedClientObj && (window.location.href.indexOf("creative/list") > -1)) {
                        creativeList.getCreativesList($scope.clientId,'','',$scope.pageSize, $scope.pageNo);
                        $scope.loadCreativeData=true;
                    }
                }
            });
        });

    });
});
