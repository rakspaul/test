define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('accountService', function ($rootScope, $location, $q, $route, $timeout, workflowService, subAccountService, featuresService) {

        var accountList = [],
            selectedAccount;
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
                if (account.isLeafNode) {
                    var url = '/a/' + account.id + '/dashboard';
                    console.log('change the url', url);

                    $location.url(url);
                } else {
                    subAccountService.fetchDashboardSubAccountList(account.id).then(function() {
                        var subAccountId = subAccountService.getDashboadSubAccountList()[0].id;
                        var url = '/a/' + account.id + '/sa/' + subAccountId + '/dashboard';

                        $location.url(url);
                    });
                }
            }

        }

    })
});
