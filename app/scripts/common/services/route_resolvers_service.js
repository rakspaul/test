define(['angularAMD', 'common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('routeResolvers', function () {
        var accountDataWithReportList = function (args, deferred) {
            // TODO: check out the 'deferred' param
                args.accountService
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

                                args.$route.current.params.advertiserId &&
                                    // TODO: Check out the implementation of this method
                                    fetchCurrentAdvertiser(args.$location, args.$route, args.advertiserModel, args.vistoconfig);

                                args.$route.current.params.advertiserId &&
                                    args.$route.current.params.brandId &&
                                    // TODO: Check out the implementation of this method
                                    fetchCurrentBrand(args.$location, args.$route, args.brandsModel, args.vistoconfig);
                            });
                    });
            },

            // TODO: Why is this NOT USED?
            adsResolver = function (args, mode) {
                var deferred = args.$q.defer(),
                    redirect = true;

                console.log('accountService', args.accountService);
                console.log('subAccountService', args.subAccountService);

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService.fetchSubAccountList(args.$route.current.params.accountId).then(function () {
                                    if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                        fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE, mode, true);
                                    }
                                });
                            }else {
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
                    params = args.$route.current.params;

                if (!args.loginModel.getClientData().is_super_admin) {
                    args.$location.url('/dashboard');
                }

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativePreviewResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = false;

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativeResolver = function (args) {
                var deferred = args.$q.defer(),
                    redirect = false;

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred,
                                                redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE);
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

                args.accountService.fetchAccountList().then(function () {
                    if (args.accountService.allowedAccount(params.accountId)) {
                        args.accountService
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
console.log('args = ', args);
                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.subAccountService
                                .fetchDashboardSubAccountList(args.$route.current.params.accountId)
                                .then(function () {
                                    if (args.subAccountService.allowedDashboardSubAccount(args.$route.current.params.subAccountId)) {
                                        args.accountService
                                            .fetchAccountData(params.accountId)
                                            .then(function () {
                                                deferred.resolve();

                                                if (params.advertiserId && params.brandId) {
                                                    console.log('fetching the advertiser & brand before loading dashboard. See resolve function');
                                                } else {
                                                    // fetch the advertiser async
                                                    params.advertiserId && fetchCurrentAdvertiser(args.$location, args.$route, args.advertiserModel, args.vistoconfig);
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
                args.accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        deferred.resolve();
                        args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);
                        args.$route.current.params.advertiserId && args.$route.current.params.brandId && fetchCurrentBrand(args);
                    });
            },

            fetchAccountDataSetWSInfo = function (args, deferred, redirect, warningMsg, mode, adGroup) {
                args.accountService
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
                args.accountService
                    .fetchAccountData(args.$route.current.params.accountId)
                    .then(function () {
                        var params = args.$route.current.params;

                        args.campaignSelectModel
                            .fetchCampaigns(params.subAccountId, params.advertiserId || -1, params.brandId || -1)
                            .then(function (campaignsResponse) {
                                var campaign,
                                    url;

                                if (campaignsResponse && campaignsResponse.data.data) {
                                    campaign = campaignsResponse.data.data[0];
                                    url = '/a/' + params.accountId + '/sa/' + params.subAccountId;

                                    if (campaign) {
                                        if (params.advertiserId) {
                                            url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
                                        }

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
            },

            fetchAdvertiserAndBrand = function (args) {
                args.$route.current.params.advertiserId && fetchCurrentAdvertiser(args);
                args.$route.current.params.advertiserId && args.$route.current.params.brandId && fetchCurrentBrand(args);
            },

            fetchCampaignStrategy = function (args, deferred) {
                var resolvedOtherDeferrer = false;

                args.campaignSelectModel
                    .fetchCampaign(args.$route.current.params.subAccountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            fetchAdvertiserAndBrand(args);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        deferred.reject('Mediaplan not found');
                    });

                args.strategySelectModel
                    .fetchStrategyList(args.$route.current.params.subAccountId, args.$route.current.params.campaignId)
                    .then(function () {
                        if (args.strategySelectModel.allowedStrategy(args.$route.current.params.lineitemId)) {
                            console.log('broadcast set strategy');
                        } else {
                            console.log('strategy not allowed');
                            args.$location.url('/tmp');
                        }

                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            fetchAdvertiserAndBrand(args);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        console.log('strategies not found');
                    });
            },

            fetchCurrentAdvertiser = function (args) {
                var params = args.$route.current.params;

                args.advertiserModel
                    .fetchAdvertiserList(params.subAccountId || params.accountId)
                    .then(function () {
                        var advertiser;

                        if (args.advertiserModel.allowedAdvertiser(params.advertiserId)) {
                            advertiser = args.vistoconfig ? args.vistoconfig.getSelectAdvertiserId() : {};
                            $('#advertiser_name_selected').text(advertiser.name);
                            $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
                        } else {
                            console.log('advertiser not allowed');
                            args.$location.url('/tmp');
                        }
                    });
            },

            fetchCurrentBrand = function (args) {
                var params = args.$route.current.params;

                args.brandsModel
                    .fetchBrandList(params.subAccountId || params.accountId, params.advertiserId)
                    .then(function () {
                        var brand;

                        if (args.brandsModel.allowedBrand(params.brandId)) {
                            brand = args.vistoconfig ? args.vistoconfig.getSelectedBrandId() : {};

                            $('#brand_name_selected').text(brand.name);
                            $('#brandsDropdown').attr('placeholder', brand.name).val('');
                        } else {
                            console.log('brand not allowed');
                            args.$location.url('/tmp');
                        }
                    });
            },

            invoiceHeader = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo(args, deferred, redirect, args.constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE, mode);
                                        }
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(params.accountId)) {
                            args.accountService
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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

            reportsHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.accountService
                                .fetchAccountData(args.$route.current.params.accountId)
                                .then(function () {
                                    var resolvedOtherDeferrer = false;

                                    args.campaignSelectModel
                                        .fetchCampaign(args.$route.current.params.accountId, args.$route.current.params.campaignId)
                                        .then(function () {
                                            if (resolvedOtherDeferrer) {
                                                deferred.resolve();
                                                params.advertiserId && fetchCurrentAdvertiser(args);
                                                params.advertiserId && params.brandId && fetchCurrentBrand(args);
                                            } else {
                                                resolvedOtherDeferrer = true;
                                            }
                                        }, function () {
                                            deferred.reject('Mediaplan not found');
                                        });

                                    args.strategySelectModel
                                        .fetchStrategyList(args.$route.current.params.accountId, args.$route.current.params.campaignId)
                                        .then(function () {
                                            if (args.strategySelectModel.allowedStrategy(args.$route.current.params.lineitemId)) {
                                                console.log('broadcast set strategy');
                                            } else {
                                                console.log('strategy not allowed');
                                                args.$location.url('/tmp');
                                            }

                                            if (resolvedOtherDeferrer) {
                                                deferred.resolve();
                                                params.advertiserId && fetchCurrentAdvertiser(args);
                                                params.advertiserId && params.brandId && fetchCurrentBrand(args);
                                            } else {
                                                resolvedOtherDeferrer = true;
                                            }
                                        }, function () {
                                            console.log('strategies not found');
                                        });
                                }, function () {
                                    deferred.reject('Client data not found');
                                });
                        } else {
                            console.log('account not allowed');
                            args.$location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolver2 = function (args) {
                var deferred = args.$q.defer();

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            // if not leafnode i.e having subaccount then fetch subaccount
                            if (!isLeafNode) {
                                args.subAccountService
                                    .fetchSubAccountList(args.$route.current.params.accountId)
                                    .then(function () {
                                        if (args.subAccountService.allowedSubAccount(args.$route.current.params.subAccountId)) {
                                            args.accountService
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
                                // if it's a leaf node i.e not haveing subaccount
                                args.accountService
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.accountService
                                .fetchAccountData(args.$route.current.params.accountId)
                                .then(function () {
                                    var params = args.$route.current.params;

                                    args.campaignSelectModel
                                        .fetchCampaigns(params.accountId, params.advertiserId || -1, params.brandId || -1)
                                        .then(function (campaignsResponse) {
                                            var campaign,
                                                url;

                                            if (campaignsResponse && campaignsResponse.data.data) {
                                                campaign = campaignsResponse.data.data[0];
                                                url = '/a/' + params.accountId;

                                                if (campaign) {
                                                    url += '/adv/' + campaign.advertiser_id + '/b/' + (campaign.brand_id || 0);
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(params.accountId)) {
                            args.accountService
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

            uploadReportsHeaderResolver = function (args) {
                var deferred = args.$q.defer(),
                    params = args.$route.current.params;

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            args.accountService
                                .fetchAccountData(args.$route.current.params.accountId)
                                .then(function () {
                                    args.collectiveReportModel
                                        .getReportList(params.accountId, params.advertiserId || -1, params.brandId || -1, params.campaignId || -1)
                                        .then(function (response) {
                                            if (response && response.data.data) {
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

                args.accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (args.accountService.allowedAccount(args.$route.current.params.accountId)) {
                            isLeafNode = args.accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                args.subAccountService
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
    });
});
