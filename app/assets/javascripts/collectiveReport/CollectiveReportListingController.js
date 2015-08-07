/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope) { console.log(collectiveReportModel);
         collectiveReportModel.reportList(function(response){
           if(response.data !== undefined && response.data.length > 0) {
             $scope.reportList = response.data;
           } else {
             $scope.nodata = true;
           }

         })
        //console.log("Collective report: ",$scope.reportList );
    });
    }());
