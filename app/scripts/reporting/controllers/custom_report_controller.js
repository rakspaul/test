define(['angularAMD', 'campaign-select-model', 'strategy-select-service', 'kpi-select-model',
        'common-utils', 'request-cancel-service', 'time-period-model','lrInfiniteScroll'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('CustomReportController', ['$routeParams', '$rootScope', '$scope', '$route', '$window', '$timeout', '$location', 'campaignSelectModel',
            'strategySelectModel', 'kpiSelectModel', 'utils', 'dataService', 'requestCanceller', 'constants', 'timePeriodModel', 'momentService', 'loginModel',
            'urlService', 'dataStore', 'domainReports', 'vistoconfig', 'featuresService', 'localStorageService', 'urlBuilder', 'pageLoad',
            function ($routeParams, $rootScope, $scope, $route, $window, $timeout, $location, campaignSelectModel, strategySelectModel, kpiSelectModel, utils, dataService,
                      requestCanceller, constants, timePeriodModel, momentService, loginModel, urlService, dataStore, domainReports, vistoconfig, featuresService,
                      localStorageService, urlBuilder, pageLoad) {
            var _customctrl = this,
                elem = $('#reportBuilderForm').find('.dropdown').find('.dd_txt'),
                winHeight = $(window).height(),
                isGenerateAlreadyCalled = false,
                primaryDimensionTototalMetrics,
                secondaryDimensionTotalMetrics,
                apiMetrics = {},

                metricKey1 = ['dimension', 'delivery_metrics', 'cost_metrics', 'pacing_metrics', 'booked_metrics', 'video_metrics', 'quality_metrics'],
                metricDataKey = ['dimension', 'delivery_metrics', 'cost_metrics', 'pacing_metrics', 'booked_metrics', 'video_metrics', 'quality_metrics'],
                metricsTab = ['delivery', 'cost', 'video', 'quality', 'pacing'],
                metricCategoryKeys = ['delivery_metrics', 'cost_metrics', 'video_metrics', 'quality_metrics', 'pacing_metrics'],
                metricVarKeys = ['deliveryMetrics', 'costMetrics', 'videoMetrics', 'qualityMetrics', 'pacingMetrics'],

                specifiedMetricCount = [],
                intermediateSavedData,

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

            _customctrl.getDimensionList = function (data, selectedMetrics) {
                var selectedDim,
                    metricsCategorizedKey,
                    arr;

                $scope.selectedDimension = elem.text();
                selectedDim = $scope.reports.reportDefinition.dimensions.primary.dimension;

                $scope.metricKeyArr = {};
                if ($scope.selectedMetricsList.length < $scope.totalMetrics) {
                    metricsCategorizedKey = angular.copy(data.metrics);

                    _.each(selectedMetrics, function (selMet) {
                        _.each(metricCategoryKeys, function (metrCatKey) {
                            if ($scope.metricKeyArr[metrCatKey] === undefined) {
                                $scope.metricKeyArr[metrCatKey] = [];
                            }

                            if (_.indexOf(metricsCategorizedKey[metrCatKey], selMet.key) >= 0) {
                                $scope.metricKeyArr[metrCatKey].push({
                                    key: selMet.key,
                                    value: selMet.value
                                });
                            }
                        });
                    });
                } else {
                    // when all the metrics is selected
                    arr = angular.copy(data.metrics);
                    _.each(metricKey1, function (v) {
                        $scope.metricKeyArr[v] = [];
                        _.each(arr[v], function (o) {
                            $scope.metricKeyArr[v].push({
                                key: o,
                                value: $scope.displayName[o]
                            });
                        });
                    });
                }
            };

           _customctrl.setDimTotal = function(data){
               _.each(metricCategoryKeys, function(metrics){
                   _.each($scope.metricKeyArr[metrics], function(val){
                       val.total = data[metrics][val.key];
                   });
               });
               var isPlural = $scope.reportTitle.split('').pop() != 's' ? 's' : '';
               $scope.dimTotal = 'Totals ( '+data.dimension.count+' '+$scope.reportTitle+isPlural+' )';
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

                _.each(data, function (d, index) {
                    d.dimension.level = typeofDimension;
                    d.dimension.idx = index;
                    tabData = d[activeTab];
                    _.extend(tabData, d.dimension);
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

                _.each(newData, function (d) {
                    _.each(metricDataKey, function (mkey) {
                        if (mkey !== 'dimension') {
                            _.each(d[mkey], function (value, key) {
                                found = false;

                                _.each(selectedMetrics, function (selMetItem) {
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

                _.each(elem, function (el) {
                    var fdimesnion = $.trim($(el).find('.dropdown_ul_text .dd_txt').attr('id')),
                        ftext = $(el).find('.reportFilter').val(),
                        fstr = (fdimesnion + (ftext ? (':' + ftext) : ''));

                    filterArr.push(fstr);
                });

                filterArr = _.filter(filterArr, function (val) {
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

            _customctrl.createMetricRequestParams = function (params) {
                var metricsString = '';

                if ($scope.totalMetrics === $scope.selectedMetricsList.length) {
                    metricsString = 'all';
                } else {
                    _.each(metricsTab, function (mtab) {
                        if ($scope[mtab + 'Metrics'].isAllSelected) {
                            metricsString += mtab + '_metrics:all';
                            metricsString += '~';
                        } else if ($scope[mtab + 'Metrics'].minOneSelected) {
                            metricsString += mtab + '_metrics:';

                            _.each($scope[mtab + 'Metrics'], function (eachObj) {
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

            _customctrl.createRequestParams = function(firstDimId,firstDimValue, offset, isPrimary, rowIndex_2D,dataFormat){
                var
                    dimensionDataKey = isPrimary ? 'primary' : 'secondary',
                    filterDataKey = isPrimary ? 'secondary' : 'primary',
                    requestStr = 'dimension=',
                    nameFilter='',
                    idFilter='',
                    nameFilterExactMatch=''
                    ;

                if (isPrimary && (dataFormat !== 'csv')) {
                    $scope.reportTitle = $scope.reports.reportDefinition.dimensions[dimensionDataKey].name;
                }

                $scope.isReportForMultiDimension = false;

                if ($scope.reports.reportDefinition.dimensions[filterDataKey].dimension) {
                    $scope.isReportForMultiDimension = true;

                    if ((isPrimary) && (dataFormat !== 'csv')) {
                        $scope.reportTitle += ' by ' + $scope.reports.reportDefinition.dimensions[filterDataKey].name;
                    }
                }


                //attach primary and secondary key(if selected)
                if(isPrimary){
                    //for Primary level attach only primary key though secondary key is also selected.
                    requestStr+= $scope.reports.reportDefinition.dimensions.primary.dimension;
                } else {
                    //for Secondary level attach only secondary key though primary key is also selected.
                    requestStr+= $scope.reports.reportDefinition.dimensions.secondary.dimension;
                }

                //attach key for download
                if((dataFormat && dataFormat === 'csv') && (isPrimary)){
                    requestStr+= ','+ $scope.reports.reportDefinition.dimensions.secondary.dimension;
                }

                //if($scope.reports.reportDefinition.dimensions.secondary.dimension) {
                  //  requestStr+=','+$scope.reports.reportDefinition.dimensions.secondary.dimension;
               // }

                //make primary and secondary value(if selected)
                if($scope.reports.reportDefinition.dimensions.primary.value) {
                    if($scope.reports.reportDefinition.dimensions.primary.id) {
                        idFilter ='id_filter='+$scope.reports.reportDefinition.dimensions.primary.dimension+':'+$scope.reports.reportDefinition.dimensions.primary.id;
                    } else {
                        nameFilter = 'name_filter='+
                            $scope.reports.reportDefinition.dimensions.primary.dimension+':'+$scope.reports.reportDefinition.dimensions.primary.value;
                    }

                }

                if($scope.reports.reportDefinition.dimensions.secondary.value) {
                    if($scope.reports.reportDefinition.dimensions.secondary.id){
                        if(idFilter) {
                            idFilter += '~'+$scope.reports.reportDefinition.dimensions.secondary.dimension+':'+$scope.reports.reportDefinition.dimensions.secondary.id;
                        } else {
                            idFilter ='id_filter='+$scope.reports.reportDefinition.dimensions.secondary.dimension+':'+$scope.reports.reportDefinition.dimensions.secondary.id;
                        }
                    } else {
                        if(nameFilter) {
                            nameFilter+= '~'+ $scope.reports.reportDefinition.dimensions.secondary.dimension+':'+$scope.reports.reportDefinition.dimensions.secondary.value;
                        } else {
                            nameFilter = 'name_filter='+
                                $scope.reports.reportDefinition.dimensions.secondary.dimension+':'+$scope.reports.reportDefinition.dimensions.secondary.value;
                        }
                    }
                }

                //additional filter
                if ($scope.additionalFilters.length > 0) {
                    _.each($scope.additionalFilters, function (eachObj) {

                        // if id and value pair
                        if(eachObj.id) {
                            if(idFilter) {
                                idFilter += '~'+eachObj.key+':'+eachObj.id;
                            } else {
                                idFilter ='id_filter='+eachObj.key+':'+eachObj.id;
                            }
                        } else if (eachObj.id === 0) {
                            //comes here when there is no id but only name bascially for ad_kPI,..etc there are no id:name pair
                            if(nameFilterExactMatch && eachObj.value){
                                nameFilterExactMatch += '~'+eachObj.key+':'+eachObj.value;
                            } else if(eachObj.value){
                                nameFilterExactMatch = 'name_filter_exact_match='+eachObj.key+':'+eachObj.value;
                            }
                        } else {
                            //comes here when filter is not selected from the auto suggestion dropdown
                            if(nameFilter){
                                if(eachObj.value) {
                                    nameFilter += '~'+eachObj.key+':'+eachObj.value;
                                } /*else if($scope.autoFill[index].text){
                                    nameFilter += '~'+eachObj.key+':'+$scope.autoFill[index].text;
                                }*/
                            } else {
                                if(eachObj.value) {
                                    nameFilter = 'name_filter='+eachObj.key+':'+eachObj.value;
                                }/* else if($scope.autoFill[index] && $scope.autoFill[index].text){
                                    nameFilter = 'name_filter='+eachObj.key+':'+$scope.autoFill[index].text;
                                }*/
                            }
                        }
                    }); // each
                }// end of if

                //attach idFilter
                requestStr += (idFilter)?'&'+idFilter:'';

                //attach name filter
                requestStr += (nameFilter)?'&'+nameFilter:'';

                //attach nameFilterExactMatch
                requestStr += (nameFilterExactMatch)?'&'+nameFilterExactMatch:'';

                //attach datasource
                requestStr += ($scope.reports.reportDefinition.dataSource && $scope.dataSource.showDataSource)?'&data_source='+$scope.reports.reportDefinition.dataSource:'';

                // timeframe
                requestStr += '&start_date=' + $scope.reports.reportDefinition.timeframe.start_date + '&end_date=' + $scope.reports.reportDefinition.timeframe.end_date;

                //Page no
                requestStr += '&page_num=' + (isPrimary ? _customctrl.reportPageNum_1D : _customctrl.reportPageNum_2D[$scope.activeTab][rowIndex_2D]);

                //attach first_dim_id_filter or first_dim_name_filter if it's second level dimension (after generation the report click on icon to the left of each row)
                if(!isPrimary) {
                    if(firstDimId > 0) {
                        requestStr += '&first_dim_id_filter='+$scope.reports.reportDefinition.dimensions.primary.dimension+':'+ firstDimId;
                    } else {
                        requestStr += '&first_dim_name_filter='+$scope.reports.reportDefinition.dimensions.primary.dimension+':'+firstDimValue;
                    }
                }

                // metrics attach string
                requestStr = _customctrl.createMetricRequestParams(requestStr);



                return requestStr;
            };

            _customctrl.errorHandler = function () {
                $scope.reportDataLoading = false;
                $scope.reportDataNotFound = true;
                $scope.generateBtnDisabled = false;
            };

            _customctrl.fetchCustomReportData = function (selectedMetricsList, params, idx, successCallbackHandler, errorCallbackHandler) {
                var dropdownElem = $('#reportBuilderForm'),
                    reportId = dropdownElem.find('.dd_txt').attr('data-template_id');

                $scope.generateBtnDisabled = true;

                dataService
                    .getCustomReportData(vistoconfig.getMasterClientId(), reportId, params)
                    .then(function (result) {
                        requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);

                        if (result && result.data.data) {
                            successCallbackHandler(result.data.data, idx);
                        } else {
                            errorCallbackHandler(idx);
                        }
                    }, function (idx) {
                        errorCallbackHandler(idx);
                    });
            };

            _customctrl.getCustomReportData = function () {
                var paramsObj = _customctrl.createRequestParams(null,null, $scope.firstDimensionoffset, 1);

                _customctrl
                    .fetchCustomReportData($scope.selectedMetricsList, paramsObj, null, function (respData) {
                        $scope.fetching = false;
                        $scope.generateBtnDisabled = false;
                        _customctrl.isReportLastPage_1D = respData.last_page;
                        if((respData.total_data) && (respData.total_data[0])){
                            _customctrl.setDimTotal(respData.total_data[0]);
                        }
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

                            _.each(respData, function () {
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

                _.each(metricsInTabOrder, function (mTab) {
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

            _customctrl.loadMoreItems = function () {
                $scope.firstDimensionoffset += $scope.limit;

                if (!_customctrl.isReportLastPage_1D) {
                    $scope.fetching = true;
                    _customctrl.reportPageNum_1D += 1;
                    _customctrl.getCustomReportData();
                }
            };

            _customctrl.hideSecondDimensionData = function (firtDimensionElem, secondDimensionElem) {
                secondDimensionElem.hide();
                firtDimensionElem.removeClass('active treeOpen noDataOpen');
                firtDimensionElem.find('.more_dimension_arrow').addClass('icon-toggleclose');
            };

            _customctrl.isInputsChangedAfterGenerate = function (oldJSON, newJSON) {
                var retVal = false,
                    hasDim = false;

                if (oldJSON.dimensions.hasOwnProperty('primary')) {
                    _.each(newJSON.dimensions, function (item) {
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

                    _.each(newJSON.dimensions, function (item) {
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

            _customctrl.createJSONforPage = function (activeTab) {
                var pageData = ['reportPageNum_2D', 'isReportLastPage_2D'];

                _.each(pageData, function (d) {
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

            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            // If account changed then clear intermediately saved data
            intermediateSavedData = JSON.parse(localStorage.getItem('customReport'));

            if ((intermediateSavedData) && (Number(intermediateSavedData.client_id) !== Number($routeParams.accountId))) {
                localStorage.removeItem('customReport');
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
            $scope.reports.reportDefinition.dataSource = '';

           // $scope.autoFill = {};

            $scope.reports.reportDefinition.timeframe.start_date = moment()
                .subtract(1, 'day')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.reports.reportDefinition.timeframe.end_date = moment()
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

            $scope.reports.schedule.startDate = moment()
                .subtract(0, 'days')
                .format(constants.DATE_UTC_SHORT_FORMAT);

            $scope.reports.schedule.endDate = moment()
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

            $scope.metrics = (function () {
                return {
                    /*
                     Functionality:  Set the object passed to apiMetrics variable
                     param: metricsDataObj - The response of meta API call Object
                     */
                    initializeMetricData: function (metricsDataObj) {
                        apiMetrics = metricsDataObj;
                        $scope.totalMetrics = $scope.metrics.getTotalMetrics();
                    },

                    /*
                     Functionality:  From Meta API call, calculates the total metrics in metric obj
                     */
                    getTotalMetrics: function () {
                        var metricsObj = apiMetrics.metrics,
                            metricsCount = 0;

                        _.each(metricsObj,function (metricTypeDataArr) {
                            if (metricTypeDataArr && Array === metricTypeDataArr.constructor) {
                                metricsCount+= metricTypeDataArr.length;
                            } else {
                                console.log('API issue - meta call metric obj');
                            }
                        });

                        return metricsCount;
                    },

                    /*
                     Functionality: initialize all metrics and disables it.
                     */
                    initializeMetrics: function () {
                        $scope.selectedMetricsList = [];

                        _.each(metricCategoryKeys, function (metricTypeWithUnderscore) {
                            $scope.metrics.disableSpecifiedMetrics(metricTypeWithUnderscore);
                        });

                        $scope.allMetrics = false;
                        $scope.isAllSelectDisabled = true;
                        $scope.showMetricsButton = false;

                        if ($scope.reports.reportDefinition.dimensions.primary.dimension) {
                            $scope.showMetricsButton = true;
                        }

                        $scope.metrics.setMetrixText();
                    },

                    /*
                     Functionality: Enable and select all metrics under all type(delivery,cost,...)
                     */
                    enableAndSelectAllMetrics: function () {
                        var apiMetricsObj = apiMetrics.metrics;

                        $scope.selectedMetricsList = [];

                        //metricType eg: delivery_metrics
                        _.each(apiMetricsObj, function (metricTypeArr,metricType) {
                            var eachMetricName = metricType.split('_')[0] + 'Metrics',
                                totalMetricName = 'total' + eachMetricName.toString().charAt(0).toUpperCase() + eachMetricName.slice(1);

                            $scope[eachMetricName] = [];

                            _.each(metricTypeArr,function (eachMetric) {
                                $scope[eachMetricName].push({
                                    key: eachMetric,
                                    value: $scope.displayName[eachMetric],
                                    selected: true,
                                    isDisabled: false
                                });

                                $scope.selectedMetricsList.push({
                                    key: eachMetric,
                                    value: $scope.displayName[eachMetric]
                                });
                            });

                            $scope[totalMetricName] = $scope[eachMetricName].length;
                            $scope[eachMetricName].isAllSelected = true;
                            $scope[eachMetricName].minOneSelected = true;
                            $scope[eachMetricName].isDisabled = false;
                        });

                        //select checkbox "select All"
                        $scope.allMetrics = true;
                        $scope.isAllSelectDisabled = false;
                    },

                    /*
                     Functionality: Enables all the metrics under a single type for eg: all metrics under
                     deliveryMetrics/costMetrics
                     Params: metricTypeWithUnderscore - holds the metrictype with underscore eg: delivery_metrics
                     */
                    enableAndSelectSpecifiedMetrics: function (metricTypeWithUnderscore) {
                        var apiMetricsObj = apiMetrics.metrics,
                            eachMetricName = metricTypeWithUnderscore.split('_')[0]+'Metrics',
                            totalMetricName = 'total' + eachMetricName.toString().charAt(0).toUpperCase() + eachMetricName.slice(1);

                        $scope[eachMetricName] = [];

                        _.each(apiMetricsObj[metricTypeWithUnderscore],function (dimensionKey) {
                            $scope[eachMetricName].push({
                                key: dimensionKey,
                                value: $scope.displayName[dimensionKey],
                                selected: true,
                                isDisabled: false
                            });

                            $scope.selectedMetricsList.push({
                                key: dimensionKey,
                                value: $scope.displayName[dimensionKey]
                            });
                        });

                        $scope[totalMetricName] = $scope[eachMetricName].length;
                        $scope[eachMetricName].isAllSelected = true;
                        $scope[eachMetricName].minOneSelected = true;
                        $scope[eachMetricName].isDisabled = false;
                    },

                    /*
                     Functionality:  Enables only metrics sent in 'metricsToEnableArr' and disable others
                     Params: metricTypeWithUnderscore - holds the metrictype with underscore eg: delivery_metrics
                     Params: metricsToEnableArr - holds the metrics to enable
                     */
                    enableAndSelectFewMetrics: function (metricTypeWithUnderscore,metricsToEnableArr) {
                        var apiMetricsObj = apiMetrics.metrics,
                            eachMetricName = metricTypeWithUnderscore.split('_')[0]+'Metrics',
                            totalMetricName = 'total' + eachMetricName.toString().charAt(0).toUpperCase() + eachMetricName.slice(1);

                        $scope[eachMetricName] = [];
                        $scope[totalMetricName] = 0;

                        _.each(apiMetricsObj[metricTypeWithUnderscore], function (dimensionKey) {
                            var foundAt = _.indexOf(metricsToEnableArr,dimensionKey);

                            $scope[eachMetricName].push({
                                key: dimensionKey,
                                value: $scope.displayName[dimensionKey],
                                selected: (foundAt >= 0)?true:false,
                                isDisabled: (foundAt >= 0)?false:true
                            });

                            if (foundAt >= 0) {
                                $scope[totalMetricName]++;

                                $scope.selectedMetricsList.push({
                                    key: dimensionKey,
                                    value: $scope.displayName[dimensionKey]
                                });
                            }
                        });

                        $scope[eachMetricName].isAllSelected = false;
                        $scope[eachMetricName].minOneSelected = true;
                        $scope[eachMetricName].isDisabled = true;
                        $scope.isAllSelectDisabled = true;
                    },

                    /*
                     Functionality:  Disables all the Metrics passed in array
                     Params: metricTypeWithUnderscore - holds the metrictype with underscore eg: delivery_metrics
                     */
                    disableSpecifiedMetrics: function (metricTypeWithUnderscore) {
                        var apiMetricsObj = apiMetrics.metrics,
                            eachMetricName = metricTypeWithUnderscore.split('_')[0] + 'Metrics',
                            totalMetricName;

                        $scope[eachMetricName] = [];

                        _.each(apiMetricsObj[metricTypeWithUnderscore],function (dimensionKey) {
                            $scope[eachMetricName].push({
                                key: dimensionKey,
                                value: $scope.displayName[dimensionKey],
                                selected: false,
                                isDisabled: true
                            });
                        });

                        totalMetricName = 'total' + eachMetricName.toString().charAt(0).toUpperCase() + eachMetricName.slice(1);

                        $scope[totalMetricName] = 0;
                        $scope[eachMetricName].isAllSelected = false;
                        $scope[eachMetricName].minOneSelected = false;
                        $scope[eachMetricName].isDisabled = true;
                        $scope.isAllSelectDisabled = true;
                    },

                    unSelectAvailableMetrics: function () {
                        var availableMetricKeys = _.pluck($scope.selectedMetricsList, 'key');

                        _.each(metricVarKeys,function (eachMetricType) {
                            var totalMetricName = 'total' + eachMetricType.toString().charAt(0).toUpperCase() + eachMetricType.slice(1),
                                specifiedMetricKey = eachMetricType.replace('Metrics','');

                            _.each($scope[eachMetricType],function (eachObj,index) {
                                var foundAt = _.indexOf(availableMetricKeys,eachObj.key);

                                if (foundAt >=0) {
                                    $scope[eachMetricType][index].selected = false;
                                }

                            });

                            $scope[eachMetricType].isAllSelected = false;
                            $scope[eachMetricType].minOneSelected = false;

                            //enable or disable metricType selection
                            $scope[eachMetricType].isDisabled = false;

                            if (specifiedMetricCount[specifiedMetricKey] === 0) {
                                $scope[eachMetricType].isDisabled = true;
                            }

                            $scope[totalMetricName] = 0;
                        });
                    },

                    selectMetricsAvailable: function () {
                        _.each(metricVarKeys,function (eachMKey) {
                            $scope.selectedMetricsList = [];
                            _.each($scope[eachMKey],function (eachMetric) {
                                if (!eachMetric.isDisabled) {
                                    eachMetric.selected = true;

                                    $scope.selectedMetricsList.push({
                                        key: eachMetric.key,
                                        value: eachMetric.value
                                    });

                                    $scope[eachMKey].isAllSelected = true;
                                    $scope[eachMKey].minOneSelected = true;
                                    $scope[eachMKey].isDisabled = false;
                                }
                            });
                        });
                    },

                    unselectMetricsAvailable: function () {
                        _.each(metricVarKeys,function (eachMKey) {
                            _.each($scope[eachMKey],function (eachMetric) {
                                if (!eachMetric.isDisabled) {
                                    eachMetric.selected = false;
                                    $scope[eachMKey].isAllSelected = false;
                                    $scope[eachMKey].minOneSelected = false;
                                    $scope[eachMKey].isDisabled = false;
                                }
                            });
                        });

                        $scope.selectedMetricsList = [];
                    },

                    /*
                     Called: When user clicks on 'select metrics Available'
                     */
                    selectUnSelectAvailableMetrics: function () {
                        if ($scope.allMetrics) {
                            if (!$scope.reports.reportDefinition.dimensions.secondary.dimension) {
                                $scope.metrics.onPrimaryDimensionSelection();
                            } else {
                                //unselect all available metrics
                                $scope.metrics.selectMetricsAvailable();
                            }
                        } else {
                            //$scope.metrics.unSelectAvailableMetrics();
                            $scope.metrics.unselectMetricsAvailable();
                        }
                    },

                    /*
                    Description: Only Enables all metrics
                     */
                    enableMetrics: function () {
                        var apiMetricsObj = apiMetrics.metrics;

                        //metricType eg: delivery_metrics
                        _.each(apiMetricsObj,function (metricTypeArr,metricType) {
                            var eachMetricName = metricType.split('_')[0] + 'Metrics';

                            _.each(metricTypeArr,function (eachMetric) {
                                var obj = _.find($scope[eachMetricName], function (obj) {
                                    return obj.key === eachMetric;
                                });

                                obj.isDisabled = false;
                            });

                            $scope[eachMetricName].isDisabled = false;
                        });

                        //Todo: check if required
                    },

                    enableSpecifiedMetrics: function (metricTypeWithUnderscore) {
                        var apiMetricsObj = apiMetrics.metrics,
                            eachMetricName = metricTypeWithUnderscore.split('_')[0] + 'Metrics';

                        _.each(apiMetricsObj[metricTypeWithUnderscore],function (dimensionKey) {
                            var obj = _.find($scope[eachMetricName], function (obj) {
                                return obj.key === dimensionKey;
                            });

                            obj.isDisabled = false;
                        });

                        $scope[eachMetricName].isDisabled = false;
                    },

                    enableFewMetrics: function (metricTypeWithUnderscore,metricsToEnableArr) {
                        var apiMetricsObj = apiMetrics.metrics,
                            eachMetricName = metricTypeWithUnderscore.split('_')[0] + 'Metrics';

                        _.each(apiMetricsObj[metricTypeWithUnderscore], function (dimensionKey) {
                            var foundAt = _.indexOf(metricsToEnableArr, dimensionKey),
                                obj;

                            if (foundAt >= 0) {
                                obj = _.find($scope[eachMetricName], function (obj) {
                                    return obj.key === dimensionKey;
                                });

                                obj.isDisabled = false;
                            }
                        });

                        $scope[eachMetricName].isDisabled = false;
                    },

                    /*
                     Called: when ever dimension changes
                     Functionality: It enables are disables
                     Params: metricTypeWithUnderscore - holds the metrictype with underscore eg: delivery_metrics
                     */
                    onPrimaryDimensionSelection: function () {
                        var primaryDimension = $scope.reports.reportDefinition.dimensions.primary.dimension,
                            dimSpecificMetrics = apiMetrics.dim_specific_metrics,
                            primaryDimSpecMetrics;

                        $scope.allMetrics = true;
                        $scope.metrics.setTotalMetricsOfDimension('primary');

                        if (String(primaryDimension) === 'conversion_pixel_name') {
                            $scope.dataSource.showDataSource = false;
                        } else {
                            if (!$scope.reports.reportDefinition.dataSource) {
                                $scope.dataSource.setDataSource();
                            }

                            $scope.dataSource.showDataSource = true;
                        }

                        if ((dimSpecificMetrics) && (dimSpecificMetrics[primaryDimension])) {
                            $scope.showMetricsButton = true;

                            // check whether specified dimension metric response an Array or object, if array then all,
                            // if object then selected metrics of different type(delivery,cost..)
                            // eg: "ad_format":["all"]
                            if (dimSpecificMetrics[primaryDimension] && Array === dimSpecificMetrics[primaryDimension].constructor) {
                                $scope.metrics.enableAndSelectAllMetrics();
                            } else {
                                $scope.selectedMetricsList = [];
                                primaryDimSpecMetrics = dimSpecificMetrics[primaryDimension];

                                // loop each metric type(tab) i.e Delivery, Cost, Video, Quality and Pacing for the dimension
                                _.each(metricCategoryKeys, function (metricTypeWithUnderscore) {
                                    // if primary dimension is ad_name then ad_name's delivery/cost/..
                                    // (metricTypeWithUnderscore of each loop)
                                    var metricTypePrimDimData = primaryDimSpecMetrics[metricTypeWithUnderscore],
                                        metricsToEnableArr;

                                    // check all metrics under that type of dimension(delivery/cost/..)
                                    // eg: "delivery_metrics":["all"]
                                    if (metricTypePrimDimData && Array === metricTypePrimDimData.constructor) {
                                        if ((metricTypePrimDimData.length === 1) && metricTypePrimDimData[0] === 'all') {
                                            $scope.metrics.enableAndSelectSpecifiedMetrics(metricTypeWithUnderscore);
                                        } else if ((metricTypePrimDimData.length === 1) && (metricTypePrimDimData[0] === 'NA')) {
                                            // disable Metric and each metric under that
                                            $scope.metrics.disableSpecifiedMetrics(metricTypeWithUnderscore);
                                        } else {
                                            metricsToEnableArr = primaryDimSpecMetrics[metricTypeWithUnderscore];

                                            // enable few metrics
                                            $scope.metrics.enableAndSelectFewMetrics(metricTypeWithUnderscore, metricsToEnableArr);
                                        }
                                    } else {
                                        console.log('API has not sent as an Array');
                                    }
                                });
                            }
                        } else {
                            console.log('primary dimension not in API');
                        }

                        // change the metric text and count selected
                        $scope.metrics.setMetrixText();
                        $scope.metrics.specifiedMetricCount();
                    },

                    /*
                    It disables a complete metric type(eg: pacing checkbox and it's metrics)
                     */
                    disableFirstDimensionNA: function () {
                        var primaryDimension = $scope.reports.reportDefinition.dimensions.primary.dimension,
                            dimSpecificMetrics = apiMetrics.dim_specific_metrics,
                            primaryDimSpecMetrics;

                        if ((dimSpecificMetrics) && (dimSpecificMetrics[primaryDimension])) {
                            primaryDimSpecMetrics = dimSpecificMetrics[primaryDimension];

                            _.each(metricCategoryKeys, function (metricTypeWithUnderscore) {
                                var metricTypePrimDimData = primaryDimSpecMetrics[metricTypeWithUnderscore];

                                if (metricTypePrimDimData && Array === metricTypePrimDimData.constructor) {
                                    if ((metricTypePrimDimData.length === 1) && (metricTypePrimDimData[0] === 'NA')) {
                                        $scope.metrics.disableSpecifiedMetrics(metricTypeWithUnderscore);
                                    }
                                }
                            });

                        }
                    },

                    onSecondDimensionSelection: function () {
                        var secDimension = $scope.reports.reportDefinition.dimensions.secondary.dimension,
                            dimSpecificMetrics = apiMetrics.dim_specific_metrics;

                        $scope.metrics.setTotalMetricsOfDimension('secondary');

                        if ((String(secDimension) === 'conversion_pixel_name')) {
                            $scope.dataSource.showDataSource = false;
                        } else {
                            $scope.dataSource.showDataSource = true;
                        }


                        /*
                        If first dimension is domain (pacing NA - disabled) and second dimension is Ad (All - all enabled) it works fine but when you select again second
                        dimension as Platform ( pacing NA - disabled) it will not be disabled, by calling this function it disables the first dimension unapplied metrics.
                         */
                        $scope.metrics.disableFirstDimensionNA();

                        if (dimSpecificMetrics[secDimension] && Array === dimSpecificMetrics[secDimension].constructor) {
                            $scope.metrics.enableMetrics();
                        } else {
                            _.each(metricCategoryKeys, function (metricTypeWithUnderscore) {
                                var metricTypePrimDimData = dimSpecificMetrics[secDimension][metricTypeWithUnderscore];

                                if (metricTypePrimDimData && Array === metricTypePrimDimData.constructor) {
                                    if ((metricTypePrimDimData.length === 1) && metricTypePrimDimData[0] === 'all') {
                                        $scope.metrics.enableSpecifiedMetrics(metricTypeWithUnderscore);
                                    }
                                }
                            });
                        }

                        if ($scope.metrics.getTotalSelMetrcis() !== secondaryDimensionTotalMetrics) {
                            $scope.allMetrics = false;
                        }
                    },

                    getTotalSelMetrcis:function () {
                        var mArr = ['totalDeliveryMetrics', 'totalPacingMetrics', 'totalCostMetrics', 'totalVideoMetrics', 'totalQualityMetrics'],
                            totalSelMetrics = 0;

                        _.each(mArr,function (eachTotalMtrc) {
                            totalSelMetrics+= $scope[eachTotalMtrc];
                        });

                        return totalSelMetrics;
                    },

                    setTotalMetricsOfDimension: function (dimensionLevel) {
                        // primaryDimensionTototalMetrics,
                        // secondaryDimensionTotalMetrics
                        var dimensionTotalMetrics = 0,
                            dimension,
                            apiDimSpecificMetrics,
                            dimensionData;

                        if (String(dimensionLevel) === 'primary' || String(dimensionLevel) === 'secondary') {
                            dimension = $scope.reports.reportDefinition.dimensions.primary.dimension;

                            if (String(dimensionLevel) === 'secondary') {
                                dimension = $scope.reports.reportDefinition.dimensions.secondary.dimension;
                            }

                            apiDimSpecificMetrics = $scope.customeDimensionData[0].dim_specific_metrics;
                            dimensionData = apiDimSpecificMetrics[dimension];

                            if (dimensionData && Array === dimensionData.constructor && dimensionData[0] === 'all') {
                                dimensionTotalMetrics+= $scope.metrics.getTotalMetrics();
                            } else  {
                                _.each(dimensionData,function (eachMetric,metric_name) {
                                    if ((eachMetric.length === 1) && eachMetric[0] === 'all') {
                                        dimensionTotalMetrics+= apiMetrics.metrics[metric_name].length;
                                    } else if ((eachMetric.length === 1) && (eachMetric[0] === 'NA')) {
                                        dimensionTotalMetrics+= 0;
                                    } else {
                                        dimensionTotalMetrics+= eachMetric.length;
                                    }
                                });
                            }

                            (String(dimensionLevel) === 'primary') ?
                                (primaryDimensionTototalMetrics=dimensionTotalMetrics) :
                                (secondaryDimensionTotalMetrics = dimensionTotalMetrics);
                        }
                    },

                    getTotalMetricsOfDimension: function (dimensionLevel) {
                      if (String(dimensionLevel) === 'primary')  {
                        return primaryDimensionTototalMetrics;
                      } else if (String(dimensionLevel) === 'primary') {
                          return secondaryDimensionTotalMetrics;
                      }
                    },

                    specifiedMetricCount: function () {
                        _.each(metricsTab,function (eachMetric) {
                            var totalMetricName = 'total' + eachMetric.toString().charAt(0).toUpperCase() + eachMetric.slice(1) + 'Metrics';

                            specifiedMetricCount[eachMetric] = $scope[totalMetricName];
                        });
                    },

                    OnSelectUnselectAllMetrics: function () {
                        var metricsTab = ['delivery', 'pacing', 'cost', 'video', 'quality'];

                        _.each(metricsTab, function (mTab) {
                            $scope[mTab + 'Metrics'].isAllSelected = $scope.allMetrics;

                            _.each($scope[mTab + 'Metrics'], function (eachObj) {
                                eachObj.selected = $scope.allMetrics;
                            });

                            $scope[mTab + 'Metrics'].minOneSelected = true;

                            if (!$scope[mTab + 'Metrics'].isAllSelected) {
                                $scope[mTab + 'Metrics'].minOneSelected = false;
                            }
                        });
                    },

                    setMetrixText: function () {
                        $scope.metrics_text = $scope.selectedMetricsList.length+' Selected';
                    },

                    selectAvailableMetrics: function () {
                        var isAllSelected = true;

                        _.each(metricVarKeys,function (eachVarKey) {
                            if (!$scope[eachVarKey].isAllSelected) {
                                isAllSelected = false;
                                return;
                            }
                        });

                        if (isAllSelected) {
                            $scope.allMetrics = true;
                        }
                    }
                };
            })();

            $scope.reports.client_id = vistoconfig.getMasterClientId();

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
                    value: '',
                    id:''
                };

                $scope.showAddBreakdownButton = true;
                $scope.metrics.onPrimaryDimensionSelection();
            };

            $scope.getMessageForDataNotAvailable = function () {
                return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
            };

            $scope.resetFlashMessage = function () {
                $rootScope.setErrAlertMessage('', 0);
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
                    _customctrl.getCustomReportData();
                    _customctrl.inputDataOnGenerate = JSON.parse(JSON.stringify($scope.reports.reportDefinition));

                    str = $scope.reports.reportDefinition.dimensions.primary.dimension + ':' +
                        $scope.reports.reportDefinition.dimensions.primary.value + '&';

                    if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                        str += '&filter=' + $scope.reports.reportDefinition.dimensions.secondary.dimension +
                            ':' + $scope.reports.reportDefinition.dimensions.secondary.value + '&';
                    }

                    if ($scope.additionalFilters.length > 0) {
                        _.each($scope.additionalFilters, function (eachObj) {
                            str += eachObj.key + ':' + eachObj.value + '&';
                        });
                    }
                }
            };

            $scope.createData = function (isIntermediateSave) {
                var requestData = {};

                requestData.reportDefinition = {};
                requestData.schedule = {};
                requestData.reportDefinition.timeframe = {};
                requestData.reportDefinition.metrics = {};
                requestData.reportDefinition.filters = [];
                requestData.reportDefinition.dimensions = [];
                requestData.name = '';
                requestData.client_id = vistoconfig.getMasterClientId();
                requestData.name = $scope.reports.name;
                requestData.reportDefinition.timeframe = $scope.reports.reportDefinition.timeframe;
                requestData.reportDefinition.metrics = $scope.reports.reportDefinition.metrics;
                requestData.schedule = $scope.reports.schedule;
                requestData.isScheduled = $scope.scheduleReportActive;

                if ($scope.reportTypeSelect === 'Save') {
                    if (!$scope.reports.schedule) {
                        $scope.reports.schedule = {};
                    }
                    $scope.reports.schedule.occurance = '';
                } else {
                    requestData.schedule.occurance = $scope.reports.schedule.occurance;
                }

                requestData.reportDefinition.dimensions.push({
                    dimension: $scope.reports.reportDefinition.dimensions.primary.dimension,
                    type: 'Primary'
                });

                if ($scope.reports.reportDefinition.dimensions.primary.value || isIntermediateSave) {
                    requestData.reportDefinition.filters.push({
                        dimension: $scope.reports.reportDefinition.dimensions.primary.dimension,
                        type: 'Primary',
                        value: $scope.reports.reportDefinition.dimensions.primary.value,
                        id: ($scope.reports.reportDefinition.dimensions.primary.id)?$scope.reports.reportDefinition.dimensions.primary.id:''
                    });
                }

                if ($scope.valueWithDefault($scope.reports.schedule, 'frequency') === 'Once') {
                    $scope.reports.schedule.endDate = $scope.reports.schedule.startDate;
                }

                if ($scope.reports.reportDefinition.dimensions.secondary.name) {
                    requestData.reportDefinition.dimensions.push({
                        dimension: $scope.reports.reportDefinition.dimensions.secondary.dimension,
                        type: 'Secondary'
                    });
                }

                if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                    requestData.reportDefinition.filters.push({
                        dimension: $scope.reports.reportDefinition.dimensions.secondary.dimension,
                        type: 'Secondary',
                        value: $scope.reports.reportDefinition.dimensions.secondary.value,
                        id: ($scope.reports.reportDefinition.dimensions.secondary.id)?$scope.reports.reportDefinition.dimensions.secondary.id:''
                    });
                }

                //additional filters don't add to request if the value is not there
                _.each($scope.additionalFilters, function (eachObj) {
                  //  console.log('intermediate',index,$scope.autoFill[index].text);
                   if(isIntermediateSave) {
                       var eachObjValue = '';
                       var eachObjId = '';

                       if(eachObj.value) {
                           eachObjValue = eachObj.value;
                           if(eachObj.id) {
                               eachObjId = eachObj.id;
                           }
                       }
                       requestData.reportDefinition.filters.push({
                           dimension: eachObj.key,
                           type: 'Additional',
                           value: eachObjValue,
                           id: eachObjId,
                         //  autoFillIndex:index
                       });
                   } else {
                       if (eachObj.value) {
                           requestData.reportDefinition.filters.push({
                               dimension: eachObj.key,
                               type: 'Additional',
                               value: eachObj.value,
                               id:eachObj.id?eachObj.id:''
                           });
                       }
                   }
                });




                if ($scope.reportTypeSelect === 'Schedule As') {
                    if (!$scope.reports.schedule.customOccuranceDate) {
                        $scope.reports.schedule.customOccuranceDate = '';
                        requestData.schedule.customOccuranceDate = '';
                    }
                }

                if ($scope.reports.reportDefinition.dataSource && $scope.dataSource.showDataSource) {
                    //str += '&data_source='+$scope.reports.reportDefinition.dataSource;
                    requestData.reportDefinition.data_source = $scope.reports.reportDefinition.dataSource;
                }

                return requestData;
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

            $scope.createScheduledReport = function () {
                if ($scope.verifyReportInputs()) {
                    dataService
                        .createScheduleReport(vistoconfig.getMasterClientId(), $scope.createData())
                        .then(function (result) {
                            if (result.data.status_code === 200) {
                                $rootScope.setErrAlertMessage('Success: The scheduled Report is listed.', 0);
                                $location.url(urlBuilder.customReportsListUrl());
                            }
                        });
                }
            };

            $scope.createSavedReport = function () {
                var newObjNoSched,
                    key;

                if ($scope.verifyReportInputs()) {
                    newObjNoSched = $scope.createData();
                    key = 'schedule';
                    delete newObjNoSched[key];
                    $scope.isSavedReportGen = true;

                    dataService
                        .createSaveReport(vistoconfig.getMasterClientId(), newObjNoSched)
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
                    params = _customctrl.createRequestParams(null,null, $scope.firstDimensionoffset, 1, 0, 'csv');

                $scope.reportDownloadBusy = true;

                dataService
                    .downloadFile(urlService.downloadGeneratedRpt(vistoconfig.getMasterClientId(), reportId), 'POST', params, {'Content-Type': 'text/plain'})
                    .then(function (response) {
                        if (response.status === 'success') {
                            saveAs(response.file, response.fileName);
                            $scope.reportDownloadBusy = false;

                            if (($scope.schdReportList) &&
                                ($scope.schdReportList[parentIndex].instances[instanceIndex].length > 0)) {
                                $scope.schdReportList[parentIndex].instances[instanceIndex].viewedOn =
                                    momentService.reportDateFormat();
                            }

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

            $scope.fetchMoreSecondDimensionData = function (ev, id, value, rowIndex, loadMore) {
                _customctrl.reportPageNum_2D[$scope.activeTab][rowIndex] += 1;
                $scope.showDataForClikedDimension(ev, id, value, rowIndex, loadMore);
            };

            $scope.deepLinking = (function () {
                return {
                    mediaplan: function (dimension, curRowIndx, curSecDimIndx) {
                        var dimensionData,
                            mediaPlanId,
                            url = '/a/' + $routeParams.accountId,
                            subAccountId;

                        if (dimension === 'first_dimension') {
                            dimensionData = $scope.reportMetaData[dimension][curRowIndx].dimension;
                        } else {
                            dimensionData = $scope.reportMetaData[dimension][curRowIndx][curSecDimIndx].dimension;
                        }

                        mediaPlanId = dimensionData.id;
                        subAccountId = dimensionData.client_id;

                        if (subAccountId) {
                            url += '/sa/' + subAccountId;
                        }

                        if (mediaPlanId && $scope.isMediaPlanAccessible) {

                            url += '/mediaplan/' + mediaPlanId + '/overview';
                            $location.url(url);
                        }

                        return false;
                    },

                    ad: function (dimension, curRowIndx, curSecDimIndx) {
                        var dataObj,
                            adGroupId,
                            mediaPlanId,
                            adId,
                            lineItemId,
                            advertiserId,
                            url = '/a/' + $routeParams.accountId,
                            subAccountId;

                        if (dimension === 'first_dimension') {
                            dataObj = $scope.reportMetaData[dimension][curRowIndx].dimension;
                        } else {
                            dataObj = $scope.reportMetaData[dimension][curRowIndx][curSecDimIndx].dimension;
                        }

                        adGroupId = dataObj.ad_group_id;
                        mediaPlanId = dataObj.campaign_id;
                        adId = dataObj.id;
                        advertiserId = dataObj.advertiser_id;
                        lineItemId = dataObj.lineitem_id;
                        subAccountId = dataObj.client_id;

                        if (subAccountId) {
                            url += '/sa/' + subAccountId;
                        }

                        if ((adGroupId !== -1) && (mediaPlanId !== -1) && (adId !== -1) && (lineItemId !== -1) &&
                            ($scope.isAdAccessible)) {
                            url +=  '/adv/'+ advertiserId +'/mediaplan/' + mediaPlanId +
                                '/lineItem/' + lineItemId +
                                '/adGroup/' + adGroupId +
                                '/ads/' + adId +
                                '/edit';

                            $location.url(url);
                        }
                    },

                    setSubAccount: function (id, name) {
                        loginModel.setSelectedClient({
                            id: id,
                            name: name
                        });

                        campaignSelectModel
                            .getCampaigns(-1, {limit: 1, offset: 0})
                            .then(function (response) {
                                if (response.length > 0) {
                                    $scope.selectedCampaign = response[0].campaign_id;

                                    var firstCampaign = {
                                        'id':response[0].campaign_id,
                                        'name':response[0].name,
                                        'startDate':response[0].start_date,
                                        'endDate':response[0].end_date,
                                        'kpi':response[0].kpi_type,
                                        'redirectWidget': ''
                                    };

                                    localStorageService.selectedCampaign.set(firstCampaign);
                                }
                            });
                    },

                    routeToLink: function (ev, dimension, curSecDimIndx) {
                        var currFirstDimensionElem = $(ev.target).parents('.reportData'),
                            currentRowIndex = Number(currFirstDimensionElem.attr('data-result-row')),
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

            $scope.showDataForClikedDimension = function (ev, id,value, rowIndex, loadMore) {
                var currFirstDimensionElem = $(ev.target).parents('.reportData'),
                    currSecondDimensionElem = currFirstDimensionElem.find('.second_dimension_row_holder'),
                    currentRowIndex = Number(currFirstDimensionElem.attr('data-result-row')),
                    paramsObj,
                    initiallyActiveTab = $scope.activeTab;

                if (!currFirstDimensionElem.hasClass('treeOpen') &&
                    _customctrl.isInputsChangedAfterGenerate(_customctrl.inputDataOnGenerate, $scope.createData().reportDefinition) &&
                    $scope.isReportForMultiDimension !== false) {
                    $rootScope.setErrAlertMessage('Please regenerate the page, input data had changed');

                    return;
                }

                if (loadMore === undefined) {
                    $scope.reportMetaData.second_dimension = {};
                }

                if (!currFirstDimensionElem.hasClass('treeOpen') || loadMore) {
                    if (!$scope.isReportForMultiDimension) {
                        return false;
                    }

                    if (_customctrl.isReportLastPage_2D[currentRowIndex]) {
                        currFirstDimensionElem.addClass('active');
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

                    paramsObj = _customctrl.createRequestParams(id,value, $scope.secondDimensionOffset, 0, currentRowIndex);

                    _customctrl.fetchCustomReportData($scope.selectedMetricsList, paramsObj, currentRowIndex, function (respData, currentRowIndex) {
                        var resultLen;

                        // TODO: Is the comma expression below intentional or not? (Lalding: 12th July 2016)
                        if ($scope.activeTab, $scope.secDimensionLoadIcon[$scope.activeTab] !== undefined &&
                            (initiallyActiveTab === $scope.activeTab)) {
                            $scope.secDimensionLoadIcon[$scope.activeTab][currentRowIndex] = false;
                            currFirstDimensionElem.addClass('active');
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
                                    currFirstDimensionElem.removeClass('noDataOpen');
                                    _customctrl.getMetricValues(respData, $scope.selectedMetricsList,
                                        'second_dimension', currentRowIndex, loadMore);

                                } else {
                                    if (_customctrl.reportPageNum_2D[$scope.activeTab][currentRowIndex] === 1) {
                                        $scope.secondDimensionReportDataNotFound[$scope.activeTab]
                                            [currentRowIndex] = true;

                                        currFirstDimensionElem.addClass('noDataOpen');
                                    }
                                }
                            }

                            currFirstDimensionElem.addClass('treeOpen');

                            currFirstDimensionElem
                                .find('.more_dimension_arrow')
                                .removeClass('icon-toggleclose')
                                .addClass('icon-toggleopen');
                        } else {
                            _.each($scope.secondDimensionReportLoading,
                                function (value, sdrlkey) {
                                    _.each(value, function (value, key) {
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
                            currFirstDimensionElem.addClass('noDataOpen');
                        }
                    });

                    $scope.generateBtnDisabled = false;
                } else {
                    // hide the second dimension data for clcked row
                    if ($(ev.target).closest('.second_dimension_row').length === 0) {
                        _customctrl.hideSecondDimensionData(currFirstDimensionElem, currSecondDimensionElem);
                    }
                }
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
                        //clean the text primary dimension text box when they change the dimension
                        $scope.reports.reportDefinition.dimensions.primary.value = '';
                        $scope.reports.reportDefinition.dimensions.primary.id = '';

                        $('.custom_report_filter').closest('.breakdown_div').find('.filter_input_txtbox').show();
                        $scope.secondaryDimensionArr = specificFilter.hasOwnProperty(dimension) ?
                            angular.copy(specificFilter[dimension]) : angular.copy($scope.customeDimensionData[0].dimensions);

                        $scope.secondaryDimensionArr =
                            _.filter($scope.secondaryDimensionArr, function (item) {
                                return item !== 'conversion_pixel_name';
                            });

                        var newfilterList = specificFilter.hasOwnProperty(dimension) ?
                            angular.copy(specificFilter[dimension]) :
                            angular.copy($scope.customeDimensionData[0].filters);
                        $scope.filterAutoCompletion.createFilterKeyObj(newfilterList);

                        if (!$scope.reports.reportDefinition.dimensions.primary.name) {
                            $scope.showAddBreakdownButton = true;
                        }

                        $scope.reports.reportDefinition.dimensions.primary.name = $scope.displayName[dimension];
                        $scope.reports.reportDefinition.dimensions.primary.dimension = (dimension === undefined) ? dimension.dimension : dimension;

                        // if a dimension is selected as Primary it should not appear in secondary
                        _customctrl.resetMetricsPopUp();
                        removeIndex = ($scope.secondaryDimensionArr).indexOf(dimension);
                        $scope.secondaryDimensionArr.splice(removeIndex, 1);

                        // At any point if you change the primary dimension then second dimension block will be deleted and option to 'Add Dimension' will be given
                        $scope.deleteSecondDimensionBlock();
                    } else {
                        //clean the text secondary dimension text box when they change the dimension
                        $scope.reports.reportDefinition.dimensions.secondary.value = '';
                        $scope.reports.reportDefinition.dimensions.secondary.id = '';

                        $scope.showSecondaryTxtBox = true;
                        $scope.reports.reportDefinition.dimensions.secondary.name = $scope.displayName[dimension];
                        $scope.reports.reportDefinition.dimensions.secondary.dimension = (dimension === undefined) ? dimension.dimension : dimension;
                        $scope.showAddBreakdownButton = false;
                    }

                    $scope.metrics.setMetrixText();

                    //customize metric selection
                    if (String(type) === 'Primary') {
                        $scope.metrics.onPrimaryDimensionSelection();
                    } else {
                        $scope.metrics.onSecondDimensionSelection();
                    }

                }
            };

            $scope.select_additional_filters = function (event) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                elem.closest('.dropdown').find('.dd_txt').attr('id', elem.attr('id'));
                elem.closest('.breakdown_div').find('.filter_input_txtbox').show();
            };

            //called when dimension is 'choose dimension'
            $scope.select_dropdown_option = function (event, arg) {
                var elem = $(event.target);

                elem.closest('.dropdown').find('.dd_txt').text(elem.text());
                elem.closest('.dropdown').find('.dd_txt').attr('id', elem.attr('id'));
                elem.closest('.breakdown_div').find('.filter_input_txtbox').show();

                if (String(elem.text()) === 'Choose Dimension') {
                    /* when choose dimesion is selected from dimension dropdown check whether it's a primary dimension or secondary dimension, if primary remove both primary and
                    secondary dimension data and if only secondary then remove only secondary data */
                    $scope.showAddBreakdownButton = false;

                    if (String(arg) === 'primary') {
                        $scope.reports.reportDefinition.dimensions.primary.name = '';
                        $scope.reports.reportDefinition.dimensions.primary.dimension = '';
                        $scope.reports.reportDefinition.dimensions.primary.value = '';
                        $scope.reports.reportDefinition.dimensions.primary.id = '';

                        $scope.reports.reportDefinition.dimensions.secondary.name = '';
                        $scope.reports.reportDefinition.dimensions.secondary.dimension = '';
                        $scope.reports.reportDefinition.dimensions.secondary.value = '';
                        $scope.reports.reportDefinition.dimensions.secondary.id = '';

                        $scope.metrics.initializeMetrics();
                        $scope.showMetricsButton = false;
                        $scope.showSecondDimensionBlock = false;
                        $scope.dataSource.showDataSource = false;
                    } else if (String(arg) === 'secondary') {
                        $scope.reports.reportDefinition.dimensions.secondary.name = '';
                        $scope.reports.reportDefinition.dimensions.secondary.dimension = '';
                        $scope.reports.reportDefinition.dimensions.secondary.value = '';
                        $scope.reports.reportDefinition.dimensions.secondary.id = '';

                        $scope.metrics.onPrimaryDimensionSelection();
                    }
                }

                if (arg && (arg !== 'primary') && (arg !== 'secondary')) {
                    var startDate, endDate;

                    switch (arg) {
                        case 'Yesterday':
                            startDate = moment()
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Week to date':
                            startDate = moment()
                                .startOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last 7 days':
                            startDate = moment()
                                .subtract(7, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last week':
                            startDate = moment()
                                .subtract(1, 'week')
                                .startOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(1, 'week')
                                .endOf('week')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Month to date':
                            startDate = moment().format('YYYY-MM') + '-01';
                            endDate = moment().format('YYYY-M-DD');
                            break;

                        case 'Last month':
                            startDate = moment()
                                    .subtract(1, 'months')
                                    .endOf('month').format('YYYY-MM') + '-01';

                            endDate = moment()
                                .subtract(1, 'months')
                                .endOf('month')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Quarter to date':
                            startDate = moment()
                                .startOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Last quarter':
                            startDate = moment()
                                .subtract(1, 'quarter')
                                .startOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(1, 'quarter')
                                .endOf('quarter')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Year to date':
                            startDate = moment().format('YYYY') + '-01-01';

                            endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        case 'Custom dates':
                            startDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            break;

                        default:
                            startDate = moment()
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            endDate = moment()
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

                $scope.showCustomDate($scope.valueWithDefault($scope.reports.schedule.occurance, $scope.reports.schedule.frequency, ''));
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
                    headingWidth,
                    lastActiveTab = $scope.activeTab,
                    lastTabSelArr = $scope.secondDimensionReportLoading[lastActiveTab];

                if (lastTabSelArr) {
                    _.each(lastTabSelArr,function (value,key) {
                        if (value) {
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

            //local storage is cleaned when an account is changed, that piece of code is in header contoller
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

            // Fix for CRPT-5523 (End date not showing correctly.
            $scope.handleEndDate = function (endDate) {
                if (endDate !== 'NA') {
                    endDate = momentService.utcToLocalTime(endDate, 'D MMM YYYY');
                }

                return endDate;
            };
            // End of Fix for CRPT-5523

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
                        if (vistoconfig.getMasterClientId()) {
                            dataService
                                .getCustomReportMetrics(vistoconfig.getMasterClientId())
                                .then(function (result) {
                                    var modifiedDimensionArr = result.data.data[0],
                                        url;

                                    $scope.metrics.initializeMetricData(result.data.data[0]);
                                    $scope.dataSource.setDataSource(result.data.data[0].data_source);
                                    $scope.displayName = result.data.data[0].display_name;

                                    //create filter key object
                                    $scope.filterAutoCompletion.createFilterKeyObj(result.data.data[0].filters);

                                    $scope.metrics.initializeMetrics(result.data.data[0]);
                                    _customctrl.resetMetricsPopUp();
                                    $scope.customeDimensionData = result.data.data;

                                    $scope.showDefaultDimension = {
                                        key: modifiedDimensionArr.dimensions[0],
                                        value: $scope.displayName[modifiedDimensionArr.dimensions[0]]
                                    };

                                    $scope.showDefaultDimension.template_id = modifiedDimensionArr.template_id;

                                    // if edit
                                    if ($routeParams.reportId) {
                                        $('#toggle').bootstrapToggle('on');
                                        $scope.updateScheduleReport = true;
                                        $scope.buttonLabel = 'Update';
                                        $scope.buttonResetCancel = 'Cancel';

                                        if (localStorageService.scheduleListReportType.get() === 'Saved') {
                                            url = urlService.savedReport(vistoconfig.getMasterClientId(), $routeParams.reportId);
                                            $scope.isSavedReportGen = true;
                                        } else {
                                            $scope.isSavedReportGen = false;
                                            $scope.reportTypeSelect = 'Schedule As';
                                            url = urlService.scheduledReport(vistoconfig.getMasterClientId(),
                                                $routeParams.reportId);
                                        }

                                        dataStore.deleteFromCache(url);

                                        dataService
                                            .fetch(url)
                                            .then(function (response) {
                                                if (response.status === 'success') {
                                                    $scope.reportData = response.data.data;
                                                    prefillData($scope.reportData);
                                                    $('#toggle').prop('disabled', true);

                                                    $('.img_table_txt').html('Please select dimensions, timeframe and ' +
                                                        'any additional <br> parameters to update the report');

                                                    if (localStorageService.scheduleListReportType.get() === 'Saved') {
                                                        $scope.reports.name = $scope.reportData.reportName;
                                                        $scope.reports.reportDefinition.timeframe.type = 'Custom Dates';
                                                        $scope.generateReport();
                                                        slideUp();
                                                        $('#dynamicHeader').addClass('smaller');
                                                    }
                                                }
                                            });
                                    } else if (localStorage.getItem('customReport')) {
                                        localStorageService.scheduleListReportType.remove();
                                        prefillData(JSON.parse(localStorage.getItem('customReport')));
                                    }
                                });
                        }
                    };

                function monthArrayMake() {
                    var dayTo31 = [],
                        i;

                    for (i = 1; i <= 31; i++) {
                        dayTo31.push(i);
                    }

                    return dayTo31;
                }

                _customctrl.resetMetricsPopUp = function () {
                    //sapna
                    //$scope.allMetrics = true;

                    // selects all metrics initially
                    $scope.metrics.OnSelectUnselectAllMetrics();

                    $scope.saveMetrics();
                    $scope.metrics.setMetrixText();
                };

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
                        $scope.metrics.setMetrixText();
                    }
                };

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
                            theDateDifference;

                        function parseDate(str) {
                            var mdy = str.split('-');

                            return new Date(mdy[0] - 1, mdy[1], mdy[2]);
                        }

                        function daydiff(first, second) {
                            return Math.round((second - first) / (1000 * 60 * 60 * 24));
                        }

                        theDateDifference = daydiff(parseDate(startDateCheckerRange), parseDate(endDateCheckerRange));

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

                yesterday = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);

                startDateInput.datepicker('update', yesterday);
                endDateInput.datepicker('update', yesterday);

                customReportScroll.scroll(function () {
                    var documentScrollLeft = $(this).scrollLeft(),
                        documentScrollTop = $(this).scrollTop();

                    if (lastScrollLeft !== documentScrollLeft) {
                        lastScrollLeft = documentScrollLeft;
                        customReportScroll.removeClass('vertical_scroll');
                        customReportScroll.addClass('hori_scroll');
                    }

                    if (lastScrollTop !== documentScrollTop) {
                        lastScrollTop = documentScrollTop;
                        customReportScroll.addClass('vertical_scroll');
                        customReportScroll.removeClass('hori_scroll');
                    }
                });

                $scope.getNumberDate = monthArrayMake();

                // --- sapna ----
                $scope.onChoosingAditFlts = function (index, key) {
                    $scope.additionalFilters[index].hide = false;
                    $scope.additionalFilters[index].key = key;
                    $scope.additionalFilters[index].name = $scope.displayName[key];
                    $scope.additionalFilters[index].value = '';
                    $scope.additionalFilters[index].id = '';
                };

                $scope.onChoosingAditFltValue = function (event, index, autoFiltObj,scrollDim,scrollText) {
                    var elem = $(event.currentTarget);
                    elem.closest('.dropdown').find('.autofill-dropdown').hide();
                    $scope.filterAutoCompletion.onSelectingDropdown(scrollDim,scrollText);
                    $scope.additionalFilters[index].hide = false;
                    $scope.additionalFilters[index].id = autoFiltObj.id;
                    $scope.additionalFilters[index].value = autoFiltObj.name;//(autoFiltObj.id)?autoFiltObj.name+' ('+autoFiltObj.id+')':autoFiltObj.name;
                    $scope.additionalFilters[index].isAutoSelected = true;
                };


                $scope.delAditFlt = function (index) {
                    $scope.additionalFilters.splice(index, 1);
                    /*if($scope.autoFill[index]) {
                        $scope.autoFill[index].text = '';
                    }*/
                };

                $scope.addAdditionalFilters = function () {
                    $scope.additionalFilters.push({
                        key: '',
                        name: '',
                        value: '',
                        id: '',
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

                $scope.onMetricClick = function (metricType, index) {
                    var totalMetricSelected = 0,
                        selectedIndx,
                        enabledMetrics=0,
                        totalMetrics = 0,

                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        nameOfMetric = metricType.split(/(?=[A-Z])/)[0];
                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                    if (index === undefined) {
                        $scope['total' + nameOfMetric + 'Metrics'] = 0;
                        _.each($scope[metricType], function (eachObj) {
                            eachObj.selected = $scope[metricType].isAllSelected;
                            if (eachObj.selected ) {
                                $scope['total' + nameOfMetric + 'Metrics']++;
                            }
                        });
                    } else {
                        $scope[metricType][index].selected = !$scope[metricType][index].selected;
                    }

                    selectedIndx = _.findIndex($scope[metricType], function (eachObj) {
                        totalMetrics++;
                        if (eachObj.selected === true) {
                            totalMetricSelected++;
                        }
                        if (!eachObj.isDisabled) {
                            enabledMetrics++;
                        }
                    });

                    $scope['total' + nameOfMetric + 'Metrics'] = totalMetricSelected;

                    if (totalMetricSelected > 0) {
                        $scope[metricType].minOneSelected = true;

                        if (enabledMetrics === totalMetricSelected) {
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

                    $scope.metrics.selectAvailableMetrics();
                };

                // delivery Metrics
                $scope.saveMetrics = function () {
                    $scope.selectedMetricsList = [];

                    _.each(metricVarKeys, function (eachMetric) {
                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        var nameOfMetric = eachMetric.split(/(?=[A-Z])/)[0],
                            metricArray = [];

                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                        _.each($scope[eachMetric], function (eachObj) {
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

                    $scope.metrics.setMetrixText();
                    $scope.cancelMetricView();
                };

                $scope.updateScheduledOrSavedReport = function () {
                    var self = this;

                    if ($scope.verifyReportInputs()) {
                        if ($scope.reportTypeSelect === 'Save') {
                            dataService
                                .updateSavedReport(vistoconfig.getMasterClientId(), $routeParams.reportId, $scope.createData())
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
                                .updateScheduleReport(vistoconfig.getMasterClientId(), $routeParams.reportId,
                                    $scope.createData())
                                .then(function (result) {
                                    if (result.data.status_code === 200) {
                                        $rootScope.setErrAlertMessage('Scheduled report updated successfully', 0);
                                        $scope.stopRedirectingPage = false;
                                        $location.url(urlBuilder.customReportsListUrl());
                                    }
                                });
                        }
                    }
                };

                $scope.refreshMetriPopUp = function () {
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
                        $scope.updateScheduledOrSavedReport();
                        $scope.generateReport('Generate');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else if ($scope.buttonLabel === 'Generate') {
                        $scope.generateBtnDisabled = true;
                        $scope.generateReport('Generate');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else if ($scope.buttonLabel === 'Save') {
                        $scope.createSavedReport();
                        $scope.generateReport('Save');
                        $('.collapseIcon').css('visibility', 'visible');
                    } else {
                        $scope.createScheduledReport();
                        $scope.generateReport();
                        $('.collapseIcon').css('visibility', 'hidden');
                    }
                    setTimeout(function () {
                        $scope.loadingBtn = false;
                    }, 1000);
                };

                $scope.resetMetricOptions = function () {
                    if ($scope.buttonResetCancel === 'Cancel') {
                        $location.url(urlBuilder.customReportsListUrl());
                    } else if ($scope.buttonResetCancel === 'Clear') {
                        localStorage.removeItem('customReport');
                        $location.url(urlBuilder.customReportsUrl(true));
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
                        !angular.equals($scope.reports.schedule,
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

                var prefillData = function (reportData) {
                    var responseData = reportData,
                        selectedMetricVarKeys = 0;

                    $scope.additionalFilters = [];
                    $scope.reports.name = responseData.name;
                    $scope.scheduleReportActive = responseData.isScheduled;
                    $scope.generateBtnDisabled = false;
                    $scope.reports.schedule = responseData.schedule;

                    if ($scope.reports.schedule) {
                        if ($scope.reports.schedule.startDate) {
                            $scope.reports.schedule.startDate = momentService.newMoment($scope.reports.schedule.startDate).format('YYYY-MM-DD');
                        }

                        if ($scope.reports.schedule.endDate) {
                            $scope.reports.schedule.endDate = momentService.newMoment($scope.reports.schedule.endDate).format('YYYY-MM-DD');
                        }
                    }

                    $scope.reports.reportDefinition.timeframe = responseData.reportDefinition.timeframe;
                    $scope.reports.reportDefinition.dataSource = responseData.reportDefinition.data_source;

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

                    // returns name of the breakdown/filter key passed
                    var getFilterBreakdownName = function (key,isFilters) {

                        var dimensionObj = $scope.customeDimensionData[0].dimensions,
                            name;
                        if(isFilters) {
                            dimensionObj = $scope.customeDimensionData[0].filters;
                        }
                        _.each(dimensionObj, function (item) {
                            if (key.trim() === item.trim()) {
                                name = $scope.displayName[item].trim();
                            }
                        });

                        return name;
                    };

                    var setPrimaryDimension = function (obj, fromFilters) {
                        var removeIndex;

                        fromFilters = fromFilters || false;

                        // if a dimension is selected as Primary it should not appear in secondary
                        $scope.secondaryDimensionArr =
                            angular.copy($scope.customeDimensionData[0].dimensions);

                        $scope.secondaryDimensionArr =
                            _.filter($scope.secondaryDimensionArr, function (item) {
                                return item !== 'conversion_pixel_name';
                            });

                        removeIndex = ($scope.secondaryDimensionArr).indexOf(obj.dimension);

                        $scope.secondaryDimensionArr.splice(removeIndex, 1);

                        $scope.reports.reportDefinition.dimensions.primary.name =
                            getFilterBreakdownName(obj.dimension);

                        $scope.reports.reportDefinition.dimensions.primary.dimension = obj.dimension;

                        if (obj.value) {
                            $scope.reports.reportDefinition.dimensions.primary.value = obj.value;
                        }

                        if(obj.id){
                            $scope.reports.reportDefinition.dimensions.primary.id = obj.id;
                        }

                        if (!fromFilters) {
                            $scope.showAddBreakdownButton = true;
                        }

                        if ($scope.reports.reportDefinition.dimensions.primary.name) {
                            $scope.showPrimaryTxtBox = true;
                        }
                        $scope.metrics.setTotalMetricsOfDimension('primary');

                    };

                    if ($scope.reports.reportDefinition.dimensions.primary.dimension) {
                        setTimeout(function () {
                            $rootScope.$apply(function () {
                                $scope.showMetricsButton = true;
                            });
                        });
                    }

                    var setSecondaryDimension = function (obj) {
                        $scope.reports.reportDefinition.dimensions.secondary.name = getFilterBreakdownName(obj.dimension);

                        $scope.reports.reportDefinition.dimensions.secondary.dimension = obj.dimension;

                        if (obj.value) {
                            $scope.reports.reportDefinition.dimensions.secondary.value = obj.value;

                        }
                        if (obj.id) {
                                $scope.reports.reportDefinition.dimensions.secondary.id = obj.id;
                        }

                        $scope.showSecondDimensionBlock = true;
                        $scope.showSecondaryTxtBox = true;
                        $scope.showAddBreakdownButton = false;
                    };

                    // set breakdown filter
                    angular.forEach(responseData.reportDefinition.dimensions,
                        function (eachObj) {
                            if ((eachObj.type === 'Primary')) {
                                setPrimaryDimension(eachObj);
                            } else if ((eachObj.type === 'Secondary')) {
                                setSecondaryDimension(eachObj);
                            }
                        });

                    // set breakdown filter values if exist
                    angular.forEach(responseData.reportDefinition.filters,
                        function (eachObj) {
                            eachObj.name = getFilterBreakdownName(eachObj.dimension,true);

                            if ((eachObj.type === 'Primary')) {
                                setPrimaryDimension(eachObj, true);
                            } else if ((eachObj.type === 'Secondary')) {
                                setSecondaryDimension(eachObj);
                            } else if ((eachObj.type !== 'Primary') && (eachObj.type !== 'Secondary')) {
                                $scope.additionalFilters.push({
                                    key: eachObj.dimension,
                                    name: eachObj.name,
                                    value: eachObj.value,
                                    hide: false,
                                    id:eachObj.id?eachObj.id:''
                                });
                                //prefill to additional filter text box
                              //  $scope.autoFill[eachObj.autoFillIndex]={'text':eachObj.value}
                            }
                        });

                    // metrics
                    $scope.selectedMetricsList = [];

                    _.each(metricVarKeys, function (eachMetric) {
                        // eg: metricType = pacingMetrics, below 2 lines extracts only pacing and captailize
                        // first letter eg: Pacing
                        var nameOfMetric = eachMetric.split(/(?=[A-Z])/)[0];

                        nameOfMetric = nameOfMetric.toString().charAt(0).toUpperCase() + nameOfMetric.slice(1);

                        if (responseData.reportDefinition.metrics[nameOfMetric]) {
                            _.each($scope[eachMetric], function (each) {
                                var metricsObj =
                                    _.find(responseData.reportDefinition.metrics[nameOfMetric],
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

                    _.each(metricVarKeys, function (mvKeys) {
                        if ($scope[mvKeys] && $scope[mvKeys].isAllSelected) {
                            selectedMetricVarKeys++;
                        }
                    });

                    if (metricVarKeys.length === selectedMetricVarKeys.length) {
                        $scope.allMetrics = true;
                    }

                    $scope.scheduleResponseData = JSON.parse(JSON.stringify(responseData));
                    $scope.metrics.onPrimaryDimensionSelection();

                    //save metrics so that it's in reportDefinition.metrics and available for schedule
                    $scope.saveMetrics();

                    //below lines has to be after save metrics, required for selecting and enabling metrics while loading
                    if ($scope.reports.reportDefinition.dimensions.secondary.dimension) {
                        $scope.metrics.onSecondDimensionSelection();
                    }
                };

                // Get custom metrics
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

                var featureCalled = false;
                $rootScope.$on('features', function () {
                    // On client change
                    _customctrl.showCost_permission();
                    if (!featureCalled) {
                        getCustomReportMetrics();
                    }
                    featureCalled = true;
                });

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

                $scope.dataSource = (function () {
                    return {
                        dataSourceArr: {},
                        showDataSource: false,
                        getDataSource: function () {
                            return $scope.dataSource.dataSourceArr;
                        },
                        setDataSource: function (data) {

                            if (data) {
                                $scope.dataSource.dataSourceArr = data;
                            }

                            if ($scope.dataSource.dataSourceArr) {
                                // by default 'system_of_record' should be selected
                                if (_.contains($scope.dataSource.dataSourceArr,'system_of_record')) {
                                    $scope.reports.reportDefinition.dataSource = 'system_of_record';
                                } else {
                                    $scope.reports.reportDefinition.dataSource = $scope.dataSource.dataSourceArr[0];
                                }
                            }
                        },
                    };
                })();



                $scope.filterAutoCompletion = (function(){
                    $scope.filtersAutoComplArr = [];
                    $scope.scrollDimension = undefined;
                    $scope.scrollText = undefined;
                    $scope.offSet = 0;
                   // $scope.fetching = false;

                    $scope.hideVisibleDropdown = function (event) {
                        event.stopPropagation();
                        if ( $('.autofill-dropdown').is(':visible')) {
                            $('.autofill-dropdown').hide();
                        }
                    };
                    return {

                        createFilterKeyObj: function(filterData) {
                            $scope.filterList = [];
                            _.each(filterData,function(eachObj){
                                $scope.filterList.push({'key':eachObj,'name':$scope.displayName[eachObj]});
                            });
                        },

                        // If a person copy paste in filter input box then it should make an API call to check if that in auto suggestion
                        checkForAutoFltrMatch: function(filterIndex) {
                            $timeout(function() {
                                if ($scope.additionalFilters[filterIndex] && !$scope.additionalFilters[filterIndex].isAutoSelected && $scope.additionalFilters[filterIndex].value) {
                                    $scope.filterAutoCompletion.fetchFilterAutoSugtn(null, $scope.additionalFilters[filterIndex].key, $scope.additionalFilters[filterIndex].value,
                                        false,filterIndex);
                                }
                            },100);
                        },

                        fetchFilterAutoSugtn : function(event,dimension,searchKey,isLoadMoreData,index) {
                           // $scope.fetching = true;
                            $scope.filterAutoCompletion.onSelectingDropdown(dimension,searchKey);
                            if(event) {
                                var elem = $(event.currentTarget);
                                if (elem.val() !== '') {
                                    elem.closest('.dropdown').find('.autofill-dropdown').show();
                                } else {
                                    elem.closest('.dropdown').find('.autofill-dropdown').hide();
                                }
                            }

                            if(!searchKey) {
                                $scope.searchKey = '';
                                //clear additional filter data when input box empty
                                if(index && $scope.additionalFilters[index]) {
                                    $scope.additionalFilters[index].isAutoSelected = false;
                                    $scope.additionalFilters[index].id = '';
                                }

                            }

                            if(isLoadMoreData){
                                $scope.offSet+= 1;
                            } else {
                                $scope.filtersAutoComplArr = [];
                                $scope.offSet = 0;
                            }

                            if(dimension) {
                                var urlParamas = {
                                    'clientId':$routeParams.accountId,
                                    'dimension':dimension,
                                    'offset': $scope.offSet,
                                    'searchKey': searchKey
                                };
                                var url = urlService.customRptFilterAutoSugg(urlParamas),
                                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                                dataService.fetchCancelable(url, canceller, function (response) {
                                        if(response && response.data && response.data.data.length > 0){
                                            if(!$scope.filtersAutoComplArr || $scope.filtersAutoComplArr.length === 0) {
                                                $scope.filtersAutoComplArr = response.data.data;
                                            } else if($scope.filtersAutoComplArr.length >= 100) {
                                                $scope.filtersAutoComplArr = $scope.filtersAutoComplArr.concat(response.data.data);
                                            }
                                        } else {
                                            if (isLoadMoreData && $scope.filtersAutoComplArr.length > 0) {
                                                $scope.filtersAutoComplArr.noMoreData = true;
                                                $scope.filtersAutoComplArr.dataNotFound = false;
                                            } else {
                                                $scope.filtersAutoComplArr = [];
                                                $scope.filtersAutoComplArr.dataNotFound = true;
                                            }
                                        }
                                    }, function(response) {
                                        console.log('Error response:', response);
                                    });
                            }
                        },
                        onSelectingDropdown: function(scrollDimension,scrollText) {
                            $scope.scrollDimension = scrollDimension;
                            $scope.scrollText = scrollText;

                            //when you click on filter text box the filter dimension dropdown should be closed
                            $('.filter_row').find('.dropdown').removeClass('open');
                        },
                        loadMoreData: function() {
                            $scope.filterAutoCompletion.fetchFilterAutoSugtn(null,$scope.scrollDimension,$scope.scrollText,true);
                        }
                    };
                })();
                //$scope.filterAutoCompletion.fetchFilterAutoSugtn('ad_format');

                $scope.dimensionAutoFilter = (function(){
                    $scope.dimSuggestionArr = [];

                    return {
                        dimensionOffSet: 0,
                        currentDimensionLevel:'',

                        clickedDimInputBox: function(dimensionLevel) {
                            this.currentDimensionLevel = dimensionLevel;
                        },

                        // If a person copy paste in filter input box then it should make an API call to check if that in auto suggestion
                        checkForAutoFltrMatch: function() {
                            $timeout(function() {
                                $scope.dimensionAutoFilter.fetchDimensionSuggestion(null,null,false);
                            },100);
                        },

                        fetchDimensionSuggestion: function(event,dimensionLevel,isLoadMoreData){
                            if(event) {
                                var elem = $(event.currentTarget);
                                if (elem.val() !== '') {
                                    elem.closest('.dropdown').find('.autofill-dropdown').show();
                                } else {
                                    elem.closest('.dropdown').find('.autofill-dropdown').hide();
                                }
                            }

                            if(dimensionLevel) {
                                this.currentDimensionLevel = dimensionLevel;
                            } else {
                                dimensionLevel = this.currentDimensionLevel;
                            }


                            if(!$scope.reports.reportDefinition.dimensions[dimensionLevel].value) {
                                $scope.reports.reportDefinition.dimensions[dimensionLevel].id = '';
                            }


                            if(isLoadMoreData){
                                $scope.dimensionAutoFilter.dimensionOffSet+= 1;
                            } else {
                                $scope.dimSuggestionArr = [];
                                $scope.dimensionAutoFilter.dimensionOffSet = 0;
                            }

                            if($scope.reports.reportDefinition.dimensions[dimensionLevel].dimension) {
                                var urlParamas = {
                                    'clientId':$routeParams.accountId,
                                    'dimension':$scope.reports.reportDefinition.dimensions[dimensionLevel].dimension,
                                    'offset': $scope.dimensionAutoFilter.dimensionOffSet,
                                    'searchKey': $scope.reports.reportDefinition.dimensions[dimensionLevel].value
                                };
                                var url = urlService.customRptFilterAutoSugg(urlParamas),
                                    canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);

                                dataService.fetchCancelable(url, canceller, function (response) {
                                    if(response && response.data && response.data.data.length > 0){
                                        if(!$scope.dimSuggestionArr || $scope.dimSuggestionArr.length === 0) {
                                            $scope.dimSuggestionArr = response.data.data;
                                        } else if($scope.dimSuggestionArr.length >= 100) {
                                            $scope.dimSuggestionArr = $scope.dimSuggestionArr.concat(response.data.data);
                                        }

                                    } else {
                                        if (isLoadMoreData && $scope.dimSuggestionArr.length > 0) {
                                            $scope.dimSuggestionArr.noMoreData = true;
                                            $scope.dimSuggestionArr.dataNotFound = false;
                                        } else {
                                            $scope.dimSuggestionArr = [];
                                            $scope.dimSuggestionArr.dataNotFound = true;
                                        }
                                    }
                                }, function(response) {
                                    console.log('Error response:', response);
                                });
                            }
                        },

                        setDimensionSelected: function(event,dimension_level,selected_data){
                            var elem = $(event.currentTarget);
                            elem.closest('.dropdown').find('.autofill-dropdown').hide();
                            $scope.reports.reportDefinition.dimensions[dimension_level].value = selected_data.name;

                            if(selected_data.id){
                                $scope.reports.reportDefinition.dimensions[dimension_level].id = selected_data.id;
                            } else {
                                $scope.reports.reportDefinition.dimensions[dimension_level].id = '';
                            }
                        },

                        loadMoreData: function() {
                            $scope.dimensionAutoFilter.fetchDimensionSuggestion(null,null,true);
                        }

                    };
                })();

                _customctrl.showCost_permission();

                $(window).on('beforeunload', function () {
                    // On refresh of page
                    $scope.intermediateSave();
                });

                $scope.$on('$locationChangeSuccess', function () {
                    $(window).unbind('scroll');
                });
            });
        }]);
    }
);
