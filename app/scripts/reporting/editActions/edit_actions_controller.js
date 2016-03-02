define(['angularAMD','reporting/editActions/edit_actions_service', 'common/services/constants_service',
    'login/login_model', 'reporting/editActions/edit_actions_model'],function (angularAMD) {
  'use strict';
    angularAMD.controller('EditActionsController', function ($rootScope, $scope,
                                                             editActionsService, constants,
                                                             loginModel, editAction, activityList) {

        $scope.showList = editAction.data;
        $scope.actionItems = activityList.data;

        //EDIT ACTIVITIES
        $scope.editActivity = false;
        $scope.saveBtnDisabled = true;
        $scope.commentError = false;
        $scope.showEdit= function(ad_id){
            $scope.saveBtnDisabled = true;

            //console.log('requested data');
            //console.log(editAction.data);
            editAction.data.show = true;
            document.getElementById("error_edit_action_more_comment").style.display='none';

            //grunt analytics.track(loginModel.getUserRole(), constants.GA_CAMPAIGN_DETAILS, 'activity_log_edit', loginModel.getLoginName());

            _.each(activityList.data.data, function(activity) {
                if(activity.id == ad_id){
                    //updateUIModel
                    editAction.data.id = activity.id;
                    editAction.data.actionType = activity.action_type_name;
                    editAction.data.actionSubtype = activity.action_sub_type;
                    editAction.data.tactic = activity.ad_name;;
                    editAction.data.metricImpacted = activity.metric_impacted;
                    editAction.data.name = activity.comment.replace('\\n', '\n');
                    editAction.data.makeExternal = activity.make_external;
                    editAction.data.hidden_name= activity.comment;
                    editAction.data.hidden_checkboxStatus= activity.make_external;
                }
            });

        };

        $scope.closeEdit= function(){
            $scope.commentError = false;
            $scope.editError = undefined;
            $scope.saveBtnDisabled = false;
            document.getElementById("error_edit_action_more_comment").style.display='none';
            editAction.data.show = false;
        };

        $scope.editAction = function () {
            var data = {};
            data.make_external = editAction.data.makeExternal;
            data.ad_id =  editAction.data.id ;
            data.name = editAction.data.name.replace('\\n', '\n');
            var max_line = 2;
            var maxChar = 160;
            var line = data.name;
            var split = line.split("\n");
            var splitlength = split.length;
            if(splitlength > max_line){
                var txt_data ='';
                for(i=0; i< max_line;i++){
                    if(i == (parseInt(max_line) ) - 1){
                        txt_data += split[i] ;
                    }else{
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
            //console.log('new chnages');
            //console.log(data);
            data.name = data.name.replace('\\n', '\n');
            if(data.name.trim().length > 0 ){
                $scope.saveBtnDisabled = true;
                $scope.commentError = false;
                editActionsService.editAction(data).then( function (response){
               if(response) {
                    var args = {'loadingFlag':2,'showExternal':$scope.activityLogFilterByStatus};
                    $rootScope.$broadcast(constants.EVENT_ACTION_CREATED,args);
                    $scope.editError = undefined;
                    resetEditActionFormData();
                    editAction.data.show = false;
                } else {
                    $scope.saveBtnDisabled = false;
                    $scope.editError = "(Update Failed)";
                }

            });
            }else{
                $scope.saveBtnDisabled = false;
                $scope.commentError = true;
            }

        }

        function resetEditActionFormData() {
            $scope.saveBtnDisabled = false;
            editAction.data.makeExternal = false;
            editAction.data.name = '';

        }
        $scope.resetEditActionValidation = function(){
            $scope.commentError = false;
        }
        var closeEditActivityScreenFunc = $rootScope.$on("closeEditActivityScreen",function(event){
            $scope.closeEdit();
        });

        $scope.$on('$destroy', function() {
            closeEditActivityScreenFunc();
        });

  });
});
