define(['angularAMD', 'url-service'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('ReportsInvoiceAddAdjustmentController', ['$scope', '$rootScope', '$modalInstance',
            'dataService', 'urlService', 'constants', 'loginModel', 'advertiserModel', 'vistoconfig',
            function ($scope, $rootScope, $modalInstance, dataService, urlService, constants, loginModel, advertiserModel, vistoconfig) {
            var _currCtrl = this;

            _currCtrl.clientId = vistoconfig.getSelectedAccountId();

            _currCtrl.clear = function () {
                $scope.addAdjustmentData.adjustments = [];
            };

            // Validation of the user input
            _currCtrl.verifyInputs = function () {
                var ret = false;

                $scope.errSaveAdjustment = false;

                _.each($scope.addAdjustmentData.adjustments, function (item) {
                    if (!ret && (!item.amount || !item.name || !item.transactionType)) {
                        ret = true;
                        $scope.errSaveAdjustment = true;
                        $scope.errSaveAdjustmentMsg = constants.INVOICE_ADJUSTMENT_FIELD_EMPTY;
                    }
                });

                return ret;
            };

            // Scope variable initialization
            $scope.textConstant = constants;
            $scope.errSaveAdjustment = false;
            $scope.clientName = vistoconfig.getMasterClientId();

            $scope.advertiserName = advertiserModel.hasOwnProperty(advertiserModel)?
                advertiserModel.getAdvertiser().selectedAdvertiser.name : 'All Advertiser';

            // Enable the credit or debit button base on the API feed
            $scope.enableCrORDrBtn = function () {
                _.each($scope.addAdjustmentData.adjustments, function (item, i) {
                    $('.adjustmentCnt').children().eq(i).find('.' + item.transactionType).addClass('btn-primary');
                });
            };

            setTimeout(function () {
                $scope.enableCrORDrBtn();
            }, 25);

            // Enable the credit or debit button based on user interaction
            $scope.enableBtn = function (enable, disable, ev, index) {
                var tar = $(ev.target);

                if (!tar.hasClass('btn-primary')) {
                    tar.addClass('btn-primary');
                    tar.siblings('.'+disable).removeClass('btn-primary');
                    $scope.addAdjustmentData.adjustments[index].transactionType = enable;
                    $scope.errSaveAdjustment = false;
                }
            };

            // Add the credit or debit to the adjustment based on user input
            $scope.addAdjustment = function () {
                var adjustmentCnt = $('.adjustmentCnt');

                $scope.errSaveAdjustment = false;
                adjustmentCnt.scrollTop(adjustmentCnt[0].scrollHeight);

                // Inserting one more empty row for the add adjustment input field.
                $scope.addAdjustmentData.adjustments.push({});
            };

            // Remove the credit or debit from the adjustment based on user interaction
            $scope.removeAdjustment = function (index) {
                $scope.errSaveAdjustment = false;
                $scope.addAdjustmentData.adjustments =
                    _.filter($scope.addAdjustmentData.adjustments, function (item, i) {
                       return index !== i;
                    });
            };

            // Close the Adjustment popUp
            $scope.close = function () {
                $scope.errSaveAdjustment = false;
                _currCtrl.clear();
                $modalInstance.dismiss();
            };

            // On keyup from the input field, the hiding the error message
            $scope.adjustmentInputKeyUp = function () {
                $scope.errSaveAdjustment = false;
            };

            // Save the Adjustment Data
            $scope.saveAdjustment = function () {
                var data = {
                    adjustments: angular.copy($scope.addAdjustmentData.adjustments)
                };

                if (_currCtrl.verifyInputs()) {
                    return true;
                }

                dataService
                    .post(
                        urlService.saveInvoiceListCredits(_currCtrl.clientId, $scope.addAdjustmentData.invoiceId),
                        data,
                        {'Content-Type': 'application/json'}
                    )
                    .then(function (result) {
                        $scope.close();

                        if (result.status === 'OK' || result.status === 'success') {
                            $rootScope.$broadcast('adjustmentAdded');
                            $rootScope.setErrAlertMessage(constants.CREDIT_ADD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.CREDIT_ADD_ERR);
                        }
                    }, function () {
                        $scope.close();
                        $rootScope.setErrAlertMessage(constants.CREDIT_ADD_ERR);
                    });
            };
        }]);
    }
);
