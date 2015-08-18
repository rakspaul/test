/**
 * Created by Sapna kotresh on 06/08/15.
 */
(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveDeleteReportController', function( $scope , $modalInstance ) {
        
        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
}());