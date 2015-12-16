var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CustomReportController', function ($rootScope, $scope, $route, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout,$routeParams,$location,urlService) {

        $scope.additionalFilters = [];
        $scope.textConstants = constants;
        $scope.additionalValue = "Contains keywords ...";
        var _customctrl = this;
        var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

        var metricKey = ['dimensions', 'delivery_metrics', 'cost_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics', 'display_quality_metrics', 'video_quality_metrics'];
        var metricKey1 = ['dimension', 'delivery_metrics', 'cost_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics', 'display_quality_metrics', 'video_quality_metrics'];
        $scope.dataNotFound = false;
        $scope.reportDataBusy = false;
        $scope.activeTab = "delivery_metrics";
        $scope.filters = domainReports.getReportsTabs();
        $scope.count =0;
        $scope.secondDimensionReportLoading = {};
        $scope.secondDimensionReportDataNotFound = {};
        $scope.metrics_text = 'Default';
        $scope.generateBtnDisabled = true;
        $scope.reports = {};
        $scope.reports.reportDefinition = {};
        $scope.reports.schedule = {};
        $scope.reports.reportDefinition.timeframe = {};
        $scope.reports.reportDefinition.metrics = {};
        $scope.reports.reportDefinition.filters = [];
        $scope.reports.reportDefinition.dimensions = [];
        $scope.reports.reportDefinition.dimensions.primary ={'name':'','dimension':'','value':''};
        $scope.reports.reportDefinition.dimensions.secondary ={'name':'','dimension':'','value':''};
        $scope.scheduleReportActive= false;
        $scope.notInRange = false;
        $scope.notInRangeMonthly = false;
        $scope.flashMessage = {'message':'','isErrorMsg':0};
        $scope.showPrimaryTxtBox = false;
        $scope.showSecondaryTxtBox = false;
        $scope.showSecondDimensionBlock = false;
        $scope.showAddBreakdownButton = true;


        $scope.reports.client_id = loginModel.getSelectedClient().id;
        $(".main_navigation").find('.active').removeClass('active').end().find('#reports_nav_link').addClass('active');


        $scope.showSecondDimension = function() {
            $scope.showSecondDimensionBlock = !$scope.showSecondDimensionBlock;
            $scope.showAddBreakdownButton = false;
        }

        $scope.deleteSecondDimensionBlock = function() {
            $scope.showSecondDimensionBlock = false;
            $scope.reports.reportDefinition.dimensions.secondary ={'name':'','dimension':'','value':''};
            $scope.showAddBreakdownButton = true;
        }

        dataService.getCustomReportMetrics($scope.campaign).then(function(result) {
            var jsonModifier =  function(data) {
                var arr= [];
                _.each(data, function(obj) {
                    var d  = obj.split(":");
                    arr.push({'key' : d[0], 'value':d[1] });
                });

                return arr;
            }
            _.each(metricKey, function(k) {
                result.data.data[0][k] = jsonModifier(result.data.data[0][k]);
            });
            $scope.initializeMetrics(result.data.data[0]);
            $scope.customeDimensionData = result.data.data;
            console.log('$scope.customeDimensionData',$scope.customeDimensionData);
            var modifiedDimesionArr = result.data.data[0];
            $scope.showDefaultDimension = modifiedDimesionArr.dimensions[0];
            $scope.showDefaultDimension['template_id'] = modifiedDimesionArr.template_id;

        });

        if($routeParams.reportId) {
            dataService.fetch(urlService.scheduledReport($routeParams.reportId)).then(function(response) {
                console.log('Response: ',JSON.stringify(response));
                if(response.status == 'success') {
                     //$scope.reports = response.data.data;
                    var responseData = response.data.data;
                    $scope.scheduleReportActive = response.data.data.isScheduled;
                    if(response.data.data.isScheduled) {
                        $('#toggle').bootstrapToggle('on');
                        $scope.reports.schedule = response.data.data.schedule;
                        $scope.reports.schedule.frequency = "Once";
                    }
                    angular.forEach(response.data.data.reportDefinition.filters, function(eachObj) {
                         console.log('each flter',eachObj);
                        var dimensionObj = $scope.customeDimensionData[0].dimensions;
                        _.each(dimensionObj,function(item) {
                            var value1 = "";
                            var value2 = "";
                            value1 = eachObj.dimension;
                            value2 = item.key;

                            if(value1.trim() === value2.trim()) { console.log('value1,value2',value1,value2);
                                eachObj['name'] = item.value.trim();
                            }
                        });
                        console.log('added name to each obj',eachObj);
                        if((eachObj.type == "Primary")) {
                            console.log('9999', $scope.reports.reportDefinition.dimensions.primary);
                            $scope.reports.reportDefinition.dimensions.primary.name = eachObj.name;
                            $scope.reports.reportDefinition.dimensions.primary.dimension = eachObj.dimension;
                            $scope.reports.reportDefinition.dimensions.primary.value = eachObj.values[0];
                            $scope.showPrimaryTxtBox = true;
                            //$scope.primaryDimensionKeyword = eachObj.values[0];
                            //to set value of dimension in the dropdown
                            $scope.select_dimension('Primary',$scope.reports.reportDefinition.dimensions.primary);
                        } else if((eachObj.type == "Secondary")) {
                            $scope.reports.reportDefinition.dimensions.secondary.name = eachObj.name;
                            $scope.reports.reportDefinition.dimensions.secondary.dimension = eachObj.dimension;
                            $scope.reports.reportDefinition.dimensions.secondary.value = eachObj.value;
                            $scope.showSecondDimensionBlock = true;
                            $scope.showSecondaryTxtBox = true;
                          //  $scope.secondaryDimensionKeyword = eachObj.values[0];
                            $scope.addMore();
                            //to set value of dimension in the dropdown
                            $scope.select_dimension('Secondary',eachObj);
                            $scope.select_secDimension_dropdown_option();
                        } else {
                            //console.log('eachobj dimension',eachObj.dimension);
                            $scope.reports.reportDefinition.additionalFilters[eachObj.dimension] = eachObj;
                            // console.log('additionalFilters',eachObj.dimension);

                            //$scope.addFilters(eachObj.dimension);

                        }
                    });
                }
            })


        }

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };

        $scope.msgtimeoutReset = function(){
            $timeout(function(){
                $scope.resetFlashMessage() ;
            }, 3000);
        }

        $scope.msgtimeoutReset();

        $scope.close_msg_box = function(event) {
            var elem = $(event.target);
            elem.closest(".top_message_box").hide() ;
            $scope.resetFlashMessage() ;
        };

        $scope.resetFlashMessage = function(){
            $scope.flashMessage.message = '' ;
            $scope.flashMessage.isErrorMsg = 0 ;
            $scope.flashMessage.isMsg = 0 ;
        }

        _customctrl.getDimensionList =  function(data, selectedMetrics) {
            $scope.selectedDimension  = elem.text();
            if(selectedMetrics && selectedMetrics.length >0) {
                $scope.metricKeyArr = {'delivery_metrics' : selectedMetrics};
            } else {
                $scope.metricKeyArr = data;
            }
        };

        _customctrl.getDataBasedOnTabSelected =  function(activeTab, typeofDimension, currIdx) {
            typeofDimension = typeofDimension || 'first_dimension'

            var tmpObj = {}; tmpObj[typeofDimension] ={};
            var activeTabDataObj;
            var data;
            var tabData;
            if(typeof currIdx !== 'undefined' && currIdx >=0) {
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
                if(activeTab === 'display_quality_metrics') {
                    tabData = d['quality_data']['display_data'];
                } else  if(activeTab === 'video_quality_metrics') {
                    tabData = d['quality_data']['video_data'];
                } else {
                    tabData =  d[activeTab];
                }
                _.extend(tabData, d['dimension']);
                activeTabDataObj.push(tabData);
            });
            $.extend(true, $scope.metricValues, tmpObj);
        };

        _customctrl.getDataBasedOnMetricSelected =  function(newData, selectedMetrics, typeofDimension, currIdx) {
            if(!$scope.reportMetaData.hasOwnProperty(typeofDimension)) {
                $scope.reportMetaData[typeofDimension] ={};
            }

            if(typeof currIdx !== 'undefined' && currIdx >=0) {
                $scope.reportMetaData[typeofDimension][currIdx] = {};
                $scope.reportMetaData[typeofDimension][currIdx]['delivery_metrics'] = [];

            } else {
                $scope.reportMetaData[typeofDimension]['delivery_metrics'] = [];
            }


            var modifiedMetricsList = selectedMetrics.slice();
            modifiedMetricsList.unshift({key:'value', value:''});
            var metrics;
            var metricObj
            _.each(newData, function(obj, index) {
                metricObj = {};
                _.each(metricKey1, function(mkey) {
                    if(obj.hasOwnProperty(mkey)) {
                        metrics = _.pick(obj[mkey], _.pluck(modifiedMetricsList, 'key'))
                        if(!$.isEmptyObject(metrics)) {
                            _.extend(metricObj, metrics);
                        }
                    }
                    metricObj.idx = index
                });
                metricObj.level = typeofDimension;
                if(typeof currIdx !== 'undefined' && currIdx >=0) {
                    $scope.reportMetaData[typeofDimension][currIdx]['delivery_metrics'].push(metricObj);
                } else {
                    $scope.reportMetaData[typeofDimension]['delivery_metrics'].push(metricObj);
                }
            });

            $scope.metricValues = $scope.reportMetaData;
        };

        _customctrl.getMetricValues =  function(newData, selectedMetrics, typeofDimension, currIdx) {
            var tmpArr = [];
            if(selectedMetrics && selectedMetrics.length >0) {
                _customctrl.getDataBasedOnMetricSelected(newData, selectedMetrics, typeofDimension, currIdx)
            } else {
                if(!$scope.reportMetaData.hasOwnProperty(typeofDimension)) $scope.reportMetaData[typeofDimension] =[];
                if(typeof currIdx !== 'undefined' && currIdx >=0) {
                    $scope.reportMetaData[typeofDimension][currIdx] = [];
                }
                _.each(newData, function(d) {
                    if(typeof currIdx !== 'undefined' && currIdx >=0) {
                        $scope.reportMetaData[typeofDimension][currIdx].push(d);
                    } else {
                        $scope.reportMetaData[typeofDimension].push(d);
                    }
                })

                _customctrl.getDataBasedOnTabSelected($scope.activeTab, typeofDimension, currIdx)
            }
        };



        /*$scope.metricSelected =  function(ev) {
            var selectedItems= [];
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                var relationIds = $(ele).attr("relationIds");
                selectedItems.push({key:el.attr("id"), value:el.text()});
                if(!$scope.reports.reportDefinition.metrics[relationIds])
                  $scope.reports.reportDefinition.metrics[relationIds] = [];
                  $scope.reports.reportDefinition.metrics[relationIds].push(el.attr("id"));
            });
            $scope.metrics_text = 'Custom ('+ selectedItems.length +')';
            console.log('metric selected',selectedItems);
            $scope.selectedMetricsList = selectedItems;
            $(".metric_popup").modal('hide');
        };*/

        _customctrl.getSelectedAdditionalFilter = function(dimensionIds) {
            var filterArr =[];
            var elem =$(".custom_filter_breakdown");
            _.each(elem, function(el) {
                var fdimesnion =  $.trim($(el).find(".dropdown_ul_text .dd_txt").attr('id'));
                var ftext = $(el).find(".reportFilter").val()

                var fstr = (fdimesnion + (ftext ? (':' + ftext) : ''))
                filterArr.push(fstr)
            });
            filterArr = _.filter(filterArr, function(val) { return val !== 'Choose filter'});
            return filterArr.join("~");
        };

        _customctrl.getTimeFrame =  function() {
            var dateWrapper = $(".dateWrapper").find(".timeframe")
            return '&start_date='+dateWrapper[0].value +"&end_date="+dateWrapper[1].value;
        };

        _customctrl.enableGenerateButton =  function() {
            return $(".dimension_block").find(".dd_txt").text() !=='Choose Breakdown';
        };


       /* _customctrl.createRequestParams = function(filterText, offset) {
            var params='';
            var dimensionLabels = [];
            var dimensionIds = [];
            var reportFilterList = [];

            var dropdownElem = $(".each_section_custom_report");
            var reportId = dropdownElem.find('.dd_txt').attr('data-template_id');
            var dimensionElem = dropdownElem.find('[data-template_id="1"]');

            _.each(dimensionElem, function(el) {
                dimensionLabels.push($.trim($(el).text()))
                dimensionIds.push($(el).attr('id'));
            });


            var reportFilter = $(".reportFilter");
            _.each(reportFilter, function(ele) {
                reportFilterList.push($.trim($(ele).val()))
            });

            $scope.reportTitle = dimensionLabels.join(' by ');
            $scope.isReportForMultiDimension = dimensionIds.length >1;
            var str, additonalFilter;
            additonalFilter = _customctrl.getSelectedAdditionalFilter();
            if($scope.isReportForMultiDimension && filterText) {
                str =  dimensionIds[1] + (reportFilterList[1] !== '' ?  (':' + reportFilterList[1]) : '');
                str += "&filter=" + dimensionIds[0] + (filterText !== '' ? (':' + filterText) : '') + (additonalFilter.length >0 ? ('~' + additonalFilter) : '');

            } else {
                str =  dimensionIds[0] + (reportFilterList[0] !== '' ?  (':' + reportFilterList[0]) : '');

                if(dimensionIds[1]) {
                    var dimesnionStr = dimensionIds[1] + (reportFilterList[1]  ? (':' + reportFilterList[1]) : '');
                }

                if(dimensionIds[1] || additonalFilter.length >0) {
                    str += "&filter=" + dimesnionStr +  (additonalFilter.length >0 ? ('~' + additonalFilter) : '');
                }
                /!*if(additonalFilter.length >0)
                 str += "&filter=" + additonalFilter;*!/
            }

            str += _customctrl.getTimeFrame();
            params = reportId+"?dimension="+str+"&offset="+offset+"&limit="+$scope.limit;
            return params;
        };*/





        _customctrl.createRequestParams = function(filterText, offset) {
            //sapna
            $scope.reportTitle = $scope.reports.reportDefinition.dimensions.primary.name;
            $scope.isReportForMultiDimension = false;
            var params='';
            var dropdownElem = $(".each_section_custom_report");
            var reportId = dropdownElem.find('.dd_txt').attr('data-template_id');
            var str = $scope.reports.reportDefinition.dimensions.primary.dimension+':'+$scope.reports.reportDefinition.dimensions.primary.value;

            if($scope.reports.reportDefinition.dimensions.secondary.dimension) {
                $scope.isReportForMultiDimension = true;
                $scope.reportTitle += ' by '+ $scope.reports.reportDefinition.dimensions.secondary.name;
                str+="&filter="+$scope.reports.reportDefinition.dimensions.secondary.dimension
                if($scope.reports.reportDefinition.dimensions.secondary.value) {
                    str+=':'+$scope.reports.reportDefinition.dimensions.secondary.value;
                }
            }
            if($scope.additionalFilters.length > 0) {
                if(!$scope.reports.reportDefinition.dimensions.secondary.dimension  ) {
                    str+="&filter="
                } else {
                    str+='~';
                }
                _.each($scope.additionalFilters,function(eachObj) {
                    str+=eachObj.key;
                    if(eachObj.value) {
                        str+= ':'+eachObj.value;
                    }
                    str+='~';
                });
                var pos = str.lastIndexOf('~');
                str = str.substring(0,pos)
            }

            //timeframe
            str+='&start_date='+$scope.reports.reportDefinition.timeframe.start_date +"&end_date="+$scope.reports.reportDefinition.timeframe.end_date;

            params = reportId+"?dimension="+str+"&offset="+offset+"&limit="+$scope.limit;
            return params;
        };

        _customctrl.errorHandler = function() {
            $scope.reportDataLoading = false;
            $scope.reportDataNotFound = true;
            $scope.generateBtnDisabled = false;
        };

        _customctrl.fetchReportData = function(selectedMetricsList, params, idx, sucessCallbackHandler, errorCallbackHandler)  {
            $scope.generateBtnDisabled = true;
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);
                if(result && result.data.data) {
                    sucessCallbackHandler(result.data.data.report_data, idx)
                } else {
                    errorCallbackHandler(idx);
                }
            }, function(idx) {
                errorCallbackHandler(idx)
            });
        };

        _customctrl.getReportData = function() {
            _customctrl.fetchReportData($scope.selectedMetricsList, _customctrl.createRequestParams(null, $scope.firstDimensionoffset), null, function(respData) {
                $scope.fetching = false;
                $scope.generateBtnDisabled = false;
                if(respData && respData.length >0) {
                    $scope.reportDataLoading = false;
                    $scope.reportDataNotFound = false;
                    if($scope.isReportForMultiDimension) {
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
            if(!_customctrl.enableGenerateButton()) {
                $scope.generateBtnDisabled = true;
                $(".custom_report_filter").closest(".breakdown_div").find(".filter_input_txtbox").hide() ;
                return false;
            }
            $scope.generateBtnDisabled = false;
            $scope.metricValues = [];
            $scope.reportMetaData={};
            $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
            $scope.hideReportsTabs = false;
            $scope.reportDataNotFound = false;
            $scope.showhasBreakdown = '';
            $scope.reportDataLoading = true;
            $scope.fetching = false;
            $(".img_table_container").hide();
            $(".custom_report_response_page").show();
            $(".hasBreakdown").removeClass("active").removeClass("treeOpen").removeClass("noDataOpen") ;
            $("html, body").animate({ scrollTop: 0 });
            if($scope.selectedMetricsList && $scope.selectedMetricsList.length >0) {
                $scope.hideReportsTabs = true;
            }
            _customctrl.reset();
            _customctrl.getDimensionList($scope.customeDimensionData[0], $scope.selectedMetricsList);
            _customctrl.getReportData();
            var str = $scope.reports.reportDefinition.dimensions.primary.dimension+':'+$scope.reports.reportDefinition.dimensions.primary.value+'&';
            if($scope.reports.reportDefinition.dimensions.secondary.value) {
                str+="&filter="+$scope.reports.reportDefinition.dimensions.secondary.dimension+':'+$scope.reports.reportDefinition.dimensions.secondary.value+'&';
            }
            if($scope.additionalFilters.length > 0) {
                _.each($scope.additionalFilters,function(eachObj) {
                    str+=eachObj.key+':'+eachObj.value+'&';
                });
            }

            //timeframe
           /* str+='&start_date='+$scope.reports.reportDefinition.timeframe.start_date +"&end_date="+$scope.reports.reportDefinition.timeframe.end_date;

            var params = 1+"?dimension="+str+"&offset="+123+"&limit="+$scope.limit;
            console.log('query string'+params);*/
        };

        $scope.scheduleReport = function() {
            $scope.requestData =  {};
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
           // console.log('$scope.reports.reportDefinition.schedule',$scope.reports.reportDefinition.schedule);
           if(!$scope.generateBtnDisabled) {
               var str = $scope.reports.name;
               if(/^[A-Za-z][A-Za-z0-9]*$/.test(str) === false) {
                   $scope.flashMessage.message = 'Please use only alphanumeric characters for report names. Report name should start with alphabetic character';
                   $scope.flashMessage.isErrorMsg = 1;
                   $scope.flashMessage.isMsg = 0;
                   $scope.msgtimeoutReset();
                   return false;
               }
              if(!$scope.reports.name || !$scope.reports.schedule.frequency) {
                $scope.flashMessage.message = 'Please provide report name and frequency';
                $scope.flashMessage.isErrorMsg = 1 ;
                $scope.flashMessage.isMsg = 0;
                $scope.msgtimeoutReset();
                return false;
              }

               if($scope.notInRange == true){
                   $scope.flashMessage.message = 'You have chosen weekly Scheduling, please choose a date range that is at least one week';
                   $scope.flashMessage.isErrorMsg = 1 ;
                   $scope.flashMessage.isMsg = 0;
                   $scope.msgtimeoutReset();
                   return false;

               }
               if($scope.notInRangeMonthly == true){
                   $scope.flashMessage.message = 'You have chosen monthly Scheduling, please choose a date range that is at least one month';
                   $scope.flashMessage.isErrorMsg = 1 ;
                   $scope.flashMessage.isMsg = 0;
                   $scope.msgtimeoutReset();
                   return false;

               }

               $scope.requestData.reportDefinition.dimensions.push({"dimension":$scope.reports.reportDefinition.dimensions.primary.dimension,'type':"Primary"});
               $scope.requestData.reportDefinition.filters.push({"dimension":$scope.reports.reportDefinition.dimensions.primary.dimension,"type":"Primary","values":$scope.reports.reportDefinition.dimensions.primary.value});

               if($scope.reports.reportDefinition.dimensions.secondary.value) {
                   $scope.requestData.reportDefinition.dimensions.push({"dimension":$scope.reports.reportDefinition.dimensions.secondary.dimension,'type':"Secondary"});
                   $scope.requestData.reportDefinition.filters.push({"dimension":$scope.reports.reportDefinition.dimensions.secondary.dimension,"type":"Secondary","values":$scope.reports.reportDefinition.dimensions.secondary.value});
               }
               _.each($scope.additionalFilters,function(eachObj) {
                   $scope.requestData.reportDefinition.dimensions.push({"dimension":eachObj.key,'type':"Additional"});
                   $scope.requestData.reportDefinition.filters.push({"dimension":eachObj.key,'type':"Additional","values":eachObj.value})
               })

              if (!$scope.reports.schedule.endDate) {
                  $scope.reports.schedule.endDate = '';
              }

              if (!$scope.reports.schedule.occurance) {
                  $scope.reports.schedule.occurance = '';
              }

              if (!$scope.reports.schedule.customOccuranceDate) {
                  $scope.reports.schedule.customOccuranceDate = '';
              }
             console.log('create schedule report', JSON.stringify($scope.requestData));
              dataService.createScheduleReport($scope.requestData).then(function (result) {
                  if (result.data.status_code == 200) {
                      $rootScope.flashMessage = {'message':'Success: The scheduled Report is listed.','isErrorMsg':''};
                      $location.url('/reports/schedules');
                  }
              });
          }
        };


        $scope.enable_generate_btn = function() {
            if(_customctrl.enableGenerateButton()) {
                $scope.generateBtnDisabled = false;
            } else {
                $scope.generateBtnDisabled = true;
                $(".custom_report_filter").closest(".breakdown_div").find(".filter_input_txtbox").hide() ;
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
            var elems= target.parents('.reportData').find('.tree_dimension_col.more_dimension_col');
            elems.trigger('click');
        };

        $scope.showDataForClikedDimension = function(ev, value) {
            var currFirtDimensionElem = $(ev.target).parents(".reportData");
            var currSecondDimensionElem = currFirtDimensionElem.find('.second_dimension_row_holder');
            if(!currFirtDimensionElem.hasClass('treeOpen')) {
                currFirtDimensionElem.addClass('treeOpen')

                currSecondDimensionElem.show();
                if(!$scope.isReportForMultiDimension) {
                    return false;
                }
                var value = escape($.trim(value));
                var currentRowIndex = Number(currFirtDimensionElem.attr("data-result-row"));
                $scope.secondDimensionReportLoading[$scope.activeTab] ={}
                $scope.secondDimensionReportLoading[$scope.activeTab][currentRowIndex] = true;


                $scope.secondDimensionReportDataNotFound[$scope.activeTab] = {};
                $scope.secondDimensionReportDataNotFound[$scope.activeTab][currentRowIndex] = false;

                var paramsObj = _customctrl.createRequestParams(value, $scope.secondDimensionOffset);
                _customctrl.fetchReportData($scope.selectedMetricsList, paramsObj, currentRowIndex, function(respData, currentRowIndex) {
                    currFirtDimensionElem.addClass('active');
                    if(respData) {
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
                $scope.generateBtnDisabled = false ;


            } else {
                //hide the second dimension data for clcked row

                if( $(ev.target).closest(".second_dimension_row").length == 0 ) {
                    _customctrl.hideSecondDimensionData(currFirtDimensionElem, currSecondDimensionElem);
                }
            }
        };

        _customctrl.reset = function(){
            $scope.limit = 1000;
            $scope.firstDimensionoffset = 0;
            $scope.fetching = false;
            $scope.secondDimensionOffset = 0;
        };

        $scope.select_option = function(event) {
            var elem = $(event.target);
            if( elem.hasClass("active")  ) {
                elem.removeClass("active") ;
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , false ) ;
                $("#selectAll_chkbox").prop("checked" , false ) ;
            } else {
                elem.addClass("active") ;
            }

            var total_col_items = elem.closest(".each_measurable_col").find(".each_option").length  ;
            var active_col_items = elem.closest(".each_measurable_col").find(".active").length  ;

            if( active_col_items > 0  ) {
                elem.closest(".each_measurable_col").find(".squaredFour").addClass("not_all_selected") ;
            } else {
                elem.closest(".each_measurable_col").find(".squaredFour").removeClass("not_all_selected") ;
            }

            if(total_col_items == active_col_items ) {
                elem.closest(".each_measurable_col").find(".squaredFourChkbox").prop("checked" , true ) ;
                elem.closest(".each_measurable_col").find(".squaredFour").removeClass("not_all_selected") ;
            }

            var total_items  = $(".total_metrics_container").find(".each_option").length ;
            var active_items = $(".total_metrics_container").find(".each_option.active").length ;
            if( total_items == active_items ) {
                $("#selectAll_chkbox").prop("checked" , true ) ;
            }


        };

        $scope.select_unselect_all = function(event) {
            var elem = $(event.target);
            var optionElem = $(".each_measurable_col").find(".each_option");
            var metricElem  = $(".each_measurable_col").find(".squaredFour") ;
            metricElem.removeClass("not_all_selected") ;
            if( elem.prop("checked") ) {
                optionElem.addClass("active") ;
                metricElem.find(".squaredFourChkbox").prop("checked" , true ) ;
            } else {
                optionElem.removeClass("active") ;
                metricElem.find(".squaredFourChkbox").prop("checked" , false ) ;
            }

        };

        $scope.select_unselect_metrics = function(event) {
            var elem = $(event.target);
            elem.closest(".squaredFour").removeClass("not_all_selected");
            if( elem.prop("checked") ) {
                elem.closest(".each_measurable_col").find(".each_option").addClass("active") ;
            } else {
                elem.closest(".each_measurable_col").find(".each_option").removeClass("active") ;
                $("#selectAll_chkbox").prop("checked" , false ) ;
            }
            var total_items  = $(".total_metrics_container").find(".each_option").length ;
            var active_items = $(".total_metrics_container").find(".each_option.active").length ;
            if( total_items == active_items ) {
                $("#selectAll_chkbox").prop("checked" , true ) ;
            }
        };

        $scope.delete_level = function(event) {
            var elem = $(event.target);
            elem.closest(".breakdown_div").remove();
            if( $("#breakdown_row").find(".breakdown_div").length == 0 ) {
                $(".add_breakdown_btn").closest(".row").show() ;
            }
        };


        $scope.select_dimension = function(event, dimension, type, pos) {
          var elem = $(event.target);
          elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
          elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;
          elem.closest(".breakdown_div").find(".filter_input_txtbox").show() ;
        }

        $scope.selectPriSecDimension = function(dimension,type) { console.log('dimension,type',dimension,type);
            $scope.showPrimaryTxtBox = true;
            if(dimension != undefined) {
                if(type == 'Primary') {
                    $scope.reports.reportDefinition.dimensions.primary.name = dimension.value;
                    $scope.reports.reportDefinition.dimensions.primary.dimension = (dimension.key == undefined)?dimension.dimension:dimension.key;
                } else {
                    $scope.showSecondaryTxtBox = true;
                    $scope.reports.reportDefinition.dimensions.secondary.name = dimension.value;
                    $scope.reports.reportDefinition.dimensions.secondary.dimension = (dimension.key == undefined)?dimension.dimension:dimension.key;
                }
            }
        }

        $scope.select_additional_filters = function(event, dimension, type) {
          var elem = $(event.target);
          elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
          elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;
          elem.closest(".breakdown_div").find(".filter_input_txtbox").show() ;
        }

        $scope.select_dropdown_option = function(event , arg ) {
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show() ;
            if( arg ){
                var startDate,endDate;

                switch(arg) {
                    case 'Yesterday':
                        startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                        endDate   = moment().subtract(1, 'days').format('YYYY-MM-DD');
                        break;
                    case 'Week to date':
                        startDate = moment().startOf('week').format('YYYY-MM-DD');
                        endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        break;
                    case 'Last 7 days':
                        startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        break;
                    case 'Last week':
                        startDate = moment().subtract(1,'week').startOf('week').format('YYYY-MM-DD');
                        endDate   = moment().subtract(1,'week').endOf('week').format('YYYY-MM-DD');
                        break;
                    case 'Month to date':
                        startDate = moment().format('YYYY-MM')+'-01';
                        endDate   = moment().format('YYYY-M-DD');
                        break;
                    case 'Last month':
                        startDate = moment().subtract(1,'months').endOf('month').format('YYYY-MM') + '-01';
                        endDate   = moment().subtract(1,'months').endOf('month').format('YYYY-MM-DD');
                        break;
                    case 'Quarter to date':
                        startDate = moment().startOf('quarter').format('YYYY-MM-DD');
                        endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        break;
                    case 'Last quarter':
                        startDate = moment().subtract(1,'quarter').startOf('quarter').format('YYYY-MM-DD');
                        endDate   = moment().subtract(1,'quarter').endOf('quarter').format('YYYY-MM-DD');
                        break;
                    case 'Year to date':
                        startDate = moment().format('YYYY')+'-01-01';
                        endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        break;
                    case 'Custom dates':
                        startDate = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
                        break;
                    default:
                        startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                        endDate   = moment().subtract(1, 'days').format('YYYY-MM-DD');
                }
                $('#startDateInput').datepicker('update', startDate);
                $('#endDateInput').datepicker('update', endDate);
            }
        };
        $scope.select_schedule_option = function(event , arg ) {

            var elem = $(event.target);
            startDate = moment().subtract(0, 'days').format('YYYY-MM-DD');
            endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;

            var startDate,endDate;
            if( arg ) {
                arg = arg.toLowerCase();
                $(".scheduling-options").hide() ;
                $(".schedule-" + arg).show() ;
                if(arg == "once" ) {
                    $('#deliverOn').datepicker('update', startDate);
                    $('#deliverOn').datepicker('setStartDate', startDate);
                    $(".schedule-date" ).hide() ;
                } else {
                    $('#deliverOn').datepicker('update', '');
                    $(".schedule-date" ).show() ;
                    $('#startOn').datepicker('update', startDate);
                    $('#startOn').datepicker('setStartDate', startDate);
                    $('#endOn').datepicker('update', endDate);
                    $('#endOn').datepicker('setStartDate', endDate);
                    $scope.reports.schedule.startDate = startDate;
                }
            }

        };

        $scope.select_schedule_occurs_option = function(event , arg ) {
            arg = arg.toLowerCase();
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
            $scope.reports.schedule.occurance = arg;
            if( arg == "custom") {
                $(".schedule-occurs-custom").show() ;
            } else {
                $(".schedule-occurs-custom").hide() ;
            }

        };
        $scope.show_respective_table = function(id) {
            $(".custom_report_response_table").hide() ;
            $("#" +  id + "_table").show() ;
            $(".custom_report_response_tabs").find(".each_tab").removeClass("active") ;
            $(".custom_report_response_tabs").find("#" + id +  "_tab").addClass("active") ;
            $scope.activeTab = id +"_metrics";
            _customctrl.getDataBasedOnTabSelected($scope.activeTab);
        };

        $scope.reset_metric_options = function(event) {
            $route.reload();
        };

        $scope.toggleSchedule = function(that) {
          $scope.scheduleReportActive = $(that).prop('checked');
          if( $(that).closest(".schedule-on-off-btn").find(".toggle.btn-primary").length > 0 ) {
              $(".default-schedule-col").show() ;
          } else {
              $(".each-col:not(#schedule-btn)").hide() ;
              $(".default-schedule-col").find(".dd_txt").text("Select") ;
          }
          $scope.$apply();
        };

        $(document).ready( function() {
            $('.input-daterange').datepicker({
                //format: "dd-mm-yyyy",
                format: "yyyy-mm-dd",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true,
                keyboardNavigation: false
            }).on('changeDate', function () {
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
                }
                else{
                    $scope.notInRange = false;
                    $scope.notInRangeMonthly = false;
                }

                $(this).closest(".customDatesTimeframe").find("#date-selected-txt").text("Custom Dates");
            });
            $('#toggle').bootstrapToggle('off');
            $('#toggle').change(function(event) {
              $scope.toggleSchedule(this);
            });
            var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD') ;
            $('#startDateInput').datepicker('update', yesterday) ;
            $('#endDateInput').datepicker('update', yesterday );


            var lastScrollLeft = 0;
            var lastScrollTop = 0;

            $(".custom_report_scroll").scroll(function() {
                var documentScrollLeft = $(this).scrollLeft();
                if (lastScrollLeft != documentScrollLeft) {
                    lastScrollLeft = documentScrollLeft;
                    $(".custom_report_scroll").removeClass("vertical_scroll");
                }

                var documentScrollTop = $(this).scrollTop();
                if(lastScrollTop !== documentScrollTop) {
                    lastScrollTop = documentScrollTop;
                    $(".custom_report_scroll").addClass("vertical_scroll");
                }
            });

            function monthArrayMake(){
                var dayTo31 = [];
                for(var i=1;i<=31;i++){
                    dayTo31.push(i);
                }
                return dayTo31;

            }

            $scope.getNumberDate = monthArrayMake();

            //--- sapna ----

            $scope.onChoosingAditFlts = function(index,key,name) {
                $scope.additionalFilters[index].hide = false;
                $scope.additionalFilters[index].key = key;
                $scope.additionalFilters[index].name = name;

            }

            $scope.delAditFlt = function(index) {
                $scope.additionalFilters.splice(index,1);
            }

            $scope.addAdditionalFilters = function() {
                $scope.additionalFilters.push({key:"",name:"",value:"",hide:true});
            }

            $scope.initializeMetrics = function(dataObj) {
                //delivery metrics
                $scope.deliveryMetrics = dataObj.delivery_metrics;
                $scope.totalDelMetrics = dataObj.delivery_metrics.length;
                $scope.deliveryMetrics.isAllSelected = false;
                $scope.deliveryMetrics.minOneSelected = false;
                _.each($scope.deliveryMetrics,function(eachObj){
                    eachObj.selected = false;
                })
                //cost metrics
                $scope.costMetrics = dataObj.cost_metrics;
                $scope.totalCostMetrics = dataObj.cost_metrics.length;
                $scope.costMetrics.isAllSelected = false;
                $scope.costMetrics.minOneSelected = false;
                _.each($scope.costMetrics,function(eachObj){
                    eachObj.selected = false;
                })
                //engagement metrics
                console.log('eng -- : ',dataObj.engagement_metrics);
                $scope.engagementMetrics = dataObj.engagement_metrics;
                $scope.totalEngmtMetrics = dataObj.engagement_metrics.length;
                $scope.engagementMetrics.isAllSelected = false;
                $scope.engagementMetrics.minOneSelected = false;
                _.each($scope.engagementMetrics,function(eachObj){
                    eachObj.selected = false;
                })
                //video metrics
                $scope.videoMetrics = dataObj.video_metrics;
                $scope.totalVideoMetrics = dataObj.video_metrics.length;
                $scope.videoMetrics.isAllSelected = false;
                $scope.videoMetrics.minOneSelected = false;
                _.each($scope.videoMetrics,function(eachObj){
                    eachObj.selected = false;
                })
                //quality display metrics
                $scope.displayQltyMetrics = dataObj.display_quality_metrics;
                $scope.totaldisplayQltyMetrics = dataObj.display_quality_metrics.length;
                $scope.displayQltyMetrics.isAllSelected = false;
                $scope.displayQltyMetrics.minOneSelected = false;
                _.each($scope.displayQltyMetrics,function(eachObj){
                    eachObj.selected = false;
                })
                //quality video metrics
                $scope.videoQltyMetrics = dataObj.video_quality_metrics;
                $scope.totalVideoQltyMetrics = dataObj.video_quality_metrics.length;
                $scope.videoQltyMetrics.isAllSelected = false;
                $scope.videoQltyMetrics.minOneSelected = false;
                _.each($scope.videoQltyMetrics,function(eachObj){
                    eachObj.selected = false;
                })
            }

            $scope.allMetrics = false;
            $scope.OnSelectUnselectAllMetrics = function() {
                //  delivery Metrics
                $scope.deliveryMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.deliveryMetrics,function(eachObj){
                    eachObj.selected =  $scope.allMetrics;
                })

                //cost Metrics
                $scope.costMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.costMetrics,function(eachObj){
                    eachObj.selected =  $scope.allMetrics;
                })

                //engagement Metrics
                $scope.engagementMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.engagementMetrics,function(eachObj){
                    eachObj.selected =  $scope.allMetrics;
                })

                //video Metrics
                $scope.videoMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.videoMetrics,function(eachObj){
                    eachObj.selected =  $scope.allMetrics;
                })

                //Display Quality Metrics
                $scope.displayQltyMetrics.isAllSelected = $scope.allMetrics;
                _.each($scope.displayQltyMetrics,function(eachObj){
                    eachObj.selected =  $scope.allMetrics;
                })

                //Quality video Metrics
                $scope.videoQltyMetrics.isAllSelected = $scope.allMetrics;
                    _.each($scope.videoQltyMetrics,function(eachObj){
                        eachObj.selected =  $scope.allMetrics;
                    })

            }

            //Delivery Metrics
            $scope.onDeliveryMetrClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.deliveryMetrics,function(eachObj){
                        eachObj.selected =  $scope.deliveryMetrics.isAllSelected;
                    })
                } else {
                    $scope.deliveryMetrics[index].selected = !$scope.deliveryMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.deliveryMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                if(totalMetricSelected > 0) {
                    $scope.deliveryMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totalDelMetrics) {
                        $scope.deliveryMetrics.isAllSelected = true;
                    }else {
                        $scope.deliveryMetrics.isAllSelected = false;
                    }
                }
            }

            //Cost Metrics
            $scope.onCostMetrClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.costMetrics,function(eachObj){
                        eachObj.selected =  $scope.costMetrics.isAllSelected;
                    })
                } else {
                    $scope.costMetrics[index].selected = !$scope.costMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.costMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                $scope.costMetrics.minOneSelected = false;
                if(totalMetricSelected > 0) {
                    $scope.costMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totalCostMetrics) {
                        $scope.costMetrics.isAllSelected = true;
                    }else {
                        $scope.costMetrics.isAllSelected = false;
                    }
                }
            }

            //Engagement Metrics
            $scope.onEngagementMetrClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.engagementMetrics,function(eachObj){
                        eachObj.selected =  $scope.engagementMetrics.isAllSelected;
                    })
                } else {
                    $scope.engagementMetrics[index].selected = !$scope.engagementMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.engagementMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                $scope.engagementMetrics.minOneSelected = false;
                if(totalMetricSelected > 0) {
                    $scope.engagementMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totalEngmtMetrics) {
                        $scope.engagementMetrics.isAllSelected = true;
                    }else {
                        $scope.engagementMetrics.isAllSelected = false;
                    }
                }
            }

            //Display video Metrics
            $scope.onVedioMetrClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.videoMetrics,function(eachObj){
                        eachObj.selected =  $scope.videoMetrics.isAllSelected;
                    })
                } else {
                    $scope.videoMetrics[index].selected = !$scope.videoMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.videoMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                $scope.videoMetrics.minOneSelected = false;
                if(totalMetricSelected > 0) {
                    $scope.videoMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totalVideoMetrics) {
                        $scope.videoMetrics.isAllSelected = true;
                    }else {
                        $scope.videoMetrics.isAllSelected = false;
                    }
                }
            }

            //Display Qulity Metrics
            $scope.onQltyDisplayClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.displayQltyMetrics,function(eachObj){
                        eachObj.selected =  $scope.displayQltyMetrics.isAllSelected;
                    })
                } else {
                    $scope.displayQltyMetrics[index].selected = !$scope.displayQltyMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.displayQltyMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                $scope.displayQltyMetrics.minOneSelected = false;
                if(totalMetricSelected > 0) {
                    $scope.displayQltyMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totaldisplayQltyMetrics) {
                        $scope.displayQltyMetrics.isAllSelected = true;
                    }else {
                        $scope.displayQltyMetrics.isAllSelected = false;
                    }
                }
            }

            //video Metrics
            $scope.onQltyVdoMetrClick = function(index) {
                var totalMetricSelected = 0;
                if(index == undefined) {
                    _.each($scope.videoQltyMetrics,function(eachObj){
                        eachObj.selected =  $scope.videoQltyMetrics.isAllSelected;
                    })
                } else {
                    $scope.videoQltyMetrics[index].selected = !$scope.videoQltyMetrics[index].selected;
                }
                var selectedIndx = _.findIndex($scope.videoQltyMetrics, function(eachObj) {
                    if(eachObj.selected == true ){
                        totalMetricSelected++;
                    }
                });
                $scope.videoQltyMetrics.minOneSelected = false;
                if(totalMetricSelected > 0) {
                    $scope.videoQltyMetrics.minOneSelected = true;
                    if(totalMetricSelected == $scope.totalVideoQltyMetrics) {
                        $scope.videoQltyMetrics.isAllSelected = true;
                    }else {
                        $scope.videoQltyMetrics.isAllSelected = false;
                    }
                }
            }

            //delivery Metrics
            $scope.saveMetrics = function() {
                var selectedDeliveryMetrics = [];
                $scope.selectedMetricsList = [];
                _.each($scope.deliveryMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedDeliveryMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedDeliveryMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Delivery'] = selectedDeliveryMetrics;
                }

                //cost Metrics
                var selectedCostMetrics = [];
                _.each($scope.costMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedCostMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedCostMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Cost'] = selectedCostMetrics;
                }

                //engagement metrics
                var selectedEngMetrics = [];
                _.each($scope.engagementMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedEngMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedEngMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Engagement'] = selectedEngMetrics;
                }

                //video metrics
                var selectedVideoMetrics = [];
                _.each($scope.videoMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedVideoMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedVideoMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Video'] = selectedVideoMetrics;
                }

                //quality display metrics
                var selectedDsplyQltyMetrics = [];
                _.each($scope.displayQltyMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedDsplyQltyMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedDsplyQltyMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Quality Display'] = selectedDsplyQltyMetrics;
                }

                //quality video metrics
                var selectedVideoQltyMetrics = [];
                _.each($scope.videoQltyMetrics,function(eachObj) {
                    if(eachObj.selected) {
                        selectedVideoQltyMetrics.push(eachObj.key);
                        $scope.selectedMetricsList.push({'key':eachObj.key,'value':eachObj.value});
                    }
                });
                if(selectedVideoQltyMetrics.length > 0) {
                    $scope.reports.reportDefinition.metrics['Quality Video'] = selectedVideoQltyMetrics;
                }

              //  $scope.selectedMetricsList = _.union(selectedDeliveryMetrics,selectedCostMetrics,selectedEngMetrics,selectedVideoMetrics,selectedDsplyQltyMetrics,selectedVideoQltyMetrics);
                $(".metric_popup").modal('hide');
            }



        });

    });
}());
