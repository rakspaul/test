/*
    Shows empty view using context object here to show particular context name in the empty view.
 */
ReachActivityTaskApp.module("Empty",function(Empty,ReachActivityTaskApp,BackBone,Marionette,$,_,JST){

    Empty.View = Marionette.ItemView.extend({
        template: JST['templates/common/empty'],
        className: "empty"
    });

    Empty.Context = BackBone.Model.extend({
        name: ""
    });

},JST);