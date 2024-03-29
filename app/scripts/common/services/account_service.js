define(['angularAMD'], function (angularAMD) {
    angularAMD.service('accountService', ['$rootScope', '$location', '$q', '$route', '$timeout', 'workflowService',
        'subAccountService', 'RoleBasedService', 'featuresService', 'dataService', 'vistoconfig', 'pageFinder', 'utils',
        function ($rootScope, $location, $q, $route, $timeout, workflowService, subAccountService, RoleBasedService, featuresService, dataService,
                  vistoconfig, pageFinder, utils) {
            var accountList = [],
                selectedAccount;

            return {
                fetchAccountList: function () {
                    var deferred = $q.defer();

                    if (accountList.length > 0) {

                        $timeout(function () {
                            deferred.resolve();
                        }, 10);

                        return deferred.promise;
                    }

                    workflowService.getClients().then(function (result) {
                        if (result && result.data.data && result.data.data.length > 0) {
                            accountList = _.map(result.data.data, function (org) {
                                return {
                                    'id': org.id,
                                    'name': org.name,
                                    'isLeafNode': org.isLeafNode,
                                    'timezone': org.timezone
                                };
                            });

                            accountList = _.sortBy(accountList, 'name');
                            deferred.resolve();
                        } else {
                            deferred.reject('Unable to fetch accounts');
                        }
                    });

                    return deferred.promise;
                },

                allowedAccount: function (accountId) {
                    accountId = Number(accountId);
                    if (accountId) {
                        selectedAccount = _.find(accountList, function (client) {
                            return Number(accountId) === client.id;
                        });

                        if (selectedAccount) {
                           vistoconfig.setCurrentSelectedAccount(selectedAccount);
                           vistoconfig.setClientTimeZone(selectedAccount.timezone);
                            return true;
                        }
                    }

                    return false;
                },
                updatePassword: function (userId, password) {
                    return dataService.put(
                        vistoconfig.apiPaths.WORKFLOW_API_URL + '/users/' + userId + '/reset_password',
                        {'password': password},
                        {'Content-Type': 'application/json'}
                    );
                },
                getAccounts: function () {
                    return accountList;
                },

                getSelectedAccount: function () {
                    return selectedAccount;
                },

                goToLandingPage: function (features, url) {
                    if (features.indexOf('ENABLE_ALL') !== -1) {
                        url += '/dashboard';
                    } else {
                        if (features.indexOf('DASHBOARD') !== -1) {
                            url += '/dashboard';
                        } else {
                            url += '/mediaplans';
                        }
                    }
                    $location.url(url);
                },

                changeAccount: function (account) {

                    subAccountService.reset();
                    featuresService.reset && featuresService.reset();
                    utils.cleanSearchParameter();

                    var selectedAccount,
                        routePermissionMapper = {
                            'mediaplanlist': 'mediaplan_list',
                            'dashboard': 'dashboard',
                            'creativelist': 'creative_list',
                            'reports-performance': 'performance',
                            'reports-platform': 'platform',
                            'reports-cost': 'cost',
                            'reports-inventory': 'inventory',
                            'reports-quality': 'quality',
                            'reports-optimization-impact': 'optimization_impact',
                            'reportbuilder': 'scheduled_reports',
                            'scheduledreports' : 'scheduled_reports',
                            'reportsoverview' : 'report_overview',
                            'uploadcustomreports' : 'collective_insights',
                            'collectiveinsights' : 'collective_insights',
                            'invoicesreports' : 'reports_invoice',
                            'mediaplan-overview' : 'mediaplan_hub',
                            'create-mediaplan' : 'create_mediaplan',
                            'edit-mediaplan' : 'create_mediaplan',
                            'mediaplan-adcreate' : 'ad_setup',
                            'mediaplan-adedit' : 'ad_setup',
                            'addcreative' : 'creative_list',
                            'editcreative' : 'creative_list'
                        },

                        fparams,
                        currentRouteTitle = $route.current.$$route.title,
                        routePath,
                        page,
                        url,
                        features,
                        subAccountId,
                        that = this;

                    selectedAccount = _.find(this.getAccounts(), function (client) {
                        return client.id === account.id;
                    });

                    if (!selectedAccount) {
                        selectedAccount = this.getAccounts()[0];
                    }

                    console.log($route.current.params);

                    if (that.allowedAccount(account.id)) {
                        that
                            .fetchAccountData(account.id)
                            .then(function (response) {
                                url = '/a/' + account.id;
                                features = response.data.data.features;
                                featuresService.setFeatureParams(features);
                                currentRouteTitle = currentRouteTitle && currentRouteTitle.toLowerCase().replace(/\s/g, '');
                                routePath = routePermissionMapper[currentRouteTitle];
                                fparams = featuresService.getFeatureParams();
                                if (routePath && fparams[0] && !fparams[0][routePath]) {
                                    if (account.isLeafNode) {
                                        that.goToLandingPage(features, url);
                                    } else {
                                        subAccountService
                                            .fetchSubAccountList(account.id)
                                            .then(function () {
                                                subAccountId = subAccountService.getSubAccounts()[0].id;
                                                url += '/sa/' + subAccountId;
                                                that.goToLandingPage(features, url);
                                            });
                                    }
                                } else {

                                    page = pageFinder.pageBuilder($location.path());
                                    if (account.isLeafNode) {
                                        url = page.buildPage(url);
                                        $location.url(url);

                                    } else {
                                        if (page.isDashboardPage()) {

                                            // fetch all the subaccounts including the leaf accounts
                                            subAccountService
                                                .fetchSubAccountList(account.id)
                                                .then(function () {
                                                    subAccountId = subAccountService.getSubAccounts()[0].id;
                                                    url += '/sa/' + subAccountId;
                                                    $location.url(page.buildPage(url));

                                                });
                                        } else if (page.isCustomReportsPage() || page.isCustomReportsListPage()) {
                                            // doesn't require the sub account idF
                                            $location.url(page.buildPage(url));
                                        } else {
                                            // fetch only the leaf subaccounts
                                            subAccountService
                                                .fetchSubAccountList(account.id)
                                                .then(function () {
                                                    subAccountId = subAccountService.getSubAccounts()[0].id;
                                                    url += '/sa/' + subAccountId;
                                                    that.goToLandingPage(features, url);
                                                });
                                        }
                                    }
                                }
                            });
                    }
                },

                fetchAccountData: function (accountId) {
                    accountId = Number(accountId);
                    var deferred = $q.defer();

                    workflowService.getClientData(accountId).then(function (response) {

                        if (response && response.data.data) {

                            RoleBasedService.setClientRole(response);//set the type of user here in RoleBasedService.js
                            RoleBasedService.setCurrencySymbol();
                            featuresService.setFeatureParams(response.data.data.features);
                            deferred.resolve(response);

                        } else {
                            deferred.reject('account data not found');
                        }
                    });

                    return deferred.promise;
                },

            };
        }]);
});
