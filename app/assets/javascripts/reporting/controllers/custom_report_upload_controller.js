var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CustomReportUploadController', function ($rootScope, $scope, $route, $window, campaignSelectModel,
                                                                strategySelectModel, kpiSelectModel, utils,
                                                                dataService,  apiPaths, requestCanceller, constants, domainReports,
                                                                timePeriodModel, loginModel, analytics, $timeout, Upload,
                                                                reportsUploadList, urlService, collectiveReportModel,
                                                                advertiserModel, brandsModel, $modal,dataStore ,$location) {

      $scope.textConstants = constants;
      $scope.completed = false;
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.deleteSuccessMsg = false;
      $scope.deleteErrorMsg = false;

      $scope.disabledUpload = false;

      $scope.resetMessages = function(){
        $scope.successMsg = false;
        $scope.errorMsg = false;
        $scope.deleteSuccessMsg = false;
        $scope.deleteErrorMsg = false;
      }

      $scope.timeoutReset = function(){

        $timeout(function(){
          $scope.resetMessages();
        }, 3000);

      }

      $scope.closeMessage = function(){
        //$('.top_message_box').css({'display':'none'});
        $scope.rejFiles = [];
        $scope.resetMessages();
      };

      $scope.campaignList = [{ id: -1, name : 'Loading...'}];

      var selectedBrand = brandsModel.getSelectedBrand();
      campaignSelectModel.getCampaigns(selectedBrand.id).then(function(response){
          $scope.campaignList = response;
          console.log('fetching campaign data');
      });

      $scope.isDisabled = function(campaignId){
        if(!campaignId) {
          $scope.disabledUpload = true;
          return "";//border:1px dotted red
        } else {
          $scope.disabledUpload = false;
          return "";//"border:1px dotted green";
        }
      };

      $scope.showStatus = function() {
        if(_.find($scope.reportsUploadList, function(item) {
            return item.status == "success" || item.status == "error";
        })){
          return true;
        } else {
            return false;
        }

      }

      $scope.reportTypeList = [{name: "PCAR"},{name: "MCAR"},{name: "Monthly"},{name: "Custom"}];

      $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign() ;

      //reset files
      reportsUploadList.list =[];
      $scope.reportsUploadList = reportsUploadList.list;

      $scope.test="Upload Reports";
      $scope.$watch('files', function () {
        console.log('files changed');
       $scope.prepareUpload($scope.files);
      });
      // $scope.$watch('file', function () {
      //  $scope.upload([$scope.file]);
      // });
      $scope.log = '';
      $scope.show_report_name_txtbox = function(event) {
        var elem = $(event.target);
        elem.closest(".dropdown").find(".dropdown_txt").text(elem.text()) ;
        if( elem.text() == "Custom" ) {
            $(".upload_files_container").addClass("custom_report_type") ;
            elem.closest(".each-col").find("#reportName").show() ;
        } else {
          elem.closest(".each-col").find("#reportName").hide() ;
          if($(".upload_files_container").find(".report-type-name:visible").length == 0 ) {
             $(".upload_files_container").removeClass("custom_report_type") ;
           }
        }
        elem.closest(".dropdown").find(".dropdown-menu").hide();
      };
      $scope.close_other_dropdown = function() {
        $("#reportTypeDropdown").hide() ;
      };
      $scope.toggle_dropdown = function(event) {
        var elem = $(event.target);
        elem.closest(".dropdown").find(".dropdown-menu").toggle() ;
      };
      // $scope.close_msg_box = function(event) {
      //   var elem = $(event.target);
      //   elem.closest(".top_message_box").hide() ;
      // };
      $scope.prepareUpload = function (files) {

           if (files && files.length) {
             $scope.loaded =0;
             $scope.total = files.length;
               for (var i = 0; i < files.length; i++) {
                   var file = files[i];
                   file.notes = "";
                   file.campaignId = ""; //temp
                   file.reportType= "PCAR"; //default - PCAR
                   file.reportName = "";
                   file.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                   reportsUploadList.add(file);
                   //TODO: assign data in service
               }

              //pick new files for upload from mix of uploaded and fresh files
              var filtered =  _.filter(reportsUploadList.list, function(item) {
                return item.status !== "success"
              });

              if(filtered.length > 0 ){
                  reportsUploadList.list = filtered;
                  $scope.completed = false;
              }
                              //console.log(filtered);
               $scope.reportsUploadList = reportsUploadList.list;
           }

           //console.log($scope.reportsUploadList);
     }; //prepare files - ends

     //watch upload progress percentage
     $scope.$watch('loaded', function() {
       var percentage = 100 *($scope.loaded/$scope.total);
       //console.log(percentage);
       if(percentage == 100) {
         $scope.progress = false;
         $scope.completed = true;
         console.log('releasing progress lock');
       }
    });

     $scope.retryUpload = function(index){
       if(! $scope.progress) {
         $scope.upload("retry", $scope.reportsUploadList[index]);
       } else {
         alert('File upload in progress. Please Wait');
       }
     }

     $scope.upload = function (type, file) {
        if(type != "retry") {
            var campaignSelectedName = $(".campaign_name_selected");

            $scope.progress= true;
            var files = reportsUploadList.list
            if (files && files.length) {
                var j = 0;
                _.each(campaignSelectedName, function(elem, idx) {
                    files[j].campaignId = $(elem).attr("campaignid");
                    j++;
                });
                $scope.loaded =0;
                $scope.uploadedCount = 0;
                $scope.errorCount = 0;
                $scope.total = files.length;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if(file.status === undefined || file.status!= "success") {
                        (function(file) {
                            Upload.upload({
                               //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                               //TODO: move url ro url service
                                //url: 'http://dev-desk.collective-media.net/api/reporting/v2/uploadedreports/upload',
                                url: urlService.APIUploadReport(),
                                fields: {
                                    'reportType': file.reportType,
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
                                //  $scope.log = 'progress: ' + progressPercentage + '% ' +
                                      //        evt.config.file.name + '\n' + $scope.log;
                                //}

                            }).success(function (data, status, headers, config) {
                              $scope.loaded++;
                              $scope.resetMessages();
                              $scope.successMsg = true;
                              $scope.timeoutReset();
                              $scope.rejFiles = [];
                              $scope.uploadedCount++;
                              file.status ="success";
                                $timeout(function() {
                                  if(config.file !== undefined){
                                    file.data = data.data;
                                      //console.log(data);
                                      //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                                  }

                                });
                            }).error(function(data){
                              $scope.loaded++;
                              $scope.errorCount++;
                              $scope.rejFiles = [];
                              $scope.resetMessages();
                              $scope.errorMsg = true;
                              $scope.timeoutReset();
                              file.status ="error";
                              //console.log(data);
                            }); //upload ends

                        })(file) //end of closure

                    } else {
                      $scope.progress = false;
                    }//end of status check

                }
            }
            //console.log('end of upload');

        } else { //retry upload

          console.log('retry upload');
          //console.log(file);

          $scope.progress= true;

          if (file) {
              $scope.loaded =0;
              $scope.total = 1;
              $scope.uploadedCount = 0;
              $scope.errorCount = 0;
              $scope.resetMessages();
                  if(file.status === undefined || file.status!= "success") {
                      (function(file) {
                          Upload.upload({
                             //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                             //TODO: move url ro url service
                              //url: 'http://dev-desk.collective-media.net/api/reporting/v2/uploadedreports/upload',
                              url: urlService.APIUploadReport(),
                              fields: {
                                  'reportType': file.reportType,
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
                              //  $scope.log = 'progress: ' + progressPercentage + '% ' +
                                  //          evt.config.file.name + '\n' + $scope.log;
                              //}

                          }).success(function (data, status, headers, config) {
                            $scope.loaded++;
                            $scope.resetMessages();
                            $scope.successMsg = true;
                            $scope.timeoutReset();
                            $scope.uploadedCount++;
                            file.status ="success";
                              $timeout(function() {
                                if(config.file !== undefined){
                                  file.data = data.data;
                                  $scope.progress = false;
                                //  console.log(data);
                                  //  $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                                }

                              });
                          }).error(function(data){
                            $scope.loaded++;
                            $scope.errorCount++;
                            $scope.resetMessages();
                            $scope.errorMsg = true;
                            $scope.timeoutReset();
                            file.status ="error";
                            //console.log(data);
                          }); //upload ends

                      })(file) //end of closure

                  } else {
                    $scope.progress = false;
                  }//end of status check


          //console.log('end of upload');


        }
    }; //upload ends

}
    $scope.deleteProgress = false;
    // $scope.localDelete = function(key) {
    //   if(! $scope.progress) {
    //       if (confirm('Are you sure you want to delete this?')) {
    //         $scope.deleteProgress = true;
    //         reportsUploadList.list.splice(key, 1);
    //         $scope.reportsUploadList = reportsUploadList.list;
    //         $scope.deleteProgress = false;
    //       }
    //   }
    // };
    //Delete report Pop up
    $scope.localDeletetModal = function(key) {
        var $modalInstance = $modal.open({
            templateUrl: assets.html_delete_collective_report,
            controller:"CollectiveDeleteReportController",
            scope:$scope,
            windowClass: 'delete-dialog',
            resolve: {
                headerMsg: function() {
                    return constants.deleteReportHeader;
                },
                mainMsg: function() {
                    return "Please note that this action affects '<span class='bold-font'>"+ $scope.reportsUploadList[key].name+"</span>'. The report will be deleted for both you and the marketer."
                },
                deleteAction: function() {

                    return function() {
                        $scope.deleteProgress = true;
                        reportsUploadList.list.splice(key, 1);
                        $scope.reportsUploadList = reportsUploadList.list;
                        $scope.deleteProgress = false;

                        $scope.resetMessages();
                        $scope.deleteSuccessMsg = true;
                        $scope.timeoutReset();

                        // $scope.flashMessage.message = constants.reportDeleteFailed;
                        // $scope.flashMessage.isErrorMsg = true;
                    }
                }
            }
        });
    }; //end of local delete

    // $scope.serverDelete = function(key,fileId) {
    //       if (confirm('Are you sure you want to delete this?')) {
    //           //delete file -- server request
    //             $scope.deleteProgress = true;
    //             collectiveReportModel.deleteReport(fileId, function(response){
    //                  if(response.status_code == 200) {
    //                    reportsUploadList.list.splice(key, 1);
    //                    $scope.reportsUploadList = reportsUploadList.list;
    //                    $scope.deleteProgress = false;
    //                    if(!$scope.reportsUploadList.length) {
    //                      console.log('reset progress view');
    //                      $scope.progress= false;
    //                    }
    //
    //                  } else {
    //                    console.log('delete error');
    //                  }
    //              });
    //
    //       } //confirmation
    // };

    $scope.serverDeleteModal = function(key, reportId) {
        var $modalInstance = $modal.open({
            templateUrl: assets.html_delete_collective_report,
            controller:"CollectiveDeleteReportController",
            scope:$scope,
            windowClass: 'delete-dialog',
            resolve: {
                headerMsg: function() {
                    return constants.deleteReportHeader;
                },
                mainMsg: function() {

                    return "Please note that this action affects "+ $scope.reportsUploadList[key].name+".  Report will be deleted for both you and the marketer."
                },
                deleteAction: function() {

                    return function() {
                        $scope.deleteProgress = true;
                        collectiveReportModel.deleteReport(reportId, function(response){
                             if(response.status_code == 200) {
                               reportsUploadList.list.splice(key, 1);
                               $scope.reportsUploadList = reportsUploadList.list;
                               $scope.deleteProgress = false;
                               if(!$scope.reportsUploadList.length) {
                                 $scope.progress= false;
                               }
                               $scope.resetMessages();
                               $scope.deleteSuccessMsg = true;
                               $scope.timeoutReset();
                             } else {
                               $scope.resetMessages();
                               $scope.deleteErrorMsg = true;
                               $scope.deleteProgress = false;
                               $scope.timeoutReset();
                             }
                         });

                        // $scope.flashMessage.message = constants.reportDeleteFailed;
                        // $scope.flashMessage.isErrorMsg = true;
                    }
                }
            }
        });
    }; //end of local delete


    $scope.goToReportList = function() {
        var selectedCampagin = JSON.parse(localStorage.getItem('selectedCampaign')),
            advertiserId = advertiserModel.getSelectedAdvertiser().id,
            brandId = brandsModel.getSelectedBrand().id,
            url = urlService.APIReportList(advertiserId, brandId, selectedCampagin ? selectedCampagin.id : -1);
        if(url) {
            dataStore.deleteFromCache(url);
        }
        $location.path('/reports/list');
    }



    });
}());
