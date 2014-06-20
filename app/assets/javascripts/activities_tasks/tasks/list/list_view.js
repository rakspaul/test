ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){


  List.currentTaskId = undefined;

  List.Task = Marionette.Layout.extend({
    tagName: 'div',
    template: JST['templates/activities_tasks/tasks/task_list_item'],
    className: 'task-container',
    assigneeSelector: undefined,

    events: {
      'click': 'showTaskView'
    },

    showTaskView: function(e) {

      //Note: The order object is always available when tasks view is inside order, where as assigned-to-me and task views, the order id
      //is directly associated to that particular task.So, we have to reset the order id context with that particular task's order id.
      if(ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.context !=
          ReachActivityTaskApp.Entities.TaskPageContext.VIEW.INSIDE_ORDER){
        ReachActivityTaskApp.order = {};
        ReachActivityTaskApp.order.id = this.model.order_id;
      }


      // This piece of logic helps in not refreshing continually task details region
      // when click happens on the same task or details region.
      // On close of the task details region, the value will be undefined for the current task id.
      if(List.currentTaskId != undefined){
        if(List.currentTaskId == this.model.id){
          return;
        }
      }

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

      // Set list of available users who could be an assignee
      var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: this.model.get("task_type_id")});
      this.model.set("users", currentTaskType ? currentTaskType.get("users") : []);

      // Get the list of default team, team members and the assigned user
      this.model.set("assignee_list", List.Task.getAssigneeOptionsList(this.model));

      ReachActivityTaskApp.trigger("include:taskDetails", {
        task: this.model,
        aRegion: taskDetailsRegion,
        taskView: this
      });

      List.currentTaskId = this.model.id;
    }
  });

    List.Task.getAssigneeOptionsList = function(model) {
        var currentTaskTypeId = model.get("task_type_id");
        var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: currentTaskTypeId});
        var optList = [];

        if (currentTaskType !== undefined) {
            var default_team_name = currentTaskType.get('default_assignee_team');
            var default_team_id = currentTaskType.get('default_assignee_id');
            var team_members = currentTaskType.get('users');
            var current_assignee_id = model.get('assignable_id');
            var current_assignee_name = model.get('assignable_name');
            var current_assignee_type = model.get('assignable_type');

            // Add default team
            if (default_team_id !== 'undefined' && default_team_name !== 'undefined')
                optList.push({ id: default_team_id, name: default_team_name, group: 'team' });

            var team_member = false;
            // Add members of team
            if (team_members !== 'undefined') {
                for (i = 0; i < team_members.length; i++) {
                    if (team_members[i].id == current_assignee_id) team_member = true;

                    optList.push({ id: team_members[i].id, name: team_members[i].name, group: 'team_users' });
                }
            }

            // Add the current assignee to the list
            if (current_assignee_id !== undefined && current_assignee_name !== undefined
                && current_assignee_type == 'User' && !team_member) {
                optList.push({ id: current_assignee_id, name: current_assignee_name, group: 'users_all'});
            }
        } else {
            console.log("curentTaskType (" + currentTaskType + ") is invalid.");
        }

        return optList;
    };

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
      this.model.on('change', this.updateView, this);
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
    },

    onClose: function() {
      if(this.model.collection.selectedTask) {
        this.model.collection.selectedTask.$el.removeClass('task-selected');
      }
    },

    onRender: function() {
      this.onShow();
    },

    onShow: function() {
      var self = this;

      // Initialize bootstrap selectors
      this.ui.taskTypeSelector.selectpicker();

      if(this.model.isClosed()) {
        this.model.set("is_closed", true);
        return;
      }

        // Selectize the task-assignee-selector
        List.Task.assigneeSelector = this.ui.assigneeSelector.selectize({
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            sortField: 'group',
            options: this.model.get('assignee_list'),
            optgroups: [
                { value: 'team', label: 'Default Team' },
                { value: 'team_users', label: 'Team Members' },
                { value: 'users_all', label: 'Users' }
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

        // Set the current assignee as the selected item in the list
        var current_assignee_id = this.model.get('assignable_id');
        if (current_assignee_id !== undefined)
            List.Task.assigneeSelector[0].selectize.setValue(current_assignee_id);

        // Datepicker
      this.ui.dueDatePicker.datepicker({format:"yyyy-mm-dd", startDate: new Date()}).on("changeDate", function (e) {
        var input = $(e.currentTarget),
            dueDate = input.val();

        if(self.model.get('due_date') != dueDate) {
          self.setDueDate(dueDate);
        }
      });

      $('.task-details-table .task-name .editable').editable({
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

      $('.task-details-table .assignable-name .editable').editable({
        url: this.model.url(),
        success: function(response, newValue) {
          var value = newValue.replace(/^\s+|\s+$/g,'');
          self.model.set($(this).data('name'), value); //update backbone model;
          $(this).parent().removeClass('field_with_errors');
          $(this).siblings('.errors_container').html('');
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
          self.model.set("is_closed", self.model.isClosed());
          self.updateView();
        },
        error: function() {
          console.log('task model update failed');
        },
        patch: true
      });
    },

    setPriority: function(e) {
      e.preventDefault;
      if(this.model.isClosed()) {
        return;
      }
      var element = $(e.target).is("button") ? $(e.target) : $(e.target).parent();
      this.model.save({important: element.hasClass("semi-transparent")}, {
        success: function() {
          element.toggleClass('semi-transparent');
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
        error: function() {
          console.log('task model update failed');
        },

        patch: true});
    },

      onTaskTypeChanged: function (e) {
          var currentTaskTypeId = parseInt(this.ui.taskTypeSelector.val());

          // Dont do anything if 1. val is NaN 2. val is same as in model
          if (isNaN(currentTaskTypeId) || currentTaskTypeId == this.model.get('assignable_id')) {
              return;
          }

          var currentTaskType = _.findWhere(ReachActivityTaskApp.taskTypes, {id: currentTaskTypeId});

          // Update the model
          var currentAssigneeId = currentTaskType.get('default_assignee_id');
          this.model.set('assignable_id', currentAssigneeId);
          this.model.set('assignable_name', currentTaskType.get('default_assignee_team'));
          this.model.set('assignable_type', 'Team');
          this.model.set('task_type_id', currentTaskTypeId);

          this.model.set("assignee_list", List.Task.getAssigneeOptionsList(this.model));

          var control = List.Task.assigneeSelector[0].selectize;
          // Assign the new list to assignee selector
          control.clearOptions();
          for (i = 0; i < this.model.get('assignee_list').length; i++) {
              var opt = this.model.get('assignee_list')[i];
              control.addOption(opt);
              if (currentAssigneeId == opt.id) {
                  control.setValue(currentAssigneeId);
              }
          }

          // Save the changes
          this.setTaskType(currentTaskTypeId);
          //this.setAssignee(currentAssigneeId, 'Team');
      },

      onAssigneeChanged: function (e) {
        var currentAssigneeId = parseInt(List.Task.assigneeSelector[0].selectize.getValue());

        // Dont do anything if val is NaN
        if (isNaN(currentAssigneeId)) {
            return;
        }

        this.model.set('assignable_id', currentAssigneeId);
        var control = List.Task.assigneeSelector[0].selectize;
        var group = control.getOption(control.getValue()).parent().attr('data-group');
        var assigneeType = group.toLowerCase() == 'team' ? 'Team' : 'User';
        this.model.set('assignable_type', assigneeType);

        this.setAssignee(currentAssigneeId, assigneeType);
        control.addOption({id: currentAssigneeId, name: 'SSSS', group: 'users_all'})
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