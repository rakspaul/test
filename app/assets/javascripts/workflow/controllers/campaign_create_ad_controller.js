var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('CreateCampaignAdController', function ($scope, $window, constants, workflowService,$timeout) {
        $scope.textConstants = constants;
        $scope.workflowData = {};
        $scope.selectedCampaign = {}
        
        $('.btn-toggle').click(function() {
            $(this).find('.btn').toggleClass('active');  
            
            if ($(this).find('.btn-primary').size()>0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-success').size()>0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            $(this).find('.btn').toggleClass('btn-default');
               
        });
        
    });
})();

