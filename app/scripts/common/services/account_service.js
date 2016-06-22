define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('accountService', function ($rootScope, $location, $q, $route, $timeout, workflowService, 
        subAccountService, RoleBasedService, featuresService, pageFinder) {

        var accountList = [],
            selectedAccount,
            accountDataMap = {};

        return {

            fetchAccountList: function() {
                var deferred = $q.defer();
                if (accountList.length > 0) {
                    console.log('fetchAccountList ', 'already fetched');
                    $timeout(function() {
                        deferred.resolve();
                    }, 10);
                    return deferred.promise;
                }
                workflowService.getClients().then(function (result) {
                    if (result && result.data.data.length > 0) {
                        accountList = _.map(result.data.data, function (org) {
                            return {'id': org.id, 'name': org.name, 'isLeafNode': org.isLeafNode};
                        });
                        accountList = _.sortBy(accountList, 'name');
                        console.log('fetchAccountList is fetched');

                        deferred.resolve();
                    } else {
                        // TODO return failure
                        deferred.reject('Unable to fetch accounts');
                    }
                });
                return deferred.promise;
            },

            allowedAccount: function(accountId) {
                // var accountIdParam = $route.current.params.accountId;
                if (accountId) {
                    selectedAccount =  _.find(accountList, function(client) {
                        return accountId == client.id;
                    });
                    if (selectedAccount) {
                        // localStorageService.masterClient.set(selectedAccount);
                        // loginModel.setSelectedClient(selectedAccount);
                        return true;
                    }
                }
                return false;
            },

            getAccounts: function() {
                return accountList;
            },

            getSelectedAccount: function() {
                return selectedAccount;
            },

            changeAccount: function(account) {
                console.log('changeAccount', account);
                subAccountService.reset();
                featuresService.reset();
                var page = pageFinder.pageBuilder($location.path());
                var url = '/a/' + account.id;
                if (account.isLeafNode) {
                    url = page.buildPage(url);
                    $location.url(url);
                } else {
                    if (page.isDashboardPage()) {
                        subAccountService.fetchDashboardSubAccountList(account.id).then(function() {
                            var subAccountId = subAccountService.getDashboadSubAccountList()[0].id;
                            url += '/sa/' + subAccountId;
                            $location.url(page.buildPage(url));
                        });
                    } else {
                        subAccountService.fetchSubAccountList(account.id).then(function() {
                            var subAccountId = subAccountService.getSubAccounts()[0].id;
                            url += '/sa/' + subAccountId;
                            $location.url(page.buildPage(url));
                        });
                    }
                }
            },

            fetchAccountData: function(accountId) {
                var deferred = $q.defer();
                if (accountDataMap.id == accountId) {
                    console.log('fetchAccountData ', 'already fetched');
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
                        console.log('fetchAccountData is fetched');

                        deferred.resolve();
                    } else {
                        deferred.reject('account data not found');
                    }
                });
                return deferred.promise;
            }

        }

    })
});
