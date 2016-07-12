define(['angularAMD', '../../common/services/data_service', 'common/services/url_service'], // jshint ignore:line
    function (angularAMD) {
        'use strict';

        angularAMD.factory('editActionsService', ['dataService', 'urlService', function (dataService, urlService) {
            var editAction = function(data) {
                return dataService
                    .put(urlService.APIeditAction(data.ad_id), data)
                    .then(function (response) {
                        if (response.status === 'success') {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
            };

            return {
                editAction: editAction
            };
        }]);
    }
);
