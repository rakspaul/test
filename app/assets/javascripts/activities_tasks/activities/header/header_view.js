/**
 * Module represents Activities header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function (Header, ReachActivityTaskApp, Backbone, Marionette, $, _, JST, moment) {

  TEXTAREA_DEFAULT_HEIGHT = 40;

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

  Header.formActions = [
    Header.ACTIVITY_TYPES.ATTACHMENT,
    Header.ACTIVITY_TYPES.TASK,
    Header.ACTIVITY_TYPES.ALERT
  ];


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
      "click .header-controls .filter": "filterActivities",

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
        self.ui.attachmentFileUploader.addClass("active");
        self.model.set('activity_attachment_id', response.result.id);
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

    animateFilterControls: function (component, type) {
      //if filter is existed in the array then we have to reduce the opacity otherwise make opacity full
      var index = Header.filters.indexOf(type);
      if (index > -1) {
        Header.filters.splice(index, 1);
        component.removeClass("active");
      } else {
        Header.filters.push(type);
        component.addClass("active");
      }
    },

    // Filter handlers
    filterActivities: function (e) {
      var aControl = $(e.target),
          filterType = aControl.data("filter-with"),
          systemFilterName,
          filterByUsername;

      e.preventDefault();

      switch (filterType) {
        case "comments":
          systemFilterName = Header.ACTIVITY_TYPES.COMMENT;
          break;
        case "attachments":
          systemFilterName = Header.ACTIVITY_TYPES.ATTACHMENT;
          break;
        case "alerts":
          systemFilterName = Header.ACTIVITY_TYPES.ALERT;
          break;
        case "tasks":
          systemFilterName = Header.ACTIVITY_TYPES.TASK;
          break;
        case "assignee":
          systemFilterName = Header.ACTIVITY_TYPES.COMMENT;
          filterByUsername = ReachActivityTaskApp.username;
          break;
        case "dueDate":
          systemFilterName = Header.ACTIVITY_TYPES.DUEDATE;
          break;
        default:
          systemFilterName = Header.ACTIVITY_TYPES.ALL;
      }

      this.animateFilterControls(aControl, systemFilterName);
      Header.Controller.fetchActivities(systemFilterName, filterByUsername);
    },

    animateFormControl: function (type) {
      var uiComponent = this.getUIComponent(type);
      uiComponent.toggleClass("active");
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
      this.ui.taskFormRegion.toggle();
      this.ui.btnShowTaskForm.toggleClass("active", this.ui.taskFormRegion.is(":visible"));
      if (this.ui.taskFormRegion.is(":visible")) {
        $("#due-date").datepicker();
      }
    },

    // Save Handlers
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
      var commentText = this.ui.activity_input.val().trim();

      // We mark activity as 'TASK' only if Task Form was shown when user pressed 'saveComment' button
      if (this.ui.taskFormRegion.is(":visible")) {
        this.model.set('activity_type', Header.ACTIVITY_TYPES.TASK);
        this.saveTask(commentText);
      } else {
        // Otherwise, check if there was an attachment - if yes, mark as attachment, otherwise - just a comment
        if (commentText == "") {
          // TODO: Put validation!
          return;
        }
        this.model.set('activity_type', this.ui.attachmentFileName.text().trim() ? Header.ACTIVITY_TYPES.ATTACHMENT : Header.ACTIVITY_TYPES.COMMENT);
        this.model.set('note', commentText);
        this.model.unset('users', {silent: true});
        this.model.unset('task_types', {silent: true});
        Header.Controller.saveActivity(this.model);
      }
    },

    saveTask: function (commentText) {
      this.model.set('note', commentText);
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
      this.ui.taskFormRegion.show();
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
      var textarea = $(e.target);

      textarea.css({
        overflow: "hidden",
        height: textarea.height()
      });
      textarea.animate({height: Math.max(textarea.get(0).scrollHeight, TEXTAREA_DEFAULT_HEIGHT) + "px"}, "fast");
    },

    resetTextArea: function () {
      this.ui.activity_input.val('');
      this.ui.activity_input.animate({height: TEXTAREA_DEFAULT_HEIGHT + "px"}, "fast");
    },

    resetFormControls: function () {
      console.log("In reset form controls");
      this.ui.btnShowTaskForm.removeClass("active");
      this.ui.taskFormRegion.hide();
      this.resetTextArea();
      this._resetAttachmentContainer();
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
