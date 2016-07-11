define(['angularAMD', 'common/services/data_service', 'common/services/transformer_service', // jshint ignore:line
    'reporting/models/tactic', 'common/services/constants_service', 'reporting/models/action_type',
    'reporting/models/action_sub_type'], function (angularAMD) {
    'use strict';

    angularAMD.controller('ActionsController', function ( $timeout, $scope, $rootScope, $filter, $routeParams,
                                                          dataService, modelTransformer, Tactic,
                                                          constants, ActionType, ActionSubType) {
        var loadActionTypes = true,
            loadAdsMeta = true,

            metrics = {
                all : [
                    'CPA',
                    'CPC',
                    'CPM',
                    'CTR',
                    'VTC',
                    'Action Rate',
                    'Delivery (Impressions)'
                ]
            };

        function fetchActionTypes() {
            if (!loadActionTypes) {
                return;
            }

            loadActionTypes = false;

            dataService
                .getActions()
                .then(function (response) {
                    var action,
                        result,
                        resultLen,
                        i,
                        j,
                        subTypeListLen;

                    if (response.status === 'success') {
                        action = { types : [], external : false, name : ''};
                        result = response.data.data;
                        resultLen = result.length;

                        for (i = 0; i < resultLen; i++) {
                            action.types[i] = modelTransformer.transform(result[i], ActionType);
                            subTypeListLen = result[i].subTypeList.length;

                            for (j = 0; j < subTypeListLen; j++) {
                                action.types[i].subTypes[j] =
                                    modelTransformer.transform(result[i].subTypeList[j], ActionSubType);
                            }
                        }

                        $scope.action = action;

                        $scope.setAction = function () {
                            $scope.action.selectedSubType = $scope.action.selectedType.subTypes[0];
                        };
                    }
                });
        }

        function fetchAdsMeta() {
            if (!loadAdsMeta) {
                return;
            }

            loadAdsMeta = false;

            dataService
                .getTactics($routeParams.campaignId)
                .then(function (response) {
                    var tactic,
                        tactics,
                        result,
                        resultLen,
                        i;

                    if (response.status === 'success') {
                        tactics = [];
                        result = response.data.data;
                        resultLen = result.length;

                        for (i = 0; i < resultLen; i++) {
                            tactic = modelTransformer.transform(result[i], Tactic);
                            tactics.push(tactic);
                        }

                        $scope.tactics.all = tactics;
                    }
                });
        }

        $scope.action = {
            types: [],
            external: false,
            name: ''
        };

        $scope.tactics = {};

        $scope.actionTypeDropdownClicked = function () {
            fetchActionTypes();
        };

        $scope.adDropdownClicked = function () {
            fetchAdsMeta();
        };

        $scope.metrics = metrics;

        $scope.createAction = function () {
            var data = {},
                selectedTypes = $scope.action.selectedSubType,
                selectedIds=[],
                selectedTactics = $scope.tactics.selected,
                selectedTacticIds=[],
                i,
                txtData,
                maxLine,
                maxChar,
                line,
                split,
                splitlength,
                limited_txt;

            $scope.action.disableTagButton = {'visibility': 'hidden'};
            $scope.action.submitBtnDisabled = false;

            for (i in selectedTypes) {
                selectedIds.push(selectedTypes[i].id);
            }

            data.action_sub_type_ids = selectedIds ;
            data.make_external = $scope.action.external;

            for (i in selectedTactics) {
                selectedTacticIds.push(selectedTactics[i].id);
            }

            data.action_tactic_ids = selectedTacticIds;
            data.metric_impacted = $scope.metrics.selected;
            data.name = $scope.action.name;
            data.action_type_id = ($scope.action.selectedType ? $scope.action.selectedType.id : '');

            maxLine = 2;
            maxChar = 160;
            line = data.name;
            split = line.split('\n');
            splitlength = split.length;

            if (splitlength > maxLine) {
                txtData = '';

                for (i = 0; i < maxLine; i++) {
                    if (i === (parseInt(maxLine)) - 1) {
                        txtData += split[i];
                    } else {
                        txtData += split[i] + '\n';
                    }
                }

                data.name = txtData;
            }

            if (data.name.length > maxChar) {
                txtData = data.name;
                limited_txt = txtData.substring(0, maxChar);
                data.name = limited_txt;
            }

            if (data.action_sub_type_ids.length > 0 &&
                data.action_type_id !== undefined &&
                data.metric_impacted !== undefined && data.name.length > 0 &&
                data.action_tactic_ids.length > 0) {
                for (i in data.action_tactic_ids) {
                    data.ad_id = data.action_tactic_ids[i];

                    dataService
                        .createAction(data)
                        .then( function () {
                            var args;

                            $scope.action.disableTagButton = {'visibility': 'visible'};

                            $timeout(function () {
                                $scope.action.disableTagButton = {'visibility': 'hidden'};
                            }, 10000);

                            resetActionFormData();

                            args = {
                                loadingFlag: 0,
                                showExternal: $scope.activityLogFilterByStatus
                            };

                            $rootScope.$broadcast(constants.EVENT_ACTION_CREATED,args);
                        }, function () {
                            $scope.action.disableTagButton = {'visibility': 'hidden'};
                            resetActionFormData();
                        });
                }
            } else {
                if (data.action_type_id !== '' && data.action_type_id !== undefined) {
                    $scope.action.selectedTypeError = false;
                    $scope.action.actionFlag = 1;
                } else {
                    $scope.action.selectedTypeError = true;
                    $scope.action.selectedSubTypeError = false;
                    $scope.action.selectedTacticError = false;
                    $scope.action.selectedMetricError = false;
                    $scope.action.nameError = false;
                    $scope.action.actionFlag = 0;
                }

                if ( $scope.action.actionFlag  > 0) {
                    if (data.action_sub_type_ids.length > 0) {
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.actionSubTypeFlag = 1;
                    } else {
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = true;
                        $scope.action.selectedTacticError = false;
                        $scope.action.selectedMetricError = false;
                        $scope.action.nameError = false;
                        $scope.action.actionSubTypeFlag = 0;
                    }
                }

                if ( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0) {
                    if ( data.action_tactic_ids.length > 0) {
                        $scope.action.selectedTacticError = false;
                        $scope.action.TacticFlag = 1;
                    } else {
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.selectedTacticError = true;
                        $scope.action.selectedMetricError = false;
                        $scope.action.nameError = false;
                        $scope.action.TacticFlag = 0;
                    }
                }

                if ( $scope.action.actionFlag  > 0 &&
                    $scope.action.actionSubTypeFlag > 0 &&
                    $scope.action.TacticFlag > 0) {
                    if (  data.metric_impacted !== undefined) {
                        $scope.action.selectedMetricError = false;
                        $scope.action.MetricFlag = 1;
                    } else {
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.selectedTacticError = false;
                        $scope.action.selectedMetricError = true;
                        $scope.action.nameError = false;
                        $scope.action.MetricFlag = 0;
                    }
                }

                if ( $scope.action.actionFlag  > 0 &&
                    $scope.action.actionSubTypeFlag > 0 &&
                    $scope.action.TacticFlag > 0 &&
                    $scope.action.MetricFlag > 0) {
                    if (data.name.length  > 0) {
                        $scope.action.nameError = false;
                    } else {
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.selectedTacticError = false;
                        $scope.action.selectedMetricError = false;
                        $scope.action.nameError = true;
                    }
                }
            }
        };

        $scope.resetValidation = function () {
            $scope.action.selectedTypeError = false;
            $scope.action.selectedSubTypeError = false;
            $scope.action.selectedTacticError = false;
            $scope.action.selectedMetricError = false;
            $scope.action.nameError = false;
            $scope.enableSubTypePopup =false;
        };

        function resetActionFormData() {
            $scope.action.submitBtnDisabled = false;
            $scope.action.external = false;
            $scope.action.name = '';
            $scope.action.selectedType = undefined;
            $scope.action.selectedSubType = undefined;
            $scope.action.selectedSubType = [];
            $scope.tactics.selected = undefined;
            $scope.metrics.selected = undefined;
            $scope.selectedAll = false;
            $rootScope.$broadcast('clear');
            $rootScope.$broadcast('removeOptions');
            $scope.enableSubTypePopup =false;
            $scope.action.selectedSubTypeError = false;
            $scope.action.selectedTypeError = false;
            $scope.metrics.selected = undefined;
        }

        $scope.getActionType = function () {
            var flag = ($scope.action.selectedType && $scope.action.selectedType.id > 0) ?
                'showOptions' : 'removeOptions';

            $rootScope.$broadcast(flag);
        };

        $scope.showDropdownList = function () {
            $scope.enableSubTypePopup =
                ($scope.action.selectedType && $scope.action.selectedType.id > 0) ? false : true;
        };
    });
});
