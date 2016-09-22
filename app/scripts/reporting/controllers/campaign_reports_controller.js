define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CampaignReportsController', ['url', '$location', 'pageLoad', function (url, $location, pageLoad) {
        console.log('CAMPAIGN REPORTS controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

        $location.url(url);
    }]);
});
