(function () {
    "use strict";
    angObj.factory("platformCustomeModule", function ($timeout) {

        var _self = this;
        //private method
        var platformHeader = function(pJson, elem) {
            var platformHTML = '<div class="col-md-12 platformHeading zeroPadding">';
            platformHTML += '<div class="col-md-8 zeroPadding">'+ pJson.displayName+'<br/>';
            platformHTML += '</div>';
            platformHTML += ' <div class="col-md-4 zeroPadding pull-left clearLeft"><a href="javascript:void(0);">'+pJson.subName+'</a></div>'
            platformHTML + '</div>';
            elem.append(platformHTML);
        };

        var selectPlatform = function(selectedValue, inputList, platformCustomInputChildrenGroupList, dependentItems) {
            if(dependentItems == 'selectBoxchkDependentItems') {
                _self.elem.find("div[relationwith=selectBoxchkDependentItems]").length >0 && _self.elem.find("div[relationWith=selectBoxchkDependentItems]").remove();
                _self.elem.find("div[relationwith=chkDependentItems]").length >0 && _self.elem.find("div[relationWith=chkDependentItems]").remove();
            }

            if(dependentItems == 'chkDependentItems') {
                _self.elem.find("div[relationwith=chkDependentItems]").length >0 && _self.elem.find("div[relationWith=chkDependentItems]").remove();
            }


            var activationOrderList = _self.platformCustomInputActivationOrderList;
            var selectedOrderList = _.filter(activationOrderList, function(obj) { return obj.value === $.trim(selectedValue) && obj.platformCustomInputId === inputList.id });
            if(selectedOrderList.length >0) {
                var platformCustomInputGroupId = selectedOrderList[0].platformCustomInputGroupId;
                var Item = _.filter(platformCustomInputChildrenGroupList, function(obj) { return obj.id === platformCustomInputGroupId});
                if(Item.length >0) {
                    Item =  Item[0];
                    Item['relationWith'] = dependentItems;
                }
                createPlatformCustomInputList(Item , _self.elem);
            }
        }

        var adsEditDefaultValueMapper = function(adPlatformCustomInputs, inputList) {
            console.log(adPlatformCustomInputs);
            console.log(inputList);
            _.each(adPlatformCustomInputs, function(obj) {
                if(obj.platformCustomInputId === inputList.id) {
                    inputList.defaultValue = obj.value;
                    console.log("111", obj);
                }
            })
        }

        var createInputElem = function(inputList, inputGroupList, idx) {
            if(_self.adPlatformCustomInputs) {
                adsEditDefaultValueMapper(_self.adPlatformCustomInputs, inputList);
            }
            var inputWrapper = $('<div/>').addClass('form-group-section').attr({
                'relationWith' : inputGroupList.relationWith
            });

            if(inputList.name === 'target_reach.autobid_option') {
                inputWrapper.addClass('auto-bid-option');
            }

            if(inputList.displayName !== "") {
                if(inputList.displayName !== 'NA') {
                    var fieldLabel = $('<span />').addClass('greyTxt col-md-12 zeroPadding').text(inputList.displayName);
                    inputWrapper.append(fieldLabel);
                }
            }

            if(inputList.platformCustomWidgetType ==='DROPDOWN') {
                var options = inputList.rangeJson.split(',');
                var inputListHTML = $('<select/>').addClass('form-control col-md-12 na').addClass(inputList.decoratorOrientation.toLowerCase()).attr({
                    'required': inputList.isMandatory ==='required' ? true : false,
                    'name' : inputList.name+"$$"+inputList.id
                }).on('change', function() {
                    if(inputList.dependentGroups) {
                        selectPlatform(this.value, inputList, inputGroupList.platformCustomInputChildrenGroupList, 'selectBoxchkDependentItems');
                    }
                });
                $timeout(function() {
                    if(inputList.defaultValue) {
                        inputListHTML.trigger('change');
                    }
                }, 500)

                //selectPlatform(inputList.defaultValue, inputList, inputGroupList.platformCustomInputChildrenGroupList, 'selectBoxDependentItems')

                _.each(options, function(option) {
                    var optionElem = $('<option/>').attr({
                        'value': option,
                        'name' : inputList.name,
                        'selected': inputList.defaultValue === option ? true : false
                    }).text(option);
                    inputListHTML.append(optionElem);
                })
                inputWrapper.append(inputListHTML);
            }

            if(inputList.platformCustomWidgetType === 'CHECKBOX' || inputList.platformCustomWidgetType === 'TEXTBOX') {

                var platformCustomWidgetType = inputList.platformCustomWidgetType;
                var type = platformCustomWidgetType === 'CHECKBOX' ? 'checkbox' : 'number';
                var options = inputList.rangeJson && JSON.parse(inputList.rangeJson);
                var inputListHTML = $('<input/>').attr({
                    'type': type,
                    'required': inputList.isMandatory,
                    'name' : type !== 'checkbox' ? inputList.name+"$$"+inputList.id : '',
                    'id' : inputList.name,
                    'value': inputList.defaultValue ,
                    'min': options.min,
                    'max': options.max
                });

                if(inputList.decorator !== 'NA')
                    var decoratorHTML = $('<span />').text(inputList.decorator).appendTo(inputWrapper).addClass('decoratorFloat');

                if(platformCustomWidgetType === 'CHECKBOX') {
                    inputListHTML.addClass('cmn-toggle cmn-toggle-round').attr({
                        'id': 'cmn-toggle-'+(idx+1),
                        checked : inputList.defaultValue ==='TRUE' ? true : false
                    });
                    inputWrapper.append(inputListHTML);
                    var hiddenInputField = $('<input />').attr({
                        'type' : 'hidden',
                        'name' : inputList.name+"$$"+inputList.id,
                        'value' : inputList.defaultValue,
                    }).appendTo(fieldLabel);

                    inputListHTML && inputListHTML.on('change', function() {
                        var chkSelValue = this.checked ?  "TRUE" : "FALSE";
                        if(inputList.dependentGroups) {
                            selectPlatform(chkSelValue , inputList, inputGroupList.platformCustomInputChildrenGroupList, 'chkDependentItems');
                        }
                        hiddenInputField.attr('value' , chkSelValue);
                    })
                    var label = $('<label for="cmn-toggle-'+(idx+1)+'"/>');
                    inputWrapper.append(label);



                    if(inputList.defaultValue === 'TRUE') {
                        $timeout(function() {
                            inputListHTML.trigger('change');
                        }, 300)

                    }

                } else {
                    inputListHTML.addClass('form-control col-md-12');
                    inputWrapper.append(inputListHTML);
                }
            }
            if(inputList.platformCustomWidgetType === 'LABEL') {
                inputWrapper.removeClass('form-group-section');
                var LabelHTML = $('<span />').addClass('pull-left clearLeft').text(inputList.defaultValue);
                inputWrapper.append(LabelHTML);
            }

            //adding validation for custom field.
            inputListHTML && inputListHTML.on('blur', function(){
                var field =  $(this);
                var value = parseFloat(field.val());
                var maxValue = Number(field.attr("max"));
                var minValue = Number(field.attr("min"));
                $(".customFieldErrorMsg").remove();
                if(value.length === 0){
                    field.after('<div class="customFieldErrorMsg">'+inputList.displayName+' is required</div>');
                    return false;
                }

                var blackoutPeriodElem;
                if(inputList.displayName == 'Blackout Period' || inputList.displayName == 'Ramp Duration' ) {
                    blackoutPeriodElem = field.parents('.form-group').find('.form-group-section')[1];
                    var blackPeriodsValue = $(blackoutPeriodElem).find('select').val();
                    //console.log("blackPeriodsValue", blackPeriodsValue);
                    if (blackPeriodsValue === 'Days') {
                        maxValue = maxValue / 24;
                    }
                } else if(inputList.displayName === 'NA') {
                    blackoutPeriodElem = field.parents('.form-group').find('.form-group-section')[0];
                    $(blackoutPeriodElem).find("input").trigger('blur');

                }

                if(inputList.displayName == 'Min. Bid' || inputList.displayName === 'Min.') {
                    //console.log("elem", field.parents('.form-group').find('.form-group-section')[0]);
                    var maxBidElem = field.parent().next();
                    console.log("maxBidElem", maxBidElem);
                    var maxBidElemValue = parseFloat($(maxBidElem).find('input').val());
                    if(value > maxBidElemValue) {
                        field.after('<div class="customFieldErrorMsg">Min bid value should be less than Max bid value</div>');
                    }
                    return false;
                }

                if(inputList.displayName == 'Max. Bid' || inputList.displayName === 'Max.') {
                    var minBidElem = field.parent().prev();
                    var minBidElemValue = parseFloat($(minBidElem).find('input').val());
                    if(minBidElemValue > value) {
                        field.after('<div class="customFieldErrorMsg">Max bid value should be greater than Min bid value</div>');
                    }
                    return false;
                }

                if(inputList.displayName !== 'NA') {
                    if (value < minValue) {
                        field.after('<div class="customFieldErrorMsg">' + inputList.displayName + ' must be greater than or equal to '+minValue+'</div>');
                    } else if (value > maxValue) {
                        field.after('<div class="customFieldErrorMsg">' + inputList.displayName + ' must be less than or equal to '+maxValue+'</div>');
                    }
                }
            })
            return inputWrapper;
        };

        var createPlatformCustomInputList =  function(inputGroupList, elem, noGroup) {
            _self.inputGroupList = inputGroupList;
            var platformCustomInputList = _.sortBy(inputGroupList.platformCustomInputList, 'displayOrder');
            if(platformCustomInputList.length >0) {
                var groupConatiner =  $('<div/>').addClass("form-group col-md-12 zeroPadding").addClass(noGroup ? 'form-individual-section' : '')
            }
            _.each(platformCustomInputList, function(inputList, idx) {
                groupConatiner.append(createInputElem(inputList, inputGroupList, idx, 'group'));
            })
            elem.append(groupConatiner);

        }

        var buildInputControl = function(inputGroupList, elem, noGroup) {
            createPlatformCustomInputList(inputGroupList, elem, noGroup);
            var platformCustomInputChildrenGroupList = inputGroupList.platformCustomInputChildrenGroupList;
            _.each(platformCustomInputChildrenGroupList, function(inputGroupList) {
                if(inputGroupList.isActivated) {
                    buildInputControl(inputGroupList, elem);
                }
            })
        };

        var buildFormControl =  function(pJson, elem) {
            var platformCustomInputGroupList = pJson.platformCustomInputGroupList
            _.each(platformCustomInputGroupList, function(inputGroupList) {
                if(inputGroupList.isActivated) {
                    buildInputControl(inputGroupList, elem, true);
                }
            })
        }

        var init = function (platformCustomeJson, elem, adPlatformCustomInputs) {
            elem.html('');
            _self.elem = elem;
            _self.adPlatformCustomInputs= adPlatformCustomInputs;
            _self.platformCustomInputNamespaceList = platformCustomeJson.platformCustomInputNamespaceList;
            _self.platformCustomInputActivationOrderList = platformCustomeJson.platformCustomInputActivationOrderList;
            _.each(_self.platformCustomInputNamespaceList, function(pJson) {
                platformHeader(pJson, elem)
                buildFormControl(pJson, elem)
            })
        };

        return {
            init: init
        };
    });
}());