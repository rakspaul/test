define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    angularAMD.factory('reportsUploadList', function () {
        var files = {};

        files.list = [];

        files.add = function (file) {
            files.list.push(file);
        };

        return files;
    });
});
