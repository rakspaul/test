define(['angularAMD', 'common-utils'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('columnline', ['$timeout', '$locale', 'utils', 'constants', function ($timeout, $locale, utils, constants) {
            var  getRepString = function (x) {
                    var y = Math.abs(x);

                    if (y < 9999) {
                        return x;
                    }

                    if (y < 1000000) {
                        return Math.round(x / 1000) + 'K';
                    }

                    if ( y < 10000000) {
                        return (x / 1000000).toFixed(2) + 'M';
                    }

                    if (y < 1000000000) {
                        return Math.round((x / 1000000)) + 'M';
                    }

                    if (y < 1000000000000) {
                        return Math.round((x / 1000000000)) + 'B';
                    }

                    return '1T+';
                },

                columnChart = function (chartData, kpIType) {

                    var xData = [],
                        impLine = [],
                        kpiColumn = [],
                        i,
                        kpi_value,
                        kpilongText = ['Post Click CPA', 'Suspicious Activity %', 'Viewable Impressions', 'Viewable' +
                        ' Rate'],
                        xPos =  (kpilongText.indexOf(kpIType) !== -1) ? 95 : -8;

                    kpIType = kpIType.toLowerCase();

                    for (i = 0; i < chartData.length; i++) {
                        kpi_value = 0;

                        if (kpIType === 'vtc') {
                            kpi_value=chartData[i].vtc_100;
                        } else {
                            kpi_value=chartData[i][kpIType];
                        }

                        if (kpi_value === null) {
                            kpi_value = 0.0;
                        }

                        if (kpIType === 'ctr' || kpIType === 'action_rate' || kpIType === 'action rate'){
                            kpi_value = (kpi_value) && parseFloat(kpi_value.toFixed(4));
                        }

                        if (kpIType === 'cpm' || kpIType === 'cpc' || kpIType === 'vtc'){
                            kpi_value = parseFloat(kpi_value.toFixed(2));
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

                                // [marginTop, marginRight, marginBottom and marginLeft]
                                margin: [20, 80, 30, 85]
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

                                formatter: function () {
                                    var yVal,
                                        return_val;

                                    if (this.key) {
                                        yVal = this.y;
                                        return_val = {};

                                        if (this.series.name !== 'Series 1'){
                                            yVal = Highcharts.numberFormat(Math.round(this.y), 0); // jshint ignore:line
                                            return_val =  this.key.y +' : ' + yVal;
                                        } else {
                                            // here I have used Math.floor , not toFixed(n) because we dont wanted to
                                            // show rounded off values in tooltip, we just wanted to show
                                            // values till decimal 4 places.
                                            return_val = ((kpIType === 'ctr' ||
                                                kpIType === 'action_rate' ||
                                                kpIType === 'vtc')) ?
                                                (this.key.y +' : ' + yVal + constants.SYMBOL_PERCENT) :
                                                (this.key.y +' : ' + $locale.NUMBER_FORMATS.CURRENCY_SYM  + yVal);
                                        }

                                        return '<div id="inventory_tooltip"" class="inventory-tool-tip">' +
                                            return_val + '</div>';
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
                                        color : '#21252B',
                                        fontWeight:'bold'
                                    },

                                    y : 18,

                                    formatter: function () {
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

                            yAxis: [
                                // Primary yAxis
                                {
                                    labels: {
                                        enabled: true,

                                        style :{
                                            color: '#181B20'
                                        },

                                        formatter: function () {
                                            return getRepString(this.value);
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
                                },

                                // Secondary yAxis
                                {
                                    title: {
                                        align: 'high',
                                        offset: 5,
                                        text: (kpIType === 'action_rate' ? 'Action Rate' : kpIType.toUpperCase()),

                                        style: {
                                            color : '#0D6DCC'
                                        },

                                        rotation: 0,
                                        y: -10,
                                        x: xPos
                                    },

                                    labels: {
                                        enabled: true,

                                        style : {
                                            color : '#0D6DCC'
                                        },

                                        formatter: function () {
                                            var yVal = (Number(this.value) > 0 && Number(this.value) < 1) ?
                                                Highcharts.numberFormat(this.value,4) : // jshint ignore:line
                                                Highcharts.numberFormat(this.value,0); // jshint ignore:line

                                            return ((kpIType === 'ctr'||
                                                kpIType === 'action_rate' ||
                                                kpIType === 'vtc')) ?
                                                (yVal + constants.SYMBOL_PERCENT) :
                                                ($locale.NUMBER_FORMATS.CURRENCY_SYM + yVal);
                                        }
                                    },

                                    lineWidth: 1,
                                    tickWidth: 1,
                                    tickColor : '#0D6DCC',
                                    lineColor: '#0D6DCC',
                                    gridLineWidth: 0,
                                    minorGridLineWidth: 0,
                                    opposite: false,
                                    min: 0
                                }
                            ],

                            // Title configuration (optional)
                            title: {
                                text: ' '
                            }
                        },

                        // Series object (optional) - a list of series using normal highcharts series options.
                        series: [
                            {
                                name: '',
                                type: 'column',
                                yAxis: 1,
                                data: kpiColumn,

                                events: {
                                    mouseOut: function (ev) {
                                        var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');

                                        $elem.find('.inventory-tool-tip').hide();
                                        $elem.find('.highcharts-tooltip').hide();
                                    },

                                    mouseOver: function (ev) {
                                        var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');

                                        $elem.find('.inventory-tool-tip').show();
                                        $elem.find('.highcharts-tooltip').show();
                                    }
                                },

                                tooltip: {
                                    enabled: false
                                }
                            },

                            {
                                name: '',
                                type: 'line',
                                data: impLine,

                                events: {
                                    mouseOut: function (ev) {
                                        var $elem = $(ev.target.markerGroup.element).parents('.highcharts-container');

                                        $elem.find('.highcharts-tooltip').hide();
                                    },

                                    mouseOver: function (ev) {
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
                            }
                        ],

                        // Boolean to control showng loading status on chart (optional)
                        loading: false,

                        // Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
                        useHighStocks: false,

                        // size (optional) if left out the chart will default to size of the div or something sensible.
                        func: function () {}
                    };
                };

            return {
                highChart: columnChart
            };
        }]);
    }
);
