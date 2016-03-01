define(['angularAMD'
],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportScheduleDeleteController', function( $scope , $modalInstance,headerMsg,mainMsg,deleteAction) {

        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.deleteAction = deleteAction;

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
});