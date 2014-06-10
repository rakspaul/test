ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List", function(List, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  var _prepareEmptyListView = function (contextName) {
    // Preparing empty view here using empty context object
    var emptyContext = new ReachActivityTaskApp.Empty.Context({name: contextName}),
        emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});

    return emptyView;
  };

  var _isLoadMoreVisible = function (taskLength) {
    return !(taskLength == 0 || taskLength % ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH != 0);
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

      if(tasks.length == 0 || tasks.length%ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH!=0){
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(false);
      } else {
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(true);
      }
    },

    showMoreTasks:function(tasks){
      if(tasks && tasks.length>0){
        tasks.each(function(task){
          console.log("Task to add:"+JSON.stringify(task));
          List.tasksListView.collection.add(task);
        });
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(
          _isLoadMoreVisible(tasks.length)
      );
    },

    showTaskComments: function(comments) {
      var taskCommentsRegion = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskCommentsRegion();
      if(comments.length == 0) {
        taskCommentsRegion.show(_prepareEmptyListView("Task comments"));
      } else {
        var taskCommentsView = new List.TaskCommentListView({collection: comments});
        taskCommentsRegion.show(taskCommentsView);
      }
    },

    showTaskCommentInput: function(options) {
//      var taskCommentInputRegion = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskCommentInputRegion();
      var comment = new ReachActivityTaskApp.Entities.TaskComment();
      options.myRegion.show(new ReachActivityTaskApp.ActivitiesTasks.Tasks.List.TaskCommentInputView(_.extend(options, {model: comment})));
    },

    saveTaskComment: function(comment, options) {
      var saveTaskComment = ReachActivityTaskApp.request("taskComment:save", comment);
      $.when(saveTaskComment).done(function() {
        ReachActivityTaskApp.trigger("taskComments:list", options);
      });
    },

    loadMoreTasks:function(){
      var offset = List.tasksListView.collection.length;
      console.log("Load more tasks controller");
      console.log("Offset of the view is:"+offset);
      ReachActivityTaskApp.trigger("load-more-tasks:list",offset);
    },

    showAllTasks: function(taskList) {
      if(taskList.length == 0) {
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(_prepareEmptyListView("Tasks"));
      } else {
        List.tasksListView = new List.Tasks({
          collection: taskList
        });
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(List.tasksListView);
      }
      ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(
        _isLoadMoreVisible(taskList.length)
      );
    }
  }
});
