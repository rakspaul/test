define(['angularAMD'], function (angularAMD) {
    angularAMD.service('subAccountService', ['$rootScope', '$location', '$q', '$route', '$timeout', 'vistoconfig', 'workflowService', 'campaignSelectModel', 'advertiserModel',
        'brandsModel', 'pageFinder', function ($rootScope, $location, $q, $route, $timeout, vistoconfig, workflowService, campaignSelectModel, advertiserModel, brandsModel, pageFinder) {
        var subAccountList = [],
            dashboardSubAccountList = [],
            selectedSubAccount,
            selectedDashboardSubAccount,
            previousAccountId,

            reset = function () {
                subAccountList = [];
                dashboardSubAccountList = [];
                selectedSubAccount = undefined;
                selectedDashboardSubAccount = undefined;

                campaignSelectModel.reset();
                advertiserModel.reset();
                brandsModel.reset();

            },

            fetchSubAccountList = function (accountId) {
                var deferred;

                accountId = accountId || previousAccountId;
                accountId = Number(accountId);

                deferred = $q.defer();

                console.log('fetchSubAccountList(): accountId = ', accountId, ', typeof accountId = ', typeof accountId, ', previousAccountId = ',
                    previousAccountId, 'typeof previousAccountId = ', typeof previousAccountId);

                if (previousAccountId !== accountId) {
                    this.reset();
                }

                if (subAccountList.length > 0) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 10);

                    return deferred.promise;
                }

                workflowService
                    .getSubAccounts (accountId)
                    .then(function (result) {
                            if (result && result.data.data.length > 0) {

                                subAccountList = _.map(result.data.data, function (a) {
                                    return {'id': a.id, 'displayName': a.displayName, 'timezone' : a.timezone};
                                });

                                // commented by sapna - need to checkout with Abhimanyu that why this sorting has been done though in the subaccount dropdown not applied.
                                // subAccountList = _.sortBy(subAccountList, 'displayName');

                                previousAccountId = accountId;
                                deferred.resolve();
                            } else {
                                console.log('error', result);
                            }
                        }
                    );

                return deferred.promise;
            },

            allowedSubAccount = function (subAccountId) {
                subAccountId = Number(subAccountId);

                if (subAccountId) {
                    selectedSubAccount = _.find(subAccountList, function (client) {
                        return subAccountId === client.id;
                    });
                    if (selectedSubAccount) {
                        if(selectedSubAccount.timezone) {
                            vistoconfig.setClientTimeZone(selectedSubAccount.timezone);
                        }
                        return true;
                    }
                }

                return false;
            },

            fetchDashboardSubAccountList = function (accountId) {
                var deferred = $q.defer();

                accountId =  Number(accountId);

                if (previousAccountId !==  accountId) {
                    this.reset();
                }

                if (dashboardSubAccountList.length > 0) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 10);

                    return deferred.promise;
                }

                dashboardSubAccountList = [{'id': accountId, 'displayName': 'All'}];

                workflowService
                    .getDashboardSubAccount(accountId)
                    .then(function (result) {
                        if (result && result.data.data.length > 0) {
                            dashboardSubAccountList = dashboardSubAccountList.concat(_.map(result.data.data, function (a) {
                                return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode, 'timezone' : a.timezone};
                            }));

                            subAccountList = _.filter(dashboardSubAccountList, function (a) {
                                return a.isLeafNode === true;
                            });

                            previousAccountId = accountId;
                            deferred.resolve();
                        } else {
                            console.log('error', result);
                        }
                    });

                return deferred.promise;
            },

            allowedDashboardSubAccount = function (subAccountId) {
                subAccountId = Number(subAccountId);

                if (subAccountId) {
                    selectedDashboardSubAccount = _.find(dashboardSubAccountList, function (client) {
                        return subAccountId === client.id;
                    });
                    if (selectedDashboardSubAccount) {
                        return true;
                    }
                }

                return false;
            },

            getSubAccounts = function () {
                return subAccountList;
            },

            getDashboardSubAccountList = function () {
                return dashboardSubAccountList;
            },

            getSelectedSubAccount = function () {
                return selectedSubAccount;
            },

            getSelectedDashboardSubAccount = function () {
                return selectedDashboardSubAccount;
            },

            changeSubAccount =  function (account, subAccount) {
                var url = '/a/' + account + '/sa/' + subAccount.id;

                $location.url(pageFinder.pageBuilder($location.path()).buildPage(url));
            };

        return {
            reset                          : reset,
            fetchSubAccountList            : fetchSubAccountList,
            allowedSubAccount              : allowedSubAccount,
            fetchDashboardSubAccountList   : fetchDashboardSubAccountList,
            allowedDashboardSubAccount     : allowedDashboardSubAccount,
            getSubAccounts                 : getSubAccounts,
            getDashboardSubAccountList      : getDashboardSubAccountList,
            getSelectedSubAccount          : getSelectedSubAccount,
            getSelectedDashboardSubAccount : getSelectedDashboardSubAccount,
            changeSubAccount               : changeSubAccount
        };
    }]);
});
