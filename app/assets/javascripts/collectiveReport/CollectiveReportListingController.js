/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveReportListingController', function(collectiveReportModel, $scope) { console.log(collectiveReportModel);
         collectiveReportModel.reportList(function(response){
             $scope.reportList = response.data;
         });
        console.log("Collective reprot: ",$scope.reportList );
    });
    }());

