ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    List.Task = Marionette.Layout.extend({
      tagName: 'div',
      template: JST['templates/activities_tasks/tasks/task_list_item'],
      className: 'task-container',

      events: {
        'click': 'showTaskView'
      },

      showTaskView: function() {
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
        'click .task-detail-view-close' : '_closeTaskDetailView'
      },

      _closeTaskDetailView: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        this.options.parentRegion.close();
//        ReachActivityTaskApp.trigger("include:activities");
      },

      onShow: function() {
//        this.$el.addClass('task-selected');
      },

      onClose: function() {
        if(this.model.collection.selectedTask) {
          this.model.collection.selectedTask.$el.removeClass('task-selected');
        }
      }
    });

    List.TaskCommentView = Backbone.Marionette.ItemView.extend({
      template: JST['templates/activities_tasks/tasks/task_comment_item'],

      className: 'task-comment-container',

      model: ReachActivityTaskApp.Entities.TaskComment
    });

    List.TaskCommentListView = Backbone.Marionette.CollectionView.extend({
      itemView: List.TaskCommentView,

      className: 'task-comments-container'
    });

}, JST);