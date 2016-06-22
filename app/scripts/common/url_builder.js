define(['angularAMD'],
    function (angularAMD) {
        angularAMD.factory('urlBuilder', function ($location, $routeParams, subAccountService) {
            return {
                uploadReportsUrl: function() {
                    var url = "/a/" + $routeParams.accountId;
                    if ($routeParams.subAccountId) {
                        var leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
                            return a.id == $routeParams.subAccountId;
                        });
                        if (leafSubAccount) {
                            url += "/sa/" + $routeParams.subAccountId;
                            // All Advertisers id is -1 and don't show it in the URL
                            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
                        } else {
                            url += "/sa/" + subAccountService.getSubAccounts()[0].id;
                        }
                    }
                    url += '/reports/upload';
                    return url;
                },
                uploadReportsListUrl: function() {
                    var url = "/a/" + $routeParams.accountId;
                    if ($routeParams.subAccountId) {
                        var leafSubAccount = _.find(subAccountService.getSubAccounts(), function(a) {
                            return a.id == $routeParams.subAccountId;
                        });
                        if (leafSubAccount) {
                            url += "/sa/" + $routeParams.subAccountId;
                            // All Advertisers id is -1 and don't show it in the URL
                            ($routeParams.advertiserId > 0) && (url += '/adv/' + $routeParams.advertiserId);
                            ($routeParams.advertiserId > 0 && $routeParams.brandId >= 0) && (url += '/b/' + $routeParams.brandId);
                        } else {
                            url += "/sa/" + subAccountService.getSubAccounts()[0].id;
                        }
                    }
                    url += '/reports/list';
                    return url;
                }

            };
    });
});
