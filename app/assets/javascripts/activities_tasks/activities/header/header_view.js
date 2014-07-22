/**
 * Module represents Activities header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function (Header, ReachActivityTaskApp, Backbone, Marionette, $, _, JST, moment) {

  TEXTAREA_DEFAULT_HEIGHT = 20;

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
      dueDateText: "#due-date-text",
      taskAssigneeSelector: "#task-assignee-selector",
      saveAttachment: "#activity_attachment",
      attachmentFileName: "#attachment-file-name",
      attachmentFileNameContainer: '#btnRemoveAttachment',
      attachmentFileUploader: "#attachmentUploader",
      btnShowTaskForm: "#btnShowTaskForm",
      btnSaveComment: "#btnSaveComment",
      btnMarkImportant: "#btnSaveAlert"
    },

    events: {
      "click .header-controls .filter": "filterActivities",

      "click #btnSaveAlert": "markAsImportant",
      "click #btnShowTaskForm": "showTaskForm",
      "click #btnSaveComment": "saveComment",

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

      // Initialize bootstrap select
      this.ui.taskTypeSelector.selectpicker();

      // Selectize the task-assignee-selector
      Header.task_assignee_selector = $('#task-assignee-selector').selectize({
          valueField: 'id',
          labelField: 'name',
          searchField: 'name',
          sortField: 'group',
          options: this.defaultOptionsList(),
          optgroups: [
              { value: 'team', label: 'Default Team' },
              { value: 'team_users', label: 'Team Members' },
              { value: 'users_all', label: 'Users' },
              { value: 'default_user', label: 'Default User' }
          ],
          optgroupField: 'group',
          create: false,
          load: function(query, callback) {
              if (!query.length) return callback();
              $.ajax({
                  url: '/users/search.js',
                  type: 'GET',
                  dataType: 'jsonp',
                  data: {
                      search: query,
                      search_by: 'name'
                  },
                  error: function () {
                      callback();
                  },
                  success: function (res) {
                      var all_users = [];

                      if (res !== 'undefined') {
                          for (i = 0; i < res.length; i++) {
                              all_users.push({ group: 'users_all', id: res[i].id, name: res[i].name });
                          }
                      }

                      callback(all_users);
                  }
              });
          }
      });

      if(this.model.get('assigned_by_id')) {
          Header.task_assignee_selector[0].selectize.setValue(this.model.get('assigned_by_id'));
      } else {
          var taskType = this.ui.taskTypeSelector.val();
          var thisTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: + taskType});
          var assignee_id = thisTaskType.get('default_assignee_user_id') ?
                                  thisTaskType.get('default_assignee_user_id') :
                                  thisTaskType.get('default_assignee_id');
          Header.task_assignee_selector[0].selectize.setValue(assignee_id);
          this.model.set('assigned_by_id', assignee_id);
      }

      if(this.model.get('assigned_by_id')) {
        Header.task_assignee_selector[0].selectize.setValue(this.model.get('assigned_by_id'));
      } else {
        var taskType = this.ui.taskTypeSelector.val();
        var thisTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: + taskType});
        Header.task_assignee_selector[0].selectize.setValue(thisTaskType.get('default_assignee_id'));
      }
    },

    // Assemble the options list from the teams and the members of the teams
    defaultOptionsList: function() {
        var optList = [];
        var taskType = this.ui.taskTypeSelector.val();
        var thisTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: +taskType});
        var default_team_name = thisTaskType.get('default_assignee_team');
        var default_team_id = thisTaskType.get('default_assignee_id');
        var default_assignee_id = thisTaskType.get('default_assignee_user_id');
        var default_assignee = thisTaskType.get('default_assignee_user');

        // Add default user
        if ( default_assignee  && default_assignee_id ) {
            optList.push({ id: default_assignee_id, name: default_assignee, group: 'default_user' })
        }

        // Add default team
        if ( default_team_id && default_team_name )
            optList.push({ id: default_team_id, name: default_team_name, group: 'team' });

        // Add members of team
        _.each(thisTaskType.get('users'), function(member) {
            // Add if the user is not the default assignee
            if (member.id != default_assignee_id)
                optList.push({ id: member.id, name: member.name, group: 'team_users' });
        });

        return optList;
    },

    initialize: function () {
      this.model.set('activity_type', Header.ACTIVITY_TYPES.COMMENT);
    },

    modelEvents: {
      'change:note': 'onNoteChanged'
    },

    renderAll: function() {
      this.render();
      if(this.model.get('activity_type') == 'task') {
        this.showTaskForm();
      }
    },

    animateFilterControls: function (component, type) {
      //if filter is existed in the array then we have to reduce the opacity otherwise make opacity full
      //when all filter is on, we have to turn off other filters and make sure you have only "all" filter for the query.
      if(type == Header.ACTIVITY_TYPES.ALL){
        if(Header.filters.indexOf(type)==-1){
          //remove other filters when all filter is active
          Header.filters = [];
          //turning off other filters
          this.turnOffFilters(false);
        }
      } else {
        //just turn off "all" filter.
        this.turnOffFilters(true);
      }

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
      //Note: You will get filter type 'undefined' if user clicks on icon. So, we have to check user clicked source and
      // pass the button reference always.So that we always get filter type correctly.
      var aControl = $(e.target)[0].tagName == "BUTTON" ? $(e.target) : $(e.target).parent(),
          systemFilterName = aControl.data("filter-with");

       e.preventDefault();

      this.animateFilterControls(aControl, systemFilterName);

      //Fetch activities should have inclusive filter
      Header.Controller.fetchActivities(Header.filters);
    },

    turnOffFilters:function(allFilter){
      if(allFilter){
        $("#btnFullLog").removeClass("active");
        var index = Header.filters.indexOf(Header.ACTIVITY_TYPES.ALL);
        if(index>-1){
          Header.filters.splice(index,1);
        }
      } else {
        var filterButtons = $(".header-controls").children();
        //don't include "all" filter.
        filterButtons = filterButtons.splice(0,filterButtons.length-1);
        _.each(filterButtons,function(filterButton){
            $(filterButton).removeClass("active");
        });
      }
    },

    /*animateFormControl: function (type) {
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
    },*/

    showTaskForm: function (e) {
      this.model.set('note', this.ui.activity_input.val());
      this.ui.taskFormRegion.toggle();
      this.ui.btnShowTaskForm.toggleClass("active", this.ui.taskFormRegion.is(":visible"));
      if (this.ui.taskFormRegion.is(":visible")) {
        $("#due-date").datepicker({format:"yyyy-mm-dd", startDate: new Date()});
        if(this.model.get('important')) {
          this.ui.dueDate.hide();
          this.ui.dueDateText.show();
        }
      } else {
        this.model.set('important', false);
        var taskType = ReachActivityTaskApp.taskTypes[0];
        this.model.set('task_type_id', taskType.get('id'));
        var assignee_id = taskType.get('default_assignee_user_id') ?
                                 taskType.get('default_assignee_user_id') :
                                 taskType.get('default_assignee_id');
        this.model.set('assigned_by_id', assignee_id);
        this.model.set('due_date', taskType.get('default_due_date'));
        this.model.set('errors', undefined);
        this.render();
      }
      this.ui.btnSaveComment.toggleClass("active", this.model.get("note").length > 0);
    },

    markAsImportant: function (e) {
      e.preventDefault();
      this.ui.btnMarkImportant.toggleClass('active');
      this.model.set('important', this.ui.btnMarkImportant.hasClass('active'));
      if(this.ui.btnMarkImportant.hasClass('active')) {
        this.ui.dueDate.hide();
        this.ui.dueDateText.show();
      } else {
        this.ui.dueDateText.hide();
        this.ui.dueDate.show();
      }
    },

    saveComment: function (e) {
      e.preventDefault();
      var commentText = this.ui.activity_input.val().trim();
      if (commentText == "") {
        // TODO: Put validation!
        return;
      }
      commentText = commentText.replace(/\n/gm, "<br/>");

        // We mark activity as 'TASK' only if Task Form was shown when user pressed 'saveComment' button
      if (this.ui.taskFormRegion.is(":visible")) {
        this.model.set('activity_type', Header.ACTIVITY_TYPES.TASK);
        this.saveTask(commentText);
      } else {
        // Otherwise, check if there was an attachment - if yes, mark as attachment, otherwise - just a comment
        //check if attachment activity is initiated.
        if(this.model.get('activity_attachment_id')!=undefined){
          this.model.set('activity_type', Header.ACTIVITY_TYPES.ATTACHMENT)
        } else {
          this.model.set('activity_type', Header.ACTIVITY_TYPES.COMMENT)
        }
        this.model.set('note', commentText);
        this.model.unset('users', {silent: true});
        this.model.unset('task_types', {silent: true});
        Header.Controller.saveActivity(this.model);
      }
    },

    saveTask: function (commentText) {
      this.model.set('note', commentText);
      this.model.set('due_date', this.ui.dueDate.val());
      this.model.set('task_type_id', this.ui.taskTypeSelector.val());
      this.model.set('assigned_by_id', this.ui.taskAssigneeSelector.val());

      // User or Team?
      var selectedOption = _.findWhere(Header.task_assignee_selector[0].selectize.options,
                                                        {id: parseInt(this.ui.taskAssigneeSelector.val())});
      var group = 'User';
      if (selectedOption)
            group = selectedOption.group == 'team' ? 'Team' : 'User';
      this.model.set('assignable_type', group);

      var self = this;
      this.model.save(null, {
        success: function (model, response) {
          ReachActivityTaskApp.trigger("activities:list");
          ReachActivityTaskApp.trigger("include:tasks");
          Header.headerLayout.resetFormControls();
        },
        error: function (model, response) {
          if(response.status == 400) {
            //validation error
            model.set('errors', response.responseJSON.message);
            self.renderAll();
          }
        }
      });
    },

    onTaskTypeChanged: function () {
      var taskType = this.ui.taskTypeSelector.val();
      var thisTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: +taskType});
      this.model.set('note', this.ui.activity_input.val());
      this.model.set('task_type_id', thisTaskType.get('id'));
      var assignee_id = thisTaskType.get('default_assignee_user_id') ?
                        thisTaskType.get('default_assignee_user_id') :
                        thisTaskType.get('default_assignee_id');
      this.model.set('assigned_by_id', assignee_id);
      this.model.set('due_date', thisTaskType.get('default_due_date'));

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

      // Update task comment
      this.model.set("note", textarea.val());
    },

    resetTextArea: function () {
      this.ui.activity_input.val('');
      this.ui.activity_input.animate({height: TEXTAREA_DEFAULT_HEIGHT + "px"}, "fast");
    },

    resetFormControls: function () {
      this.ui.btnShowTaskForm.removeClass("active");
      this.ui.taskFormRegion.hide();
      this.resetTextArea();
      this._resetAttachmentContainer();
      this.ui.activity_input.siblings('.errors_container').html('');
      this.ui.btnSaveComment.removeClass("active");
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
      this.model.set('activity_attachment_id', undefined);
    },

    onNoteChanged: function(model) {
      this.ui.btnSaveComment.toggleClass("active", $.trim(model.get("note")).length > 0);
    }
  });

  Header.TaskFormView = Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_form']
  });

  ReachActivityTaskApp.on("activities:reset:form-controls", function () {
    Header.Layout.resetFormControls();
  });

}, JST, moment);
