/**
 * Controller for Header view.
 */
ReachActivityTaskApp.module("ActivitiesTasks.Activities.Header", function(Header, ReachActivityTaskApp, Backbone, Marionette, $, _){
    Header.Controller = {

        showActivities: function(activites,showFilters){
            var headerLayout = new Header.Layout();
             ReachActivityTaskApp.ActivitiesTasks.Activities.activitiesLayout.headerRegion.show(headerLayout);
             //if actvities is empty then we don't need to show the filters.
             if((activites==null || activites.length==0) && !showFilters){
                 headerLayout.$('.header-controls').hide();
             } else {
                 headerLayout.$('.header-controls').show();
             }
         },

        //Header view call this method on specific filter and pass the filter type along.
        fetchActivities: function(type){
            //preparing a filter model to pass to the server.
            var filter = this.getFilterModel(type);
            //Note: When a filter is triggered on the UI, we should not hide filters any more though particular filter doesn't have activities list.
            ReachActivityTaskApp.trigger("activities:list",filter);
        },

        //Get filter model method.
        getFilterModel:function(type,value){
            var filterModel = {};
            filterModel.type = type;
            if(value){
                filterModel.value = value;
            }
            console.log("This will filter activities by "+type+" type"+ JSON.stringify(filterModel));
            return filterModel;
        },

        //saving activity
        saveActivity:function(type,value){
            var activity = new ReachActivityTaskApp.Entities.Activity();
            activity.set("activity_type",type);
            activity.set("note",value);
            console.log(JSON.stringify(activity));
            var fetchActivity = ReachActivityTaskApp.request("activity:save",activity);
            $.when(fetchActivity).done(function(activity){
                ReachActivityTaskApp.trigger("activities:list");
            });
        }

    };

});
