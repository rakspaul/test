define(['angularAMD'],function (angularAMD) {

    angularAMD.factory('reportsUploadList', function () {
        var files = {};

        files.list = [];

        files.add = function (file) {
            files.list.push(file);
        };

        return files;
    });
});
