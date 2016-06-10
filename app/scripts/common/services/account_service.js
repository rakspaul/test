define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('accountService', function ($rootScope, $location, $q, $route, $timeout, workflowService, subAccountService, featuresService) {

        var accountList = [],
            selectedAccount;

        var pageFinder = function(path) {
            var pageName;
            if (path.endsWith('dashboard')) {
                pageName = 'dashboard';
            } else if (path.endsWith('mediaplans')) {
                pageName = 'mediaplans';
            } else if (path.split('/').indexOf('mediaplans') > 0) {
                pageName = 'reports';
            }

            return {
                isDashboardPage: function() {
                    return pageName == 'dashboard';
                },
                isMediaplansPage: function() {
                    return pageName == 'mediaplans';
                },
                isReportsPage: function() {
                    return pageName == 'reports';
                }
            };
        };

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
                var page = pageFinder($location.path());
                var url = '/a/' + account.id;
                if (account.isLeafNode) {
                    if (page.isDashboardPage()) {
                        url += '/dashboard';
                    } else if (page.isMediaplansPage()) {
                        url += '/mediaplans';
                    } else if (page.isReportsPage()) {
                        var reportName = _.last($location.path().split('/'));
                        url += '/mediaplans/reports/' + reportName;
                    }
                    console.log('change the url', url);
                    $location.url(url);
                } else {
                    if (page.isDashboardPage()) {
                        subAccountService.fetchDashboardSubAccountList(account.id).then(function() {
                            var subAccountId = subAccountService.getDashboadSubAccountList()[0].id;
                            url += '/sa/' + subAccountId + '/dashboard';
                            console.log('change the url', url);
                            $location.url(url);
                        });
                    } else {
                        subAccountService.fetchSubAccountList(account.id).then(function() {
                            var subAccountId = subAccountService.getSubAccounts()[0].id;
                            url += '/sa/' + subAccountId;
                            if (page.isMediaplansPage()) {
                                url += '/mediaplans';
                            } else if (page.isReportsPage()) {
                                var reportName = _.last($location.path().split('/'));
                                url += '/mediaplans/reports/' + reportName;
                            }
                            console.log('change the url', url);
                            $location.url(url);
                        });
                    }
                }
            }

        }

    })
});
