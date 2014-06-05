ReachActivityTaskApp.module("ActivitiesTasks.Tasks.List", function(List, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  List.Controller = {
    showTasks: function(tasks) {
      if(tasks.length == 0) {
        console.log("Rendering empty view");
        //preparing empty view here using empty context object
        var emptyContext = new ReachActivityTaskApp.Empty.Context({name:"Tasks"});
        var emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(emptyView);
      } else {
        List.tasksListView = new List.Tasks({
          collection: tasks
        });
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(List.tasksListView);
      }
    },

    showMoreTasks:function(tasks){
      if(tasks && tasks.length>0){
        tasks.each(function(task){
          console.log("Task to add:"+JSON.stringify(task));
          List.tasksListView.collection.add(task);
        });
        //present collection size
        var collectionLength = List.tasksListView.collection.length;
        if(collectionLength%ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH == 0){
          ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(true);
        } else {
          ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(false);
        }
      } else {
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.showHideLoadMoreControl(false);
      }
    },

    showTaskComments: function(comments) {
      if(comments.length == 0) {
        var emptyContext = new ReachActivityTaskApp.Empty.Context({name:"Task comments"});
        var emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});
        var taskCommentsRegion = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskCommentRegion();
        taskCommentsRegion.show(emptyView);
      } else {
        var taskCommentsView = new List.TaskCommentListView({collection: comments});
        var taskCommentsRegion = new ReachActivityTaskApp.ActivitiesTasks.Tasks.TaskCommentRegion();
        taskCommentsRegion.show(taskCommentsView);
      }
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
    }

  }
});
