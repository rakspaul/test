/**
 * Created by vishal on 16/09/16.
 */
define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.controller('entityAuditCtrl', ['$scope', '$rootScope','vistoconfig','dataService', function ($scope, $rootScope, vistoconfig, dataService) {

            $scope.entityType = 'AD';
            $scope.entityId = '';
            $scope.searchEntity = function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/entityAudits/' +
                    'entityType/' + $scope.entityType + '/entityId/' + $scope.entityId;
                var result = dataService.fetch(url).then(function(result){
                    if (result.status === 'OK' || result.status === 'success') {
                        $scope.auditObjs = result.data.data;
                        //$scope.auditObjs.responseObject = JSON.stringify($scope.auditObjs.response,null,"    ")
                    }
                });
            };

            $scope.prettyPrint = function(responseJson) {
                try {
                    return JSON.stringify(JSON.parse(responseJson),null,'     ');
                } catch(e) {
                    return responseJson;
                }
            }

        }]);
    }
);

