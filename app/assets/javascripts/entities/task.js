ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _){

  Entities.TaskPageContext = {VIEW:{INSIDE_ORDER:"INSIDE-ORDER-VIEW",ASSIGNED_ME:"ASSIGNED-TO-ME-VIEW",TASK:"TASK-VIEW"}};

  Entities.Task = Backbone.Model.extend({
    defaults: {
      is_closed: false,
      original_filename: null
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + ReachActivityTaskApp.order.id + '/tasks';
      } else {
        return '/tasks/' + this.get('id');
      }
    },

    isClosed: function() {
      return this.get('task_state') == 'close';
    },

    isUrgent: function() {
      return this.get('important');
    }


  });

  Entities.TaskCollection = Backbone.Collection.extend({
    context:undefined,
    initialize: function(models,options) {
       this.context = options.context;
    },

    url:function(){
      if(this.context == Entities.TaskPageContext.VIEW.INSIDE_ORDER)
        return '/orders/' + ReachActivityTaskApp.order.id + '/tasks.json';
      else if(this.context == Entities.TaskPageContext.VIEW.ASSIGNED_ME)
        return '/tasks/assigned_to_me.json';
      else
        return  "";
    },
    model: Entities.Task
  });

 /* Entities.AssignedToMeTasks = Backbone.Collection.extend({
    url: "/tasks/assigned_to_me.json",
    model: Entities.Task
  });*/

  Entities.TaskType = Backbone.Model.extend({
  });

  Entities.TaskTypeCollection = Backbone.Collection.extend({
    url: function() {
      return '/task_types.json'
    },

    model: Entities.TaskType
  });

  Entities.TaskComment = Backbone.Model.extend({
    defaults: {
      original_filename: null
    },

    url: function() {
      if(this.isNew()) {
        return '/tasks/' + this.task.id + '/add_comment.json';
      }
    },

    setTask: function(task) {
      this.task = task;
    }

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

    getTaskEntities: function(offset,context) {
      var tasks = new Entities.TaskCollection([],{context:context}),
          filter = {},
          defer = $.Deferred();

      //default filter.
      filter["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
      filter["offset"] = Entities.DEF_OFFSET;

      if(offset){
        filter["offset"] = offset;
      }

      tasks.fetch({
          data: $.param(filter),
          success: function(data) {
            defer.resolve(data);
          },
          error: function() {
            defer.resolve();
          }
        });

      return defer.promise();
    },

    saveTask: function(task) {
      var defer = $.Deferred();

      if (!task) {
        return;
      }
      task.save({
        success: function() {
          defer.resolve();
        },
        error: function() {
          defer.reject();
        }
      });
    },

    getTaskTypes: function() {
      var taskTypes = new Entities.TaskTypeCollection(),
          defer = $.Deferred();

      taskTypes.fetch({
        success: function(data) {
          defer.resolve(data);
        },

        error: function() {
          defer.reject();
        }
      });

      return defer.promise();
    },

    getTaskComments: function(task,offset) {
      var taskComments = new Entities.TaskCommentList(),filter = {};
      taskComments.setTask(task);
      var defer = $.Deferred();

      //default filter.
      filter["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
      filter["offset"] = Entities.DEF_OFFSET;

      if(offset){
        filter["offset"] = offset;
      }


      taskComments.fetch({data:$.param(filter),
          success: function(data) {
            defer.resolve(data);
          },
          failure: function() {
            defer.reject();
          }
      });
      return defer.promise();
    },

    saveTaskComment: function(comment) {
      var defer = $.Deferred();
      comment.save(comment.attributes, {
        success: function() {
          var comments_count = (comment.task.get('comments_size') || 0) + 1;
          comment.task.set('comments_size', comments_count);
          defer.resolve();
        },

        failure: function() {
          defer.resolve();
        }
      });
    }
  };

  ReachActivityTaskApp.reqres.setHandler("task:entities", function(offset,context){
    return API.getTaskEntities(offset,context);
  });

  ReachActivityTaskApp.reqres.setHandler("task:save", function(task){
    return API.saveTask(task);
  });

  ReachActivityTaskApp.reqres.setHandler("taskType:entities", function() {
    return API.getTaskTypes();
  });

  ReachActivityTaskApp.reqres.setHandler("taskComment:entities", function(task,offset) {
    return API.getTaskComments(task,offset);
  });

  ReachActivityTaskApp.reqres.setHandler("taskComment:save", function(comment) {
    API.saveTaskComment(comment);
  });
});
