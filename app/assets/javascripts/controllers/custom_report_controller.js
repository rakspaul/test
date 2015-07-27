var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('customReportController', function ($rootScope, $scope, $route, $window, campaignSelectModel, strategySelectModel, kpiSelectModel, platformService, utils, dataService,  apiPaths, requestCanceller, constants, domainReports, timePeriodModel, loginModel, analytics, $timeout) {

        $scope.textConstants = constants;
        var _customctrl = this;
        var elem = $(".each_section_custom_report").find(".dropdown").find(".dd_txt");

        var metricKey = ['dimensions', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        var metricKey1 = ['dimension', 'delivery_metrics', 'booked_metrics', 'engagement_metrics', 'video_metrics'];
        $scope.dataNotFound = false;
        $scope.reportDataBusy = false;
        $scope.activeTab = "delivery_metrics";
        $scope.filters = domainReports.getReportsTabs();
        $scope.count =0;
        $scope.secondDimensionReportLoading = {};
        $scope.metrics_text = 'Default';

        $scope.getMessageForDataNotAvailable = function () {
            return constants.MSG_DATA_NOT_AVAILABLE_FOR_DASHBOARD;
        };


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
                _.extend(d[activeTab], d['dimension']);
                activeTabDataObj.push(d[activeTab]);
            });

            $.extend(true, $scope.metricValues, tmpObj);

            console.log($scope.metricValues);
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

            $scope.customeDimensionData = result.data.data;
            var modifiedDimesionArr = result.data.data[0];
            $scope.showDefaultDimension = modifiedDimesionArr.dimensions[0];
            $scope.showDefaultDimension['template_id'] = modifiedDimesionArr.template_id;
        });

        $scope.metricSelected =  function(ev) {
            var selectedItems= [];
            var selectedElems = $(".each_measurable_col").find(".active");
            _.each(selectedElems, function(ele) {
                var el = $(ele);
                selectedItems.push({key:el.attr("id"), value:el.text()});
            });
            $scope.metrics_text = 'Custom ('+ selectedItems.length +')';
            $scope.selectedMetricsList = selectedItems;
            $(".metric_popup").modal('hide');
        };

        _customctrl.getSelectedAdditionalFilter = function() {
            var filterArr =[];
            var elem =$(".custom_filter_breakdown");
            _.each(elem, function(el) {
                var fdimesnion =  $.trim($(el).find(".dropdown_ul_text").text());
                var ftext = $(el).find(".reportFilter").val()

                var fstr = (fdimesnion + (ftext ? (':' + ftext) : ''))
                filterArr.push(fstr)
            });
            filterArr = _.filter(filterArr, function(val) { return val !== 'Choose filter'});
            return filterArr.join("~");
        };

        _customctrl.getTimeFrame =  function() {
            var dateWrapper = $(".dateWrapper").find(".timeframe")
            return '&startdate='+dateWrapper[0].value +"&endDate="+dateWrapper[1].value;
        };

        _customctrl.enableGenerateButton =  function() {
            return $(".dimension_block").find(".dd_txt").text() !=='Choose Breakdown';
        };

        _customctrl.createRequestParams = function(filterText, offset) {
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
            if($scope.isReportForMultiDimension && filterText) {
                str =  dimensionIds[1] + (reportFilterList[1] !== '' ?  (':' + reportFilterList[1]) : '');
                str += "&filter=" + dimensionIds[0] + (filterText !== '' ? (':' + filterText) : '');
            } else {
                str =  dimensionIds[0] + (reportFilterList[0] !== '' ?  (':' + reportFilterList[0]) : '');
                additonalFilter = _customctrl.getSelectedAdditionalFilter();
                if(additonalFilter.length >0)
                    str += "&filter=" + additonalFilter;
            }

            str += _customctrl.getTimeFrame();
            params = reportId+"?dimension="+str+"&offset="+offset+"&limit="+$scope.limit;
            return params;
        };

        _customctrl.errorHandler = function() {
            $scope.reportDataLoading = false;
            $scope.reportDataNotFound = true;
        };

        _customctrl.fetchReportData = function(selectedMetricsList, params, idx, callback)  {
            dataService.getCustomReportData($scope.campaign, params).then(function(result) {
                requestCanceller.resetCanceller(constants.NEW_REPORT_RESULT_CANCELLER);
                if(result && result.data.data) {
                    callback(result.data.data.report_data, idx)
                } else {
                    _customctrl.errorHandler();
                }
            }, _customctrl.errorHandler);
        };

        _customctrl.getReportData = function() {
            _customctrl.fetchReportData($scope.selectedMetricsList, _customctrl.createRequestParams(null, $scope.firstDimensionoffset), null, function(respData) {
                $scope.fetching = false;
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
            });
        }

        $scope.generateReport = function() {
            if(!_customctrl.enableGenerateButton()) {
                $(".report_generate_button").addClass("disabled") ;
                $(".custom_report_filter").closest(".breakdown_div").find(".filter_input_txtbox").hide() ;
                return false;
            }
            $(".report_generate_button").removeClass("disabled") ;
            $scope.metricValues = [];
            $scope.reportMetaData={};
            $scope.hideReportsTabs = false;
            $scope.reportDataNotFound = false;
            $scope.showhasBreakdown = '';
            $scope.reportDataLoading = true;
            $scope.fetching = false;
            $(".img_table_container").hide();
            $(".custom_report_response_page").show();
            $("html, body").animate({ scrollTop: 0 });
            if($scope.selectedMetricsList && $scope.selectedMetricsList.length >0) {
                $scope.hideReportsTabs = true;
            }
            _customctrl.reset();
            _customctrl.getDimensionList($scope.customeDimensionData[0], $scope.selectedMetricsList);
            _customctrl.getReportData();

        };
        $scope.enable_generate_btn = function() {
            if(_customctrl.enableGenerateButton()) {
                $(".report_generate_button").removeClass("disabled") ;
            } else {
                $(".report_generate_button").addClass("disabled") ;
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
            firtDimensionElem.removeClass('active treeOpen');
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
                $scope.secondDimensionReportLoading[currentRowIndex] = true;
                _customctrl.fetchReportData($scope.selectedMetricsList, _customctrl.createRequestParams(value, $scope.secondDimensionOffset), currentRowIndex, function (respData, currentRowIndex) {
                    currFirtDimensionElem.addClass('active');
                    var resultLen = respData.length;
                    if(resultLen >= $scope.limit) {
                        currSecondDimensionElem.find('.sec_dimension_load_more').show().attr("offset", resultLen);
                    }
                    if (respData.length > 0) {
                        $scope.secondDimensionReportLoading[currentRowIndex] = false;
                        _customctrl.getMetricValues(respData, $scope.selectedMetricsList, 'second_dimension', currentRowIndex);
                    }
                });
            } else {
                //hide the second dimension data for clcked row
                _customctrl.hideSecondDimensionData(currFirtDimensionElem, currSecondDimensionElem);
            }
        };

        _customctrl.reset = function(){
            $scope.limit = 15;
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
        };

        $scope.select_dropdown_option = function(event , arg ) {
            
            var elem = $(event.target);
            elem.closest(".dropdown").find(".dd_txt").text(elem.text()) ;
            elem.closest(".dropdown").find(".dd_txt").attr('id', elem.attr("id")) ;
            elem.closest(".breakdown_div").find(".filter_input_txtbox").show() ;
            
            var startDate,endDate;

            switch(arg) {
                case 'yesterday':
                    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    endDate   = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    break;
                case 'weekToDate':
                    startDate = moment().startOf('week').format('YYYY-MM-DD');
                    endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD'); 
                    break;
                case 'last7Days':
                    startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
                    endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD'); 
                    break;
                case 'lastWeek': 
                    startDate = moment().subtract(1,'week').startOf('week').format('YYYY-MM-DD');
                    endDate   = moment().subtract(1,'week').endOf('week').format('YYYY-MM-DD');  
                    break;
                case 'monthToDate': 
                    startDate = moment().format('YYYY-MM')+'-01';
                    endDate   = moment().format('YYYY-M-DD');  
                    break;
                case 'lastMonth': 
                    startDate = moment().subtract(1,'months').endOf('month').format('YYYY-MM') + '-01';
                    endDate   = moment().subtract(1,'months').endOf('month').format('YYYY-MM-DD');  
                    break;
                case 'quarterToDate': 
                    startDate = moment().startOf('quarter').format('YYYY-MM-DD');
                    endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');  
                    break;
                case 'lastQuarter': 
                    startDate = moment().subtract(1,'quarter').startOf('quarter').format('YYYY-MM-DD');
                    endDate   = moment().subtract(1,'quarter').endOf('quarter').format('YYYY-MM-DD');  
                    break;
                case 'yearToDate': 
                    startDate = moment().format('YYYY')+'-01-01';
                    endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');  
                    break;
                case 'customDates': 
                    startDate = moment().subtract(0, 'days').format('YYYY-MM-DD');
                    endDate   = moment().subtract(0, 'days').format('YYYY-MM-DD');  
                    break;
                default:
                    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    endDate   = moment().subtract(1, 'days').format('YYYY-MM-DD');
            }
            $('#startDateInput').datepicker('update', startDate);
            $('#endDateInput').datepicker('update', endDate);
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

        $(document).ready( function() {
            $('.input-daterange').datepicker({
                format: "yyyy-mm-dd",
                orientation: "top auto",
                autoclose: true,
                todayHighlight: true,
                keyboardNavigation: false
            }).on('changeDate', function () {
                $("#date-selected-txt").text("Custom Dates");
            });
            var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD') ;
            $('#startDateInput').datepicker('update', yesterday) ;
            $('#endDateInput').datepicker('update', yesterday );
        });

    });
}());