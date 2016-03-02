define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/moment_utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service'
],function (angularAMD) {
    'use strict';
    angularAMD.controller('ReportsScheduleListController', function($scope,$filter, $location, $modal, $rootScope,
                                                                                collectiveReportModel, momentService, loginModel,
                                                                                constants, urlService, dataStore,
                                                                                dataService) {
        $scope.noOfSchldInstToShow = 3;
        $scope.scheduleInstCount = [];
        $scope.sort = {
            descending: true
        };
        $scope.getScheduledReports = function() {
            var scheduleReportListSucc = function(schdReportList) {
                var instances,
                    i;

                $scope.schdReportList = schdReportList;
                $scope.sortSchdlReport();
                for (i = 0; i < $scope.schdReportList.length; i++) {
                    $scope.scheduleInstCount[i] = $scope.noOfSchldInstToShow;
                    instances = $scope.schdReportList[i].instances;
                    instances.map(function(el) {
                        if (el.completedOn) {
                            el.completedOn = momentService.utcToLocalTime(el.completedOn, constants.DATE_UTC_SHORT_FORMAT);
                        }
                    });
                }
            };

            var scheduleReportListError = function() {
                // console.log('error occured');
            };

            collectiveReportModel.getScheduleReportList(scheduleReportListSucc, scheduleReportListError);
        };

        $scope.reset_custom_report = function(event) {
            localStorage.removeItem('customReport');
        };

        $scope.getScheduledReports();

        //Dropdown Auto Positioning

        $scope.open_second_dimension = function(event, index) {
            var elem = $(event.target);
            if (!elem.closest(".row").hasClass("open")) {
                $scope.scheduleInstCount[index] = $scope.noOfSchldInstToShow;
            }
            elem.closest(".row").toggleClass("open");
            elem.closest(".row").find(".inner-row").toggle();

        };

        $scope.setScheduleInstCount = function(index, count) {
            $scope.scheduleInstCount[index] = count;
        }

        $scope.sortSchdlReport = function() {
            $scope.schdReportList = $filter('orderBy')($scope.schdReportList, 'frequency', $scope.sort.descending);
            $scope.sort.descending = !$scope.sort.descending;
        }

        $scope.downloadSchdReport = function(parentIndex, instanceIndex, instanceId) {
            $scope.reportDownloadBusy = true;
            dataService.downloadFile(urlService.downloadSchdRpt(instanceId)).then(function(response) {
                if (response.status === "success") {
                    saveAs(response.file, response.fileName);
                    $scope.reportDownloadBusy = false;
                    $scope.schdReportList[parentIndex].instances[instanceIndex].viewedOn = momentService.reportDateFormat();
                } else {
                    $scope.reportDownloadBusy = false;
                    $rootScope.setErrAlertMessage("File couldn't be downloaded");
                }
            })
        }

        //Delete scheduled report Pop up
        $scope.deleteSchdRpt = function(reportId) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: "ReportScheduleDeleteController",
                scope: $scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return constants.deleteReportHeader;
                    },
                    mainMsg: function() {
                        return "Are you sure you want to delete Scheduled Report?"
                    },
                    deleteAction: function() {
                        return function() {
                            var successFun = function(data) {
                                if (data.status_code == 200) {
                                    $scope.refreshReportList();
                                    $rootScope.setErrAlertMessage('The scheduled report is deleted successfully', 0);
                                } else {
                                    $rootScope.setErrAlertMessage(data.message, data.message);
                                }
                            }
                            var errorFun = function(data) {
                                $rootScope.setErrAlertMessage(data.message, data.message);
                            }
                            collectiveReportModel.deleteScheduledReport(successFun, errorFun, reportId);
                        }
                    }
                }
            });
        }

        //Delete scheduled report Pop up
        $scope.deleteSchdRptInstance = function(reportId, instanceId) {
            // console.log('Delete Instance: ',reportId,instanceId);
            var $modalInstance = $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: "ReportScheduleDeleteController",
                scope: $scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return constants.deleteReportHeader;
                    },
                    mainMsg: function() {
                        return "Are you sure you want to delete instance of Scheduled Report"
                    },
                    deleteAction: function() {
                        return function() {
                            var successFun = function(data) {
                                if (data.status_code == 200) {
                                    $scope.refreshReportList();
                                    $rootScope.setErrAlertMessage('Scheduler deleted Successfully', 0);
                                } else {
                                    $rootScope.setErrAlertMessage(data.message, data.message);
                                }
                            }
                            var errorFun = function(data) {
                                $rootScope.setErrAlertMessage(data.message, data.message);
                            }
                            collectiveReportModel.deleteScheduledReportInstance(successFun, errorFun, reportId, instanceId);
                        }
                    }
                }
            });
        }

        $scope.editSchdReport = function(reportId) {
            $location.path('/customreport/edit/' + reportId);
        }


        $scope.copyScheduleRpt = function(reportId) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_confirmation_modal,
                controller: "ConfirmationModalController",
                scope: $scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return "Copy Scheduled Report?";
                    },
                    mainMsg: function() {
                        return "Are you sure you want to copy Scheduled Report?"
                    },
                    buttonName: function() {
                        return "Copy"
                    },
                    execute: function() {
                        return function() {
                            var copySuccess = function(data) {
                                data.name = 'copy: ' + data.name;
                                data.client_id = loginModel.getSelectedClient().id;
                                data.schedule = $scope.pre_formatCopySchData(data.schedule);
                                collectiveReportModel.createSchdReport(function() {
                                    $scope.refreshReportList();
                                    $rootScope.setErrAlertMessage('Schedule Report Copied Successfully', 0);
                                }, function() {
                                    $rootScope.setErrAlertMessage('Error Copying Schedule Report');
                                }, data);
                            }
                            var copyError = function() {
                                $rootScope.setErrAlertMessage('Error Copying Schedule Report');
                            }
                            collectiveReportModel.getSchdRptDetail(copySuccess, copyError, reportId);
                        }
                    }
                }
            });
        }
        $scope.pre_formatCopySchData = function(schData){
            var o = $.extend({}, schData);
            o.startDate = momentService.todayDate('YYYY-MM-DD');
            if(momentService.isSameOrAfter(schData.startDate, o.startDate)){
                return schData;
            }
            if($scope.valueWithDefault(schData,"frequency",'') != "Once"){
                var diffDays = momentService.dateDiffInDays(schData.startDate,schData.endDate);
                o.endDate = momentService.addDays('YYYY-MM-DD', diffDays);
            }else{
                o.endDate = o.startDate;
            }
            return o;
        }
        $scope.valueWithDefault = function(o, argArr, defaultVal) {
            var d = typeof defaultVal == undefined ? '' : defaultVal;
            return (typeof o != "undefined" && typeof argArr != "undefined") ? (function(a) {
                a.forEach(function(e) {
                    e = e.toLowerCase().trim();
                    o = typeof o[e] != "undefined" ? o[e] : d;
                });
                return o;
            })(argArr.split(",")) : d;
        }
        $scope.archiveSchdRpt = function(reportId, instanceId) {
            var $modalInstance = $modal.open({
                templateUrl: assets.html_confirmation_modal,
                controller: "ConfirmationModalController",
                scope: $scope,
                windowClass: 'delete-dialog',
                resolve: {
                    headerMsg: function() {
                        return "Archive Scheduled Report";
                    },
                    mainMsg: function() {
                        return "Are you sure you want to Archive Scheduled Report"
                    },
                    buttonName: function() {
                        return "Archive"
                    },
                    execute: function() {
                        return function() {
                            var archiveSuccess = function() {
                                $scope.refreshReportList();
                                $rootScope.setErrAlertMessage('Schedule Report Archived Successfully', 0);
                            }
                            var archiveError = function() {
                                $rootScope.setErrAlertMessage('Error archiving scheduled report');
                            }
                            collectiveReportModel.archiveSchdReport(archiveSuccess, archiveError, reportId, instanceId);
                        }
                    }
                }
            });
        }

        $scope.refreshReportList = function() {
            var url = urlService.scheduleReportsList();
            if (url) {
                dataStore.deleteFromCache(url);
            }
            $scope.getScheduledReports();
        }
    });
});