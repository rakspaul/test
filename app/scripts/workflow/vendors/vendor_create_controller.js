define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreateVendorController', function () {

        // initial initialization
        $(function () {

            // This is for the drop down list. Perhaps adding this to a more general controller
            $(document).on('click', '.dropdown-menu li.available a', function () {
                $(this)
                    .parents('.dropdown')
                    .find('.btn')
                    .find('.text').text($(this).text());

                $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
            });

        });

    });
});
