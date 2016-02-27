var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('AccountsAddOrEdit', function ($scope, $rootScope, $modalInstance, accountsService) {
        $scope.currencySelected = '';
        $scope.referenceId;

        getCountries();
        getTimezones();

        if ($scope.mode === 'edit') {
            $scope.clientName = $scope.clientObj.name;
            $scope.clientType = $scope.clientObj.clientType;
            $scope.selectedCurrency = $scope.clientObj.currency && $scope.clientObj.currency.id;
            $scope.selectedCountry = $scope.clientObj.country && $scope.clientObj.country.id;
            $scope.timezone = $scope.clientObj.timezone;
        }

        $scope.close = function () {
            $modalInstance.dismiss();
            $scope.resetBrandAdvertiserAfterEdit();
        };

        $scope.setSelectedClientType = function (type) {
            $scope.clientType = type;
            accountsService[type === 'MARKETER' ? 'getAllAdvertisers' : 'getAgencies']().then(function (result) {
                $scope.allAdvertiser = result.data.data;
            });
        };

        $scope.selectClientAdvertiser = function (advertiser) {
            $scope.dropdownCss.display = 'none';
            $scope.clientName = advertiser.name;
            $scope.referenceId = advertiser.id;
        };

        $scope.saveClients = function () {
            var clientObj,
                body,
                billableBody,
                createBillableAccount;

            if ($scope.mode === 'edit') {
                clientObj =  accountsService.getToBeEditedClient();
                body = constructRequestBody(clientObj);
                accountsService
                    .updateClient(body, body.id)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.close();
                            $scope.fetchAllClients();
                            $rootScope.setErrAlertMessage('Account updated successfully', 0);
                            $scope.resetBrandAdvertiserAfterEdit();
                        }
                    });
            } else {
                billableBody = createBillableBody();
                createBillableAccount = function () {
                    accountsService
                        .createBillableAccount(billableBody)
                        .then(function (result) {
                            var body;

                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.billableAccountId = result.data.data.id;
                                body = constructRequestBody();
                                createClient(body);
                            }
                        });
                };
                if ($scope.clientType === 'MARKETER') {
                    accountsService
                        .createAdvertiser(billableBody)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.referenceId = result.data.data.id;
                                createBillableAccount();
                            }
                        });
                } else if ($scope.clientType === 'AGENCY') {
                    accountsService
                        .createAgencies(billableBody)
                        .then(function (result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.referenceId = result.data.data.id;
                                createBillableAccount();
                            }
                        });
                } else {
                    createBillableAccount();
                }
            }
        };

        function createClient(body) {
            accountsService
                .createClient(body)
                .then(function (adv) {
                    if (adv.status === 'OK' || adv.status === 'success') {
                        $scope.fetchAllClients();
                        $scope.close();
                        $rootScope.setErrAlertMessage('Account created successfully', 0);
                    }
                });
        }

        function createBillableBody() {
            var respBody = {
                name: $scope.clientName
            };

            return respBody;
        }

        function constructRequestBody(obj) {
            var respBody = {
                name: $scope.clientName
            };

            if ($scope.mode === 'edit') {
                respBody.id = obj.id;
                respBody.updatedAt = obj.updatedAt;
                respBody.billableAccountId = obj.billableAccountId;
                respBody.clientType = $scope.clientType;
                respBody.parentId = obj.parentId;
                respBody.referenceId = obj.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.currency = Number($scope.selectedCurrency);
                respBody.countryId=Number($scope.selectedCountry);
            } else {
                respBody.billableAccountId = 1;
                respBody.clientType = $scope.clientType;
                respBody.currency = Number($scope.selectedCurrency);
                respBody.countryId=Number($scope.selectedCountry);
                respBody.referenceId = $scope.referenceId;
                respBody.timezone = $scope.timezone;
                respBody.billableAccountId = $scope.billableAccountId;
                //temp hardcoded
                respBody.parentId = 1;
            }
            return respBody;
        }

        function getCountries() {
            accountsService
                .getCountries()
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.Geography = result.data.data;
                    }
                });
        }

        function getTimezones() {
            $scope.timezones = {
                'EST'        : 'Eastern Standard Time(UTC-05:00)', 
                'US/Eastern' : 'Eastern Time',
                'US/Central' : 'Central Standard Time(UTC-06:00)', 
                'US/Mountain': 'Mountain Standard Time(UTC-07:00)', 
                'US/Pacific' : 'Pacific Standard Time(UTC-08:00)', 
                'UTC'        : 'UTC', 
                'GB'         : 'British Summer Time (UTC+01:00)'
            };
        }
    });
}());
