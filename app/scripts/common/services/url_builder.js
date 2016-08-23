define(['angularAMD'],
    function (angularAMD) {
        angularAMD.factory('urlBuilder', function ($location, $routeParams, accountService, subAccountService) {

            var dashboardUrl = function () {
                    var url = '/a/' + $routeParams.accountId,
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

                    url += '/dashboard';

                    return url;
                },

                // this method returns the url if fromView is true, and changes the current location if fromView is false
                mediaPlansListUrl  = function (fromView) {
                    var url = '/a/' + $routeParams.accountId,
                        leafSubAccount,
                        selectedAccount;

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
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }

                        url += '/mediaplans';
                    } else {
                        // user navigating from custom reports to media plans
                        selectedAccount = _.find(accountService.getAccounts(), function (a) {
                            return Number(a.id) === Number($routeParams.accountId);
                        });

                        if (selectedAccount && selectedAccount.isLeafNode) {
                            url += '/mediaplans';
                        } else {
                            subAccountService
                                .fetchSubAccountList($routeParams.accountId)
                                .then(function () {
                                    console.log('$routeParams.accountId = ', $routeParams.accountId);
                                    url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                                    url += '/mediaplans';
                                });
                        }
                    }

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                mediaPlanOverviewUrl = function (campaignId) {
                    var url = '/a/' + $routeParams.accountId,
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

                    if (campaignId) {
                        url += '/mediaplan/' + campaignId;
                    }

                    url += '/overview';

                    return url;
                },

                mediaPlanCreateUrl = function () {
                    var url = '/a/' + $routeParams.accountId,
                        selectedAccount;

                    if ($routeParams.subAccountId) {
                        url += '/sa/' + $routeParams.subAccountId;
                    } else {
                        // user navigating from custom reports to media plans
                        selectedAccount = _.find(accountService.getAccounts(), function (a) {
                            return a.id === $routeParams.accountId;
                        });

                        if (selectedAccount && !selectedAccount.isLeafNode) {
                            url += '/sa/' + $routeParams.accountId;
                        }
                    }

                    url += '/mediaplan/create';
                    $location.url(url);
                },

                cannedReportsUrl =  function (reportName, fromView) {
                    console.log('cannedReportsUrl(), $routeParams.accountId = ', $routeParams);
                    var url = '/a/' + $routeParams.accountId,
                        leafSubAccount,
                        selectedAccount;

                    if ($routeParams.subAccountId) {
                        leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                            return Number(a.id) === Number($routeParams.subAccountId);
                        });

                        if (leafSubAccount) {
                            url += '/sa/' + $routeParams.subAccountId;
                        } else {
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }

                        url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                    } else {
                        // user navigating from custom reports to canned reports
                        selectedAccount = _.find(accountService.getAccounts(), function (a) {
                            return Number(a.id) === Number($routeParams.accountId);
                        });

                        if (selectedAccount && selectedAccount.isLeafNode) {
                            url += '/mediaplans/reports' + reportName;
                        } else {
                            subAccountService
                                .fetchSubAccountList($routeParams.accountId)
                                .then(function () {
                                    console.log('$routeParams.accountId = ', $routeParams.accountId);
                                    url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                                    console.log('url = ', url);
                                    url += '/mediaplans/reports' + reportName;
                                });
                        }
                    }

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                customReportsUrl = function (fromView) {
                    var url = '/a/' + $routeParams.accountId + '/customreport';

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                customReportsListUrl = function (inputUrl, fromView) {
                    var url = '/a/' + $routeParams.accountId + '/' + inputUrl;

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                creativeListUrl =  function (fromView) {
                    var url = '/a/' + $routeParams.accountId,
                        leafSubAccount;

                    if ($routeParams.subAccountId) {
                        leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                            return Number(a.id) === Number($routeParams.subAccountId);
                        });

                        if (leafSubAccount) {
                            url += '/sa/' + $routeParams.subAccountId;
                        }
                    }

                    if (!$routeParams.subAccountId || !leafSubAccount) {
                        if (subAccountService.getSubAccounts().length) {
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }
                    }

                    url += '/creative/list';

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                adminUrl = function (fromView) {
                    var url = '/a/' + $routeParams.accountId + '/admin/accounts';

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                invoiceTool = function (fromView) {
                    var url = '/a/' + $routeParams.accountId;

                    if ($routeParams.subAccountId) {
                        url += '/sa/' + $routeParams.subAccountId;
                    } else {
                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                    }

                    url += '/v1sto/invoices';

                    if (fromView) {
                        return url;
                    } else {
                        $location.url(url);
                    }
                },

                gotoInvoiceReport = function (invoiceId) {
                    var url;

                    url = '/a/' + $routeParams.accountId;

                    if ($routeParams.subAccountId) {
                        url += '/sa/' + $routeParams.subAccountId;
                    }

                    url += '/v1sto/invoices/'+invoiceId;
                    $location.url(url);
                },

                gotoCreativeUrl  = function () {
                    var url,
                        leafSubAccount;

                    url = '/a/' + $routeParams.accountId;

                    if ($routeParams.subAccountId) {
                        leafSubAccount = _.find(subAccountService.getSubAccounts(), function (a) {
                            return Number(a.id) === Number($routeParams.subAccountId);
                        });

                        if (leafSubAccount) {
                            url += '/sa/' + $routeParams.subAccountId;
                        } else {
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }
                    }

                    url += '/creative/add';
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
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }
                    }

                    url += '/reports/upload';

                    return url;
                },

                uploadReportsListUrl = function () {
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
                            if ($routeParams.advertiserId > 0) {
                                url += '/adv/' + $routeParams.advertiserId;

                                if ($routeParams.brandId >= 0) {
                                    url += '/b/' + $routeParams.brandId;
                                }
                            }
                        } else {
                            console.log('$routeParams.accountId = ', $routeParams.accountId);
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                        }
                    }

                    url += '/reports/list';

                    return url;
                },

                goToPreviewUrl = function (obj) {
                    var url = '/a/'+ obj.clientId;

                    url += obj.subAccountId ? '/sa/' + obj.subAccountId : '';
                    url += obj.advertiserId ? '/adv/' + obj.advertiserId : '';
                    url += obj.creativeId ? '/creative/' + obj.creativeId : '';

                    return url;
                },

                adUrl = function (params) {
                    var url = '/a/' + $routeParams.accountId,
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

                    url += '/mediaplan/' + $routeParams.campaignId +
                        '/lineItem/' + params.lineItemId +
                        '/adGroup/' + params.adGroupId +
                        '/ads';

                    if (params.adId) {
                        url += '/' + params.adId + '/edit';
                    } else {
                        url +='/create';
                    }

                    return url;
                };

            return {
                dashboardUrl : dashboardUrl,
                mediaPlansListUrl : mediaPlansListUrl,
                mediaPlanCreateUrl : mediaPlanCreateUrl,
                cannedReportsUrl : cannedReportsUrl,
                customReportsUrl : customReportsUrl,
                customReportsListUrl : customReportsListUrl,
                creativeListUrl : creativeListUrl,
                uploadReportsUrl : uploadReportsUrl,
                uploadReportsListUrl : uploadReportsListUrl,
                mediaPlanOverviewUrl : mediaPlanOverviewUrl,
                adUrl : adUrl,
                gotoCreativeUrl : gotoCreativeUrl,
                adminUrl: adminUrl,
                invoiceTool: invoiceTool,
                goToPreviewUrl: goToPreviewUrl,
                gotoInvoiceReport: gotoInvoiceReport
            };
        });
    });
