/*global angObj, angular*/
define(['angularAMD', 'login/login_model', 'common/services/constants_service',
    'common/utils'
],function (angularAMD) {
    "use strict";
    angularAMD.factory("actionChart", function($timeout, loginModel, constants, utils) {

        var kpiPrefix = function (kpiType) {
            var kpiTypeLower = kpiType.toLowerCase();
            return (kpiTypeLower == 'cpc' || kpiTypeLower == 'cpa' || kpiTypeLower == 'cpm') ? constants.currencySymbol : ''
        };
        var kpiSuffix = function (kpiType) {
            return (kpiType.toLowerCase() == 'vtc') ? '%' : ''
        };
        var getValueFromSelectedCircle = function(getSelectedCircleSLNo,fieldName){
            return $('circle[circle_slno="'+getSelectedCircleSLNo+'"]').attr(fieldName);
        }
        var getActivityCountLabel = function(activityCount){
            var display_activityCount =  '';
             switch(true) {
               case (activityCount >=1 && activityCount < 10) :
                     display_activityCount =  '    <span style="color:transparent">-</span>'+ activityCount+' ';
                     break;
               case (activityCount >= 10 && activityCount <= 99) :
                    display_activityCount =  ' '+activityCount+' ';
                    break;
               case (activityCount >99) :
                    display_activityCount =  ' 99+';
                    break;
            }
            return display_activityCount;
        };
        var getOverlapFlag = function(activityDateArray,actionUTC){
            var overlapFlag;
            if (_.indexOf(activityDateArray,actionUTC) == -1 ){
                activityDateArray.push(actionUTC);
                overlapFlag = 0;
            }else{
                overlapFlag = 1;
            }
            return {"overlapFlag":overlapFlag,"activityDateArray":activityDateArray};
        }
        var getOverlapZIndex = function(isActionExternal,overlapFlag){
            var overlapZIndex;
            switch(true) {
               case (isActionExternal == true && overlapFlag  == 1) :
                     overlapZIndex = 5;
                     break;
                case (isActionExternal == false && overlapFlag  == 1) :
                     overlapZIndex = 3;
                     break;
                default:
                    overlapZIndex = 4;

            }
            return overlapZIndex;

        }
        var wordwrap =  function(str, int_width, str_break, cut) {
            var m = ((arguments.length >= 2) ? arguments[1] : 75);
            var b = ((arguments.length >= 3) ? arguments[2] : '\n');
            var c = ((arguments.length >= 4) ? arguments[3] : false);

            var i, j, l, s, r;

            str += '';

            if (m < 1) {
                return str;
            }

            for (i = -1, l = (r = str.split(/\r\n|\n|\r/))
                .length; ++i < l; r[i] += s) {
                for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j))
                        .length ? b : '')) {
                    j = c == 2 || (j = s.slice(0, m + 1)
                        .match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(
                        m)
                        .match(/^\S*/))[0].length;
                }
            }

            return r.join('\n');
        };
        var browserInfo = utils.detectBrowserInfo();
        var adjustY = browserInfo.browserName == 'Firefox' ? 8 :7;
        var adjustX = browserInfo.browserName == 'Firefox' ? 1 :0;
        var drawMarker = function (chart, xPos, yPos, markerColor, kpiType, kpiValue, actionId, actionComment, isActionExternal, defaultGrey,activityCount,id_list,circleSLNo,overlapFlag) {
            var text,
                box,
                textBG,
                container,
                display_color = activityCount == 1 ? 'transparent' : '#000',
                flagId = isActionExternal == true ? 'external' : 'internal',
                applyColor = (activityCount >1 ) ? 1 : 0,
                place_circle_x = 7.0,
                display_activityCount = getActivityCountLabel(activityCount),
                displayFontSize = (activityCount > 99 ) ? '8px' : '12px',
                getMessage = ' External ',
                numberOfActivityHeader = isActionExternal == true ? '<b>'+activityCount+'</b> '+getMessage+' Activities' : '<b>'+activityCount +'</b> Internal Activities',
                circleObj = null,
                overlapBubbleAdjust = overlapFlag == 1 ? -5 : 0,
                bubbleZIndex = getOverlapZIndex(isActionExternal,overlapFlag),
                marker = chart.renderer.text(display_activityCount,xPos-7 ,yPos+2+overlapBubbleAdjust).attr({
                    id: 't'+actionId || 'NA',
                    removeX:16,
                    flagId:flagId,
                    zIndex: 19,
                    applyColor:applyColor,
                    circle_slno:circleSLNo
                }).css({
                    fontSize: displayFontSize,
                    textAlign: 'center',
                    position:'absolute',
                    padding:5,
                    fontFamily: 'Avenir',
                    color:display_color,
                    cursor: 'pointer'
                }).on('click', function (markerObj) {
                    $('#'+actionId).click();
                }).on('mouseover', function (event) { // added mouseover and mouseout event on text + tspan(inside circle area) to show popup
                    chart.tooltip.hide();
                    var target = event.target.tagName === 'tspan' ? $(event.target).parents('text') : $(event.target);
                    var textId = target.attr('id').substr(1);
                    var circleList = $(event.target).parents('svg').find('circle');
                    circleObj = $(_.filter(circleList, function(obj) {  return $(obj).attr("id") === textId}));
                    circleObj.trigger('mouseover');
                    }).on('mouseout', function (markerObj) {
                        circleObj.trigger('mouseout');
                        $('.highcharts-tooltip').show();
                    }).add(),
                container = marker.getBBox();
            var getPosition = function(that,axis){
                return parseInt(that.getAttribute(axis));
            };
            var getCircleStatus = function(that){
               return that.getAttribute("circle_slno").substr(0,3);
            };
            var chartMouserOver =  function(event, chart, that) {
                chart.tooltip.hide();
                var cX = getPosition(that,'cX') + 10,
                    cY = getPosition(that,'cY') + 15,
                    getId = getPosition(that,'id'),
                    circleStroke = getCircleStatus(that) == 'ext' ? '#2c9aec':'#7e848b',
                    activityCount = getPosition(that,'number_of_activity'),
                    activeStatus = getPosition(that,'activestatus') > 0 ? 1 :0;
                $("#"+getId).attr({stroke:circleStroke});
                //Mouseover for the text need to check if activity count > 1
                if(activityCount > 1 && activeStatus == 0){
                    $("#t"+getId).css({color:circleStroke,fill:circleStroke});
                }
                    var x = cX,
                    y = cY,
                    correctionX = 0,
                    symbol = '',
                    suffix = '',
                    html_comment;

                if ((chart.plotWidth - x) < 0) { //check if left side
                    correctionX = (chart.plotWidth - x) * 2 - 10;
                }

                symbol = kpiPrefix(kpiType);
                suffix = kpiSuffix(kpiType);
                html_comment= (that.getAttribute('comment')).toString().replace(/(?:<)/g, '&lt;');
                html_comment = wordwrap(html_comment, 20, '<br/>');
                html_comment = html_comment.replace(/(?:\\r\\n|\r|\\n| \\n)/g, '<br />');

                if(activityCount > 1){
                    $('.highcharts-tooltip').hide();
                    html_comment = numberOfActivityHeader;
                }

                text = chart.renderer.text(that.getAttribute('kpiType') + ": <b>" + symbol + that.getAttribute('kpiValue') + suffix + "</b><br>" + html_comment  , x + 10 + correctionX, y + 10 * 2)
                            .attr({
                                zIndex: 16
                            }).css({
                                fillColor: '#fff',
                                color: '#000'
                            }).add();

                box = text.getBBox();
                textBG = chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
                        .attr({
                            fill: '#ffffff',
                            stroke: '#0072bc' || 'grey',
                            'stroke-width': 1,
                            zIndex: 15
                        }).add();
            };
            var chartMouseOut = function(that){
                 var getId = getPosition(that,'id'),
                     circleStroke = getCircleStatus(that) == 'ext' ? '#177ac6':'#57606c',
                     activityCount = getPosition(that,'number_of_activity'),
                     activeStatus = getPosition(that,'activestatus') > 0 ? 1 :0,
                     display_color = activityCount == 1 ? 'transparent' : '#000';
                if(activeStatus == 0){
                      // Mouseout for the circle
                     $("#"+getId).attr({stroke:circleStroke});
                     // Mouseout for the Text
                     $("#t"+getId).css({color:display_color,fill:display_color});
                }else{
                     //$("#"+getId).attr({stroke:circleStroke});
                     // Mouseout for the Text
                     if(activityCount > 1)
                     $("#t"+getId).css({color:'#fff',fill:'#fff'});
                }
            };
            var chartClick =  function(circleObj, that) {
                var myContainer = $('#action-container:first'),
                    getIdList = that.getAttribute('id_list'),
                    circle_slno = that.getAttribute('circle_slno'),
                    splitIdList =  getIdList.split(",");

                $('circle').attr({ fill:'#ffffff',activeStatus:0});
                //check and select multiple activity id
                if(splitIdList.length > 1 ) {
                    for(var i=0;i < splitIdList.length;i++){
                        var targetId =splitIdList[i];
                        $('circle#' + targetId).attr({ fill:(  isActionExternal == false ) ? '#7e848b':'#2c9aec',activeStatus:1});
                    }
                } else {
                    $('circle#' + circleObj.target.id).attr({ fill:(  isActionExternal == false ) ? '#7e848b':'#2c9aec',activeStatus:1});
                }
                $("text[applyColor=1]").css({fill:'#000'});
                var getactivityCount = that.getAttribute('number_of_activity');
                if(getactivityCount > 1){
                    $('text#t' + circleObj.target.id).css({fill:'#fff'});
                }
                var activityLocalStorage={"actionSelStatusFlag":isActionExternal,"actionSelActivityCount":getactivityCount,"actionSel":getIdList,"selectedCircleSLNo":circle_slno};
                localStorage.setItem('activityLocalStorage',JSON.stringify(activityLocalStorage));
                if(defaultGrey) {
                    myContainer = $('.reports_section_details_container');
                    $('div[id^="actionItem_"]').removeClass('action_selected');
                    //highlight activity in reports page
                    var scrollTo = $('#actionItem_' + that.id);
                    if(scrollTo.length) {
                        scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
                        //Mulitple Activity List
                        if(splitIdList.length > 1 ){
                            for(var i=0;i < splitIdList.length;i++){
                                var targetId =splitIdList[i];
                                myContainer.find('#actionItem_'+targetId).addClass('action_selected');
                                //ToDO Remove commented one after the fixes
                               /* myContainer.animate({
                                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                });
*/
                            }
                            myContainer.animate({
                                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                            });
                        }else{
                            //Day wise single Activity
                            myContainer.find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+that.id).addClass('action_selected');
                            myContainer.animate({
                                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                            });

                        }
                        //grunt analytics.track(loginModel.getUserRole(), constants.GA_OPTIMIZATION_TAB, 'optimization_graph_activity_marker_click', loginModel.getLoginName());
                    }
                } else {
                //click to scroll and highlight activity
                    var scrollTo = $('#actionItem_' + that.id);
                    if(scrollTo.length) {
                        scrollTo.siblings().removeClass('active').end().addClass('active');
                        if(splitIdList.length > 1 ){
                            myContainer.find('.active').removeClass('active').end();
                            for(var i=0;i < splitIdList.length;i++){
                                var targetId =splitIdList[i];
                                myContainer.find('#actionItem_'+targetId).addClass('active');
                                //ToDO Remove below commented one after fix
                                /*myContainer.animate({
                                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                });*/
                            }
                            //
                            myContainer.animate({
                                    scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                });
                        }else{
                            myContainer.find('.active').removeClass('active').end().find('#actionItem_'+that.id).addClass('active');
                            myContainer.animate({
                                scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                            });
                        }
                        //grunt analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'campaign_performance_graph_activity_click', loginModel.getLoginName());
                    }
                }
            };
            // Adjust the circle if activity Count is greater than 99+
            var adjustYForMoreActivity = activityCount > 99 ?   0.80 : 0;
            chart.renderer.circle(container.x+place_circle_x+adjustX , container.y+adjustY-adjustYForMoreActivity,9).attr({
                fill: '#fff',
                stroke: (defaultGrey == false|| isActionExternal == false ) ? '#777':'#0072bc',
                'stroke-width': 2.5,
                id: actionId || 'NA',
                kpiType: kpiType || 'NA',
                kpiValue: kpiValue || 'NA',
                comment: actionComment || 'NA',
                id_list:id_list,
                /*activityCount:activityCount,*/
                number_of_activity:activityCount,
                zIndex: bubbleZIndex,
                cX: container.x,
                cY:container.y,
                circle_slno:circleSLNo
            }).css({
                cursor: 'pointer'
            }).on('mouseover', function (event) {
                chartMouserOver(event, chart, this);
            }).on('mouseout', function (event) {
                chartMouseOut(this);
                text.destroy();
                textBG.destroy();
                $('.highcharts-tooltip').show();
            }).on('click', function (circleObj) {
                chartClick(circleObj, this);
            }).add();
        };
        // create a unique SLNO with Internal Or External flag with date
        //actionUTC activity date
        var getCircleSLNo = function(make_external,extSLNo,intSLNo,actionUTC,selectedCampaignId){
            var circleSLNo = undefined;
            if(make_external == true){
                circleSLNo ="extSL_"+extSLNo+"_"+actionUTC+"_"+selectedCampaignId;
                extSLNo++;
            }else{
               circleSLNo ="intSL_"+intSLNo+"_"+actionUTC+"_"+selectedCampaignId;
               intSLNo++;
            }
            return {"circleSLNo":circleSLNo,"extSLNo":extSLNo,"intSLNo":intSLNo};
        };
        var lineChart = function(lineData, threshold, kpiType, actionItems, width, height, defaultGrey, actionId, external, navigationFromReports) {
            var data = [],
                dataArr = [],
                kpiType = kpiType!='null' ? kpiType:'NA',
                lineDataLen = lineData.length;

            for (var i = 0; i < lineDataLen; i++) {
                var chartData = lineData[i]['date'].split("-");
                dataArr.push(lineData[i]['y'] || 0);
                data.push([
                    Date.UTC(parseInt(chartData[0]), parseInt(chartData[1], 10) - 1 , parseInt(chartData[2])),
                    lineData[i]['y'] || 0
                ]);
            }

            var dataLength = data.length,
                timeInterval = dataLength/ 7,
                minVal = Math.min.apply(Math,dataArr),
                maxVal = Math.max.apply(Math,dataArr),
                range = parseFloat(parseFloat(maxVal) - parseFloat(minVal)),
                percentage = ((parseFloat(maxVal) - parseFloat(minVal))/100)*15,
                setMinVal = minVal,
                setMaxVal = maxVal;
                if(threshold >= 0){
                    setMinVal = minVal <= threshold ? minVal : threshold;
                    setMaxVal = maxVal <= threshold ? threshold : maxVal;
                }
                if(percentage > 0 ){
                    setMaxVal = setMaxVal + percentage;
                }
            return {
                options: {
                    chart: {
                        width: width || 400,
                        height: height || 330,
                        margin: [25, 0, 50, 60]
                    },
                    title: {
                        text: '',
                        style: {
                         "color": "#ffffff"
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: [
                        {
                            type: 'datetime',
                            maxPadding:0,
                            minPadding:0,
                            tickWidth: 0,
                            labels: {
                                style: {"color":"#57595b","fontSize":11},
                                formatter: function() {
                                    if(this.isFirst) {
                                        return Highcharts.dateFormat('%e', this.value);
                                    } else {
                                        return Highcharts.dateFormat('%e', this.value);
                                    }
                                }
                            },
                            tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
                        },
                        {
                            lineWidth: 0,
                            minorGridLineWidth: 0,
                            lineColor: 'transparent',
                            minorTickLength: 0,
                            tickLength: 0,
                            tickWidth: 0,
                            type: 'datetime',
                            labels: {
                                formatter: function() {
                                    return Highcharts.dateFormat('%b', this.value);
                                }
                            },
                            tickInterval : Math.ceil(timeInterval) * 24 * 3600 * 1000
                        }
                    ],
                    yAxis: {
                        maxPadding:0,
                        minPadding:0,
                        min:setMinVal,
                        max:setMaxVal,
                        title: {
                            align: 'high',
                            offset: 13,
                            text: (kpiType === kpiType.toUpperCase()) ? kpiType : kpiType.toUpperCase(),
                            rotation: 0,
                            y: -5
                        },
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        lineWidth: 1,
                        tickWidth: 0,
                        labels: {
                            style: {"color":"#57595b","fontSize":11},
                            formatter: function() {
                                return kpiPrefix(kpiType) + this.value + kpiSuffix(kpiType);
                            }
                        },
                        //TODO - remove this after the date ticks are rewritten
                        /*plotBands: [{ // Light air
                            color: '#ffefef',
                            label: {
                              enabled: false,
                              text: '',
                              style: {
                                  color: 'red'
                              }
                            }
                        }],*/
                        plotLines: [{
                            label: {
                                text: 'Baseline',
                                x: 25
                            },
                            color: 'orange',
                            width: 0,
                            value: threshold,
                            dashStyle: 'longdashdot'
                        }]
                    },
                    tooltip: {
                        crosshairs: [{
                            dashStyle: 'dash'
                        }],
                        enabled: true,
                        formatter: function() {
                            var symbol = kpiPrefix(kpiType),
                                suffix = kpiSuffix(kpiType);
                            if(typeof (this.point.options.note) === 'undefined') {
                              return this.series.name + ':' + ' <b>'+ symbol + this.point.y + suffix + '</b><br/>';
                            } else {
                              return this.series.name + ':' + ' <b>' + symbol + this.point.y + suffix + '<br>' + this.point.options.note.text + '</b><br/>';
                            }
                        }
                    }
                },
                series: [{
                    id: 'series-1',
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    name: kpiType,
                    data: data,
                    //color: "#177ac6" /*#6fd0f4"*/
                    threshold: threshold,
                    negativeColor: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#0078cc' : '#f24444',
                    color: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? '#f24444' : '#0078cc'
                }],
                loading: false,
                func: function(chart) {
                    $timeout(function() {
                        var counter = 0, flag = [], position = 0, showExternal;
                        var kpiTypeLower = kpiType.toLowerCase();
                        //red zone calculations
                        if( chart != undefined && chart.xAxis != undefined && chart.yAxis != undefined) {
                            var extremesX = chart.xAxis[0].getExtremes();
                            chart.xAxis[1].setExtremes(extremesX.min - 0.5, extremesX.max + 0.5);
                            var extremes =  chart.yAxis[0].getExtremes() ;
                            if (kpiTypeLower == 'cpc' || kpiTypeLower == 'cpa' || kpiTypeLower == 'cpm') {
                                if (extremes.max <= threshold) {
                                    //check if threshold outside chart (red zone is from above the threshold to max value (that is regenerated if outside graph))
                                    chart.yAxis[0].setExtremes(0, extremes.max + (threshold - extremes.max) + 0.5);
                                }
                            } else {
                                //for kpi types - clicks, impressions etc (redzone is from threshold to zero)
                                if (extremes.max < threshold) {
                                //check if threshold outside chart
                                    chart.yAxis[0].setExtremes(0, extremes.max + (threshold - extremes.max));
                                }
                            }

                            //plotting red zone
                            extremes =   chart.yAxis[0].getExtremes() ;
                            chart.yAxis[0].addPlotBand({ // Light air
                                from: threshold,
                                to: (kpiTypeLower == 'cpc' || kpiTypeLower == 'cpa' || kpiTypeLower == 'cpm') ? extremes.max : extremes.min,
                                color: '#fff',
                                label: {
                                    enabled: false,
                                    text: '',
                                    style: {
                                        color: 'red'
                                    }
                                }
                            });

                            chart.yAxis[0].addPlotLine({
                                value: extremes.max,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });

                            //draw plotlines

                            chart.xAxis[0].addPlotLine({
                                value: extremesX.max,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });

                            chart.xAxis[0].addPlotLine({
                                value: extremesX.min,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });

                            chart.yAxis[0].addPlotLine({
                                value: threshold,
                                color: '#D2DEE7',
                                width: 1,
                                id: 'plot-line-1'
                            });

                            //rendering threshold marker image in y-axis
                            var renderPos;
                            if ((threshold <= chart.yAxis[0].max && threshold >= chart.yAxis[0].min) && threshold > 0)  {
                                chart.renderer.image("/"+assets.target_marker, 0, (chart.yAxis[0].toPixels(threshold) - chart.plotTop / 2) + 5.7, 13, 13).add();
                            }

                            //rendering action markers after red zone manipulation
                            if (external != undefined && external == true) {
                                //filter applied
                                showExternal = true;
                            }

                            var countActivityItem = [],
                                findPlacedActivity = [],
                                eFlag =0;
                            if (actionItems) {
                                for (i = chart.series[0].data.length - 1; i >= 0; i--) {
                                    position = 0;
                                    for (var j = actionItems.length - 1; j >= 0; j--) {
                                        var dateUTC = new Date(actionItems[j].created_at);
                                        var actionUTC = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
                                        if (chart.series[0].data[i].x == actionUTC) {
                                            if (flag[actionUTC] === undefined) {
                                                flag[actionUTC] = 1;
                                            }

                                            if((showExternal && actionItems[j].make_external == true) || (showExternal === undefined)) {
                                                eFlag = actionItems[j].make_external;
                                                if (countActivityItem[actionUTC] == undefined  ){
                                                    countActivityItem[actionUTC] = [];
                                                    countActivityItem[actionUTC]['externalIDS'] =[];
                                                    countActivityItem[actionUTC]['internalIDS'] =[];
                                                    countActivityItem[actionUTC]['external'] = 0
                                                    countActivityItem[actionUTC]['internal'] = 0;
                                                }
                                                if(eFlag == true){
                                                    if( countActivityItem[actionUTC]['external'] != undefined ){
                                                        countActivityItem[actionUTC]['external']++;
                                                        var arrayVar = "externalIDS";
                                                    }
                                                } else {
                                                    var arrayVar = "internalIDS";
                                                    if( countActivityItem[actionUTC]['internal'] != undefined ){
                                                        countActivityItem[actionUTC]['internal']++;
                                                    }
                                                }
                                                var activity_id = actionItems[j].ad_id + '' + actionItems[j].id;
                                                var check_morethan_one = countActivityItem[actionUTC][arrayVar].length > 0 ? "," : "";
                                                countActivityItem[actionUTC][arrayVar]= countActivityItem[actionUTC][arrayVar] + check_morethan_one + activity_id;
                                            }
                                        }
                                    }
                                }
                            }

                            var activityCount = 0;
                            var extSLNo,intSLNo,overlapResult,activityDateArray = [];
                            extSLNo = intSLNo = 1;
                            var getParams= (document.URL).split(/[\s/]+/);
                            var selectedCampaignId = getParams[getParams.length - 1] == 'optimization' ? JSON.parse(localStorage.getItem('selectedCampaign')).id : getParams[getParams.length - 1] ;
                            if (actionItems) {
                                for (i = chart.series[0].data.length - 1; i >= 0; i--) {
                                    position = 0;
                                    for (var j = actionItems.length - 1; j >= 0; j--) {
                                        var dateUTC = new Date(actionItems[j].created_at);
                                        var actionUTC = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
                                        if (chart.series[0].data[i].x == actionUTC) {
                                            if (flag[actionUTC] === undefined) {
                                                flag[actionUTC] = 1;
                                            }

                                            if ((showExternal && actionItems[j].make_external == true) || (showExternal === undefined)) {
                                                var checkFlag = actionItems[j].make_external == true ? 'external':'internal',
                                                    arrayVar = actionItems[j].make_external == true ? 'externalIDS':'internalIDS',
                                                    id_list = countActivityItem[actionUTC][arrayVar],
                                                    overlapFlag;
                                                activityCount = countActivityItem[actionUTC][checkFlag];
                                                if(activityCount == 1){
                                                    var circleInfo = getCircleSLNo(actionItems[j].make_external,extSLNo,intSLNo,actionUTC,selectedCampaignId);
                                                    var circleSLNo = circleInfo.circleSLNo;
                                                    //Get Increment Id for external and Internal SL Number
                                                    extSLNo = circleInfo.extSLNo;
                                                    intSLNo = circleInfo.intSLNo;
                                                    overlapResult = getOverlapFlag(activityDateArray,actionUTC);
                                                    activityDateArray = overlapResult.activityDateArray;
                                                    overlapFlag = overlapResult.overlapFlag;
                                                    drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, chart.series[0].data[i].y, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment, actionItems[j].make_external, defaultGrey,activityCount,id_list,circleSLNo,overlapFlag);
                                                    counter++;
                                                    position += 10; //correction for multiple markers in the same place
                                                } else {
                                                    if (findPlacedActivity[actionUTC] == undefined  ){
                                                        findPlacedActivity[actionUTC] =[];
                                                        findPlacedActivity[actionUTC]['external'] = 0
                                                        findPlacedActivity[actionUTC]['internal'] = 0;
                                                    }
                                                     //Multiple Item in single chart
                                                    if( findPlacedActivity[actionUTC][checkFlag] != 'completed' ){
                                                        findPlacedActivity[actionUTC][checkFlag] = 'completed';
                                                        var circleInfo = getCircleSLNo(actionItems[j].make_external,extSLNo,intSLNo,actionUTC,selectedCampaignId);
                                                        //Get circle SL Number
                                                        var circleSLNo = circleInfo.circleSLNo;
                                                        //Get Increment Id for external and Internal SL Number
                                                        extSLNo = circleInfo.extSLNo;
                                                        intSLNo = circleInfo.intSLNo;
                                                        overlapResult = getOverlapFlag(activityDateArray,actionUTC);
                                                        activityDateArray = overlapResult.activityDateArray;
                                                        overlapFlag = overlapResult.overlapFlag;
                                                        drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, chart.series[0].data[i].y, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment, actionItems[j].make_external, defaultGrey,activityCount,id_list,circleSLNo,overlapFlag);
                                                        counter++;
                                                        position += 20;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if(navigationFromReports == false && actionId !== undefined) {
                                $('circle#' + actionId).attr({stroke: '#0070CE', fill: '#0070CE'});
                                $('#action-container:first').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+actionId).addClass('action_selected');
                                $('.reports_section_details_container').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+actionId).addClass('action_selected');
                            }
                            //Action Selection Activity
                            //AFter loaded default select
                            var activityLocalStorageInfo = JSON.parse(localStorage.getItem('activityLocalStorage'));
                            if(activityLocalStorageInfo != null) {
                               $('div[id^="actionItem_"]').removeClass('active');

                                     var isActionExternal = activityLocalStorageInfo.actionSelStatusFlag,
                                         getSelectedCircleSLNo = activityLocalStorageInfo.selectedCircleSLNo,
                                         //getactivityCount = $('circle[circle_slno="'+getSelectedCircleSLNo+'"]').attr("number_of_activity"),
                                         getactivityCount = getValueFromSelectedCircle(getSelectedCircleSLNo,'number_of_activity'),
                                         splitIdList =  [],
                                         //getIds =  $('circle[circle_slno="'+getSelectedCircleSLNo+'"]').attr("id_list");
                                         getIds = getValueFromSelectedCircle(getSelectedCircleSLNo,'id_list');
                                    if(getIds != undefined){
                                        splitIdList = getIds.split(",");
                                    }
                                    $('circle').attr({activeStatus:0});
                                    $('circle[circle_slno="'+getSelectedCircleSLNo+'"]').attr({ fill:   isActionExternal == false  ? '#7e848b':'#2c9aec',activeStatus:1,stroke:   isActionExternal == false  ? '#7e848b':'#2c9aec'});
                                if(getactivityCount > 1){
                                    $('text[circle_slno="'+getSelectedCircleSLNo+'"]').css({fill:'#fff',activeStatus:1});
                                }
                                var numberOfActiveStatus=$('circle[activestatus="1"]').length;
                                //Select Activity
                                var myContainer = $('#action-container:first');
                                if(splitIdList.length > 1 && numberOfActiveStatus > 0 ){
                                    var scrollTo = $('#actionItem_' + splitIdList[0]);
                                    scrollTo.siblings().removeClass('active').end().addClass('active');
                                    //Mulitple Activity List
                                    for(var i=0;i < splitIdList.length;i++){
                                        var targetId =splitIdList[i];
                                        //$('circle#' + targetId).attr({ fill: '#777'});
                                         myContainer.find('#actionItem_'+targetId).addClass('active');
                                         //TODO remove the commented code after the fixes
                                         /*if(scrollTo.length) {
                                             myContainer.animate({
                                              scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                            });
                                         }*/
                                    }
                                    if(scrollTo.length) {
                                             myContainer.animate({
                                              scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                            });
                                    }
                                } else {//Day wise single Activity
                                    if(numberOfActiveStatus > 0){
                                         var scrollTo = $('#actionItem_' + splitIdList[0]);
                                         if(scrollTo.length) {
                                            scrollTo.siblings().removeClass('active').end().addClass('active');
                                            myContainer.animate({
                                              scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                                          });
                                        }
                                    }
                                }//end activity Selection
                            }
                         //End Action selection
                        }
                    }, 1000);
                }
            }
        };
        return {
            lineChart: lineChart
        };
    });
});
