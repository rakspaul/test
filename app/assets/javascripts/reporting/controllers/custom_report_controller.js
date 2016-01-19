var angObj = angObj || {};
(function() {
    'use strict';
    angObj.controller('CustomReportController', function($rootScope, $scope, $route, $window, campaignSelectModel,
                                                         strategySelectModel, kpiSelectModel, utils, dataService,
                                                         apiPaths, requestCanceller, constants, domainReports,
                                                         timePeriodModel, loginModel, analytics, $timeout, $routeParams,
                                                         $location, urlService, dataStore, momentService) {
        $scope.additionalFilters = [];
        $scope.textConstants = constants;
        $scope.additionalValue = "Contains keywords ...";
        var _customctrl = this;
        var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

        var metricKey = [
            'dimensions',
            'delivery_metrics',
            'cost_metrics',
            'booked_metrics',
            'engagement_metrics',
            'video_metrics',
            'display_quality_metrics',
            'video_quality_metrics'
        ];
        var metricKey1 = [
            'dimension',
            'delivery_metrics',
            'cost_metrics',
            'booked_metrics',
            'engagement_metrics',
            'video_metrics',
            'display_quality_metrics',
            'video_quality_metrics'
        ];
        $scope.dataNotFound = false;
        $scope.reportDataBusy = false;
        $scope.activeTab = "delivery_metrics";
        $scope.filters = domainReports.getReportsTabs();
        $scope.count = 0;
        $scope.secondDimensionReportLoading = {};
        $scope.secondDimensionReportDataNotFound = {};
        $scope.metrics_text = 'Default';
        $scope.generateBtnDisabled = true;
        $scope.reports = {};
        $scope.reports.reportDefinition = {};
        $scope.reports.schedule = {};
        $scope.reports.reportDefinition.timeframe = {};
        $scope.reports.reportDefinition.timeframe.start_date = moment().subtract(1, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.reports.reportDefinition.timeframe.end_date = moment().subtract(1, 'day').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.reports.reportDefinition.metrics = {};
        $scope.reports.reportDefinition.filters = [];
        $scope.reports.reportDefinition.dimensions = [];
        $scope.selectedMetricsList = [];
        $scope.reports.reportDefinition.dimensions.primary = {
            'name': '',
            'dimension': '',
            'value': ''
        };
        $scope.reports.reportDefinition.dimensions.secondary = {
            'name': '',
            'dimension': '',
            'value': ''
        };
        $scope.reports.schedule.startDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.reports.schedule.endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
        $scope.scheduleReportActive = false;
        $scope.notInRange = false;
        $scope.notInRangeMonthly = false;
        $scope.showPrimaryTxtBox = false;
        $scope.showSecondaryTxtBox = false;
        $scope.showSecondDimensionBlock = false;
        $scope.showAddBreakdownButton = true;
        $scope.updateScheduleReport = false;
        $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
        $scope.buttonResetCancel = $scope.textConstants.RESET_LABEL;
        $scope.stopRedirectingPage = true;
        $scope.initializeMetrics = function(dataObj) {
            //delivery metrics
            $scope.deliveryMetrics = dataObj.delivery_metrics;
            $scope.totalDelMetrics = dataObj.delivery_metrics.length;
            $scope.deliveryMetrics.isAllSelected = false;
            $scope.deliveryMetrics.minOneSelected = false;
            _.each($scope.deliveryMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            //cost metrics
            $scope.costMetrics = dataObj.cost_metrics;
            $scope.totalCostMetrics = dataObj.cost_metrics.length;
            $scope.costMetrics.isAllSelected = false;
            $scope.costMetrics.minOneSelected = false;
            _.each($scope.costMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            //engagement metrics
            $scope.engagementMetrics = dataObj.engagement_metrics;
            $scope.totalEngmtMetrics = dataObj.engagement_metrics.length;
            $scope.engagementMetrics.isAllSelected = false;
            $scope.engagementMetrics.minOneSelected = false;
            _.each($scope.engagementMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            //video metrics
            $scope.videoMetrics = dataObj.video_metrics;
            $scope.totalVideoMetrics = dataObj.video_metrics.length;
            $scope.videoMetrics.isAllSelected = false;
            $scope.videoMetrics.minOneSelected = false;
            _.each($scope.videoMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            //quality display metrics
            $scope.displayQltyMetrics = dataObj.display_quality_metrics;
            $scope.totaldisplayQltyMetrics = dataObj.display_quality_metrics.length;
            $scope.displayQltyMetrics.isAllSelected = false;
            $scope.displayQltyMetrics.minOneSelected = false;
            _.each($scope.displayQltyMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            //quality video metrics
            $scope.videoQltyMetrics = dataObj.video_quality_metrics;
            $scope.totalVideoQltyMetrics = dataObj.video_quality_metrics.length;
            $scope.videoQltyMetrics.isAllSelected = false;
            $scope.videoQltyMetrics.minOneSelected = false;
            _.each($scope.videoQltyMetrics, function(eachObj) {
                eachObj.selected = false;
            })
            $scope.totalMetrics = $scope.totalDelMetrics + $scope.totalCostMetrics + $scope.totalEngmtMetrics + $scope.totalVideoMetrics + $scope.totaldisplayQltyMetrics + $scope.totalVideoQltyMetrics;
        }

        $scope.setMetrixText = function(text) {
            text = ($scope.totalMetrics == $scope.selectedMetricsList.length) ? "Default" : text;
            $scope.metrics_text = text + '(' + $scope.selectedMetricsList.length + ')';
        }

        dataService.getCustomReportMetrics($scope.campaign).then(function(result) {
            var jsonModifier = function(data) {
                var arr = [];
                _.each(data, function(obj) {
                    var d = obj.split(":");
                    arr.push({
                        'key': d[0],
                        'value': d[1]
                    });
                });

                return arr;
            }
            _.each(metricKey, function(k) {
                result.data.data[0][k] = jsonModifier(result.data.data[0][k]);
            });
            //initialize metrics - by default all metrics will be selected
            $scope.initializeMetrics(result.data.data[0]);
            $scope.allMetrics = true;
            $scope.OnSelectUnselectAllMetrics();
            $scope.saveMetrics();
            $scope.setMetrixText('Default');

            $scope.customeDimensionData = result.data.data;
            var modifiedDimesionArr = result.data.data[0];
            $scope.showDefaultDimension = modifiedDimesionArr.dimensions[0];
            $scope.showDefaultDimension['template_id'] = modifiedDimesionArr.template_id;

            $scope.prefillData = function(reportData) {
                var responseData = reportData;
                $scope.reports.name = responseData.name;
                $scope.scheduleReportActive = responseData.isScheduled;
                $scope.generateBtnDisabled = false;
                $scope.reports.schedule = responseData.schedule;
                $scope.reports.reportDefinition.timeframe = responseData.reportDefinition.timeframe;
                if (responseData.isScheduled) {
                    $('#toggle').bootstrapToggle('on');
                }

                $scope.select_schedule_option(responseData.schedule.frequency);
                if (responseData.schedule.occurance) {
                    $scope.set_schedule_occurs_options(responseData.schedule.occurance);
                    if (responseData.schedule.customOccuranceDate) {
                        $(".schedule-occurs-custom .dd_txt").html(responseData.schedule.customOccuranceDate);
                        $(".schedule-occurs-custom").show();
                    }
                }

                //returns name of the breakdown/filter key passed
                $scope.getFilterBreakdownName = function(key) {
                    var dimensionObj = $scope.customeDimensionData[0].dimensions;
                    var name;
                    _.each(dimensionObj, function(item) {
                        var value1 = key;
                        var value2 = item.key;
                        if (value1.trim() === value2.trim()) {
                            name = item.value.trim();
                        }
                    });
                    return name;
                }

                $scope.setPrimaryDimension = function(obj) {
                    $scope.reports.reportDefinition.dimensions.primary.name = $scope.getFilterBreakdownName(obj.dimension);
                    $scope.reports.reportDefinition.dimensions.primary.dimension = obj.dimension;
                    if (obj.values) {
                        $scope.reports.reportDefinition.dimensions.primary.value = obj.values;
                    }
                    $scope.showPrimaryTxtBox = true;
                }

                $scope.setSecondaryDimension = function(obj) {
                    $scope.reports.reportDefinition.dimensions.secondary.name = $scope.getFilterBreakdownName(obj.dimension);
                    $scope.reports.reportDefinition.dimensions.secondary.dimension = obj.dimension;
                    if (obj.values) {
                        $scope.reports.reportDefinition.dimensions.secondary.value = obj.values;
                    }
                    $scope.showSecondDimensionBlock = true;
                    $scope.showSecondaryTxtBox = true;
                    $scope.showAddBreakdownButton = false;
                }

                //set breakdown filter
                angular.forEach(responseData.reportDefinition.dimensions, function(eachObj) {
                    if ((eachObj.type == "Primary")) {
                        $scope.setPrimaryDimension(eachObj);
                    } else if ((eachObj.type == "Secondary")) {
                        $scope.setSecondaryDimension(eachObj);
                    }
                });

                //set breakdown filter values if exist
                angular.forEach(responseData.reportDefinition.filters, function(eachObj) {
                    eachObj['name'] = $scope.getFilterBreakdownName(eachObj.dimension);
                    if ((eachObj.type == "Primary")) {
                        $scope.setPrimaryDimension(eachObj);
                    } else if ((eachObj.type == "Secondary")) {
                        $scope.setSecondaryDimension(eachObj);
                    } else {
                        $scope.additionalFilters.push({
                            "key": eachObj.dimension,
                            "name": eachObj.name,
                            "value": eachObj.values,
                            "hide": false
                        });
                    }
                });


                //metrics
                $scope.selectedMetricsList = [];
                if (responseData.reportDefinition.metrics.Delivery) {
                    _.each($scope.deliveryMetrics, function(each) {
                        var deliveryMetricsObj = _.find(responseData.reportDefinition.metrics.Delivery, function(num) {
                            return num == each.key;
                        });
                        if (deliveryMetricsObj == undefined) {
                            each.selected = false;
                            $scope.deliveryMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.deliveryMetrics.minOneSelected = true;
                        }
                    });
                }
                if (responseData.reportDefinition.metrics.Engagement) {
                    _.each($scope.engagementMetrics, function(each) {
                        var engMetricsObj = _.find(responseData.reportDefinition.metrics.Engagement, function(num) {
                            return num == each.key;
                        });
                        if (engMetricsObj == undefined) {
                            each.selected = false;
                            $scope.engagementMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.engagementMetrics.minOneSelected = true;
                        }
                    });
                }
                if (responseData.reportDefinition.metrics.Cost) {
                    _.each($scope.costMetrics, function(each) {
                        var costMetricsObj = _.find(responseData.reportDefinition.metrics.Cost, function(num) {
                            return num == each.key;
                        });
                        if (costMetricsObj == undefined) {
                            each.selected = false;
                            $scope.costMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.costMetrics.minOneSelected = true;
                        }
                    });
                }
                if (responseData.reportDefinition.metrics.Video) {
                    _.each($scope.videoMetrics, function(each) {
                        var videoMetricsObj = _.find(responseData.reportDefinition.metrics.Video, function(num) {
                            return num == each.key;
                        });
                        if (videoMetricsObj == undefined) {
                            each.selected = false;
                            $scope.videoMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.videoMetrics.minOneSelected = true;
                        }
                    });
                }

                if (responseData.reportDefinition.metrics['Quality Display']) {
                    _.each($scope.displayQltyMetrics, function(each) {
                        var qualityDisplayObj = _.find(responseData.reportDefinition.metrics['Quality Display'], function(num) {
                            return num == each.key;
                        });
                        if (qualityDisplayObj == undefined) {
                            each.selected = false;
                            $scope.displayQltyMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.displayQltyMetrics.minOneSelected = true;
                        }
                    });
                }

                if (responseData.reportDefinition.metrics['Quality Video']) {
                    _.each($scope.videoQltyMetrics, function(each) {
                        var videoQltyMetricsObj = _.find(responseData.reportDefinition.metrics['Quality Video'], function(num) {
                            return num == each.key;
                        });
                        if (videoQltyMetricsObj == undefined) {
                            each.selected = false;
                            $scope.videoQltyMetrics.isAllSelected = false;
                            $scope.allMetrics = false;
                        } else {
                            $scope.selectedMetricsList.push({
                                'key': each.key,
                                'value': each.value
                            });
                            $scope.videoQltyMetrics.minOneSelected = true;
                        }
                    });
                }

                if ($scope.deliveryMetrics.isAllSelected && $scope.engagementMetrics.isAllSelected && $scope.costMetrics.isAllSelected && $scope.videoMetrics.isAllSelected && $scope.videoQltyMetrics.isAllSelected && $scope.displayQltyMetrics.isAllSelected) {
                    $scope.allMetrics = true;
                }
                $scope.scheduleResponseData = JSON.parse(JSON.stringify(responseData));;
                $scope.setMetrixText('Custom');
                // }// end of success
                // })
            } //end

            //if edit
            if ($routeParams.reportId) {
                $scope.updateScheduleReport = true;
                $scope.buttonLabel = "Update";
                $scope.buttonResetCancel = "Cancel";
                var url = urlService.scheduledReport($routeParams.reportId);
                dataStore.deleteFromCache(url);
                dataService.fetch(url).then(function(response) {
                    if (response.status == 'success') {
                        $scope.reportData = response.data.data;
                        $scope.prefillData(response.data.data);
                    }
                });
            } else if (localStorage.getItem('customReport')) {
                $scope.prefillData(JSON.parse(localStorage.getItem('customReport')));
            }
        });
        $scope.reports.client_id = loginModel.getSelectedClient().id;
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');


        $scope.showSecondDimension = function() {
            $scope.showSecondDimensionBlock = !$scope.showSecondDimensionBlock;
            $scope.showAddBreakdownButton = false;
        }

        $scope.deleteSecondDimensionBlock = function() {
            $scope.showSecondDimensionBlock = false;
            $scope.reports.reportDefinition.dimensions.secondary = {
                'name': '',
                'dimension': '',
                'value': ''
            };
            $scope.showAddBreakdownButton = true;
        }

        $scope.getMessageForDataNotAvailable = function() {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };
        $scope.resetFlashMessage = function() {
            $rootScope.setErrAlertMessage('', 0);
        }

        _customctrl.getDimensionList = function(data, selectedMetrics) {
            $scope.selectedDimension = elem.text();
            //if(selectedMetrics && selectedMetrics.length >0) {
            if ($scope.selectedMetricsList.length < $scope.totalMetrics) {
                $scope.metricKeyArr = {
                    'delivery_metrics': selectedMetrics
                };
            } else {
                $scope.metricKeyArr = data;
            }
        };

        _customctrl.getDataBasedOnTabSelected = function(activeTab, typeofDimension, currIdx) {
            typeofDimension = typeofDimension || 'first_dimension'

            var tmpObj = {};
            tmpObj[typeofDimension] = {};
            var activeTabDataObj;
            var data;
            var tabData;
            if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                tmpObj[typeofDimension][currIdx] = {};
                activeTabDataObj = tmpObj[typeofDimension][currIdx][activeTab] = [];
                data = $scope.reportMetaData[typeofDimension][currIdx];
            } else {
                activeTabDataObj = tmpObj[typeofDimension][activeTab] = [];
                data = $scope.reportMetaData[typeofDimension];
            }

            _.each(data, function(d, index) {
                d.dimension.level = typeofDimension
                d.dimension.idx = index
                if (activeTab === 'display_quality_metrics') {
                    tabData = d['quality_data']['display_data'];
                } else if (activeTab === 'video_quality_metrics') {
                    tabData = d['quality_data']['video_data'];
                } else {
                    tabData = d[activeTab];
                }
                _.extend(tabData, d['dimension']);
                activeTabDataObj.push(tabData);
            });
            $.extend(true, $scope.metricValues, tmpObj);
        };

        _customctrl.getDataBasedOnMetricSelected = function(newData, selectedMetrics, typeofDimension, currIdx) {
            if (!$scope.reportMetaData.hasOwnProperty(typeofDimension)) {
                $scope.reportMetaData[typeofDimension] = {};
            }

            if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                $scope.reportMetaData[typeofDimension][currIdx] = {};
                $scope.reportMetaData[typeofDimension][currIdx]['delivery_metrics'] = [];

            } else {
                $scope.reportMetaData[typeofDimension]['delivery_metrics'] = [];
            }
            var modifiedMetricsList = selectedMetrics.slice();
            modifiedMetricsList.unshift({
                key: 'value',
                value: ''
            });
            var metrics;
            var metricObj;
            _.each(newData, function(obj, index) {
                metricObj = {};
                _.each(metricKey1, function(mkey) {
                    var hasProperty = mkey;
                    var objWithKey = obj[mkey];
                    if (mkey == 'display_quality_metrics') {
                        hasProperty = 'quality_data';
                        objWithKey = obj['quality_data']['display_data'];
                    } else if (mkey == 'video_quality_metrics') {
                        hasProperty = 'quality_data';
                        objWithKey = obj['quality_data']['video_data'];
                    }
                    if (obj.hasOwnProperty(hasProperty)) {
                        metrics = _.pick(objWithKey, _.pluck(modifiedMetricsList, 'key'))
                        if (!$.isEmptyObject(metrics)) {
                            _.extend(metricObj, metrics);
                        }
                    }
                    metricObj.idx = index
                });
                metricObj.level = typeofDimension;
                if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                    $scope.reportMetaData[typeofDimension][currIdx]['delivery_metrics'].push(metricObj);
                } else {
                    $scope.reportMetaData[typeofDimension]['delivery_metrics'].push(metricObj);
                }
            });
            $scope.metricValues = $scope.reportMetaData;
        };

        _customctrl.getMetricValues = function(newData, selectedMetrics, typeofDimension, currIdx) {
            var tmpArr = [];
            if ($scope.selectedMetricsList.length < $scope.totalMetrics) {
                _customctrl.getDataBasedOnMetricSelected(newData, selectedMetrics, typeofDimension, currIdx)
            } else {
                if (!$scope.reportMetaData.hasOwnProperty(typeofDimension)) $scope.reportMetaData[typeofDimension] = [];
                if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                    $scope.reportMetaData[typeofDimension][currIdx] = [];
                }
                _.each(newData, function(d) {
                    if (typeof currIdx !== 'undefined' && currIdx >= 0) {
                        $scope.reportMetaData[typeofDimension][currIdx].push(d);
                    } else {
                        $scope.reportMetaData[typeofDimension].push(d);
                    }
                })

                _customctrl.getDataBasedOnTabSelected($scope.activeTab, typeofDimension, currIdx)
            }
        };

        _customctrl.getSelectedAdditionalFilter = function(dimensionIds) {
            var filterArr = [];
            var elem = $(".custom_filter_breakdown");
            _.each(elem, function(el) {
                var fdimesnion = $.trim($(el).find(".dropdown_ul_text .dd_txt").attr('id'));
                var ftext = $(el).find(".reportFilter").val()

                var fstr = (fdimesnion + (ftext ? (':' + ftext) : ''))
                filterArr.push(fstr)
            });
            filterArr = _.filter(filterArr, function(val) {
                return val !== 'Choose filter'
            });
            return filterArr.join("~");
        };

        _customctrl.getTimeFrame = function() {
            var dateWrapper = $(".dateWrapper").find(".timeframe")
            return '&start_date=' + dateWrapper[0].value + "&end_date=" + dateWrapper[1].value;
        };

        _customctrl.enableGenerateButton = function() {
            if (!$scope.scheduleReportActive) {
                $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
            }
            return $(".dimension_block").find(".dd_txt").text() !== 'Choose Breakdown';
        };




        _customctrl.createRequestParams = function(filterText, offset, isPrimary) {
            var params = '',
                dropdownElem = $(".each_section_custom_report"),
                reportId = dropdownElem.find('.dd_txt').attr('data-template_id'),
                dimensionDataKey = isPrimary ? "primary" : "secondary",
                filterDataKey = isPrimary ? "secondary" : "primary",
                str = $scope.reports.reportDefinition.dimensions[dimensionDataKey].dimension;
            $scope.reportTitle = $scope.reports.reportDefinition.dimensions[dimensionDataKey].name;
            $scope.isReportForMultiDimension = false;

            if ($scope.reports.reportDefinition.dimensions[dimensionDataKey].value) {
                str += ':' + $scope.reports.reportDefinition.dimensions[dimensionDataKey].value;
            }

            if ($scope.reports.reportDefinition.dimensions[filterDataKey].dimension) {
                $scope.isReportForMultiDimension = true;
                $scope.reportTitle += ' by ' + $scope.reports.reportDefinition.dimensions[filterDataKey].name;
                str += "&filter=" + $scope.reports.reportDefinition.dimensions[filterDataKey].dimension
                if ($scope.reports.reportDefinition.dimensions[filterDataKey].value) {
                    str += ':' + $scope.reports.reportDefinition.dimensions[filterDataKey].value;
                }
                if (typeof filterText != "undefined" && filterText != null && filterText != "" && str.search(filterText.trim()) == -1) {
                    str += ':' + filterText + "&exact_match=true";
                }
            }
            if ($scope.additionalFilters.length > 0) {
                if (!$scope.reports.reportDefinition.dimensions[filterDataKey].dimension) {
                    str += "&filter="
                } else {
                    str += '~';
                }
                _.each($scope.additionalFilters, function(eachObj) {
                    str += eachObj.key;
                    if (eachObj.value) {
                        str += ':' + eachObj.value;
                    }
                    str += '~';
                });
                var pos = str.lastIndexOf('~');
                str = str.substring(0, pos)
            }

            //timeframe
            str += '&start_date=' + $scope.reports.reportDefinition.timeframe.start_date + "&end_date=" + $scope.reports.reportDefinition.timeframe.end_date;

            params = reportId + "?dimension=" + str + "&offset=" + offset + "&limit=" + $scope.limit;
            return params;
        };

        _customctrl.errorHandler = function() {
            $scope.reportDataLoading = false;
            $scope.reportDataNotFound = true;
            $scope.generateBtnDisabled = false;
        };

        _customctrl.fetchReportData = function(selectedMetricsList, params, idx, sucessCallbackHandler, errorCallbackHandler) {
            $scope.generateBtnDisabled = true;
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);
                if (result && result.data.data) {
                    sucessCallbackHandler(result.data.data.report_data, idx)
                } else {
                    errorCallbackHandler(idx);
                }
            }, function(idx) {
                errorCallbackHandler(idx)
            });
        };

        _customctrl.getReportData = function() {
            _customctrl.fetchReportData($scope.selectedMetricsList, _customctrl.createRequestParams(null, $scope.firstDimensionoffset, 1), null, function(respData) {
                $scope.fetching = false;
                $scope.generateBtnDisabled = false;
                if (respData && respData.length > 0) {
                    $scope.reportDataLoading = false;
                    $scope.reportDataNotFound = false;
                    if ($scope.isReportForMultiDimension) {
                        $scope.showhasBreakdown = 'hasBreakdown';
                    }
                    _customctrl.getMetricValues(respData, $scope.selectedMetricsList, 'first_dimension');

                } else {
                    _customctrl.errorHandler();
                }
            }, function() {
                _customctrl.errorHandler();
            });
        }

        $scope.generateReport = function() {
            if (!_customctrl.enableGenerateButton()) {
                $scope.generateBtnDisabled = true;
                $(".custom_report_filter").closest(".breakdown_div").find(".filter_input_txtbox").hide();
                return false;
            }
            $scope.generateBtnDisabled = false;
            $scope.metricValues = [];
            $scope.reportMetaData = {};
            $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
            $scope.hideReportsTabs = true;
            $scope.reportDataNotFound = false;
            $scope.showhasBreakdown = '';
            $scope.reportDataLoading = true;
            $scope.fetching = false;
            $(".img_table_container").hide();
            $(".custom_report_response_page").show();
            $(".hasBreakdown").removeClass("active").removeClass("treeOpen").removeClass("noDataOpen");
            $("html, body").animate({
                scrollTop: 0
            });

            if ($scope.totalMetrics == $scope.selectedMetricsList.length) {
                $scope.hideReportsTabs = false;
            }
            _customctrl.reset();
            _customctrl.getDimensionList($scope.customeDimensionData[0], $scope.selectedMetricsList);
            _customctrl.getReportData();
            var str = $scope.reports.reportDefinition.dimensions.primary.dimension + ':' + $scope.reports.reportDefinition.dimensions.primary.value + '&';
            if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                str += "&filter=" + $scope.reports.reportDefinition.dimensions.secondary.dimension + ':' + $scope.reports.reportDefinition.dimensions.secondary.value + '&';
            }
            if ($scope.additionalFilters.length > 0) {
                _.each($scope.additionalFilters, function(eachObj) {
                    str += eachObj.key + ':' + eachObj.value + '&';
                });
            }

            //timeframe
            /* str+='&start_date='+$scope.reports.reportDefinition.timeframe.start_date +"&end_date="+$scope.reports.reportDefinition.timeframe.end_date;

             var params = 1+"?dimension="+str+"&offset="+123+"&limit="+$scope.limit;
             console.log('query string'+params);*/
        };

        $scope.createData = function(isIntermediateSave) {
            $scope.requestData = {};
            $scope.requestData.reportDefinition = {};
            $scope.requestData.schedule = {};
            $scope.requestData.reportDefinition.timeframe = {};
            $scope.requestData.reportDefinition.metrics = {};
            $scope.requestData.reportDefinition.filters = [];
            $scope.requestData.reportDefinition.dimensions = [];
            $scope.requestData.name = '';
            $scope.requestData.client_id = loginModel.getSelectedClient().id;
            $scope.requestData.name = $scope.reports.name;
            $scope.requestData.reportDefinition.timeframe = $scope.reports.reportDefinition.timeframe;
            $scope.requestData.reportDefinition.metrics = $scope.reports.reportDefinition.metrics;
            $scope.requestData.schedule = $scope.reports.schedule;
            $scope.requestData.isScheduled = $scope.scheduleReportActive;
            $scope.requestData.schedule.occurance = $scope.valueWithDefault($scope.reports.schedule.occurance, $scope.reports.schedule.frequency, '');
            $scope.requestData.reportDefinition.dimensions.push({
                "dimension": $scope.reports.reportDefinition.dimensions.primary.dimension,
                'type': "Primary"
            });
            if ($scope.reports.reportDefinition.dimensions.primary.value || isIntermediateSave) {
                $scope.requestData.reportDefinition.filters.push({
                    "dimension": $scope.reports.reportDefinition.dimensions.primary.dimension,
                    "type": "Primary",
                    "values": $scope.reports.reportDefinition.dimensions.primary.value
                });
            }
            if ($scope.valueWithDefault($scope.reports.schedule, 'frequency') == 'Once') {
                $scope.reports.schedule.endDate = $scope.reports.schedule.startDate;
            }
            if ($scope.reports.reportDefinition.dimensions.secondary.name) {
                $scope.requestData.reportDefinition.dimensions.push({
                    "dimension": $scope.reports.reportDefinition.dimensions.secondary.dimension,
                    'type': "Secondary"
                });
            }

            if ($scope.reports.reportDefinition.dimensions.secondary.value) {
                $scope.requestData.reportDefinition.filters.push({
                    "dimension": $scope.reports.reportDefinition.dimensions.secondary.dimension,
                    "type": "Secondary",
                    "values": $scope.reports.reportDefinition.dimensions.secondary.value
                });
            }
            _.each($scope.additionalFilters, function(eachObj) {
                if (eachObj.value) {
                    $scope.requestData.reportDefinition.filters.push({
                        "dimension": eachObj.key,
                        'type': "Additional",
                        "values": eachObj.value
                    })
                } else if (isIntermediateSave) {
                    //if a filter key is selected then show it with the input box
                    $scope.requestData.reportDefinition.filters.push({
                        "dimension": eachObj.key,
                        'type': "Additional"
                    })
                }

            })

            if (!$scope.reports.schedule.customOccuranceDate) {
                $scope.reports.schedule.customOccuranceDate = '';
                $scope.requestData.schedule.customOccuranceDate = '';
            }
            return $scope.requestData;
        }

        var setFlashMessage = function(message, isErrorMsg, isMsg) {
            $rootScope.setErrAlertMessage(message, isErrorMsg, isMsg);
            return false;
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
        $scope.verifyReportInputs = function() {
            var str = $scope.reports.name;
            if ($scope.generateBtnDisabled) {
                return false;
            }
            if (/^[A-Za-z ][A-Za-z0-9 ]*$/.test(str) === false) {
                return setFlashMessage('Please use only alphanumeric characters for report names. Report name should start with alphabetic character', 1, 0);
            }
            if (($scope.reports.reportDefinition.timeframe.start_date == undefined) || ($scope.reports.reportDefinition.timeframe.end_date == undefined)) {
                return setFlashMessage('Please provide timeframe dates', 1, 0);
            }
            if (!$scope.reports.name || !$scope.reports.schedule.frequency) {
                return setFlashMessage('Please provide report name and frequency', 1, 0);
            }

            if ($scope.notInRange == true) {
                return setFlashMessage('You have chosen weekly Scheduling, please choose a date range that is at least one week', 1, 0);
            }
            if ($scope.notInRangeMonthly == true) {
                return setFlashMessage('You have chosen monthly Scheduling, please choose a date range that is at least one month', 1, 0);
            }
            if ($scope.selectedMetricsList.length <= 0) {
                return setFlashMessage('Atleast one metrics should be selected', 1, 0);
            }

            if ((($scope.reports.schedule.frequency == "Weekly")||($scope.reports.schedule.frequency == "Monthly")) && ($scope.reports.schedule.occurance == "" || $scope.reports.schedule.occurance == undefined)) {
                return setFlashMessage('Please select occurs on', 1, 0);
            }
            return true;
        }

        $scope.scheduleReport = function() {
            if ($scope.verifyReportInputs()) {
                dataService.createScheduleReport($scope.createData()).then(function(result) {
                    if (result.data.status_code == 200) {
                        $rootScope.setErrAlertMessage('Success: The scheduled Report is listed.', 0);
                        $location.url('/reports/schedules');
                    }
                });
            }
        };

        $scope.enable_generate_btn = function() {
            if (_customctrl.enableGenerateButton()) {
                $scope.generateBtnDisabled = false;
            } else {
                $scope.generateBtnDisabled = true;
                $(".custom_report_filter").closest(".breakdown_div").find(".filter_input_txtbox").hide();
            }
        }

        $scope.loadMoreItems = function() {
            $scope.firstDimensionoffset += $scope.limit;
            $scope.fetching = true;
            _customctrl.getReportData();
        };

        _customctrl.hideSecondDimensionData = function(firtDimensionElem, secondDimensionElem) {
            secondDimensionElem.hide();
            firtDimensionElem.removeClass('active treeOpen noDataOpen');
        };

        $scope.fetchMoreSecondDimensionData = function(event) {
            var target = $(event.target);
            $scope.secondDimensionOffset += Number(target.parent().attr('offset'));
            var elems = target.parents('.reportData').find('.tree_dimension_col.more_dimension_col');
            elems.trigger('click');
        };

        $scope.showDataForClikedDimension = function(ev, value) {
            var currFirtDimensionElem = $(ev.target).parents(".reportData");
            var currSecondDimensionElem = currFirtDimensionElem.find('.second_dimension_row_holder');
            if (!currFirtDimensionElem.hasClass('treeOpen')) {
                currFirtDimensionElem.addClass('treeOpen')

                currSecondDimensionElem.show();
                if (!$scope.isReportForMultiDimension) {
                    return false;
                }
                var value = escape($.trim(value));
                var currentRowIndex = Number(currFirtDimensionElem.attr("data-result-row"));
                $scope.secondDimensionReportLoading[$scope.activeTab] = {}
                $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = true;


                $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
                $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = false;
                var paramsObj = _customctrl.createRequestParams(value, $scope.secondDimensionOffset, 0);
                _customctrl.fetchReportData($scope.selectedMetricsList, paramsObj, currentRowIndex, function(respData, currentRowIndex) {
                    currFirtDimensionElem.addClass('active');
                    if (respData) {
                        var resultLen = respData.length;
                        if (resultLen >= $scope.limit) {
                            currSecondDimensionElem.find('.sec_dimension_load_more').show().attr("offset", resultLen);
                        }
                        $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = false;
                        if (resultLen > 0) {
                            currFirtDimensionElem.removeClass('noDataOpen');
                            _customctrl.getMetricValues(respData, $scope.selectedMetricsList, 'second_dimension', currentRowIndex);
                        } else {
                            $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = true;
                            currFirtDimensionElem.addClass('noDataOpen');
                        }
                    }

                }, function(currentRowIndex) {
                    $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = false;
                    $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = true;
                    currFirtDimensionElem.addClass('noDataOpen');
                });
                $scope.generateBtnDisabled = false;


            } else {
                //hide the second dimension data for clcked row

                if ($(ev.target).closest(".second_dimension_row").length == 0) {
                    _customctrl.hideSecondDimensionData(currFirtDimensionElem, currSecondDimensionElem);
                }
            }
        };

        _customctrl.reset = function() {
            $scope.limit = 1000;
            $scope.firstDimensionoffset = 0;
            $scope.fetching = false;
            $scope.secondDimensionOffset = 0;
        };

        $scope.select_option = function(event) {
            var elem = $(event.target);
            if (elem.hasClass("active")) {
                elem.removeClass("active");
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked", false);
                $("#selectAll_chkbox").prop("checked", false);
            } else {
                elem.addClass("active");
            }

            var total_col_items = elem.closest(".each_measurable_col").find(".each_option").length;
            var active_col_items = elem.closest(".each_measurable_col").find(".active").length;

            if (active_col_items > 0) {
                elem.closest(".each_measurable_col").find(".squaredFour").addClass("not_all_selected");
            } else {
                elem.closest(".each_measurable_col").find(".squaredFour").removeClass("not_all_selected");
            }

            if (total_col_items == active_col_items) {
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked", true);
                elem.closest(".each_measurable_col").find(".squaredFour").removeClass("not_all_selected");
            }

            var total_items = $(".total_metrics_container").find(".each_option").length;
            var active_items = $(".total_metrics_container").find(".each_option.active").length;
            if (total_items == active_items) {
                $("#selectAll_chkbox").prop("checked", true);
            }


        };

        $scope.select_unselect_all = function(event) {
            var elem = $(event.target);
            var optionElem = $(".each_measurable_col").find(".each_option");
            var metricElem = $(".each_measurable_col").find(".squaredFour");
            metricElem.removeClass("not_all_selected");
            if (elem.prop("checked")) {
                optionElem.addClass("active");
                metricElem.find(".squaredFourChkbox").prop("checked", true);
            } else {
                optionElem.removeClass("active");
                metricElem.find(".squaredFourChkbox").prop("checked", false);
            }

        };

        $scope.select_unselect_metrics = function(event) {
            var elem = $(event.target);
            elem.closest(".squaredFour").removeClass("not_all_selected");
            if (elem.prop("checked")) {
                elem.closest(".each_measurable_col").find(".each_option").addClass("active");
            } else {
                elem.closest(".each_measurable_col").find(".each_option").removeClass("active");
                $("#selectAll_chkbox").prop("checked", false);
            }
            var total_items = $(".total_metrics_container").find(".each_option").length;
            var active_items = $(".total_metrics_container").find(".each_option.active").length;
            if (total_items == active_items) {
                $("#selectAll_chkbox").prop("checked", true);
            }
        };

        $scope.delete_level = function(event) {
            var elem = $(event.target);
            elem.closest(".breakdown_div").remove();
            if ($("#breakdown_row").find(".breakdown_div").length == 0) {
                $(".add_breakdown_btn").closest(".row").show();
            }
        };


        $scope.select_dimension = function(event, dimension, type, pos) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text());
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id"));
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show();
        }

        $scope.selectPriSecDimension = function(dimension, type) {
            $scope.showPrimaryTxtBox = true;
            if (dimension != undefined) {
                if (type == 'Primary') {
                    $scope.reports.reportDefinition.dimensions.primary.name = dimension.value;
                    $scope.reports.reportDefinition.dimensions.primary.dimension = (dimension.key == undefined) ? dimension.dimension : dimension.key;
                } else {
                    $scope.showSecondaryTxtBox = true;
                    $scope.reports.reportDefinition.dimensions.secondary.name = dimension.value;
                    $scope.reports.reportDefinition.dimensions.secondary.dimension = (dimension.key == undefined) ? dimension.dimension : dimension.key;
                }
            }
        }


        $scope.select_additional_filters = function(event, dimension, type) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text());
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id"));
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show();
        }

        $scope.select_dropdown_option = function(event, arg) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text());
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id"));
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show();
            if (arg) {
                var startDate, endDate;

                switch (arg) {
                    case 'Yesterday':
                        startDate = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Week to date':
                        startDate = moment().startOf('week').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Last 7 days':
                        startDate = moment().subtract(7, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Last week':
                        startDate = moment().subtract(1, 'week').startOf('week').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(1, 'week').endOf('week').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Month to date':
                        startDate = moment().format('YYYY-MM') + '-01';
                        endDate = moment().format('YYYY-M-DD');
                        break;
                    case 'Last month':
                        startDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM') + '-01';
                        endDate = moment().subtract(1, 'months').endOf('month').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Quarter to date':
                        startDate = moment().startOf('quarter').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Last quarter':
                        startDate = moment().subtract(1, 'quarter').startOf('quarter').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(1, 'quarter').endOf('quarter').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Year to date':
                        startDate = moment().format('YYYY') + '-01-01';
                        endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    case 'Custom dates':
                        startDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(0, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        break;
                    default:
                        startDate = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                        endDate = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
                }
                $('#startDateInput').datepicker('update', startDate);
                $('#endDateInput').datepicker('update', endDate);
            }
        };
        $scope.select_schedule_option = function(arg) {
            $scope.reports.schedule.frequency = arg;
            var currentYear = momentService.getCurrentYear().toString();
            if (arg) {
                arg = arg.toLowerCase();
                $(".scheduling-options").hide();
                $(".schedule-" + arg).show();
                if (arg == "once") {
                    $('#deliverOn').datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                    $('#deliverOn').datepicker('setStartDate', currentYear);
                    $(".schedule-date").hide();
                } else {
                    $(".schedule-date").show();
                    $('#startOn').datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                    $('#startOn').datepicker('setStartDate', currentYear);
                    $('#endOn').datepicker('update', momentService.todayDate('YYYY-MM-DD'));
                    $('#endOn').datepicker('setStartDate', currentYear);
                }
            }
            $scope.showCustomDate($scope.valueWithDefault($scope.reports.schedule.occurance, $scope.reports.schedule.frequency, ''));
        };

        $scope.select_schedule_occurs_option = function(event, arg) {
            arg = arg.toLowerCase();
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text());
            $scope.set_schedule_occurs_options(arg);
            $scope.showCustomDate(arg);
        };
        $scope.set_schedule_occurs_options = function(arg) {
            var frequency = $scope.reports.schedule.frequency.toLowerCase().trim();
            $scope.reports.schedule.occurance = {};
            $scope.reports.schedule.occurance[frequency] = arg;
        }
        $scope.showCustomDate = function(arg) {
            if (arg == "custom") {
                $(".schedule-occurs-custom").show();
            } else {
                $(".schedule-occurs-custom").hide();
            }
        }
        $scope.show_respective_table = function(id) {
            $(".custom_report_response_table").hide();
            $("#" + id + "_table").show();
            $(".custom_report_response_tabs").find(".each_tab").removeClass("active");
            $(".custom_report_response_tabs").find("#" + id + "_tab").addClass("active");
            $scope.activeTab = id + "_metrics";
            _customctrl.getDataBasedOnTabSelected($scope.activeTab);
        };

        $scope.reset_metric_options = function(event) {
            localStorage.removeItem('customReport');
            $route.reload();
        };

        $scope.toggleSchedule = function(that) {
            $scope.scheduleReportActive = $(that).prop('checked');
            if ($scope.scheduleReportActive) {
                $scope.buttonLabel = $scope.textConstants.SCHEDULE_LABEL;
                if ($routeParams.reportId) {
                    $scope.buttonLabel = "Update";
                }
            } else {
                $scope.buttonLabel = $scope.textConstants.GENERATE_LABEL;
            }

            if ($(that).closest(".schedule-on-off-btn").find(".toggle.btn-primary").length > 0) {
                $(".default-schedule-col").show();
            } else {
                $(".each-col:not(#schedule-btn)").hide();
                $(".default-schedule-col").find(".dd_txt").text("Select");
            }
            if (!$scope.updateScheduleReport && !localStorage.getItem('customReport')) {
                $scope.$apply();
            }
        };

        $(document).ready(function() {
            $('.input-daterange').datepicker({
                //format: "dd-mm-yyyy",
                format: "yyyy-mm-dd",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true,
                keyboardNavigation: false
            }).on('changeDate', function() {
                var frequencyDropDown = $(".frequency").text().trim();
                var startDateChecker = new Date($('#startOn').val());
                var endDateChecker = new Date($('#endOn').val());
                var startDateCheckerRange = $('#startOn').val();
                var endDateCheckerRange = $('#endOn').val();

                function parseDate(str) {
                    var mdy = str.split('-');
                    return new Date(mdy[0] - 1, mdy[1], mdy[2]);
                }

                function daydiff(first, second) {
                    return Math.round((second - first) / (1000 * 60 * 60 * 24));
                }

                var theDateDifference = daydiff(parseDate(startDateCheckerRange), parseDate(endDateCheckerRange));
                //alert(theDateDifference);
                if (frequencyDropDown == "Weekly" && theDateDifference < 7) {
                    $scope.notInRange = true;

                } else if (frequencyDropDown === "Monthly" && theDateDifference < 28) {
                    $scope.notInRangeMonthly = true;

                } else if (startDateChecker > endDateChecker) {
                    $('#endOn').val($('#startOn').val());
                } else {
                    $scope.notInRange = false;
                    $scope.notInRangeMonthly = false;
                }

                $(this).closest(".customDatesTimeframe").find("#date-selected-txt").text("Custom Dates");
            });
            $('#toggle').bootstrapToggle('off');
            $('#toggle').change(function(event) {
                $scope.toggleSchedule(this);
            });
            var yesterday = moment().subtract(1, 'days').format(constants.DATE_UTC_SHORT_FORMAT);
            $('#startDateInput').datepicker('update', yesterday);
            $('#endDateInput').datepicker('update', yesterday);
            $('#startDateInput').datepicker('setEndDate', new Date);
            $('#endDateInput').datepicker('setEndDate', new Date);

            var lastScrollLeft = 0;
            var lastScrollTop = 0;

            $(".custom_report_scroll").scroll(function() {
                var documentScrollLeft = $(this).scrollLeft();
                if (lastScrollLeft != documentScrollLeft) {
                    lastScrollLeft = documentScrollLeft;
                    $(".custom_report_scroll").removeClass("vertical_scroll");
                    $(".custom_report_scroll").addClass("hori_scroll");
                }

                var documentScrollTop = $(this).scrollTop();
                if (lastScrollTop !== documentScrollTop) {
                    lastScrollTop = documentScrollTop;
                    $(".custom_report_scroll").addClass("vertical_scroll");
                    $(".custom_report_scroll").removeClass("hori_scroll");
                }
            });

            function monthArrayMake() {
                var dayTo31 = [];
                for (var i = 1; i <= 31; i++) {
                    dayTo31.push(i);
                }
                return dayTo31;

            }

            $scope.getNumberDate = monthArrayMake();

            //--- sapna ----

            $scope.onChoosingAditFlts = function(index, key, name) {
                $scope.additionalFilters[index].hide = false;
                $scope.additionalFilters[index].key = key;
                $scope.additionalFilters[index].name = name;

            }

            $scope.delAditFlt = function(index) {
                $scope.additionalFilters.splice(index, 1);
            }

            $scope.addAdditionalFilters = function() {
                $scope.additionalFilters.push({
                    key: "",
                    name: "",
                    value: "",
                    hide: true
                });
            }


            $scope.setAllMetrics = function() {
                if ($scope.deliveryMetrics.isAllSelected && $scope.costMetrics.isAllSelected && $scope.engagementMetrics.isAllSelected && $scope.videoMetrics.isAllSelected && $scope.displayQltyMetrics.isAllSelected && $scope.videoQltyMetrics.isAllSelected) {
                    $scope.allMetrics = true;
                } else {
                    $scope.allMetrics = false;
                }
            }


            $scope.allMetrics = false;
            $scope.OnSelectUnselectAllMetrics = function() {
                //  delivery Metrics
                $scope.deliveryMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.deliveryMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

                //cost Metrics
                $scope.costMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.costMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

                //engagement Metrics
                $scope.engagementMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.engagementMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

                //video Metrics
                $scope.videoMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.videoMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

                //Display Quality Metrics
                $scope.displayQltyMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.displayQltyMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

                //Quality video Metrics
                $scope.videoQltyMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.videoQltyMetrics, function(eachObj) {
                    eachObj.selected = $scope.allMetrics;
                })

            }

            //Delivery Metrics
            $scope.onDeliveryMetrClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.deliveryMetrics, function(eachObj) {
                        eachObj.selected = $scope.deliveryMetrics.isAllSelected;
                    })
                } else {
                    $scope.deliveryMetrics[index].selected = !$scope.deliveryMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.deliveryMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                if (totalMetricSelected > 0) {
                    $scope.deliveryMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totalDelMetrics) {
                        $scope.deliveryMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.deliveryMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //Cost Metrics
            $scope.onCostMetrClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.costMetrics, function(eachObj) {
                        eachObj.selected = $scope.costMetrics.isAllSelected;
                    })
                } else {
                    $scope.costMetrics[index].selected = !$scope.costMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.costMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                $scope.costMetrics.minOneSelected = false;
                if (totalMetricSelected > 0) {
                    $scope.costMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totalCostMetrics) {
                        $scope.costMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.costMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //Engagement Metrics
            $scope.onEngagementMetrClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.engagementMetrics, function(eachObj) {
                        eachObj.selected = $scope.engagementMetrics.isAllSelected;
                    })
                } else {
                    $scope.engagementMetrics[index].selected = !$scope.engagementMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.engagementMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                $scope.engagementMetrics.minOneSelected = false;
                if (totalMetricSelected > 0) {
                    $scope.engagementMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totalEngmtMetrics) {
                        $scope.engagementMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.engagementMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //Display video Metrics
            $scope.onVedioMetrClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.videoMetrics, function(eachObj) {
                        eachObj.selected = $scope.videoMetrics.isAllSelected;
                    })
                } else {
                    $scope.videoMetrics[index].selected = !$scope.videoMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.videoMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                $scope.videoMetrics.minOneSelected = false;
                if (totalMetricSelected > 0) {
                    $scope.videoMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totalVideoMetrics) {
                        $scope.videoMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.videoMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //Display Qulity Metrics
            $scope.onQltyDisplayClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.displayQltyMetrics, function(eachObj) {
                        eachObj.selected = $scope.displayQltyMetrics.isAllSelected;
                    })
                } else {
                    $scope.displayQltyMetrics[index].selected = !$scope.displayQltyMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.displayQltyMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                $scope.displayQltyMetrics.minOneSelected = false;
                if (totalMetricSelected > 0) {
                    $scope.displayQltyMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totaldisplayQltyMetrics) {
                        $scope.displayQltyMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.displayQltyMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //video Metrics
            $scope.onQltyVdoMetrClick = function(index) {
                var totalMetricSelected = 0;
                if (index == undefined) {
                    _.each($scope.videoQltyMetrics, function(eachObj) {
                        eachObj.selected = $scope.videoQltyMetrics.isAllSelected;
                    })
                } else {
                    $scope.videoQltyMetrics[index].selected = !$scope.videoQltyMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.videoQltyMetrics, function(eachObj) {
                    if (eachObj.selected == true) {
                        totalMetricSelected++;
                    }
                });
                $scope.videoQltyMetrics.minOneSelected = false;
                if (totalMetricSelected > 0) {
                    $scope.videoQltyMetrics.minOneSelected = true;
                    if (totalMetricSelected == $scope.totalVideoQltyMetrics) {
                        $scope.videoQltyMetrics.isAllSelected = true;
                        $scope.setAllMetrics();
                    } else {
                        $scope.videoQltyMetrics.isAllSelected = false;
                        $scope.allMetrics = false;
                    }
                } else {
                    $scope.allMetrics = false;
                }
            }

            //delivery Metrics
            $scope.saveMetrics = function() {
                var selectedDeliveryMetrics = [];
                $scope.selectedMetricsList = [];
                _.each($scope.deliveryMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedDeliveryMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Delivery'] = [];
                if (selectedDeliveryMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Delivery'] = selectedDeliveryMetrics;
                }

                //cost Metrics
                var selectedCostMetrics = [];
                _.each($scope.costMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedCostMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Cost'] = [];
                if (selectedCostMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Cost'] = selectedCostMetrics;
                }

                //engagement metrics
                var selectedEngMetrics = [];
                _.each($scope.engagementMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedEngMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Engagement'] = [];
                if (selectedEngMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Engagement'] = selectedEngMetrics;
                }

                //video metrics
                var selectedVideoMetrics = [];
                _.each($scope.videoMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedVideoMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Video'] = [];
                if (selectedVideoMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Video'] = selectedVideoMetrics;
                }

                //quality display metrics
                var selectedDsplyQltyMetrics = [];
                _.each($scope.displayQltyMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedDsplyQltyMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Quality Display'] = [];
                if (selectedDsplyQltyMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Quality Display'] = selectedDsplyQltyMetrics;
                }

                //quality video metrics
                var selectedVideoQltyMetrics = [];
                _.each($scope.videoQltyMetrics, function(eachObj) {
                    if (eachObj.selected) {
                        selectedVideoQltyMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({
                            'key': eachObj.key,
                            'value': eachObj.value
                        });
                    }
                });
                $scope.reports.reportDefinition.metrics['Quality Video'] = [];
                if (selectedVideoQltyMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Quality Video'] = selectedVideoQltyMetrics;
                }

                $(".metric_popup").modal('hide');
                $scope.setMetrixText('Custom');
            }

            $scope.updateSchdReport = function() {
                if ($scope.verifyReportInputs()) {
                    dataService.updateScheduleReport($routeParams.reportId, $scope.createData()).then(function(result) {
                        if (result.data.status_code == 200) {
                            $rootScope.setErrAlertMessage('Scheduled report updated successfully', 0);
                            $scope.stopRedirectingPage = false;
                            $location.url('/reports/schedules');
                        }
                    });
                }
            }
            $scope.refreshMetriPopUp = function() {
                var metricsType = ['deliveryMetrics', 'costMetrics', 'videoMetrics', 'displayQltyMetrics', 'videoQltyMetrics'];
                _.each(metricsType, function(v) {
                    _.each($scope[v], function(o) {
                        o.selected = false;
                    });
                    $scope[v].isAllSelected = false;
                });
                _.each($scope.selectedMetricsList, function(selObj) {
                    _.each(metricsType, function(v) {
                        _.each($scope[v], function(o) {
                            if (selObj.key == o.key) {
                                o.selected = true;
                            }
                        });
                        $scope[v].isAllSelected = true;
                        _.each($scope[v], function(o) {
                            if (!o.selected) $scope[v].isAllSelected = false;
                        });
                    });
                });
            }

            $scope.validateScheduleDate = function(){
                if($(".report_generate_button").hasClass("disabled") || !$scope.reports.reportDefinition.timeframe.start_date || !$scope.reports.reportDefinition.timeframe.end_date){
                    return false;
                }
                var currDate = momentService.todayDate('YYYY-MM-DD');
                if($scope.scheduleReportActive){
                    var deliverOn = $("#deliverOn").val(),
                        startDate = $("#startOn").val(),
                        endDate = $("#endOn").val();
                    if($scope.reports.schedule.frequency && $scope.reports.schedule.frequency != "Once" && (momentService.dateDiffInDays(currDate,startDate) <= 0|| momentService.dateDiffInDays(currDate,endDate) <= 0)){
                        $rootScope.setErrAlertMessage("Start date or end date cannot be less than or equal current date");
                        return false;
                    }
                    switch($scope.reports.schedule.frequency){
                        case "Once":
                            if(momentService.dateDiffInDays(currDate,deliverOn) <= 0){
                                $rootScope.setErrAlertMessage("Deliver on date cannot be less than or equal to the current date");
                                return false;
                            }
                        break;
                        case "Daily":
                            if(momentService.dateDiffInDays(startDate,endDate) < 1){
                                $rootScope.setErrAlertMessage("The difference between Start and End Dates should be at least one day");
                                return false;
                            }
                        break;
                        case "Weekly":
                            if($scope.valueWithDefault($scope.reports.schedule.occurance, 'weekly' ,'') == ''){
                                $rootScope.setErrAlertMessage("Please the occurs on");
                                return false;
                            }
                            if(momentService.dateDiffInDays(startDate,endDate) < 7){
                                $rootScope.setErrAlertMessage("The difference between Start and End Dates should be at least one week");
                                return false;
                            }
                        break;
                        case "Monthly":
                            if($scope.valueWithDefault($scope.reports.schedule.occurance, 'monthly', '') == ''){
                                $rootScope.setErrAlertMessage("Please the occurs on");
                                return false;
                            }
                            if(momentService.dateDiffInDays(startDate,endDate) < 28){
                                $rootScope.setErrAlertMessage("You have chosen monthly Scheduling, please choose a date range that is at least one month");
                                return false;
                            }
                        break;
                    }
                }
                return true;
            }

            $scope.scheduleReportAction = function() {
                if(!$scope.validateScheduleDate()) return;
                if ($scope.buttonLabel == "Update") {
                    $scope.updateSchdReport();
                } else if ($scope.buttonLabel == "Generate") {
                    $scope.generateBtnDisabled = true
                    $scope.generateReport();
                } else {
                    $scope.scheduleReport();
                }
            }

            $scope.resetMetricOptions = function() {
                var url = '/reports/schedules';
                if ($scope.buttonResetCancel == "Cancel") {
                    $location.url(url);
                } else if ($scope.buttonResetCancel == "Reset") {
                    localStorage.removeItem('customReport');
                    $route.reload();
                } else {}
            }

            $rootScope.$on(constants.ACCOUNT_CHANGED, function (event, args) {
                $scope.buttonResetCancel = "Reset";
                $scope.resetMetricOptions();
            });


            $scope.addSearch = function(event) {
                event.stopPropagation();
            }

            $scope.intermediateSave = function() {
                localStorage.setItem('customReport', JSON.stringify($scope.createData(true)));
            }

            $scope.$on('$locationChangeStart', function(event, next) {
                $scope.intermediateSave();
                if ($scope.updateScheduleReport && $scope.stopRedirectingPage && ($scope.reports.name != $scope.scheduleResponseData.name || !angular.equals($scope.reports.schedule, $scope.scheduleResponseData.schedule))) {
                    event.preventDefault();
                    $scope.updateSchedule = true;
                    $scope.nextURL = next;
                }
            });
            $scope.updateReportAndRedirect = function(arg) {
                $scope.stopRedirectingPage = false;
                $scope.updateSchedule = false;
                if (arg == 'Yes') {
                    $scope.scheduleReportAction();
                }
                $location.path($scope.nextURL.substring($location.absUrl().length - $location.url().length));
            }
        });
    });
}());