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

    var API = {
        getTaskEntities: function(){
            var tasks = new Entities.TaskCollection();
            var defer = $.Deferred();
            tasks.fetch({
                success: function(data){
                    data=[];
                    defer.resolve(data);
                },failure:function(data){
                    data=[];
                    defer.resolve();
                }
            });
            var promise = defer.promise();
            $.when(promise).done(function(tasks){
                console.log(JSON.stringify(tasks));
            });
            return promise;
        }
    };

    ReachActivityTaskApp.reqres.setHandler("task:entities", function(){
        return API.getTaskEntities();
    });

});
