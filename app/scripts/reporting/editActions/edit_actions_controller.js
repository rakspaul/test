define(['angularAMD','edit-actions-service', 'edit-actions-model'], function (angularAMD) {
    'use strict';

    angularAMD.controller('EditActionsController', ['$rootScope', '$scope', 'editActionsService', 'constants',
        'loginModel', 'editAction', 'activityList', function ($rootScope, $scope, editActionsService, constants,
                                                             loginModel, editAction, activityList) {

        var closeEditActivityScreenFunc = $rootScope.$on('closeEditActivityScreen', function () {
                $scope.closeEdit();
            }),

            winHeight = $(document).height();

        function resetEditActionFormData() {
            $scope.saveBtnDisabled = false;
            editAction.data.makeExternal = false;
            editAction.data.name = '';
        }

        $scope.showList = editAction.data;
        $scope.actionItems = activityList.data;

        // EDIT ACTIVITIES
        $scope.editActivity = false;
        $scope.saveBtnDisabled = true;
        $scope.commentError = false;

        $scope.showEdit = function (ad_id) {
            $scope.saveBtnDisabled = true;

            editAction.data.show = true;
            document.getElementById('error_edit_action_more_comment').style.display = 'none';

            _.each(activityList.data.data, function (activity) {
                if (activity.id === ad_id) {
                    editAction.data.id = activity.id;
                    editAction.data.actionType = activity.action_type_name;
                    editAction.data.actionSubtype = activity.action_sub_type;
                    editAction.data.tactic = activity.ad_name;
                    editAction.data.metricImpacted = activity.metric_impacted;
                    editAction.data.name = activity.comment.replace('\\n', '\n');
                    editAction.data.makeExternal = activity.make_external;
                    editAction.data.hidden_name = activity.comment;
                    editAction.data.hidden_checkboxStatus = activity.make_external;
                }
            });
        };

        $scope.closeEdit = function () {
            $scope.commentError = false;
            $scope.editError = undefined;
            $scope.saveBtnDisabled = false;
            document.getElementById('error_edit_action_more_comment').style.display = 'none';
            editAction.data.show = false;
        };

        $scope.editAction = function () {
            var data = {},
                maxLine,
                maxChar,
                line,
                split,
                splitLength,
                i,
                txtData,
                limitedTxt;

            data.make_external = editAction.data.makeExternal;
            data.ad_id =  editAction.data.id ;
            data.name = editAction.data.name.replace('\\n', '\n');
            maxLine = 2;
            maxChar = 160;
            line = data.name;
            split = line.split('\n');
            splitLength = split.length;

            if (splitLength > maxLine) {
                txtData ='';

                for (i = 0; i < maxLine; i++) {
                    if (i === (parseInt(maxLine)) - 1) {
                        txtData += split[i] ;
                    } else {
                        txtData += split[i] + '\n';
                    }
                }

                data.name = txtData;
            }

            if (data.name.length > maxChar) {
                txtData = data.name;
                limitedTxt = txtData.substring(0, maxChar);
                data.name = limitedTxt;
            }

            data.name = data.name.replace('\\n', '\n');

            if (data.name.trim().length > 0) {
                $scope.saveBtnDisabled = true;
                $scope.commentError = false;

                editActionsService
                    .editAction(data)
                    .then(function (response) {
                        var args;

                        if (response !== null || response !== undefined) {
                            args = {
                                loadingFlag: 2,
                                showExternal: $scope.activityLogFilterByStatus
                            };

                            $rootScope.$broadcast(constants.EVENT_ACTION_CREATED,args);
                            $scope.editError = undefined;
                            resetEditActionFormData();
                            editAction.data.show = false;
                        } else {
                            $scope.saveBtnDisabled = false;
                            $scope.editError = '(Update Failed)';
                        }
                    });
            } else {
                $scope.saveBtnDisabled = false;
                $scope.commentError = true;
            }
        };

        $scope.resetEditActionValidation = function () {
            $scope.commentError = false;
        };

        $scope.$on('$destroy', function () {
            closeEditActivityScreenFunc();
        });

        $('.edit_activity_log_holder').css('height', winHeight - 50);
    }]);
});
