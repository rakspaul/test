define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD.controller('CreateVendorController', function (pageLoad) {
        console.log('VENDOR CREATE controller is loaded!');
        // Hide page loader when the page is loaded
        pageLoad.hidePageLoader();

<<<<<<< HEAD:app/scripts/workflow/vendors_config/vendor_config_controller.js
        vm.constants = constants;
        vm.vendorConfig = vendorConfigService.vendorConfig;

        vm.highlightLeftNav = function (pageNo) {
            var eachStepCompLabel = $('.eachStepCompLabel');

            eachStepCompLabel.removeClass('active');
            eachStepCompLabel[pageNo].classList.add('active');
        };
    }]);
=======
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
>>>>>>> a0d8ede056245e914950b91e1807576bb15f167e:app/scripts/workflow/vendors/vendor_create_controller.js
});
