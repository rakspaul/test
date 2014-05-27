ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    List.Task = Marionette.ItemView.extend({
      tagName: 'div',
      template: JST['templates/activities_tasks/tasks/task_list_item'],
      className: 'task-container',

      events: {
        'click': 'showTaskView'
      },

      showTaskView: function() {
        if(this.model.collection.selectedTask) {
          this.model.collection.selectedTask.$el.removeClass('task-selected');
        }

        this.model.collection.selectedTask = this;
        this.$el.addClass('task-selected');

        ReachActivityTaskApp.trigger("include:taskDetails", {task: this.model});
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

      _closeTaskDetailView: function() {
        this.close();
        ReachActivityTaskApp.trigger("include:activities");
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