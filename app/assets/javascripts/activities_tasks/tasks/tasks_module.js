ReachActivityTaskApp.module("ActivitiesTasks.Tasks",function(Tasks,ReachActivityTaskApp,BackBone,Marionette,$,_,JST){

    //by default, all sub-modules will start when parent module starts, this field will restrict module to start with parent start.
  this.startWithParent = false,

  Tasks.Layout = Marionette.Layout.extend({
    template: JST['templates/activities_tasks/tasks/task_content'],

    regions: {
      tasksListRegion: ".tasks-list"
    }
  });


  /*
     API to fetch tasks.
  */
  var API = {
    fetchTasks: function () {
      var fetchTasks = ReachActivityTaskApp.request("task:entities");
      $.when(fetchTasks).done(function(tasks) {
        console.log("Tasks data from server:"+ JSON.stringify(tasks));
        renderTasks(tasks);
      });
    }
  };

  /*
     After tasks fetch, this will render header and tasks list.
  */
  function renderTasks(tasks){
    Tasks.List.Controller.showTasks(tasks);
  }

  /*
     Listens to "include:tasks" event, this can be triggered by any part of application using trigger method on App object.
   */
  ReachActivityTaskApp.on("include:tasks", function(){
    Tasks.taskLayout = new Tasks.Layout();
    console.log("including tasks region");
    ReachActivityTaskApp.ActivitiesTasks.activitiesTasksLayout.tasksRegion.show(Tasks.taskLayout);
    ReachActivityTaskApp.trigger("tasks:list");
  });

  /*
     Listens to "tasks:list"
   */
  ReachActivityTaskApp.on("tasks:list", function(){
    //console.log("In Activities module");
    API.fetchTasks();
  });

},JST);