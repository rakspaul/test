/**
 * Module represents Activities header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function (Header, ReachActivityTaskApp, Backbone, Marionette, $, _, JST, moment) {

  //Different activity types

  Header.ACTIVITY_TYPES = {   COMMENT: "user_comment",
                              ATTACHMENT: "attachment",
                              TASK: "task",
                              USER: "user",
                              DUEDATE: "duedate",
                              ALERT: "alert",
                              ALL: "all",
                              SYSTEM: "system_comment"};

  Header.filters = [];

  Header.currentFormAction = Header.ACTIVITY_TYPES.COMMENT;

  Header.previousFormAction = Header.ACTIVITY_TYPES.COMMENT;

  Header.formActions = [Header.ACTIVITY_TYPES.ATTACHMENT, Header.ACTIVITY_TYPES.TASK, Header.ACTIVITY_TYPES.ALERT];


  Header.Layout = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/activities/activity_log_header'],

    regions: {
      headerTitleRegion: ".header-title",
      headerControlsRegion: ".header-controls"

    },

    ui: {
      activity_input: "#activity_input",
      taskFormRegion: ".task-form-region",
      taskTypeSelector: "#task-types-selector",
      dueDate: "#due-date",
      taskAssigneeSelector: "#task-assignee-selector",
      saveAttachment: "#activity_attachment",
      attachmentFileName: "#attachment-file-name",
      attachmentFileNameContainer: '#btnRemoveAttachment',
      attachmentFileUploader: "#attachmentUploader",
      btnShowTaskForm: "#btnShowTaskForm"
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

      "click #btnSaveAlert": "markAsImportant",
      "click #btnShowTaskForm": "showTaskForm",
      "click #btnSaveComment": "saveComment",

      "click #saveTask": "saveTask",

      "change #task-types-selector": 'onTaskTypeChanged',

      "keyup #activity_input": 'onTypeInTextArea',
      "click #btnRemoveAttachment .remove-btn": 'removeAttachment'
    },

    onDomRefresh: function () {
      var self = this;

      this.ui.attachmentFileNameContainer.hide();

      this.ui.saveAttachment.fileupload({
        dataType: 'json',
        url: '/file_upload.json',
        formData: {attachment_type: 'order_activity_attachment'},
        dropZone: this.ui.saveAttachment,
        pasteZone: null,
//            start: _uploadStarted,
        done: _uploadSuccess,
        fail: _uploadFailure
      });

      function _uploadSuccess(e, response) {
        self.ui.attachmentFileName.attr('href', '/file_download/' + response.result.id);
        self.ui.attachmentFileName.text(response.result.original_filename);
        self.ui.attachmentFileNameContainer.show();
        self.ui.attachmentFileUploader.toggleClass("active");
        self.model.set('activity_attachment_id', response.result.id);

        self.model.set('activity_type', Header.ACTIVITY_TYPES.ATTACHMENT);

        Header.previousFormAction = Header.currentFormAction;
        Header.currentFormAction = Header.ACTIVITY_TYPES.ATTACHMENT;
        console.log("Previous form action:" + Header.previousFormAction);
        console.log("Current form action:" + Header.currentFormAction);
        if (Header.previousFormAction != Header.ACTIVITY_TYPES.TASK) {
          this.animateFormControls();
        }

      }

      function _uploadFailure(e, response) {
        self.ui.attachmentFileName.text('Upload failed');
        self.ui.attachmentFileName.addClass('error');
        self.ui.attachmentFileNameContainer.show();
      }

    },

    initialize: function () {
      this.model.set('activity_type', Header.ACTIVITY_TYPES.COMMENT);
    },

    animate: function (component, cssStyle) {
      component.css(cssStyle);
    },

    animateFilterControls: function (component, type) {
      //if filter is existed in the array then we have to reduce the opacity otherwise make opacity full
      var index = Header.filters.indexOf(type);
      var opacityStyle = {"opacity": 1};
      if (index > -1) {
        opacityStyle["opacity"] = 0.4;
        Header.filters.splice(index, 1);
      } else {
        Header.filters.push(type);
      }
      this.animate(component, opacityStyle);
    },

    fetchActivities:function(component,type){
      this.animateFilterControls(component,type);
      Header.Controller.fetchActivities(Header.filters);
    },

    //Filter handlers
    filterActivitiesByComment: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterComments") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.COMMENT);
    },

    filterActivitiesByAttachment: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterAttachments") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.ATTACHMENT);
    },

    filterActivitiesByTask: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterTasks") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.TASK);
    },

    filterActivitiesByUser: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterUser") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.USER);
    },

    filterActivitiesByDuedate: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterDueDates") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.DUEDATE);
    },

    filterActivitiesByAlert: function (e) {
      e.preventDefault();
      var component = $(e.target).parent();
      if (e.target.id == "btnFilterAlerts") {
        component = $(e.target);
      }
      this.fetchActivities(component, Header.ACTIVITY_TYPES.ALERT);
    },

    showFullLog: function (e) {
      e.preventDefault();
      this.fetchActivities($(e.target), Header.ACTIVITY_TYPES.ALL);
    },

    // Save Handlers
    animateFormControls: function (type) {
      //current form action and previous form action could be same only when user click on the same control(task/attachment) twice.
      if (type != Header.ACTIVITY_TYPES.COMMENT) {
        this.animateFormControl(type);
      }

      //User could continuosly  click on some control, in that case we have to capture earlier state as well.
      //Suppose: User first clicked on attachment control in that case, that is the current form action.
      //Later, user clicked on task then previous would be attachment and later would be task.
      //Now, user keep on clicking task control, then we shouldn't loose previous attachment control.
      var prevFormAction = Header.previousFormAction;
      Header.previousFormAction = Header.currentFormAction;
      Header.currentFormAction = type;

      if (Header.currentFormAction == Header.previousFormAction && Header.currentFormAction != prevFormAction) {
        //keep the model set with the previous action, because that would be the valid one.
        this.model.set('activity_type', prevFormAction);

        if (Header.currentFormAction == Header.ACTIVITY_TYPES.TASK) {
          this.ui.taskFormRegion.toggle();
        }

        //And set it back to the previous action.
        Header.previousFormAction = prevFormAction;
      } else {
        if (type == Header.ACTIVITY_TYPES.TASK) {
          this.ui.taskFormRegion.toggle();
        } else {
          this.model.set('activity_type', type);
        }
      }
    },

    animateFormControl: function (type) {
      var uiComponent = this.getUIComponent(type);
      var val = uiComponent.css("opacity");
      var opacityStyle = {"opacity": 0.4};
      if (val < 1) {
        opacityStyle["opacity"] = 1;
      }
      this.animate(uiComponent, opacityStyle);
    },

    getUIComponent: function (type) {
      if (type == Header.ACTIVITY_TYPES.TASK) {
        return this.ui.btnShowTaskForm;
      } else if (type == Header.ACTIVITY_TYPES.ATTACHMENT) {
        return this.ui.saveAttachment;
      } else {
        return this.ui.btnSaveAlert;
      }
    },

    showTaskForm: function (e) {
      console.log("Current form action:" + Header.currentFormAction);
      console.log("Previous form action:" + Header.previousFormAction)
      this.animateFormControls(Header.ACTIVITY_TYPES.TASK);

      this.ui.btnShowTaskForm.toggleClass("active", this.ui.taskFormRegion.is(":visible"));
      if (this.ui.taskFormRegion.is(":visible")) {
        $("#due-date").datepicker();
        this.model.set('activity_type', Header.ACTIVITY_TYPES.TASK);
      }
    },

    markAsImportant: function (e) {
    /*  var element = $(e.target);

      e.preventDefault();
      console.log("marked as important");
      if (Header.currentFormAction == Header.ACTIVITY_TYPES.TASK) {
        this.ui.taskFormRegion.toggle();
      }
      if (Header.currentFormAction != Header.ACTIVITY_TYPES.ALERT) {
        Header.currentFormAction = Header.ACTIVITY_TYPES.ALERT
      } else {
        Header.currentFormAction = Header.ACTIVITY_TYPES.COMMENT;
      }
      console.log("Current form action:" + Header.currentFormAction);
      this.animateFormControls(Header.ACTIVITY_TYPES.ALERT);
      element.toggleClass("important active");
      this.model.set('important', element.hasClass('important')); */
    },

    saveComment: function (e) {
      e.preventDefault();
      console.log("Save Comment");
      var data = this.ui.activity_input.val().trim();
      if ((Header.currentFormAction == Header.ACTIVITY_TYPES.TASK && Header.previousFormAction == Header.ACTIVITY_TYPES.ATTACHMENT) ||
        (Header.previousFormAction == Header.ACTIVITY_TYPES.TASK && Header.currentFormAction == Header.ACTIVITY_TYPES.ATTACHMENT)) {
        this.model.set('activity_type', Header.ACTIVITY_TYPES.TASK);
        this.saveTask();
      } else {
        if (data.trim() == "") {
          //we have to put validation.
          return;
        }
        this.model.set('note', data);
        this.model.unset('users', {silent: true});
        this.model.unset('task_types', {silent: true});
        Header.Controller.saveActivity(this.model);
      }
    },

    saveTask: function (e) {
      var data = this.ui.activity_input.val().trim();

      this.model.set('note', data);
      this.model.set('due_date', moment(this.ui.dueDate.val()).format("YYYY-MM-DD"));
      this.model.set('task_type_id', this.ui.taskTypeSelector.val());
      this.model.set('assigned_by_id', this.ui.taskAssigneeSelector.val());
      //TODO: Is this needed.
      this.model.unset('users', {silent: true});
      this.model.unset('task_types', {silent: true});

      Header.Controller.saveTask(this.model);

    },

    onTaskTypeChanged: function (e) {
      var $sel = $(e.target);
      /*if ($sel.val() == 'pixel_request') {
       $("#pixel-request-subform").show();
       } else {
       $("#pixel-request-subform").hide();
       } */
      this.setTaskUsers();
    },

    setTaskUsers: function () {
      var taskType = this.ui.taskTypeSelector.val();
      var thisTaskType = _.find(ReachActivityTaskApp.taskTypes, function (type) {
        return type.get('id') == taskType;
      });
      this.model.set('note', this.ui.activity_input.val());
      this.model.set('task_type_id', thisTaskType.get('id'));
      this.model.set('users', thisTaskType.get('users'));
      this.model.set('due_date', moment().add('days', thisTaskType.get('default_sla')));

      this.render();
      this.showTaskForm();
    },

    onTypeInTextArea: function (e) {
      var textarea = $(e.target),
        defaultHeight = 40;

      textarea.css({
        overflow: "hidden",
        height: textarea.height()
      });
      textarea.animate({height: Math.max(textarea.get(0).scrollHeight, defaultHeight) + "px"}, "fast");
    },

    resetTextArea: function () {
      this.ui.activity_input.val('');
      this.ui.activity_input.animate({height: 15 + "px"}, "fast");
    },

    removeAttachment: function (e) {
      e.stopPropagation();
      e.preventDefault();
      this.ui.attachmentFileUploader.removeClass("active");
      // TODO: Add request to remove file from the DB and FS
    },

    resetFormControls: function () {
      console.log("In reset form controls");

      //reset task task form
      if (Header.currentFormAction == Header.ACTIVITY_TYPES.TASK ||
        Header.previousFormAction == Header.ACTIVITY_TYPES.TASK) {
        this.animateFormControl(Header.ACTIVITY_TYPES.TASK);
        this.animateFormControl(Header.ACTIVITY_TYPES.ATTACHMENT);
        this.ui.taskFormRegion.toggle();
      }

      //reset activity type in the model.
      this.model.set('activity_type', Header.ACTIVITY_TYPES.COMMENT);

      this.resetTextArea();

      this._resetAttachmentContainer();

      //make current form action to default.
      Header.currentFormAction = Header.ACTIVITY_TYPES.COMMENT;
      Header.previousFormAction = Header.ACTIVITY_TYPES.COMMENT;

    },

    removeAttachment: function (e) {
      e.stopPropagation();
      e.preventDefault();
      $.ajax('/file_delete/' + this.model.get('activity_attachment_id'), {
        dataType: 'json',
        context: this
      }).success(this._resetAttachmentContainer);
    },

    _resetAttachmentContainer: function () {
      this.ui.attachmentFileName.attr('href', '');
      this.ui.attachmentFileName.text('');
      this.ui.attachmentFileNameContainer.hide();
      this.ui.attachmentFileUploader.removeClass("active");
      this.model.set('activity_attachment_id', null);
    }
  });

  Header.TaskFormView = Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_form']
  });

  ReachActivityTaskApp.on("activities:reset:form-controls", function () {
    Header.Layout.resetFormControls();
  });
}, JST, moment);
