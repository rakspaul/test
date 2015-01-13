(function() {
  "use strict";
  var loginModel = function($cookieStore) {
    this.data = {
      user_id: 0,
      user_name: '',
      is_network_user: '',
      auth_token: ''
    };

    this.setUser = function(user){
      this.data = user;
      $cookieStore.put('auth_token', user.auth_token);
      $cookieStore.put('user_name', user.user_name);
      $cookieStore.put('is_network_user', user.is_network_user);
      $cookieStore.put('user_id', user.user_id);

    };

    // this.getUser = function(){
    //   return this.data;
    // };

    this.getUserId = function(){
      if(this.data.user_id) {
        return this.data.user_id;
      } else {
        return $cookieStore.get('user_id');
      }
    };

    this.getUserName= function(){
      if(this.data.user_name) {
        return this.data.user_name;
      } else {
        return $cookieStore.get('user_name');
      }
    };

    this.getIsNetworkUser = function(){
      if(this.data.is_network_user) {
        return this.data.is_network_user;
      } else {
        return $cookieStore.get('is_network_user');
      }
    };

    this.getAuthToken = function(){
      if(this.data.auth_token) {
        return this.data.auth_token;
      } else {
        return $cookieStore.get('auth_token');
      }
    };

   
  }
  angObj.service('loginModel', ['$cookieStore', loginModel]);


}());