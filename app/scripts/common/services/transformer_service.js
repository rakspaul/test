define(['angularAMD'], function (angularAMD) {

    var transformObject = function(jsonResult, constructor) {
    var model = new constructor();
    angular.extend(model, jsonResult);
    return model;
  };

  var transformResult = function(jsonResult, constructor) {
    var models = {}; var transformedObject;
    if (angular.isArray(jsonResult)) {
      angular.forEach(jsonResult, function (object) {
        transformedObject = transformObject(object, constructor);
        models[transformedObject.id] = transformedObject;
      });
    } else {
      transformedObject = transformObject(jsonResult, constructor);
      models = transformedObject;
    }
    return models;
  };

  var modelTransformer = function() {
    return {
      transform: transformResult
    };
  };

    angularAMD.factory("modelTransformer", modelTransformer);

});