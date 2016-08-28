define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignReportsController', ['url', '$location', function (url, $location) {
        console.log('CampaignReportsController', url);
        $location.url(url);
    }]);
});
