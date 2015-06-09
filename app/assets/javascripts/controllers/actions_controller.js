(function () {
    'use strict';
    angObj.controller('ActionsController', function ($scope,$rootScope, $filter, dataService, $routeParams, modelTransformer, ActionType, ActionSubType, Tactic, constants, $timeout) {
        dataService.getActions().then(function (response) {
            if(response.status === 'success') {
                var action = { types : [], external : false, name : ''},
                    result = response.data.data,
                    resultLen = result.length;
                for (var i = 0; i < resultLen; i++) {
                    action.types[i] = modelTransformer.transform(result[i], ActionType);
                    var subTypeListLen = result[i].subTypeList.length;
                    for (var j = 0; j < subTypeListLen; j++) {
                        action.types[i].subTypes[j] = modelTransformer.transform(result[i].subTypeList[j], ActionSubType)
                    }
                }
                $scope.action = action;
                $scope.setAction = function () {
                    $scope.action.selectedSubType = $scope.action.selectedType.subTypes[0];
                }
            }
        });

        dataService.getTactics($routeParams.campaignId).then(function (response) {
            if(response.status === 'success') {
                var tactics = [],
                    result = response.data.data,
                    resultLen = result.length;
                for (var i = 0; i < resultLen; i++) {
                    var tactic = modelTransformer.transform(result[i], Tactic);
                    tactics.push(tactic);
                }
                $scope.tactics = {};
                $scope.tactics.all = tactics;
            }
        });

        var metrics = {all : ['CPA', 'CPC', 'CPM', 'CTR', 'Action Rate', 'Delivery (Impressions)']};
        $scope.metrics = metrics;

        $scope.createAction = function () {
            var data = {},
                selectedTypes = $scope.action.selectedSubType,
                selectedIds=[],
                selectedTactics = $scope.tactics.selected,
                selectedTacticIds=[];

            $scope.action.disableTagButton = {'visibility': 'hidden'};
            $scope.action.submitBtnDisabled = false;

            for(var i in selectedTypes){
                selectedIds.push(selectedTypes[i].id);
            }

            data.action_sub_type_ids = selectedIds ;
            data.make_external = $scope.action.external;

            for(var i in selectedTactics){
                selectedTacticIds.push(selectedTactics[i].id);
            }

            data.action_tactic_ids = selectedTacticIds;
            data.metric_impacted = $scope.metrics.selected;
            data.name = $scope.action.name;
            data.action_type_id = ($scope.action.selectedType ? $scope.action.selectedType.id : '');

            var max_line = 2,
                maxChar = 160,
                line = data.name,
                split = line.split("\n"),
                splitlength = split.length;

            if(splitlength > max_line){
                var txt_data ='';
                for(i=0; i< max_line;i++) {
                    if(i == (parseInt(max_line)) - 1) {
                        txt_data += split[i];
                    } else {
                        txt_data += split[i] + '\n';
                    }
                }
                data.name = txt_data;
            }

            if(data.name.length > maxChar ){
                var txt_data = data.name;
                var limited_txt = txt_data.substring(0, maxChar );
                data.name = limited_txt;
            }

            if(data.action_sub_type_ids.length > 0 && data.action_type_id !=undefined && data.metric_impacted != undefined && data.name.length > 0 && data.action_tactic_ids.length > 0 ) {
                for(var i in data.action_tactic_ids){
                    data.ad_id = data.action_tactic_ids[i];
                    dataService.createAction(data).then( function (response){
                        $scope.action.disableTagButton = {'visibility': 'visible'};
                        $timeout(function() {
                            $scope.action.disableTagButton = {'visibility': 'hidden'};
                        }, 10000);
                        resetActionFormData();
                        var args = {'loadingFlag':0,'showExternal': $scope.activityLogFilterByStatus };
                        $rootScope.$broadcast(constants.EVENT_ACTION_CREATED,args);
                    }, function (response) {
                        $scope.action.disableTagButton = {'visibility': 'hidden'};
                        resetActionFormData();
                    });
                }
            } else {

                if(data.action_type_id != '' && data.action_type_id != undefined) {
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

                if( $scope.action.actionFlag  > 0 ){
                    if(data.action_sub_type_ids.length > 0){
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

                if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 ){
                    if( data.action_tactic_ids.length > 0 ) {
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

                if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 && $scope.action.TacticFlag > 0  ){
                    if(  data.metric_impacted != undefined ){
                        $scope.action.selectedMetricError = false;
                        $scope.action.MetricFlag = 1;
                    }else{
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.selectedTacticError = false;
                        $scope.action.selectedMetricError = true;
                        $scope.action.nameError = false;
                        $scope.action.MetricFlag = 0;
                    }
                }

                if( $scope.action.actionFlag  > 0 &&  $scope.action.actionSubTypeFlag > 0 && $scope.action.TacticFlag > 0 &&  $scope.action.MetricFlag > 0) {
                    if(data.name.length  > 0 ){
                        $scope.action.nameError = false;
                    }else{
                        $scope.action.selectedTypeError = false;
                        $scope.action.selectedSubTypeError = false;
                        $scope.action.selectedTacticError = false;
                        $scope.action.selectedMetricError = false;
                        $scope.action.nameError = true;
                    }
                }
            }
        }
        $scope.resetValidation = function(){
            $scope.action.selectedTypeError = false;
            $scope.action.selectedSubTypeError = false;
            $scope.action.selectedTacticError = false;
            $scope.action.selectedMetricError = false;
            $scope.action.nameError = false;
            $scope.enableSubTypePopup =false;

        }

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
            $rootScope.$broadcast("clear");
            $rootScope.$broadcast("removeOptions");
            $scope.enableSubTypePopup =false;
            $scope.action.selectedSubTypeError = false;
            $scope.action.selectedTypeError = false;
            $scope.metrics.selected = undefined;
        }

        $scope.getActionType = function(){
            var flag = ($scope.action.selectedType && $scope.action.selectedType.id > 0 ) ? 'showOptions' : 'removeOptions';
            $rootScope.$broadcast(flag);
        }

        $scope.showDropdownList = function(){
            var flag = ($scope.action.selectedType && $scope.action.selectedType.id > 0) ? false : true;
            $scope.enableSubTypePopup = flag;
        }
    });
}());