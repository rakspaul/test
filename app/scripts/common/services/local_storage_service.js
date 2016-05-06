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
             selectedCampaign : {
                 set: function(data) {
                     localStorage.setItem('selectedCampaign', JSON.stringify(data));
                 },
                 get : function() {
                     return localStorage.getItem('selectedCampaign') && JSON.parse(localStorage.getItem('selectedCampaign'));
                 },
                 remove: function() {
                     return localStorage.removeItem('selectedCampaign');
                 }
             }
         }

    });
});
