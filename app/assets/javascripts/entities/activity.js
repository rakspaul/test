/*
    Entities module is responsible for doing crud operations on specific Entity.
 */
ReachActivityTaskApp.module("Entities", function(Entities, ReachActivityTaskApp, Backbone, Marionette, $, _){
    Entities.Activity = Backbone.Model.extend({
        defaults:{
            created_at: moment().format("YYYY-MM-DD"),
            activity_type:"comment",
            note: ""
        },

        url: function() {
            if(this.isNew()) {
                return '/orders/' + ReachActivityTaskApp.order.id + '/activities';
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
        this.set('task_types', ReachActivityTaskApp.taskTypes);
        this.set('users', ReachActivityTaskApp.taskTypes[0].get('users'));
        this.set('due_date', moment().add('days', ReachActivityTaskApp.taskTypes[0].get('default_sla')));

        return this;
      },

      defaults: {
        note: "",
        task_type_id: null,
        users: null
      }
    });

    var API = {
        /*
            fetch API
         */
        getActivities: function(filter){
            var activities = new Entities.ActivityCollection();
            var defer = $.Deferred();
            if(filter){
                console.log("Filter is existed"+ JSON.stringify(filter));
                activities.fetch({ data: $.param(filter),
                    success: function(data){
                        defer.resolve(data);
                    }
                });
            } else {
                console.log("Filter is not present");
                activities.fetch({
                    success: function(data){
                        defer.resolve(data);
                    }
                });
            }

            var promise = defer.promise();
            return promise;
        },

        saveActivity: function(activity){
            var defer = $.Deferred();
            if(activity){
                console.log("Saving activity:"+JSON.stringify(activity));
                activity.save({
                    success:function(){
                        defer.resolve();
                    },
                    fail:function(){
                         defer.resolve();
                    }
                });
            }
        }

        // Note: No need of update API as we don't support edit activity at this point of time.
    };

    /*
        Listens to "activity:entities" event.
     */
    ReachActivityTaskApp.reqres.setHandler("activity:entities", function(filter){
        return API.getActivities(filter);
    });

    /**
     *  Listens to activity:save event
     */
    ReachActivityTaskApp.reqres.setHandler("activity:save", function(activity){
        return API.saveActivity(activity);
    });

});
