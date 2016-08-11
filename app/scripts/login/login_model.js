define(['angularAMD', 'common/services/constants_service'], function (angularAMD) {
    angularAMD.service('loginModel', function ($cookieStore, $location, $http, constants) {
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
                    $cookieStore.put(constants.COOKIE_REDIRECT, redirectPath);
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
                $cookieStore.put('cdesk_session', user);

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
                } else if ($cookieStore.get('cdesk_session')) {
                    data.cost_transparency = $cookieStore.get('cdesk_session').cost_transparency;
                    return $cookieStore.get('cdesk_session').cost_transparency;
                }*/
            },

            getLoginName: function () {
                if (data.login_name) {
                    return data.login_name;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.login_name = $cookieStore.get('cdesk_session').login_name;
                    return $cookieStore.get('cdesk_session').login_name;
                }
            },

            getUserId: function () {
                if (data.user_id) {
                    return data.user_id;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.user_id = $cookieStore.get('cdesk_session').user_id;
                    return $cookieStore.get('cdesk_session').user_id;
                }
            },

            getAgencyId: function () {
                if (data.agency_id) {
                    return data.agency_id;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.agency_id = $cookieStore.get('cdesk_session').agency_id;
                    return $cookieStore.get('cdesk_session').agency_id;
                }
            },

            getUserName: function () {
                if (data.user_name) {
                    return data.user_name;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.user_name = $cookieStore.get('cdesk_session').user_name;
                    return $cookieStore.get('cdesk_session').user_name;
                }
            },

            getExpirySecs: function () {
                if (data.expiry_secs) {
                    return data.expiry_secs;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.expiry_secs = $cookieStore.get('cdesk_session').expiry_secs;
                    return $cookieStore.get('cdesk_session').expiry_secs;
                }
            },

            getauth_token: function () {
                if ($cookieStore.get('cdesk_session')) {
                    data.auth_token = $cookieStore.get('cdesk_session').auth_token;
                    return $cookieStore.get('cdesk_session').auth_token;
                }
            },

            cookieExists: function () {
                return ($cookieStore.get('cdesk_session')) ? true : false;
            },

            networkTimezone: function () {
                if ($cookieStore.get('cdesk_session')) {
                    data.network_tz = $cookieStore.get('cdesk_session').network_tz;

                    return $cookieStore.get('cdesk_session').network_tz;
                }

                return 'America/New_York';
            },

            checkCookieExpiry: function () {

                if (!$cookieStore.get('cdesk_session')) {
                    localStorage.clear();
                    updateRedirectUrl($location.$$path);
                    $location.url('/login');

                    // remove header bar on login page
                    $('.main_navigation_holder').hide();
                }
            },

            logout: function () {
                $cookieStore.remove('cdesk_session');
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
    });
});
