ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List",function(List,ReachActivityTaskApp,Backbone, Marionette, $, _,JST){

    List.Task = Marionette.ItemView.extend({
      tagName: 'div',
      template: JST['templates/activities_tasks/tasks/task_list_item'],
      className: 'task-container',

      events: {
        'click': 'showTaskView'
      },

      showTaskView: function() {
//        var taskDetailRegion = new List.TaskDetailRegion();
//        taskDetailRegion.show(new List.TaskDetailView({model: this.model}));
//
//        var taskCommentRegion = new List.TaskCommentRegion();
//        this._fetchTaskComments(this.model).then(function(taskComments) {
//          taskCommentRegion.show(new List.TaskCommentListView({collection: taskComments}));
//        });
//
//        if(this.model.collection.selectedTask) {
//          this.model.collection.selectedTask.$el.removeClass('task-selected');
//        }
//
//        this.model.collection.selectedTask = this;
//        this.$el.addClass('task-selected');

        ReachActivityTaskApp.trigger("include:taskDetails", {task: this.model});
      },

      _fetchTaskComments: function(task) {
        var taskCommentList = new ReachActivityTaskApp.Entities.TaskCommentList();
        taskCommentList.setTask(task);
        var self = this;
        return taskCommentList.fetch().then(
          function (collection, response, options) {
            return taskCommentList;
          },
          function (model, response, options) {
            console.log('Error getting task comments: ' + response);
          }
        );
      }
    });

    List.Tasks = Marionette.CollectionView.extend({
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

    List.TaskDetailRegion = Backbone.Marionette.Region.extend({
      el: '.task-details-table'
    });


    List.TaskCommentRegion = Backbone.Marionette.Region.extend({
      el: '.task-comments'
    });

    List.TaskDetailView = Backbone.Marionette.ItemView.extend({
      template: JST['templates/activities_tasks/tasks/task_detail'],

      model: List.Task,

      events: {
        'click .task-detail-view-close' : '_closeTaskDetailView'
      },

      _closeTaskDetailView: function() {
        this.close();
      },

      onShow: function() {
        this.$el.parent().parent().find('.activities-table').hide();
        this.$el.addClass('task-selected');
      },

      onClose: function() {
        this.$el.parent().parent().find('.activities-table').show();
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