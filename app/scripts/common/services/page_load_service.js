define(['angularAMD'], function (angularAMD) {
    angularAMD.service('pageLoad', [function () {
        var hidePageLoader = function () {
            $('#pageLoader').css('display', 'none');
        };

        return {
            hidePageLoader: hidePageLoader
        };
    }]);
});
