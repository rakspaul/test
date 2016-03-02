define(['angularAMD'],function (angularAMD) {
    'use strict';
  //This is a common directive to handle no data scenarios
  //TODO: Had planned to define directive dataNotFound. But, when I define that the directive is not rendering (<data-not-found>)
  //So, defined it as notFound.
    angularAMD.directive('notFound',function(){
      return{
        restrict:'EAC',
        templateUrl:'/views/data_not_found.html',
        scope :{
          message :'=',
          styleClass :'='
        }
      }
  });
});
