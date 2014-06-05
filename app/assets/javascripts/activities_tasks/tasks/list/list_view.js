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

      //This piece of login helps in not refreshing continually task details region when click happens on task or task details region.
      //On close of task details region, the value will be undefined for the current task id.
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

      ReachActivityTaskApp.trigger("include:taskDetails", {task: this.model, aRegion: taskDetailsRegion});

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
        collectionView.$el.prepend(itemView.el);
      }
    }
  });

  List.TaskDetailView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/activities_tasks/tasks/task_details'],

    model: List.Task,

    className: 'task-details-table',

      events: {
        'click .task-detail-view-close' : '_closeTaskDetailView',
        'click #btnSaveTaskComment' : 'saveTaskComment',
        'click #btnRemoveTaskAttachment .remove-btn': 'removeAttachment',
        'click #btnMarkTaskDone': 'closeTask',
        'click #btnMarkTaskUrgent': 'setPriority'
      },

      _closeTaskDetailView: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        this.options.parentRegion.close();
        List.currentTaskId = undefined;
      },

      onClose: function() {
        if(this.model.collection.selectedTask) {
          this.model.collection.selectedTask.$el.removeClass('task-selected');
        }
      },

      ui: {
        taskActivityInput: '#task_comment_input',
        saveAttachment: "#btnSaveTaskAttachment",
        attachmentFileName: "#task-attachment-file-name",
        attachmentFileNameContainer: '#btnRemoveTaskAttachment',
        attachmentFileUploader: ".task-comment-input-control #attachmentUploader",
        closeTaskContainer: '#btnMarkTaskDone',
        prioritizeTaskContainer: '#btnMarkTaskUrgent'
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
//            start: _uploadStarted,
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

        this.ui.taskActivityInput.html('');
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

      closeTask: function() {
        if(this.model.get('task_state') == 'closed') {
            this.ui.closeTaskContainer.html('Closed');
          return;
        }
        this.model.set('task_state', 'closed');
        var self = this;
        this.model.save({ task_state: 'closed' }, {
          success: function() {
            self.ui.closeTaskContainer.html('Closed');
          },

          failure: function() {
            console.log('task model update failed');
          }
        }, {patch: true});
      },

      setPriority: function() {
        this.model.set('important', 'true');
        var self = this;
        this.model.save({ important: 'true' },
          {
            success: function() {
              self.ui.prioritizeTaskContainer.addClass('selected');
            },

            failure: function() {
              console.log('task model update failed');
            }
          }, {patch: true});

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