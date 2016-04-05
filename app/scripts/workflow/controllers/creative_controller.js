define(['angularAMD','common/services/constants_service','workflow/services/workflow_service','workflow/services/creative_custom_module','workflow/directives/creative_drop_down','workflow/directives/ng_upload_hidden','login/login_model', 'common/popup_msg'],function (angularAMD) {
  angularAMD.controller('CreativeController', function($scope, $rootScope, $routeParams, $location, constants, workflowService,creativeCustomModule,loginModel) {
     // $scope.creativeFormat="DISPLAY";
      $scope.creative={};
      $scope.adData = {};
      $scope.textConstants = constants;
      $scope.mode = workflowService.getMode();
      $scope.workflowData = {};
      $scope.newData={};
      $scope.adData.screenTypes = [];
      $scope.selectedCreative = {};
      $scope.creativeSizeData = {};
      $scope.selectedAdServer={};
      $scope.addedSuccessfully = false;
      $scope.IncorrectTag = false;
      $scope.disableCancelSave = false;
      $scope.campaignId = $routeParams.campaignId;
      var validTag=false;
      if($routeParams.creativeId){
          $scope.isAddCreativePopup = true;
          $scope.creativeMode="edit";
      }else{
          $scope.creativeMode="create";
      }

      $scope.showSubAccount = false;

      if(!loginModel.getMasterClient().isLeafNode) {
          $scope.showSubAccount = true;
      }


      var processEditCreative=function(){
          var creativeId=$routeParams.creativeId;
          workflowService
              .getCreativeData(creativeId,$scope.creative.clientId)
              .then(function (result) {
                  if (result.status === "OK" || result.status === "success") {
                      $scope.creativeEditData=result.data.data;
          //$scope.creativeEditData=workflowService.getCreativeEditData();
          if($scope.creativeEditData){
              $scope.name=$scope.creativeEditData.name;
              $scope.advertiserName=$scope.creativeEditData.advertiser.name;
              $scope.subAccountName = $scope.creativeEditData.client.name;
              $scope.creative.advertiserId=$scope.creativeEditData.advertiserId;
              $scope.brandName=$scope.creativeEditData.brand?$scope.creativeEditData.brand.name:'Select Brand';
              $scope.creative.brandId=$scope.creativeEditData.brand?$scope.creativeEditData.brandId:'';
              $scope.selectedAdServer=$scope.creativeEditData.adServer;
              $scope.selectedAdServer.id=$scope.creativeEditData.adServer?$scope.creativeEditData.adServer.id:'';
              $scope.creativeFormat=$scope.creativeEditData.creativeFormat;
              $scope.pushedCount=$scope.creativeEditData.pushedCount;
              $scope.associatedAdCount=$scope.creativeEditData.noOfAds;
              //make cal to set the format type here //inturn makes call to get possible templates
              $scope.adFormatSelection($scope.creativeFormat);
              if(!($scope.pushedCount>0 || $scope.associatedAdCount>0)){
                resetFormats($scope.selectedAdServer,$scope.creativeAdServers)
              }
              //make call to generate Template
              $scope.creativeEditData.vendorCreativeTemplate ? $scope.onTemplateSelected($scope.creativeEditData.vendorCreativeTemplate,$scope.creativeEditData.creativeCustomInputs):'';
              $scope.tag=$scope.creativeEditData.tag;
              $scope.adData.creativeSize=$scope.creativeEditData.size;

              $scope.creative.clientId = $scope.creativeEditData.client.id;
              creatives.fetchAdvertisers($scope.creativeEditData.client.id);
              creatives.fetchBrands($scope.creativeEditData.client.id,$scope.creativeEditData.advertiser.id);
          }

                  }else {
                      console.log("No data Available to edit")
                  }
              })
      }

      $scope.data = {
          availableOptions: [
              {id: '1', name: 'Option A'},
              {id: '2', name: 'Option B'},
              {id: '3', name: 'Option C'}
          ],
      };
      var postCrDataObj={};

      var creatives = {
          /*Function to get creatives sizes*/
          getCreativeSizes: function () {
              var responseData;
              workflowService
                  .getCreativeSizes()
                  .then(function (result) {
                      if (result.status === 'OK' || result.status === 'success') {
                          responseData = result.data.data;
                          $scope.creativeSizeData.creativeSize = responseData;
                      } else {
                          console.log('failed to get creatives sizes');
                          creatives.errorHandler(result);
                      }
                  }, creatives.errorHandler);
          },

          fetchAdFormats: function () {
              $scope.creativeSizeData.adFormats = [
                  {id: 1, name: 'Display',    active: true , disabled:false},
                  {id: 2, name: 'Video',      active: false, disabled:true},
                  {id: 3, name: 'Rich Media', active: false, disabled:true},
                  {id: 4, name: 'Social',     active: false, disabled:true}
              ];
              //default value
              $scope.adData.adFormat = 'Display';
          },

          errorHandler: function (errData) {
              console.log(errData);
          },

          fetchAdvertisers: function (clientId) {
              workflowService.getAdvertisers('write',clientId).then(function (result) {
                  if (result.status === "OK" || result.status === "success") {
                      var responseData = result.data.data;
                      $scope.advertisers = _.sortBy(responseData, 'name');
                  }
                  else {
                      creatives.errorHandler(result);
                  }
              },  creatives.errorHandler);
          },
          fetchBrands: function (clientId,advertiserId) {
              workflowService.getBrands(clientId,advertiserId, 'write').then(function (result) {
                  if (result.status === "OK" || result.status === "success") {
                      var responseData = result.data.data;
                      $scope.brands = _.sortBy(responseData, 'name');
                  }
                  else {
                      creatives.errorHandler(result);
                  }
              }, creatives.errorHandler);
          },
          fetchSubAccounts: function(){
              workflowService.getSubAccounts().then(function(result) {
                  if (result.status === "OK" || result.status === "success") {
                      $scope.subAccounts = result.data.data;
                  }
                  else {
                      creatives.errorHandler(result);
                  }
              }, creatives.errorHandler);
          }
      };

      if ($location.path() === '/creative/add') {
          $scope.isAddCreativePopup = true;
          $('html').css('background', '#fff');
          $('.main_navigation')
              .find('.active')
              .removeClass('active')
              .end()
              .find('#creative_nav_link')
              .addClass('active');
      }

      /*AD Format Type*/
      $scope.formatLabel = 'Display';
      if ($scope.campaignId) {
          $scope.adPage = true;
      } else {
          $scope.adPage = false;
      }
      $scope.getAdFormatIconName = function (adFormat) {
          var adFormatMapper = {
              'display': 'image',
              'video': 'video',
              'rich media': 'rich-media',
              'social': 'social'
          };

          return adFormatMapper[adFormat.toLowerCase()];
      };
      $scope.selectHandler = function (type, data, event) {
          switch (type) {
              case 'subAccount':
                  $scope.advertisers = {};
                   $scope.subAccountName = data.name;
                 //  $scope.creative.subAccountId = data.id;
                   $scope.creative.clientId = data.id;
               //   $scope.creative.advertiserId = '';
                  creatives.fetchAdvertisers(data.id);
                 // $scope.advertiserName = 'Select Advertiser';
                  break;
              case 'advertiser' :
                  $scope.brands = {};
                  $scope.advertiserName=data.name;
                  $scope.creative.brandId = '';
                  $scope.creative.advertiserId = data.id;
                  creatives.fetchBrands( $scope.creative.clientId,data.id);
                  $scope.brandName = 'Select Brand';
                  break;
              case 'brand' :
                  $scope.brandName = data.name;
                  $scope.creative.brandId = data.id;
                  break;
          }
      }
      /*function on adFormat selected*/
      $scope.adFormatSelection=function(adFormatName){
          var index=_.findIndex($scope.creativeSizeData.adFormats, function(obj){
              return (obj.name).replace(/\s+/g, '').toUpperCase()===(adFormatName).replace(/\s+/g, '').toUpperCase();
              //return angular.uppercase(obj.name)===angular.uppercase(adFormatName)
          })
          for(var i in $scope.creativeSizeData.adFormats){
              $scope.creativeSizeData.adFormats[i].active=false;
              if((!$scope.adPage) && ($scope.creativeMode=="edit") && ($scope.pushedCount>0 || $scope.associatedAdCount>0))
                  $scope.creativeSizeData.adFormats[i].disabled=true;
          }
          if(index>=0){
              $scope.creativeSizeData.adFormats[index].active=true;
          }
          $scope.creativeFormat=angular.uppercase(adFormatName);

          /*CreativeLibrary page, get templates*/
          if(!$scope.adPage && $scope.selectedAdServer){
              resetTemplate();
              //In edit mode, do not let to change templateType from full-tracking or vice versa if ads count >0.
              if($scope.creativeMode=="edit" && $scope.associatedAdCount>0){
                      $scope.getTemplates($scope.selectedAdServer,adFormatName,$scope.creativeEditData.isTracking);
              }else{
                  $scope.getTemplates($scope.selectedAdServer,adFormatName);
              }
          }
      }
      var resetTemplate=function(){
          $scope.onTemplateSelected('','');
          $scope.adData.creativeTemplate="";
          $scope.CreativeTemplate.name='Select Template';
      }
      var resetAdserver=function(){
          $scope.selectedAdServer={};
      }
      var resetFormats=function(adserver,allAdserverData){
          if(allAdserverData && allAdserverData.length>0){
              var index=_.findIndex(allAdserverData, function(obj){
                  return Number(obj.id)===Number(adserver.id)
              })
              var adserver=allAdserverData[index];
          }

          for(var i=0;i<adserver.formats.length;i++){

            var index=_.findIndex($scope.creativeSizeData.adFormats, function(obj){
                return (obj.name).replace(/\s+/g, '').toUpperCase()===angular.uppercase(adserver.formats[i])
            })
            if(index>=0) {
                $scope.creativeSizeData.adFormats[index].disabled = false;
            }else{
                $scope.creativeSizeData.adFormats[index].disabled = true;
            }
        }
      }
      /*function on AdServer Selected*/
      $scope.adServerSelected=function(adServer){
          $scope.selectedAdServer=adServer;// used in adFormatSelection function to get all templates.

          if(!$scope.adPage){
              resetFormats(adServer);
          }
          if(!$scope.adPage && $scope.creativeFormat){
              resetTemplate();
              $scope.getTemplates($scope.selectedAdServer,$scope.creativeFormat);
          }

          /*function to get the possible templates in adCreate Page)*/
          if($scope.adPage){
              $scope.getTemplates(adServer,$scope.creativeFormat,$scope.$parent.TrackingIntegrationsSelected);
          }
      }
      /*get Templates*/
      $scope.getTemplates=function(vendor,format,isTracking){
          var responseData;
          workflowService
              .getTemplates(vendor,format,isTracking)
              .then(function (result) {
                  if (result.status === 'OK' || result.status === 'success') {
                      responseData = result.data.data;
                      $scope.creativeTemplates = responseData;
                  } else {
                      console.log('failed to get Channels');
                      creatives.errorHandler(result);
                  }
              }, creatives.errorHandler);
      }
      $scope.$on('EditAdResponseData',function(){
          creatives.fetchAdFormats();
      })

      /*This function is triggered when adFormat is changes in SelectType page of Ad create*/
      $scope.$on('adFormatChanged', function (event, adType) {
          var index=_.findIndex($scope.creativeSizeData.adFormats, function(obj){
              return angular.uppercase(obj.name)===angular.uppercase(adType)
          })
          for(var i in $scope.creativeSizeData.adFormats){
              $scope.creativeSizeData.adFormats[i].active=false;
              $scope.creativeSizeData.adFormats[i].disabled=true;
          }
          if(index>=0) {
              $scope.creativeSizeData.adFormats[index].active = true;
              $scope.creativeSizeData.adFormats[index].disabled = false;
          }
          $scope.creativeFormat=angular.uppercase(adType);

          /*function to get the possible ad servers for the adFormat selected(Create Ad flow, format is prefilled in this case)*/
          var responseData;
          workflowService
              .getAdServers($scope.creativeFormat)
              .then(function (result) {
                  if (result.status === 'OK' || result.status === 'success') {
                      responseData = result.data.data;
                      $scope.creativeAdServers = responseData;
                  } else {
                      console.log('failed to get Adservers');
                      creatives.errorHandler(result);
                  }
              }, creatives.errorHandler);

      });

      /*Generate the Template*/
      $scope.onTemplateSelected=function(templateJson,customFieldsDataEditMode){
          $scope.CreativeTemplate=templateJson;
          $scope.TrackingIntegrationsSelected=templateJson.isTracking;
          $scope.adData.creativeTemplate=templateJson.id;
          var creativeTemplateWrap = $('.creativeTemplate');
          creativeCustomModule.init(templateJson,creativeTemplateWrap,$scope,customFieldsDataEditMode);
      }

      $scope.creativePopularSizes = [
          {id: 16, size: '300x250'},
          {id: 7,  size: '160x600'},
          {id: 34, size: '728x90'},
          {id: 18, size: '300x600'},
          {id: 20, size: '320x50'}
      ];

      $scope.resetAlertMessage = function () {
          $rootScope.setErrAlertMessage('', 0);
      };
      /*
       $scope.prarentHandler = function (clientId, clientName, advertiserId, advertiserName) {
       var campaignData = {
       'advertiserId': advertiserId,
       'advertiserName': advertiserName,
       'clientId': clientId,
       'clientName': clientName
       };
       /*in adPage, hardcode advertiser and call select Handler for Brand
      if($scope.adPage){
          var data={
              'id':advertiserId,
              'name':advertiserName
          }
          $scope.selectHandler('advertiser',data)
      }

      $scope.campaignId = clientId;
      $scope.advertiserId = advertiserId;
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      creatives.getCreativeSizes(clientId, advertiserId);
      // Ad create Mode.  [PS:In edit mode, on response data in processeditmode, broadcast is made to fetch]
      if ($scope.mode !== 'edit' && $scope.adPage) {
          creatives.fetchAdFormats();
          $scope.$broadcast('adFormatChanged', 'DISPLAY');
      }
      /*In creative List Page to create new creative
      if(!$scope.adPage){
          getAdServers();
          creatives.fetchAdvertisers();
      }
  };
       */

      $scope.prarentHandler = function () {
          if($scope.adPage){
              var client = loginModel.getSelectedClient();
              var data={
                  'id':client.id,
                  'name':client.name
              }

              var campaignData = localStorage.getItem('campaignData');
              campaignData = campaignData && JSON.parse(campaignData);

              $scope.advertiserName = campaignData.advertiserName;
              $scope.creative.advertiserId = campaignData.advertiserId;
              $scope.selectHandler('subAccount',data)
              creatives.fetchBrands(client.id,campaignData.advertiserId);

          }

          creatives.getCreativeSizes();
          // Ad create Mode.  [PS:In edit mode, on response data in processeditmode, broadcast is made to fetch]
          if ($scope.mode !== 'edit' && $scope.adPage) {
              creatives.fetchAdFormats();
              $scope.$broadcast('adFormatChanged', 'DISPLAY');
          }
          /*In creative List Page to create new creative*/
          if(!$scope.adPage){
              getAdServersInLibraryPage();
              if($scope.showSubAccount) {
                  creatives.fetchSubAccounts();
              } else {
                  creatives.fetchAdvertisers();
              }

          }
      };

      /*Get all adserver in Creative Library Page*/
      var getAdServersInLibraryPage=function(){
          var responseData='';
          workflowService
              .getVendorsAdServer()
              .then(function(result){
                  if (result.status === 'OK' || result.status === 'success') {
                      responseData = result.data.data;
                      $scope.creativeAdServers = responseData;
                      //creatives.fetchAdFormats();
                      $scope.creativeSizeData.adFormats = [
                          {id: 1, name: 'Display',    active: false ,disabled:true},
                          {id: 2, name: 'Video',      active: false, disabled:true},
                          {id: 3, name: 'Rich Media', active: false, disabled:true},
                          {id: 4, name: 'Social',     active: false, disabled:true}
                      ];
                      if($scope.creativeMode==="edit"){
                          processEditCreative();
                      }

                  }else{
                      console.log('failed to get template Json');
                      creatives.errorHandler(result);
                  }
              })
      }
      $scope.prarentHandler();

      //$(function () {
          $scope.submitForm=function(form){
              //$('#saveCreative').on('click', function (form) {
              var formElem,
                  formData,
                  PatternOutside,
                  PatternInside,
                  tagLower;
              var indexArr=[];

              $scope.$broadcast('show-errors-check-validity');
              if (form.$valid) {
              //if ($scope.formCreativeCreate.$valid) {
                  //formElem = $('#formCreativeCreate');
                  var formDataObj = $("#formCreativeCreate").serializeArray();
                  //console.log("formDataObj",formDataObj)
                  formData = _.object(_.pluck(formDataObj, 'name'), _.pluck(formDataObj, 'value'));
                  postCrDataObj = {};
                  postCrDataObj.name = formData.name;
                  postCrDataObj.clientId = $scope.creative.clientId;//$scope.campaignId;
                  postCrDataObj.advertiserId = formData.advertiserId;
                  postCrDataObj.brandId = formData.brandId;
                  postCrDataObj.isTracking = $scope.TrackingIntegrationsSelected;
                  postCrDataObj.adServerId = formData.creativeAdServer;
                  postCrDataObj.creativeFormat=$scope.creativeFormat.replace(/\s+/g, '').toUpperCase();
                  postCrDataObj.sslEnable = 'true';
                  postCrDataObj.tag = '%%TRACKER%%';
                  postCrDataObj.sizeId = formData.creativeSize;
                  postCrDataObj.creativeType = formData.creativeType;
                  postCrDataObj.vendorCreativeTemplateId = formData.creativeTemplate;
                  if ($scope.TrackingIntegrationsSelected) {
                    postCrDataObj.tag = '%%TRACKER%%';
                      validTag=true;
                  }else{
                      validateScriptTag(formData.tag);
                  }
                  if (validTag) {
                      var validCreativeUrl = true;
                      $('#invalidUrl').remove();
                      for(var i=0;i< formDataObj.length;i++){
                          if (["name","subAccountId","advertiserId","brandId","adFormat","creativeFormat","sslEnable","creativeAdServer","creativeTemplate","tag","creativeSize","creativeType"].indexOf(formDataObj[i].name) >= 0) {
                              indexArr.push(i);// contains all indexes of static Markup which will have to be removed before adding to the list.
                          }
                      }
                      /*Arr of objects of template HTML, which needs to be sent in the List in post Json*/
                      var templateArr = $.grep(formDataObj, function(n, i) {
                          return $.inArray(i, indexArr) ==-1;
                      });

                          $scope.IncorrectTag = false;
                          postCrDataObj.creativeCustomInputs = _.map(templateArr, function (data) {
                              var d = data.name.split('$$');

                              if(d[0] === 'clickthrough_url.clickthrough_url' && data.value !== ''){
                                  // validate if the url is valid
                                  validCreativeUrl = workflowService.validateUrl(data.value);
                                  if(validCreativeUrl === false){
                                      $("[name='"+data.name+"']").parent().append("<label id='invalidUrl' class='col-sm-12 control-label errorLabel' style='display:block'>Please enter a valid url.</label>")
                                  }
                              }
                              return {
                                  'creativeCustomInputId': Number(d[1]),
                                  'value': data.value
                              };
                          });

                          if(validCreativeUrl) {
                              $scope.creativeSave(postCrDataObj);
                          }
              }
              }
          };
     // });
      var validateScriptTag= function (scriptTag) {
          var pattern,
              tagLower;
          pattern=new RegExp(/.*(https:).*/);
          tagLower = scriptTag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');
          if (tagLower.match(pattern)) {
              //if ((tagLower.indexOf('%%tracker%%') > -1)) {
                  postCrDataObj.tag=scriptTag;
                  validTag=true;
              //} else {
              //    validTag=false;
              //    $scope.IncorrectTag = true;
              //    $scope.IncorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
              //}
          }else {
              validTag=false;
              $scope.IncorrectTag = true;
              $scope.IncorrectTagMessage = 'You have entered an invalid Javascript tag.Please review carefully and try again';
              console.log('Incorrect tag');
          }

          //var PatternOutside,
          //    PatternInside,
          //    tagLower;
          //
          //PatternOutside = new RegExp(/<script.*>.*(https:).*<\/script>.*/);
          //PatternInside = new RegExp(/<script.*(https:).*>.*<\/script>.*/);
          //tagLower = scriptTag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');
          //if (tagLower.match(PatternOutside)) {
          //    if ((tagLower.indexOf('%%tracker%%') > -1)) {
          //        postCrDataObj.tag=scriptTag;
          //        validTag=true;
          //        //$scope.creativeSave(templateArr);
          //    } else {
          //        validTag=false;
          //        $scope.IncorrectTag = true;
          //        $scope.IncorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
          //    }
          //} else if (tagLower.match(PatternInside)) {
          //    if ((tagLower.indexOf('%%tracker%%') > -1)) {
          //        postCrDataObj.tag=scriptTag;
          //        validTag=true;
          //        //$scope.creativeSave(templateArr);
          //    } else {
          //        validTag=false;
          //        $scope.IncorrectTag = true;
          //        $scope.IncorrectTagMessage = $scope.textConstants.WF_INVALID_CREATIVE_TAG_TRACKER;
          //    }
          //} else {
          //    validTag=false;
          //    $scope.IncorrectTag = true;
          //    $scope.IncorrectTagMessage = 'You have entered an invalid Javascript tag.Please review carefully and try again';
          //    console.log('Incorrect tag');
          //}
      }

      $scope.creativeSave = function (postCrDataObj) {
          $scope.IncorrectTag = false;
          $scope.savingCreative=true;
          $scope.CrDataObj = postCrDataObj;
          if($scope.creativeMode!=="edit" || $scope.adPage){
              workflowService
                  .saveCreatives($scope.creative.clientId, postCrDataObj)
                  .then(function (result) {
                      if (result.status === 'OK' || result.status === 'success') {
                          $scope.addedSuccessfully = true;
                          $scope.Message = 'Creative Added Successfully';
                          $scope.savingCreative = false;
                          if(result.data.data.creativeState==='READY'){
                              workflowService.setNewCreative(result.data.data);
                          }
                          // redirect user after successful saving
                          $scope.cancelBtn();
                          $rootScope.setErrAlertMessage($scope.textConstants.CREATIVE_SAVE_SUCCESS,0);
                          localStorage.setItem( 'topAlertMessage', $scope.textConstants.CREATIVE_SAVE_SUCCESS);
                      } else if (result.status === 'error'){
                          $scope.savingCreative = false;
                          $scope.Message = 'Unable to create Creative';
                          $scope.partialSaveAlertMessage = true;
                          $rootScope.setErrAlertMessage($scope.Message,1);
                      } else if (result.data.data.message ==='Creative with this tag already exists. If you still want to save, use force save') {
                          $('.popup-holder').css('display', 'block');
                          $scope.savingCreative = false;
                          $scope.disableCancelSave = true;
                      } else {
                          $scope.savingCreative = false;
                          $scope.Message = 'Unable to create Creative';
                          $scope.partialSaveAlertMessage = true;
                          $rootScope.setErrAlertMessage($scope.Message,1);
                          console.log(result);
                      }
                  });

              //localStorage.setItem( 'topAlertMessage', $scope.textConstants.CREATIVE_SAVE_SUCCESS);
          }else{
              postCrDataObj.updatedAt=$scope.creativeEditData.updatedAt;
              workflowService
                  .updateCreative($scope.creative.clientId, $scope.creativeEditData.advertiserId,$scope.creativeEditData.id,postCrDataObj)
                  .then(function(result){
                      if (result.status === 'OK' || result.status === 'success') {
                          $scope.addedSuccessfully = true;
                          $scope.Message = 'Creative Added Successfully';
                         // workflowService.setNewCreative(result.data.data);
                          // redirect user after successful saving
                          $scope.cancelBtn();
                          $rootScope.setErrAlertMessage($scope.textConstants.CREATIVE_SAVE_SUCCESS,0);
                          localStorage.setItem( 'topAlertMessage', $scope.textConstants.CREATIVE_SAVE_SUCCESS);
                      }else{
                          $scope.addedSuccessfully = true;
                          $scope.Message = 'Unable to create Creatives';
                          console.log(result);
                      }
                  })
          }
      };
      $scope.$on('creativeAdserverTemplateReset', function () {
          resetAdserver();
          resetTemplate();
      });

      $scope.$on('closeAddCreativePage', function () {
          $('#formCreativeCreate')[0].reset();
          $scope.IncorrectTag = false;
          $scope.addedSuccessfully = false;
          $('#formatType').html('Select Format<span class="icon-arrow-down"></span>');
          $('#creativeSize').html('Select Size<span class="icon-arrow-down"></span>');
          $scope.$broadcast('show-errors-reset');
          if ($location.path() === '/creative/add'|| ($scope.creativeMode==="edit" && !$scope.adPage)) {
              $location.url('/creative/list');
          } else {
              $('.newCreativeSlide .popCreativeLib')
                  .delay(300)
                  .animate({
                      left: '100%',
                      marginLeft: '0px'
                  }, 'slow', function () {
                      $(this).hide();
                  });
              $('#creative')
                  .delay(300)
                  .animate({
                      height: 'auto'
                  }, 'slow');
          }
      });

      $scope.cancelBtn = function () {
          var winHeight = $(window).height() - 126;
          $scope.$broadcast('closeAddCreativePage');
          $('.adStepOne .tab-pane').css('min-height', winHeight-30+'px');
      };

      $scope.switchPlatform = function () {
          $rootScope.$broadcast('switchPlatformFunc');
      };

      $scope.saveDuplicate = function () {
          workflowService
              .forceSaveCreatives($scope.campaignId, $scope.advertiserId, $scope.CrDataObj)
              .then(function (result) {
                  if (result.status === 'OK' || result.status === 'success') {
                      $('.popup-holder').css('display', 'none');
                      $scope.disableCancelSave = false;
                      workflowService.setNewCreative(result.data.data);
                      $scope.cancelBtn();
                  } else {
                      $scope.addedSuccessfully = true;
                      $scope.Message = 'Unable to create Creatives';
                  }
              });
      };

      $scope.dropBoxItemSelected =  function (item, type, event) {
          $('#listBoxSize')
              .parents('.dropdown')
              .removeClass('open');
          $('[name="creativeFormat"]')
              .prev('.dropdown')
              .removeClass('open');
          $scope.adData[type] = item;
          $scope.newData[type]='';

      };

      $scope.cancelDuplicate = function () {
          $('.popup-holder').css('display', 'none');
          $scope.addedSuccessfully = true;
          $scope.Message = 'Unable to create Creatives';
          // enable cancel, save button on cancel duplicate
          $scope.disableCancelSave = false;
          $scope.savingCreative=false;

      };

      $scope.toggleBtn = function (event) {
          var target = $(event.target),
              parentElem =  target.parents('.miniToggle');

          parentElem
              .find('label')
              .removeClass('active');
          target.parent().addClass('active');
          target.attr('checked', 'checked');
      };

      $('.dropdown-menu li a').click(function () {
          var selText = $(this).text();

          $(this)
              .parents('.btn-group')
              .find('.dropdown-toggle')
              .html('<span>' + selText + '</span> <span class="caret"></span>');
      });

      // DDL Search Input Prevent Default
      $('.dropdown-menu')
          .find('input')
          .click(function (e) {
              e.stopPropagation();
          });

      // DDL with Search
      $('.dropdown-menu-search li a').click(function () {
          var selText = $(this).text();

          $(this)
              .parents('.btn-group')
              .find('.dropdown-toggle-search')
              .attr('value=' + selText);
      });

    });
});
