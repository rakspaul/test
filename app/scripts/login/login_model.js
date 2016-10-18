define(['angularAMD'], function (angularAMD) {
    angularAMD.service('loginModel', ['$cookies', '$location', '$http', 'constants', function ($cookies, $location, $http, constants) {
        var data = {
                user_id: undefined,
                user_name: '',

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


            setMasterClient: function (data) {
                localStorage.setItem('masterClient', JSON.stringify(data));
            },


            setSelectedClient: function (data) {
                localStorage.setItem('selectedClient', JSON.stringify(data));
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


            getUserId: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.user_id && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.user_id = cdeskSession.user_id;
                }

                return data.user_id;
            },

            getUserName: function () {
                var cdeskSession = $cookies.get('cdesk_session');

                if (!data.user_name && cdeskSession) {
                    cdeskSession = JSON.parse(cdeskSession);
                    data.user_name = cdeskSession.user_name;
                }

                return data.user_name;
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
                if (!$location.path().endsWith('_tagValidator') && !$cookies.get('cdesk_session')) {
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
