(function () {
  'use strict';
  loginModule.controller('loginController', function ($rootScope, $scope, $filter, $timeout, dataService, $routeParams, modelTransformer, loginService, $location, loginModel) {
   
   $scope.loadingClass = "";
   $scope.loginErrorMsg = undefined;
   $scope.loginError = false;
   $scope.version = version;
   $scope.login = function () {
        if ($scope.username === undefined || $scope.username.trim() === '' || $scope.password === undefined || $scope.password.trim() === '') {
            $scope.loginErrorMsg = 'The Username/Password is incorrect';
            $scope.loginError=true;
        } else {
            $scope.dataLoading = true;
            $scope.resetValidation();
            $scope.loadingClass = "loading";
            loginService.loginAction($scope.username, $scope.password, function (response) {
                if (response.status == "success") {
                    var user = response.data.data;
                    user.login_name = $scope.username;
                    loginService.setCredentials(user);
                    if (loginModel.getIsNetworkUser() == true) {
                        localStorage.setItem('networkUser', true);
                    } else {
                        localStorage.setItem('networkUser', false);
                    }
                    document.location = '/';
                } else {
                    $scope.error = response.data.message;
                    $scope.loginErrorMsg = response.data.message;
                    $scope.password = ''
                    switch ($scope.error) {
                        case "Password invalid":
                        case "User does not exist":
                            $scope.loginError = true;
                            break;
                        default:
                            $scope.loginError = true;
                        //$scope.loginErrorMsg = "Network Problems";
                    }
                    $scope.loadingClass = "";
                    $scope.dataLoading = false;
                }
            });
        }
	};

	$scope.getLoadingClass = function(){
		return $scope.loadingClass;
	}

	$scope.showLoginError = function(){
		return $scope.loginError;
	}

	$scope.resetValidation = function(){
		$scope.loginError = false;
	}

  });
}());