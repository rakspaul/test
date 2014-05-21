/**
 * Module represents Activities header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header",function(Header,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

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
            taskFormRegion: ".task-form-region"
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
            "click #btnSaveComment": "saveComment"
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
        }

    });

    Header.TaskFormView = Marionette.ItemView.extend({
        template: JST['templates/activities_tasks/tasks/task_form']
    });

},JST);