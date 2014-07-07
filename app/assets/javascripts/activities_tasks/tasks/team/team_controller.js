ReachActivityTaskApp.module("ActivitiesTasks.Tasks.Team", function (Team, ReachActivityTaskApp, Backbone, Marionette, $, _) {

  var _prepareEmptyListView = function(contextName) {
    // Preparing empty view here using empty context object
    var emptyContext = new ReachActivityTaskApp.Empty.Context({name: contextName}),
      emptyView = new ReachActivityTaskApp.Empty.View({model:emptyContext});

    return emptyView;
  };

  var _isLoadMoreVisible = function(collectionSize) {
    return !(collectionSize == 0 || collectionSize % ReachActivityTaskApp.Entities.DEF_NO_OF_ROWS_TO_FETCH != 0);
  };

    // This controller is responsible for handling Team View
  Team.Controller = {
    showTasks: function(taskLayout, tasks) {
      if(tasks.length == 0) {
        taskLayout.tasksListRegion.show(_prepareEmptyListView("Tasks"));
      } else {
        taskLayout.setTaskListView(new Team.TaskListView({collection: tasks}));
        taskLayout.tasksListRegion.show(taskLayout.getTaskListView());
      }
      taskLayout.showHideMoreTasks(_isLoadMoreVisible(tasks.length));
    },

    showMoreTasks:function(taskLayout, tasks) {
      var collectionLength = tasks ? tasks.length : 0;
      if(collectionLength > 0) {
        tasks.each(function(task) {
          taskLayout.getTaskListView().collection.add(task);
          task.collection = taskLayout.getTaskListView().collection;
        });
      }
      taskLayout.showHideMoreTasks(_isLoadMoreVisible(collectionLength));
    }

  }
});