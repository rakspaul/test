
(function() {
    'use strict';

    angObj.controller('UsersAddOrEdit', function($scope, $modalInstance,accountsService,$timeout, $location,utils) {
        $scope.permissions = [];
        $scope.allPermissions = [];
        $scope.delete_filter = function(event) {
            var elem = $(event.target);
            elem.closest(".add-filters").remove();
        };
        $scope.close=function(){
            $modalInstance.dismiss();
        };
        $scope.userModalData={};
        $scope.saveUserForm=function(){
            $scope.$broadcast('show-errors-check-validity');
           // if ($scope.userCreateEditForm.$valid) {
                var formElem = $("#userCreateEditForm");
                var formData = formElem.serializeArray();
                formData = _.object(_.pluck(formData, 'name'), _.pluck(formData, 'value'));
                if(formData.userLogin && formData.firstName && formData.lastName && formData.password){
                    console.log(formData);
                }
                var filterArr =[];
                var elem =$(".add-filters");
                _.each(elem, function(el) {
                    //console.log(el);
                    var dataObj={};
                    //dataObj.accounts=el.getElementsByName('accountType')[0].value;
                    dataObj.accounts=el.getElementsByClassName("accountType").value;
                    dataObj.advName=el.getElementsByTagName('select')[0].value;
                    dataObj.brand=el.getElementsByTagName('select')[1].value;
                    dataObj.permission=el.getElementsByTagName('select')[2].value;

                    filterArr.push(dataObj);
                });
            console.log(filterArr);
            //}
        },
        $scope.selectedClientHandler=function(clientObj,index){
            var counter=accountsService.getCounter();
            $scope.selectedClient={};
            $scope.allPermissions['index'] = clientObj;
            $scope.selectedClient['counter']=$scope.allPermissions['index'].name;
        },
        $scope.incrementCounter=function(){
            accountsService.setCounter()
            $scope.permissions.push({});
        }

        var userModalPopup = {
            getUserClients:function(){
                // accountsService.getUserClients().then(function(res) {
                $scope.userModalData['Clients']=[
                    {
                        "id": 1,
                        "name": "Collective",
                        "billableAccountId": 1,
                        "clientType": "ORGANIZATION",
                        "isArchived": false,
                        "currency": {
                            "id": 1,
                            "name": "US DOLLAR",
                            "currencyCode": "USD",
                            "currencySymbol": "$"
                        },
                        "children": [
                            {
                                "id": 9,
                                "name": "TWC-RESELLER",
                                "billableAccountId": 1,
                                "clientType": "RESELLER",
                                "isArchived": false,
                                "timezone": "EST",
                                "currency": {
                                    "id": 1,
                                    "name": "US DOLLAR",
                                    "currencyCode": "USD",
                                    "currencySymbol": "$"
                                },
                                "parentId": 1,
                                "createdAt": "2015-12-03 12:06:34.734",
                                "updatedAt": "2015-12-03 12:06:37.737",
                                "children": [
                                    {
                                        "id": 10,
                                        "name": "TWCAuto",
                                        "billableAccountId": 1,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 1,
                                        "parentId": 9,
                                        "createdAt": "2015-12-03 12:05:29.424",
                                        "updatedAt": "2015-12-03 12:05:37.821"
                                    },
                                    {
                                        "id": 38,
                                        "name": "TWCHealth",
                                        "billableAccountId": 48,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 2,
                                            "name": "INDIAN RUPEE",
                                            "currencyCode": "INR",
                                            "currencySymbol": "₹"
                                        },
                                        "referenceId": 22,
                                        "parentId": 9,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:16:47.753",
                                        "updatedAt": "2015-11-30 15:16:47.753"
                                    }
                                ]
                            },
                            {
                                "id": 50,
                                "name": "Collective Reseller",
                                "billableAccountId": 1,
                                "clientType": "RESELLER",
                                "isArchived": false,
                                "timezone": "EST",
                                "currency": {
                                    "id": 1,
                                    "name": "US DOLLAR",
                                    "currencyCode": "USD",
                                    "currencySymbol": "$"
                                },
                                "parentId": 1,
                                "createdBy": 2,
                                "updatedBy": 2,
                                "createdAt": "2015-11-24 08:24:13.935",
                                "updatedAt": "2015-11-24 08:24:13.935",
                                "children": [
                                    {
                                        "id": 32,
                                        "name": "Collective-txt",
                                        "billableAccountId": 42,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 16,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 09:47:53.155",
                                        "updatedAt": "2015-11-13 09:47:53.155"
                                    },
                                    {
                                        "id": 33,
                                        "name": "collective-agency",
                                        "billableAccountId": 43,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 17,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 09:50:05.717",
                                        "updatedAt": "2015-11-13 09:50:05.717"
                                    },
                                    {
                                        "id": 34,
                                        "name": "text123",
                                        "billableAccountId": 44,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "referenceId": 71,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 09:54:19.408",
                                        "updatedAt": "2015-11-13 09:54:19.408"
                                    },
                                    {
                                        "id": 27,
                                        "name": "Abhimanyu-Account",
                                        "billableAccountId": 36,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "referenceId": 33,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 07:21:10.664",
                                        "updatedAt": "2015-11-13 11:37:23.816"
                                    },
                                    {
                                        "id": 31,
                                        "name": "Advik-marketer",
                                        "billableAccountId": 41,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "referenceId": 70,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 08:59:26.152",
                                        "updatedAt": "2015-11-13 16:12:09.941"
                                    },
                                    {
                                        "id": 30,
                                        "name": "Abhi-marketer",
                                        "billableAccountId": 40,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "referenceId": 68,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 08:42:41.025",
                                        "updatedAt": "2015-11-13 16:18:50.887"
                                    },
                                    {
                                        "id": 29,
                                        "name": "Abhimanyu-AgencyType",
                                        "billableAccountId": 39,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "referenceId": 15,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 08:37:12.596",
                                        "updatedAt": "2015-11-13 17:49:31.450"
                                    },
                                    {
                                        "id": 6,
                                        "name": "Demo_shrujan",
                                        "billableAccountId": 1,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "referenceId": 1,
                                        "parentId": 50,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-07-24 15:55:34.219",
                                        "updatedAt": "2015-11-06 08:40:57.831"
                                    },
                                    {
                                        "id": 8,
                                        "name": "Demo_client",
                                        "billableAccountId": 1,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "referenceId": 1,
                                        "parentId": 50,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-07-24 15:56:21.536",
                                        "updatedAt": "2015-11-07 08:40:26.477"
                                    },
                                    {
                                        "id": 3,
                                        "name": "Test Agency",
                                        "billableAccountId": 1,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 1,
                                        "parentId": 50,
                                        "updatedBy": 2,
                                        "createdAt": "2015-07-07 17:08:32.267",
                                        "updatedAt": "2015-10-16 12:19:35.705"
                                    },
                                    {
                                        "id": 17,
                                        "name": "Advertiser-2015-09-16T11:47:16.710+05:30XXX",
                                        "billableAccountId": 17,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 28,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 07:48:45.161",
                                        "updatedAt": "2015-11-09 07:48:45.161"
                                    },
                                    {
                                        "id": 18,
                                        "name": "shrujan",
                                        "billableAccountId": 18,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 48,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 07:49:44.443",
                                        "updatedAt": "2015-11-09 07:49:44.443"
                                    },
                                    {
                                        "id": 19,
                                        "name": "hello-shr-world",
                                        "billableAccountId": 21,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "referenceId": 10,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 07:54:39.361",
                                        "updatedAt": "2015-11-09 07:55:19.732"
                                    },
                                    {
                                        "id": 7,
                                        "name": "shrujan",
                                        "billableAccountId": 1,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 1,
                                        "parentId": 50,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-07-24 15:56:12.579",
                                        "updatedAt": "2015-11-06 08:39:59.393"
                                    },
                                    {
                                        "id": 20,
                                        "name": "Advertiser-4",
                                        "billableAccountId": 23,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 4,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 08:14:40.518",
                                        "updatedAt": "2015-11-09 08:14:40.518"
                                    },
                                    {
                                        "id": 21,
                                        "name": "SPRINT-1528-ADVERTISER-1",
                                        "billableAccountId": 25,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 19,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 08:36:33.690",
                                        "updatedAt": "2015-11-09 08:36:33.690"
                                    },
                                    {
                                        "id": 22,
                                        "name": "assa",
                                        "billableAccountId": 26,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "referenceId": 11,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 08:51:11.783",
                                        "updatedAt": "2015-11-09 08:51:23.775"
                                    },
                                    {
                                        "id": 23,
                                        "name": "hello shr",
                                        "billableAccountId": 27,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 41,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 09:42:04.452",
                                        "updatedAt": "2015-11-09 09:42:04.452"
                                    },
                                    {
                                        "id": 24,
                                        "name": "agency-testing",
                                        "billableAccountId": 28,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "referenceId": 12,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-09 09:45:46.628",
                                        "updatedAt": "2015-11-09 09:46:45.933"
                                    },
                                    {
                                        "id": 25,
                                        "name": "Test Account001",
                                        "billableAccountId": 31,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 13,
                                        "parentId": 50,
                                        "createdBy": 11127,
                                        "updatedBy": 11127,
                                        "createdAt": "2015-11-11 04:53:48.443",
                                        "updatedAt": "2015-11-11 04:53:48.443"
                                    },
                                    {
                                        "id": 26,
                                        "name": "Cox",
                                        "billableAccountId": 33,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 2,
                                            "name": "INDIAN RUPEE",
                                            "currencyCode": "INR",
                                            "currencySymbol": "₹"
                                        },
                                        "referenceId": 14,
                                        "parentId": 50,
                                        "createdBy": 11127,
                                        "updatedBy": 11127,
                                        "createdAt": "2015-11-12 13:43:07.597",
                                        "updatedAt": "2015-11-12 13:43:07.597"
                                    },
                                    {
                                        "id": 16,
                                        "name": "Advertiser - 002",
                                        "billableAccountId": 16,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "referenceId": 27,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11127,
                                        "createdAt": "2015-11-09 07:47:14.455",
                                        "updatedAt": "2015-11-12 14:20:10.313"
                                    },
                                    {
                                        "id": 28,
                                        "name": "Abhimanyu-Test",
                                        "billableAccountId": 38,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 66,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 08:31:38.252",
                                        "updatedAt": "2015-11-13 08:31:38.252"
                                    },
                                    {
                                        "id": 39,
                                        "name": "30Nove",
                                        "billableAccountId": 49,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 4,
                                            "name": "GREAT BRITAIN POUND",
                                            "currencyCode": "GBP",
                                            "currencySymbol": "£"
                                        },
                                        "referenceId": 23,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:20:00.468",
                                        "updatedAt": "2015-11-30 15:20:00.468"
                                    },
                                    {
                                        "id": 40,
                                        "name": "truethat",
                                        "billableAccountId": 50,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 2,
                                            "name": "INDIAN RUPEE",
                                            "currencyCode": "INR",
                                            "currencySymbol": "₹"
                                        },
                                        "referenceId": 24,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:23:39.679",
                                        "updatedAt": "2015-11-30 15:23:39.679"
                                    },
                                    {
                                        "id": 41,
                                        "name": "Otis",
                                        "billableAccountId": 51,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 25,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:30:35.394",
                                        "updatedAt": "2015-11-30 15:30:35.394"
                                    },
                                    {
                                        "id": 42,
                                        "name": "hihihi",
                                        "billableAccountId": 52,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 72,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:33:34.326",
                                        "updatedAt": "2015-11-30 15:33:34.326"
                                    },
                                    {
                                        "id": 43,
                                        "name": "yoy",
                                        "billableAccountId": 53,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 1,
                                            "name": "US DOLLAR",
                                            "currencyCode": "USD",
                                            "currencySymbol": "$"
                                        },
                                        "referenceId": 73,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:35:07.606",
                                        "updatedAt": "2015-11-30 15:35:07.606"
                                    },
                                    {
                                        "id": 44,
                                        "name": "lplpl",
                                        "billableAccountId": 54,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 26,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:38:11.317",
                                        "updatedAt": "2015-11-30 15:38:11.317"
                                    },
                                    {
                                        "id": 45,
                                        "name": "okokok",
                                        "billableAccountId": 55,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 27,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:48:41.182",
                                        "updatedAt": "2015-11-30 15:48:41.182"
                                    },
                                    {
                                        "id": 37,
                                        "name": "1uuuu",
                                        "billableAccountId": 47,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 4,
                                            "name": "GREAT BRITAIN POUND",
                                            "currencyCode": "GBP",
                                            "currencySymbol": "£"
                                        },
                                        "referenceId": 21,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-30 15:16:08.291",
                                        "updatedAt": "2015-11-30 15:53:46.884"
                                    },
                                    {
                                        "id": 46,
                                        "name": "priyapriya",
                                        "billableAccountId": 56,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 74,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-12-01 05:36:11.413",
                                        "updatedAt": "2015-12-01 05:36:11.413"
                                    },
                                    {
                                        "id": 35,
                                        "name": "123",
                                        "billableAccountId": 45,
                                        "clientType": "AGENCY",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 18,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-11-13 09:55:42.479",
                                        "updatedAt": "2015-12-01 05:38:53.434"
                                    },
                                    {
                                        "id": 47,
                                        "name": "ok123",
                                        "billableAccountId": 57,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "EST",
                                        "currency": {
                                            "id": 3,
                                            "name": "EURO",
                                            "currencyCode": "EUR",
                                            "currencySymbol": "€"
                                        },
                                        "referenceId": 75,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-12-01 05:41:48.560",
                                        "updatedAt": "2015-12-01 05:41:48.560"
                                    },
                                    {
                                        "id": 48,
                                        "name": "vishal12",
                                        "billableAccountId": 58,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 2,
                                            "name": "INDIAN RUPEE",
                                            "currencyCode": "INR",
                                            "currencySymbol": "₹"
                                        },
                                        "referenceId": 76,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-12-01 05:44:08.025",
                                        "updatedAt": "2015-12-01 05:44:08.025"
                                    },
                                    {
                                        "id": 49,
                                        "name": "vishal88",
                                        "billableAccountId": 59,
                                        "clientType": "MARKETER",
                                        "isArchived": false,
                                        "timezone": "CST",
                                        "currency": {
                                            "id": 4,
                                            "name": "GREAT BRITAIN POUND",
                                            "currencyCode": "GBP",
                                            "currencySymbol": "£"
                                        },
                                        "referenceId": 77,
                                        "parentId": 50,
                                        "createdBy": 11568,
                                        "updatedBy": 11568,
                                        "createdAt": "2015-12-01 05:45:21.969",
                                        "updatedAt": "2015-12-01 05:45:21.969"
                                    }
                                ]
                            }
                        ]
                    }
                    ];
                // });
            },
            getUserBrands:function(){
                $scope.userModalData['Brands']=[{id:21,name:"All Brands"},{id:22,name:"brand1"},{id:23,name:"brand2"},{id:24,name:"brand3"}]

            },
            getUserAdvertiser:function(){
                $scope.userModalData['Advertisers']=[{id:31,name:"All Advertisers"},{id:32,name:"Advertiser1"},{id:33,name:"Advertiser2"},{id:34,name:"Advertiser3"}]
            }

        }
        userModalPopup.getUserClients();
        userModalPopup.getUserAdvertiser();
        userModalPopup.getUserBrands();

    });

}());
