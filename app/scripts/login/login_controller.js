define(['app', 'common-utils'],function (app) {
    'use strict';

    app.controller('loginController', ['$sce', '$window', '$cookies', 'loginService', 'utils', 'constants', 'RoleBasedService', 'loginModel', 'vistoconfig', 'pageLoad',
        function ($sce, $window, $cookies, loginService, utils, constants, RoleBasedService, loginModel, vistoconfig, pageLoad) {
            console.log('LOGIN controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            var vm = this;

            vm.textConstants = constants;
            vm.loadingClass = '';
            vm.loginErrorMsg = undefined;
            vm.loginError = false;
            vm.version = version;
            vm.showMessage = undefined;
            vm.browserMessage = undefined;
            vm.disabledFormFields = undefined;
            vm.copyRights = $sce.trustAsHtml(constants.COPY_RIGHTS);

            vm.SignIn = function() {
                if (vm.username === undefined ||
                    vm.username.trim() === '' ||
                    vm.password === undefined ||
                    vm.password.trim() === '') {
                    vm.loginErrorMsg = constants.USERNAME_OR_PASSWORD_INCORRECT;
                    vm.loginError = true;
                } else {
                    vm.dataLoading = true;
                    vm.resetValidation();
                    vm.loadingClass = 'loading';

                    loginService.loginAction(vm.username, vm.password, function (response) {
                        var user,
                            redirectUrl;

                        if (response.status === 'success') {
                            user = response.data.data;
                            user.login_name = vm.username;
                            loginModel.setClientData(user);
                            loginService.setCredentials(user);
                            RoleBasedService.setUserData(response);

                            redirectUrl = $cookies.get(constants.COOKIE_REDIRECT);

                            if (redirectUrl) {
                                $window.location.href  = redirectUrl;
                                $cookies.remove(constants.COOKIE_REDIRECT, {path: '/'});
                            } else {
                                $window.location.href = '/';
                            }
                        } else {
                            vm.error = response.data.message;
                            vm.loginErrorMsg = response.data.message;
                            vm.password = '';

                            switch (vm.error) {
                                case 'Password invalid':
                                case 'User does not exist':
                                    vm.loginError = true;
                                    break;
                                default:
                                    vm.loginError = true;
                            }

                            vm.loadingClass = '';
                            vm.dataLoading = false;
                        }
                    });
                }
            };

            vm.appendDomain = function() {
                if(vm.username && vm.username.indexOf('@') < 0){
                    vm.username = vm.username + '@collective.com';
                }
            };

            vm.getLoadingClass = function () {
                return vm.loadingClass;
            };

            vm.showLoginError = function () {
                return vm.loginError;
            };

            vm.resetValidation = function () {
                vm.loginError = false;
            };

            vm.getBrowserNameList = function (browsers) {
                var lastCommaIndex,
                    browserNameList = '';

                browserNameList = _.pluck(browsers, 'name').join(',');
                lastCommaIndex = browserNameList.lastIndexOf(',');

                browserNameList = browserNameList.substr(0, lastCommaIndex) + ' or ' +
                    browserNameList.substr(lastCommaIndex + 1);

                return browserNameList + '.';
            };

            vm.checkoutBrowserInfo = function () {
                var browserInfo = utils.detectBrowserInfo(),
                    findData = _.where(vistoconfig.supportedBrowser, {name: browserInfo.browserName}),
                    browserList,
                    findName,
                    findVersion;

                if (findData.length > 0) {
                    findName = findData[0].name;
                    findVersion = findData[0].version;

                    if (browserInfo.majorVersion >= findVersion) {
                        vm.showMessage = false;
                        vm.browserMessage = '';
                        vm.disabledFormFields = false;
                    } else {
                        if (findName === 'Internet Explorer') {
                            vm.showMessage = true;
                            vm.browserMessage = constants.UPGRADE_BROWSER_MESSAGE1.replace(/\{findVersion}/g, findVersion);
                            vm.disabledFormFields = true;
                        } else {
                            vm.showMessage = true;
                            vm.browserMessage = constants.UPGRADE_BROWSER_MESSAGE2.replace(/\{browserName}/g, findName).replace(/\{findVersion}/g, findVersion);
                            vm.disabledFormFields = false;
                        }
                    }
                } else {
                    // unsupported Browser
                    vm.showMessage = true;
                    browserList = vm.getBrowserNameList(vistoconfig.supportedBrowser);
                    vm.browserMessage = constants.UPGRADE_BROWSER_MESSAGE3.replace(/\{browserList}/g, browserList);
                    vm.disabledFormFields = true;
                }
            };

            vm.getSigninClass = function() {
                return vm.disabledFormFields ? 'signin_disabled' : '';
            };


            $(document).ready(function () {

                $(window).resize(function () {
                    reports_login_position();
                });

                function reports_login_position() {
                    var win_height = $(window).height();
                    var min_height = $('.collective_ad_form_holder').height() + $('.collective_ad_form_holder').offset().top + 100;
                    $('.reports_login_box_holder').css('height', win_height);
                    if (win_height <= min_height) {
                        $('.login_copyright_holder').css('position', 'static');
                    } else {
                        $('.login_copyright_holder').css('position', 'absolute');
                    }
                }

                reports_login_position();
            });

        }]);
});
