define(['angularAMD'], function (angularAMD) {
    angularAMD.service('accountService', ['$rootScope', '$location', '$q', '$route', '$timeout', 'workflowService',
        'subAccountService', 'RoleBasedService', 'featuresService', 'dataService', 'vistoconfig', 'pageFinder',
        function ($rootScope, $location, $q, $route, $timeout, workflowService, subAccountService, RoleBasedService, featuresService, dataService, vistoconfig, pageFinder) {
        var accountList = [],
            selectedAccount,
            accountDataMap = {};

        return {
            fetchAccountList: function() {
                var deferred = $q.defer();

                if (accountList.length > 0) {

                    $timeout(function() {
                        deferred.resolve();
                    }, 10);

                    return deferred.promise;
                }

                workflowService.getClients().then(function (result) {
                    if (result && result.data.data.length > 0) {
                        accountList = _.map(result.data.data, function (org) {
                            return {'id': org.id, 'name': org.name, 'isLeafNode': org.isLeafNode, 'timezone' : org.timezone};
                        });

                        accountList = _.sortBy(accountList, 'name');
                        deferred.resolve();
                    } else {
                        deferred.reject('Unable to fetch accounts');
                    }
                });

                return deferred.promise;
            },

            allowedAccount: function(accountId) {
                accountId = Number(accountId);
                if (accountId) {
                    selectedAccount =  _.find(accountList, function(client) {
                        return Number(accountId) === client.id;
                    });

                    if (selectedAccount) {
                        vistoconfig.setClientTimeZone(selectedAccount.timezone);
                        return true;
                    }
                }

                return false;
            },
            updatePassword : function (userId, password) {
                return dataService.put(
                    vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + userId + '/reset_password',
                    {'password': password},
                    {'Content-Type': 'application/json'}
                );
            },
            getAccounts: function() {
                return accountList;
            },

            getSelectedAccount: function() {
                return selectedAccount;
            },

            changeAccount: function(account) {
                var page,
                    url;

                subAccountService.reset();
                featuresService.reset && featuresService.reset();

                page = pageFinder.pageBuilder($location.path());
                url = '/a/' + account.id;

                if (account.isLeafNode) {
                    url = page.buildPage(url);
                    $location.url(url);

                } else {
                    if (page.isDashboardPage()) {

                        // fetch all the subaccounts including the leaf accounts
                        subAccountService
                            .fetchDashboardSubAccountList(account.id)
                            .then(function () {
                                var subAccountId = subAccountService.getDashboardSubAccountList()[0].id;
                                url += '/sa/' + subAccountId;
                                $location.url(page.buildPage(url));

                            });
                    } else if (page.isCustomReportsPage() || page.isCustomReportsListPage()) {
                        // doesn't require the sub account id
                        $location.url(page.buildPage(url));
                    } else {
                        // fetch only the leaf subaccounts
                        subAccountService
                            .fetchSubAccountList(account.id)
                            .then(function () {
                                var subAccountId = subAccountService.getSubAccounts()[0].id;

                                url += '/sa/' + subAccountId;
                                $location.url(page.buildPage(url));
                            });
                    }
                }
            },

            fetchAccountData: function(accountId) {
                accountId = Number(accountId);
                var deferred = $q.defer();

                if (accountDataMap.id === accountId) {
                    $timeout(function() {
                        deferred.resolve();
                    }, 5);
                    return deferred.promise;
                }

                workflowService.getClientData(accountId).then(function(response) {

                    if (response && response.data.data) {

                        RoleBasedService.setClientRole(response);//set the type of user here in RoleBasedService.js
                        RoleBasedService.setCurrencySymbol();
                        featuresService.setFeatureParams(response.data.data.features);
                        accountDataMap.id = accountId;
                        deferred.resolve();

                    } else {
                        deferred.reject('account data not found');
                    }
                });

                return deferred.promise;
            },

        };
    }]);
});
