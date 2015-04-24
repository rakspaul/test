/*global angObj, angular*/
(function () {
    "use strict";
    angObj.factory("domainReports", [ function () {

        return {
            getReportsDropDowns : function() {
                return {
                    'tabs' : [
                        {
                            href:'performance',
                            title: 'Performance'
                        },
                        {
                            href:'cost',
                            title: 'Cost'
                        },
                        {
                            href:'inventory',
                            title: 'Inventory'
                        },
                        {
                            href:'viewability',
                            title: 'Viewability'
                        },
                        {
                            href:'optimization',
                            title: 'Optimization Impact'
                        }

                    ],

                    activeTab : document.location.pathname.substring(1)
                }
            }
        };
    }]);
}());