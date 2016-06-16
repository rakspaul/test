define(['angularAMD',
    'common/services/data_service', 'common/services/url_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddAdjustmentController', function ($scope, $rootScope, $modalInstance,
    dataService, urlService, constants
        ) {
        console.log("ReportsInvoiceAddAdjustmentController....***");
        $scope.errSaveCredit = false;
        var _currCtrl = this;
        _currCtrl.clear = function(){
            $scope.addAdjustmentData.adjustments = [];
        }
        $scope.enableCrORDrBtn = function(){
            console.log("enableCrORDrBtn.....",$scope.addAdjustmentData.adjustments);
            _.each($scope.addAdjustmentData.adjustments, function(item, i){
                console.log("item.transactionType......"+item.transactionType+"......."+i);
                $(".adjustmentCnt").children().eq(i).find("."+item.transactionType).addClass("btn-primary");
            });
        }
        setTimeout(function(){
            $scope.enableCrORDrBtn();
        },25);
        $scope.enableBtn = function(enable, disable, ev, index){
            var tar = $(ev.target);
            if(!tar.hasClass("btn-primary")){
                tar.addClass("btn-primary");
                tar.siblings("."+disable).removeClass("btn-primary");
                $scope.addAdjustmentData.adjustments[index].transactionType = enable
            }
        }
        $scope.addCredit = function(){
            $scope.errSaveCredit = false;
            $('.adjustmentCnt').scrollTop($(".adjustmentCnt")[0].scrollHeight);
            $scope.addAdjustmentData.adjustments.push({});                        // Inserting one more empty row for the add credit input field.
        }
        $scope.removeCredit = function(index){
            $scope.errSaveCredit = false;
            $scope.addAdjustmentData.adjustments = _.filter($scope.addAdjustmentData.adjustments, function(item, i){
               return index != i;
            });
        }
        $scope.close = function(){
            $scope.errSaveCredit = false;
            _currCtrl.clear();
            $modalInstance.dismiss();
        }
        _currCtrl.verifyInputs = function(){
            var ret = false,
                err = "";
            $scope.errSaveCredit = false;
            _.each($scope.addAdjustmentData.adjustments, function(item){
                if(!ret && (!item.amount || !item.name)){
                    ret = true;
                    $scope.errSaveCredit = true;
                    $scope.errSaveCreditMsg = constants.INVOICE_CREDIT_FIELD_EMPTY;
                }
            });
            return ret;
        }
        $scope.creditInputKeyUp = function(){
            $scope.errSaveCredit = false;
        }
        $scope.saveCredit = function(){
            if(_currCtrl.verifyInputs()) return true;
            var data = {"adjustments": angular.copy($scope.addAdjustmentData.adjustments)};
            dataService
                .post(urlService.saveInvoiceListCredits($scope.addAdjustmentData.invoiceId), data, {'Content-Type': 'application/json'})
                .then(function (result) {
                    $scope.close();
                    if(result.status == "OK" || result.status == "success"){
                   //     $scope.getInvoiceData();
                   //     $scope.getInvoiceDetials();
                        $rootScope.$broadcast("adjustmentAdded")
                        $rootScope.setErrAlertMessage(constants.CREDIT_ADD_SUCCESS, 0);
                    }else{
                        $rootScope.setErrAlertMessage(constants.CREDIT_ADD_ERR);
                    }
                },function(err){
                    $scope.close();
                    $rootScope.setErrAlertMessage(constants.CREDIT_ADD_ERR);
                });
        }


    });
});