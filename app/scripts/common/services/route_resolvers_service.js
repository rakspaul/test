define(['angularAMD', 'common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('routeResolvers', function () {
        var
            accountDataWithReportList = function ($location, $route, accountService, collectiveReportModel, advertiserModel, brandsModel, campaignSelectModel,
                                                  vistoconfig, deferred) {
                accountService
                    .fetchAccountData($route.current.params.accountId)
                    .then(function () {
                        collectiveReportModel
                            .getReportList(
                                $route.current.params.subAccountId,
                                $route.current.params.advertiserId || -1,
                                $route.current.params.brandId || -1,
                                $route.current.params.campaignId || -1
                            )
                            .then(function (response) {
                                if (response && response.data.data) {
                                    deferred.resolve(response.data.data);
                                } else {
                                    deferred.resolve([]);
                                }

                                $route.current.params.campaignId && campaignSelectModel.fetchCampaign($route.current.params.subAccountId, $route.current.params.campaignId);

                                !$route.current.params.campaignId && campaignSelectModel.setSelectedCampaign({
                                    id: -1,
                                    name: 'All Media Plans',
                                    kpi: 'ctr',
                                    startDate: '-1',
                                    endDate: '-1'
                                });

                                $route.current.params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                $route.current.params.advertiserId && $route.current.params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
                            });
                    });
            },

            adsResolver = function ($q, $location, $route, accountService, subAccountService, workflowService, vistoconfig, advertiserModel, constants, mode) {
                var deferred = $q.defer(),
                    redirect = true;

                console.log('accountService', accountService);
                console.log('subAccountService', subAccountService);

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService.fetchSubAccountList($route.current.params.accountId).then(function () {
                                    if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                        fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                            constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE, mode, true);
                                    }
                                });
                            }else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                    constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE, mode, true);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            adminHeaderResolver = function ($q, $location, $route, accountService, loginModel) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                if (!loginModel.getClientData().is_super_admin) {
                    $location.url('/dashboard');
                }

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativeListResolver = function ($q, $location, $route, accountService, workflowService, subAccountService, constants, vistoconfig, advertiserModel) {
                var deferred = $q.defer(),
                    redirect = false;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred,
                                                redirect, constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                    constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativePreviewResolver = function ($q, $location, $route, accountService, workflowService, subAccountService, constants, vistoconfig, advertiserModel) {
                var deferred = $q.defer(),
                    redirect = false;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred,
                                                redirect, constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                    constants.ACCOUNT_CHANGE_MSG_ON_CREATIVE_LIST_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            creativeResolver = function ($q, $location, $route, accountService, workflowService, subAccountService, constants, vistoconfig, advertiserModel) {
                var deferred = $q.defer(),
                    redirect = false;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred,
                                                redirect, constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                    constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_AD_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            dashboardHeaderResolver = function ($q, $location, $route, accountService, advertiserModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService.fetchAccountList().then(function () {
                    if (accountService.allowedAccount(params.accountId)) {
                        accountService
                            .fetchAccountData(params.accountId)
                            .then(function () {
                                deferred.resolve();

                                if (params.advertiserId && params.brandId) {
                                    console.log('fetching the advertiser & brand before loading dashboard. See resolve function');
                                } else {
                                    // fetch the advertiser async
                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                }
                            });
                    } else {
                        console.log('account not allowed');
                        $location.url('/tmp');
                    }
                });

                return deferred.promise;
            },

            dashboardHeaderResolver2 = function ($q, $location, $route, accountService, subAccountService, advertiserModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;
//console.log('rrp = ', rrp)
                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            subAccountService
                                .fetchDashboardSubAccountList($route.current.params.accountId)
                                .then(function () {
                                    if (subAccountService.allowedDashboardSubAccount($route.current.params.subAccountId)) {
                                        accountService
                                            .fetchAccountData(params.accountId)
                                            .then(function () {
                                                deferred.resolve();

                                                if (params.advertiserId && params.brandId) {
                                                    console.log('fetching the advertiser & brand before loading dashboard. See resolve function');
                                                } else {
                                                    // fetch the advertiser async
                                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                                }
                                            });
                                    } else {
                                        console.log('dashboard account ' + params.subAccountId + 'not allowed');
                                        $location.url('/tmp');
                                    }
                                });
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            fetchAccountData = function ($location, $route, advertiserModel, brandsModel, vistoconfig, params, accountService, fetchCurrentBrand, deferred) {
                accountService
                    .fetchAccountData($route.current.params.accountId)
                    .then(function () {
                        deferred.resolve();
                        $route.current.params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                        $route.current.params.advertiserId && $route.current.params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
                    });
            },

            fetchAccountDataSetWSInfo = function ($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect, warningMsg,
                                                  mode, adGroup) {
                accountService
                    .fetchAccountData($route.current.params.accountId)
                    .then(function () {
                        deferred.resolve();

                        if (mode) {
                            workflowService.setMode(mode);
                        }

                        if (adGroup) {
                            workflowService.setIsAdGroup(true);
                        }

                        $route.current.params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);

                        workflowService.setModuleInfo({
                            moduleName: 'WORKFLOW',
                            warningMsg: warningMsg,
                            redirect: redirect
                        });
                    });
            },

            fetchAccountDataWithCampaign = function ($route, $location, campaignSelectModel, accountService, deferred) {
                accountService
                    .fetchAccountData($route.current.params.accountId)
                    .then(function () {
                        var params = $route.current.params;

                        campaignSelectModel
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

                                    $location.url(url);
                                }

                                deferred.resolve();
                            });
                    });
            },

            fetchAdvertiserAndBrand = function ($route, $location, advertiserModel, brandsModel, vistoconfig) {
                $route.current.params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                $route.current.params.advertiserId && $route.current.params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
            },

            fetchCampaignStrategy = function ($route, $location, advertiserModel, brandsModel, vistoconfig, campaignSelectModel, strategySelectModel, deferred) {
                var resolvedOtherDeferrer = false;

                campaignSelectModel
                    .fetchCampaign($route.current.params.subAccountId, $route.current.params.campaignId)
                    .then(function () {
                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            fetchAdvertiserAndBrand($route,$location ,advertiserModel,brandsModel, vistoconfig);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        deferred.reject('Mediaplan not found');
                    });

                strategySelectModel
                    .fetchStrategyList($route.current.params.subAccountId, $route.current.params.campaignId)
                    .then(function () {
                        if (strategySelectModel.allowedStrategy($route.current.params.lineitemId)) {
                            console.log('broadcast set strategy');
                        } else {
                            console.log('strategy not allowed');
                            $location.url('/tmp');
                        }

                        if (resolvedOtherDeferrer) {
                            deferred.resolve();
                            fetchAdvertiserAndBrand($route, $location, advertiserModel,brandsModel, vistoconfig);
                        } else {
                            resolvedOtherDeferrer = true;
                        }
                    }, function () {
                        console.log('strategies not found');
                    });
            },

            fetchCurrentAdvertiser = function ($location, $route, advertiserModel, vistoconfig) {
                var params = $route.current.params;

                advertiserModel
                    .fetchAdvertiserList(params.subAccountId || params.accountId)
                    .then(function () {
                        var advertiser;

                        if (advertiserModel.allowedAdvertiser(params.advertiserId)) {
                            advertiser = vistoconfig ? vistoconfig.getSelectAdvertiserId() : {};
                            $('#advertiser_name_selected').text(advertiser.name);
                            $('#advertisersDropdown').attr('placeholder', advertiser.name).val('');
                        } else {
                            console.log('advertiser not allowed');
                            $location.url('/tmp');
                        }
                    });
            },

            fetchCurrentBrand = function ($location, $route, brandsModel, vistoconfig) {
                var params = $route.current.params;

                brandsModel
                    .fetchBrandList(params.subAccountId || params.accountId, params.advertiserId)
                    .then(function () {
                        if (brandsModel.allowedBrand(params.brandId)) {
                            var brand = vistoconfig ? vistoconfig.getSelectedBrandId() : {};

                            $('#brand_name_selected').text(brand.name);
                            $('#brandsDropdown').attr('placeholder', brand.name).val('');
                        } else {
                            console.log('brand not allowed');
                            $location.url('/tmp');
                        }
                    });
            },

            invoiceHeader = function ($q, $location, $route, accountService) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlanCreateResolver = function ($q, $location, $route, accountService, subAccountService, workflowService, constants, vistoconfig, advertiserModel, mode) {
                var deferred = $q.defer(),
                    redirect = true;

                console.log('accountService', accountService);
                console.log('subAccountService', subAccountService);

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred,
                                                redirect, constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE, mode);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig, advertiserModel, deferred, redirect,
                                    constants.ACCOUNT_CHANGE_MSG_ON_CREATE_OR_EDIT_CAMPAIGN_PAGE, mode);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlanOverviewResolver = function ($q, $location, $route, accountService, subAccountService, workflowService, constants, vistoconfig, advertiserModel) {
                var deferred = $q.defer(),
                    redirect = true;

                console.log('accountService', accountService);
                console.log('subAccountService', subAccountService);

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService,
                                                vistoconfig, advertiserModel, deferred, redirect, constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE);
                                        }
                                    });
                            } else {
                                fetchAccountDataSetWSInfo($route, $location, constants, accountService, workflowService, vistoconfig,
                                    advertiserModel, deferred, redirect, constants.ACCOUNT_CHANGE_MSG_ON_CAMPIGN_OVERVIEW_PAGE);
                            }
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlansHeaderResolver = function ($q, $location, $route, accountService, advertiserModel, brandsModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount(params.accountId)) {
                            accountService
                                .fetchAccountData(params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                    params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                    params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
                                });
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            mediaPlansHeaderResolver2 = function ($q, $location, $route, accountService, subAccountService, advertiserModel, brandsModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount(params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList(params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount(params.subAccountId)) {
                                            fetchAccountData($location, $route, advertiserModel, brandsModel, vistoconfig, params, accountService, fetchCurrentBrand, deferred);
                                        } else {
                                            console.log('dashboard account not allowed');
                                            $location.url('/tmp');
                                        }
                                    });
                            } else {
                                fetchAccountData($location, $route, advertiserModel, brandsModel, vistoconfig, params, accountService, fetchCurrentBrand, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolver = function ($q, $location, $route, accountService, campaignSelectModel, strategySelectModel, advertiserModel, brandsModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            accountService
                                .fetchAccountData($route.current.params.accountId)
                                .then(function () {
                                    var resolvedOtherDeferrer = false;

                                    campaignSelectModel
                                        .fetchCampaign($route.current.params.accountId, $route.current.params.campaignId)
                                        .then(function () {
                                            if (resolvedOtherDeferrer) {
                                                deferred.resolve();
                                                params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                                params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
                                            } else {
                                                resolvedOtherDeferrer = true;
                                            }
                                        }, function () {
                                            deferred.reject('Mediaplan not found');
                                        });

                                    strategySelectModel
                                        .fetchStrategyList($route.current.params.accountId, $route.current.params.campaignId)
                                        .then(function () {
                                            if (strategySelectModel.allowedStrategy($route.current.params.lineitemId)) {
                                                console.log('broadcast set strategy');
                                            } else {
                                                console.log('strategy not allowed');
                                                $location.url('/tmp');
                                            }

                                            if (resolvedOtherDeferrer) {
                                                deferred.resolve();
                                                params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                                params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
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
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolver2 = function ($q, $location, $route, accountService, subAccountService, campaignSelectModel, strategySelectModel, advertiserModel,
                                               brandsModel, vistoconfig) {
                var deferred = $q.defer();

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            // if not leafnode i.e having subaccount then fetch subaccount
                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            accountService
                                                .fetchAccountData($route.current.params.accountId)
                                                .then(function () {
                                                    fetchCampaignStrategy(
                                                        $route, $location, advertiserModel, brandsModel, vistoconfig, campaignSelectModel, strategySelectModel, deferred
                                                    );
                                                }, function () {
                                                    deferred.reject('Client data not found');
                                                });
                                        } else {
                                            console.log('sub account not allowed');
                                            $location.url('/tmp');
                                        }
                                    });
                            } else {
                                // if it's a leaf node i.e not haveing subaccount
                                accountService
                                    .fetchAccountData($route.current.params.accountId)
                                    .then(function () {
                                        fetchCampaignStrategy($route, $location, advertiserModel, brandsModel, vistoconfig, campaignSelectModel, strategySelectModel, deferred);
                                    }, function () {
                                        deferred.reject('Client data not found');
                                    });
                            }

                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            // report header resolver without campaign id - we pick the campaign here
            reportsHeaderResolverWOCampaign = function ($q, $location, $route, accountService, campaignSelectModel) {
                var deferred = $q.defer();

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            accountService
                                .fetchAccountData($route.current.params.accountId)
                                .then(function () {
                                    var params = $route.current.params;

                                    campaignSelectModel
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

                                                $location.url(url);
                                            }

                                            deferred.resolve();
                                        });
                                });
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            reportsHeaderResolverWOCampaign2 = function ($q, $location, $route, accountService, subAccountService, campaignSelectModel) {
                var deferred = $q.defer();

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            fetchAccountDataWithCampaign($route, $location, campaignSelectModel, accountService, deferred);
                                        } else {
                                            console.log('sub account not allowed');
                                            $location.url('/tmp');
                                        }
                                    });
                            } else {
                                fetchAccountDataWithCampaign($route, $location, campaignSelectModel, accountService, deferred);
                            }

                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            scheduleReportListCreateResolver = function ($q, $location, $route, accountService) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount(params.accountId)) {
                            accountService
                                .fetchAccountData($route.current.params.accountId)
                                .then(function () {
                                    deferred.resolve();
                                });
                        } else {
                            console.log('account ' + params.accountId + 'not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            uploadReportsHeaderResolver = function ($q, $location, $route, accountService, campaignSelectModel, advertiserModel, brandsModel, collectiveReportModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            accountService
                                .fetchAccountData($route.current.params.accountId)
                                .then(function () {
                                    collectiveReportModel
                                        .getReportList(params.accountId, params.advertiserId || -1, params.brandId || -1, params.campaignId || -1)
                                        .then(function (response) {
                                            if (response && response.data.data) {
                                                deferred.resolve(response.data.data);
                                            } else {
                                                deferred.resolve([]);
                                            }

                                            params.campaignId && campaignSelectModel.fetchCampaign(params.accountId, params.campaignId);

                                            !params.campaignId && campaignSelectModel.setSelectedCampaign({
                                                id: -1,
                                                name: 'All Media Plans',
                                                kpi: 'ctr',
                                                startDate: '-1',
                                                endDate: '-1'
                                            });

                                            params.advertiserId && fetchCurrentAdvertiser($location, $route, advertiserModel, vistoconfig);
                                            params.advertiserId && params.brandId && fetchCurrentBrand($location, $route, brandsModel, vistoconfig);
                                        });
                                });
                        } else {
                            console.log('account not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            },

            uploadReportsHeaderResolver2 = function ($q, $location, $route, accountService, subAccountService, campaignSelectModel, advertiserModel, brandsModel,
                                                     collectiveReportModel, vistoconfig) {
                var deferred = $q.defer(),
                    params = $route.current.params;

                accountService
                    .fetchAccountList()
                    .then(function () {
                        var isLeafNode;

                        if (accountService.allowedAccount($route.current.params.accountId)) {
                            isLeafNode = accountService.getSelectedAccount().isLeafNode;

                            if (!isLeafNode) {
                                subAccountService
                                    .fetchSubAccountList($route.current.params.accountId)
                                    .then(function () {
                                        if (subAccountService.allowedSubAccount($route.current.params.subAccountId)) {
                                            accountDataWithReportList($location, $route, accountService, collectiveReportModel,
                                                advertiserModel, brandsModel, campaignSelectModel, vistoconfig, deferred);
                                        } else {
                                            console.log('sub account ' + params.accountId + 'not allowed');
                                            $location.url('/tmp');
                                        }
                                    });
                            } else {
                                accountDataWithReportList($location, $route, accountService, collectiveReportModel,
                                    advertiserModel, brandsModel, campaignSelectModel, vistoconfig, deferred);
                            }
                        } else {
                            console.log('account ' + params.accountId + ' not allowed');
                            $location.url('/tmp');
                        }
                    });

                return deferred.promise;
            };

        return {
            accountDataWithReportList: accountDataWithReportList,
            adsResolver: adsResolver,
            adminHeaderResolver: adminHeaderResolver,
            creativeListResolver: creativeListResolver,
            creativePreviewResolver: creativePreviewResolver,
            creativeResolver: creativeResolver,
            dashboardHeaderResolver: dashboardHeaderResolver,
            dashboardHeaderResolver2: dashboardHeaderResolver2,
            fetchAccountData: fetchAccountData,
            fetchAccountDataSetWSInfo: fetchAccountDataSetWSInfo,
            fetchAccountDataWithCampaign: fetchAccountDataWithCampaign,
            fetchAdvertiserAndBrand: fetchAdvertiserAndBrand,
            fetchCampaignStrategy: fetchCampaignStrategy,
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
