(function() {
  "use strict";
  var loginModel = function($cookieStore, $location) {
    var data = {};
      data.user_id = undefined;
      data.user_name ='';
      data.is_network_user = false;
      data.auth_token = undefined;
      data.expiry_secs = undefined;
  
return {

    setUser : function(user){
        data = user;

        var time= moment(new Date());  
        var store ="";
        time.add(user.expiry_secs,'seconds');
        console.log('cookie expires on '+time.format('YYYY-MM-DD HH:mm:ss'));
        var now = new Date(time);
        //user.expiry_time=time.format('YYYY-MM-DD HH:mm:ss');
        document.cookie = 'cdesk_session='+ JSON.stringify(user) +';expires='+now.toGMTString()+';path=/';

        // campaignDetails object is required for reports tab.
        localStorage.setItem( 'campaignDetails', JSON.stringify({
            campaignId : null,
            campaignName:null,
            strategyId : null,
            strategyName : null,
            strategyStartDate : null,
            strategyEndDate : null,
            filterDurationType:null,
            filterDurationValue:null,
            filterKpiType:null,
            filterKpiValue:null,
            previousCampaignId:null
        }));
    },
    // this.getUser = function(){
    //   return this.data;
    // };

    getUserId : function() {
      if(data.user_id) {
        return data.user_id;
       } else if($cookieStore.get('cdesk_session')) {
        data.user_id = $cookieStore.get('cdesk_session').user_id;
        return $cookieStore.get('cdesk_session').user_id;
      }
    },

    getUserName : function() {
      if(data.user_name) {
        return data.user_name;
       } else if($cookieStore.get('cdesk_session')) {
        data.user_name = $cookieStore.get('cdesk_session').user_name;
        return $cookieStore.get('cdesk_session').user_name;
      }
    },

    getIsNetworkUser : function() {
      if(data.is_network_user) {
        return data.is_network_user;
       } else if($cookieStore.get('cdesk_session')) {
        data.is_network_user = $cookieStore.get('cdesk_session').is_network_user;
        return $cookieStore.get('cdesk_session').is_network_user;
      }
    },

    getExpirySecs : function() {
      if(data.expiry_secs) {
        return data.expiry_secs;
      } else if($cookieStore.get('cdesk_session')) {
        data.expiry_secs = $cookieStore.get('cdesk_session').expiry_secs;
        return $cookieStore.get('cdesk_session').expiry_secs;
      }
    },

    getAuthToken : function() {
      if($cookieStore.get('cdesk_session')) {
        data.auth_token = $cookieStore.get('cdesk_session').auth_token;
        return $cookieStore.get('cdesk_session').auth_token;
      }
    },

    checkCookieExpiry : function(){ 
      if(!$cookieStore.get('cdesk_session')){
        localStorage.clear();
        $location.url('/login');
      }
    },

    unauthorized : function() {
      $cookieStore.remove('cdesk_session');
      $location.url('/login');
    }
}
   
  }
  angObj.service('loginModel', ['$cookieStore', '$location', loginModel]);


}());