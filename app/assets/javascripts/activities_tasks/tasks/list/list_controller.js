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
        var tasksListView = new List.Tasks({
          collection: tasks
        });
        ReachActivityTaskApp.ActivitiesTasks.Tasks.taskLayout.tasksListRegion.show(tasksListView);
      }
    }
  }
});
