(function () {
  'use strict';
  loginModule.controller('loginController', function ($rootScope, $scope, $filter, $timeout, dataService, $routeParams, modelTransformer, loginService, $location, loginModel) {
   
   $scope.loadingClass = "";
   $scope.loginErrorMsg = undefined;
   $scope.loginError = false;
   $scope.version = version;
   $scope.showMessage =  undefined;
   $scope.browserMessage = undefined;
   $scope.loginBox = undefined;
   var browserNameList ='';
   var supportedBrowser = [{name:"Chrome","version":36},{name:"Firefox","version":35},{name:"Internet Explorer","version":8}];
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
    $scope.detectBrowserInfo = function(){
      var nVer = navigator.appVersion;
      var nAgt = navigator.userAgent;
      var browserName  = navigator.appName;
      var fullVersion  = ''+parseFloat(navigator.appVersion); 
      var majorVersion = parseInt(navigator.appVersion,10);
      var nameOffset,verOffset,ix;
      var browserInfo ={};
       // In Opera 15+, the true version is after "OPR/" 
      if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
       browserName = "Opera";
       fullVersion = nAgt.substring(verOffset+4);
      }
      // In older Opera, the true version is after "Opera" or after "Version"
      else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
       browserName = "Opera";
       fullVersion = nAgt.substring(verOffset+6);
       if ((verOffset=nAgt.indexOf("Version"))!=-1) 
         fullVersion = nAgt.substring(verOffset+8);
      }
      // In MSIE, the true version is after "MSIE" in userAgent
      else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
       browserName = "Internet Explorer";
       fullVersion = nAgt.substring(verOffset+5);
      }//IE 11 and Above
      else if(nVer.indexOf('Trident/') > 0) {
                browserName = "Internet Explorer";
                var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(nAgt) != null)
                 fullVersion = ( RegExp.$1 );
      }
      // In Chrome, the true version is after "Chrome" 
      else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
       browserName = "Chrome";
       fullVersion = nAgt.substring(verOffset+7);
      }
      // In Safari, the true version is after "Safari" or after "Version" 
      else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
       browserName = "Safari";
       fullVersion = nAgt.substring(verOffset+7);
       if ((verOffset=nAgt.indexOf("Version"))!=-1) 
         fullVersion = nAgt.substring(verOffset+8);
      }
      // In Firefox, the true version is after "Firefox" 
      else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
       browserName = "Firefox";
       fullVersion = nAgt.substring(verOffset+8);
      }
      // In most other browsers, "name/version" is at the end of userAgent 
      else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
                (verOffset=nAgt.lastIndexOf('/')) ) 
      {
       browserName = nAgt.substring(nameOffset,verOffset);
       fullVersion = nAgt.substring(verOffset+1);
       if (browserName.toLowerCase()==browserName.toUpperCase()) {
        browserName = navigator.appName;
       }
      }
      // trim the fullVersion string at semicolon/space if present
      if ((ix=fullVersion.indexOf(";"))!=-1)
         fullVersion=fullVersion.substring(0,ix);
      if ((ix=fullVersion.indexOf(" "))!=-1)
         fullVersion=fullVersion.substring(0,ix);

      majorVersion = parseInt(''+fullVersion,10);
      if (isNaN(majorVersion)) {
       fullVersion  = ''+parseFloat(navigator.appVersion); 
       majorVersion = parseInt(navigator.appVersion,10);
      }

       return browserInfo = {"browserName":browserName,"fullVersion":fullVersion,"majorVersion":majorVersion};

};
 $scope.getBrowserNameList = function(supportedBrowser){
     browserNameList =  _.pluck(supportedBrowser,'name').join(",");
     var lastCommaIndex = browserNameList.lastIndexOf(",");
     browserNameList = browserNameList.substr(0, lastCommaIndex) + ' or ' + browserNameList.substr(lastCommaIndex + 1);
     return browserNameList + ".";
 } 
  $scope.checkoutBrowserInfo = function(){
      var browserInfo =  $scope.detectBrowserInfo();
      /*document.write(''
       +'Browse name  = '+browserInfo.browserName+'<br>'
       +'Full version  = '+browserInfo.fullVersion+'<br>'
       +'Major version = '+browserInfo.majorVersion+'<br>'
      )*/
    var findData =_.where(supportedBrowser,{name: browserInfo.browserName});
    //browserInfo.majorVersion= 11;
    if(findData.length > 0){
      var findName = findData[0]['name'];
      var findVersion = findData[0]['version'];
      if(browserInfo.majorVersion >= findVersion ){
          $scope.showMessage = false;
          $scope.browserMessage ='';
          $scope.loginBox = true;
      }else{
          $scope.showMessage = true;
          $scope.browserMessage = "Best viewed in "+findName + " version " +findVersion +" and above. Please upgrade your browser.";
          $scope.loginBox = true;
      }

    }else{
      //unsupported Browser
       $scope.showMessage = true;
       $scope.browserMessage = "Unfortunately, we don't yet support your browser. Please use "+$scope.getBrowserNameList(supportedBrowser);
       $scope.loginBox = false;    
    }
 
}

  });
}());