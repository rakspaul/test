define(['angularAMD', 'action-sub-type'], function (angularAMD) {
    'use strict';

    var ActionSubType = function() {
        this.id = 0;
        this.name = '';
    };

    angularAMD.value('ActionSubType', ActionSubType);
});
