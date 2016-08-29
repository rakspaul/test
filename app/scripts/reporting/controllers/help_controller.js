define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angObj.controller('HelpController', ['$scope', '$sce', function ($scope, $sce) { // jshint ignore:line
        $('.main_navigation').find('.each_nav_link').removeClass('active');
        $scope.help_domain_url = $sce.trustAsResourceUrl(window.help_domain_url);
     }]);
});
