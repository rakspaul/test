define(['angularAMD'],
    function (angularAMD) {
        angularAMD.factory('urlBuilder', function ($location, $routeParams, accountService, subAccountService) {

            var dashboardUrl = function() {
                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {

                    url += '/sa/' + $routeParams.subAccountId;

                } else {
                    // user navigating from custom reports to media plans
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.accountId);
                    });
                    if (!selectedAccount.isLeafNode) {
                        url += '/sa/' + $routeParams.accountId;
                    }

                }

                url += '/dashboard';

                return url;
            },

            // this method changes the current location instead of returning the url
            gotoMediaplansListUrl  = function() {
                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {

                    var leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.subAccountId);
                    });

                    if (leafSubAccount) {

                        url += '/sa/' + $routeParams.subAccountId;
                        if($routeParams.advertiserId > 0) {
                            url += '/adv/' + $routeParams.advertiserId;
                            if($routeParams.brandId >= 0) {
                                url += '/b/' + $routeParams.brandId;
                            }
                        }

                    } else {

                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;

                    }
                    url += '/mediaplans';
                    $location.url(url);

                } else {
                    // user navigating from custom reports to media plans
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.accountId);
                    });

                    if (selectedAccount && selectedAccount.isLeafNode) {
                        url += '/mediaplans';
                        $location.url(url);
                    } else {
                        subAccountService.fetchSubAccountList($routeParams.accountId).then(function() {
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                            url += '/mediaplans';
                            $location.url(url);
                        });
                    }
                }
            },

            mediaPlanCreateUrl = function() {
                var url = '/a/' + $routeParams.accountId;
                if ($routeParams.subAccountId) {

                    url += '/sa/' + $routeParams.subAccountId;

                } else {
                    // user navigating from custom reports to media plans
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return a.id === $routeParams.accountId;
                    });
                    if (selectedAccount && !selectedAccount.isLeafNode) {
                        url += '/sa/' + $routeParams.accountId;
                    }

                }
                url += '/mediaplan/create';
                $location.url(url);
            },

            gotoCannedReportsUrl =  function(reportName) {
                var url = '/a/' + $routeParams.accountId;
                if ($routeParams.subAccountId) { console.log('am in if',$routeParams);
                    var leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.subAccountId);
                    });
                    if (leafSubAccount) {
                        url += '/sa/' + $routeParams.subAccountId;
                    } else {
                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                    }
                    url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                    $location.url(url);

                } else {
                    // user navigating from custom reports to canned reports
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.accountId);
                    });
                    if (selectedAccount && selectedAccount.isLeafNode) {
                       // url += '/mediaplans/' + ($routeParams.campaignId || 'reports') + reportName;
                        url += '/mediaplans/reports' + reportName;
                        $location.url(url);

                    } else {
                        subAccountService.fetchSubAccountList($routeParams.accountId).then(function() {
                            url += '/sa/' + subAccountService.getSubAccounts()[0].id;
                            url += '/mediaplans/reports' + reportName;
                            $location.url(url);
                        });
                    }
                }
            },

            customReportsUrl = function() {

                var url = '/a/' + $routeParams.accountId;
                url += '/customreport';
                return url;

            },

            customReportsListUrl = function() {
                var url = '/a/' + $routeParams.accountId;
                url += '/reports/schedules';
                return url;
            },

            gotoCreativeListUrl =  function() {
                var url = '/a/' + $routeParams.accountId;

                url += '/creative/list';
                $location.url(url);
            },

            gotoAdminUrl = function(){
                var url = '/a/' + $routeParams.accountId + '/admin/accounts';
                $location.url(url);
            },

            gotoInvoiceTool = function(){
                var url;

                url = '/a/' + $routeParams.accountId;
                if ($routeParams.subAccountId) {
                    url += '/sa/' + $routeParams.subAccountId;
                }
                url += '/v1sto/invoices';
                $location.url(url);
            },

            gotoInvoiceReport = function(invoiceId){
                var url;

                url = '/a/' + $routeParams.accountId;
                if ($routeParams.subAccountId) {
                    url += '/sa/' + $routeParams.subAccountId;
                }
                url += '/v1sto/invoices/'+invoiceId;
                $location.url(url);
            },

            gotoCreativeUrl  = function() {
                var url = '/a/' + $routeParams.accountId;
                url += '/creative/add';
                $location.url(url);
            },

            uploadReportsUrl = function() {

                var url,
                    leafSubAccount;

                url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {

                    leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
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

            uploadReportsListUrl = function() {

                var url,
                    leafSubAccount;

                url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {
                    leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.subAccountId);
                    });

                    if (leafSubAccount) {

                        url += '/sa/' + $routeParams.subAccountId;
                        // All Advertisers id is -1 and don't show it in the URL

                        if($routeParams.advertiserId > 0) {
                            url += '/adv/' + $routeParams.advertiserId;
                            if($routeParams.brandId >= 0) {
                                url += '/b/' + $routeParams.brandId;
                            }
                        }

                    } else {

                        url += '/sa/' + subAccountService.getSubAccounts()[0].id;

                    }
                }

                url += '/reports/list';
                return url;
            },

            mediaPlanOverviewUrl = function(campaignId) {
                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {

                    url += '/sa/' + $routeParams.subAccountId;

                } else {
                    // user navigating from custom reports to media plans
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.accountId);
                    });
                    if (!selectedAccount.isLeafNode) {
                        url += '/sa/' + $routeParams.accountId;
                    }
                }

                if(campaignId) {
                    url += '/mediaplan/' + campaignId;
                }

                url += '/overview';

                return url;
            },

            adUrl = function(params) {

                var url = '/a/' + $routeParams.accountId;

                if ($routeParams.subAccountId) {

                    url += '/sa/' + $routeParams.subAccountId;

                } else {
                    // user navigating from custom reports to media plans
                    var selectedAccount = _.find(accountService.getAccounts(), function(a) {
                        return Number(a.id) === Number($routeParams.accountId);
                    });
                    if (!selectedAccount.isLeafNode) {
                        url += '/sa/' + $routeParams.accountId;
                    }

                }

                if(params.advertiserId > 0) {
                    url += '/adv/' + params.advertiserId;
                }

                url += '/mediaplan/' + $routeParams.campaignId +
                    '/lineItem/' + params.lineItemId +
                    '/adGroup/' + params.adGroupId +
                    '/ads';

                if(params.adId) {
                    url += '/' + params.adId + '/edit';
                } else {
                    url +='/create';
                }

                return url;

            };

            return {
                dashboardUrl : dashboardUrl,
                gotoMediaplansListUrl : gotoMediaplansListUrl,
                mediaPlanCreateUrl : mediaPlanCreateUrl,
                gotoCannedReportsUrl : gotoCannedReportsUrl,
                customReportsUrl : customReportsUrl,
                customReportsListUrl : customReportsListUrl,
                gotoCreativeListUrl : gotoCreativeListUrl,
                uploadReportsUrl : uploadReportsUrl,
                uploadReportsListUrl : uploadReportsListUrl,
                mediaPlanOverviewUrl : mediaPlanOverviewUrl,
                adUrl : adUrl,
                gotoCreativeUrl : gotoCreativeUrl,
                gotoAdminUrl: gotoAdminUrl,
                gotoInvoiceTool: gotoInvoiceTool,
                gotoInvoiceReport: gotoInvoiceReport
            };
        });
    });
