var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportUploadController', function ($rootScope, $scope, $route, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout, Upload, reportsUploadList, urlService, collectiveReportModel) {

      $scope.textConstants = constants;

      $scope.reportTypeList = [{name: "PCAR"},{name: "MCAR"},{name: "Monthly"},{name: "Custom"}];

      $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;

      //reset files
      reportsUploadList.list =[];
      $scope.reportsUploadList = reportsUploadList.list;

      $scope.test="Upload Reports";
      $scope.$watch('files', function () {
        console.log('watch triggered');
       $scope.prepareUpload($scope.files);
      });
      // $scope.$watch('file', function () {
      //  $scope.upload([$scope.file]);
      // });
      $scope.log = '';

      $scope.prepareUpload = function (files) {

           if (files && files.length) {
             $scope.loaded =0;
             $scope.total = files.length;
               for (var i = 0; i < files.length; i++) {
                   var file = files[i];
                   file.notes = "";
                   file.campaignId = "415486"; //temp
                   file.reportType= $scope.reportTypeList[0];
                   file.reportName = "";
                   file.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                   reportsUploadList.add(file);
                   //TODO: assign data in service
               }
               $scope.reportsUploadList = reportsUploadList.list;
           }
           console.log($scope.reportsUploadList);
     }; //prepare ends

     $scope.upload = function () {
       $scope.progress= true;
      var files = reportsUploadList.list
      if (files && files.length) {
        $scope.loaded =0;
        $scope.total = files.length;
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            (function(file) {
              Upload.upload({
                 //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                 //TODO: move url ro url service
                  //url: 'http://dev-desk.collective-media.net/api/reporting/v2/uploadedreports/upload',
                  url: urlService.APIUploadReport(),
                  fields: {
                      'reportType': file.reportType.name,
                      'reportName': file.reportName,
                      'notes': file.notes,
                      'fileName': file.name,
                      'campaignId': file.campaignId,
                  },
                  fileFormDataName : 'report',
                  file: file
              }).progress(function (evt) {
                file.status ="uploading";
                  var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  //if(evt.config.file !== undefined) {
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                                evt.config.file.name + '\n' + $scope.log;
                  //}

              }).success(function (data, status, headers, config) {
                $scope.loaded++;
                file.status ="success";
                  $timeout(function() {
                    if(config.file !== undefined){
                      file.data = data.data;
                      console.log(data);
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    }

                  });
              }).error(function(data){
                file.status ="error";
                console.log(data);
              });

            })(file)
      }
    }
    }; //upload ends


    $scope.localDelete = function(key) {
      if(! $scope.progress) {
          if (confirm('Are you sure you want to delete this?')) {
            reportsUploadList.list.splice(key, 1);
            $scope.reportsUploadList = reportsUploadList.list;
          }
      }
    };

    $scope.serverDelete = function(key,fileId) {
          if (confirm('Are you sure you want to delete this?')) {
              //delete file -- server request
                collectiveReportModel.deleteReport(fileId, function(response){
                     if(response.status_code == 200) {
                       reportsUploadList.list.splice(key, 1);
                       $scope.reportsUploadList = reportsUploadList.list;
                     } else {
                       console.log('delete error');
                     }
                 });

          } //confirmation
    };




    });
}());
