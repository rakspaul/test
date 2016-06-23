define(['angularAMD',
    'common/services/data_service', 'common/services/url_service', 'common/services/constants_service',
    'login/login_model', 'reporting/advertiser/advertiser_model'],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddAdjustmentController', function ($scope, $rootScope, $modalInstance,
    dataService, urlService, constants,
    loginModel, advertiserModel
        ) {

        var _currCtrl = this;
        _currCtrl.clear = function(){
            $scope.addAdjustmentData.adjustments = [];
        }

        // Scope variable initialization
        $scope.textConstant = constants;
        $scope.errSaveAdjustment = false;
        $scope.clientName = loginModel.getSelectedClient().name;
        $scope.advertiserName = advertiserModel.getAdvertiser().selectedAdvertiser ? advertiserModel.getAdvertiser().selectedAdvertiser.name : "All Advertiser"

        // Enable the credit or debit button base on the API feed
        $scope.enableCrORDrBtn = function(){
            _.each($scope.addAdjustmentData.adjustments, function(item, i){
                $(".adjustmentCnt").children().eq(i).find("."+item.transactionType).addClass("btn-primary");
            });
        }
        setTimeout(function(){
            $scope.enableCrORDrBtn();
        },25);

        //Enable the credit or debit button based on user interaction
        $scope.enableBtn = function(enable, disable, ev, index){
            var tar = $(ev.target);
            if(!tar.hasClass("btn-primary")){
                tar.addClass("btn-primary");
                tar.siblings("."+disable).removeClass("btn-primary");
                $scope.addAdjustmentData.adjustments[index].transactionType = enable;
                $scope.errSaveAdjustment = false;
            }
        }

        // Add the credit or debit to the adjustment based on user input
        $scope.addAdjustment = function(){
            $scope.errSaveAdjustment = false;
            $('.adjustmentCnt').scrollTop($(".adjustmentCnt")[0].scrollHeight);
            $scope.addAdjustmentData.adjustments.push({});                        // Inserting one more empty row for the add adjustment input field.
        }

        // Remove the credit or debit from the adjustment based on user interaction
        $scope.removeAdjustment = function(index){
            $scope.errSaveAdjustment = false;
            $scope.addAdjustmentData.adjustments = _.filter($scope.addAdjustmentData.adjustments, function(item, i){
               return index != i;
            });
        }

        //Close the Adjustment popUp
        $scope.close = function(){
            $scope.errSaveAdjustment = false;
            _currCtrl.clear();
            $modalInstance.dismiss();
        }

        //Validation of the user input
        _currCtrl.verifyInputs = function(){
            var ret = false,
                err = "";
            $scope.errSaveAdjustment = false;
            _.each($scope.addAdjustmentData.adjustments, function(item){
                if(!ret && (!item.amount || !item.name || !item.transactionType)){
                    ret = true;
                    $scope.errSaveAdjustment = true;
                    $scope.errSaveAdjustmentMsg = constants.INVOICE_ADJUSTMENT_FIELD_EMPTY;
                }
            });
            return ret;
        }

        // On keyup from the input field, the hiding the error message
        $scope.adjustmentInputKeyUp = function(){
            $scope.errSaveAdjustment = false;
        }

        //Save the Adjustment Data
        $scope.saveAdjustment = function(){
            if(_currCtrl.verifyInputs()) return true;
            var data = {"adjustments": angular.copy($scope.addAdjustmentData.adjustments)};
            dataService
                .post(urlService.saveInvoiceListCredits($scope.addAdjustmentData.invoiceId), data, {'Content-Type': 'application/json'})
                .then(function (result) {
                    $scope.close();
                    if(result.status == "OK" || result.status == "success"){
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