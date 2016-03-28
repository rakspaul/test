define(['angularAMD','common/services/constants_service','workflow/services/workflow_service',
  'workflow/directives/ng_upload_hidden'],function (angularAMD) {
  angularAMD.controller('BulkCreativeController', function($scope, $rootScope, $routeParams, $location, 
    constants, workflowService) {
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
              workflowService
                  .getCreativeSizes()
                  .then(function (result) {
                      if (result.status === 'OK' || result.status === 'success') {
                          $scope.creativeSizeData.creativeSize = result.data.data;
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
      
      $scope.getAdFormatIconName = function(adFormat) {
          var adFormatMapper = {
              'display': 'image',
              'video': 'video',
              'rich media': 'rich-media',
              'social': 'social'
          };

          return adFormatMapper[adFormat.toLowerCase()];
      };

      var resetTemplate = function() {
          $scope.onTemplateSelected('', '');
          $scope.adData.creativeTemplate = "";
          $scope.CreativeTemplate.name = 'Select Template';
      },

      resetAdserver = function() {
          $scope.selectedAdServer = {};
      };
      
      /*function on AdServer Selected*/
      $scope.adServerSelected = function(adServer) {
          $scope.selectedAdServer = adServer;// used in adFormatSelection function to get all templates.

          if($scope.creativeFormat) {
              resetTemplate();
              getTemplates($scope.selectedAdServer, $scope.creativeFormat);
          }
      }
      
      /*function on adFormat selected*/
      $scope.adFormatSelected = function(adFormatName) {
          console.log('adFormatSelected');
          var index = _.findIndex($scope.creativeSizeData.adFormats, function(obj) {
              return (obj.name).replace(/\s+/g, '').toUpperCase() === (adFormatName).replace(/\s+/g, '').toUpperCase();
          });
          for(var i in $scope.creativeSizeData.adFormats) {
              $scope.creativeSizeData.adFormats[i].active = false;
          }
          if(index >= 0) {
              $scope.creativeSizeData.adFormats[index].active = true;
          }
          $scope.creativeFormat = angular.uppercase(adFormatName);

          /*CreativeLibrary page, get templates*/
          if($scope.selectedAdServer.name) {
              resetTemplate();
              getTemplates($scope.selectedAdServer, adFormatName);
          }
      }

      /*Generate the Template*/
      $scope.onTemplateSelected = function(templateJson){
          $scope.CreativeTemplate = templateJson;
          $scope.TrackingIntegrationsSelected = templateJson.isTracking;
          $scope.adData.creativeTemplate = templateJson.id;

          if ($scope.selectedAdServer.name && $scope.creativeFormat && $scope.adData.creativeTemplate) {
            // show Download template link

          }
      };

      $scope.downloadCreativeTemplate = function() {
          if ($scope.selectedAdServer.id && $scope.creativeFormat && $scope.adData.creativeTemplate) {
              $scope.downloadBusy = true;
              workflowService
                  .downloadCreativeTemplate(2, $scope.selectedAdServer.id, $scope.adData.creativeTemplate)
                  .then(function(response) {
                  if (response.status === "success") {
                      $scope.downloadBusy = false;
                      saveAs(response.file, response.fileName);
                  } else {
                      $scope.downloadBusy = false;
                  }
              }, function () {
                  $scope.downloadBusy = false;
              }, function () {
                  $scope.downloadBusy = false;
              });
          } else {

          }

      }

      $scope.showDownloadCreativeTemplateLink = function() {
          return $scope.selectedAdServer.name && $scope.creativeFormat && $scope.adData.creativeTemplate;
      }

      $scope.resetAlertMessage = function () {
          $rootScope.setErrAlertMessage('', 0);
      };

      /*Get all adserver in Creative Library Page*/
      var getAdServers = function() {
          console.log('geting ad servers');
          workflowService
              .getVendorsAdServer()
              .then(function(result) {
                  if (result.status === 'OK' || result.status === 'success') {
                      $scope.creativeAdServers = result.data.data;
                      //creatives.fetchAdFormats();
                      $scope.creativeSizeData.adFormats = [
                          {id: 1, name: 'Display',    active: false ,disabled:false},
                          {id: 2, name: 'Video',      active: false, disabled:false},
                          {id: 3, name: 'Rich Media', active: false, disabled:false},
                          {id: 4, name: 'Social',     active: false, disabled:false}
                      ];
                  } else {
                      console.log('failed to get template Json');
                      creatives.errorHandler(result);
                  }
              });
      },

      /*get Templates*/
      getTemplates = function(vendor, format, isTracking) {
          workflowService
              .getTemplates(vendor, format, isTracking)
              .then(function(result) {
                  if (result.status === 'OK' || result.status === 'success') {
                      $scope.creativeTemplates = result.data.data;
                  } else {
                      console.log('failed to get Channels');
                      creatives.errorHandler(result);
                  }
              }, creatives.errorHandler);
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

      $scope.toggleBtn = function (event) {
          var target = $(event.target),
              parentElem =  target.parents('.miniToggle');

          parentElem
              .find('label')
              .removeClass('active');
          target.parent().addClass('active');
          target.attr('checked', 'checked');
      };

      getAdServers();

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
