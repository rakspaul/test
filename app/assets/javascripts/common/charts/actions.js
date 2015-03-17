/*global angObj, angular*/
(function() {
    "use strict";
    commonModule.factory("actionChart", function($timeout, loginModel, constants, analytics) {
      var kpiPrefix = function (kpiType) {
        var kpiTypeLower = kpiType.toLowerCase();
        return (kpiTypeLower == 'cpc' || kpiTypeLower == 'cpa' || kpiTypeLower == 'cpm') ? '$' : ''
      }
      var kpiSuffix = function (kpiType) {
        var kpiTypeLower = kpiType.toLowerCase();
        return (kpiTypeLower == 'vtc') ? '%' : ''
      }
      var drawMarker = function (chart, xPos, yPos, markerColor, kpiType, kpiValue, actionId, actionComment, isActionExternal, defaultGrey,activityCount,id_list) {
        
        var text, textBG, marker, container;
        var display_color = activityCount == 1 ? 'transparent' : '#000';
        var flagId = isActionExternal == true ? 'external' : 'internal';
        var display_activityCount ='';
        var applyColor ='';
        if(activityCount >1 ){  
          applyColor = 1;
        }else{
            applyColor = 0;
        }
        var place_circle_x = 7.0;
        if(activityCount.toString().length > 1){
          display_activityCount = ' '+activityCount+' '; 
        }else{
          display_activityCount = '    <span style="color:transparent">-</span>'+ activityCount+' ';
        }
        var numberOfActivityHeader = isActionExternal == true ? '<b>'+activityCount+'</b> External Activities' : '<b>'+activityCount +'</b> Internal Activities';
        marker = chart.renderer.text(display_activityCount,xPos-7 ,yPos+2).attr({
          id: 't'+actionId || 'NA',
          removeX:16,
          flagId:flagId,
          zIndex: 9,
          applyColor:applyColor
        }).css({
          fontSize: '12px',
          textAlign: 'center',
          leftMargin:'20px',
          rightMargin:'40px',
          position:'absolute',
          padding:5,
          fontFamily: 'Avenir',
          fontWeight:'600',
          color:display_color,
          cursor: 'pointer'
        }).on('click', function (markerObj) {
          $('#'+actionId).click();
        }).on('mouseover', function (e) {
          //$('#'+actionId).trigger('mouseover',this);
        }).on('mouseout', function (e) {
          //$('#'+actionId).trigger('mouseout',this);
        }).add(),
        container = marker.getBBox();
        //$( "text[id='"+txtBoxId+"']" ).val( "news here!" );
        
        chart.renderer.circle(container.x+place_circle_x , container.y+8,10).attr({
          fill: '#fff',
          stroke: (defaultGrey == false|| isActionExternal==false ) ? '#777':'#0072bc',
          'stroke-width': 2.5,
          id: actionId || 'NA',
          kpiType: kpiType || 'NA',
          kpiValue: kpiValue || 'NA',
          comment: actionComment || 'NA',
          id_list:id_list,
          activityCount:activityCount,
          zIndex: 4
        })
          //full customisation for flags/markers
          /*chart.renderer.circle(xPos, yPos, 7).attr({
           fill: '#ffffff',
           stroke: (defaultGrey) ? 'grey' : '#0072bc' || 'grey',
           'stroke-width': 4,
           id: actionId || 'NA',
           kpiType: kpiType || 'NA',
           kpiValue: kpiValue || 'NA',
           comment: actionComment || 'NA',
           zIndex: 3
           })*/.css({
            cursor: 'pointer'
          }).on('mouseover', function (event) {
            chart.tooltip.hide();
            var x = event.offsetX;
            var y = event.offsetY;
            var correctionX = 0;
            var symbol = '', suffix = '';
            if ((chart.plotWidth - x) < 0) {
              //check if left side
              correctionX = (chart.plotWidth - x) * 2 - 10;
            }
            symbol = kpiPrefix(kpiType);
            suffix = kpiSuffix(kpiType);
            var html_comment= (this.getAttribute('comment')).toString();
            html_comment = html_comment.replace(/(?:\\r\\n|\r|\\n| \\n)/g, '<br />');
            if(activityCount > 1){
              $('.highcharts-tooltip').hide();
              html_comment = numberOfActivityHeader;        
            }
            text = chart.renderer.text(this.getAttribute('kpiType') + ": <b>" + symbol + this.getAttribute('kpiValue') + suffix + "</b><br>" + html_comment  , x + 10 + correctionX, y + 10 * 2)
              .attr({
                zIndex: 16
              }).css({
                fillColor: '#fff',
                color: '#000'
              }).add();
            var box = text.getBBox();
            textBG = chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
              .attr({
                fill: '#ffffff',
                stroke: '#0072bc' || 'grey',
                'stroke-width': 1,
                zIndex: 15
              }).add();
          }).on('mouseout', function (event) {
            text.destroy();
            textBG.destroy();
            $('.highcharts-tooltip').show();
          }).on('click', function (circleObj) {
            var myContainer = $('#action-container:first');
            var getIdList = this.getAttribute('id_list');
            var splitIdList =  getIdList.split(",");
            /* New Code */
            $('circle').attr({ fill:'#ffffff'});
            //check and select multiple activity id
            if(splitIdList.length > 1 ){
              for(var i=0;i < splitIdList.length;i++){
                var targetId =splitIdList[i];
                $('circle#' + targetId).attr({ fill:(  isActionExternal==false ) ? '#777':'#0072bc'});
              }   
            }else{
                $('circle#' + circleObj.target.id).attr({ fill:(  isActionExternal==false ) ? '#777':'#0072bc'});
            }
            $("text[applyColor=1]").css({fill:'#000'});
            var getactivityCount = this.getAttribute('activityCount');
            if(getactivityCount > 1){
              $('text#t' + circleObj.target.id).css({fill:'#fff'});
            }
            //End 
            if(defaultGrey) {

              //$('circle').attr({stroke: '#0070CE', fill:'#ffffff'});
             // $('circle#' + circleObj.target.id).attr({stroke: '#0070CE', fill:'#0070CE'});  
              myContainer = $('.reports_section_details_container');
              //highlight activity in reports page
              var scrollTo = $('#actionItem_' + this.id);
              localStorage.setItem('actionSel' , this.id);
              if(scrollTo.length) {
                scrollTo.siblings().removeClass('action_selected').end().addClass('action_selected');
                //Mulitple Activity List
                if(splitIdList.length > 1 ){
                   for(var i=0;i < splitIdList.length;i++){
                      var targetId =splitIdList[i];
                       myContainer.find('#actionItem_'+targetId).addClass('action_selected');
                       myContainer.animate({
                        scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                      });
                 }
                }else{
                  //Day wise single Activity 
                   myContainer.find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+this.id).addClass('action_selected');
                   myContainer.animate({
                  scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                });

                }
                analytics.track(loginModel.getUserRole(), constants.GA_OPTIMIZATION_TAB, 'optimization_graph_activity_marker_click', loginModel.getLoginName());
              }
            } else {
              //click to scroll and highlight activity 
              var scrollTo = $('#actionItem_' + this.id);
              localStorage.setItem('actionSel' , this.id);
              if(scrollTo.length) {
                scrollTo.siblings().removeClass('active').end().addClass('active');
                if(splitIdList.length > 1 ){
                  myContainer.find('.active').removeClass('active').end();
                  for(var i=0;i < splitIdList.length;i++){
                    var targetId =splitIdList[i];
                     myContainer.find('#actionItem_'+targetId).addClass('active');
                    myContainer.animate({
                      scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });     
                  }   
                }else{
                    myContainer.find('.active').removeClass('active').end().find('#actionItem_'+this.id).addClass('active');
                    myContainer.animate({
                      scrollTop: scrollTo.offset().top - myContainer.offset().top + myContainer.scrollTop()
                    });
                }
                analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'campaign_performance_graph_activity_click', loginModel.getLoginName());
              }
            }

          }).add();
      };
      var lineChart = function(lineData, threshold, kpiType, actionItems, width, height, defaultGrey, actionId, external, navigationFromReports) {
        var data = [];
        var dataArr = [];
        var kpiType = kpiType!='null' ? kpiType:'NA';
        for (var i = 0; i < lineData.length; i++) {
          var chartData = lineData[i]['date'].split("-");
          dataArr.push(lineData[i]['y']);
          data.push([
            Date.UTC(parseInt(chartData[0]), parseInt(chartData[1], 10) - 1 , parseInt(chartData[2])),
            lineData[i]['y']
          ]);
        }
       /* var findAndPlaceTwoDecimal = function(v){
          var str= v.toString();
          var extractWithDot = str.split('.');
          if(extractWithDot.length > 1){
             return v.toFixed(2);
          }else{
             return v;
          }
        }*/
        var dataLength = data.length;
        var timeInterval = dataLength/7;
        var minVal = Math.min.apply(Math,dataArr);
        var maxVal = Math.max.apply(Math,dataArr);
        var range = parseFloat(parseFloat(maxVal) - parseFloat(minVal));
        var percentage = ((parseFloat(maxVal) - parseFloat(minVal))/100)*15;
        var chartMinimum = parseFloat(parseFloat(minVal) - parseFloat(percentage));
        var chartMaximum = parseFloat(parseFloat(maxVal) + parseFloat(percentage));
        return {
          options: {
            chart: {
              width: width ? width: 400,
              height: height ? height : 330,
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
            xAxis: [{
              type: 'datetime',
              maxPadding:0,
              minPadding:0,
              tickWidth: 0,
              labels: {
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
              }],
            yAxis: {
              maxPadding:0,
              minPadding:0,
             max:chartMaximum,
             /*min:chartMinimum*/
              title: {
                align: 'high',
                offset: 13,
                text: kpiType,
                rotation: 0,
                y: -5
              },
              gridLineWidth: 0,
              minorGridLineWidth: 0,
              lineWidth: 1,
              tickWidth: 0,
              labels: {
                formatter: function() {
                  return kpiPrefix(kpiType) + this.value + kpiSuffix(kpiType);
                }
              },
              plotBands: [{ // Light air
                color: '#fbdbd1',
                label: {
                  enabled: false,
                  text: '',
                  style: {
                    color: 'red'
                  }
                }
              }],
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
              }/*,
               {
               dashStyle: 'dash'
               }*/],
              enabled: true,
              formatter: function() {
                var symbol = kpiPrefix(kpiType),
                  suffix = kpiSuffix(kpiType);
                if (typeof(this.point.options.note) === 'undefined') {
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
            color: "#00bff0" /*#6fd0f4"*/
          }],
          loading: false,
          func: function(chart) {
            $timeout(function() {
              var counter = 0, flag = [], position = 0, showExternal;

              //override for redzone test
              //kpiType = "clicks";
              //threshold = 100;

              //red zone calculations
              if(chart != 'undefined') {
                // console.log(chart);
                // console.log(chart.xAxis);
                var extremesX = ( chart.xAxis !== undefined && chart.xAxis.length >0)?chart.xAxis[0].getExtremes() : {};
                  if(chart.xAxis !== undefined && chart.xAxis.length >0 ){
                      chart.xAxis[1].setExtremes(extremesX.min - 0.5, extremesX.max + 0.5);
                  }
                var extremes = ( chart.yAxis !== undefined && chart.yAxis.length >0)? chart.yAxis[0].getExtremes() : {};

                if (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') {
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
                extremes =  ( chart.yAxis !== undefined && chart.yAxis.length >0)? chart.yAxis[0].getExtremes(): {};
                chart.yAxis[0].addPlotBand({ // Light air
                  from: threshold,
                  to: (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') ? extremes.max : extremes.min,
                  color: '#fbdbd1',
                  label: {
                    enabled: false,
                    text: '',
                    style: {
                      color: 'red'
                    }
                  }
                });
               //draw plotlines
                chart.yAxis[0].addPlotLine({
                    value: extremes.max,
                    color: '#D2DEE7',
                    width: 1,
                    id: 'plot-line-1'
                });
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
                    color: '#FABD82',
                    width: 1,
                    id: 'plot-line-1'
                });

                //rendering threshold marker image in y-axis
                var renderPos;
                if (threshold <= chart.yAxis[0].max && threshold >= chart.yAxis[0].min) {
                  chart.renderer.image(assets.target_marker, 0, (chart.yAxis[0].toPixels(threshold) - chart.plotTop / 2) + 5.7, 17, 17).add();
                }

                //rendering action markers after red zone manipulation
                if (external != undefined && external == true) {
                  //filter applied
                  showExternal = true;
                }
                var countActivityItem = new Array();
                var findPlacedActivity = new Array();
                var eFlag =0;;
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
                          eFlag = actionItems[j].make_external;
                           if (countActivityItem[actionUTC] == undefined  ){
                              countActivityItem[actionUTC] =[];
                              countActivityItem[actionUTC]['externalIDS'] =[];
                              countActivityItem[actionUTC]['internalIDS'] =[];
                              countActivityItem[actionUTC]['external'] = 0
                              countActivityItem[actionUTC]['internal'] = 0;
                              
                          }
                            if(eFlag == true){
                                if( countActivityItem[actionUTC]['external'] != undefined ){
                                    countActivityItem[actionUTC]['external']++;
                                    var arrayVar = "externalIDS";
                                  }else{
                                    //countActivityItem[actionUTC]['external']++;
                                    }
                            }else{
                                var arrayVar = "internalIDS";
                                if( countActivityItem[actionUTC]['internal'] != undefined ){
                                    countActivityItem[actionUTC]['internal']++;
                                  }else{
                                    //countActivityItem[actionUTC]['internal']++;
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
                if (actionItems) {
                  for (i = chart.series[0].data.length - 1; i >= 0; i--) {
                    position = 0;
                    for (var j = actionItems.length - 1; j >= 0; j--) {
                      var dateUTC = new Date(actionItems[j].created_at);
                      //console.log(dateUTC);
                      //example. actionItems[1].created_at  1396396800000 converted to UTC 1413459349308;
                      var actionUTC = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
                      if (chart.series[0].data[i].x == actionUTC) {
                        if (flag[actionUTC] === undefined) {
                          flag[actionUTC] = 1;
                        }
                        if ((showExternal && actionItems[j].make_external == true) || (showExternal === undefined)) {
                           var checkFlag = actionItems[j].make_external == true ? 'external':'internal';
                           var arrayVar = actionItems[j].make_external == true ? 'externalIDS':'internalIDS';
                           activityCount = countActivityItem[actionUTC][checkFlag];
                           var id_list = countActivityItem[actionUTC][arrayVar];  
                          if(activityCount == 1){
                            drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, chart.series[0].data[i].y, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment, actionItems[j].make_external, defaultGrey,activityCount,id_list);
                            counter++;
                             position += 10; //correction for multiple markers in the same place
                          }else{
                               if (findPlacedActivity[actionUTC] == undefined  ){
                                findPlacedActivity[actionUTC] =[];
                                findPlacedActivity[actionUTC]['external'] = 0
                                findPlacedActivity[actionUTC]['internal'] = 0;
                          }
                           //Multiple Item in single chart
                            if( findPlacedActivity[actionUTC][checkFlag] != 'completed' ){
                                findPlacedActivity[actionUTC][checkFlag] = 'completed';
                                drawMarker(chart, chart.series[0].data[i].plotX + chart.plotLeft, chart.series[0].data[i].plotY + chart.plotTop + position, actionItems[j].action_color, kpiType, chart.series[0].data[i].y, actionItems[j].ad_id + '' + actionItems[j].id, actionItems[j].comment, actionItems[j].make_external, defaultGrey,activityCount,id_list);
                                counter++;
                                position += 20;
                            }
                          } 
                        }
                      }
                    }
                  }
                }
                if(navigationFromReports == false && actionId !== undefined){
                  $('circle#' + actionId).attr({stroke: '#0070CE', fill: '#0070CE'});
                  $('#action-container:first').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+actionId).addClass('action_selected');
                  $('.reports_section_details_container').find('.action_selected').removeClass('action_selected').end().find('#actionItem_'+actionId).addClass('action_selected');
                }
              }

            }, 1000);
          }
        }
      };
      return {
        lineChart: lineChart
      };
    });
}());
