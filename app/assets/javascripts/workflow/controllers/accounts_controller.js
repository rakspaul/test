var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('AccountsController', function ($scope, $window, $routeParams, constants, workflowService, $timeout, utils, $location) {
        $(".main_navigation").find('.active').removeClass('active').end().find('#creative_nav_link').addClass('active');
        $scope.textConstants = constants;
        
        
        $scope.show_advertisers = function(event) {
            var elem = $(event.target);
            elem.closest(".each-account-details").find(".advertiser-list").toggle() ;
        };
        $scope.show_advertisers_resp_brands = function(event) {
            var elem = $(event.target);
            elem.closest(".each-advertiser").find(".advertiser-resp-brands-list").toggle() ;
        };
        $scope.show_edit = function(type) {
            $(".edit-container").hide();
            $('#'+ type +'-edit-container').toggle('slide', { direction: "right" }, 500);
        };
        
        
    });

})();

