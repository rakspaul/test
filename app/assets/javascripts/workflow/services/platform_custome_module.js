(function () {
    'use strict';

    angObj.factory('platformCustomeModule', function ($timeout, constants, $locale, utils) {
        var _self = this;
        var textConstants = constants;

        //private method
        var platformHeader = function (pJson, elem) {
            var platformHTML = '<div class="col-md-12 platformHeading zeroPadding">';
            platformHTML += '<div class="col-md-8 zeroPadding">' + pJson.displayName + '<br/>';
            platformHTML += '</div>';
            platformHTML += ' <div class="col-md-4 zeroPadding pull-left clearLeft"><a href="javascript:void(0);">' +
                pJson.subName + '</a></div>';
            platformHTML += '</div>';
            elem.append(platformHTML);
        };

        var selectPlatform = function (selectedValue, inputList, platformCustomInputChildrenGroupList, dependentItems) {
            var activationOrderList,
                selectedOrderList,
                platformCustomInputGroupId,
                item;

                if (dependentItems === 'selectBoxchkDependentItems') {
                _self
                    .elem
                    .find('div[relationwith=selectBoxchkDependentItems]')
                    .length > 0 && _self.elem.find('div[relationWith=selectBoxchkDependentItems]')
                    .remove();
                _self
                    .elem
                    .find('div[relationwith=chkDependentItems]')
                    .length > 0 && _self.elem.find('div[relationWith=chkDependentItems]')
                    .remove();
            }

            if (dependentItems === 'chkDependentItems') {
                _self
                    .elem
                    .find('div[relationwith=chkDependentItems]')
                    .length > 0 && _self.elem.find('div[relationWith=chkDependentItems]')
                    .remove();
            }

            activationOrderList = _self.platformCustomInputActivationOrderList;
            selectedOrderList = _.filter(activationOrderList, function (obj) {
                return obj.value === $.trim(selectedValue) && obj.platformCustomInputId === inputList.id;
            });


            var platformCustomInputGroupFunc = function (orderList) {
                platformCustomInputGroupId = orderList.platformCustomInputGroupId;
                item = _.filter(platformCustomInputChildrenGroupList, function (obj) {
                    return obj.id === platformCustomInputGroupId;
                });
                if (item.length > 0) {
                    item =  item[0];
                    item.relationWith = dependentItems;
                }
                createPlatformCustomInputList(item, _self.elem);
            };

            if (selectedOrderList.length > 0) {
                _.each(selectedOrderList, function (orderList) {
                    platformCustomInputGroupFunc(orderList);
                });
            }
        };

        var adsEditDefaultValueMapper = function (adPlatformCustomInputs, inputList) {
            _.each(adPlatformCustomInputs, function (obj) {
                if (obj.platformCustomInputId === inputList.id) {
                    inputList.defaultValue = obj.value;
                }
            });
        };

        var createInputElem = function (inputList, inputGroupList, idx) {
            var inputWrapper,
                options,
                inputListHTML,
                type,
                platformCustomWidgetType,
                decoratorText,
                decoratorHtml,
                label,
                LabelHtml,
                fieldLabel,
                hiddenInputField;

            if (_self.adPlatformCustomInputs) {
                adsEditDefaultValueMapper(_self.adPlatformCustomInputs, inputList);
            }

            inputWrapper =
                $('<div/>')
                    .addClass('form-group-section')
                    .attr({
                        'relationWith' : inputGroupList.relationWith
                    });

            if (inputList.name === 'target_reach.autobid_option') {
                inputWrapper.addClass('auto-bid-option');
            }

            if (inputList.displayName !== '') {
                if (inputList.displayName !== 'NA') {
                    fieldLabel =
                        $('<span />')
                            .addClass('greyTxt col-md-12 zeroPadding')
                            .text(inputList.displayName);
                    inputWrapper.append(fieldLabel);
                }
            }

            if (inputList.platformCustomWidgetType === 'DROPDOWN') {
                options = inputList.rangeJson.split(',');
                inputListHTML =
                    $('<select/>')
                        .addClass('form-control col-md-12 na')
                        .addClass(inputList.decoratorOrientation.toLowerCase())
                        .attr({
                            'required': inputList.isMandatory ==='required' ? true : false,
                            'name' : inputList.name + '$$' + inputList.id
                        })
                        .on('change', function () {
                            if (inputList.dependentGroups) {
                                selectPlatform(this.value, inputList, inputGroupList.platformCustomInputChildrenGroupList,
                                    'selectBoxchkDependentItems');
                            }
                        });

                $timeout(function () {
                    if (inputList.defaultValue) {
                        inputListHTML.trigger('change');
                    }
                }, 500);

                //selectPlatform(inputList.defaultValue, inputList, inputGroupList.platformCustomInputChildrenGroupList,
                // 'selectBoxDependentItems')

                _.each(options, function (option) {
                    var optionElem = $('<option/>').attr({
                        'value': option,
                        'name' : inputList.name,
                        'selected': inputList.defaultValue === option ? true : false
                    }).text(option);
                    inputListHTML.append(optionElem);
                });
                inputWrapper.append(inputListHTML);
            }

            if (inputList.platformCustomWidgetType === 'CHECKBOX' || inputList.platformCustomWidgetType === 'TEXTBOX') {
                platformCustomWidgetType = inputList.platformCustomWidgetType;
                type = platformCustomWidgetType === 'CHECKBOX' ? 'checkbox' : 'number';
                options = inputList.rangeJson && JSON.parse(inputList.rangeJson);
                inputListHTML = $('<input/>').attr({
                    'type': type,
                    'required': inputList.isMandatory,
                    'name' : type !== 'checkbox' ? inputList.name + '$$' + inputList.id : '',
                    'id' : inputList.name,
                    'value': inputList.defaultValue ,
                    'min': options.min,
                    'max': options.max
                });

                if (inputList.decorator !== 'NA') {
                    decoratorText = (inputList.decorator === 'CLIENT_CUR' ?
                        $locale.NUMBER_FORMATS.CURRENCY_SYM :
                        inputList.decorator);
                    decoratorHtml =
                        $('<span />')
                            .text(decoratorText)
                            .appendTo(inputWrapper)
                            .addClass('decoratorFloat');
                }

                if (platformCustomWidgetType === 'CHECKBOX') {
                    inputListHTML
                        .addClass('cmn-toggle cmn-toggle-round')
                        .attr({
                            'id': 'cmn-toggle-' + (idx + 1),
                            checked : inputList.defaultValue ==='TRUE' ? true : false
                        });
                    inputWrapper.append(inputListHTML);
                    hiddenInputField =
                        $('<input />')
                            .attr({
                                'type' : 'hidden',
                                'name' : inputList.name + '$$' + inputList.id,
                                'value' : inputList.defaultValue
                            })
                            .appendTo(fieldLabel);

                    inputListHTML && inputListHTML.on('change', function () {
                        var chkSelValue = this.checked ?  'TRUE' : 'FALSE';

                        if (inputList.dependentGroups) {
                            selectPlatform(chkSelValue , inputList, inputGroupList.platformCustomInputChildrenGroupList,
                                'chkDependentItems');
                        }
                        hiddenInputField.attr('value' , chkSelValue);
                    });

                    label = $('<label for="cmn-toggle-' + (idx + 1) + '"/>');
                    inputWrapper.append(label);

                    if (inputList.defaultValue === 'TRUE') {
                        $timeout(function () {
                            inputListHTML.trigger('change');
                        }, 300);
                    }
                } else {
                    inputListHTML.addClass('form-control col-md-12');
                    inputWrapper.append(inputListHTML);
                }
            }

            if (inputList.platformCustomWidgetType === 'LABEL') {
                inputWrapper.removeClass('form-group-section');
                LabelHtml = $('<span />').addClass('pull-left clearLeft').text(inputList.defaultValue);
                inputWrapper.append(LabelHtml);
            }

            inputListHTML && inputListHTML.on('keypress keyup', function (evt) {
                var charCode = (evt.which) ? evt.which : window.event.keyCode;

                if (charCode === 101) {
                    return false;
                }
            });

            inputListHTML && inputListHTML.on('blur', function () {
                var field =  $(this),
                    value =  field.val() ? parseFloat(field.val())  : '',
                    maxValue = Number(field.attr('max')),
                    minValue = Number(field.attr('min')),
                    fieldValid = true,
                    blackoutPeriodElem,
                    minMaxFlag,
                    maxBidElem,
                    maxBidValue,
                    minBidElem,
                    minBidValue,
                    blackPeriodsValue;

                field
                    .parent()
                    .find('.customFieldErrorMsg')
                    .remove();

                if (value.length === 0) {
                    field.after('<div class="customFieldErrorMsg">' + inputList.displayName + ' is required</div>');
                    return false;
                }

                if (inputList.displayName === 'Blackout Period' || inputList.displayName === 'Ramp Duration' ) {
                    blackoutPeriodElem = field.parents('.form-group').find('.form-group-section')[1];
                    blackPeriodsValue = $(blackoutPeriodElem).find('select').val();
                    if (blackPeriodsValue === 'Days') {
                        maxValue = maxValue / 24;
                    }
                } else if (inputList.displayName === 'NA') {
                    blackoutPeriodElem = field.parents('.form-group').find('.form-group-section')[0];
                    $(blackoutPeriodElem).find('input').trigger('blur');
                }

                minMaxFlag= true;
                maxBidElem = field.parent().next();
                maxBidValue = $(maxBidElem).find('input').val();
                maxBidValue = maxBidValue ? parseFloat(maxBidValue) : '';

                minBidElem = field.parent().prev();
                minBidValue = $(minBidElem).find('input').val();
                minBidValue = minBidValue ? parseFloat(minBidValue) : '';

                if (inputList.displayName !== 'NA') {
                    if (value < minValue) {
                        field.after('<div class="customFieldErrorMsg">' +
                            inputList.displayName +
                            ' must be greater than or equal to ' +
                            minValue +
                            '</div>');
                        minMaxFlag = false;
                        return false;
                    } else if (value > maxValue) {
                        field.after('<div class="customFieldErrorMsg">' +
                            inputList.displayName +
                            ' must be less than or equal to ' +
                            maxValue +
                            '</div>');
                        minMaxFlag = false;
                        return false;
                    }
                }

                if (inputList.displayName === 'Min. Bid' || inputList.displayName === 'Min.') {
                    if (value > maxBidValue) {
                        field.after('<div class="customFieldErrorMsg">' +
                            textConstants.MIN_BID_SHOULD_LESS_THAN_MAX_BID +
                            '</div>');
                        return false;
                    } else {
                        if (minMaxFlag) {
                            maxBidElem.find('.customFieldErrorMsg').remove();
                        }
                    }
                }

                if (inputList.displayName === 'Max. Bid' || inputList.displayName === 'Max.') {
                    if (minBidValue > value) {
                        field.after('<div class="customFieldErrorMsg">' +
                            textConstants.MAX_BID_SHOULD_GREATER_THAN_MIN_BID +
                            '</div>');
                        return false;
                    } else {
                        if (minMaxFlag) {
                            minBidElem.find('.customFieldErrorMsg').remove();
                        }
                    }
                }
            });
            return inputWrapper;
        };

        var createPlatformCustomInputList =  function (inputGroupList, elem, noGroup) {
            var groupContainer,
                platformCustomInputList;

            _self.inputGroupList = inputGroupList;
            platformCustomInputList = _.sortBy(inputGroupList.platformCustomInputList, 'displayOrder');
            if (platformCustomInputList.length > 0) {
                groupContainer =
                    $('<div/>')
                        .addClass('form-group col-md-12 zeroPadding')
                        .addClass(noGroup ? 'form-individual-section' : '');
            }
            _.each(platformCustomInputList, function (inputList, idx) {
                groupContainer.append(createInputElem(inputList, inputGroupList, idx, 'group'));
            });
            elem.append(groupContainer);
        };

        var buildInputControl = function (inputGroupList, elem, noGroup) {
            var platformCustomInputChildrenGroupList;

            createPlatformCustomInputList(inputGroupList, elem, noGroup);
            platformCustomInputChildrenGroupList = inputGroupList.platformCustomInputChildrenGroupList;
            _.each(platformCustomInputChildrenGroupList, function (inputGroupList) {
                if (inputGroupList.isActivated) {
                    buildInputControl(inputGroupList, elem);
                }
            });
        };

        var buildFormControl =  function (pJson, elem) {
            var platformCustomInputGroupList = pJson.platformCustomInputGroupList;

            _.each(platformCustomInputGroupList, function (inputGroupList) {
                if (inputGroupList.isActivated) {
                    buildInputControl(inputGroupList, elem, true);
                }
            });
        };

        var init = function (platformCustomeJson, elem, adPlatformCustomInputs) {
            elem.html('');
            _self.elem = elem;
            _self.adPlatformCustomInputs= adPlatformCustomInputs;
            _self.platformCustomInputNamespaceList = platformCustomeJson.platformCustomInputNamespaceList;
            _self.platformCustomInputActivationOrderList = platformCustomeJson.platformCustomInputActivationOrderList;
            _.each(_self.platformCustomInputNamespaceList, function (pJson) {
                platformHeader(pJson, elem);
                buildFormControl(pJson, elem);
            });
        };

        return {
            init: init
        };
    });
}());