(function() {
    'use strict';

    collectiveReportModule.controller('CollectiveDeleteReportController', function( $scope , $modalInstance,headerMsg,mainMsg,deleteAction) {

        $scope.headerMsg = headerMsg;
        $scope.mainMsg =  mainMsg;
        $scope.deleteAction = deleteAction;
        console.log('collective delete rept ctrl: ',$scope.flashMessage.message);
        console.log($scope.deleteAction);

       // console.log("In delete controller",deleteAction);

        $scope.close=function(){
            $modalInstance.dismiss();
        };
    });
}());