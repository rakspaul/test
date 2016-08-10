define(['angularAMD', 'common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('routeResolversParams', function ($q, $location, $route, accountService, subAccountService, campaignSelectModel, strategySelectModel, advertiserModel,
    brandsModel, vistoconfig) {
        return {
            $q: $q,
            $location: $location,
            $route: $route,
            accountService: accountService,
            subAccountService: subAccountService,
            campaignSelectModel: campaignSelectModel,
            strategySelectModel: strategySelectModel,
            advertiserModel: advertiserModel,
            brandModel: brandsModel,
            vistoconfig: vistoconfig
        };
    });
});