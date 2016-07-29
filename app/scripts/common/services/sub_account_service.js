define(['angularAMD', 'workflow/services/workflow_service'], function (angularAMD) {
    angularAMD.service('subAccountService', function ($rootScope, $location, $q, $route, $timeout, workflowService,
                                                      campaignSelectModel, advertiserModel, brandsModel, pageFinder) {

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
                accountId = Number(accountId);
                var deferred = $q.defer();

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
                                    return {'id': a.id, 'displayName': a.displayName};
                                });

                                subAccountList = _.sortBy(subAccountList, 'displayName');

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
                        return true;
                    }
                }
                return false;
            },

            fetchDashboardSubAccountList = function (accountId) {
                accountId =  Number(accountId);
                var deferred = $q.defer();

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

                workflowService.getDashboardSubAccount(accountId).then(function (result) {

                    if (result && result.data.data.length > 0) {

                        dashboardSubAccountList = dashboardSubAccountList.concat(_.map(result.data.data, function (a) {
                            return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode};
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
                console.log('account', account);
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
    });
});
