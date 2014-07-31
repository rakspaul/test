/*
 Entities module is responsible for doing crud operations on specific Entity.
 */
ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _){

  Entities.Activity = Backbone.Model.extend({
    defaults:{
      created_at: moment().format("YYYY-MM-DD HH:mm"),
      activity_type: "comment",
      note: "",
      original_filename: null
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + ReachActivityTaskApp.order.id + '/activities.json';
      }
    }
  });

  Entities.ActivityCollection = Backbone.Collection.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/activities.json';
    },
    model: Entities.Activity
  });

  Entities.MasterActivity = Backbone.Model.extend({
    url: function() {
      return '/orders/' + ReachActivityTaskApp.order.id + '/activities.json';
    },

    initialize: function() {
      this.set('due_date', ReachActivityTaskApp.taskTypes[0].get('default_due_date'));
      this.set('important', false);
      this.set('errors', {});

      return this;
    },

    defaults: {
      note: "",
      task_type_id: null,
      users: null,
      original_filename: null
    }
  });

  var API = {
    /*
     fetch API
     */
    getActivities: function(filters, offset) {
      var activities = new Entities.ActivityCollection();
      var defer = $.Deferred();

      var params = {};
      //default filter.
      params["limit"] = Entities.DEF_NO_OF_ROWS_TO_FETCH;
      params["offset"] = Entities.DEF_OFFSET;
      if(filters && offset) {
        params["filters"] = filters;
        params["offset"] = offset;
      } else if(filters) {
        params["filters"] = filters;
      } else {
        params["offset"] = offset;
      }

      activities.fetch({ data: $.param(params),
        success: function(data){
          defer.resolve(data);
        }
      });

      return defer.promise();
    },

    saveActivity: function(activity) {
      var defer = $.Deferred();
      if(activity) {
        activity.save({
          success:function() {
            defer.resolve();
          },
          fail:function() {
            defer.resolve();
          }
        });
      }
    },

    saveActivityLocally: function(activity) {
      if(!ReachActivityTaskApp.order) {
        return;
      }
      var collection = ReachActivityTaskApp.order.get('notes') || [];
      collection.push(activity);
      ReachActivityTaskApp.order.set('notes', collection);
    }

    // Note: No need of update API as we don't support edit activity at this point of time.
  };

  /*
   Listens to "activity:entities" event.
   */
  ReachActivityTaskApp.reqres.setHandler("activity:entities", function(filter, offset) {
    return API.getActivities(filter, offset);
  });

  /**
   *  Listens to activity:save event
   */
  ReachActivityTaskApp.reqres.setHandler("activity:save", function(activity) {
    return API.saveActivity(activity);
  });

  ReachActivityTaskApp.reqres.setHandler("activity:saveLocally", function(activity) {
    return API.saveActivityLocally(activity);
  });

});
