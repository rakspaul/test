(function () {
  'use strict';
  loginModule.controller('loginController', function ($rootScope, $scope, $filter, $timeout, dataService, $routeParams, modelTransformer, loginService, $location, loginModel,utils,constants,$sce,RoleBasedService) {
   $scope.textConstants = constants;
   $scope.loadingClass = "";
   $scope.loginErrorMsg = undefined;
   $scope.loginError = false;
   $scope.version = version;
   $scope.showMessage =  undefined;
   $scope.browserMessage = undefined;
   $scope.disabledFormFields = undefined;
   $scope.copyRights = $sce.trustAsHtml(constants.COPY_RIGHTS);
   var browserNameList ='';
   var supportedBrowser = [{name:"Chrome","version":36},{name:"Firefox","version":35},{name:"Internet Explorer","version":10}];
   $scope.login = function () {
        if ($scope.username === undefined || $scope.username.trim() === '' || $scope.password === undefined || $scope.password.trim() === '') {
            $scope.loginErrorMsg = 'The Username/Password is incorrect';
            $scope.loginError=true;
        } else {
            $scope.dataLoading = true;
            $scope.resetValidation();
            $scope.loadingClass = "loading";
            loginService.loginAction($scope.username, $scope.password, function (response) {
                if (response.status == "success") { //console.log(response.data.data);
                    var user = response.data.data;
                    user.login_name = $scope.username;
                    loginService.setCredentials(user);
                    //RoleBasedService.setUserRole(response);//set the type of user here in RoleBasedService.js
                    if (loginModel.getIsNetworkUser() == true) {
                        localStorage.setItem('networkUser', true);
                    } else {
                        localStorage.setItem('networkUser', false);
                    }
                    localStorage.setItem('authorizationKey', user.auth_token);
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
 $scope.getBrowserNameList = function(supportedBrowser){
     browserNameList =  _.pluck(supportedBrowser,'name').join(",");
     var lastCommaIndex = browserNameList.lastIndexOf(",");
     browserNameList = browserNameList.substr(0, lastCommaIndex) + ' or ' + browserNameList.substr(lastCommaIndex + 1);
     return browserNameList + ".";
 } 
  $scope.checkoutBrowserInfo = function(){
    var browserInfo =  utils.detectBrowserInfo();
    var findData =_.where(supportedBrowser,{name: browserInfo.browserName});
    if(findData.length > 0){
      var findName = findData[0]['name'];
      var findVersion = findData[0]['version'];
      if(browserInfo.majorVersion >= findVersion ){
          $scope.showMessage = false;
          $scope.browserMessage ='';
          $scope.disabledFormFields = false;
      }else{
          if(findName == 'Internet Explorer'){
             $scope.showMessage = true;
             $scope.browserMessage = "Unfortunately, we do not support your browser. Please upgrade to IE "+findVersion+".";
             $scope.disabledFormFields = true;
          }else{
             $scope.showMessage = true;
             $scope.browserMessage = "Best viewed in "+findName + " version " +findVersion +" and above. Please upgrade your browser.";
             $scope.disabledFormFields = false;
          }
         
      }

    }else{
      //unsupported Browser
       $scope.showMessage = true;
       $scope.browserMessage = "Unfortunately, we don't yet support your browser. Please use "+$scope.getBrowserNameList(supportedBrowser);
       $scope.disabledFormFields = true ;    
    }
}
  $scope.getSigninClass = function(){
    return $scope.disabledFormFields == true ? 'signin_disabled':'';
  }

  });
}());