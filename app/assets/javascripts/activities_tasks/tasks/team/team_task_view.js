ReachActivityTaskApp.module("ActivitiesTasks.Team.Task", function (Task, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  Task.name = "task";

  Task.FormView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/team/task_form'],

    ui: {
      taskComment: "#task_comment_input",
      taskOrderSelector: "#taskOrderSelector",
      taskTypeSelector: "#task-types-selector",
      dueDate: "#due-date",
      dueDateText: "#due-date-text",
      taskAssigneeSelector: "#task-assignee-selector",
      saveAttachment: "#activity_attachment",
      attachmentFileName: "#task-attachment-file-name",
      attachmentFileUploader: "#attachmentUploader",
      btnSaveTaskComment: "#btnSaveTaskComment",
      attachmentFileNameContainer: '#btnRemoveTaskAttachment',
      btnMarkImportant: "#btnSaveAlert"
    },

    events: {
      "click #btnSaveAlert": "markAsImportant",
      "click #btnSaveTaskComment": "saveTask",
      "keyup #task_comment_input": 'onTypeInTextArea',
      "change #task-types-selector": 'onTaskTypeChanged',
      "click #btnRemoveTaskAttachment .remove-btn": 'removeAttachment',
      "change #taskOrderSelector": 'onTaskOrderChanged'
    },

    modelEvents: {
      'change:note': 'onNoteChanged'
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

    onRender: function() {
      this.model.set('errors', undefined);

      this.ui.btnSaveTaskComment.toggleClass("active", this.model.get("note").length > 0);

      this.ui.taskTypeSelector.selectpicker();

      // Initialize and set order selector
      Task.orderSelector = this.ui.taskOrderSelector.selectize({
                              valueField: 'id',
                              labelField: 'name',
                              searchField: 'name',
                              sortField: 'name',
                              options: [],
                              create: false,
                              load: function(query, callback) {
                                if (!query.length) return callback();
                                $.ajax({
                                  url: '/orders/search.js',
                                  type: 'GET',
                                  dataType: 'jsonp',
                                  data: {
                                    search: query
                                  },
                                  error: function () {
                                    callback();
                                  },
                                  success: function (res) {
                                    var all_orders = [];

                                    if (res !== 'undefined') {
                                      for (var i = 0; i < res.length; i++) {
                                        all_orders.push({ id: res[i].id, name: res[i].name });
                                      }
                                    }

                                    callback(all_orders);
                                  }
                                });
                              }
                            });

      // Initialize and populate the assignee selector
      Task.assigneeSelector = this.ui.taskAssigneeSelector.selectize({
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
                                            for (var i = 0; i < res.length; i++) {
                                              all_users.push({ group: 'users_all', id: res[i].id, name: res[i].name });
                                            }
                                          }

                                          callback(all_users);
                                        }
                                      });
                                    }
                                  });

      var taskType = this.ui.taskTypeSelector.val();
      var thisTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: + taskType});
      var assignee_id = thisTaskType.get('default_assignee_user_id') ?
          thisTaskType.get('default_assignee_user_id') :
          thisTaskType.get('default_assignee_id');
      Task.assigneeSelector[0].selectize.setValue(assignee_id);
      this.model.set('assigned_by_id', assignee_id);
      this.model.set('due_date', thisTaskType.get('default_due_date'));

      this.ui.dueDate.val(thisTaskType.get('default_due_date'));
      this.ui.dueDate.datepicker({format:"yyyy-mm-dd", startDate: new Date(), autoclose: true});
    },

    onNoteChanged: function(model) {
      this.ui.btnSaveTaskComment.toggleClass("active", $.trim(model.get("note")).length > 0);
    },

    onTaskTypeChanged: function (e) {
      this.updateAssigneeSelector(this);
    },

    updateAssigneeSelector: function(self) {
      var currentTaskTypeId = parseInt(self.ui.taskTypeSelector.val());

      // Dont do anything if 1. val is NaN 2. val is same as in model
      if (isNaN(currentTaskTypeId)) {
        return;
      }

      var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: currentTaskTypeId});

      // Update the model
      var currentAssigneeId = currentTaskType.get('default_assignee_user_id') ?
          currentTaskType.get('default_assignee_user_id') :
          currentTaskType.get('default_assignee_id');
      self.model.set('assignable_id', currentAssigneeId);
      self.model.set('assignable_name', currentTaskType.get('default_assignee_team'));
      self.model.set('assignable_type', 'Team');
      self.model.set('task_type_id', currentTaskTypeId);
      self.model.set('due_date', currentTaskType.get('default_due_date'));

      // Update the assignee selector
      var assigneeList = self.defaultOptionsList();

      var control = Task.assigneeSelector[0].selectize;
      // Assign the new list to assignee selector
      control.clearOptions();
      for (var i = 0; i < assigneeList.length; i++) {
        var opt = assigneeList[i];
        control.addOption(opt);
        if (currentAssigneeId == opt.id) {
          control.setValue(currentAssigneeId);
        }
      }

      // Update the due date field as well
      self.ui.dueDate.val(self.model.get('due_date'));
    },

    onTaskOrderChanged: function(e) {
      var currentOrderId = parseInt(this.ui.taskOrderSelector.val());
      var refreshLists = false;

      // Refresh lists if 1. Nothing is selected in the orders list AND model's order_id is available
      // Or 2. Order has been selected AND the order_id in the list does not match the one in the model
      if ( (isNaN(currentOrderId) && this.model.get('order_id') !== undefined) ||
          (!isNaN(currentOrderId) && currentOrderId != this.model.get('order_id') ) ) {
        refreshLists = true;
      }

      ReachActivityTaskApp.order = {};
      if (isNaN(currentOrderId)) {
        this.model.unset('order_id');
      } else {
        this.model.set('order_id', currentOrderId);
        ReachActivityTaskApp.order.id = this.model.get("order_id");
      }

      if (refreshLists) {
        // Update the task types and assignee list since order was changed
        // Fetch task types
        var taskTypes = ReachActivityTaskApp.request("taskType:entities");
        var self = this;
        $.when(taskTypes).done(function (taskTypes) {
          ReachActivityTaskApp.taskTypes = taskTypes.models;

          // Update the assignee drop down to reflect the selection of order
          self.updateAssigneeSelector(self);
        });
      }
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

    onDomRefresh: function() {
      var self = this;

      this.ui.saveAttachment.fileupload({
        dataType: 'json',
        url: '/file_upload.json',
        formData: {attachment_type: 'task_activity_attachment'},
        dropZone: this.ui.saveAttachment,
        pasteZone: null,
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

    markAsImportant: function (e) {
      e.preventDefault();
      var element = $(e.target).tagName == "BUTTON" ? $(e.target) : $(e.target).parent();
      element.toggleClass("active");
      this.model.set('important', element.hasClass('active'));
      if(element.hasClass('active')) {
        this.ui.dueDate.hide();
        this.ui.dueDateText.show();
      } else {
        this.ui.dueDateText.hide();
        this.ui.dueDate.show();
      }
    },

    saveTask: function (e) {
      e.preventDefault();
      var commentText = this.ui.taskComment.val().trim();
      if (commentText.length == 0) {
        return;
      }

      commentText = commentText.replace(/\n/gm, "<br/>");
      this.model.set('activity_type', Task.name);

      this.model.set('note', commentText);
      this.model.set('task_type_id', this.ui.taskTypeSelector.val());
      this.model.set('assigned_by_id', this.ui.taskAssigneeSelector.val());

      // User or Team?
      var selectedOption = _.findWhere(Task.assigneeSelector[0].selectize.options,
          {id: parseInt(this.ui.taskAssigneeSelector.val())});
      var group = 'User';
      if (selectedOption)
        group = selectedOption.group == 'team' ? 'Team' : 'User';
      this.model.set('assignable_type', group);

      var self = this;
      this.model.save(null, {
        success: function (model, response) {
          self.resetFormControls();
        },
        error: function (model, response) {
          if (response.status == 400) {
            //validation error
            self.model.set('errors', response.responseJSON.message);
            self.render();
          }
        }
      })
    },

    resetFormControls: function () {
      this.resetTextArea();
      this._resetAttachmentContainer();
      this.ui.btnSaveTaskComment.removeClass("active");
      ReachActivityTaskApp.order = {};
      Task.orderSelector[0].selectize.setValue();
      this.ui.btnMarkImportant.removeClass('active');
      this.ui.dueDateText.hide();
      this.ui.dueDate.show();
    },

    resetTextArea: function () {
      this.ui.taskComment.val('');
      this.ui.taskComment.animate({height: TEXTAREA_DEFAULT_HEIGHT + "px"}, "fast");
      this.ui.taskComment.siblings('.errors_container').html('');
    },

    _resetAttachmentContainer: function () {
      this.ui.attachmentFileName.attr('href', '');
      this.ui.attachmentFileName.text('');
      this.ui.attachmentFileNameContainer.hide();
      this.ui.attachmentFileUploader.removeClass("active");
      this.model.set('activity_attachment_id', undefined);
    }
  });

  ReachActivityTaskApp.on("include:taskFormInTeamView", function (teamLayout) {
    var taskFormView = new Task.FormView({model: new ReachActivityTaskApp.Entities.Task()});
    teamLayout.taskFormRegion.show(taskFormView);
  });

}, JST);