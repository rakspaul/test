ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){


  List.currentTaskId = undefined;

  List.Task = Marionette.Layout.extend({
    tagName: 'div',
    template: JST['templates/activities_tasks/tasks/task_list_item'],
    className: 'task-container',

    events: {
      'click': 'showTaskView'
    },

    showTaskView: function(e) {

      // This piece of logic helps in not refreshing continually task details region
      // when click happens on task or task details region.
      // On close of task details region, the value will be undefined for the current task id.
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

      ReachActivityTaskApp.trigger("include:taskDetails", {task: this.model, aRegion: taskDetailsRegion, taskView: this});

      List.currentTaskId = this.model.id;
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
      this.model.on('change', this.updateView, this);
    },

    updateView: function() {
      this.render();
      this.delegateEvents();
      return this;
    },

    events: {
      'click .task-detail-view-close' : '_closeTaskDetailView',
      'click #btnMarkTaskDone': 'closeTask',
      'click #btnMarkTaskUrgent': 'setPriority'
    },

    ui: {
      closeTaskContainer: '#btnMarkTaskDone',
      prioritizeTaskContainer: '#btnMarkTaskUrgent'
    },

    _closeTaskDetailView: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      this.options.parentRegion.close();
      List.currentTaskId = undefined;
      this.options.taskView.render();
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
      if(this.model.isClosed()) {
        return;
      }
      var self = this;
      $('.task-details-table .task-name .editable').editable({
        url: this.model.url(),
        success: function(response, newValue) {
          self.model.set('name', newValue);
          $(self).parent().removeClass('field_with_errors');
          $(self).siblings('.errors_container').html('');
        }
      });

      $('.task-details-table .assignable-name .editable').editable({
        url: this.model.url(),
        success: function(response, newValue) {
          console.log('Reached here 3');
          var value = newValue.replace(/^\s+|\s+$/g,'');
          self.model.set($(this).data('name'), value); //update backbone model;
          $(this).parent().removeClass('field_with_errors');
          $(this).siblings('.errors_container').html('');
        }
      });
    },

    closeTask: function(e) {
      e.preventDefault();
      if(this.model.isClosed()) {
        this.ui.closeTaskContainer.toggleClass('active disable');
        return;
      }
      var self = this;
      this.model.save({task_state: 'closed'}, {
        success: function() {
          self.model.set('task_state', 'closed');
          self.ui.closeTaskContainer.toggleClass('active');
        },

        error: function() {
          console.log('task model update failed');
        },

        patch: true});
    },

    setPriority: function(e) {
      e.preventDefault;
      if(this.model.isClosed()) {
        return;
      }
      var element = $(e.target).get(0).tagName == "BUTTON" ? $(e.target) : $(e.target).parent();
      var self = this, newDueDate = moment().add('days', 2), curDueDate = moment(this.model.get('due_date'));
      if(curDueDate > newDueDate && !this.model.isPrioritized()) {
        // Prioritizing the task now
        curDueDate = newDueDate;
      }
      this.model.save({important: !element.hasClass("active"), due_date: curDueDate}, {
        success: function() {
          if(element.hasClass('active')) {
            element.removeClass('active');
            element.addClass('semi-transparent');
            curDueDate = moment().add('days', 7);
          } else {
            element.addClass('active');
            element.removeClass('semi-transparent');
          }
          self.model.set('important', element.hasClass("active"));
          self.model.set('due_date', curDueDate);
        },

        error: function() {
          console.log('task model update failed');
        },

        patch: true});
    }
  });

  List.TaskCommentInputView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_comment_input'],

    model: ReachActivityTaskApp.Entities.TaskComment,

    events: {
      'click #btnSaveTaskComment' : 'saveTaskComment',
      'click #btnRemoveTaskAttachment .remove-btn': 'removeAttachment'
    },

    ui: {
      taskActivityInput: '#task_comment_input',
      saveAttachment: "#btnSaveTaskAttachment",
      attachmentFileName: "#task-attachment-file-name",
      attachmentFileNameContainer: '#btnRemoveTaskAttachment',
      attachmentFileUploader: ".task-comment-input-control #attachmentUploader"
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
        console.log(JSON.stringify(response.result));
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