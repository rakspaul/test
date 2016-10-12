define(['angularAMD'],
    function (angularAMD) {
        angularAMD.factory('urlBuilder', ['$location', '$routeParams', 'accountService', 'subAccountService', 'campaignSelectModel',
            function ($location, $routeParams, accountService, subAccountService, campaignSelectModel) {
                var buildBaseUrl = function (accountId, subAccountId, advertiserId, brandId) {
                        // this method can be used for building base url which can be used everywhere
                        var url, selectedAccount;

                        accountId = accountId || $routeParams.accountId;
                        subAccountId = subAccountId || $routeParams.subAccountId;
                        advertiserId = advertiserId || $routeParams.advertiserId;
                        brandId = brandId >= -1 ? brandId : $routeParams.brandId;

                        url = '/a/' + accountId;

                        if (subAccountId) {
                            url += '/sa/' + subAccountId;
                        } else {
                            // user navigating from custom reports to media plans
                            selectedAccount = _.find(accountService.getAccounts(), function (a) {
                                return Number(a.id) === Number(accountId);
                            });

                            if (!selectedAccount.isLeafNode) {
                                url += '/sa/' + accountId;
                            }
                        }

                        // All Advertisers id is -1 and don't show it in the URL
                        if (advertiserId > 0) {
                            url += '/adv/' + advertiserId;

                            if (brandId >= 0) {
                                url += '/b/' + brandId;
                            }
                        }

                        return url;
                    },

                // this method returns the url if fromView is true, and changes the current location if fromView is false
                    mediaPlansListUrl = function (accountId) {
                        var url,
                            leafSubAccount,
                            selectedAccount,
                            subAccounts;

                        accountId = $routeParams.accountId || accountId;

                        url = '/a/' + accountId;

                        if ($routeParams.subAccountId) {
                            leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                                return Number(a.id) === Number($routeParams.subAccountId);
                            });

                            if (leafSubAccount) {
                                url += '/sa/' + $routeParams.subAccountId;

                                if ($routeParams.advertiserId > 0) {
                                    url += '/adv/' + $routeParams.advertiserId;

                                    if ($routeParams.brandId >= 0) {
                                        url += '/b/' + $routeParams.brandId;
                                    }
                                }
                            } else {
                                subAccounts = subAccountService.getSubAccounts();
                                url += '/sa/' + (subAccounts.length ? subAccounts[0].id : accountId);

                                if ($routeParams.advertiserId > 0) {
                                    url += '/adv/' + $routeParams.advertiserId;

                                    if ($routeParams.brandId >= 0) {
                                        url += '/b/' + $routeParams.brandId;
                                    }
                                }
                            }

                            url += '/mediaplans';
                            $location.url(url);

                        } else {
                            // user navigating from custom reports to media plans
                            selectedAccount = _.find(accountService.getAccounts(), function (a) {
                                return Number(a.id) === Number(accountId);
                            });

                            if (selectedAccount && selectedAccount.isLeafNode) {
                                if ($routeParams.advertiserId > 0) {
                                    url += '/adv/' + $routeParams.advertiserId;

                                    if ($routeParams.brandId >= 0) {
                                        url += '/b/' + $routeParams.brandId;
                                    }
                                }

                                url += '/mediaplans';

                                $location.url(url);
                            } else {
                                subAccountService
                                    .fetchSubAccountList(accountId)
                                    .then(function () {
                                        console.log('$routeParams.accountId = ', accountId);
                                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;

                                        if ($routeParams.advertiserId > 0) {
                                            url += '/adv/' + $routeParams.advertiserId;

                                            if ($routeParams.brandId >= 0) {
                                                url += '/b/' + $routeParams.brandId;
                                            }
                                        }

                                        url += '/mediaplans';
                                        $location.url(url);
                                    });

                            }
                        }
                    },

                    mediaPlanOverviewUrl = function (campaignId, accountId, subAccountId) {
                        var url;

                        accountId = accountId || $routeParams.accountId;
                        subAccountId = subAccountId || $routeParams.subAccountId;

                        url = this.buildBaseUrl(accountId, subAccountId, -1);

                        if (campaignId) {
                            url += '/mediaplan/' + campaignId;
                        }

                        url += '/overview';

                        return url;
                    },

                    mediaPlanCreateUrl = function () {
                        var url = this.buildBaseUrl($routeParams.accountId, $routeParams.subAccountId, -1, -1);

                        url += '/mediaplan/create';

                        $location.url(url);
                    },

                    reportOverCampaignUrl = function (url, subAccountId) {
                        var selectedCampaign = campaignSelectModel.getSelectedCampaign();

                        // All Advertisers id is -1 and don't show it in the URL
                        if ($routeParams.advertiserId > 0) {
                            url += '/adv/' + $routeParams.advertiserId;

                            if ($routeParams.brandId >= 0) {
                                url += '/b/' + $routeParams.brandId;
                            }
                        }

                        // Attach campaign
                        if ($routeParams.campaignId) {
                            url += '/mediaplans/' + $routeParams.campaignId + '/overview';
                            $location.url(url);
                        } else if (selectedCampaign.length) {
                            url += '/mediaplans/' + selectedCampaign.id + '/overview';
                            $location.url(url);
                        } else {
                            //you should redirect to mediaplan list
                            campaignSelectModel
                                .fetchCampaigns(subAccountId || $routeParams.accountId, $routeParams.advertiserId, $routeParams.brandId)
                                .then(function (response) {
                                    var campaignArr = response.data.data,
                                        campaignId;

                                    if (campaignArr && campaignArr.length > 0 && campaignArr[0].campaign_id) {
                                        campaignId = campaignArr[0].campaign_id;

                                        //set first campaign as selected campaign
                                        campaignSelectModel.setSelectedCampaign(campaignArr[0]);
                                        url += '/mediaplans/' + campaignId + '/overview';
                                        $location.url(url);
                                    } else {
                                        console.log('No campaings for the account');
                                    }
                                });
                        }
                    },

                    reportsOverviewUrl = function () {
                        //Attach account
                        var url = '/a/' + $routeParams.accountId,
                            acccountData = accountService.getSelectedAccount();

                        //Attach subaccount if not a leaf node
                        if (!acccountData.isLeafNode) {
                            if ($routeParams.subAccountId && ($routeParams.subAccountId !== $routeParams.accountId)) {
                                url += '/sa/' + $routeParams.subAccountId;
                                reportOverCampaignUrl(url, $routeParams.subAccountId);
                            } else {
                                if (subAccountService.getSubAccounts().length && (subAccountService.getSubAccounts()[0].id !== $routeParams.accountId)) {
                                    url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                                    reportOverCampaignUrl(url, subAccountService.getSubAccounts()[0].id);
                                } else {
                                    subAccountService
                                        .fetchSubAccountList($routeParams.accountId)
                                        .then(function () {
                                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                                            reportOverCampaignUrl(url, subAccountService.getSubAccounts()[0].id);
                                        });
                                }
                            }
                        } else {
                            reportOverCampaignUrl(url);
                        }

                    },

                    cannedReportsUrl = function (reportName) {
                        console.log('cannedReportsUrl(), $routeParams.accountId = ', $routeParams);
                        var url = '/a/' + $routeParams.accountId,
                            leafSubAccount,
                            selectedAccount,
                            subAccounts;

                        if ($routeParams.subAccountId) {
                            leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                                return Number(a.id) === Number($routeParams.subAccountId);
                            });

                            if (leafSubAccount) {
                                url += '/sa/' + $routeParams.subAccountId;
                            } else {
                                subAccounts = subAccountService.getSubAccounts();
                                url += '/sa/' + (subAccounts.length ? subAccounts[0].id : $routeParams.accountId);
                            }

                            if ($routeParams.advertiserId > 0) {
                                url += '/adv/' + $routeParams.advertiserId;
                                url += '/b/' + ($routeParams.brandId || 0);
                            }

                            url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                            $location.url(url);
                        } else {
                            // user navigating from custom reports to canned reports
                            selectedAccount = _.find(accountService.getAccounts(), function (a) {
                                return Number(a.id) === Number($routeParams.accountId);
                            });

                            if (selectedAccount && selectedAccount.isLeafNode) {
                                if ($routeParams.advertiserId > 0) {
                                    url += '/adv/' + $routeParams.advertiserId;
                                    url += '/b/' + ($routeParams.brandId || 0);
                                }

                                url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                                $location.url(url);
                            } else {
                                subAccountService
                                    .fetchSubAccountList($routeParams.accountId)
                                    .then(function () {
                                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;

                                        if ($routeParams.advertiserId > 0) {
                                            url += '/adv/' + $routeParams.advertiserId;
                                            url += '/b/' + ($routeParams.brandId || 0);
                                        }

                                        url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                                        $location.url(url);
                                    });
                            }
                        }
                    },

                    customReportsUrl = function () {
                        return '/a/' + $routeParams.accountId + '/customreport';
                    },

                    customReportsListUrl = function () {
                        var url = '/a/' + $routeParams.accountId + '/reports/schedules';

                        $location.url(url);
                    },

                    collectiveInsightsUrl = function () {
                        var url = this.buildBaseUrl() + '/reports/list';

                        $location.url(url);
                    },

                    creativeListUrl = function (accountId, subAccountId, advertiserId) {
                        $location.url(this.buildBaseUrl(accountId, subAccountId, advertiserId, -1) + '/creative/list');
                    },

                    adminUrl = function () {
                        var url = '/a/' + $routeParams.accountId;

                        if ($routeParams.subAccountId) {
                            url += '/sa/' + $routeParams.subAccountId;
                        }

                        url += '/admin/accounts';

                        $location.url(url);
                    },

                    invoiceTool = function () {
                        $location.url(this.buildBaseUrl() + '/v1sto/invoices');
                    },

                    gotoInvoiceReport = function (invoiceId) {
                        var url = '/a/' + $routeParams.accountId;

                        if ($routeParams.subAccountId) {
                            url += '/sa/' + $routeParams.subAccountId;
                        }

                        url += '/v1sto/invoices/' + invoiceId;
                        $location.url(url);
                    },

                    gotoCreativeUrl = function () {
                        var url = this.buildBaseUrl() + '/creative/add';

                        $location.url(url);
                    },

                    uploadReportsUrl = function () {
                        var url,
                            leafSubAccount;

                        url = '/a/' + $routeParams.accountId;

                        if ($routeParams.subAccountId) {
                            leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                                return Number(a.id) === Number($routeParams.subAccountId);
                            });

                            if (leafSubAccount) {
                                url += '/sa/' + $routeParams.subAccountId;

                                // All Advertisers id is -1 and don't show it in the URL
                                ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
                            } else {
                                url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                            }
                        }

                        url += '/reports/upload';

                        return url;
                    },

                    uploadReportsListUrl = function () {
                        return this.buildBaseUrl() + '/reports/list';
                    },

                    goToPreviewUrl = function (obj) {
                        var url = '/a/' + $routeParams.accountId,
                            hasSubaccount = accountService.getSelectedAccount().isLeafNode;

                        if (!hasSubaccount) {
                            url += '/sa/' + $routeParams.subAccountId;
                        }

                        url += '/adv/' + obj.advertiserId;
                        url += '/creative/';
                        url += $routeParams.creativeId ? $routeParams.creativeId : -1;
                        url += '/preview';

                        return url;
                    },

                    goToCreativeList = function (obj) {
                        var url = '/a/' + obj.clientId;

                        url += obj.subAccountId ? '/sa/' + obj.subAccountId : '';
                        url += obj.advertiserId ? '/adv/' + obj.advertiserId : '';
                        url += obj.creativeId ? '/creative/' + obj.creativeId : '';

                        return url;
                    },

                    vendorConfigUrl = function () {
                        return '/a/' + $routeParams.accountId + '/sa/' + $routeParams.accountId + '/vendor/create';
                    },

                    adUrl = function (params) {
                        var campaignId = params.campaignId || $routeParams.campaignId,
                            url = '/a/' + $routeParams.accountId,
                            selectedAccount;

                        if ($routeParams.subAccountId) {
                            url += '/sa/' + $routeParams.subAccountId;
                        } else {
                            // user navigating from custom reports to media plans
                            selectedAccount = _.find(accountService.getAccounts(), function (a) {
                                return Number(a.id) === Number($routeParams.accountId);
                            });

                            if (!selectedAccount.isLeafNode) {
                                url += '/sa/' + $routeParams.accountId;
                            }
                        }

                        if (params.advertiserId > 0) {
                            url += '/adv/' + params.advertiserId;
                        }

                        if (campaignId) {
                            url += '/mediaplan/' + campaignId;
                        }

                        if (params.lineItemId) {
                            url += '/lineItem/' + params.lineItemId;
                        }

                        if (params.adGroupId) {
                            url += '/adGroup/' + params.adGroupId;
                        }

                        url += '/ads';

                        if (params.adId) {
                            url += '/' + params.adId + '/edit';
                        } else {
                            url += '/create';
                        }

                        return url;
                    };

                return {
                    buildBaseUrl: buildBaseUrl,
                    mediaPlansListUrl: mediaPlansListUrl,
                    mediaPlanCreateUrl: mediaPlanCreateUrl,
                    cannedReportsUrl: cannedReportsUrl,
                    customReportsUrl: customReportsUrl,
                    customReportsListUrl: customReportsListUrl,
                    creativeListUrl: creativeListUrl,
                    uploadReportsUrl: uploadReportsUrl,
                    uploadReportsListUrl: uploadReportsListUrl,
                    mediaPlanOverviewUrl: mediaPlanOverviewUrl,
                    adUrl: adUrl,
                    gotoCreativeUrl: gotoCreativeUrl,
                    adminUrl: adminUrl,
                    invoiceTool: invoiceTool,
                    goToPreviewUrl: goToPreviewUrl,
                    gotoInvoiceReport: gotoInvoiceReport,
                    goToCreativeList: goToCreativeList,
                    reportsOverviewUrl: reportsOverviewUrl,
                    collectiveInsightsUrl: collectiveInsightsUrl,
                    vendorConfigUrl: vendorConfigUrl
                };
            }
        ]);
    }
);
