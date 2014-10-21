var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('OptimizationController', function ($scope, dataService, utils,$http) {

      $scope.setParamsAndLoad =function (orderId,action,strategyByActionId) {
         $scope.clickedStrategy = strategyByActionId[action.id];
        utils.goToLocation('/campaigns/' + orderId + '/optimization');

        /*console.log("clicked values: "+orderId);
        console.log(action);
        console.log(strategiesById[action.id]);*/

      }

       $scope.orderByField = 'created_at' ;
       $scope.reverseSort = true;
        $scope.sorting = function(orderBy, sortingOrder){
            $scope.orderByField = orderBy ;
            $scope.reverseSort = !$scope.reverseSort ;

        }


        $scope.colorCoding = function(val1, val2, matricImpacted){
            if(val1 == val2)
             return "";
           else if(matricImpacted === "CPC" || matricImpacted === "CPA" || matricImpacted ==="CPM")
               return ((val1 - val2)>0) ?  'negative_td' : 'positive_td' ;

           else
            return ((val1 - val2)>0 ) ?  'positive_td' : 'negative_td' ;

        };

        $scope.formatMetric = function(val1, metricImpacted){
            if(metricImpacted === "CPC" || metricImpacted === "CPA" || metricImpacted ==="CPM")
                return '$'+val1;
            else if (metricImpacted === "Delivery (Impressions)")
                return val1.toLocaleString();

            else
                return val1 ;
        };

      /*dataService.getCdbChartData(405787, 'lifetime', 'strategies', 11344).then(function (result) {
        var lineData = [];
        if(result.status == "success" && !angular.isString(result.data)) {
          if(!angular.isUndefined($scope.campaign.kpiType)) {
            if(result.data.data.measures_by_days.length > 0) {
              var maxDays = result.data.data.measures_by_days;
              for (var i = 0; i < maxDays.length; i++) {
                var kpiType = ($scope.campaign.kpiType),
                  kpiTypeLower = angular.lowercase(kpiType);
                lineData.push({ 'x': i + 1, 'y': utils.roundOff(maxDays[i][kpiTypeLower], 2), 'date': maxDays[i]['date'] });
              }
//              $scope.details.actionChartForStrategy = actionChart.lineChart(lineData, parseFloat($scope.campaign.kpiValue), $scope.campaign.kpiType, $scope.actionItems);
            }
          }
        }
      });*/



    });
}());
