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
             },
             brand: {
                 set: function(data) {
                     localStorage.setItem('setBrands', JSON.stringify(data));
                 },
                 get: function() {
                     return localStorage.getItem('setBrands') && JSON.parse(localStorage.getItem('setBrands'));
                 },
                 setDashboard: function(data) {
                     localStorage.setItem('dashboardBrand', JSON.stringify(data));
                 },
                 getDashboard: function() {
                     return localStorage.getItem('dashboardBrand') && JSON.parse(localStorage.getItem('dashboardBrand'));
                 }
             },
             mediaPlanClone : {
                 set : function(data) {
                     localStorage.setItem('cloneMediaPlan', JSON.stringify(data));
                 },
                 get : function() {
                     return localStorage.getItem('cloneMediaPlan') && JSON.parse(localStorage.getItem('cloneMediaPlan'));
                 }
             }

         }

    });
});
