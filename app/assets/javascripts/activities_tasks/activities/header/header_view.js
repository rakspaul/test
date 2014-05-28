/**
 * Module represents Activities header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header",function(Header,ReachActivityTaskApp,Backbone, Marionette, $, _,JST, moment){

    //Different activity types
    Header.ACTIVITY_TYPES = {   COMMENT:"user_comment",
                                ATTACHMENT:"attachment",
                                TASK:"task",
                                USER:"user",
                                DUEDATE:"duedate",
                                ALERT:"alert",
                                ALL:"all"   };


    Header.Layout =  Backbone.Marionette.ItemView.extend({
        template: JST['templates/activities_tasks/activities/activity_log_header'],

        regions: {
            headerTitleRegion: ".header-title",
            headerControlsRegion: ".header-controls"

        },

        ui:{
            activity_input: "#activity_input",
            taskFormRegion: ".task-form-region",
            taskTypeSelector: "#task-types-selector",
            dueDate: "#due-date",
            taskAssigneeSelector: '#task-assignee-selector'
        },

        //handling event here.
        events: {
            "click #btnFilterComments": "filterActivitiesByComment",
            "click #btnFilterAttachments": "filterActivitiesByAttachment",
            "click #btnFilterTasks": "filterActivitiesByTask",
            "click #btnFilterDueDates": "filterActivitiesByDuedate",
            "click #btnFilterUser": "filterActivitiesByUser",
            "click #btnFilterAlerts": "filterActivitiesByAlert",
            "click #btnFullLog": "showFullLog",

            "click #btnSaveAlert": "saveAlert",
            "click #btnSaveAttachment": "saveAttachment",
            "click #btnShowTaskForm": "showTaskForm",
            "click #btnSaveComment": "saveComment",

            "click #saveTask": "saveTask",

            "change #task-types-selector": 'onTaskTypeChanged'
        },

        //Filter handlers
        filterActivitiesByComment: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.COMMENT);
        },

        filterActivitiesByAttachment: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.ATTACHMENT);
        },

        filterActivitiesByTask: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.TASK);
        },

        filterActivitiesByUser: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.USER,ReachActivityTaskApp.username);
        },

        filterActivitiesByDuedate: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.DUEDATE);
        },

        filterActivitiesByAlert: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.ALERT);
        },

        showFullLog: function(e){
            e.preventDefault();
            Header.Controller.fetchActivities(Header.ACTIVITY_TYPES.ALL);
        },

        //Save Handlers
        saveAttachment: function(e){

        },

        showTaskForm: function(e){
          this.ui.taskFormRegion.toggle();
          if (this.ui.taskFormRegion.is(":visible")) {
            $( "#due-date" ).datepicker();
          }
          this.model.set('activity_type', Header.ACTIVITY_TYPES.TASK);
        },

        saveAlert: function(e){
            e.preventDefault();
            console.log("Save Alert");
            var data = this.ui.activity_input.val().trim();
            if(data==''){
                return;
            }
            Header.Controller.saveActivity(Header.ACTIVITY_TYPES.ALERT,data);
        },

        saveComment: function(e){
            e.preventDefault();
            console.log("Save Comment");
            var data = this.ui.activity_input.val().trim();
            if(data==''){
                return;
            }
            Header.Controller.saveActivity(Header.ACTIVITY_TYPES.COMMENT,data);
        },

        saveTask: function(e) {
          e.preventDefault();
          var data = this.ui.activity_input.val().trim();
          if(data==''){
            return;
          }

          this.model.set('note', data);
          this.model.set('due_date', moment(this.ui.dueDate.val()).format("YYYY-MM-DD"));
          this.model.set('task_type_id', this.ui.taskTypeSelector.val());
          this.model.set('assigned_by_id', this.ui.taskAssigneeSelector.val());
          //TODO: Is this needed.
          this.model.unset('users', {silent: true});
          this.model.unset('task_types', {silent: true});

          Header.Controller.saveTask(this.model);
        },

        onTaskTypeChanged: function(e) {
          var $sel = $(e.target);
          if ($sel.val() == 'pixel_request') {
            $("#pixel-request-subform").show();
          } else {
            $("#pixel-request-subform").hide();
          }
          this.setTaskUsers();
        },

        setTaskUsers: function() {
          var taskType = this.ui.taskTypeSelector.val();
          var thisTaskType = _.find(ReachActivityTaskApp.taskTypes, function(type) {
            return type.get('id') == taskType;
          });
          this.model.set('note', this.ui.activity_input.val());
          this.model.set('task_type_id', thisTaskType.get('id'));
          this.model.set('users', thisTaskType.get('users'));
          this.model.set('due_date', moment().add('days', thisTaskType.get('default_sla')));

          this.render();
          this.showTaskForm();
        }
    });

    Header.TaskFormView = Marionette.ItemView.extend({
        template: JST['templates/activities_tasks/tasks/task_form']
    });

},JST, moment);