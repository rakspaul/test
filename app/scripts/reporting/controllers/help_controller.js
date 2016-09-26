define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.controller('HelpController', ['$scope', '$sce', 'pageLoad', function ($scope, $sce, pageLoad) { // jshint ignore:line
        console.log('HELP controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $('.main_navigation').find('.each_nav_link').removeClass('active');
        $scope.help_domain_url = $sce.trustAsResourceUrl(window.help_domain_url);
     }]);
});
