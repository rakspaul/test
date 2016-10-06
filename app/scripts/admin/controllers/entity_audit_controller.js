/**
 * Created by vishal on 16/09/16.
 */
define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('entityAuditCtrl', ['$scope', '$rootScope','vistoconfig','dataService', 'pageLoad',
            function ($scope, $rootScope, vistoconfig, dataService, pageLoad) {
            console.log('ENTITY AUDIT controller is loaded!');
            // Hide page loader when the page is loaded
            pageLoad.hidePageLoader();

            $scope.entityType = 'AD';
            $scope.entityId = '';

            $scope.searchEntity = function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/entityAudits/' + 'entityType/' + $scope.entityType + '/entityId/' + $scope.entityId;

                dataService
                    .fetch(url)
                    .then(function(result){
                        if (result.status === 'OK' || result.status === 'success') {
                            $scope.auditObjs = result.data.data;
                        }
                    });
            };

            $scope.prettyPrint = function(responseJson) {
                try {
                    //parse string as json and return with proper format
                    return JSON.stringify(JSON.parse(responseJson),null,'     ');
                } catch(e) {
                    //if the string cannot be parsed as json, return it as is.
                    return responseJson;
                }
            };
        }]);
    }
);
