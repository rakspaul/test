define(['angularAMD'], function (angularAMD) {
    angularAMD.service('subAccountService', ['$rootScope', '$location', '$q', '$route', '$timeout', 'vistoconfig', 'workflowService', 'campaignSelectModel', 'advertiserModel',
        'brandsModel', 'pageFinder', function ($rootScope, $location, $q, $route, $timeout, vistoconfig, workflowService, campaignSelectModel,
                                               advertiserModel, brandsModel, pageFinder) {
            var subAccountList = [],
                mediaplanCreateSubAccountList = [],
                selectedSubAccount,
                selectedMediaplanCreateSubAccount,
                previousAccountId,

                reset = function () {
                    subAccountList = [];
                    mediaplanCreateSubAccountList = [];
                    selectedSubAccount = undefined;
                    selectedMediaplanCreateSubAccount = undefined;

                    campaignSelectModel.reset();
                    advertiserModel.reset();
                    brandsModel.reset();

                },

            /*
             Purpose: Fetch the sub account list (Tier1 list) for the media plan create page.
             Desc: Fetch the list create the array mediaplanCreateSubAccountList with leafNode: true
             */
                fetchMediaplanCreateSubAccountList = function (accountId) {
                    var deferred;

                    accountId = accountId || previousAccountId;
                    accountId = Number(accountId);

                    deferred = $q.defer();


                    if (previousAccountId !== accountId) {
                        this.reset();
                    }

                    if (mediaplanCreateSubAccountList.length > 0) {
                        $timeout(function () {
                            deferred.resolve();
                        }, 10);

                        return deferred.promise;
                    }

                    workflowService
                        .getSubAccounts (accountId)
                        .then(function (result) {
                                if (result && result.data.data.length > 0) {

                                    mediaplanCreateSubAccountList = mediaplanCreateSubAccountList.concat(_.map(result.data.data, function (a) {
                                        return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode, 'timezone' : a.timezone};
                                    }));

                                    mediaplanCreateSubAccountList = _.filter(mediaplanCreateSubAccountList, function (a) {
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

            /*
             Purpose: If subAccountId exist in the mediaplanCreateSubAccountList then return true;.
             */
                allowedMediaplanCreateSubAccount = function (subAccountId) {
                    subAccountId = Number(subAccountId);
                    if (subAccountId) {
                        selectedMediaplanCreateSubAccount = _.find(mediaplanCreateSubAccountList, function (client) {
                            return subAccountId === client.id;
                        });
                        if (selectedMediaplanCreateSubAccount) {
                            if(selectedMediaplanCreateSubAccount.timezone) {
                                vistoconfig.setClientTimeZone(selectedMediaplanCreateSubAccount.timezone);
                            }
                            return true;
                        }
                    }

                    return false;
                },

            /*
             Purpose: Fetch subaccounts list for all the pages apart from mediaplan create page
             */

                fetchSubAccountList = function (accountId) {
                    var deferred = $q.defer(),
                        accountData;

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

                    accountData = vistoconfig.getCurrentSelectedAccount();
                    subAccountList = [{'id': accountId, 'displayName': 'All Sub-Accounts', 'timezone' : (accountData ? accountData.timezone : '')}];

                    workflowService
                        .getDashboardSubAccount(accountId)
                        .then(function (result) {
                            if (result && result.data.data.length > 0) {
                                subAccountList = subAccountList.concat(_.map(result.data.data, function (a) {
                                    return {'id': a.id, 'displayName': a.displayName, 'isLeafNode': a.isLeafNode, 'timezone' : a.timezone};
                                }));

                                previousAccountId = accountId;
                                deferred.resolve();
                            } else {
                                console.log('error', result);
                            }
                        });

                    return deferred.promise;
                },

            /*
             Purpose: If subAccountId exist in the subAccountList then return true, select the value for
             selectedSubAccount.
             */

                allowedSubAccount = function (subAccountId) {
                    subAccountId = Number(subAccountId);

                    if (subAccountId) {
                        selectedSubAccount = _.find(subAccountList, function (client) {
                            return subAccountId === client.id;
                        });
                        if (selectedSubAccount) {
                            vistoconfig.setClientTimeZone(selectedSubAccount.timezone);
                            return true;
                        }
                    }

                    return false;
                },

            // Return the subaccount list for the mediaplan create page.
                getMediaplanCreateSubAccounts = function () {
                    return mediaplanCreateSubAccountList;
                },

            // get subaccount list for all the pages.
                getSubAccounts = function () {
                    return subAccountList;
                },

            // get the selected sub account for the mediaplan create page.
                getMediaplanCreateSelectedSubAccount = function () {
                    return selectedMediaplanCreateSubAccount;
                },

            // get the selected sub acccount for the all the pages apart from mediaplan create page.
                getSelectedSubAccount = function () {
                    return selectedSubAccount;
                },

                changeSubAccount =  function (account, subAccount) {
                    var url = '/a/' + account + '/sa/' + subAccount.id;

                    $location.url(pageFinder.pageBuilder($location.path()).buildPage(url));
                };

            return {
                reset                                       : reset,
                fetchSubAccountList                         : fetchSubAccountList,
                allowedSubAccount                           : allowedSubAccount,
                fetchMediaplanCreateSubAccountList          : fetchMediaplanCreateSubAccountList,
                allowedMediaplanCreateSubAccount            : allowedMediaplanCreateSubAccount,
                getSubAccounts                              : getSubAccounts,
                getMediaplanCreateSubAccounts               : getMediaplanCreateSubAccounts,
                getSelectedSubAccount                       : getSelectedSubAccount,
                getMediaplanCreateSelectedSubAccount        : getMediaplanCreateSelectedSubAccount,
                changeSubAccount                            : changeSubAccount
            };
        }]);
});
