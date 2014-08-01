ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

  List.currentTaskId = undefined;

  List.Task = Marionette.Layout.extend({
    tagName: 'div',
    template: JST['templates/activities_tasks/tasks/task_list_item'],
    className: 'task-container',
    assigneeSelector: undefined,

    events: {
      'click': 'onTaskView'
    },

    serializeData: function(data) {
      return _.extend(this.model.toJSON(), {context: this.model.collection.context});
    },

    onTaskView: function(e) {
      if($(e.target).data('order-name-link')) {
        return;
      }
      // This piece of logic helps in not refreshing continually task details region
      // when click happens on the same task or details region.
      // On close of the task details region, the value will be undefined for the current task id.
      if(List.currentTaskId && List.currentTaskId == this.model.id) {
        return;
      }

      //Note: The order object is always available when tasks view is inside order, where as assigned-to-me and task views, the order id
      //is directly associated to that particular task.So, we have to reset the order id context with that particular task's order id.
      if(this.model.collection.context != ReachActivityTaskApp.Entities.TaskPageContext.VIEW.INSIDE_ORDER) {
        ReachActivityTaskApp.order = {};
        ReachActivityTaskApp.order.id = this.model.get("order_id");

        // Fetch task types
        var taskTypes = ReachActivityTaskApp.request("taskType:entities");
        var self = this;
        $.when(taskTypes).done(function(taskTypes) {
          ReachActivityTaskApp.taskTypes = taskTypes.models;
          self.showTaskView();
        });
      } else {
        this.showTaskView();
      }
    },

    showTaskView: function(e) {

      // Create region from container within this row
      var taskDetailsRegion = this.addRegion("task_" + this.model.id + "_region", "#task_" + this.model.id);

      // Close previously opened region
      if (this.model.collection.shownRegion && (this.model.collection.shownRegion != taskDetailsRegion)) {
        this.model.collection.shownRegion.close();
      }
      // track the reference to currently shown region
      this.model.collection.shownRegion = taskDetailsRegion;


      if(this.model.collection.selectedTask) {
        this.model.collection.selectedTask.$el.removeClass('task-selected');
      }

      this.model.collection.selectedTask = this;
      this.$el.addClass('task-selected');

      //refresh the task model
      var self = this;
      this.model.fetch({
        success: function() {
          ReachActivityTaskApp.trigger("include:taskDetails", {
            task: self.model,
            aRegion: taskDetailsRegion,
            taskView: self
          });

          List.currentTaskId = self.model.id;
        },
        error: function() {
          console.log('error refreshing task id: ' + self.model.get('id'));
        }
      });
    }
  });

  List.Tasks = Marionette.CollectionView.extend({
    tagName: 'div',
    itemView: List.Task,
    className: 'task-list-container',

    initialize: function() {
      this.listenTo(this.collection, "reset", function() {
        this.appendHtml = function(collectionView, itemView, index) {
          collectionView.$el.append(itemView.el);
        }
      });
    },

    onCompositeCollectionRendered: function() {
      this.appendHtml = function(collectionView, itemView, index) {
        collectionView.$el.append(itemView.el);
      }
    }
  });

  List.TaskDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_detail'],

    model: ReachActivityTaskApp.Entities.Task,

    itemViewContainer: 'div .task-detail-container',

    initialize: function() {
      // Get the list of default team, team members and the assigned user
      this.assigneeOptionsList = this.getAssigneeOptionsList(this.model);
    },

    updateView: function() {
      this.render();
      this.delegateEvents();
      return this;
    },

    events: {
      'click .task-detail-view-close' : 'closeTaskDetailView',
      'click #btnMarkTaskUrgent': 'setPriority',
      'click .task-workflow-control': 'setTaskState',
      'change #taskTypeSelector': 'onTaskTypeChanged',
      'change #assigneeSelector': 'onAssigneeChanged'
    },

    showHideTaskComments:function(show) {
      show ? $("#loadMoreCommentsBtn").show() : $("#loadMoreCommentsBtn").hide();
    },

    ui: {
      prioritizeTaskContainer: '#btnMarkTaskUrgent',
      taskTypeSelector: '#taskTypeSelector',
      assigneeSelector: '#assigneeSelector',
      dueDatePicker: '#createdTaskDueDate'
    },

    closeTaskDetailView: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      this.options.parentRegion.close();
      List.currentTaskId = undefined;
      this.options.taskView.render();
      ReachActivityTaskApp.trigger("task:details:closed");

      ReachActivityTaskApp.trigger("activities:resetFilter");

      //Note: we have to trigger tasks:list event when we are in assigned to me view.As there is a chance that user could change the assignee
      //to different user then that task is not valid in the assigned to me view.
      if(this.model.collection.context == ReachActivityTaskApp.Entities.TaskPageContext.VIEW.ASSIGNED_ME) {
        ReachActivityTaskApp.trigger("assigned-to-me-tasks:list");
      } else {
        ReachActivityTaskApp.trigger("activities:list");
      }
    },

    onClose: function() {
      if(this.model.collection.selectedTask) {
        this.model.collection.selectedTask.$el.removeClass('task-selected');
      }
    },

    onRender: function() {
      this.show();
    },

    onDomRefresh: function() {
      var self = this;
      $('.task-details-container .task-name .editable').editable({
        url: this.model.url(),
        success: function(response, newValue) {
          self.model.set('name', newValue);
          $(self).parent().removeClass('field_with_errors');
          $(self).siblings('.errors_container').html('');
        },
        error: function(response, newValue) {
          var error = response.responseJSON;
          return error.message.name[0];
        }
      });
    },

    show: function() {
      var self = this;

      // Initialize bootstrap selectors
      this.ui.taskTypeSelector.selectpicker();

      if(this.model.isClosed()) {
        // Disable the task type selector (this is enabled the first time
        this.assigneeSelector = this.ui.assigneeSelector.selectize({
          valueField: 'id',
          labelField: 'name',
          options: [{id: this.model.get('assignable_id'), name: this.model.get('assignable_name')}]
        });

        return;
      }

      // Selectize the task-assignee-selector
      this.assigneeSelector = this.ui.assigneeSelector.selectize({
        valueField: 'id',
        labelField: 'name',
        searchField: 'name',
        sortField: 'group',
        options: this.assigneeOptionsList,
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
              var allUsers = [];

              if (res !== 'undefined') {
                for (var i = 0; i < res.length; i++) {
                  allUsers.push({ group: 'users_all', id: res[i].id, name: res[i].name });
                }
              }

              callback(allUsers);
            }
          });
        }
      });

      // Set the current assignee as the selected item in the list
      var currentAssigneeId = this.model.get('assignable_id');
      if (currentAssigneeId !== undefined) {
        this.assigneeSelector[0].selectize.setValue(currentAssigneeId);
      }

      // Datepicker
      this.ui.dueDatePicker.datepicker({format:"yyyy-mm-dd", startDate: new Date()}).on("changeDate", function (e) {
        var input = $(e.currentTarget),
            dueDate = input.val();

        if(self.model.get('due_date') != dueDate) {
          self.setDueDate(dueDate);
        }
      });

    },

    setTaskState: function(e) {
      var self = this,
          elem = $(e.currentTarget).is("button") ? $(e.currentTarget) : $(e.currentTarget).closest("button"),
          state = elem.data("state");

      e.preventDefault();

      this.model.save({task_state: state}, {
        success: function() {
          self.updateView();

          ReachActivityTaskApp.trigger("taskComments:list", {task: self.model});
        },
        error: function() {
          console.log('task model update failed');
        },
        patch: true
      });
    },

    setPriority: function(e) {
      var self = this;
      e.preventDefault;
      if(this.model.isClosed()) {
        return;
      }
      var element = $(e.target).is("button") ? $(e.target) : $(e.target).parent();
      this.model.save({important: element.hasClass("semi-transparent")}, {
        success: function() {
          element.toggleClass('semi-transparent');

          ReachActivityTaskApp.trigger("taskComments:list", {task: self.model});

          // Update the date control
          var important = self.model.get('important');
          if (important) {
              $('#taskDueDateText').css('display', 'inline-block');
              $('#createdTaskDueDate').css('display', 'none');
          } else {
              $('#taskDueDateText').css('display', 'none');
              $('#createdTaskDueDate').css('display', 'inline-block');
          }
        },

        error: function() {
          console.log('task model update failed');
        },

        patch: true
      });
    },

    setDueDate: function(dueDate) {
      var self = this;
      this.model.save({due_date: dueDate}, {
        success: function() {
          ReachActivityTaskApp.trigger("taskComments:list", {task: self.model});
        },
        error: function() {
          console.log('task model update failed');
        },

        patch: true});
    },

    onTaskTypeChanged: function (e) {
      var currentTaskTypeId = parseInt(this.ui.taskTypeSelector.val());

      // Dont do anything if 1. val is NaN 2. val is same as in model
      if (isNaN(currentTaskTypeId) || currentTaskTypeId == this.model.get('task_type_id')) {
        return;
      }

      var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: currentTaskTypeId});

      // Update the model
      var currentAssigneeId = currentTaskType.get('default_assignee_user_id') ?
                                            currentTaskType.get('default_assignee_user_id') :
                                            currentTaskType.get('default_assignee_id');
      this.model.set('assignable_id', currentAssigneeId);
      this.model.set('assignable_name', currentTaskType.get('default_assignee_team'));
      this.model.set('assignable_type', 'Team');
      this.model.set('task_type_id', currentTaskTypeId);

      this.assigneeOptionsList = this.getAssigneeOptionsList(this.model);

      var control = this.assigneeSelector[0].selectize;
      // Assign the new list to assignee selector
      control.clearOptions();
      _.each(this.assigneeOptionsList, function(opt) {
        control.addOption(opt);
        if (currentAssigneeId == opt.id) {
          control.setValue(currentAssigneeId);
        }
      });

      // Save the changes
      this.setTaskType(currentTaskTypeId);
    },

    onAssigneeChanged: function (e) {
      var assigneeList = this.assigneeSelector[0].selectize;
      var currentAssigneeId = parseInt(assigneeList.getValue());

      // Dont do anything if val is NaN
      if (isNaN(currentAssigneeId)) {
        return;
      }

      var selectedOption = _.findWhere(assigneeList.options, {id: currentAssigneeId});
      var currentAssigneeType = selectedOption && selectedOption.group == 'team' ? 'Team' : 'User';
      var assignableIdWas = this.model.get('assignable_id');
      var assignableTypeWas = this.model.get('assignable_type');
      this.model.set('assignable_id', currentAssigneeId);
      this.model.set('assignable_type', currentAssigneeType);

      if(assignableIdWas == currentAssigneeId && assignableTypeWas == currentAssigneeType) {
        return;
      }

      this.setAssignee(currentAssigneeId, currentAssigneeType);
    },

    setTaskType: function(currentTaskTypeId) {
      this.model.save({task_type_id: currentTaskTypeId}, {
        error: function() {
          console.log('task type update failed!')
        },
        patch: true});
    },

    setAssignee: function(currentAssigneeId, currentAssigneeType) {
      this.model.save({assignable_id: currentAssigneeId, assignable_type: currentAssigneeType}, {
        error: function() {
          console.log('task type update failed!')
        },
        patch: true});
    },

    getAssigneeOptionsList: function(model) {
      var currentTaskTypeId = model.get('task_type_id');
      var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: currentTaskTypeId});
      var optList = [];

      if (currentTaskType == undefined) {
        console.log("currentTaskType (" + currentTaskType + ") is invalid.");
        return optList;
      }
      var teamMembers = currentTaskType.get('users');
      var currentAssigneeId = model.get('assignable_id');
      var currentAssigneeName = model.get('assignable_name');
      var currentAssigneeType = model.get('assignable_type');

      var defaultUserId = currentTaskType.get('default_assignee_user_id');
      var defaultUserName = currentTaskType.get('default_assignee_user');
      var defaultTeamId = currentTaskType.get('default_assignee_id');
      var defaultTeamName = currentTaskType.get('default_assignee_team');

      // Add default user
      if (defaultUserName && defaultUserId) {
        optList.push({ id: defaultUserId, name: defaultUserName, group: 'default_user' });
      }
      // Add default team
      if (defaultTeamId && defaultTeamName) {
        optList.push({ id: defaultTeamId, name: defaultTeamName, group: 'team' });
      }

      var teamMemberExists = false;
      // Add members of team
      _.each(teamMembers, function(teamMember) {
        if(teamMember.id == currentAssigneeId) teamMemberExists = true;
        if(teamMember.id == defaultUserId) {
          // Don't add to list since the user is already in it
          teamMemberExists = true;
        } else {
          // Add unique user
          optList.push({ id: teamMember.id, name: teamMember.name, group: 'team_users' });
        }
      });

      // Add the current assignee to the list
      if (currentAssigneeId && currentAssigneeName && currentAssigneeType == 'User' && !teamMemberExists) {
        optList.push({ id: currentAssigneeId, name: currentAssigneeName, group: 'users_all'});
      }
      return optList;
    }
  });

  List.TaskCommentInputView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_comment_input'],

    model: ReachActivityTaskApp.Entities.TaskComment,

    events: {
      'click #btnSaveTaskComment' : 'saveTaskComment',
      'click #btnRemoveTaskAttachment .remove-btn': 'removeAttachment',
      'keyup #task_comment_input': 'onTypeInTextArea'
    },

    ui: {
      taskActivityInput: '#task_comment_input',
      saveAttachment: "#btnSaveTaskAttachment",
      attachmentFileName: "#task-attachment-file-name",
      attachmentFileNameContainer: '#btnRemoveTaskAttachment',
      attachmentFileUploader: ".task-comment-input-control #attachmentUploader",
      btnSaveTaskComment: "#btnSaveTaskComment"
    },

    modelEvents: {
      "change:note": "onNoteChanged"
    },

    onDomRefresh: function() {
      this.ui.attachmentFileNameContainer.hide();

      var self = this;
      this.ui.saveAttachment.fileupload({
        dataType: 'json',
        url: '/file_upload.json',
        formData: {attachment_type: 'task_activity_attachment'},
        dropZone: this.ui.saveAttachment,
        pasteZone: null,
//      start: _uploadStarted,
        done: _uploadSuccess,
        fail: _uploadFailure
      });

      function _uploadSuccess(e, response) {
        self.ui.attachmentFileName.attr('href', '/file_download/' + response.result.id);
        self.ui.attachmentFileName.text(response.result.original_filename);
        self.ui.attachmentFileNameContainer.show();
        self.ui.attachmentFileUploader.toggleClass("active");
        self.ui.attachmentFileName.attr('data-attachment-id', response.result.id);
        self.model.set('activity_attachment_id', response.result.id);
      }

      function _uploadFailure(e, response) {
        self.ui.attachmentFileName.text('Upload failed');
        self.ui.attachmentFileName.addClass('error');
        self.ui.attachmentFileNameContainer.show();
      }
    },

    saveTaskComment: function(e) {
      e.preventDefault();
      var data = this.ui.taskActivityInput.val().trim();
      if(data == '') {
        return;
      }

      data = data.replace(/\n/gm, "<br/>");
      var attachment_id = this.ui.attachmentFileName.attr('data-attachment-id');
      var comment = new ReachActivityTaskApp.Entities.TaskComment();
      comment.set('note', data);
      comment.set('activity_type', 'user_comment');
      comment.set('activity_attachment_id', attachment_id);
      comment.setTask(this.options.task);

      List.Controller.saveTaskComment(comment, {task: this.options.task});

      this.ui.taskActivityInput.val('');
      this.ui.btnSaveTaskComment.removeClass("active");
      this._resetAttachmentContainer();
    },

    removeAttachment: function(e) {
      e.stopPropagation();
      e.preventDefault();
      $.ajax('/file_delete/' + this.ui.attachmentFileName.attr('data-attachment-id'), {
        dataType: 'json',
        context: this
      }).success(this._resetAttachmentContainer);
    },

    _resetAttachmentContainer: function() {
      this.ui.attachmentFileName.attr('href', '');
      this.ui.attachmentFileName.text('');
      this.ui.attachmentFileNameContainer.hide();
      this.ui.attachmentFileUploader.removeClass("active");
      this.ui.attachmentFileName.attr('data-attachment-id', '');
    },

    onNoteChanged: function(model) {
      this.ui.btnSaveTaskComment.toggleClass("active", $.trim(model.get("note")).length > 0);
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
    }
  });

  List.TaskCommentView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_comment_list_item'],
    className: 'task-comment-container',
    model: ReachActivityTaskApp.Entities.TaskComment
  });

  List.TaskCommentListView = Backbone.Marionette.CollectionView.extend({
    itemView: List.TaskCommentView,
    className: 'task-comments-container'
  });

}, JST);
