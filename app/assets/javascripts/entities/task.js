ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _){

  Entities.Task = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/orders/' + ReachActivityTaskApp.order.id + '/tasks';
      }
    }
  });

  Entities.TaskCollection = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/tasks.json';
    },
    model: Entities.Task
  });

  Entities.TaskType = Backbone.Model.extend({
  });

  Entities.TaskTypeCollection = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/task_types.json'
    },

    model: Entities.TaskType
  });

  Entities.TaskComment = Backbone.Model.extend({
  });

  Entities.TaskCommentList = Backbone.Collection.extend({
    url: function() {
      return '/tasks/' + this.task.id + '/comments.json';
    },

    model: Entities.TaskComment,

    setTask: function(task) {
      this.task = task;
    }
  });

  var API = {
    getTaskEntities: function() {
      var tasks = new Entities.TaskCollection();
      var defer = $.Deferred();
      tasks.fetch({
          success: function(data) {
//            data=[];
            defer.resolve(data);
          },failure:function(data) {
            data=[];
            defer.resolve();
          }
      });
//      var promise = defer.promise();
//      $.when(promise).done(function(tasks){
//        console.log(JSON.stringify(tasks));
//      });
      return defer.promise();
    },

    saveTask: function(task) {
      if(!task) {
        return;
      }
      var defer = $.Deferred();
      task.save({
          success: function() {
            defer.resolve();
          },

          failure: function() {
            defer.resolve();
          }
      });
    },

    getTaskTypes: function() {
      var taskTypes = new Entities.TaskTypeCollection();
      var defer = $.Deferred();
      taskTypes.fetch({
          success: function(data) {
            defer.resolve(data);
          },

          failure: function() {
            defer.resolve();
          }
      });

      return defer.promise();
    },

    getTaskComments: function(task) {
      var taskComments = new Entities.TaskCommentList();
      taskComments.setTask(task);
      var defer = $.Deferred();
      taskComments.fetch({
          success: function(data) {
              console.log("task comments data: " + JSON.stringify(data));
            defer.resolve(data);
          },
          failure: function() {
            defer.resolve();
          }
      });

      return defer.promise();
    }
  };

  ReachActivityTaskApp.reqres.setHandler("task:entities", function(){
    return API.getTaskEntities();
  });

  ReachActivityTaskApp.reqres.setHandler("task:save", function(task){
    return API.saveTask(task);
  });

  ReachActivityTaskApp.reqres.setHandler("taskType:entities", function() {
    return API.getTaskTypes();
  });

  ReachActivityTaskApp.reqres.setHandler("taskComment:entities", function(task) {
    return API.getTaskComments(task);
  });

});
