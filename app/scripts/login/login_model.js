define(['angularAMD'], function (angularAMD) {
    angularAMD.service('loginModel', ['$cookies', '$location', '$http', 'constants', function ($cookies, $location, $http, constants) {
        var data = {
                user_id: undefined,
                user_name: '',

                // set the cookie value -->hardcoded
                is_workflow_user: true,

                auth_token: undefined,
                expiry_secs: undefined,
                login_name: undefined,
                agency_id: undefined
            },

            updateRedirectUrl = function (redirectPath) {
                if (['/', '/login'].indexOf(redirectPath) === -1) {
                    $cookies.put(constants.COOKIE_REDIRECT, redirectPath, {path: '/'});
                }
            };

        return {
            deleteData: function () {
                data = {};
                data.is_workflow_user = false;
            },

            getUserRole: function () {
                return constants.ROLE_MARKETER;
            },

            setMasterClient: function (data) {
                localStorage.setItem('masterClient', JSON.stringify(data));
            },

            getMasterClient: function () {
                return localStorage.getItem('masterClient') && JSON.parse(localStorage.getItem('masterClient'));
            },

            setSelectedClient: function (data) {
                localStorage.setItem('selectedClient', JSON.stringify(data));
            },

            getDashboardClient: function() {
                return localStorage.getItem('dashboardClient') && JSON.parse(localStorage.getItem('dashboardClient'));
            },

            setMasterAndClient: function(masterId, masterName, isLeafNode, clientId, clientName) {
                localStorage.setItem('masterClient', JSON.stringify({
                    id: masterId,
                    name: masterName,
                    isLeafNode: isLeafNode
                }));

                if (isLeafNode) {
                    localStorage.setItem('selectedClient', JSON.stringify({
                        id: masterId,
                        name: masterName
                    }));
                } else {
                    localStorage.setItem('selectedClient', JSON.stringify({
                        id: clientId,
                        name: clientName
                    }));
                }
            },

            setClientData: function (data) {
                localStorage.setItem('clientData', JSON.stringify(data));
            },

            getClientData: function () {
                return JSON.parse(localStorage.getItem('clientData'));
            },

            setUser: function (user) {
                data = user;
                $cookies.put('cdesk_session', JSON.stringify(user), {path: '/'});

                // campaignDetails object is required for reports tab.
                localStorage.setItem('selectedCampaign', JSON.stringify({
                        id: '-1',
                        name: 'Loading ...',
                        startDate: '-1',
                        endDate: '-1',
                        kpi: 'ctr'
                    })
                );

                localStorage.setItem('selectedKpi', 'ctr');
                localStorage.setItem('isNavigationFromCampaigns', 'false');
            },

            getIsAgencyCostModelTransparent: function () {
                // TODO: for now until we define cost transparencies.  Sriram. Dec 28th.
                return true;

                // TODO (Lalding): Commenting out the following code because of the temp. return statement above.
                /*if (data.is_network_user) {
                 data.cost_transparency = true;
                 }

                 if (data.cost_transparency) {
                 return data.cost_transparency;
                 } else if ($cookies.get('cdesk_session')) {
                 data.cost_transparency = $cookies.get('cdesk_session').cost_transparency;
                 return $cookies.get('cdesk_session').cost_transparency;
                 }*/
            },

            getLoginName: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.login_name && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.login_name = cdeskSession.login_name;
                }

                return data.login_name;
            },

            getUserId: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.user_id && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.user_id = cdeskSession.user_id;
                }

                return data.user_id;
            },

            getAgencyId: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.agency_id && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.agency_id = cdeskSession.agency_id;
                }

                return data.agency_id;
            },

            getUserName: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.user_name && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.user_name = cdeskSession.user_name;
                }

                return data.user_name;
            },

            getExpirySecs: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.expiry_secs && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.expiry_secs = cdeskSession.expiry_secs;
                }

                return data.expiry_secs;
            },

            getAuthToken: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.auth_token = cdeskSession.auth_token;

                    return data.auth_token;
                }
            },

            cookieExists: function () {
                return ($cookies.get('cdesk_session')) ? true : false;
            },

            checkCookieExpiry: function () {
                if (!$cookies.get('cdesk_session')) {
                    localStorage.clear();
                    updateRedirectUrl($location.$$path);

                    $location.url('/login');

                    // remove header bar on login page
                    $('.main_navigation_holder').hide();
                }
            },

            logout: function () {
                // Remove cdesk_session cookie. NOTE: Cookie's path should be '/', but just in case it is not, do a second delete with generic path
                $cookies.remove('cdesk_session', {path: '/'});
                $cookies.remove('cdesk_session');

                $http.defaults.headers.common.Authorization = '';
                localStorage.clear();
                this.deleteData();
                $location.url('/login');

                // remove header bar on login page
                $('.main_navigation_holder').hide();
            },

            unauthorized: function () {
                this.logout();
            },

            forbidden: function () {
                $location.url('/mediaplans');
            }
        };
    }]);
});
