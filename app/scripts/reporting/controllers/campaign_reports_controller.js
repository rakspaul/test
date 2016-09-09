define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignReportsController', ['url', '$location', function (url, $location) {
        $location.url(url);
    }]);
});
