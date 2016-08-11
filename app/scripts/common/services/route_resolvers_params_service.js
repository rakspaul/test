define(['angularAMD', 'common/services/vistoconfig_service'], function (angularAMD) {
    angularAMD.service('routeResolversParams', function ($q, $location, $route, accountService, subAccountService, campaignSelectModel, strategySelectModel, advertiserModel,
                                                         brandsModel, vistoconfig, collectiveReportModel, loginModel, workflowService, constants) {
        return {
            $q: $q,
            $location: $location,
            $route: $route,
            accountService: accountService,
            subAccountService: subAccountService,
            campaignSelectModel: campaignSelectModel,
            strategySelectModel: strategySelectModel,
            advertiserModel: advertiserModel,
            brandsModel: brandsModel,
            vistoconfig: vistoconfig,
            collectiveReportModel: collectiveReportModel,
            loginModel: loginModel,
            workflowService: workflowService,
            constants: constants
        };
    });
});