define(['angularAMD', 'reporting/models/action_sub_type'], function (angularAMD) { // jshint ignore:line
    'use strict';

    var ActionSubType = function() {
        this.id = 0;
        this.name = '';
    };

    angularAMD.value('ActionSubType', ActionSubType);
});
