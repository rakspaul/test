ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List", function(List, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  var _prepareEmptyListView = function (contextName) {
    // Preparing empty view here using empty context object
    var emptyContext = new ReachActivityTaskApp.Empty.Context({name: contextName}),
        emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});

    return emptyView;
  };

  var _isLoadMoreVisible = function (collectionSize) {
    return !(collectionSize == 0 || collectionSize % ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH != 0);
  }

  List.Controller = {
    showTasks: function(tasks) {
      if(tasks.length == 0) {
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(_prepareEmptyListView("Tasks"));
      } else {
        List.tasksListView = new List.Tasks({
          collection: tasks
        });
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(List.tasksListView);
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideMoreTasks(_isLoadMoreVisible(tasks.length));
    },

    showMoreTasks:function(tasks) {
      var collectionLength = tasks ? tasks.length : 0;
      if(collectionLength > 0) {
        tasks.each(function(task) {
          List.tasksListView.collection.add(task);
          task.collection = List.tasksListView.collection;
        });
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideMoreTasks(_isLoadMoreVisible(collectionLength));
    },

    showTaskComments: function(comments) {
      if(List.taskCommentsRegion == null)
        List.taskCommentsRegion = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskCommentsRegion();
      else
        List.taskCommentsRegion.reset();
      if(comments.length == 0) {
        List.taskCommentsRegion.show(_prepareEmptyListView("Task comments"));
      } else {
        List.taskCommentsView = new List.TaskCommentListView({collection: comments});
        List.taskCommentsRegion.show(List.taskCommentsView);
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskDetailView.showHideTaskComments(_isLoadMoreVisible(comments.length));
    },

    showTaskCommentInput: function(options) {
      var comment = new ReachActivityTaskApp.Entities.TaskComment();
      options.myRegion.show(new ReachActivityTaskApp.ActivitiesTasks.Tasks.List.TaskCommentInputView(_.extend(options, {model: comment})));
    },

    saveTaskComment: function(comment, options) {
      var saveTaskComment = ReachActivityTaskApp.request("taskComment:save", comment);
      $.when(saveTaskComment).done(function() {
        //when save comment happens reset to the most recent list
        options["offset"] = 0;
        ReachActivityTaskApp.trigger("taskComments:list", options);
      });
    },

    showMoreTaskComments:function(task){
      //get the offset for task comments.
      var offset = List.taskCommentsView.collection.length;
      var options = {};
      options.task = task;
      options.offset = offset;
      ReachActivityTaskApp.trigger("taskComments:list", options);
    },

    appendTaskComments:function(taskComments){
      var collectionLength = 0;
      if(taskComments)
        collectionLength = taskComments.length;
      if(collectionLength>0){
        taskComments.each(function(taskComment){
          List.taskCommentsView.collection.add(taskComment);
        });
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskDetailView.showHideTaskComments(_isLoadMoreVisible(collectionLength));
    },

    loadMoreTasks:function(){
      var offset = List.tasksListView.collection.length;
      ReachActivityTaskApp.trigger("load-more-tasks:list",offset);
    }
  }
});
