define(['angularAMD',
    'common/services/data_service', 'common/services/url_service', 'common/services/constants_service'],function (angularAMD) {
    'use strict';

    angularAMD.controller('ReportsInvoiceAddCreditController', function ($scope, $rootScope, $modalInstance,
    dataService, urlService, constants
        ) {
        $scope.addCreditData.credits = [];
        $scope.errSaveCredit = false;
        var _currCtrl = this;
        _currCtrl.clear = function(){
            $scope.addCreditData.credits = [];
        }
        $scope.addCredit = function(){
            $scope.errSaveCredit = false;
            $('.creditsCnt').scrollTop($(".creditsCnt")[0].scrollHeight);
            $scope.addCreditData.credits.push({});                        // Inserting one more empty row for the add credit input field.
        }
        $scope.removeCredit = function(index){
            $scope.errSaveCredit = false;
            $scope.addCreditData.credits = _.filter($scope.addCreditData.credits, function(item, i){
               return index != i;
            });
        }
        $scope.close = function(){
            $scope.errSaveCredit = false;
            _currCtrl.clear();
            $modalInstance.dismiss();
        }
        $scope.getInvoiceInfo = function() {
            $scope.addCreditData.credits = [];
            _.each($scope.addCreditData.invoice.creditsList, function (item) {
                $scope.addCreditData.credits.push(item);
            });
        }
        $scope.getInvoiceInfo();
        _currCtrl.verifyInputs = function(){
            var ret = false,
                err = "";
            $scope.errSaveCredit = false;
            _.each($scope.addCreditData.credits, function(item){
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
            var data = {"credits": angular.copy($scope.addCreditData.credits)};
            dataService
                .post(urlService.saveInvoiceListCredits($scope.addCreditData.invoice.invoiceId), data, {'Content-Type': 'application/json'})
                .then(function (result) {
                    $scope.close();
                    if(result.status == "OK" || result.status == "success"){
                        $rootScope.setErrAlertMessage(constants.CREDIT_ADD_SUCCESS, 0);
                        $scope.getInvoiceData();
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