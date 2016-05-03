define(['angularAMD'], function (angularAMD) {
    angularAMD.factory('localStorageService', function () {
         return {
             masterClient: {
                 set: function(data) {
                     localStorage.setItem('masterClient', JSON.stringify(data));
                 },
                 get: function() {
                     return localStorage.getItem('masterClient') && JSON.parse(localStorage.getItem('masterClient'));
                 }
             }
         }

    });
});
