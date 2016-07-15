define(['angularAMD', 'reporting/campaignSelect/campaign_select_model', // jshint ignore:line
    'reporting/strategySelect/strategy_select_model', 'reporting/kpiSelect/kpi_select_model',
    'common/utils', 'common/services/data_service', 'common/services/request_cancel_service',
    'common/services/constants_service', 'reporting/timePeriod/time_period_model', 'common/moment_utils',
    'login/login_model', 'common/services/url_service', 'common/services/data_store_model',
    'reporting/models/domain_reports', 'common/services/vistoconfig_service', 'common/services/features_service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('CustomReportController', function ($routeParams, $rootScope, $scope, $route, $window,
                                                                 $timeout, $location, campaignSelectModel,
                                                                 strategySelectModel, kpiSelectModel, utils,
                                                                 dataService, requestCanceller, constants,
                                                                 timePeriodModel, momentService, loginModel,
                                                                 urlService, dataStore, domainReports, vistoconfig,
                                                                 featuresService, localStorageService) {
            var _customctrl = this,
                elem = $('#reportBuilderForm').find('.dropdown').find('.dd_txt'),
                winHeight = $(window).height(),
                isGenerateAlreadyCalled = false,

                metricKey1 = [
                    'dimension',
                    'delivery_metrics',
                    'cost_metrics',
                    'pacing_metrics',
                    'booked_metrics',
                    'video_metrics',
                    'quality_metrics'
                ],

                metricDataKey = [
                    'dimension',
                    'delivery_metrics',
                    'cost_metrics',
                    'pacing_metrics',
                    'booked_metrics',
                    'video_metrics',
                    'quality_data'
                ],

                metricsTab = [
                    'delivery',
                    'cost',
                    'video',
                    'quality',
                    'pacing'
                ],

                metricCategoryKeys = [
                    'delivery_metrics',
                    'cost_metrics',
                    'video_metrics',
                    'quality_metrics',
                    'pacing_metrics'
                ],

                metricVarKeys = [
                    'deliveryMetrics',
                    'costMetrics',
                    'videoMetrics',
                    'qualityMetrics',
                    'pacingMetrics'
                ],

                slideUp = function () {
                    $('#reportBuilderForm').slideUp(600);
                    $('#dynamicHeader > a > span').removeClass('icon-toggleopen').addClass('icon-toggleclose');
                    $('#dynamicHeader').addClass('smaller');
                },

                slideDown = function () {
                    $('#reportBuilderForm').slideDown(600);
                    $('#dynamicHeader > a > span').removeClass('icon-toggleclose').addClass('icon-toggleopen');
                },

                validateGenerateReport = function () {
                    if ((localStorageService.scheduleListReportType.get() !== 'Saved') &&
                        ($scope.reportTypeSelect !== 'Save')) {
                        if (!_customctrl.enableGenerateButton()) {
                            $scope.generateBtnDisabled = true;
                            $('.custom_report_filter').closest('.breakdown_div').find('.filter_input_txtbox').hide();

                            return false;
                        }

                        if (momentService.dateDiffInDays($scope.reports.reportDefinition.timeframe.start_date,
                                $scope.reports.reportDefinition.timeframe.end_date) < 0) {
                            $scope.generateBtnDisabled = false;

                            return setFlashMessage(constants.timeFrameStartDateGreater, 1, 0);
                        }

                        return true;
                    } else {
                        return true;
                    }
                },

                setFlashMessage = function (message, isErrorMsg, isMsg) {
                    $rootScope.setErrAlertMessage(message, isErrorMsg, isMsg);
                    return false;
                };

            function attachScrollToWindow() {
                $(window).scroll(function () {
                    if (!$scope.fetching && (($(window).scrollTop() + $(window).height()) >=
                        $(document).height() - 100)) {
                        _customctrl.loadMoreItems();
                    }
                });
            }

            function isValidDate(dateToValidate) {
                var dateToValidateArr = dateToValidate.split('-'),
                    dateToValidateY = dateToValidateArr[0],
                    dateToValidateM = dateToValidateArr[1],
                    dateToValidateD = dateToValidateArr[2],
                    daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                if ((!(dateToValidateY % 4) && dateToValidateY % 100) || // jshint ignore:line
                    !(dateToValidateY % 400)) { // jshint ignore:line
                    daysInMonth[1] = 29;
                }

                return dateToValidateD <= daysInMonth[--dateToValidateM];
            }

            $('.custom_response_screenshot_container').css('min-height', winHeight - 464);

            $scope.additionalFilters = [];
            $scope.textConstants = constants;
            $scope.additionalValue = 'Contains keywords ...';

            $scope.dataNotFound = false;
            $scope.reportDataBusy = false;
            $scope.loadingBtn = false;
            $scope.activeTab = 'delivery_metrics';
            $scope.filters = domainReports.getReportsTabs();
            $scope.count = 0;
            $scope.secondDimensionReportLoading = {};
            $scope.secDimensionLoadMore = {};
            $scope.secDimensionLoadIcon = {};
            $scope.secondDimensionReportDataNotFound = {};
            $scope.metrics_text = 'Default';
            $scope.generateBtnDisabled = true;
            $scope.reports = {};
            $scope.reports.reportDefinition = {};
            $scope.reports.schedule = {};
            $scope.reports.reportDefinition.timeframe = {};

            $scope.reports.reportDefinition.timeframe.start_date = moment() // jshint ignore:line
                .subtract(1, 'day')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.reports.reportDefinition.timeframe.end_date = moment() // jshint ignore:line
                .subtract(1, 'day')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.reports.reportDefinition.metrics = {};
            $scope.reports.reportDefinition.filters = [];
            $scope.reports.reportDefinition.dimensions = {};
            $scope.selectedMetricsList = [];

            $scope.reports.reportDefinition.dimensions.primary = {
                name: '',
                dimension: '',
                value: ''
            };

            $scope.reports.reportDefinition.dimensions.secondary = {
                name: '',
                dimension: '',
                value: ''
            };

            $scope.reports.schedule.startDate = moment() // jshint ignore:line
                .subtract(0, 'days')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.reports.schedule.endDate = moment() // jshint ignore:line
                .subtract(0, 'days')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.scheduleReportActive = false;
            $scope.notInRange = false;
            $scope.notInRangeMonthly = false;
            $scope.showPrimaryTxtBox = false;
            $scope.showSecondaryTxtBox = false;
            $scope.showSecondDimensionBlock = false;
            $scope.showAddBreakdownButton = false;
            $scope.updateScheduleReport = false;
            $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
            $scope.buttonResetCancel = $scope.textConstants.RESET_LABEL;
            $scope.stopRedirectingPage = true;
            $scope.reportTypeSelect = $scope.textConstants.SAVE_LABEL;
            $scope.isSavedReportGen = false;
            $scope.showCost = true;
            $scope.showQuality = true;

            $scope.showPlatform = true;
            $scope.showInventory = true;
            $scope.showPerformance = true;

            if ($scope.isSavedReportGen === true) {
                $('#dynamicHeader').addClass('smaller');
            }

            // Sorting of report data
            $scope.sortReverse = false;
            $scope.sortType = 'value';

            $scope.clickToSort = function (dm) {
                $scope.sortType = dm;
                $scope.sortReverse = !$scope.sortReverse;
            };

            $scope.addReqClassToSort = function (dm, b, c) {
                var isActive = (dm === b) ? 'active' : '',
                    sortDirection = (c === true) ? 'sort_order_up' : 'sort_order_down';

                return isActive + ' ' + sortDirection;
            };

            _customctrl.setCustomMetrics = function (data) {
                $scope.customMetricsInit = {};
                $scope.customMetrics = [];

                _.each(data, function (key) { // jshint ignore:line
                    $scope.customMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalCustomMetrics = $scope.customMetrics.length;
                $scope.customMetrics.isAllSelected = false;
                $scope.customMetrics.minOneSelected = false;
            };

            $scope.initializeMetrics = function (dataObj, selectedDim) {
                var metricsData,
                    pacingMetricData,
                    qualityMetricsData;

                selectedDim = $scope.reports.reportDefinition.dimensions.primary.dimension;

                metricsData = dataObj.dim_specific_metrics.hasOwnProperty(selectedDim) ?
                    dataObj.dim_specific_metrics[selectedDim] : dataObj.metrics;

                $scope.deliveryMetricsView = metricsData.delivery_metrics;
                $scope.deliveryMetrics = [];

                _.each($scope.deliveryMetricsView, function (key) { // jshint ignore:line
                    $scope.deliveryMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalDeliveryMetrics = $scope.deliveryMetrics.length;
                $scope.deliveryMetrics.isAllSelected = false;
                $scope.deliveryMetrics.minOneSelected = false;

                //cost metrics
                $scope.costMetricsView = metricsData.cost_metrics;
                $scope.costMetrics = [];

                _.each($scope.costMetricsView, function (key) { // jshint ignore:line
                    $scope.costMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalCostMetrics = $scope.costMetrics.length;
                $scope.costMetrics.isAllSelected = false;
                $scope.costMetrics.minOneSelected = false;

                // pacing metrics
                pacingMetricData = metricsData.pacing_metrics;
                $scope.pacingMetrics = [];

                _.each(pacingMetricData, function (key) { // jshint ignore:line
                    $scope.pacingMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalPacingMetrics = $scope.pacingMetrics.length;
                $scope.pacingMetrics.isAllSelected = false;
                $scope.pacingMetrics.minOneSelected = false;

                // video metrics
                $scope.videoMetricsView = metricsData.video_metrics;
                $scope.videoMetrics = [];

                _.each($scope.videoMetricsView, function (key) { // jshint ignore:line
                    $scope.videoMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalVideoMetrics = $scope.videoMetrics.length;
                $scope.videoMetrics.isAllSelected = false;
                $scope.videoMetrics.minOneSelected = false;

                // Quality metrics
                qualityMetricsData = metricsData.quality_metrics;
                $scope.qualityMetrics = [];

                _.each(qualityMetricsData, function (key) { // jshint ignore:line
                    $scope.qualityMetrics.push({
                        key: key,
                        value: $scope.displayName[key],
                        selected: false
                    });
                });

                $scope.totalQualityMetrics = $scope.qualityMetrics.length;
                $scope.qualityMetrics.isAllSelected = false;
                $scope.qualityMetrics.minOneSelected = false;

                $scope.totalMetrics = $scope.totalDeliveryMetrics + $scope.totalCostMetrics +
                    $scope.totalVideoMetrics + $scope.totalQualityMetrics + $scope.totalPacingMetrics;
            };

            $scope.setMetrixText = function (text) {
                text = ($scope.totalMetrics === $scope.selectedMetricsList.length) ? 'Default' : text;
                $scope.metrics_text = text + '(' + $scope.selectedMetricsList.length + ')';
            };

            $scope.reports.client_id = loginModel.getMasterClient().id;

            $('.main_navigation')
                .find('.active')
                .removeClass('active')
                .end()
                .find('#reports_nav_link')
                .addClass('active');

            $scope.showSecondDimension = function () {
                $scope.showSecondDimensionBlock = !$scope.showSecondDimensionBlock;
                $scope.showAddBreakdownButton = false;
            };

            $scope.deleteSecondDimensionBlock = function () {
                $scope.showSecondDimensionBlock = false;

                $scope.reports.reportDefinition.dimensions.secondary = {
                    name: '',
                    dimension: '',
                    value: ''
                };

                $scope.showAddBreakdownButton = true;
            };

            $scope.getMessageForDataNotAvailable = function () {
                return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
            };

            $scope.resetFlashMessage = function () {
                $rootScope.setErrAlertMessage('', 0);
            };

            _customctrl.getDimensionList = function (data, selectedMetrics) {
                var selectedDim,
                    metricsCategorizedKey,
                    arr;

                $scope.selectedDimension = elem.text();
                selectedDim = $scope.reports.reportDefinition.dimensions.primary.dimension;

                $scope.metricKeyArr = {};

                if ($scope.selectedMetricsList.length < $scope.totalMetrics) {
                    metricsCategorizedKey = angular.copy(data.metrics); // jshint ignore:line

                    _.each(selectedMetrics, function (selMet) { // jshint ignore:line
                        _.each(metricCategoryKeys, function (metrCatKey) { // jshint ignore:line
                            if ($scope.metricKeyArr[metrCatKey] === undefined) { // jshint ignore:line
                                $scope.metricKeyArr[metrCatKey] = [];
                            }

                            if (_.indexOf(metricsCategorizedKey[metrCatKey], selMet.key) >= 0) { // jshint ignore:line
                                $scope.metricKeyArr[metrCatKey].push({
                                    key: selMet.key,
                                    value: selMet.value
                                });
                            }
                        });
                    });
                } else {
                    // when all the metrics is selected
                    arr = angular.copy(data.dim_specific_metrics.hasOwnProperty(selectedDim) ? // jshint ignore:line
                        data.dim_specific_metrics[selectedDim] : data.metrics);

                    _.each(metricKey1, function (v) { // jshint ignore:line
                        $scope.metricKeyArr[v] = [];

                        _.each(arr[v], function (o) { // jshint ignore:line
                            $scope.metricKeyArr[v].push({
                                key: o,
                                value: $scope.displayName[o]
                            });
                        });
                    });
                }
            };

            _customctrl.getDataBasedOnTabSelected = function (activeTab, typeofDimension, currIdx) {
                var tmpObj = {},
                    activeTabDataObj,
                    data,
                    tabData;

                typeofDimension = typeofDimension || 'first_dimension';
                tmpObj[typeofDimension] = {};

                if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                    tmpObj[typeofDimension][currIdx] = {};
                    activeTabDataObj = tmpObj[typeofDimension][currIdx][activeTab] = [];
                    data = $scope.reportMetaData[typeofDimension][currIdx];
                } else {
                    activeTabDataObj = tmpObj[typeofDimension][activeTab] = [];
                    data = $scope.reportMetaData[typeofDimension];
                }

                _.each(data, function (d, index) { // jshint ignore:line
                    d.dimension.level = typeofDimension;
                    d.dimension.idx = index;
                    tabData = d[activeTab];
                    _.extend(tabData, d.dimension); // jshint ignore:line
                    activeTabDataObj.push(tabData);
                });

                $.extend(true, $scope.metricValues, tmpObj);
            };

            _customctrl.getMetricValues = function (newData, selectedMetrics, typeofDimension, currIdx, loadMore) {
                var found = false;

                if (!$scope.reportMetaData.hasOwnProperty(typeofDimension)) {
                    $scope.reportMetaData[typeofDimension] = [];
                }

                if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                    if (!$scope.reportMetaData[typeofDimension].hasOwnProperty(currIdx) || loadMore === undefined) {
                        $scope.reportMetaData[typeofDimension][currIdx] = [];
                    }
                }

                _.each(newData, function (d) { // jshint ignore:line
                    _.each(metricDataKey, function (mkey) { // jshint ignore:line
                        if (mkey !== 'dimension') {
                            _.each(d[mkey], function (value, key) { // jshint ignore:line
                                found = false;

                                _.each(selectedMetrics, function (selMetItem) { // jshint ignore:line
                                    if (selMetItem.key === key) {
                                        found = true;
                                    }
                                });

                                if (!found) {
                                    delete d[mkey][key];
                                }
                            });
                        }
                    });

                    if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                        $scope.reportMetaData[typeofDimension][currIdx].push(d);
                    } else {
                        $scope.reportMetaData[typeofDimension].push(d);
                    }
                });

                _customctrl.getDataBasedOnTabSelected($scope.activeTab, typeofDimension, currIdx);
            };

            _customctrl.getSelectedAdditionalFilter = function () {
                var filterArr = [],
                    elem = $('.custom_filter_breakdown');

                _.each(elem, function (el) { // jshint ignore:line
                    var fdimesnion = $.trim($(el).find('.dropdown_ul_text .dd_txt').attr('id')),
                        ftext = $(el).find('.reportFilter').val(),
                        fstr = (fdimesnion + (ftext ? (':' + ftext) : ''));

                    filterArr.push(fstr);
                });

                filterArr = _.filter(filterArr, function (val) { // jshint ignore:line
                    return val !== 'Choose filter';
                });

                return filterArr.join('~');
            };

            _customctrl.getTimeFrame = function () {
                var dateWrapper = $('.dateWrapper').find('.timeframe');

                return '&start_date=' + dateWrapper[0].value + '&end_date=' + dateWrapper[1].value;
            };

            _customctrl.enableGenerateButton = function () {
                if (!$scope.scheduleReportActive) {
                    if (localStorageService.scheduleListReportType.get() !== 'Saved') {
                        $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
                    }
                }

                return $('.dimension_block').find('.dd_txt').text() !== 'Choose Dimension';
            };

            $scope.saveSchedule = function () {
                var reportType = localStorageService.scheduleListReportType.get();

                if ((reportType === 'Saved') && ($scope.reportTypeSelect === 'Save')) {
                    $scope.buttonLabel = 'Update';
                } else if ((reportType === 'scheduled') && ($scope.reportTypeSelect === 'Schedule As')) {
                    $scope.buttonLabel = 'Update';
                } else {
                    $scope.buttonLabel = $scope.reportTypeSelect;
                }
            };

            _customctrl.createMetricRequestParams = function (params) {
                var metricsString = '';

                if ($scope.totalMetrics === $scope.selectedMetricsList.length) {
                    metricsString = 'all';
                } else {
                    _.each(metricsTab, function (mtab) { // jshint ignore:line
                        if ($scope[mtab + 'Metrics'].isAllSelected) {
                            metricsString += mtab + '_metrics:all';
                            metricsString += '~';
                        } else if ($scope[mtab + 'Metrics'].minOneSelected) {
                            metricsString += mtab + '_metrics:';

                            _.each($scope[mtab + 'Metrics'], function (eachObj) { // jshint ignore:line
                                if (eachObj.selected) {
                                    metricsString += eachObj.key + ',';
                                }
                            });

                            metricsString = metricsString.replace(/,\s*$/, '');
                            metricsString += '~';
                        }
                    });
                }

                metricsString = metricsString.replace(/~\s*$/, '');
                params += '&metric_list=' + metricsString;

                return params;
            };

            _customctrl.createRequestParams = function (filterText, offset, isPrimary, rowIndex_2D, dataFormat) {
                var params,
                    dimensionDataKey = isPrimary ? 'primary' : 'secondary',
                    filterDataKey = isPrimary ? 'secondary' : 'primary',
                    str = $scope.reports.reportDefinition.dimensions[dimensionDataKey].dimension,
                    pos;

                if (isPrimary) {
                    $scope.reportTitle = $scope.reports.reportDefinition.dimensions[dimensionDataKey].name;
                }

                $scope.isReportForMultiDimension = false;

                if ($scope.reports.reportDefinition.dimensions[dimensionDataKey].value) {
                    str += ':' + $scope.reports.reportDefinition.dimensions[dimensionDataKey].value;
                }

                if ($scope.reports.reportDefinition.dimensions[filterDataKey].dimension) {
                    $scope.isReportForMultiDimension = true;

                    if (isPrimary) {
                        $scope.reportTitle += ' by ' + $scope.reports.reportDefinition.dimensions[filterDataKey].name;
                    }

                    str += ((dataFormat && dataFormat === 'csv') ? '&second_dim=' : '&first_dim_filter=') +
                        $scope.reports.reportDefinition.dimensions[filterDataKey].dimension;

                    if ($scope.reports.reportDefinition.dimensions[filterDataKey].value && isPrimary) {
                        str += ':' + $scope.reports.reportDefinition.dimensions[filterDataKey].value;
                    }

                    if (typeof filterText !== 'undefined' &&
                        filterText !== null &&
                        filterText !== '' &&
                        str.search(filterText.trim()) === -1) {
                        str += ':' + filterText;
                    }
                }

                if ($scope.additionalFilters.length > 0) {
                    if (str.search('&filter') === -1) {
                        str += '&filter=';
                    } else {
                        str += '~';
                    }

                    _.each($scope.additionalFilters, function (eachObj) { // jshint ignore:line
                        str += eachObj.key;

                        if (eachObj.value) {
                            str += ':' + eachObj.value;
                        }

                        str += '~';
                    });

                    pos = str.lastIndexOf('~');
                    str = str.substring(0, pos);
                }

                if (!isPrimary) {
                    str += '&exact_match=true';
                }

                // timeframe
                str += '&start_date=' + $scope.reports.reportDefinition.timeframe.start_date + '&end_date=' +
                    $scope.reports.reportDefinition.timeframe.end_date;

                params = 'dimension=' + str + '&page_num=' + (isPrimary ? _customctrl.reportPageNum_1D :
                        _customctrl.reportPageNum_2D[$scope.activeTab][rowIndex_2D]);

                params = _customctrl.createMetricRequestParams(params);

                return params;
            };

            _customctrl.errorHandler = function () {
                $scope.reportDataLoading = false;
                $scope.reportDataNotFound = true;
                $scope.generateBtnDisabled = false;
            };

            _customctrl.fetchReportData = function (selectedMetricsList, params, idx, sucessCallbackHandler,
                                                    errorCallbackHandler) {
                var dropdownElem = $('#reportBuilderForm'),
                    reportId = dropdownElem.find('.dd_txt').attr('data-template_id');

                $scope.generateBtnDisabled = true;

                dataService
                    .getCustomReportData(reportId, params)
                    .then(function (result) {
                        requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);

                        if (result && result.data.data) {
                            sucessCallbackHandler(result.data.data, idx);
                        } else {
                            errorCallbackHandler(idx);
                        }
                    }, function (idx) {
                        errorCallbackHandler(idx);
                    });
            };

            _customctrl.getReportData = function () {
                _customctrl
                    .fetchReportData($scope.selectedMetricsList, _customctrl
                    .createRequestParams(null, $scope.firstDimensionoffset, 1), null, function (respData) {
                        $scope.fetching = false;
                        $scope.generateBtnDisabled = false;
                        _customctrl.isReportLastPage_1D = respData.last_page;
                        respData = respData.report_data;

                        if (respData && respData.length > 0) {
                            if (localStorageService.scheduleListReportType.get() === 'Saved' ||
                                $scope.buttonLabel === 'Generate') {
                                slideUp();
                                $('#dynamicHeader').addClass('smaller');
                            }

                            $scope.reportDataLoading = false;
                            $scope.reportDataNotFound = false;

                            if ($scope.isReportForMultiDimension) {
                                $scope.showhasBreakdown = 'hasBreakdown';
                            }

                            _.each(respData, function () { // jshint ignore:line
                                _customctrl.isReportLastPage_2D[$scope.activeTab].push(false);
                                _customctrl.reportPageNum_2D[$scope.activeTab].push(1);
                            });

                            _customctrl.getMetricValues(respData, $scope.selectedMetricsList, 'first_dimension');
                            attachScrollToWindow();
                        } else {
                            if (_customctrl.reportPageNum_1D === 1) {
                                _customctrl.errorHandler();
                            }
                        }
                    }, function () {
                        _customctrl.errorHandler();

                        if (_customctrl.reportPageNum_1D === 1) {
                            _customctrl.errorHandler();
                        }
                    });
            };

            _customctrl.resetReportDataCnt = function () {
                var metricsInTabOrder = [
                        'delivery',
                        'cost',
                        'video',
                        'quality',
                        'pacing'
                    ],
                    firstTabDetected = false;

                _.each(metricsInTabOrder, function (mTab) { // jshint ignore:line
                    var customReportResponseTabs;

                    if (($scope[mTab + 'Metrics'].minOneSelected) && !firstTabDetected) {
                        firstTabDetected = true;
                        $('.custom_report_response_table').hide();
                        $('#' + mTab + '_table').show();
                        customReportResponseTabs = $('.custom_report_response_tabs');
                        customReportResponseTabs.find('.each_tab').removeClass('active');
                        customReportResponseTabs.find('#' + mTab + '_tab').addClass('active');
                        $scope.activeTab = mTab + '_metrics';

                        $('.custom_report_response_page .custom_report_response_table .custom_report_scroll ' +
                            '.heading_row').css('left', '0');
                    }
                });
            };

            $scope.generateReport = function () {
                var str;

                if (validateGenerateReport()) {
                    _customctrl.resetReportDataCnt();

                    if ((!isGenerateAlreadyCalled)) {
                        isGenerateAlreadyCalled = true;
                    }

                    $scope.generateBtnDisabled = false;
                    $scope.metricValues = [];
                    $scope.reportMetaData = {};
                    $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
                    $scope.hideReportsTabs = false;
                    $scope.reportDataNotFound = false;
                    $scope.showhasBreakdown = '';
                    $scope.reportDataLoading = true;
                    $scope.fetching = false;
                    $(window).unbind('scroll');
                    $('.img_table_container').hide();
                    $('.custom_report_response_page').show();

                    $('.hasBreakdown')
                        .removeClass('active')
                        .removeClass('treeOpen')
                        .removeClass('noDataOpen')
                        .addClass('manny');

                    $('html, body').animate({
                        scrollTop: 0
                    });

                    _customctrl.reset();
                    _customctrl.createJSONforPage($scope.activeTab);
                    _customctrl.getDimensionList($scope.customeDimensionData[0], $scope.selectedMetricsList);
                    _customctrl.getReportData();
                    _customctrl.inputDataOnGenerate = JSON.parse(JSON.stringify($scope.reports.reportDefinition));

                    str = $scope.reports.reportDefinition.dimensions.primary.dimension + ':' +
                        $scope.reports.reportDefinition.dimensions.primary.value + '&';

                    if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                        str += '&filter=' + $scope.reports.reportDefinition.dimensions.secondary.dimension +
                            ':' + $scope.reports.reportDefinition.dimensions.secondary.value + '&';
                    }

                    if ($scope.additionalFilters.length > 0) {
                        _.each($scope.additionalFilters, function (eachObj) { // jshint ignore:line
                            str += eachObj.key + ':' + eachObj.value + '&';
                        });
                    }
                }
            };

            $scope.createData = function (isIntermediateSave) {
                $scope.requestData = {};
                $scope.requestData.reportDefinition = {};
                $scope.requestData.schedule = {};
                $scope.requestData.reportDefinition.timeframe = {};
                $scope.requestData.reportDefinition.metrics = {};
                $scope.requestData.reportDefinition.filters = [];
                $scope.requestData.reportDefinition.dimensions = [];
                $scope.requestData.name = '';
                $scope.requestData.client_id = loginModel.getMasterClient().id;
                $scope.requestData.name = $scope.reports.name;
                $scope.requestData.reportDefinition.timeframe = $scope.reports.reportDefinition.timeframe;
                $scope.requestData.reportDefinition.metrics = $scope.reports.reportDefinition.metrics;
                $scope.requestData.schedule = $scope.reports.schedule;
                $scope.requestData.isScheduled = $scope.scheduleReportActive;

                if ($scope.reportTypeSelect === 'Save') {
                    if (!$scope.reports.schedule) {
                        $scope.reports.schedule = {};
                    }

                    $scope.reports.schedule.occurance = '';
                } else {
                    $scope.requestData.schedule.occurance = $scope.reports.schedule.occurance;
                }

                $scope.requestData.reportDefinition.dimensions.push({
                    dimension: $scope.reports.reportDefinition.dimensions.primary.dimension,
                    type: 'Primary'
                });

                if ($scope.reports.reportDefinition.dimensions.primary.value || isIntermediateSave) {
                    $scope.requestData.reportDefinition.filters.push({
                        dimension: $scope.reports.reportDefinition.dimensions.primary.dimension,
                        type: 'Primary',
                        values: $scope.reports.reportDefinition.dimensions.primary.value
                    });
                }

                if ($scope.valueWithDefault($scope.reports.schedule, 'frequency') === 'Once') {
                    $scope.reports.schedule.endDate = $scope.reports.schedule.startDate;
                }

                if ($scope.reports.reportDefinition.dimensions.secondary.name) {
                    $scope.requestData.reportDefinition.dimensions.push({
                        dimension: $scope.reports.reportDefinition.dimensions.secondary.dimension,
                        type: 'Secondary'
                    });
                }

                if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                    $scope.requestData.reportDefinition.filters.push({
                        dimension: $scope.reports.reportDefinition.dimensions.secondary.dimension,
                        type: 'Secondary',
                        values: $scope.reports.reportDefinition.dimensions.secondary.value
                    });
                }

                _.each($scope.additionalFilters, function (eachObj) { // jshint ignore:line
                    if (eachObj.value) {
                        $scope.requestData.reportDefinition.filters.push({
                            dimension: eachObj.key,
                            type: 'Additional',
                            values: eachObj.value
                        });
                    } else if (isIntermediateSave) {
                        // if a filter key is selected then show it with the input box
                        $scope.requestData.reportDefinition.filters.push({
                            dimension: eachObj.key,
                            type: 'Additional'
                        });
                    }
                });

                if ($scope.reportTypeSelect === 'Schedule As') {
                    if (!$scope.reports.schedule.customOccuranceDate) {
                        $scope.reports.schedule.customOccuranceDate = '';
                        $scope.requestData.schedule.customOccuranceDate = '';
                    }
                }

                return $scope.requestData;
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

            $scope.verifyReportInputs = function () {
                var str = $scope.reports.name,
                    startDate,
                    endDate,
                    occursOn,
                    startDateArr,
                    endDateArr,
                    endDateMonth,
                    occursOnMonth,
                    occursOnYear,
                    occursOnDate,
                    noOfMonths,
                    isError,
                    i;

                if ($scope.generateBtnDisabled) {
                    return false;
                }

                if (!$scope.reports.name) {
                    return setFlashMessage(constants.requiredRptName, 1, 0);
                }

                if (/^[A-Za-z ][A-Za-z0-9: ]*$/.test(str) === false || $scope.reports.name === undefined) {
                    return setFlashMessage(constants.reportNameErrorMsg, 1, 0);
                }

                if (($scope.reports.reportDefinition.timeframe.start_date === undefined) ||
                    ($scope.reports.reportDefinition.timeframe.end_date === undefined)) {
                    return setFlashMessage(constants.requiredTimeFrameDates, 1, 0);
                }

                if (momentService.dateDiffInDays($scope.reports.reportDefinition.timeframe.start_date,
                        $scope.reports.reportDefinition.timeframe.end_date) < 0) {
                    return setFlashMessage(constants.timeFrameStartDateGreater, 1, 0);
                }

                if ($scope.reportTypeSelect !== 'Save') {
                    if (!$scope.reports.name || !$scope.reports.schedule.frequency) {
                        return setFlashMessage(constants.requiredRptNameFreq, 1, 0);
                    }

                    if ($scope.notInRange === true) {
                        return setFlashMessage(constants.dateRangeWeek, 1, 0);
                    }

                    if ($scope.notInRangeMonthly === true) {
                        return setFlashMessage(constants.dateRangeMonthly, 1, 0);
                    }

                    if ($scope.selectedMetricsList.length <= 0) {
                        return setFlashMessage(constants.minOneMetric, 1, 0);
                    }

                    if ((($scope.reports.schedule.frequency === 'Weekly') ||
                        ($scope.reports.schedule.frequency === 'Monthly')) &&
                        ($scope.reports.schedule.occurance === '' ||
                        $scope.reports.schedule.occurance === undefined)) {
                        return setFlashMessage(constants.selectOccursOn, 1, 0);
                    }

                    if (($scope.reports.schedule.frequency === 'Monthly') &&
                        $scope.reports.schedule.occurance === 'Custom' &&
                        ($scope.reports.schedule.customOccuranceDate === undefined)) {
                        return setFlashMessage(constants.selectDate, 1, 0);
                    }

                    if (($scope.reports.schedule.frequency === 'Monthly') &&
                        $scope.reports.schedule.occurance === 'Custom') {
                        startDate = $scope.reports.schedule.startDate;
                        endDate = $scope.reports.schedule.endDate;
                        occursOn = $scope.reports.schedule.customOccuranceDate;

                        startDateArr = startDate.split('-');
                        endDateArr = endDate.split('-');

                        occursOnMonth = startDateArr[1];
                        endDateMonth = endDateArr[1];
                        occursOnYear = startDateArr[0];
                        noOfMonths = endDateMonth - occursOnMonth;

                        isError = false;
                        i = 0;

                        do {
                            if ((startDateArr[0] !== endDateMonth[0]) && (occursOnMonth === 12)) {
                                occursOnYear++;
                            }

                            if ((i > 0)) {
                                occursOnMonth++;
                            }

                            occursOnDate = occursOnYear + '-' + occursOnMonth + '-' + occursOn;

                            if (isValidDate(occursOnDate)) {
                                return true;
                            } else {
                                isError = true;
                            }

                            noOfMonths--;
                            i++;
                        } while ((noOfMonths >= 1));

                        if (isError) {
                            return setFlashMessage(constants.CUSTOMDATE_ERROR_MESSAGE, 1, 0);
                        }

                        return true;
                    }

                    return true;
                } else {
                    return true;
                }
            };

            $scope.scheduleReport = function () {
                if ($scope.verifyReportInputs()) {
                    dataService
                        .createScheduleReport($scope.createData())
                        .then(function (result) {
                            if (result.data.status_code === 200) {
                                $rootScope.setErrAlertMessage('Success: The scheduled Report is listed.', 0);
                                $location.url('/reports/schedules');
                            }
                        });
                }
            };

            $scope.saveReport = function () {
                var newObjNoSched,
                    key;

                if ($scope.verifyReportInputs()) {
                    newObjNoSched = $scope.createData();
                    key = 'schedule';
                    delete newObjNoSched[key];
                    $scope.isSavedReportGen = true;

                    dataService
                        .createSaveReport(newObjNoSched)
                        .then(function (result) {
                            if (result.data.status_code === 200) {
                                $rootScope.setErrAlertMessage('Success: The Saved Report is listed.', 0);
                                slideUp();
                            }
                        });
                }
            };

            $scope.downloadCreateRepBuilder = function (parentIndex, instanceIndex) {
                var dropdownElem = $('#reportBuilderForm'),
                    reportId = dropdownElem.find('.dd_txt').attr('data-template_id'),
                    params = _customctrl.createRequestParams(null, $scope.firstDimensionoffset, 1, 0, 'csv');

                $scope.reportDownloadBusy = true;

                dataService
                    .downloadFile(urlService.downloadGeneratedRpt(reportId), 'POST', params, {
                        'Content-Type': 'text/plain'
                    })
                    .then(function (response) {
                        if (response.status === 'success') {
                            saveAs(response.file, response.fileName); // jshint ignore:line
                            $scope.reportDownloadBusy = false;
                            $scope.schdReportList[parentIndex].instances[instanceIndex].viewedOn =
                                momentService.reportDateFormat();
                        } else {
                            $scope.reportDownloadBusy = false;
                            $rootScope.setErrAlertMessage('File couldn\'t be downloaded');
                        }
                    });
            };

            $scope.enable_generate_btn = function () {
                if (_customctrl.enableGenerateButton()) {
                    $scope.generateBtnDisabled = false;
                } else {
                    $scope.generateBtnDisabled = true;
                    $('.custom_report_filter').closest('.breakdown_div').find('.filter_input_txtbox').hide();
                    $('#reportBuilderForm').find('.filter_input_txtbox').hide();
                }
            };

            _customctrl.loadMoreItems = function () {
                $scope.firstDimensionoffset += $scope.limit;

                if (!_customctrl.isReportLastPage_1D) {
                    $scope.fetching = true;
                    _customctrl.reportPageNum_1D += 1;
                    _customctrl.getReportData();
                }
            };

            _customctrl.hideSecondDimensionData = function (firtDimensionElem, secondDimensionElem) {
                secondDimensionElem.hide();
                firtDimensionElem.removeClass('active treeOpen noDataOpen');
                firtDimensionElem.find('.more_dimension_arrow').addClass('icon-toggleclose');
            };

            $scope.fetchMoreSecondDimensionData = function (ev, value, rowIndex, loadMore) {
                _customctrl.reportPageNum_2D[$scope.activeTab][rowIndex] += 1;
                $scope.showDataForClikedDimension(ev, value, rowIndex, loadMore);
            };

            _customctrl.isInputsChangedAfterGenerate = function (oldJSON, newJSON) {
                var retVal = false,
                    hasDim = false;

                if (oldJSON.dimensions.hasOwnProperty('primary')) {
                    _.each(newJSON.dimensions, function (item) { // jshint ignore:line
                        if (item.type === 'Primary') {
                            hasDim = true;

                            if (oldJSON.dimensions.primary.dimension !== item.dimension ||
                                oldJSON.dimensions.primary.value && oldJSON.dimensions.primary.value !==
                                $scope.reports.reportDefinition.dimensions.primary.value) {
                                retVal = true;
                            }
                        }
                    });

                    if (!hasDim) {
                        retVal = true;
                    }
                }

                if (oldJSON.dimensions.hasOwnProperty('secondary')) {
                    hasDim = false;

                    _.each(newJSON.dimensions, function (item) { // jshint ignore:line
                        if (item.type === 'Secondary') {
                            hasDim = true;

                            if (oldJSON.dimensions.secondary.dimension !== item.dimension ||
                                oldJSON.dimensions.secondary.value &&
                                oldJSON.dimensions.secondary.value !==
                                $scope.reports.reportDefinition.dimensions.secondary.value) {
                                retVal = true;
                            }
                        }
                    });

                    if (!hasDim) {
                        retVal = true;
                    }
                }

                return retVal;
            };

            $scope.deepLinking = (function () {
                return {
                    mediaplan: function (dimension, curRowIndx, curSecDimIndx) {
                        var mediaPlanId;

                        if (dimension === 'first_dimension') {
                            mediaPlanId = $scope.reportMetaData[dimension][curRowIndx].dimension.id;
                        } else {
                            mediaPlanId = $scope.reportMetaData[dimension][curRowIndx][curSecDimIndx].dimension.id;
                        }

                        if (mediaPlanId && $scope.isMediaPlanAccessible) {
                            $location.url('mediaplan/' + mediaPlanId + '/overview');
                        }

                        return false;
                    },

                    ad: function (dimension, curRowIndx, curSecDimIndx) {
                        var dataObj,
                            adGroupId,
                            mediaPlanId,
                            adId,
                            lineItemId;

                        if (dimension === 'first_dimension') {
                            dataObj = $scope.reportMetaData[dimension][curRowIndx].dimension;
                        } else {
                            dataObj = $scope.reportMetaData[dimension][curRowIndx][curSecDimIndx].dimension;
                        }

                        adGroupId = dataObj.ad_group_id;
                        mediaPlanId = dataObj.campaign_id;
                        adId = dataObj.id;
                        lineItemId = dataObj.lineitem_id;

                        if ((adGroupId !== -1) &&
                            (mediaPlanId !== -1) && (adId !== -1) && (lineItemId !== -1) &&
                            ($scope.isAdAccessible)) {
                            $location.url('mediaplan/' + mediaPlanId +
                                '/lineItem/' + lineItemId +
                                '/adGroup/' + adGroupId +
                                '/ads/' + adId +
                                '/edit');
                        }
                    },

                    setSubAccount: function (id, name) {
                        loginModel.setSelectedClient({
                            id: id,
                            name: name
                        });
                    },

                    routeToLink: function (ev, dimension, curSecDimIndx) {
                        var currFirtDimensionElem = $(ev.target).parents('.reportData'),
                            currentRowIndex = Number(currFirtDimensionElem.attr('data-result-row')),
                            metricObj = $scope.metricValues.first_dimension[$scope.activeTab][currentRowIndex],
                            subAccountId,
                            subAccountName;

                        if (dimension === 'first_dimension') {
                            subAccountId = $scope.reportMetaData[dimension][currentRowIndex].dimension.client_id;
                            subAccountName = $scope.reportMetaData[dimension][currentRowIndex].dimension.client_name;
                            metricObj = $scope.metricValues[dimension][$scope.activeTab][currentRowIndex];
                        } else {
                            subAccountId = $scope.reportMetaData[dimension][currentRowIndex][curSecDimIndx]
                                .dimension.client_id;

                            subAccountName = $scope.reportMetaData[dimension][currentRowIndex][curSecDimIndx]
                                .dimension.client_name;

                            metricObj = $scope.metricValues[dimension][currentRowIndex][$scope.activeTab]
                                [curSecDimIndx];
                        }

                        if ((metricObj instanceof Object) &&
                            ((metricObj.type === 'campaign_name') || (metricObj.type === 'ad_name'))) {
                            if (subAccountId && subAccountName) {
                                $scope.deepLinking.setSubAccount(subAccountId, subAccountName);
                            }
                        }

                        if ((metricObj instanceof Object) && (metricObj.type === 'campaign_name')) {
                            $scope.deepLinking.mediaplan(dimension, currentRowIndex, curSecDimIndx);
                        }

                        if ((metricObj instanceof Object) && (metricObj.type === 'ad_name')) {
                            $scope.deepLinking.ad(dimension, currentRowIndex, curSecDimIndx);
                        }

                        return false;
                    },

                    isClickable: function (event, dimensionType) {
                        var elem = $(event.target).parents('.reportData');

                        elem.removeClass('clickCursor');

                        if (($scope.isMediaPlanAccessible) && (dimensionType === 'campaign_name')) {
                            elem.addClass('clickCursor');
                        } else if (($scope.isAdAccessible) && (dimensionType === 'ad_name')) {
                            elem.addClass('clickCursor');
                        } else {
                            elem.removeClass('clickCursor');
                            return false;
                        }
                    }
                };
            })();

            $scope.showDataForClikedDimension = function (ev, value, rowIndex, loadMore) {
                var currFirtDimensionElem = $(ev.target).parents('.reportData'),
                    currSecondDimensionElem = currFirtDimensionElem.find('.second_dimension_row_holder'),
                    currentRowIndex = Number(currFirtDimensionElem.attr('data-result-row')),
                    paramsObj;

                var initiallyActiveTab = $scope.activeTab;

                if (!currFirtDimensionElem.hasClass('treeOpen') &&
                    _customctrl.isInputsChangedAfterGenerate(_customctrl.inputDataOnGenerate,
                        $scope.createData().reportDefinition) &&
                    $scope.isReportForMultiDimension !== false) {
                    $rootScope.setErrAlertMessage('Please regenerate the page, input data had changed');

                    return;
                }

                if (loadMore === undefined) {
                    $scope.reportMetaData.second_dimension = {};
                }

                if (!currFirtDimensionElem.hasClass('treeOpen') || loadMore) {


                    if (!$scope.isReportForMultiDimension) {
                        return false;
                    }

                    if (_customctrl.isReportLastPage_2D[currentRowIndex]) {
                        currFirtDimensionElem.addClass('active');
                        return true;
                    }

                    if (!_customctrl.reportPageNum_2D[$scope.activeTab].hasOwnProperty(currentRowIndex)) {
                        _customctrl.reportPageNum_2D[$scope.activeTab][currentRowIndex] = 1;
                    }

                    if (_customctrl.reportPageNum_2D[$scope.activeTab][currentRowIndex] === 1) {
                        $scope.secondDimensionReportLoading[$scope.activeTab] = {};
                        $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = true;
                        $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
                        $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = false;

                        if (!$scope.secDimensionLoadMore.hasOwnProperty($scope.activeTab)) {
                            $scope.secDimensionLoadMore[$scope.activeTab] = {};
                            $scope.secDimensionLoadIcon[$scope.activeTab] = {};
                        }
                    } else {
                        $scope.secDimensionLoadIcon[$scope.activeTab][currentRowIndex] = true;
                    }

                    $scope.secDimensionLoadMore[$scope.activeTab][currentRowIndex] = false;

                    paramsObj =
                        _customctrl.createRequestParams(value, $scope.secondDimensionOffset, 0, currentRowIndex);

                    _customctrl.fetchReportData($scope.selectedMetricsList, paramsObj, currentRowIndex,
                        function (respData, currentRowIndex) {
                            var resultLen;

                            // TODO: Is the comma expression below intentional or not? (Lalding: 12th July 2016)
                            if ($scope.activeTab, $scope.secDimensionLoadIcon[$scope.activeTab] !== undefined &&
                                (initiallyActiveTab === $scope.activeTab)) {
                                $scope.secDimensionLoadIcon[$scope.activeTab][currentRowIndex] = false;
                                currFirtDimensionElem.addClass('active');
                                _customctrl.isReportLastPage_2D[$scope.activeTab][currentRowIndex] = respData.last_page;

                                if (!respData.last_page) {
                                    $scope.secDimensionLoadMore[$scope.activeTab][currentRowIndex] = true;
                                } else {
                                    $scope.secDimensionLoadMore[$scope.activeTab][currentRowIndex] = false;
                                }

                                respData = respData.report_data;

                                if (respData) {
                                    resultLen = respData.length;
                                    $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = false;
                                    currSecondDimensionElem.show();

                                    if (resultLen > 0) {
                                        currFirtDimensionElem.removeClass('noDataOpen');
                                        _customctrl.getMetricValues(respData, $scope.selectedMetricsList,
                                            'second_dimension', currentRowIndex, loadMore);

                                    } else {
                                        if (_customctrl.reportPageNum_2D[$scope.activeTab][currentRowIndex] === 1) {
                                            $scope.secondDimensionReportDataNotFound[$scope.activeTab]
                                                [currentRowIndex] = true;

                                            currFirtDimensionElem.addClass('noDataOpen');
                                        }
                                    }
                                }

                                currFirtDimensionElem.addClass('treeOpen');

                                currFirtDimensionElem
                                    .find('.more_dimension_arrow')
                                    .removeClass('icon-toggleclose')
                                    .addClass('icon-toggleopen');
                            } else {
                                _.each($scope.secondDimensionReportLoading, // jshint ignore:line
                                    function (value, sdrlkey) {
                                        _.each(value, function (value, key) { // jshint ignore:line
                                            if (key === currentRowIndex) {
                                                $scope.secondDimensionReportLoading[sdrlkey][key] = false;
                                            }
                                        });
                                    });
                            }

                        }, function (currentRowIndex) {
                            if (_customctrl.reportPageNum_2D[$scope.activeTab][currentRowIndex] === 1) {
                                $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = false;
                                $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = true;
                                currFirtDimensionElem.addClass('noDataOpen');
                            }
                        });

                    $scope.generateBtnDisabled = false;
                } else {
                    //hide the second dimension data for clcked row
                    if ($(ev.target).closest('.second_dimension_row').length === 0) {
                        _customctrl.hideSecondDimensionData(currFirtDimensionElem, currSecondDimensionElem);
                    }
                }
            };

            _customctrl.createJSONforPage = function (activeTab) {
                var pageData = ['reportPageNum_2D', 'isReportLastPage_2D'];

                _.each(pageData, function (d) { // jshint ignore:line
                    if (!_customctrl.hasOwnProperty(d)) {
                        _customctrl[d] = {};
                    }

                    if (!_customctrl[d].hasOwnProperty(activeTab)) {
                        _customctrl[d][activeTab] = [];
                    }
                });
            };

            _customctrl.reset = function () {
                _customctrl.reportPageNum_1D = 1;
                _customctrl.isReportLastPage_1D = false;
                _customctrl.reportPageNum_2D = {};
                _customctrl.isReportLastPage_2D = {};
                $scope.limit = 1000;
                $scope.firstDimensionoffset = 0;
                $scope.fetching = false;
                $scope.secondDimensionOffset = 0;
            };

            $scope.select_option = function (event) {
                var elem = $(event.target),
                    totalColItems,
                    activeColItems,
                    totalItems,
                    activeItems,
                    totalMetricsContainer = $('.total_metrics_container');

                if (elem.hasClass('active')) {
                    elem.removeClass('active');
                    elem.closest('.each_measurable_col').find('.squaredFourChkbox').prop('checked', false);
                    $('#selectAll_chkbox').prop('checked', false);
                } else {
                    elem.addClass('active');
                }

                totalColItems = elem.closest('.each_measurable_col').find('.each_option').length;
                activeColItems = elem.closest('.each_measurable_col').find('.active').length;

                if (activeColItems > 0) {
                    elem.closest('.each_measurable_col').find('.squaredFour').addClass('not_all_selected');
                } else {
                    elem.closest('.each_measurable_col').find('.squaredFour').removeClass('not_all_selected');
                }

                if (totalColItems === activeColItems) {
                    elem.closest('.each_measurable_col').find('.squaredFourChkbox').prop('checked', true);
                    elem.closest('.each_measurable_col').find('.squaredFour').removeClass('not_all_selected');
                }

                totalItems = totalMetricsContainer.find('.each_option').length;
                activeItems =totalMetricsContainer.find('.each_option.active').length;

                if (totalItems === activeItems) {
                    $('#selectAll_chkbox').prop('checked', true);
                }
            };

            $scope.select_unselect_all = function (event) {
                var elem = $(event.target),
                    eachMeasurableCol = $('.each_measurable_col'),
                    optionElem = eachMeasurableCol.find('.each_option'),
                    metricElem = eachMeasurableCol.find('.squaredFour');

                metricElem.removeClass('not_all_selected');

                if (elem.prop('checked')) {
                    optionElem.addClass('active');
                    metricElem.find('.squaredFourChkbox').prop('checked', true);
                } else {
                    optionElem.removeClass('active');
                    metricElem.find('.squaredFourChkbox').prop('checked', false);
                }
            };

            $scope.select_unselect_metrics = function (event) {
                var elem = $(event.target),
                    totalMetricsContainer = $('.total_metrics_container'),
                    totalItems,
                    activeItems;

                elem.closest('.squaredFour').removeClass('not_all_selected');

                if (elem.prop('checked')) {
                    elem.closest('.each_measurable_col').find('.each_option').addClass('active');
                } else {
                    elem.closest('.each_measurable_col').find('.each_option').removeClass('active');
                    $('#selectAll_chkbox').prop('checked', false);
                }

                totalItems = totalMetricsContainer.find('.each_option').length;
                activeItems = totalMetricsContainer.find('.each_option.active').length;

                if (totalItems === activeItems) {
                    $('#selectAll_chkbox').prop('checked', true);
                }
            };

            $scope.delete_level = function (event) {
                var elem = $(event.target);

                elem.closest('.breakdown_div').remove();

                if ($('#breakdown_row').find('.breakdown_div').length === 0) {
                    $('.add_breakdown_btn').closest('.row').show();
                }
            };

            $scope.select_dimension = function (event) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                elem.closest('.dropdown').find('.dd_txt').attr('id', elem.attr('id'));
                elem.closest('.breakdown_div').find('.filter_input_txtbox').show();
            };

            $scope.selectPriSecDimension = function (dimension, type) {
                var specificFilter,
                    removeIndex;

                $scope.showPrimaryTxtBox = true;

                if (dimension !== undefined) {
                    specificFilter = $scope.customeDimensionData[0].dim_specific_filters;

                    if (type === 'Primary') {
                        $scope.secondaryDimensionArr = specificFilter.hasOwnProperty(dimension) ?
                            angular.copy(specificFilter[dimension]) : // jshint ignore:line
                            angular.copy($scope.customeDimensionData[0].dimensions); // jshint ignore:line

                        $scope.secondaryDimensionArr =
                            _.filter($scope.secondaryDimensionArr, function (item) { // jshint ignore:line
                                return item !== 'conversion_pixel_name';
                            });

                        $scope.filterList = specificFilter.hasOwnProperty(dimension) ?
                            angular.copy(specificFilter[dimension]) : // jshint ignore:line
                            angular.copy($scope.customeDimensionData[0].filters); // jshint ignore:line

                        if (!$scope.reports.reportDefinition.dimensions.primary.name) {
                            $scope.showAddBreakdownButton = true;
                        }

                        $scope.reports.reportDefinition.dimensions.primary.name = $scope.displayName[dimension];

                        $scope.reports.reportDefinition.dimensions.primary.dimension =
                            (dimension === undefined) ? dimension.dimension : dimension;

                        // if a dimension is selected as Primary it should not appear in secondary
                        $scope.initializeMetrics($scope.customeDimensionData[0], dimension);

                        _customctrl.resetMetricsPopUp();
                        removeIndex = ($scope.secondaryDimensionArr).indexOf(dimension);
                        $scope.secondaryDimensionArr.splice(removeIndex, 1);

                        // After selecting secondary dimension if primary is reset as secondary dimension then
                        // initialize secondary dimension
                        if ($scope.reports.reportDefinition.dimensions.secondary.dimension ===
                            $scope.reports.reportDefinition.dimensions.primary.dimension) {
                            $scope.deleteSecondDimensionBlock();
                            $scope.showSecondDimension();
                        }
                    } else {
                        $scope.showSecondaryTxtBox = true;
                        $scope.reports.reportDefinition.dimensions.secondary.name = $scope.displayName[dimension];

                        $scope.reports.reportDefinition.dimensions.secondary.dimension = (dimension === undefined) ?
                            dimension.dimension : dimension;

                        $scope.showAddBreakdownButton = false;
                    }

                    $scope.setMetrixText('custom');
                }
            };

            $scope.select_additional_filters = function (event) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                elem.closest('.dropdown').find('.dd_txt').attr('id', elem.attr('id'));
                elem.closest('.breakdown_div').find('.filter_input_txtbox').show();
            };

            $scope.select_dropdown_option = function (event, arg) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                elem.closest('.dropdown').find('.dd_txt').attr('id', elem.attr('id'));
                elem.closest('.breakdown_div').find('.filter_input_txtbox').show();

                if (arg) {
                    var startDate, endDate;

                    switch (arg) {
                        case 'Yesterday':
                            startDate = moment() // jshint ignore:line
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Week to date':
                            startDate = moment() // jshint ignore:line
                                .startOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last 7 days':
                            startDate = moment() // jshint ignore:line
                                .subtract(7, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last week':
                            startDate = moment() // jshint ignore:line
                                .subtract(1, 'week')
                                .startOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(1, 'week')
                                .endOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Month to date':
                            startDate = moment().format('YYYY-MM') + '-01'; // jshint ignore:line
                            endDate = moment().format('YYYY-M-DD'); // jshint ignore:line
                            break;

                        case 'Last month':
                            startDate = moment() // jshint ignore:line
                                    .subtract(1, 'months')
                                    .endOf('month').format('YYYY-MM') + '-01';

                            endDate = moment() // jshint ignore:line
                                .subtract(1, 'months')
                                .endOf('month')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Quarter to date':
                            startDate = moment() // jshint ignore:line
                                .startOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last quarter':
                            startDate = moment() // jshint ignore:line
                                .subtract(1, 'quarter')
                                .startOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(1, 'quarter')
                                .endOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Year to date':
                            startDate = moment().format('YYYY') + '-01-01'; // jshint ignore:line

                            endDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Custom dates':
                            startDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        default:
                            startDate = moment() // jshint ignore:line
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment() // jshint ignore:line
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);
                    }

                    $('#startDateInput').datepicker('update', startDate);
                    $('#endDateInput').datepicker('update', endDate);
                }
            };

            $scope.select_schedule_option = function (arg, isAssigned) {
                var currentYear,
                    deliverOn = $('#deliverOn'),
                    startOn = $('#startOn'),
                    endOn = $('#endOn');

                $scope.reports.schedule.frequency = arg;

                if (!isAssigned) {
                    $scope.reports.schedule.occurance = '';
                }

                currentYear = momentService.getCurrentYear().toString();

                if (arg) {
                    arg = arg.toLowerCase();
                    $('.scheduling-options').hide();
                    $('.schedule-' + arg).show();

                    if (arg === 'once') {
                        deliverOn.datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                        deliverOn.datepicker('setStartDate', currentYear);
                        $('.schedule-date').hide();
                    } else {
                        $('.schedule-date').show();
                        startOn.datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                        startOn.datepicker('setStartDate', currentYear);
                        startOn.datepicker('setRange', '');
                        endOn.datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                        endOn.datepicker('setStartDate', currentYear);
                        endOn.datepicker('setRange', '');
                    }
                }

                $scope.showCustomDate($scope.valueWithDefault($scope.reports.schedule.occurance,
                    $scope.reports.schedule.frequency, ''));
            };

            $scope.select_schedule_occurs_option = function (event, arg) {
                var elem = $(event.target);

                $scope.reports.schedule.occurance = arg;
                arg = arg.toLowerCase();
                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                $scope.showCustomDate(arg);
            };

            $scope.showCustomDate = function (arg) {
                if (arg === 'custom') {
                    $('.schedule-occurs-custom').show();
                } else {
                    $('.schedule-occurs-custom').hide();
                }
            };

            $scope.checkHeaderScroll = function (activeTab) {
                var id = activeTab + '_table';

                $('.custom_report_response_page .custom_report_response_table .custom_report_scroll .heading_row')
                    .css({left: '-' + $('#' + id + ' .custom_report_scroll').scrollLeft() + 'px'});
            };

            $scope.show_respective_table = function (id) {
                var customReportResponseTabs = $('.custom_report_response_tabs'),
                    headingWidth;
                var lastActiveTab = $scope.activeTab;
                var lastTabSelArr = $scope.secondDimensionReportLoading[lastActiveTab];

                if(lastTabSelArr) {
                    _.each(lastTabSelArr,function(value,key) {
                        if(value) {
                            $scope.secondDimensionReportLoading[lastActiveTab][key] = false;
                        }
                    });
                }

                $('.custom_report_response_table').hide();
                $('#' + id + '_table').show();
                customReportResponseTabs.find('.each_tab').removeClass('active');
                customReportResponseTabs.find('#' + id + '_tab').addClass('active');
                $scope.activeTab = id + '_metrics';
                _customctrl.createJSONforPage($scope.activeTab);
                _customctrl.getDataBasedOnTabSelected($scope.activeTab, 'first_dimension');
                $scope.checkHeaderScroll(id);
                headingWidth = $('#' + id + '_table .custom_report_scroll').find('.heading_row').width();
                $('#' + id + '_table .custom_report_scroll .first_dimension_row_holder').width(headingWidth);
            };

            $scope.reset_metric_options = function () {
                localStorage.removeItem('customReport');
                $route.reload();
            };

            $scope.toggleSchedule = function (that) {
                $scope.scheduleReportActive = $(that).prop('checked');

                if ($scope.scheduleReportActive) {
                    if ($routeParams.reportId) {
                        $scope.buttonLabel = 'Update';
                    } else {
                        $scope.buttonLabel = $scope.reportTypeSelect;
                        $timeout(function () {
                            $scope.$apply();
                        }, 100);
                    }

                    $scope.$watch('reportTypeSelect', function () {
                        if ($routeParams.reportId) {
                            $scope.buttonLabel = 'Update';
                        } else {
                            $scope.buttonLabel = $scope.reportTypeSelect;
                        }
                    });
                } else {
                    $scope.reports.name = '';
                    $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
                    $scope.$apply();
                }

                if ($(that).closest('.schedule-on-off-btn').find('.toggle.btn-primary').length > 0) {
                    $('.default-schedule-col').show();
                } else {
                    $('.each-col:not(#schedule-btn)').hide();
                    $('.default-schedule-col').find('.dd_txt').text('Select');
                }
                if (!$scope.updateScheduleReport && !localStorage.getItem('customReport')) {
                    $scope.$apply();
                }
            };

            $(document).ready(function () {
                var yesterday,
                    toggle = $('#toggle'),
                    startDateInput = $('#startDateInput'),
                    endDateInput = $('#endDateInput'),
                    lastScrollLeft = 0,
                    lastScrollTop = 0,
                    customReportScroll = $('.custom_report_scroll'),

                    metricsTabIdTab = [
                        'delivery_table',
                        'cost_table',
                        'video_table',
                        'quality_table',
                        'pacing_table'
                    ],

                    getCustomReportMetrics = function () {
                        dataService
                            .getCustomReportMetrics($scope.campaign)
                            .then(function (result) {
                                var modifiedDimensionArr = result.data.data[0],
                                    url;

                                $scope.displayName = result.data.data[0].display_name;
                                $scope.filterList = result.data.data[0].filters;
                                $scope.initializeMetrics(result.data.data[0], result.data.data[0].dimensions[0]);
                                _customctrl.resetMetricsPopUp();
                                $scope.customeDimensionData = result.data.data;

                                $scope.showDefaultDimension = {
                                    key: modifiedDimensionArr.dimensions[0],
                                    value: $scope.displayName[modifiedDimensionArr.dimensions[0]]
                                };

                                $scope.showDefaultDimension.template_id = modifiedDimensionArr.template_id;

                                //if edit
                                if ($routeParams.reportId) {
                                    $('#toggle').bootstrapToggle('on');
                                    $scope.updateScheduleReport = true;
                                    $scope.buttonLabel = 'Update';
                                    $scope.buttonResetCancel = 'Cancel';

                                    if (localStorageService.scheduleListReportType.get() === 'Saved') {
                                        url = urlService.savedReport($routeParams.reportId);
                                        $scope.isSavedReportGen = true;
                                    } else {
                                        $scope.isSavedReportGen = false;
                                        $scope.reportTypeSelect = 'Schedule As';
                                        url = urlService.scheduledReport($routeParams.reportId);
                                    }

                                    dataStore.deleteFromCache(url);

                                    dataService
                                        .fetch(url)
                                        .then(function (response) {
                                            if (response.status === 'success') {
                                                $scope.reportData = response.data.data;
                                                $scope.prefillData(response.data.data);
                                                $('#toggle').prop('disabled', true);

                                                $('.img_table_txt').html('Please select dimensions, timeframe and ' +
                                                    'any additional <br> parameters to update the report');

                                                if (localStorageService.scheduleListReportType.get() === 'Saved') {
                                                    $scope.reports.name = $scope.reportData.reportName;
                                                    $scope.reports.reportDefinition.timeframe.type = "Custom Dates";
                                                    $scope.generateReport();
                                                    slideUp();
                                                    $('#dynamicHeader').addClass('smaller');
                                                }
                                            }
                                        });
                                } else if (localStorage.getItem('customReport')) {
                                    localStorageService.scheduleListReportType.remove();
                                    $scope.prefillData(JSON.parse(localStorage.getItem('customReport')));
                                }
                            });
                    };

                function monthArrayMake() {
                    var dayTo31 = [],
                        i;

                    for (i = 1; i <= 31; i++) {
                        dayTo31.push(i);
                    }

                    return dayTo31;
                }

                $('.input-daterange').datepicker({
                        format: 'yyyy-mm-dd',
                        orientation: 'auto',
                        autoclose: true,
                        todayHighlight: true,
                        keyboardNavigation: false
                    })
                    .on('changeDate', function () {
                        var frequencyDropDown = $('.frequency').text().trim(),
                            startOn = $('#startOn'),
                            startDateChecker = new Date(startOn.val()),
                            endOn = $('#endOn'),
                            endDateChecker = new Date(endOn.val()),
                            startDateCheckerRange = startOn.val(),
                            endDateCheckerRange = endOn.val(),

                            theDateDifference =
                                daydiff(parseDate(startDateCheckerRange), parseDate(endDateCheckerRange));

                        function parseDate(str) {
                            var mdy = str.split('-');

                            return new Date(mdy[0] - 1, mdy[1], mdy[2]);
                        }

                        function daydiff(first, second) {
                            return Math.round((second - first) / (1000 * 60 * 60 * 24));
                        }

                        if (frequencyDropDown === 'Weekly' && theDateDifference < 7) {
                            $scope.notInRange = true;
                        } else if (frequencyDropDown === 'Monthly' && theDateDifference < 28) {
                            $scope.notInRangeMonthly = true;
                        } else if (startDateChecker > endDateChecker) {
                            endOn.val(startOn.val());
                        } else {
                            $scope.notInRange = false;
                            $scope.notInRangeMonthly = false;
                        }

                        $(this).closest('.customDatesTimeframe').find('#date-selected-txt').text('Custom Dates');
                    });

                $('.customDatesTimeframe .input-daterange').on('changeDate', function () {
                    $scope.reports.reportDefinition.timeframe.type = 'Custom Dates';
                });

                toggle.bootstrapToggle('off');

                toggle.change(function () {
                    $scope.toggleSchedule(this);
                });

                yesterday = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT); // jshint ignore:line

                startDateInput.datepicker('update', yesterday);
                endDateInput.datepicker('update', yesterday);
                startDateInput.datepicker('setEndDate', new Date());
                endDateInput.datepicker('setEndDate', new Date());

                customReportScroll.scroll(function () {
                    var documentScrollLeft = $(this).scrollLeft();

                    if (lastScrollLeft !== documentScrollLeft) {
                        lastScrollLeft = documentScrollLeft;
                        customReportScroll.removeClass('vertical_scroll');
                        customReportScroll.addClass('hori_scroll');
                    }

                    var documentScrollTop = $(this).scrollTop();
                    if (lastScrollTop !== documentScrollTop) {
                        lastScrollTop = documentScrollTop;
                        customReportScroll.addClass('vertical_scroll');
                        customReportScroll.removeClass('hori_scroll');
                    }
                });

                $scope.getNumberDate = monthArrayMake();

                //--- sapna ----
                $scope.onChoosingAditFlts = function (index, key) {
                    $scope.additionalFilters[index].hide = false;
                    $scope.additionalFilters[index].key = key;
                    $scope.additionalFilters[index].name = $scope.displayName[key];
                };

                $scope.delAditFlt = function (index) {
                    $scope.additionalFilters.splice(index, 1);
                };

                $scope.addAdditionalFilters = function () {
                    $scope.additionalFilters.push({
                        key: '',
                        name: '',
                        value: '',
                        hide: true
                    });
                };

                $scope.setAllMetrics = function () {
                    if ($scope.deliveryMetrics.isAllSelected &&
                        ($scope.costMetrics.isAllSelected || !$scope.showCost) &&
                        $scope.videoMetrics.isAllSelected &&
                        ($scope.qualityMetrics.isAllSelected || !$scope.showQuality)) {
                        $scope.allMetrics = true;
                    } else {
                        $scope.allMetrics = false;
                    }
                };

                $scope.allMetrics = false;

                $scope.OnSelectUnselectAllMetrics = function () {
                    var metricsTab = ['delivery', 'pacing', 'cost', 'video', 'quality'];

                    _.each(metricsTab, function (mTab) { // jshint ignore:line
                        $scope[mTab + 'Metrics'].isAllSelected = $scope.allMetrics;

                        _.each($scope[mTab + 'Metrics'], function (eachObj) { // jshint ignore:line
                            eachObj.selected = $scope.allMetrics;
                        });

                        $scope[mTab + 'Metrics'].minOneSelected = true;

                        if (!$scope[mTab + 'Metrics'].isAllSelected) {
                            $scope[mTab + 'Metrics'].minOneSelected = false;
                        }
                    });
                };

                $scope.onMetricClick = function (metricType, index) {
                    var totalMetricSelected = 0,
                        selectedIndx;

                    if (index === undefined) {
                        _.each($scope[metricType], function (eachObj) { // jshint ignore:line
                            eachObj.selected = $scope[metricType].isAllSelected;
                        });
                    } else {
                        $scope[metricType][index].selected = !$scope[metricType][index].selected;
                    }

                    selectedIndx = _.findIndex($scope[metricType], function (eachObj) { // jshint ignore:line
                        if (eachObj.selected === true) {
                            totalMetricSelected++;
                        }
                    });

                    if (totalMetricSelected > 0) {
                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        var nameOfMetric = metricType.split(/(?=[A-Z])/)[0];

                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                        $scope[metricType].minOneSelected = true;

                        if (totalMetricSelected === $scope['total' + nameOfMetric + 'Metrics']) {
                            $scope[metricType].isAllSelected = true;
                            $scope.setAllMetrics();
                        } else {
                            $scope[metricType].isAllSelected = false;
                            $scope.allMetrics = false;
                        }
                    } else {
                        $scope[metricType].minOneSelected = false;
                        $scope.allMetrics = false;
                    }
                };

                //delivery Metrics
                $scope.saveMetrics = function () {
                    $scope.selectedMetricsList = [];

                    _.each(metricVarKeys, function (eachMetric) { // jshint ignore:line
                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        var nameOfMetric = eachMetric.split(/(?=[A-Z])/)[0],
                            metricArray = [];

                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                        _.each($scope[eachMetric], function (eachObj) { // jshint ignore:line
                            if (eachObj.selected) {
                                metricArray.push(eachObj.key);

                                $scope.selectedMetricsList.push({
                                    key: eachObj.key,
                                    value: eachObj.value
                                });
                            }
                        });

                        $scope.reports.reportDefinition.metrics[nameOfMetric] = [];

                        if (metricArray.length > 0) {
                            $scope.reports.reportDefinition.metrics[nameOfMetric] = metricArray;
                        }
                    });

                    $scope.setMetrixText('Custom');
                    $scope.cancelMetricView();
                };

                $scope.updateSchdReport = function () {
                    var self = this;

                    if ($scope.verifyReportInputs()) {
                        if ($scope.reportTypeSelect === 'Save') {
                            dataService
                                .updateSavedReport($routeParams.reportId, $scope.createData())
                                .then(function (result) {
                                    if (result.data.status_code === 200) {
                                        $rootScope.setErrAlertMessage('Saved report updated successfully', 0);
                                        $scope.stopRedirectingPage = false;
                                        slideUp();
                                        if ((isGenerateAlreadyCalled)) {
                                            $scope.ToggleAdGroups(self);
                                        } else {
                                            isGenerateAlreadyCalled = true;
                                        }
                                    }
                                });
                        } else {
                            dataService
                                .updateScheduleReport($routeParams.reportId, $scope.createData())
                                .then(function (result) {
                                    if (result.data.status_code === 200) {
                                        $rootScope.setErrAlertMessage('Scheduled report updated successfully', 0);
                                        $scope.stopRedirectingPage = false;
                                        $location.url('/reports/schedules');
                                    }
                                });
                        }
                    }
                };

                $scope.refreshMetriPopUp = function () {
                    var metricsType = ['deliveryMetrics', 'costMetrics', 'videoMetrics', 'qualityMetrics'];

                    _.each(metricsType, function (v) { // jshint ignore:line
                        _.each($scope[v], function (o) { // jshint ignore:line
                            o.selected = false;
                        });

                        $scope[v].isAllSelected = false;
                    });

                    _.each($scope.selectedMetricsList, function (selObj) { // jshint ignore:line
                        _.each(metricsType, function (v) { // jshint ignore:line
                            _.each($scope[v], function (o) { // jshint ignore:line
                                if (selObj.key === o.key) {
                                    o.selected = true;
                                }
                            });

                            $scope[v].isAllSelected = true;

                            _.each($scope[v], function (o) { // jshint ignore:line
                                if (!o.selected) {
                                    $scope[v].isAllSelected = false;
                                }
                            });
                        });
                    });

                    $('.metricDataViewHeader').hide();
                    $('.metricDataView').slideDown();
                };

                $scope.cancelMetricView = function () {
                    $('.metricDataView').slideUp();

                    setTimeout(function () {
                        $('.metricDataViewHeader').fadeIn();
                    }, 600);
                };

                $scope.validateScheduleDate = function () {
                    var currDate = momentService.todayDate('YYYY-MM-DD'),
                        deliverOn,
                        startDate,
                        endDate;

                    if ($('.report_generate_button').hasClass('disabled') ||
                        !$scope.reports.reportDefinition.timeframe.start_date ||
                        !$scope.reports.reportDefinition.timeframe.end_date) {
                        return false;
                    }

                    if ($scope.scheduleReportActive) {
                        deliverOn = $('#deliverOn').val();
                        startDate = $('#startOn').val();
                        endDate = $('#endOn').val();

                        if ($scope.reports.schedule.frequency &&
                            $scope.reports.schedule.frequency !== 'Once' &&
                            (momentService.dateDiffInDays(currDate, startDate) < 0 ||
                            momentService.dateDiffInDays(currDate, endDate) < 0)) {
                            $rootScope.setErrAlertMessage(constants.START_OR_END_DATE_CAN_NOT_LESS_THAN_CURRENTDATE);

                            return false;
                        }

                        switch ($scope.reports.schedule.frequency) {
                            case 'Once':
                                if (momentService.dateDiffInDays(currDate, deliverOn) < 0) {
                                    $rootScope.setErrAlertMessage(constants.DELIVER_DATE_CAN_NOT_LESS_THAN_CURRENTDATE);

                                    return false;
                                }

                                break;

                            case 'Daily':
                                if (momentService.dateDiffInDays(startDate, endDate) < 1) {
                                    $rootScope.setErrAlertMessage(
                                        constants.DIFFERENCE_BETWEEN_START_END_AT_LEAST_ONE_DAY
                                    );

                                    return false;
                                }

                                break;

                            case 'Weekly':
                                if ($scope.valueWithDefault($scope.reports.schedule, 'occurance', '') === '') {
                                    $rootScope.setErrAlertMessage(constants.SELECT_VALID_DATE_OR_DAY_OCCURS_ON_FIELD);

                                    return false;
                                }

                                if (momentService.dateDiffInDays(startDate, endDate) < 7) {
                                    $rootScope.setErrAlertMessage(
                                        constants.DIFFERENCE_BETWEEN_START_END_AT_LEAST_ONE_WEEK
                                    );

                                    return false;
                                }

                                break;

                            case 'Monthly':
                                if ($scope.valueWithDefault($scope.reports.schedule, 'occurance', '') === '') {
                                    $rootScope.setErrAlertMessage(constants.SELECT_VALID_DATE_OR_DAY_OCCURS_ON_FIELD);

                                    return false;
                                } else {
                                    if ($scope.reports.schedule.occurance === 'Custom' &&
                                        (typeof $scope.reports.schedule.customOccuranceDate === 'undefined' ||
                                        $scope.reports.schedule.customOccuranceDate === '')) {
                                        $rootScope.setErrAlertMessage(constants.SELECT_VALID_CUSTOM_DATE);

                                        return false;
                                    }
                                }

                                if (momentService.dateDiffInDays(startDate, endDate) < 28) {
                                    $rootScope.setErrAlertMessage(
                                        constants.MONTHLY_SCHEDULING_DATE_RANGE__AT_LEAST_ONE_MONTH
                                    );

                                    return false;
                                }

                                break;
                        }
                    }

                    return true;
                };

                $scope.showHideToggle = false;

                $scope.ToggleAdGroups = function (context) {
                    if (context.showHideToggle) {
                        slideUp();
                        context.showHideToggle = !context.showHideToggle;
                    } else {
                        slideDown();
                        context.showHideToggle = !context.showHideToggle;
                    }
                };

                $scope.scheduleReportAction = function () {
                    if (!$scope.validateScheduleDate()) {
                        return;
                    }

                    $scope.loadingBtn = true;
                    localStorageService.scheduleListReportType.remove();

                    if ($scope.buttonLabel === 'Update') {
                        $scope.updateSchdReport();
                        $scope.generateReport('Generate');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else if ($scope.buttonLabel === 'Generate') {
                        $scope.generateBtnDisabled = true;
                        $scope.generateReport('Generate');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else if ($scope.buttonLabel === 'Save') {
                        $scope.saveReport();
                        $scope.generateReport('Save');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else {
                        $scope.scheduleReport();
                        $scope.generateReport();
                        $('.collapseIcon').css('visibility', 'hidden');
                    }
                    setTimeout(function () {
                        $scope.loadingBtn = false;
                    }, 1000);
                };

                $scope.resetMetricOptions = function () {
                    var url = '/reports/schedules';

                    if ($scope.buttonResetCancel === 'Cancel') {
                        $location.url(url);
                    } else if ($scope.buttonResetCancel === 'Clear') {
                        localStorage.removeItem('customReport');
                        $route.reload();
                    }
                };

                $rootScope.$on(constants.ACCOUNT_CHANGED, function () {
                    $scope.buttonResetCancel = 'Clear';
                    $scope.resetMetricOptions();
                });

                $scope.addSearch = function (event) {
                    event.stopPropagation();
                };

                $scope.intermediateSave = function () {
                    // Will not do this in edit mode, we do not want it remembered in that case
                    if (!$routeParams.reportId) {
                        localStorage.setItem('customReport', JSON.stringify($scope.createData(true)));
                    }
                };

                $scope.$on('$locationChangeStart', function (event, next) {
                    $scope.intermediateSave();

                    if ($scope.buttonLabel === 'Update' &&
                        $scope.stopRedirectingPage &&
                        (!$scope.isSavedReportGen &&
                        ($scope.reports.name !== $scope.scheduleResponseData.name ||
                        !angular.equals($scope.reports.schedule, // jshint ignore:line
                        $scope.scheduleResponseData.schedule)))) {
                        event.preventDefault();
                        $scope.updateSchedule = true;
                        $scope.nextURL = next;
                    }
                });

                $scope.updateReportAndRedirect = function (arg) {
                    $scope.stopRedirectingPage = false;
                    $scope.updateSchedule = false;

                    if (arg === 'Yes' && $scope.validateScheduleDate()) {
                        $scope.scheduleReportAction();
                    }

                    if (arg === 'No' || $scope.validateScheduleDate()) {
                        $location.path($scope.nextURL.substring($location.absUrl().length - $location.url().length));
                    } else {
                        $scope.stopRedirectingPage = true;
                    }
                };

                $scope.prefillData = function (reportData) {
                    var responseData = reportData,
                        selectedMetricVarKeys = 0;

                    $scope.additionalFilters = [];
                    $scope.reports.name = responseData.name;
                    $scope.scheduleReportActive = responseData.isScheduled;
                    $scope.generateBtnDisabled = false;
                    $scope.reports.schedule = responseData.schedule;

                    if ($scope.reports.schedule) {
                        if ($scope.reports.schedule.startDate) {
                            $scope.reports.schedule.startDate =
                                momentService.newMoment($scope.reports.schedule.startDate).format('YYYY-MM-DD');
                        }

                        if ($scope.reports.schedule.endDate) {
                            $scope.reports.schedule.endDate =
                                momentService.newMoment($scope.reports.schedule.endDate).format('YYYY-MM-DD');
                        }
                    }

                    $scope.reports.reportDefinition.timeframe = responseData.reportDefinition.timeframe;

                    if (responseData.isScheduled) {
                        $('#toggle').bootstrapToggle('on');
                    }

                    if (localStorageService.scheduleListReportType.get() !== 'Saved') {
                        $scope.select_schedule_option(responseData.schedule.frequency, 1);

                        if (responseData.schedule.occurance) {
                            if (responseData.schedule.customOccuranceDate) {
                                $('.schedule-occurs-custom .dd_txt').html(responseData.schedule.customOccuranceDate);
                                $('.schedule-occurs-custom').show();
                            }
                        }
                    }

                    //returns name of the breakdown/filter key passed
                    $scope.getFilterBreakdownName = function (key) {
                        var dimensionObj = $scope.customeDimensionData[0].dimensions,
                            name;

                        _.each(dimensionObj, function (item) { // jshint ignore:line
                            if (key.trim() === item.trim()) {
                                name = $scope.displayName[item].trim();
                            }
                        });

                        return name;
                    };

                    $scope.setPrimaryDimension = function (obj, fromFilters) {
                        var removeIndex;

                        fromFilters = fromFilters || false;

                        // if a dimension is selected as Primary it should not appear in secondary
                        $scope.secondaryDimensionArr =
                            angular.copy($scope.customeDimensionData[0].dimensions); // jshint ignore:line

                        $scope.secondaryDimensionArr =
                            _.filter($scope.secondaryDimensionArr, function (item) { // jshint ignore:line
                                return item !== 'conversion_pixel_name';
                            });

                        removeIndex = ($scope.secondaryDimensionArr).indexOf(obj.dimension);

                        $scope.secondaryDimensionArr.splice(removeIndex, 1);

                        $scope.reports.reportDefinition.dimensions.primary.name =
                            $scope.getFilterBreakdownName(obj.dimension);

                        $scope.reports.reportDefinition.dimensions.primary.dimension = obj.dimension;

                        if (obj.values) {
                            $scope.reports.reportDefinition.dimensions.primary.value = obj.values;
                        }

                        $scope.showPrimaryTxtBox = true;

                        if (!fromFilters) {
                            $scope.showAddBreakdownButton = true;
                        }
                    };

                    $scope.setSecondaryDimension = function (obj) {
                        $scope.reports.reportDefinition.dimensions.secondary.name =
                            $scope.getFilterBreakdownName(obj.dimension);

                        $scope.reports.reportDefinition.dimensions.secondary.dimension = obj.dimension;

                        if (obj.values) {
                            $scope.reports.reportDefinition.dimensions.secondary.value = obj.values;
                        }

                        $scope.showSecondDimensionBlock = true;
                        $scope.showSecondaryTxtBox = true;
                        $scope.showAddBreakdownButton = false;
                    };

                    //set breakdown filter
                    angular.forEach(responseData.reportDefinition.dimensions, // jshint ignore:line
                        function (eachObj) {
                            if ((eachObj.type === 'Primary')) {
                                $scope.setPrimaryDimension(eachObj);
                            } else if ((eachObj.type === 'Secondary')) {
                                $scope.setSecondaryDimension(eachObj);
                            }
                        });

                    //set breakdown filter values if exist
                    angular.forEach(responseData.reportDefinition.filters, // jshint ignore:line
                        function (eachObj) {
                            eachObj.name = $scope.getFilterBreakdownName(eachObj.dimension);

                            if ((eachObj.type === 'Primary')) {
                                $scope.setPrimaryDimension(eachObj, true);
                            } else if ((eachObj.type === 'Secondary')) {
                                $scope.setSecondaryDimension(eachObj);
                            } else if ((eachObj.type !== 'Primary') && (eachObj.type !== 'Secondary')) {
                                $scope.additionalFilters.push({
                                    key: eachObj.dimension,
                                    name: eachObj.name,
                                    value: eachObj.values,
                                    hide: false
                                });
                            }
                        });

                    //metrics
                    $scope.selectedMetricsList = [];

                    _.each(metricVarKeys, function (eachMetric) { // jshint ignore:line
                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        var nameOfMetric = eachMetric.split(/(?=[A-Z])/)[0];

                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                        if (responseData.reportDefinition.metrics[nameOfMetric]) {
                            _.each($scope[eachMetric], function (each) { // jshint ignore:line
                                var metricsObj =
                                    _.find(responseData.reportDefinition.metrics[nameOfMetric], // jshint ignore:line
                                    function (num) {
                                        return num === each.key;
                                    });

                                if (metricsObj === undefined) {
                                    each.selected = false;
                                    $scope[eachMetric].isAllSelected = false;
                                    $scope.allMetrics = false;
                                } else {
                                    $scope.selectedMetricsList.push({
                                        key: each.key,
                                        value: each.value
                                    });
                                    $scope[eachMetric].minOneSelected = true;
                                }
                            });
                        }
                    });

                    _.each(metricVarKeys, function (mvKeys) { // jshint ignore:line
                        if ($scope[mvKeys] && $scope[mvKeys].isAllSelected) {
                            selectedMetricVarKeys++;
                        }
                    });

                    if (metricVarKeys.length === selectedMetricVarKeys.length) {
                        $scope.allMetrics = true;
                    }

                    $scope.scheduleResponseData = JSON.parse(JSON.stringify(responseData));
                    $scope.setMetrixText('Custom');
                };

                _customctrl.resetMetricsPopUp = function () {
                    $scope.allMetrics = true;

                    // selects all metrics initially
                    $scope.OnSelectUnselectAllMetrics();

                    $scope.saveMetrics();
                    $scope.setMetrixText('Default');
                };

                //Get custom metrics
                getCustomReportMetrics();

                metricsTabIdTab.forEach(function (id) {
                    $('#' + id + ' .custom_report_scroll').scroll(function () {
                        $('.custom_report_response_page .custom_report_response_table .custom_report_scroll ' +
                            '.heading_row')
                            .css({left: '-' + $('#' + id + ' .custom_report_scroll').scrollLeft() + 'px'});

                        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                            _customctrl.loadMoreItems();
                        }
                    });
                });

                $rootScope.$on('features', function () {
                    // On client change
                    _customctrl.showCost_permission();
                    getCustomReportMetrics();
                });

                _customctrl.showCost_permission = function () {
                    var fparams = featuresService.getFeatureParams();

                    $scope.showCost = fparams[0].cost;
                    $scope.showQuality = fparams[0].quality;
                    $scope.showPerformance = fparams[0].performance;
                    $scope.showInventory = fparams[0].inventory;
                    $scope.showPlatform = fparams[0].platform;
                    $scope.isMediaPlanAccessible = fparams[0].create_mediaplan;
                    $scope.isAdAccessible = fparams[0].ad_setup;

                    if (!$scope.showCost || !$scope.showQuality) {
                        $scope.totalMetrics -= $scope.totalCostMetrics;
                        $scope.saveMetrics();
                        $scope.setMetrixText('Default');
                    }
                };

                $scope.checkDimension = function (dimensionValue) {
                    switch (dimensionValue) {
                        case 'platform_name':
                            return $scope.showPlatform;

                        case 'hardware_name':
                            return $scope.showPerformance;

                        case 'ad_format':
                            return $scope.showPerformance;

                        case 'domain':
                            return ($scope.showQuality && $scope.showPerformance) ? true : false;

                        default:
                            return true;
                    }
                };

                _customctrl.showCost_permission();

                $(window).on('beforeunload', function () {
                    // On refresh of page
                    $scope.intermediateSave();
                });

                $scope.$on('$locationChangeSuccess', function () {
                    $(window).unbind('scroll');
                });
            });
        });
    });
