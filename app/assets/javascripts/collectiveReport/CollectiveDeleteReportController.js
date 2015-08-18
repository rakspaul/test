(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveDeleteReportController', function( $scope , $modalInstance ) {
        
        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
}());