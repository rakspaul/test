define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignReportsController', function (url, $location) {
        console.log('CampaignReportsController', url);
        $location.url(url);
    });
});
