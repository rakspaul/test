define(['app', 'common-utils'],function (app) {
    'use strict';

    app.controller('loginController', ['$scope', '$sce', '$window', '$cookies', 'loginService', 'utils', 'constants', 'RoleBasedService', 'loginModel', 'vistoconfig', 'pageLoad',
        function ($scope, $sce, $window, $cookies, loginService, utils, constants, RoleBasedService, loginModel, vistoconfig, pageLoad) {
            console.log('LOGIN controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.textConstants = constants;
            $scope.loadingClass = '';
            $scope.loginErrorMsg = undefined;
            $scope.loginError = false;
            $scope.version = version;
            $scope.showMessage = undefined;
            $scope.browserMessage = undefined;
            $scope.disabledFormFields = undefined;
            $scope.copyRights = $sce.trustAsHtml(constants.COPY_RIGHTS);

            $scope.login = function() {
                if ($scope.username === undefined ||
                    $scope.username.trim() === '' ||
                    $scope.password === undefined ||
                    $scope.password.trim() === '') {
                    $scope.loginErrorMsg = constants.USERNAME_OR_PASSWORD_INCORRECT;
                    $scope.loginError = true;
                } else {
                    $scope.dataLoading = true;
                    $scope.resetValidation();
                    $scope.loadingClass = 'loading';

                    loginService.loginAction($scope.username, $scope.password, function (response) {
                        var user,
                            redirectUrl;

                        if (response.status === 'success') {
                            user = response.data.data;
                            user.login_name = $scope.username;
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
                            $scope.error = response.data.message;
                            $scope.loginErrorMsg = response.data.message;
                            $scope.password = '';

                            switch ($scope.error) {
                                case 'Password invalid':
                                case 'User does not exist':
                                    $scope.loginError = true;
                                    break;
                                default:
                                    $scope.loginError = true;
                            }

                            $scope.loadingClass = '';
                            $scope.dataLoading = false;
                        }
                    });
                }
            };

            $scope.appendDomain = function() {
                if($scope.username !== '' && $scope.username.indexOf('@') < 0){
                    $scope.username = $scope.username + '@collective.com';
                }
            };

            $scope.getLoadingClass = function () {
                return $scope.loadingClass;
            };

            $scope.showLoginError = function () {
                return $scope.loginError;
            };

            $scope.resetValidation = function () {
                $scope.loginError = false;
            };

            $scope.getBrowserNameList = function (browsers) {
                var lastCommaIndex,
                    browserNameList = '';

                browserNameList = _.pluck(browsers, 'name').join(',');
                lastCommaIndex = browserNameList.lastIndexOf(',');

                browserNameList = browserNameList.substr(0, lastCommaIndex) + ' or ' +
                    browserNameList.substr(lastCommaIndex + 1);

                return browserNameList + '.';
            };

            $scope.checkoutBrowserInfo = function () {
                var browserInfo = utils.detectBrowserInfo(),
                    findData = _.where(vistoconfig.supportedBrowser, {name: browserInfo.browserName}),
                    browserList,
                    findName,
                    findVersion;

                if (findData.length > 0) {
                    findName = findData[0].name;
                    findVersion = findData[0].version;

                    if (browserInfo.majorVersion >= findVersion) {
                        $scope.showMessage = false;
                        $scope.browserMessage = '';
                        $scope.disabledFormFields = false;
                    } else {
                        if (findName === 'Internet Explorer') {
                            $scope.showMessage = true;
                            $scope.browserMessage = constants.UPGRADE_BROWSER_MESSAGE1.replace(/\{findVersion}/g, findVersion);
                            $scope.disabledFormFields = true;
                        } else {
                            $scope.showMessage = true;
                            $scope.browserMessage = constants.UPGRADE_BROWSER_MESSAGE2.replace(/\{browserName}/g, findName).replace(/\{findVersion}/g, findVersion);
                            $scope.disabledFormFields = false;
                        }
                    }
                } else {
                    // unsupported Browser
                    $scope.showMessage = true;
                    browserList = $scope.getBrowserNameList(vistoconfig.supportedBrowser);
                    $scope.browserMessage = constants.UPGRADE_BROWSER_MESSAGE3.replace(/\{browserList}/g, browserList);
                    $scope.disabledFormFields = true;
                }
            };

            $scope.getSigninClass = function() {
                return $scope.disabledFormFields ? 'signin_disabled' : '';
            };
        }]);
});
