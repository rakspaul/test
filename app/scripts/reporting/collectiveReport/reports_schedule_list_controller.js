define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller',
    'reporting/collectiveReport/report_schedule_delete_controller'],
    function (angularAMD) {
        'use strict';
        angularAMD.controller('ReportsScheduleListController', function ($scope,$filter, $location, $modal, $rootScope,
                                                                        collectiveReportModel, utils, loginModel,
                                                                        constants, urlService, dataStore, domainReports,
                                                                        dataService, momentService, $q, $timeout) {
            var _curCtrl = this,
                isSearch = false;

            _curCtrl.filters = {};
            _curCtrl.isFilterExpanded = false;

            _curCtrl.preProccessListData = function (schdReportList) {
                _.each(schdReportList, function (item) {
                    item.dimensions = item.hasOwnProperty('primaryDimension') && item.primaryDimension ?
                        utils.getValueOfItem($scope.customeDimension, item.primaryDimension) : '';
                    item.dimensions += item.hasOwnProperty('secondaryDimension') && item.primaryDimension ?
                        ',' + utils.getValueOfItem($scope.customeDimension, item.secondaryDimension) : '';
                    if (item.lastRunDate) {
                        item.lastRunDate = momentService.newMoment(item.lastRunDate).format('YYYY-MM-DD');
                    }
                });
            };

            _curCtrl.getFilterParam = function () {
                var queryStr,
                    startDate,
                    endDate,
                    dimensionNames;

                _curCtrl.filters.reportDimensions = [];
                if ($scope.dimensionFilterModel.length > 0 && $scope.dimensionFilterModel[0].key!== 'ALL') {
                    dimensionNames = $scope.dimensionFilterModel.map(function (item) {
                        return item.key;
                    });
                    _curCtrl.filters.reportDimensions = dimensionNames.join(',');
                }

                queryStr = _curCtrl.filters.reportType ? '&reportType=' + _curCtrl.filters.reportType : '';
                //queryStr += $scope.filters.generated ? '&generated='+$scope.filters.generated : '';
                queryStr += _curCtrl.filters.reportDimensions ?
                    '&reportDimensions=' + _curCtrl.filters.reportDimensions : '';
                queryStr += _curCtrl.filters.reportName ? '&reportName=' + _curCtrl.filters.reportName : '';

                if (_curCtrl.filters.generated) {
                    switch (_curCtrl.filters.generated) {
                        case 'Yesterday':
                            startDate = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                            endDate = moment().format(constants.DATE_UTC_SHORT_FORMAT);
                            break;
                        case 'Last7Days':
                            startDate = moment().subtract(7, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                            endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                            break;
                        case 'Last2Weeks':
                            var startWeekDate = moment().startOf('week').subtract(1, 'day');
                            endDate = startWeekDate.format(constants.DATE_UTC_SHORT_FORMAT);
                            startDate = startWeekDate.subtract('days', 13).format(constants.DATE_UTC_SHORT_FORMAT);
                            break;
                        case 'LastMonth':
                            startDate =
                                moment()
                                    .subtract(1, 'months')
                                    .endOf('month')
                                    .format('YYYY-MM') + '-01';
                            endDate =
                                moment()
                                    .subtract(1, 'months')
                                    .endOf('month')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);
                            break;
                        case 'LastQuater':
                            startDate =
                                moment()
                                    .subtract(1, 'quarter')
                                    .startOf('quarter')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);
                            endDate =
                                moment()
                                    .subtract(1, 'quarter')
                                    .endOf('quarter')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);
                            break;
                    }
                    queryStr += '&startDate='+startDate+'&endDate='+endDate;
                }

                return queryStr;
            };

            $scope.noOfSchldInstToShow = 3;
            $scope.scheduleInstCount = [];
            $scope.sort = {
                descending: true
            };
            $scope.filters = {};
            $scope.sortReverse = false;
            $scope.showScheduleListLoader = false;
            $scope.textconstants = constants;
            $scope.dimensionFilterModel = [
                {
                    key: 'ALL',
                    value: 'All Dimensions'
                }
            ];

            //highlight the header menu - Dashborad, Campaigns, Reports
            domainReports.highlightHeaderMenu();

            $scope.clickedOnFilterIcon = function () {
                var dropDownFilters = ['reportType', 'generated', 'reportDimensions'];

                _curCtrl.isFilterExpanded = !_curCtrl.isFilterExpanded;
                _.each(dropDownFilters,function (d) {
                    _curCtrl.isFilterExpanded ? $scope.filters[d] = null : delete $scope.filters[d];
                    if (_curCtrl.isFilterExpanded) {
                        $scope.filters[d] = null;
                        _curCtrl.filters[d] = null;
                    } else {
                        delete $scope.filters[d];
                        delete _curCtrl.filters[d];
                    }
                });
            };

            $scope.clearFilters = function () {
                var filters = ['reportType', 'generated', 'reportDimensions', 'reportName'];

                _.each(filters, function (d) {
                    $scope.filters[d] = null;
                    _curCtrl.filters[d] = null;
                });

                $scope.dimensionFilterModel = [
                    {
                        key: 'ALL',
                        value: 'All Dimensions'
                    }
                ];

                $scope.creativeSearch = '';
                $scope.getScheduledReports();
            };

            dataService
                .getCustomReportMetrics($scope.campaign)
                .then(function (result) {
                    var jsonModifier = function (data) {
                        var arr = [];

                        _.each(data, function (obj) {
                            var d = obj.split(':');

                            arr.push({
                                'key': d[0],
                                'value': d[1]
                            });
                        });

                        return arr;
                    };

                    $scope.customeDimension = jsonModifier(result.data.data[0].dimensions);
                });

            $scope.loadDimensionsList = function () {
                var deferred = $q.defer();

                deferred.resolve($scope.customeDimension);
                return deferred.promise;
            };

            $scope.addDimensionFilter = function () {
                if ($scope.dimensionFilterModel.length > 5) {
                    $rootScope.setErrAlertMessage(constants.REPORT_LIST_DIMENSION_COUNT);
                    $scope.dimensionFilterModel.splice(5, 1);
                } else if ($scope.dimensionFilterModel[0].key === 'ALL') {
                    //as it is always going to be the first element
                    $scope.dimensionFilterModel.splice(0, 1);
                }
                return true;
            };

            $scope.removeDimensionFilter = function () {
                if ($scope.dimensionFilterModel.length === 0) {
                    //insert all dimension as default
                    $scope.dimensionFilterModel = [
                        {
                            key: 'ALL',
                            value: 'All Dimensions'}];
                }
                return true;
            };

            $scope.select_filter_option = function (key, value) {
                switch(key) {
                    case 'reportName':
                        $scope.filters[key] = value;
                        _curCtrl.filters[key] = value;
                        $scope.getScheduledReports();
                        break;
                    case 'reportType':
                        $scope.filters[key] = value;
                        _curCtrl.filters[key] = value;
                        break;
                    default:
                        $scope.filters[key] = utils.getValueOfItem(constants.REPORT_LIST_GENERATEON, value);
                        _curCtrl.filters[key] = value;
                }
            };

            $scope.getScheduledReports = function () {
                var scheduleReportListSucc = function (schdReportList) {
                    var instances,
                        i;

                    function mapElCallback (el) {
                        if (el.completedOn) {
                            el.completedOn =
                                momentService.utcToLocalTime(el.completedOn, constants.DATE_UTC_SHORT_FORMAT);
                        }
                    }

                    $scope.showScheduleListLoader = false;
                    _curCtrl.preProccessListData(schdReportList);
                    $scope.schdReportList = schdReportList;

                    // $scope.sortSchdlReport();
                    for (i = 0; i < $scope.schdReportList.length; i++) {
                        $scope.scheduleInstCount[i] = $scope.noOfSchldInstToShow;
                        instances = $scope.schdReportList[i].instances;
                        instances.map(mapElCallback);
                    }
                };

                var scheduleReportListError = function () {
                    $scope.showScheduleListLoader = false;
                };

                //var queryStr = '?clientId='+loginModel.getSelectedClient().id;
                var queryStr = '?clientId=' + loginModel.getMasterClient().id;
                queryStr += _curCtrl.getFilterParam();

                $scope.showScheduleListLoader = true;
                collectiveReportModel.getScheduleReportList(scheduleReportListSucc, scheduleReportListError, queryStr);
            };

            $scope.reset_custom_report = function (event) {
                localStorage.removeItem('customReport');
            };

            //Dropdown Auto Positioning
            $scope.redirect_or_open_2nd_dimension = function (event, index,reportId,freq) {
                var elem;
                if (freq && freq === 'Saved') {
                    $scope.editSchdReport(reportId);
                } else {
                    elem = $(event.target);
                    if (!elem.closest('.row').hasClass('open')) {
                        $scope.scheduleInstCount[index] = $scope.noOfSchldInstToShow;
                    }
                    elem.closest('.row').toggleClass('open');
                    elem.closest('.row').find('.inner-row').toggle();
                }
            };

            $scope.setScheduleInstCount = function (index, count) {
                $scope.scheduleInstCount[index] = count;
            };

            //$scope.sortSchdlReport = function () {
              //  $scope.schdReportList = $filter('orderBy')($scope.schdReportList, 'name', $scope.sort.descending);
              //  $scope.sort.descending = !$scope.sort.descending;
            //};

            $scope.downloadSchdReport = function (parentIndex, instanceIndex, instanceId) {
                $scope.reportDownloadBusy = true;
                dataService.downloadFile(urlService.downloadSchdRpt(instanceId)).then(function (response) {
                    if (response.status === 'success') {
                        saveAs(response.file, response.fileName);
                        $scope.reportDownloadBusy = false;
                        $scope.schdReportList[parentIndex].instances[instanceIndex].viewedOn =
                            momentService.reportDateFormat();
                    } else {
                        $scope.reportDownloadBusy = false;
                        $rootScope.setErrAlertMessage('File couldn\'t be downloaded');
                    }
                });
            };

            $scope.downloadSavedReport = function (parentIndex, instanceIndex, instanceId) {
                $scope.reportDownloadBusy = true;
                dataService.downloadFile(urlService.downloadSavedRpt(instanceId)).then(function (response) {
                    if (response.status === 'success') {
                        saveAs(response.file, response.fileName);
                        $scope.reportDownloadBusy = false;
                        $scope.schdReportList[parentIndex].instances[instanceIndex].viewedOn =
                            momentService.reportDateFormat();
                    } else {
                        $scope.reportDownloadBusy = false;
                        $rootScope.setErrAlertMessage('File couldn\'t be downloaded');
                    }
                });
            };

            //Delete scheduled report Pop up
            $scope.deleteSchdRpt = function (reportId, frequency) {
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_delete_collective_report,
                    controller: 'ReportScheduleDeleteController',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return constants.deleteReportHeader;
                        },

                        mainMsg: function () {
                            return (frequency !== 'Saved') ?
                                'Are you sure you want to delete Scheduled Report?' :
                                'Are you sure you want to delete Saved Report?';
                        },

                        deleteAction: function () {
                            return function () {
                                var successFun,
                                    errorFun;

                                if (frequency === 'Saved') {
                                    successFun = function (data) {
                                        if (data.status_code === 200) {
                                            $scope.refreshReportList();
                                            $rootScope
                                                .setErrAlertMessage('The saved report is deleted successfully', 0);
                                        } else {
                                            $rootScope.setErrAlertMessage(data.message, data.message);
                                        }
                                    };
                                    errorFun = function (data) {
                                        $rootScope.setErrAlertMessage(data.message, data.message);
                                    };
                                    collectiveReportModel.deleteSavedReport(successFun, errorFun, reportId);
                                } else {
                                    successFun = function (data) {
                                        if (data.status_code === 200) {
                                            $scope.refreshReportList();
                                            $rootScope
                                                .setErrAlertMessage('The scheduled report is deleted successfully', 0);
                                        } else {
                                            $rootScope.setErrAlertMessage(data.message, data.message);
                                        }
                                    };
                                    errorFun = function (data) {
                                        $rootScope.setErrAlertMessage(data.message, data.message);
                                    };
                                    collectiveReportModel.deleteScheduledReport(successFun, errorFun, reportId);
                                }
                            };
                        }
                    }
                });
            };

            //Delete scheduled report Pop up
            $scope.deleteSchdRptInstance = function (reportId, instanceId) {
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_delete_collective_report,
                    controller: 'ReportScheduleDeleteController',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return constants.deleteReportHeader;
                        },

                        mainMsg: function () {
                            return 'Are you sure you want to delete instance of Scheduled Report'
                        },

                        deleteAction: function () {
                            var successFun,
                                errorFun;

                            return function () {
                                successFun = function (data) {
                                    if (data.status_code == 200) {
                                        $scope.refreshReportList();
                                        $rootScope.setErrAlertMessage('Scheduler deleted Successfully', 0);
                                    } else {
                                        $rootScope.setErrAlertMessage(data.message, data.message);
                                    }
                                };
                                errorFun = function (data) {
                                    $rootScope.setErrAlertMessage(data.message, data.message);
                                };
                                collectiveReportModel
                                    .deleteScheduledReportInstance(successFun, errorFun, reportId, instanceId);
                            };
                        }
                    }
                });
            };

            $scope.editSchdReport = function (reportId) {
                var url = '/customreport/edit/' + reportId;

                localStorage.scheduleListReportType = 'scheduled';
                _.each($scope.schdReportList, function (item) {
                    if (reportId === item.reportId && item.frequency === 'Saved') {
                        localStorage.scheduleListReportType = 'Saved';
                    }
                });
                $location.path(url);
            };

            $scope.copyScheduleRpt = function (reportId, frequency) {
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_confirmation_modal,
                    controller: 'ConfirmationModalController',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return (frequency !== 'Saved') ? 'Copy Scheduled Report?' : 'Copy Saved Report?';
                        },

                        mainMsg: function () {
                            return (frequency !== 'Saved') ?
                                'Are you sure you want to copy Scheduled Report?' :
                                'Are you sure you want to copy Saved Report?';
                        },

                        buttonName: function () {
                            return 'Copy';
                        },

                        execute: function () {
                            return function () {
                                var copySuccess,
                                    copyError;

                                if (frequency === 'Saved') {
                                    copySuccess = function (data) {
                                        data.name = 'copy: ' + data.reportName;
                                        // data.client_id = loginModel.getSelectedClient().id;
                                        data.client_id = loginModel.getMasterClient().id;
                                        //   data.schedule = $scope.pre_formatCopySchData(data.schedule);
                                        collectiveReportModel.createSavedReport(function () {
                                            $scope.refreshReportList();
                                            $rootScope.setErrAlertMessage('Saved Report Copied Successfully', 0);
                                        }, function () {
                                            $rootScope.setErrAlertMessage('Error Copying Saved Report');
                                        }, data);
                                    };
                                    copyError = function () {
                                        $rootScope.setErrAlertMessage('Error Copying Saved Report');
                                    };
                                    collectiveReportModel.getSaveRptDetail(copySuccess, copyError, reportId);
                                } else {
                                    copySuccess = function (data) {
                                        data.name = 'copy: ' + data.name;
                                       // data.client_id = loginModel.getSelectedClient().id;
                                        data.client_id = loginModel.getMasterClient().id;
                                        data.schedule = $scope.pre_formatCopySchData(data.schedule);
                                        collectiveReportModel.createSchdReport(function () {
                                            $scope.refreshReportList();
                                            $rootScope.setErrAlertMessage('Schedule Report Copied Successfully', 0);
                                        }, function () {
                                            $rootScope.setErrAlertMessage('Error Copying Schedule Report');
                                        }, data);
                                    };
                                    copyError = function () {
                                        console.log('Copy error');
                                    };
                                    collectiveReportModel.getSchdRptDetail(copySuccess, copyError, reportId);
                                }
                            };
                        }
                    }
                });
            };

            $scope.pre_formatCopySchData = function (schData) {
                var o = $.extend({}, schData);

                schData.startDate = momentService.newMoment(schData.startDate).format('YYYY-MM-DD');
                schData.endDate = momentService.newMoment(schData.endDate).format('YYYY-MM-DD');
                o.startDate = momentService.todayDate('YYYY-MM-DD');
                if (momentService.isSameOrAfter(schData.startDate, o.startDate)) {
                    return schData;
                }
                if ($scope.valueWithDefault(schData,'frequency','') !== 'Once') {
                    var diffDays = momentService.dateDiffInDays(schData.startDate,schData.endDate);
                    o.endDate = momentService.addDays('YYYY-MM-DD', diffDays);
                } else {
                    o.endDate = o.startDate;
                }
                return o;
            };

            $scope.valueWithDefault = function (o, argArr, defaultVal) {
                var d = typeof defaultVal === undefined ? '' : defaultVal;

                return (typeof o !== 'undefined' && typeof argArr !== 'undefined') ? (function (a) {
                    a.forEach(function (e) {
                        e = e.toLowerCase().trim();
                        o = typeof o[e] !== 'undefined' ? o[e] : d;
                    });
                    return o;
                })(argArr.split(',')) : d;
            };

            $scope.archiveSchdRpt = function (reportId, instanceId) {
                var $modalInstance = $modal.open({
                    templateUrl: assets.html_confirmation_modal,
                    controller: 'ConfirmationModalController',
                    scope: $scope,
                    windowClass: 'delete-dialog',

                    resolve: {
                        headerMsg: function () {
                            return 'Archive Scheduled Report';
                        },

                        mainMsg: function () {
                            return 'Are you sure you want to Archive Scheduled Report';
                        },

                        buttonName: function () {
                            return 'Archive';
                        },

                        execute: function () {
                            return function () {
                                var archiveSuccess = function () {
                                        $scope.refreshReportList();
                                        $rootScope.setErrAlertMessage('Schedule Report Archived Successfully', 0);
                                    },
                                    archiveError = function () {
                                        $rootScope.setErrAlertMessage('Error archiving scheduled report');
                                    };
                                collectiveReportModel
                                    .archiveSchdReport(archiveSuccess, archiveError, reportId, instanceId);
                            };
                        }
                    }
                });
            };

            //Search Hide / Show
            $scope.searchShowInput = function () {
                var searchInputForm = $('.searchInputForm');

                $('.searchInputBtn').hide();
                searchInputForm.show();
                searchInputForm.animate({width: '300px'}, 'fast');
            };

            $scope.searchHideInput = function () {
                var inputSearch = $('.searchInputForm input');

                delete $scope.filters.searchText;
                isSearch = false;
                $('.searchInputForm').animate({width: '44px'}, 'fast');
                inputSearch.val('');
                setTimeout(function () { $('.searchInputForm').hide(); }, 300);
                setTimeout(function () { $('.searchInputBtn').fadeIn(); }, 300);
                $scope.creativeData.creatives = [];

                //  var selectedClientObj = localStorage.selectedClient && JSON.parse(localStorage.selectedClient);
                // var selectedClientObj = localStorage.selectedMasterClient && JSON.parse(localStorage.selectedMasterClient);
                //creativeList.getCreativesList(JSON.parse(localStorage.selectedClient).id,'', '',20, 1);
                creativeList.getCreativesList(JSON.parse(localStorage.selectedMasterClient).id,'', '',20, 1);
            };

            $scope.refreshReportList = function () {
                var url = urlService.scheduleReportsList();

                if (url) {
                    dataStore.deleteFromCache(url);
                }
                $scope.getScheduledReports();
            };

            // SECTION FOR APPLYING FILTER IF THE APPROPRIATE QUERY PARAMS ARE PASSED IN THE URL.
            // TODO: This is a temporary solution, and should be handled properly using History API or similar technique
            var urlQueries = $location.search(),
                report_name = '',
                dateFilter = '',
                isValidQueryParamFilter = false;

            // If any query param is given, check if there's at least 1 valid query param.
            // URL & QUERY PARAM FORMAT: reports/schedules?report_name=reportnamestring&date_filter=datevalue
            // report_name values: Any string
            // date_filter values: yesterday, last_7_days, last_2_weeks, last_month, last_quarter
            // Example URL: reports/schedules?report_name=pattest&date_filter=last_7_days
            if (!(_.isEmpty(urlQueries))) {
                _.each(urlQueries, function (val, key) {
                    if (key === 'report_name') {
                        report_name = val;
                        isValidQueryParamFilter = true;
                    } else if (key === 'date_filter') {
                        dateFilter = val;
                        isValidQueryParamFilter = true;
                    }
                });

                // Perform filtering if valid query params are given
                if (isValidQueryParamFilter) {
                    // Filter on filter name if it is given
                    if (report_name) {
                        $timeout(function () {
                            angular.element('.searchInput .searchInputBtn').triggerHandler('click');
                            angular.element('#creativeSearch').val(report_name);
                            $scope.select_filter_option('reportName', report_name);
                        }, 1);
                    }

                    // Filter on dateFilter only if valid param is given
                    if (dateFilter === 'yesterday' || dateFilter === 'last_7_days' ||
                        dateFilter === 'last_2_weeks' || dateFilter === 'last_month' ||
                        dateFilter === 'last_quarter') {
                        // Map query param value (lowercase, separated by underscore) to internal value (Pascal case)
                        switch (dateFilter) {
                            case 'yesterday':
                                dateFilter = 'Yesterday';
                                break;
                            case 'last_7_days':
                                dateFilter = 'Last7Days';
                                break;
                            case 'last_2_weeks':
                                dateFilter = 'Last2Weeks';
                                break;
                            case 'last_month':
                                dateFilter = 'LastMonth';
                                break;
                            case 'last_quarter':
                                dateFilter = 'LastQuater';
                                break;
                        }

                        $('button[data-target="#schedule_report_filter"]').trigger('click');
                        $scope.select_filter_option('generated', dateFilter);
                        $timeout(function () {
                            angular.element('#applyFilter').triggerHandler('click');
                        }, 1);
                    }
                } else {
                    $scope.getScheduledReports();
                }
            } else {
                $scope.getScheduledReports();
            }
        });
    }
);
