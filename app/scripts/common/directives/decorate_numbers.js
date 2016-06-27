define(['angularAMD'],function (angularAMD) {
    'use strict';
    //This is a common directive to add comma to a number
    angularAMD.directive('decorateNumbers',function(workflowService){

        return {
            restrict: 'A',
            link: function(scope, el, attrs){

                el.bind('focus', function() {

                    // remove the commas again at focus
                    el.val(el.val().replace(/,/g , ""));
                });

                el.bind('keypress', function(e) {

                    // Only allows one dot and two commas
                    validate(e, this);
                });

                el.bind('blur', function(){
                    var x = el.val().split('.');
                    var x1 = x[0].replace(',','');
                    var val = x[0];
                    if(x.length > 1){
                        val = x[0] +'.'+x[1];
                    }

                    // Add two decimal digits
                    var value = parseFloat(Math.round(val * 100) / 100).toFixed(2);

                    // Add 1000 seperator
                    value = addCommas(value);

                    // Update inputs value
                    el.val(value);
                });



                function addCommas(nStr) {
                   return workflowService.addCommaToNumber(nStr);
                }

                function validate(evt, ele) {
                    var theEvent = evt || window.event;
                    var key = theEvent.keyCode || theEvent.which;
                    key = String.fromCharCode( key );
                    var value = ele.value + key;
                    var regex = /^\d+(.\d{0,2})?$/;
                    if(key == ",") {
                        theEvent.returnValue = false;
                        if(theEvent.preventDefault) theEvent.preventDefault();
                    }
                }
            }
        }

    });
});


