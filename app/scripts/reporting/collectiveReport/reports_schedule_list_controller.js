define(['angularAMD', 'reporting/collectiveReport/collective_report_model', 'common/utils', 'login/login_model',
    'common/services/constants_service', 'common/services/url_service', 'common/services/data_store_model',
    'common/services/data_service', 'common/moment_utils', 'common/controllers/confirmation_modal_controller',
    'common/services/vistoconfig_service', 'reporting/collectiveReport/report_schedule_delete_controller'],
    function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsScheduleListController', function ($scope,$filter, $location, $modal, $rootScope,
                                                                     $routeParams, collectiveReportModel, utils,
                                                                     loginModel, constants, urlService, dataStore,
                                                                     domainReports, dataService, momentService,
                                                                     $q, $timeout, localStorageService,
                                                                     vistoconfig, urlBuilder) {
        var _curCtrl = this,
            isSearch = false,
            urlQueries = $location.search(),
            reportName = '',
            dateFilter = '',

            dateFiltersObj = {
                yesterday: 'Yesterday',
                last_7_days: 'Last7Days',
                last_2_weeks: 'Last2Weeks',
                last_month: 'LastMonth',
                last_quarter: 'LastQuater'
            },

            isValidQueryParamFilter = false;

        _curCtrl.filters = {};
        _curCtrl.isFilterExpanded = false;

        _curCtrl.mapToDisplayName = function (data) {
            var retVal = '';

            data = data.split(',');

            _.each(data, function (dim) {
                dim = dim.trim();
                retVal += $scope.displayName[dim] + ',';
            });

            retVal = retVal.slice(0, -1);

            return retVal;
        };

        _curCtrl.preProccessListData = function (schdReportList) {
            _.each(schdReportList, function (item) {
                item.dimensions = item.hasOwnProperty('primaryDimension') && item.primaryDimension ?
                    _curCtrl.mapToDisplayName(item.primaryDimension) : '';

                item.dimensions += item.hasOwnProperty('secondaryDimension') && item.primaryDimension ?
                    ',' + _curCtrl.mapToDisplayName(item.secondaryDimension) : '';

                if (item.lastRunDate) {
                    item.lastRunDate = momentService.newMoment(item.lastRunDate).format('YYYY-MM-DD');
                }
            });
        };

        _curCtrl.getFilterParam = function () {
            var queryStr,
                startDate,
                startWeekDate,
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

            queryStr += _curCtrl.filters.reportDimensions ?
                '&reportDimensions=' + _curCtrl.filters.reportDimensions : '';

            queryStr += _curCtrl.filters.reportName ? '&reportName=' + _curCtrl.filters.reportName : '';

            if (_curCtrl.filters.generated) {
                switch (_curCtrl.filters.generated) {
                    case 'Yesterday':
                        startDate = moment()
                            .subtract(1, 'days')
                            .format(constants.DATE_UTC_SHORT_FORMAT);

                        endDate = moment().format(constants.DATE_UTC_SHORT_FORMAT);
                        break;

                    case 'Last7Days':
                        startDate = moment()
                            .subtract(7, 'days')
                            .format(constants.DATE_UTC_SHORT_FORMAT);

                        endDate = moment()
                            .subtract(0, 'days')
                            .format(constants.DATE_UTC_SHORT_FORMAT);

                        break;

                    case 'Last2Weeks':
                        startWeekDate = moment().startOf('week').subtract(1, 'day');
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

        _curCtrl.getmetaData = function() {
            dataService
                .getCustomReportMetrics(vistoconfig.getMasterClientId())
                .then(function (result) {
                    var jsonModifier = function (data) {
                        var arr = [];

                        _.each(data, function (obj) {
                            var d = obj.split(':');

                            arr.push({
                                key: d[0],
                                value: $scope.displayName[d[0]]
                            });
                        });

                        return arr;
                    };

                    $scope.displayName = result.data.data[0].display_name;
                    $scope.customeDimension = jsonModifier(result.data.data[0].dimensions);
                    $scope.getScheduledReports();
                });
        };

        $scope.noOfSchldInstToShow = 3;
        $scope.scheduleInstCount = [];
        $scope.sort = {descending: true};
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

        // highlight the header menu - Dashborad, Campaigns, Reports
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

        $scope.loadDimensionsList = function ($query) {
            return $scope.customeDimension.filter(function (dimension) {
                return dimension.value.toLowerCase().indexOf($query.toLowerCase()) !== -1;
            });
        };

        $scope.addDimensionFilter = function () {
            if ($scope.dimensionFilterModel.length > 5) {
                $rootScope.setErrAlertMessage(constants.REPORT_LIST_DIMENSION_COUNT);
                $scope.dimensionFilterModel.splice(5, 1);
            } else if ($scope.dimensionFilterModel[0].key === 'ALL') {
                // as it is always going to be the first element
                $scope.dimensionFilterModel.splice(0, 1);
            }

            return true;
        };

        $scope.removeDimensionFilter = function () {
            if ($scope.dimensionFilterModel.length === 0) {
                // insert all dimension as default
                $scope.dimensionFilterModel = [
                    {
                        key: 'ALL',
                        value: 'All Dimensions'
                    }
                ];
            }

            return true;
        };

        $scope.select_filter_option = function (key, value, e) {
            if (!e || e.keyCode === 13) {
                switch (key) {
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

                    for (i = 0; i < $scope.schdReportList.length; i++) {
                        $scope.scheduleInstCount[i] = $scope.noOfSchldInstToShow;
                        instances = $scope.schdReportList[i].instances;
                        instances.map(mapElCallback);
                    }
                },

                scheduleReportListError = function () {
                    $scope.showScheduleListLoader = false;
                },

                queryStr = '?clientId=' + vistoconfig.getMasterClientId();

            queryStr += _curCtrl.getFilterParam();

            $scope.showScheduleListLoader = true;
            collectiveReportModel.getScheduleReportList(scheduleReportListSucc, scheduleReportListError,
                vistoconfig.getMasterClientId(), queryStr);
        };

        $scope.reset_custom_report = function () {
            localStorage.removeItem('customReport');
            localStorageService.scheduleListReportType.remove();
            $scope.gotoCustomReportPage();
        };

        // Dropdown Auto Positioning
        $scope.redirect_or_open_2nd_dimension = function (event, index, reportId, freq) {
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

        $scope.downloadSchdReport = function (parentIndex, instanceIndex, instanceId) {
            $scope.reportDownloadBusy = true;

            dataService
                .downloadFile(urlService.downloadSchdRpt(vistoconfig.getMasterClientId(), instanceId))
                .then(function (response) {
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

            dataService
                .downloadFile(urlService.downloadSavedRpt(vistoconfig.getMasterClientId(), instanceId))
                .then(function (response) {
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

        // Delete scheduled report Pop up
        $scope.deleteSchdRpt = function (reportId, frequency) {
            $modal.open({
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

                                collectiveReportModel.deleteSavedReport(successFun, errorFun,
                                    vistoconfig.getMasterClientId(), reportId);
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

                                collectiveReportModel.deleteScheduledReport(successFun, errorFun,
                                    vistoconfig.getMasterClientId(), reportId);
                            }
                        };
                    }
                }
            });
        };

        // Delete scheduled report Pop up
        $scope.deleteSchdRptInstance = function (reportId, instanceId) {
            $modal.open({
                templateUrl: assets.html_delete_collective_report,
                controller: 'ReportScheduleDeleteController',
                scope: $scope,
                windowClass: 'delete-dialog',

                resolve: {
                    headerMsg: function () {
                        return constants.deleteReportHeader;
                    },

                    mainMsg: function () {
                        return 'Are you sure you want to delete instance of Scheduled Report';
                    },

                    deleteAction: function () {
                        var successFun,
                            errorFun;

                        return function () {
                            successFun = function (data) {
                                if (data.status_code === 200) {
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
                                .deleteScheduledReportInstance(successFun, errorFun, vistoconfig.getMasterClientId(),
                                    reportId, instanceId);
                        };
                    }
                }
            });
        };

        $scope.editSchdReport = function (reportId) {
            var url = '/a/' + $routeParams.accountId + '/customreport/edit/' + reportId;

            localStorageService.scheduleListReportType.set('scheduled');

            _.each($scope.schdReportList, function (item) {
                if (reportId === item.reportId && item.frequency === 'Saved') {
                    localStorageService.scheduleListReportType.set('Saved');
                }
            });

            $location.url(url);
        };

        $scope.copyScheduleRpt = function (reportId, frequency) {
            $modal.open({
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
                                    data.client_id = vistoconfig.getMasterClientId();

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
                                    data.client_id = vistoconfig.getMasterClientId();
                                    data.schedule = $scope.preFormatCopySchData(data.schedule);

                                    collectiveReportModel.createSchdReport(function () {
                                        $scope.refreshReportList();
                                        $rootScope.setErrAlertMessage('Schedule Report Copied Successfully', 0);
                                    }, function () {
                                        $rootScope.setErrAlertMessage('Error Copying Schedule Report');
                                    }, data.client_id, data);
                                };

                                copyError = function () {
                                    console.log('Copy error');
                                };

                                collectiveReportModel.getSchdRptDetail(copySuccess, copyError,
                                    vistoconfig.getMasterClientId(), reportId);
                            }
                        };
                    }
                }
            });
        };

        $scope.preFormatCopySchData = function (schData) {
            var o = $.extend({}, schData),
                diffDays;

            schData.startDate = momentService.newMoment(schData.startDate).format('YYYY-MM-DD');
            schData.endDate = momentService.newMoment(schData.endDate).format('YYYY-MM-DD');
            o.startDate = momentService.todayDate('YYYY-MM-DD');

            if (momentService.isSameOrAfter(schData.startDate, o.startDate)) {
                return schData;
            }

            if ($scope.valueWithDefault(schData,'frequency','') !== 'Once') {
                diffDays = momentService.dateDiffInDays(schData.startDate,schData.endDate);
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
            $modal.open({
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
                                .archiveSchdReport(archiveSuccess, archiveError, vistoconfig.getMasterClientId(),
                                    reportId, instanceId);
                        };
                    }
                }
            });
        };

        // Search Clear
        $scope.searchHideInput = function () {
            var inputSearch = $('.searchInputForm input');

            delete $scope.filters.searchText;
            isSearch = false;
            inputSearch.val('');
            $scope.creativeSearch = null;
            $scope.select_filter_option('reportName', '');
        };

        $scope.refreshReportList = function () {

            $scope.getScheduledReports();
        };

        $scope.gotoCustomReportPage = function() {
            $location.url(urlBuilder.customReportsUrl());
        };

        // SECTION FOR APPLYING FILTER IF THE APPROPRIATE QUERY PARAMS ARE PASSED IN THE URL.
        // If any query param is given, check if there's at least 1 valid query param.
        // URL & QUERY PARAM FORMAT: reports/schedules?report_name=reportnamestring&date_filter=datevalue
        // report_name values: Any string
        // date_filter values: yesterday, last_7_days, last_2_weeks, last_month, last_quarter
        // Example URL: reports/schedules?report_name=pattest&date_filter=last_7_days
        if (!(_.isEmpty(urlQueries))) {
            reportName = urlQueries.report_name;
            dateFilter = urlQueries.date_filter;

            if (reportName || dateFilter) {
                isValidQueryParamFilter = true;
            }

            // Perform filtering if valid query params are given
            if (isValidQueryParamFilter) {
                // Filter on filter name if it is given
                if (reportName) {
                    $timeout(function () {
                        angular
                            .element('.searchInput .searchInputBtn')
                            .triggerHandler('click');

                        angular.element('#creativeSearch').val(reportName);
                        $scope.select_filter_option('reportName', reportName);
                    }, 1);
                }

                // Filter on dateFilter only if valid param is given
                if (dateFilter in dateFiltersObj) {
                    dateFilter = dateFiltersObj[dateFilter];
                    $('button[data-target="#schedule_report_filter"]').trigger('click');
                    $scope.select_filter_option('generated', dateFilter);

                    $timeout(function () {
                        angular.element('#applyFilter').triggerHandler('click');
                    }, 1);
                }
            } else {
                // No valid params, get all reports
                $scope.displayName ? $scope.getScheduledReports() : _curCtrl.getmetaData();
            }
        } else {
            // No params given, get all reports
            $scope.displayName ? $scope.getScheduledReports() : _curCtrl.getmetaData();
        }
    });
});
