define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CollectiveDeleteReportController', ['$scope', '$modalInstance', 'headerMsg', 'mainMsg', 'deleteAction',
        function( $scope , $modalInstance,headerMsg,mainMsg, deleteAction) {

        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.deleteAction = deleteAction;

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    }]);
});
