
(function() {
    "use strict";
    commonModule.factory("pieChart", function($timeout) {

        var pieChart = function(graphData) {
            var data = [], colors;
            for(var i in graphData)
            {
              if(graphData[i].name !='Other'){
                data.push({'y':graphData[i].value,'color':graphData[i].colorCode});
              }
               
            }
            for(var othr in graphData)
            {
              if(graphData[othr].name =='Other'){
                data.push({'y':graphData[othr].value,'color':graphData[othr].colorCode});
              }
               
            }
            return {
                options: {
                  chart: {
                      renderTo: 'container',
                      width:100,
                      height:100,
                      type: 'pie',
                      margin: [3, 0, 0, 0],
                      spacingTop: 0,
                      spacingBottom: 0,
                      spacingLeft: 0,
                      spacingRight: 0
                  },
                  title: {
                      text: ''
                  },
                  yAxis: {
                      title: {
                          text: ''
                      }
                  },
                  plotOptions: {
                      pie: {
                          shadow: false
                      },
                      series: {
                          states: {
                              hover: {
                                  enabled: false
                              }
                          }
                      }
                  },
                  tooltip: {
                      enabled:false,
                      formatter: function() {
                          return '<b>'+ this.point.name +'</b>: '+ this.y +' %';
                      }
                  },
                  legend:{
                      enabled: false
                  },
                  credits:{
                      enabled:false
                  }
              },
              series: [{
                  data: data,
                  size: 95,
                  innerSize: '78%',
                  center: [32,30],
                  showInLegend:false,
                  dataLabels: {
                      enabled: false
                  }
              }],
              loading: false,
              func: function(chart) {
                  $timeout(function() {
                      
                  }, 1000);
              }

            };
        };
        return {
            highChart: pieChart
        };
    });
}());