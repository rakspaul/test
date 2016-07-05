define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    var transformObject = function (jsonResult, constructor) {
            var model = new constructor();

            angular.extend(model, jsonResult); // jshint ignore:line

            return model;
        },

        transformResult = function(jsonResult, constructor) {
            var models = {},
                transformedObject;

            if (angular.isArray(jsonResult)) { // jshint ignore:line
                angular.forEach(jsonResult, function (object) { // jshint ignore:line
                    transformedObject = transformObject(object, constructor);
                    models[transformedObject.id] = transformedObject;
                });
            } else {
                transformedObject = transformObject(jsonResult, constructor);
                models = transformedObject;
            }

            return models;
        },

        modelTransformer = function () {
            return {
                transform: transformResult
            };
        };

    angularAMD.factory('modelTransformer', modelTransformer);
});