define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.controller('CollectiveDeleteReportController', function( $scope , $modalInstance,headerMsg,mainMsg,
                                                                        deleteAction) {
        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.deleteAction = deleteAction;

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
});
