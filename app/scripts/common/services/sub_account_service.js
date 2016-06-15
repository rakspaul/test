define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('subAccountService', function ($rootScope, $location, $q, $route, $timeout, workflowService, 
        campaignSelectModel, advertiserModel, brandsModel) {

        var subAccountList = [],
            dashboadSubAccountList = [],
            selectedSubAccount,
            selectedDashboardSubAccount,
            previousAccountId;

//TODO: to be moved to new service
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

        var accountIdParam = function() {
            return $route.current.params.accountId;
        },

        subAccountIdParam = function() {
            return $route.current.params.subAccountId;
        };

        return {

            fetchSubAccountList: function(accountId) {
                if (previousAccountId != accountId) {
                    this.reset();
                }
                var deferred = $q.defer();
                if (subAccountList.length > 0) {
                    console.log('fetchSubAccountList ', 'already fetched');
                    $timeout(function() {
                        deferred.resolve();
                    }, 10);
                    return deferred.promise;
                }
                workflowService.getSubAccounts2(accountId).then(function (result) {
                    if (result && result.data.data.length > 0) {
                        subAccountList = _.map(result.data.data, function(a) {
                            return {'id': a.id, 'displayName': a.displayName};
                        });
                        subAccountList = _.sortBy(subAccountList, 'displayName');
                        previousAccountId = accountId;
                        console.log('fetchSubAccountList is fetched');

                        deferred.resolve();
                    } else {
                        // TODO return failure
                    }
                });
                return deferred.promise;
            },

            allowedSubAccount: function(subAccountId) {
                // var accountIdParam = subAccountIdParam();
                if (subAccountId) {
                    selectedSubAccount =  _.find(subAccountList, function(client) {
                        return subAccountId == client.id;
                    });
                    if (selectedSubAccount) {
                        // loginModel.setSelectedClient(selectedAccount);
                        return true;
                    } 
                }
                return false;
            },

            fetchDashboardSubAccountList: function(accountId) {
                if (previousAccountId != accountId) {
                    this.reset();
                }
                var deferred = $q.defer();
                if (dashboadSubAccountList.length > 0) {
                    console.log('fetchDashboardSubAccountList ', 'already fetched');
                    $timeout(function() {
                        deferred.resolve();
                    }, 10);
                    return deferred.promise;
                }
                dashboadSubAccountList = [{'id': accountId, 'displayName': 'All'}];

                workflowService.getDashboardSubAccount2(accountId).then(function(result) {
                    if (result && result.data.data.length > 0) {
                        dashboadSubAccountList = dashboadSubAccountList.concat(_.map(result.data.data, function(a) {
                            return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode};
                        }));
                        subAccountList = _.filter(dashboadSubAccountList, function(a) {
                            return a.isLeafNode == true;
                        });
                        previousAccountId = accountId;
                        console.log('fetchDashboardSubAccountList is fetched');

                        deferred.resolve();
                    } else {
                        // TODO return failure
                    }
                });
                return deferred.promise;
            },

            allowedDashboardSubAccount: function(subAccountId) {
                // var accountIdParam = subAccountIdParam();
                if (subAccountId) {
                    selectedDashboardSubAccount =  _.find(dashboadSubAccountList, function(client) {
                        return subAccountId == client.id;
                    });
                    if (selectedDashboardSubAccount) {
                        // loginModel.setDashboardClient({'id': selectedDashboardSubAccount.id, 'name': selectedDashboardSubAccount.displayName});
                        // if (selectedDashboardSubAccount.isLeafNode) {
                        //     loginModel.setSelectedClient(selectedDashboardSubAccount);
                        // } else {
                        //     loginModel.setSelectedClient(subAccountList[0]);
                        // }
                        return true;
                    } 
                }
                return false;
            },

            getSubAccounts: function() {
                return subAccountList;
            },

            getDashboadSubAccountList: function() {
                return dashboadSubAccountList;
            },

            getSelectedSubAccount: function() {
                return selectedSubAccount;
            },

            getSelectedDashboardSubAccount: function() {
                return selectedDashboardSubAccount;
            },

            reset: function() {
                subAccountList = [],
                dashboadSubAccountList = [],
                selectedSubAccount = undefined,
                selectedDashboardSubAccount = undefined;
                campaignSelectModel.reset();
                advertiserModel.reset();
                brandsModel.reset();
            },

            changeSubAccount: function(account, subAccount) {
                console.log('changeAccount', account);
                console.log('changeAccount', subAccount);

                var url = '/a/' + account.id + '/sa/' + subAccount.id;
                var page = pageFinder($location.path());
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
            }

        }

    })
});
