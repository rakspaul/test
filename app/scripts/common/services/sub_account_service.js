define(['angularAMD'], function (angularAMD) {
    angularAMD.service('subAccountService', ['$rootScope', '$location', '$q', '$route', '$timeout', 'vistoconfig', 'workflowService', 'campaignSelectModel', 'advertiserModel',
        'brandsModel', 'pageFinder', function ($rootScope, $location, $q, $route, $timeout, vistoconfig, workflowService, campaignSelectModel,
                                               advertiserModel, brandsModel, pageFinder) {
        var subAccountList = [],
            mpSubAccountList = [],
            selectedSubAccount,
            selectedMPSubAccount,
            previousAccountId,

            reset = function () {
                subAccountList = [];
                mpSubAccountList = [];
                selectedSubAccount = undefined;
                selectedMPSubAccount = undefined;

                campaignSelectModel.reset();
                advertiserModel.reset();
                brandsModel.reset();

            },

            fetchMPSubAccountList = function (accountId) {
                var deferred;

                accountId = accountId || previousAccountId;
                accountId = Number(accountId);

                deferred = $q.defer();

                console.log('fetchSubAccountList(): accountId = ', accountId, ', typeof accountId = ', typeof accountId, ', previousAccountId = ',
                    previousAccountId, 'typeof previousAccountId = ', typeof previousAccountId);

                if (previousAccountId !== accountId) {
                    this.reset();
                }

                if (mpSubAccountList.length > 0) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 10);

                    return deferred.promise;
                }

                workflowService
                    .getSubAccounts (accountId)
                    .then(function (result) {
                            if (result && result.data.data.length > 0) {

                                //mpSubAccountList = _.map(result.data.data, function (a) {
                                //    return {'id': a.id, 'displayName': a.displayName, 'timezone' : a.timezone};
                                //});

                                mpSubAccountList = mpSubAccountList.concat(_.map(result.data.data, function (a) {
                                    return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode, 'timezone' : a.timezone};
                                }));

                                mpSubAccountList = _.filter(mpSubAccountList, function (a) {
                                    return a.isLeafNode === true;
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

            allowedMPSubAccount = function (subAccountId) {
                subAccountId = Number(subAccountId);

                if (subAccountId) {
                    selectedMPSubAccount = _.find(mpSubAccountList, function (client) {
                        return subAccountId === client.id;
                    });
                    if (selectedMPSubAccount) {
                        if(selectedMPSubAccount.timezone) {
                            vistoconfig.setClientTimeZone(selectedMPSubAccount.timezone);
                        }
                        return true;
                    }
                }

                return false;
            },

            fetchSubAccountList = function (accountId) {
                var deferred = $q.defer();

                accountId =  Number(accountId);

                if (previousAccountId !==  accountId) {
                    this.reset();
                }

                if (subAccountList.length > 0) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 10);

                    return deferred.promise;
                }

                subAccountList = [{'id': accountId, 'displayName': 'All'}];

                workflowService
                    .getDashboardSubAccount(accountId)
                    .then(function (result) {
                        if (result && result.data.data.length > 0) {
                            subAccountList = subAccountList.concat(_.map(result.data.data, function (a) {
                                return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode, 'timezone' : a.timezone};
                            }));

                            //subAccountList = _.filter(dashboardSubAccountList, function (a) {
                            //    return a.isLeafNode === true;
                            //});

                            previousAccountId = accountId;
                            deferred.resolve();
                        } else {
                            console.log('error', result);
                        }
                    });

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

            getMPSubAccounts = function () {
                return mpSubAccountList;
            },

            getSubAccounts = function () {
                return subAccountList;
            },

            getMPSelectedSubAccount = function () {
                return selectedMPSubAccount;
            },

            getSelectedSubAccount = function () {
                return selectedSubAccount;
            },

            changeSubAccount =  function (account, subAccount) {
                var url = '/a/' + account + '/sa/' + subAccount.id;

                $location.url(pageFinder.pageBuilder($location.path()).buildPage(url));
            };

        return {
            //reset                          : reset,
            //fetchSubAccountList            : fetchSubAccountList,
            //allowedSubAccount              : allowedSubAccount,
            //fetchDashboardSubAccountList   : fetchDashboardSubAccountList,
            //allowedDashboardSubAccount     : allowedDashboardSubAccount,
            //getSubAccounts                 : getSubAccounts,
            //getDashboardSubAccountList      : getDashboardSubAccountList,
            //getSelectedSubAccount          : getSelectedSubAccount,
            //getSelectedDashboardSubAccount : getSelectedDashboardSubAccount,
            //changeSubAccount               : changeSubAccount

            reset                          : reset,
            fetchSubAccountList            : fetchSubAccountList,
            allowedSubAccount              : allowedSubAccount,
            fetchMPSubAccountList          : fetchMPSubAccountList,
            allowedMPSubAccount            : allowedMPSubAccount,
            getSubAccounts                 : getSubAccounts,
            getMPSubAccounts               : getMPSubAccounts,
            getSelectedSubAccount          : getSelectedSubAccount,
            getMPSelectedSubAccount        : getMPSelectedSubAccount,
            changeSubAccount               : changeSubAccount
        };
    }]);
});
