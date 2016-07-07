define(['angularAMD', 'common/services/data_service', 'common/services/url_service', // jshint ignore:line
    'common/services/constants_service', 'login/login_model', 'reporting/advertiser/advertiser_model'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('invoiceUploadSOR', function ($scope, $rootScope, $modalInstance, dataService, urlService,
                                                            constants, loginModel, advertiserModel, Upload) {
            $scope.textConstants = constants;
            $scope.clientName = loginModel.getSelectedClient().name;

            $scope.advertiserName = advertiserModel.getAdvertiser().selectedAdvertiser ?
                advertiserModel.getAdvertiser().selectedAdvertiser.name :
                'All Advertiser';

            $scope.close = function () {
                $modalInstance.dismiss();
            };

            $scope.uploadFile = function () {
                var id = $scope.invoiceData.invoiceId ? $scope.invoiceData.invoiceId : $scope.invoiceData.id;

                Upload
                    .upload({
                        url: urlService.uploadInvoiceData(id),
                        fileFormDataName: 'uploadFile',
                        file: $scope.invoiceData.uploadFile
                    })
                    .then(function (res) {
                        res = res.data;

                        if (res.status === 'OK' || res.status === 'success') {
                            $scope.close();
                            $rootScope.$broadcast('uploadSuccess');
                            $rootScope.setErrAlertMessage(res.message, 0);
                        } else {
                            $rootScope.setErrAlertMessage(res.message);
                        }
                    }, function (err) {
                        $rootScope.setErrAlertMessage(err.message);
                    });
            };

            $scope.downloadSORReport = function () {
                var url = urlService.downloadTemplateWithCampaignId($scope.invoiceData.campaignId);

                dataService
                    .downloadFile(url)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            saveAs(result.file, result.fileName); // jshint ignore:line
                            $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_SUCCESS, 0);
                        } else {
                            $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_ERR);
                        }
                    }, function () {
                        $rootScope.setErrAlertMessage(constants.INVOICE_TEMPLATE_DOWNLOAD_ERR);
                    });
            };

            $scope.closeErrorMessage = function () {
                $scope.uploadErrorMsg = undefined;
                $scope.invoiceData.rejectedFiles=undefined;
            };

            $modalInstance
                .opened
                .then(function () {
                    $('popup-msg').appendTo(document.body);
                });
        });
    });