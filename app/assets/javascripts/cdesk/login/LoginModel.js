(function() {
  "use strict";
  var loginModel = function($cookieStore, loginService) {
    var data = {};
      data.user_id = undefined;
      data.user_name ='';
      data.is_network_user = false;
      data.auth_token = undefined;
  
return {

    setUser : function(user){
      data = user;
      console.log(data);
      $cookieStore.put('auth_token', user.auth_token);
        localStorage.setItem('user_name',user.user_name);
        localStorage.setItem('is_network_user',user.is_network_user);
        localStorage.setItem('user_id', user.user_id);
    },
    // this.getUser = function(){
    //   return this.data;
    // };

    getUserId : function(){
      if(data.user_id) {
        return data.user_id;
      } else {
        data.user_id = localStorage.getItem('user_id');
        return localStorage.getItem('user_id');
      }
    },

    getUserName : function(){
      if(data.user_name) {
        return data.user_name;
      } else {
        data.user_name = localStorage.getItem('user_name');
        return localStorage.getItem('user_name');
      }
    },

    getIsNetworkUser : function(){
      if(data.is_network_user) {
        return data.is_network_user;
      } else {
        data.is_network_user = localStorage.getItem('is_network_user');
        return localStorage.getItem('is_network_user');
      }
    },

    getAuthToken : function(){
      if(data.auth_token) {
        return data.auth_token;
      } else {
        data.auth_token = $cookieStore.get('auth_token');
        return $cookieStore.get('auth_token');
      }
    }
}
   
  }
  angObj.service('loginModel', ['$cookieStore', loginModel]);


}());