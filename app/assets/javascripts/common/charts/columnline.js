(function() {
    "use strict";
    commonModule.factory("columnline", function($timeout, $locale, utils,constants) {

        var  getRepString = function(x) {
            //if(isNaN(x)) return x;
            var y = Math.abs(x);

            if(y < 9999) {
                return x;
            }

            if(y < 1000000) {
                return Math.round(x/1000) + "K";
            }
            if( y < 10000000) {
                return (x/1000000).toFixed(2) + "M";
            }

            if(y < 1000000000) {
                return Math.round((x/1000000)) + "M";
            }

            if(y < 1000000000000) {
                return Math.round((x/1000000000)) + "B";
            }

            return "1T+";
        };
        var columnChart = function(chartData, kpIType) {

            var xData = [],
                impLine = [],
                kpiColumn = [];

            for (var i = 0; i < chartData.length; i++) {
                var kpi_value=0;
                kpIType = kpIType.toLowerCase();

                if(kpIType === 'vtc') {
                    kpi_value=chartData[i]['vtc_100'];
                } else {
                    kpi_value=chartData[i][kpIType]
                }
                if(kpIType === 'ctr' || kpIType === 'action_rate' || kpIType === 'action rate'){
                    kpi_value = parseFloat((kpi_value*100).toFixed(4));
                }
                if(kpIType === 'cpm' || kpIType === 'cpc' || kpIType === 'vtc'){
                    kpi_value = parseFloat((kpi_value*1).toFixed(2));
                }
                xData.push({custom: i, y: chartData[i].dimension });
                impLine.push(chartData[i].impressions);
                kpiColumn.push(kpi_value);
            }


            return {
                options: {
                    chart: {
                        type: 'column',
                        width: 450,
                        height: 260,
                        margin: [20, 80, 30, 85] // [marginTop, marginRight, marginBottom and marginLeft]
                    },

                    plotOptions: {
                        column: {
                            colorByPoint: true
                        }
                    },

                    colors: [
                     '#0D6DCC',
                     '#2078CB',
                     '#348DDF',
                     '#62AFF1',
                     '#79C1FD'
                    ],
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {
                        shared: false,
                        useHTML: true,
                        formatter: function() {
                            if (this.key) {
                                var yVal = this.y;
                                var return_val = {};
                                if(this.series.name !== 'Series 1'){
                                    yVal = Highcharts.numberFormat(Math.round(this.y), 0);
                                    return_val =  this.key.y +' : ' + yVal;
                                  //  return "<div style='width: 400px; white-space:normal;word-wrap: break-word;'>"+return_val+'</div>';
                                } else {
                                    // here I have used Math.floor , not toFixed(n) because we dont wanted to show rounded off values in tooltip, we just wanted to show
                                    // values till decimal 4 places.
                                   // return_val = ((kpIType === 'CTR' || kpIType === 'action_rate' || kpIType.toLowerCase() === 'action rate' || kpIType.toLowerCase() === 'vtc')) ?  (this.key.y +' : ' + yVal + '%') : (this.key.y +' : ' + constants.currencySymbol + yVal  ) ;
                                     return_val = ((kpIType === 'CTR' || kpIType.toLowerCase() === 'ctr'|| kpIType === 'action_rate' || kpIType.toLowerCase() === 'action rate'|| kpIType.toLowerCase() === 'vtc')) ? (this.key.y +' : ' + yVal + constants.SYMBOL_PERCENT) : (this.key.y +' : ' + $locale.NUMBER_FORMATS.CURRENCY_SYM  + yVal);
                                }
                                return "<div id='inventory_tooltip' class='inventory-tool-tip'>" +return_val+ "</div>";
                            } else {
                                return  '';
                            }
                        },

                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    },




                    xAxis: {
                        categories: xData,
                        lineWidth: 1,
                        minorGridLineWidth: 0,
                        gridLineWidth: 0,
                        lineColor: '#0D6DCC',
                        tickWidth: 0,
                        labels: {

                            enabled: true,
                            distance :10,
                            style :{
                                color : '#FEFFFE',
                                fontWeight:'bold'
                            },
                            y : -10,
                            formatter: function() {
                                if (this) {
                                    return parseInt(this.value.custom + 1);
                                } else {
                                    return  '';
                                }
                            }


                        },
                        title: {
                            align: 'high',
                            offset: 5,
                            text: '',
                            rotation: 0,
                            y: -5
                        }
                    },

                    yAxis: [{ // Primary yAxis
                        labels: {
                            enabled: true,
                            style :{
                                color: '#181B20'
                            },

                            formatter: function() {

                              //  if (this.value) {
                                    return getRepString(this.value);
                              /*  } else {
                                    return '';
                                }*/
                            }
                        },
                        tickWidth: 1,
                        tickColor : '#181B20',
                        lineWidth: 1,
                        gridLineWidth: 0,
                        lineColor: '#181B20',
                        minorGridLineWidth: 0,
                        opposite: true,
                        min :0,

                        title: {
                            align: 'high',
                            offset: 5,
                            style :{
                                color : '#181B20'
                            },
                            text: 'Imps',
                            rotation: 0,
                            y: -10,
                            x: 33
                        }
                    }, { // Secondary yAxis
                        title: {
                            align: 'high',
                            offset: 5,
                            text: (kpIType.toLowerCase() === 'action_rate' ? 'Action Rate' : kpIType.toUpperCase()),
                            style :{
                                color : "#0D6DCC"
                            },
                            rotation: 0,
                            y: -10,
                            x: -8
                        },
                        labels: {
                            enabled: true,
                            style : {
                                color : '#0D6DCC'
                            },
                            formatter: function() {
                               // if (!isNaN(this.value)) {
                                   // var currency =(kpIType === 'CTR')? '' : constants.currencySymbol;
                                   // var $returnLabel =  currency + Highcharts.numberFormat(this.value, 2);
                                   //   var currency = ((kpIType === 'CTR' || kpIType.toLowerCase() === 'ctr'|| kpIType === 'action_rate' || kpIType.toLowerCase() === 'action rate' || kpIType.toLowerCase() === 'vtc')) ?
                                   //  constants.SYMBOL_PERCENT : constants.SYMBOL_DOLLAR;
                                  //   var $returnLabel =  Highcharts.numberFormat(this.value, 2) + currency;
                                   //    return $returnLabel;

                                 var currency = ((kpIType === 'CTR' || kpIType.toLowerCase() === 'ctr'|| kpIType === 'action_rate' || kpIType.toLowerCase() === 'action rate'|| kpIType.toLowerCase() === 'vtc')) ? (Highcharts.numberFormat(this.value, 2) + constants.SYMBOL_PERCENT) :($locale.NUMBER_FORMATS.CURRENCY_SYM + Highcharts.numberFormat(this.value, 2));
                                 return currency;
                               /* } else {
                                    return '';
                                }*/
                            }
                        },
                        lineWidth: 1,
                        tickWidth: 1,
                        tickColor : '#0D6DCC',
                        lineColor: '#0D6DCC',
                        gridLineWidth: 0,
                        minorGridLineWidth: 0,
                        opposite: false,
                        min :0

                    }],
                    //Title configuration (optional)
                    title: {
                        text: ' '
                    }
                },
                //Series object (optional) - a list of series using normal highcharts series options.
                series: [{
                    name: '',
                    type: 'column',
                    yAxis: 1,
                    data: kpiColumn,
                    events: {
                        mouseOut: function(ev) {
                            var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');
                            $elem.find('.inventory-tool-tip').hide();
                            $elem.find('.highcharts-tooltip').hide();
                        },
                        mouseOver: function(ev) {
                            var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');
                            $elem.find('.inventory-tool-tip').show();
                            $elem.find('.highcharts-tooltip').show();
                        }
                    },
                    tooltip: {

                        enabled: false


                    }
                }, {
                    name: '',
                    type: 'line',
                    data: impLine,
                    events: {
                        mouseOut: function(ev) {
                            var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');
                            $elem.find('.highcharts-tooltip').hide();
                        },
                        mouseOver: function(ev) {
                            var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');
                            $elem.find('.highcharts-tooltip').show();
                        }
                    },
                    tooltip: {
                        enabled: false

                    },
                    color: '#181B20',
                    marker: {
                        enabled: true,
                        fillColor: '#181B20'
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }],

                //Boolean to control showng loading status on chart (optional)
                loading: false,

                //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
                useHighStocks: false,
                //size (optional) if left out the chart will default to size of the div or something sensible.

                //function (optional)
                func: function(chart) {
                    /*$timeout(function() {
                        if(utils.allValuesSame(impLine)) {
                            if(chart !== undefined && chart.xAxis !== undefined){
                                var extremesX = chart.yAxis[0].getExtremes();
                                chart.yAxis[0].setExtremes(0, extremesX.max * 2);
                            }
                        }
                    }, 1000);*/
                }

            };

        };
        return {
            highChart: columnChart
        };
    });
}());
