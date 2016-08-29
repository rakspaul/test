define(['angularAMD'], function (angularAMD) {
    angularAMD.service('routeResolversParams', ['$q', '$location', '$route', 'accountService', 'subAccountService', 'campaignSelectModel',
        'strategySelectModel', 'advertiserModel', 'brandsModel', 'vistoconfig', 'collectiveReportModel', 'loginModel', 'workflowService', 'constants',
        'dashboardModel',
        function ($q, $location, $route, accountService, subAccountService, campaignSelectModel, strategySelectModel, advertiserModel,
                                                         brandsModel, vistoconfig, collectiveReportModel, loginModel, workflowService,
                  constants, dashboardModel) {
        return {
            $q: $q,
            $location: $location,
            $route: $route,
            accountService: accountService,
            subAccountService: subAccountService,
            dashboardModel: dashboardModel,
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
    }]);
});
