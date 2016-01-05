(function () {
    'use strict';
    var loginModel = function ($cookieStore, $location, constants, $http) {
        var data = {};
        data.user_id = undefined;
        data.user_name = '';
        data.is_workflow_user = true;//set the cookie value -->hardcoded
        data.auth_token = undefined;
        data.expiry_secs = undefined;
        data.login_name = undefined;
        data.agency_id = undefined;

        var updateRedirectUrl = function (value) {
            $cookieStore.put(constants.COOKIE_REDIRECT, value);
        };

        return {
            deleteData: function () {
                data = {};
                data.is_workflow_user = false;
            },

            getUserRole: function () {
                return constants.ROLE_MARKETER;
            },

            setSelectedClient: function (data) {
                localStorage.setItem('selectedClient', JSON.stringify(data));
            },

            getSelectedClient: function () {
                return localStorage.getItem('selectedClient') && JSON.parse(localStorage.getItem('selectedClient'));
            },

            setClientData: function (data) {
                localStorage.setItem('clientData', JSON.stringify(data));
            },

            getClientData: function () {
                localStorage.getItem('clientData');
            },

            setUser: function (user) {
                data = user;

                var time = moment().add(user.expiry_secs, 'seconds'),
                    expiryTime = new Date(time);
                document.cookie = 'cdesk_session=' + JSON.stringify(user) + ';expires=' + expiryTime.toGMTString() + ';path=/';

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
                return true;//for now until we define cost transparencies.  Sriram. Dec 28th.
                if (data.is_network_user) {
                    data.cost_transparency = true;
                }
                if (data.cost_transparency) {
                    return data.cost_transparency;
                } else if ($cookieStore.get('cdesk_session')) {
                    data.cost_transparency = $cookieStore.get('cdesk_session').cost_transparency;
                    return $cookieStore.get('cdesk_session').cost_transparency;
                }
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

            getAuthToken: function () {
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
                    return $cookieStore.get('cdesk_session').network_tz
                }
                return 'America/New_York';
            },

            checkCookieExpiry: function () {
                if (!$cookieStore.get('cdesk_session')) {
                    localStorage.clear();
                    if ($location.$$path !== '/login') {
                        updateRedirectUrl($location.$$path);
                    }
                    $location.url('/login');
                }
            },

            logout: function () {
                $cookieStore.remove('cdesk_session');
                $http.defaults.headers.common.Authorization = '';
                localStorage.clear();
                this.deleteData();
                $location.url('/login');
            },

            unauthorized: function () {
                $cookieStore.remove('cdesk_session');
                localStorage.clear();
                if ($location.$$path !== '/login') {
                    updateRedirectUrl($location.$$path);
                }
                $location.url('/login');
            },

            forbidden: function () {
                //$location.url('/campaigns');
            }

        } //return

    }; //loginModel
    angObj.service('loginModel', ['$cookieStore', '$location', 'constants', '$http', loginModel]);

}());