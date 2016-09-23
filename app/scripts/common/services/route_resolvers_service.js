define(['angularAMD'], function (angularAMD) {
    angularAMD.service('routeResolvers', ['$rootScope', '$timeout', 'utils', function ($rootScope, $timeout, utils) {
        var accountDataWithReportList = function (args, deferred) {
                args
                    .accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        args.collectiveReportModel
                            .getReportList(
                                args.$route.current.params.subAccountId,
                                args.$route.current.params.advertiserId || -1,
                                args.$route.current.params.brandId || -1,
                                args.$route.current.params.campaignId || -1
                            )
                            .then(function (response) {
                                if (response && response.data.data) {
                                    args.collectiveReportModel.setReportList(response.data.data);
                                    deferred.resolve(response.data.data);
                                } else {
                                    deferred.resolve([]);
                                }

                                args.$route.current.params.campaignId &&
                                args.campaignSelectModel.fetchCampaign(args.$route.current.params.subAccountId, args.$route.current.params.campaignId);

                                !args.$route.current.params.campaignId && args.campaignSelectModel.setSelectedCampaign({
                                    id: -1,
                                    name: 'All Media Plans',
                                    kpi: 'ctr',
                                    startDate: '-1',
                                    endDate: '-1'
                                });

                                args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);
                                args.$route.current.params.advertiserId && args.$route.current.params.brandId && fetchCurrentBrand(args);
                            });
                    });
            },

            adsResolver = function (args, mode) {
                var deferred = args.$q.defer(),
                    redirect = true;

                console.log('accountService', args.accountService);
                console.log('subAccountService', args.subAccountService);

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE, mode, true);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE, mode, true);
                            }
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            adminHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params,
                    isLeafNode;

                if (!args.loginModel.getClientData().is_super_admin) {
                    args.$location.url('/dashboard');
                }

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        fetchAccountData(args, params, deferred);
                                    });
                            } else {
                                fetchAccountData(args, params, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativeListResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = false;
                console.log('creativeResolver(), redirect = ', redirect);

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;
                            console.log('creativeResolver(): account ALLOWED!');

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                            }
                        } else {
                            console.log('creativeResolver(): account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativePreviewResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = false,
                    commonPreviewCheckFunc = function(args, deferred, redirect, msg) {
                        if (args.$route.current.params.accountId === args.$route.current.params.subAccountId) {
                            fetchAccountDataSetWSInfo(args, deferred, redirect, msg);
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    };

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode && args.$route.current.params.subAccountId) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                                        } else {
                                            commonPreviewCheckFunc(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                            }
                        } else {
                            commonPreviewCheckFunc(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                        }
                    });

                return deferred.promise;
            },

            creativeResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = false;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            dashboardHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(params.accountId)) {
                            args
                                .accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();

                                    if (params.advertiserId && params.brandId) {
                                        console.log('fetching the advertiser & brand before loading dashboard. See resolve function');
                                    } else {
                                        // fetch the advertiser async
                                        params.advertiserId && fetchCurrentAdvertiser(args);
                                    }
                                });
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            dashboardHeaderResolver2 = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args
                                .subAccountService
                                .fetchSubAccountList(args.$route.current.params.accountId)
                                .then(function () {
                                    if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                        args
                                            .accountService
                                            .fetchAccountData(params.accountId)
                                            .then(function () {
                                                deferred.resolve();

                                                if (params.advertiserId && params.brandId) {
                                                    console.log('fetching the advertiser & brand before loading dashboard. See resolve function');
                                                } else {
                                                    params.advertiserId && fetchCurrentAdvertiser(args);
                                                }
                                            });
                                    } else {
                                        console.log('dashboard account ' + params.subAccountId + 'not allowed');
                                        args.$location.url('/tmp');
                                    }
                                });
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            fetchAccountData = function (args, params, deferred) {
                args
                    .accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        deferred.resolve();
                        args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);
                        args.$route.current.params.advertiserId && args.$route.current.params.brandId && fetchCurrentBrand(args);
                    });
            },

            fetchAccountDataSetWSInfo = function (args, deferred, redirect, warningMsg, mode, adGroup) {
                args
                    .accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        deferred.resolve();

                        if (mode) {
                            args.workflowService.setMode(mode);
                        }

                        if (adGroup) {
                            args.workflowService.setIsAdGroup(true);
                        }

                        args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);

                        args.workflowService.setModuleInfo({
                            moduleName: 'WORKFLOW',
                            warningMsg: warningMsg,
                            redirect: redirect
                        });
                    });
            },

            fetchAccountDataWithCampaign = function (args, deferred) {
                args
                    .accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        var params = args.$route.current.params,
                            currentPath =  args.$location.path();

                        args
                            .campaignSelectModel
                            .fetchCampaigns(params.subAccountId, params.advertiserId || -1, params.brandId || -1)
                            .then(function (campaignsResponse) {
                                var campaign,
                                    url = '/a/' + params.accountId + '/sa/' + params.subAccountId;

                                if (campaignsResponse && campaignsResponse.data.data) {
                                    campaign = campaignsResponse.data.data[0];


                                    if (campaign) {
                                        if (params.advertiserId) {
                                            //When user selects all brand, it will not be selected as campaign brand id is getting used - Sapna
                                            url += '/adv/' + campaign.advertiser_id + '/b/' + (params.brandId || 0);
                                        }
                                        url += '/mediaplans/' + campaign.campaign_id + '/' + params.reportName;
                                    } else {

                                        if (params.advertiserId) {
                                            utils.cleanSearchParameter();
                                            args.vistoconfig.setNoMediaPlanFoundMsg(args.constants.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_BRAND);
                                            (params.advertiserId > 0) && (url += '/adv/' + params.advertiserId);
                                            (params.advertiserId > 0) && (url += '/b/0');
                                            url += '/mediaplans/reports' + currentPath.substr(currentPath.lastIndexOf('/'), currentPath.length);
                                        } else {
                                            utils.cleanSearchParameter();
                                            args.vistoconfig.setNoMediaPlanFoundMsg(args.constants.MEDIAPLAN_NOT_FOUND_FOR_SELECTED_ACCOUNT);
                                            url += '/mediaplans';
                                        }

                                    }
                                    args.$location.url(url);
                                }

                                deferred.resolve();
                            });
                    });
            },

            fetchAdvertiserAndBrand = function (args) {
                args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);
                args.$route.current.params.advertiserId && args.$route.current.params.brandId && fetchCurrentBrand(args);
            },

            fetchCampaignStrategy = function (args, deferred) {
                var resolvedOtherDeferrer = false;

                args
                    .campaignSelectModel
                    .fetchCampaign(args.$route.current.params.subAccountId || args.$route.current.params.accountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            $timeout(function() {
                                fetchAdvertiserAndBrand(args);
                            }, 100);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        deferred.reject('Mediaplan not found');
                    });

                args
                    .strategySelectModel
                    .fetchStrategyList(args.$route.current.params.subAccountId || args.$route.current.params.accountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (args.strategySelectModel.allowedStrategy(args.$route.current.params.lineitemId)) {
                            console.log('broadcast set strategy');
                        } else {
                            console.log('strategy not allowed');
                            args.$location.url('/tmp');
                        }

                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            $timeout(function() {
                                fetchAdvertiserAndBrand(args);
                            }, 100);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        console.log('strategies not found');
                    });
            },

            fetchCurrentAdvertiser = function (args) {
                var params = args.$route.current.params,
                    deferred = args.$q.defer();

                args
                    .advertiserModel
                    .fetchAdvertiserList(params.subAccountId || params.accountId)
                    .then(function () {
                        var advertiser;

                        if (args.advertiserModel.allowedAdvertiser(params.advertiserId)) {
                            advertiser = args.advertiserModel.getSelectedAdvertiser();
                            $('#advertiser_name_selected').text(advertiser.name);
                            $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
                            $rootScope.$broadcast('advertiser:set', advertiser);

                            if (args.$location.path().endsWith('/dashboard')) {
                                $('#advertiserButton').hide();
                                args.dashboardModel.setSelectedAdvertiser(advertiser);
                            }
                        } else {
                            console.log('advertiser not allowed');
                            args.$location.url('/tmp');
                        }

                        deferred.resolve();
                    });

                return deferred.promise;
            },

            fetchCurrentBrand = function (args,dashboardSubAccountId) {
                var params = args.$route.current.params,
                    accountId = params.subAccountId || params.accountId;

                if (params.subAccountId && dashboardSubAccountId) {
                    accountId = dashboardSubAccountId;
                }

                args
                    .brandsModel
                    .fetchBrandList(accountId, params.advertiserId)
                    .then(function () {
                        var brand;

                        if (args.brandsModel.allowedBrand(params.brandId)) {
                            brand = args.brandsModel.getSelectedBrand();
                            $('#brand_name_selected').text(brand.name);
                            $('#brandsDropdown').attr('placeholder', brand.name).val('');
                            $rootScope.$broadcast('brand:set', brand);
                        } else {
                            console.log('brand not allowed');
                            args.$location.url('/tmp');
                        }
                    });
            },

            invoiceHeader = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params,
                    isLeafNode;

                console.log('invoiceHeader, params = ', params);

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountData(args, params, deferred);
                                        }
                                    });
                            } else {
                                fetchAccountData(args, params, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlanCreateResolver = function (args, mode) {
                var deferred = args.$q.defer(),
                    redirect = true;

                console.log('accountService', args.accountService);
                console.log('subAccountService', args.subAccountService);

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchMediaplanCreateSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (!args.subAccountService.allowedMediaplanCreateSubAccount(args.$route.current.params.subAccountId)) {
                                            args.subAccountService.allowedMediaplanCreateSubAccount(args.subAccountService.getMediaplanCreateSubAccounts()[0].id);
                                        }
                                        fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE, mode);
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE, mode);
                            }
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlanOverviewResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = true;

                console.log('accountService', args.accountService);
                console.log('subAccountService', args.subAccountService);

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlansHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(params.accountId)) {
                            args
                                .accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                    params.advertiserId && fetchCurrentAdvertiser(args);
                                    params.advertiserId && params.brandId && fetchCurrentBrand(args);
                                });
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlansHeaderResolver2 = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(params.subAccountId)) {
                                            fetchAccountData(args, params, deferred);
                                        } else {
                                            console.log('dashboard account not allowed');
                                            args.$location.url('/tmp');
                                        }
                                    });
                            } else {
                                fetchAccountData(args, params, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolverCampStrg = function(deferred,args,params,accountId) {
                var resolvedOtherDeferrer = false;

                args
                    .campaignSelectModel
                    .fetchCampaign(accountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            $timeout(function() {
                                params.advertiserId && fetchCurrentAdvertiser(args);
                                params.advertiserId && params.brandId && fetchCurrentBrand(args);
                            }, 100);

                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        deferred.reject('Mediaplan not found');
                    });

                args
                    .strategySelectModel
                    .fetchStrategyList(accountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (args.strategySelectModel.allowedStrategy(args.$route.current.params.lineitemId)) {
                            console.log('broadcast set strategy');
                        } else {
                            console.log('strategy not allowed');
                            args.$location.url('/tmp');
                        }

                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            $timeout(function() {
                                params.advertiserId && fetchCurrentAdvertiser(args);
                                params.advertiserId && params.brandId && fetchCurrentBrand(args);
                            }, 100);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        console.log('strategies not found');
                    });
            },


            reportsHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            args
                                                .accountService
                                                .fetchAccountData(args.$route.current.params.accountId)
                                                .then(function () {
                                                    reportsHeaderResolverCampStrg(deferred, args, params, args.$route.current.params.subAccountId);
                                                }, function () {
                                                    deferred.reject('Client data not found');
                                                });
                                        }
                                    });

                            } else {
                                args
                                    .accountService
                                    .fetchAccountData(args.$route.current.params.accountId)
                                    .then(function () {
                                        reportsHeaderResolverCampStrg(deferred,args,params,args.$route.current.params.accountId);
                                    }, function () {
                                        deferred.reject('Client data not found');
                                    });
                            }

                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolver2 = function (args) {
                var deferred = args.$q.defer();
                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            // if not leaf node i.e having sub-account then fetch sub-account
                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            args
                                                .accountService
                                                .fetchAccountData(args.$route.current.params.accountId)
                                                .then(function () {
                                                    fetchCampaignStrategy(args, deferred);
                                                }, function () {
                                                    deferred.reject('Client data not found');
                                                });
                                        } else {
                                            console.log('sub account not allowed');
                                            args.$location.url('/tmp');
                                        }
                                    });
                            } else {
                                // if it's a leaf node i.e not having subaccount
                                args
                                    .accountService
                                    .fetchAccountData(args.$route.current.params.accountId)
                                    .then(function () {
                                        fetchCampaignStrategy(args, deferred);
                                    }, function () {
                                        deferred.reject('Client data not found');
                                    });
                            }

                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            // report header resolver without campaign id - we pick the campaign here
            reportsHeaderResolverWOCampaign = function (args) {
                var deferred = args.$q.defer();

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args
                                .accountService
                                .fetchAccountData(args.$route.current.params.accountId)
                                .then(function () {
                                    var params = args.$route.current.params;

                                    args
                                        .campaignSelectModel
                                        .fetchCampaigns(params.accountId, params.advertiserId || -1, params.brandId || -1)
                                        .then(function (campaignsResponse) {
                                            var campaign,
                                                url;

                                            if (campaignsResponse && campaignsResponse.data.data) {
                                                campaign = campaignsResponse.data.data[0];
                                                url = '/a/' + params.accountId;

                                                if (campaign) {
                                                    //url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                                                    url += '/mediaplans/' + campaign.campaign_id + '/' + params.reportName;
                                                } else {
                                                    (params.advertiserId > 0) && (url += '/adv/' + params.advertiserId);
                                                    (params.advertiserId > 0) && (params.brandId > 0) && (url += '/b/' + params.brandId);
                                                    url += '/mediaplans';
                                                }

                                                args.$location.url(url);
                                            }

                                            deferred.resolve();
                                        });
                                });
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolverWOCampaign2 = function (args) {
                var deferred = args.$q.defer();

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataWithCampaign(args, deferred);
                                        } else {
                                            console.log('sub account not allowed');
                                            args.$location.url('/tmp');
                                        }
                                    });
                            } else {
                                fetchAccountDataWithCampaign(args, deferred);
                            }

                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            scheduleReportListCreateResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(params.accountId)) {
                            args
                                .accountService
                                .fetchAccountData(args.$route.current.params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            fetchAccountDataWithReports = function(args, deferred) {
                var params = args.$route.current.params;
                args
                    .accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        args
                            .collectiveReportModel
                            .getReportList(params.accountId, params.advertiserId || -1, params.brandId || -1, params.campaignId || -1)
                            .then(function (response) {
                                if (response && response.data.data) {
                                    args.collectiveReportModel.setReportList(response.data.data);
                                    deferred.resolve(response.data.data);
                                } else {
                                    deferred.resolve([]);
                                }

                                params.campaignId && args.campaignSelectModel.fetchCampaign(params.accountId, params.campaignId);

                                !params.campaignId && args.campaignSelectModel.setSelectedCampaign({
                                    id: -1,
                                    name: 'All Media Plans',
                                    kpi: 'ctr',
                                    startDate: '-1',
                                    endDate: '-1'
                                });

                                params.advertiserId && fetchCurrentAdvertiser(args);
                                params.advertiserId && params.brandId && fetchCurrentBrand(args);
                            });
                    });
            },

            uploadReportsHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    isLeafNode;
                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;
                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataWithReports(args, deferred);
                                        } else {
                                            console.log('sub account not allowed');
                                            args.$location.url('/tmp');
                                        }
                                    });
                            } else {
                                fetchAccountDataWithReports(args, deferred);
                            }
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            uploadReportsHeaderResolver2 = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args
                    .accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args
                                    .subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            accountDataWithReportList(args, deferred);
                                        } else {
                                            console.log('sub account ' + params.accountId + 'not allowed');
                                            args.$location.url('/tmp');
                                        }
                                    });
                            } else {
                                accountDataWithReportList(args, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            };

        return {
            adsResolver: adsResolver,
            adminHeaderResolver: adminHeaderResolver,
            creativeListResolver: creativeListResolver,
            creativePreviewResolver: creativePreviewResolver,
            creativeResolver: creativeResolver,
            dashboardHeaderResolver: dashboardHeaderResolver,
            dashboardHeaderResolver2: dashboardHeaderResolver2,
            fetchCurrentAdvertiser: fetchCurrentAdvertiser,
            fetchCurrentBrand: fetchCurrentBrand,
            invoiceHeader: invoiceHeader,
            mediaPlanCreateResolver: mediaPlanCreateResolver,
            mediaPlanOverviewResolver: mediaPlanOverviewResolver,
            mediaPlansHeaderResolver: mediaPlansHeaderResolver,
            mediaPlansHeaderResolver2: mediaPlansHeaderResolver2,
            reportsHeaderResolver: reportsHeaderResolver,
            reportsHeaderResolver2: reportsHeaderResolver2,
            reportsHeaderResolverWOCampaign: reportsHeaderResolverWOCampaign,
            reportsHeaderResolverWOCampaign2: reportsHeaderResolverWOCampaign2,
            scheduleReportListCreateResolver: scheduleReportListCreateResolver,
            uploadReportsHeaderResolver: uploadReportsHeaderResolver,
            uploadReportsHeaderResolver2: uploadReportsHeaderResolver2
        };
    }]);
});
