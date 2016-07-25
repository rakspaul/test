define(['angularAMD', 'reporting/campaignSelect/campaign_select_model',
    'reporting/strategySelect/strategy_select_service', 'reporting/kpiSelect/kpi_select_model',
    'common/utils', 'common/services/data_service', 'common/services/request_cancel_service',
    'common/services/constants_service', 'reporting/timePeriod/time_period_model', 'login/login_model',
    'reporting/advertiser/advertiser_model', 'common/services/url_service',
    'reporting/collectiveReport/collective_report_model', 'reporting/brands/brands_model',
    'common/services/vistoconfig_service', 'reporting/models/domain_reports',
    'reporting/models/reports_upload_list', 'workflow/directives/filter_directive'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CustomReportUploadController', function ($modal, dataStore, $timeout, $location, $rootScope,
                                                                   $scope, $route, $window, campaignSelectModel,
                                                                   strategySelectModel, kpiSelectModel,
                                                                   utils, dataService, requestCanceller,
                                                                   constants, timePeriodModel, loginModel,
                                                                   advertiserModel, urlService, collectiveReportModel,
                                                                   brandsModel, vistoconfig, accountService,
                                                                   domainReports, reportsUploadList,
                                                                    Upload, urlBuilder) {
        var getCampaings = function () {
            var selectedBrand = brandsModel.getSelectedBrand();

            campaignSelectModel
                .getCampaigns(selectedBrand.id)
                .then(function (response) {
                    $scope.campaignList = response;
                });
        };

        $scope.textConstants = constants;
        $scope.completed = false;
        $scope.successMsg = false;
        $scope.errorMsg = false;
        $scope.deleteSuccessMsg = false;
        $scope.deleteErrorMsg = false;
        $scope.errorMsgCustomRptName = false;

        $scope.disabledUpload = false;

        $scope.resetMessages = function () {
            $scope.successMsg = false;
            $scope.errorMsg = false;
            $scope.deleteSuccessMsg = false;
            $scope.deleteErrorMsg = false;
            $scope.errorMsgCustomRptName = false;
        };

        $scope.isLeafNode = accountService.getSelectedAccount().isLeafNode;

        $scope.timeoutReset = function () {
            $timeout(function () {
                $scope.resetMessages();
            }, 3000);
        };

        $scope.closeMessage = function () {
            $scope.rejFiles = [];
            $scope.resetMessages();
        };

        $scope.campaignList = [{
            id: -1,
            name: 'Loading...'
        }];

        $rootScope.$on('filterChanged', function (event, args) {
            if (args.from === 'customReportUpload') {
                getCampaings();
                $rootScope.$broadcast('CAMPAIGN_CHANGE');
            }
        });

        $scope.isDisabled = function (campaignId) {
            if (!campaignId) {
                $scope.disabledUpload = true;
            } else {
                $scope.disabledUpload = false;
            }

            return '';
        };

        $scope.showStatus = function () {
            if (_.find($scope.reportsUploadList, function (item) {
                    return item.status === 'success' || item.status === 'error';
                })) {
                return true;
            } else {
                return false;
            }
        };

        $scope.reportTypeList = [
            {name: 'PCAR'},
            {name: 'MCAR'},
            {name: 'Monthly'},
            {name: 'Custom'}
        ];

        $scope.selectedCampaign = campaignSelectModel.getSelectedCampaign();

        // reset files
        reportsUploadList.list = [];
        $scope.reportsUploadList = reportsUploadList.list;

        $scope.test = 'Upload Reports';

        $scope.$watch('files', function () {
            $scope.prepareUpload($scope.files);
        });

        $scope.log = '';

        $scope.show_report_name_txtbox = function (event) {
            var elem = $(event.target),
                uploadFilesContainer = $('.upload_files_container');

            elem.closest('.dropdown').find('.dropdown_txt').text(elem.text());

            if (elem.text() === 'Custom') {
                uploadFilesContainer.addClass('custom_report_type');
                elem.closest('.each-col').find('#reportName').show();
            } else {
                elem.closest('.each-col').find('#reportName').hide();

                if (uploadFilesContainer.find('.report-type-name:visible').length === 0) {
                    uploadFilesContainer.removeClass('custom_report_type');
                }
            }

            elem.closest('.dropdown').find('.dropdown-menu').hide();
        };

        $scope.close_other_dropdown = function () {
            $('#reportTypeDropdown').hide();
        };

        $scope.toggle_dropdown = function (event) {
            var elem = $(event.target);

            $('.campaigns_list').hide();
            $('.reportTypeDropdownTxt').not(elem).closest('.upload_file_holder').find('.dropdown-menu').hide();
            elem.closest('.upload_file_holder').find('.campaigns_list').hide();
            elem.closest('.report-type-col').find('.dropdown-menu').toggle();
        };

        $scope.prepareUpload = function (files) {
            var i,
                file,
                filtered;

            if (files && files.length) {
                $scope.loaded = 0;
                $scope.total = files.length;

                for (i = 0; i < files.length; i++) {
                    file = files[i];
                    file.notes = '';
                    file.campaignId = '';

                    // default - PCAR
                    file.reportType = 'PCAR';

                    file.reportName = '';
                    file.selectedCampaign = campaignSelectModel.getSelectedCampaign();
                    reportsUploadList.add(file);

                    // TODO: assign data in service
                }

                // pick new files for upload from mix of uploaded and fresh files
                filtered = _.filter(reportsUploadList.list, function (item) {
                    return item.status !== 'success';
                });

                if (filtered.length > 0) {
                    reportsUploadList.list = filtered;
                    $scope.completed = false;
                }

                $scope.reportsUploadList = reportsUploadList.list;
            }
        };
        // prepare files - ends

        // watch upload progress percentage
        $scope.$watch('loaded', function () {
            var percentage = 100 * ($scope.loaded / $scope.total);

            if (percentage === 100) {
                $scope.progress = false;
                $scope.completed = true;
            }
        });

        $scope.retryUpload = function (index) {
            if (!$scope.progress) {
                $scope.upload('retry', $scope.reportsUploadList[index]);
            } else {
                alert('File upload in progress. Please Wait');
            }
        };

        $scope.upload = function (type, file) {
            var files,
                campaignSelectedName,
                i,
                j,
                isCustomRptNameEmpty;

            if (type !== 'retry') {
                campaignSelectedName = $('.campaign_name_selected');
                files = reportsUploadList.list;
                $scope.progress = true;

                if (files && files.length) {
                    j = 0;

                    _.each(campaignSelectedName, function (elem) {
                        files[j].campaignId = $(elem).attr('campaignid');
                        j++;
                    });

                    $scope.loaded = 0;
                    $scope.uploadedCount = 0;
                    $scope.errorCount = 0;
                    $scope.total = files.length;

                    for (i = 0; i < files.length; i++) {
                        file = files[i];
                        isCustomRptNameEmpty = false;

                        if ((file.reportType === 'Custom') && (file.reportName.length === 0)) {
                            isCustomRptNameEmpty = true;
                        }

                        if ((file.status === undefined || file.status !== 'success') &&
                            isCustomRptNameEmpty === false) {
                            (function (file) {
                                Upload
                                    .upload({
                                        // TODO: move url to url service
                                        url: urlService.APIUploadReport(vistoconfig.getSelectedAccountId()),

                                        fields: {
                                            reportType: file.reportType,
                                            reportName: file.reportName,
                                            notes: file.notes,
                                            fileName: file.name,
                                            campaignId: file.campaignId
                                        },

                                        fileFormDataName: 'report',
                                        file: file
                                    })
                                    .progress(function () {
                                        file.status = 'uploading';
                                    })
                                    .success(function (data, status, headers, config) {
                                        $scope.loaded++;
                                        $scope.resetMessages();
                                        $scope.successMsg = true;
                                        $scope.timeoutReset();
                                        $scope.rejFiles = [];
                                        $scope.uploadedCount++;
                                        file.status = 'success';

                                        $timeout(function () {
                                            if (config.file !== undefined) {
                                                file.data = data.data;
                                            }
                                        });
                                    })
                                    .error(function () {
                                        $scope.loaded++;
                                        $scope.errorCount++;
                                        $scope.rejFiles = [];
                                        $scope.resetMessages();
                                        $scope.errorMsg = true;
                                        $scope.timeoutReset();
                                        file.status = 'error';
                                    });
                            })(file); // jshint ignore:line
                            // end of closure
                        } else {
                            $scope.progress = false;

                            if (isCustomRptNameEmpty === true) {
                                $scope.errorMsgCustomRptName = true;
                                $scope.timeoutReset();
                            }
                        }
                        // end of status check
                    }
                }
            } else {
                // retry upload
                $scope.progress = true;

                if (file) {
                    $scope.loaded = 0;
                    $scope.total = 1;
                    $scope.uploadedCount = 0;
                    $scope.errorCount = 0;
                    $scope.resetMessages();

                    if (file.status === undefined || file.status !== 'success') {
                        (function (file) {
                            Upload
                                .upload({
                                    // TODO: move url to url service
                                    url: urlService.APIUploadReport(vistoconfig.getSelectedAccountId()),

                                    fields: {
                                        reportType: file.reportType,
                                        reportName: file.reportName,
                                        notes: file.notes,
                                        fileName: file.name,
                                        campaignId: file.campaignId
                                    },

                                    fileFormDataName: 'report',
                                    file: file
                                })
                                .progress(function () {
                                    file.status = 'uploading';
                                })
                                .success(function (data, status, headers, config) {
                                    $scope.loaded++;
                                    $scope.resetMessages();
                                    $scope.successMsg = true;
                                    $scope.timeoutReset();
                                    $scope.uploadedCount++;
                                    file.status = 'success';

                                    $timeout(function () {
                                        if (config.file !== undefined) {
                                            file.data = data.data;
                                            $scope.progress = false;
                                        }
                                    });
                                })
                                .error(function () {
                                    $scope.loaded++;
                                    $scope.errorCount++;
                                    $scope.resetMessages();
                                    $scope.errorMsg = true;
                                    $scope.timeoutReset();
                                    file.status = 'error';
                                });
                        })(file);
                        // end of closure
                    } else {
                        $scope.progress = false;
                    }
                    // end of status check
                }
            }
            // upload ends
        };

        $scope.deleteProgress = false;

        // Delete report Pop up
        $scope.localDeletetModal = function (key) {
            $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: 'CollectiveDeleteReportController',
                scope: $scope,
                windowClass: 'delete-dialog',

                resolve: {
                    headerMsg: function () {
                        return constants.deleteReportHeader;
                    },

                    mainMsg: function () {
                        return 'Please note that this action affects \'<span class="bold-font">' +
                            $scope.reportsUploadList[key].name +
                            '</span>\'. The report will be deleted for both you and the marketer.';
                    },

                    deleteAction: function () {
                        return function () {
                            $scope.deleteProgress = true;
                            reportsUploadList.list.splice(key, 1);
                            $scope.reportsUploadList = reportsUploadList.list;
                            $scope.deleteProgress = false;

                            $scope.resetMessages();
                            $scope.deleteSuccessMsg = true;
                            $scope.timeoutReset();
                        };
                    }
                }
            });
        };
        // end of local delete

        $scope.serverDeleteModal = function (key, reportId) {
            $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: 'CollectiveDeleteReportController',
                scope: $scope,
                windowClass: 'delete-dialog',

                resolve: {
                    headerMsg: function () {
                        return constants.deleteReportHeader;
                    },

                    mainMsg: function () {
                        return 'Please note that this action affects ' +
                            $scope.reportsUploadList[key].name +
                            '.  Report will be deleted for both you and the marketer.';
                    },

                    deleteAction: function () {
                        return function () {
                            $scope.deleteProgress = true;

                            collectiveReportModel.deleteReport(vistoconfig.getSelectedAccountId(),
                                reportId, function (response) {
                                    if (response.status_code === 200) {
                                        reportsUploadList.list.splice(key, 1);
                                        $scope.reportsUploadList = reportsUploadList.list;
                                        $scope.deleteProgress = false;

                                        if (!$scope.reportsUploadList.length) {
                                            $scope.progress = false;
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
                                }
                            );
                        };
                    }
                }
            });
        };
        // end of local delete

        $scope.goToUploadReportsList = function () {
            $location.url(urlBuilder.uploadReportsListUrl());
        };
    });
});
