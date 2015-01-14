(function() {
  "use strict";
  var loginModel = function($cookieStore, loginService) {
    var data = {
      user_id: undefined,
      user_name: '',
      is_network_user: false,
      auth_token: undefined
    };
return {

    // getUserInfo : function() {
    //   loginService.getUserInfo($cookieStore.get('auth_token'));
    // }

    setUser : function(user){
      data = user;
      console.log(data);
      $cookieStore.put('auth_token', user.auth_token);

    },
    // this.getUser = function(){
    //   return this.data;
    // };

    getUserId : function(){
      if(data.user_id) {
        return data.user_id;
      } else {
       // return $cookieStore.get('user_id');
       // console.log('no data userid');
      }
    },

    getUserName : function(){
      if(data.user_name) {
        return data.user_name;
      } else {
        //return $cookieStore.get('user_name');
        // console.log('no data username');
      }
    },

    getIsNetworkUser : function(){
      if(data.is_network_user) {
        return data.is_network_user;
      } else {
        //return $cookieStore.get('is_network_user');
        console.log('no data isnetwork');
      }
    },

    getAuthToken : function(){
      if(data.auth_token) {
        return data.auth_token;
      } else {
        return $cookieStore.get('auth_token');
      }
    }
}
   
  }
  angObj.service('loginModel', ['$cookieStore', loginModel]);


}());