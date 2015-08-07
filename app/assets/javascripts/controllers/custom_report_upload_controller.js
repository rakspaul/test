var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportUploadController', function ($rootScope, $scope, $route, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout, Upload) {

      $scope.textConstants = constants;


      $scope.test="Upload Reports";
      $scope.$watch('files', function () {
        console.log('watch triggered');
       $scope.upload($scope.files);
      });
      // $scope.$watch('file', function () {
      //  $scope.upload([$scope.file]);
      // });
      $scope.log = '';

      $scope.upload = function (files) {
         console.log(files);
       if (files && files.length) {
         $scope.loaded =0;
         $scope.total = files.length;
           for (var i = 0; i < files.length; i++) {
               var file = files[i];
               //TODO: assign data in service

               Upload.upload({
                  //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                  //TODO: move url ro url service
                   url: 'http://dev-desk.collective-media.net/api/reporting/v2/uploadedreports/upload',
                   fields: {
                       'reportType': 'Custom',
                       'reportName': 'reportname custom',
                       'notes': 'some long notes',
                       'fileName': 'myreportname.pdf',
                       'campaignId': '415486',
                   },
                   fileFormDataName : 'report',
                   file: file
               }).progress(function (evt) {
                   var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                   //if(evt.config.file !== undefined) {
                     $scope.log = 'progress: ' + progressPercentage + '% ' +
                                 evt.config.file.name + '\n' + $scope.log;
                   //}

               }).success(function (data, status, headers, config) {
                 $scope.loaded++;
                   $timeout(function() {
                     if(config.file !== undefined){
                         $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                     }

                   });
               }).error(function(data){
                 console.log(data);
               });
           }
       }
      };

    });
}());
