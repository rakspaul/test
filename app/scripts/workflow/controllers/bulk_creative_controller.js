define(['angularAMD','common/services/constants_service','workflow/services/workflow_service',
  'workflow/directives/ng_upload_hidden'],function (angularAMD) {
  angularAMD.controller('BulkCreativeController', function($scope, $rootScope, $routeParams, $location, 
    constants, workflowService, Upload) {
     // $scope.creativeFormat="DISPLAY";
      $scope.creative={};
      $scope.adData = {};
      $scope.textConstants = constants;
      $scope.mode = workflowService.getMode();
      $scope.creativeSizeData = {};
      $scope.selectedAdServer={};
      $scope.selectedCreative = {};
      $scope.file;

      $scope.showUploadRecordsMessage = false;


      var creatives = {
          errorHandler: function (errData) {
              console.log(errData);
          }
      },

      resetTemplate = function() {
          $scope.templateSelected('', '');
          $scope.adData.creativeTemplate = "";
          $scope.CreativeTemplate.name = 'Select Template';
      },

      resetFormat = function() {
          for(var i in $scope.creativeSizeData.adFormats) {
              $scope.creativeSizeData.adFormats[i].active = false;
          }
          $scope.creativeFormat = undefined;
      },

      resetAdserver = function() {
          $scope.selectedAdServer = {};
      };

      $scope.getAdFormatIconName = function(adFormat) {
          var adFormatMapper = {
              'display': 'image',
              'video': 'video',
              'rich media': 'rich-media',
              'social': 'social'
          };

          return adFormatMapper[adFormat.toLowerCase()];
      };

      /*function on AdServer Selected*/
      $scope.adServerSelected = function(adServer) {
          if ($scope.selectedAdServer && $scope.selectedAdServer.id === adServer.id) {
              return;
          }
          $scope.selectedAdServer = adServer;// used in adFormatSelection function to get all templates.

          if($scope.creativeFormat) {
              resetTemplate();
              getTemplates($scope.selectedAdServer, $scope.creativeFormat);
          }
      };
      
      /*function on adFormat selected*/
      $scope.adFormatSelected = function(adFormatName) {
          var index = _.findIndex($scope.creativeSizeData.adFormats, function(obj) {
              return (obj.name).replace(/\s+/g, '').toUpperCase() === (adFormatName).replace(/\s+/g, '').toUpperCase();
          });
          for(var i in $scope.creativeSizeData.adFormats) {
              $scope.creativeSizeData.adFormats[i].active = false;
          }
          if(index >= 0) {
              $scope.creativeSizeData.adFormats[index].active = true;
          }
          if ($scope.creativeFormat === angular.uppercase(adFormatName)) {
              // user selected on the same ad format
              return;
          }
          $scope.creativeFormat = angular.uppercase(adFormatName);

          /*CreativeLibrary page, get templates*/
          if($scope.selectedAdServer.name) {
              resetTemplate();
              getTemplates($scope.selectedAdServer, adFormatName);
          }
      }

      /*Generate the Template*/
      $scope.templateSelected = function(templateJson){
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
                  .downloadCreativeTemplate($scope.selectedAdServer.id, $scope.adData.creativeTemplate)
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
      };

      $scope.formCompleted = function() {
          return $scope.selectedAdServer.name && $scope.creativeFormat && $scope.adData.creativeTemplate;
      };

      $scope.fileChosen = function() {
          return $scope.file && true;
      };

      $scope.resetFileChosen = function() {
          $scope.file = undefined;
      };

      $scope.resetAlertMessage = function() {
          $rootScope.setErrAlertMessage('', 0);
      };

      $scope.uploadFileChosen = function() {
          var url = workflowService.uploadBulkCreativeUrl($scope.selectedAdServer.id, $scope.creativeFormat, $scope.adData.creativeTemplate);
          (function(file) {
              $scope.uploadBusy = true;
              Upload.upload({
                  url: url,
                  fileFormDataName: 'creativesList',
                  file: file
              }).then(function (response) {
                  $scope.uploadBusy = false;
                  resetAdserver();
                  resetFormat();
                  resetTemplate();
                  $scope.resetFileChosen();

                  $scope.successfulRecords = response.data.data.success.length;
                  $scope.errorRecords = response.data.data.failure.length;
                  $scope.bulkUploadResultHeader = "Upload complete"
                  if ($scope.errorRecords > 0) {
                      $scope.bulkUploadResultHeader = $scope.bulkUploadResultHeader + ' - Errors found';
                  }
                  $scope.showUploadRecordsMessage = true;
              }, function (response) {
                  $scope.uploadBusy = false;
                  $scope.uploadErrorMsg = "Unable to upload the file.";
              });
            })($scope.file);
      };

      $scope.hideUploadRecordsMessage = function() {
          $scope.showUploadRecordsMessage = false;
          $(".file_upload_container").slideUp();
      };

      $scope.hideBulkSetup = function() {
          resetAdserver();
          resetFormat();
          resetTemplate();
          $scope.resetFileChosen();
          $(".file_upload_container").slideUp();
          setTimeout(function(){
              $("#formCreativeCreate").show();
              $(".successfullBulkUpView").hide();
          }, 1000);
      };

      $scope.closeErrorMessage = function() {
          $scope.rejFiles = [];
          $scope.uploadErrorMsg = undefined;
      };

      /*Get all adserver in Creative Library Page*/
      var getAdServers = function() {
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
