define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) { // jshint ignore:line
    'use strict';

    angularAMD.factory('platformCustomeModule', function ($timeout, $locale, constants) {
        var _self = this,
            textConstants = constants,

            widgetTypeMapper = {
                checkbox: 'checkbox',
                textbox: 'number',
                hidden: 'hidden',
                placement_widget: 'hidden'
            },

            //private method
            platformHeader = function (pJson, elem) {
                var platformHTML = '<div class="col-md-12 platformHeading zeroPadding">';

                platformHTML += '<div class="col-md-8 zeroPadding">' + pJson.displayName + '<br/>';
                platformHTML += '</div>';
                platformHTML += ' <div class="col-md-4 zeroPadding pull-left clearLeft"><span>' +
                    pJson.subName + '</span></div>';
                platformHTML += '</div>';

                elem.append(platformHTML);
            },

            selectPlatform = function (selectedValue, inputList, platformCustomInputChildrenGroupList, dependentItems) {
                var activationOrderList,
                    selectedOrderList,
                    platformCustomInputGroupId,
                    item,

                    platformCustomInputGroupFunc = function (orderList) {
                        platformCustomInputGroupId = orderList.platformCustomInputGroupId;

                        item = _.filter(platformCustomInputChildrenGroupList, function (obj) { // jshint ignore:line
                            return obj.id === platformCustomInputGroupId;
                        });

                        if (item.length > 0) {
                            item =  item[0];
                            item.relationWith = dependentItems;
                        }

                        createPlatformCustomInputList(item, _self.elem);
                    };

                if (dependentItems === 'selectBoxchkDependentItems') {
                    _self
                        .elem
                        .find('div[relationwith=selectBoxchkDependentItems]')
                        .length > 0 &&
                            _self.elem.find('div[relationWith=selectBoxchkDependentItems]').parent('.form-group')
                        .remove();

                    _self
                        .elem
                        .find('div[relationwith=chkDependentItems]')
                        .length > 0 && _self.elem.find('div[relationWith=chkDependentItems]').parent('.form-group')
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

                selectedOrderList = _.filter(activationOrderList, function (obj) { // jshint ignore:line
                    return obj.value === $.trim(selectedValue) && obj.platformCustomInputId === inputList.id;
                });

                if (selectedOrderList.length > 0) {
                    _.each(selectedOrderList, function (orderList) { // jshint ignore:line
                        platformCustomInputGroupFunc(orderList);
                    });
                }
            },

            adsEditDefaultValueMapper = function (adPlatformCustomInputs, inputList) {
                _.each(adPlatformCustomInputs, function (obj) { // jshint ignore:line
                    if (obj.platformCustomInputId === inputList.id) {
                        inputList.defaultValue = obj.value;
                    }
                });
            },

            createInputElem = function (inputList, inputGroupList, idx) {
                var inputWrapper,
                    options,
                    inputListHTML,
                    type,
                    platformCustomWidgetType,
                    decoratorText,
                    label,
                    LabelHtml,
                    fieldLabel,
                    hiddenInputField,
                    chkSelValue;

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
                                required: inputList.isMandatory ==='required' ? true : false,
                                name: inputList.name + '$$' + inputList.id
                            })
                            .on('change', function () {
                                var formGroupSectionElem,
                                    formGroupSectionInputElem,
                                    orginalDefaultValue;

                                chkSelValue = this.checked ?  'TRUE' : 'FALSE';
                                formGroupSectionElem = inputListHTML.parent().siblings('.form-group-section');

                                if (formGroupSectionElem.parent().hasClass('form-individual-section')) {
                                    if (formGroupSectionElem && formGroupSectionElem.length > 0) {
                                        formGroupSectionInputElem = formGroupSectionElem.find('input');
                                        orginalDefaultValue = formGroupSectionInputElem.attr('value');
                                        formGroupSectionInputElem.val(orginalDefaultValue);
                                    }
                                }

                                if (inputList.dependentGroups) {
                                    selectPlatform(this.value, inputList,
                                        inputGroupList.platformCustomInputChildrenGroupList,
                                        'selectBoxchkDependentItems');
                                }
                            });

                    $timeout(function () {
                        if (inputList.defaultValue) {
                            inputListHTML.trigger('change');
                        }
                    }, 500);

                    _.each(options, function (option) { // jshint ignore:line
                        var optionElem = $('<option/>').attr({
                            value: option,
                            name: inputList.name,
                            selected: inputList.defaultValue === option ? true : false
                        }).text(option);

                        inputListHTML.append(optionElem);
                    });

                    inputWrapper.append(inputListHTML);
                }

                if (inputList.platformCustomWidgetType === 'CHECKBOX' ||
                    inputList.platformCustomWidgetType === 'TEXTBOX' ||
                    inputList.platformCustomWidgetType === 'HIDDEN' ||
                    inputList.platformCustomWidgetType === 'PLACEMENT_WIDGET') {
                    platformCustomWidgetType = inputList.platformCustomWidgetType;
                    type = widgetTypeMapper[platformCustomWidgetType.toLowerCase()];
                    options = inputList.rangeJson && JSON.parse(inputList.rangeJson);

                    inputListHTML = $('<input/>').attr({
                        type: type,
                        required: inputList.isMandatory,
                        name: type !== 'checkbox' ? inputList.name + '$$' + inputList.id : '',
                        id: inputList.name,
                        value: inputList.defaultValue ,
                        min: options.min,
                        max: options.max
                    });

                    if (inputList.decorator !== 'NA') {
                        decoratorText = (inputList.decorator === 'CLIENT_CUR' ?
                            $locale.NUMBER_FORMATS.CURRENCY_SYM :
                            inputList.decorator);

                        $('<span />')
                            .text(decoratorText)
                            .appendTo(inputWrapper)
                            .addClass('decoratorFloat');
                    }

                    if (platformCustomWidgetType === 'CHECKBOX') {
                        inputListHTML
                            .addClass('cmn-toggle cmn-toggle-round')
                            .attr({
                                id: 'cmn-toggle-' + (idx + 1),
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
                            if (inputList.dependentGroups) {
                                selectPlatform(chkSelValue , inputList,
                                    inputGroupList.platformCustomInputChildrenGroupList,
                                    'chkDependentItems');
                            }

                            if (chkSelValue) {
                                hiddenInputField.attr('value', chkSelValue);
                            }
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
            },

            createPlatformCustomInputList =  function (inputGroupList, elem, noGroup) {
                var groupContainer,
                    platformCustomInputList;

                _self.inputGroupList = inputGroupList;
                platformCustomInputList =
                    _.sortBy(inputGroupList.platformCustomInputList, 'displayOrder'); // jshint ignore:line

                if (platformCustomInputList.length > 0) {
                    groupContainer =
                        $('<div/>')
                            .addClass('form-group col-md-12 zeroPadding')
                            .addClass(noGroup ? 'form-individual-section' : '');
                }

                _.each(platformCustomInputList, function (inputList, idx) { // jshint ignore:line
                    groupContainer.append(createInputElem(inputList, inputGroupList, idx, 'group'));
                });

                if (_.filter(platformCustomInputList, function (obj) { // jshint ignore:line
                        return obj.platformCustomWidgetType === 'HIDDEN';
                    }).length > 0) {
                    groupContainer.hide();
                }

                elem.append(groupContainer);
            },

            buildInputControl = function (inputGroupList, elem, noGroup) {
                var platformCustomInputChildrenGroupList;

                createPlatformCustomInputList(inputGroupList, elem, noGroup);
                platformCustomInputChildrenGroupList = inputGroupList.platformCustomInputChildrenGroupList;

                _.each(platformCustomInputChildrenGroupList, function (inputGroupList) { // jshint ignore:line
                    if (inputGroupList.isActivated) {
                        buildInputControl(inputGroupList, elem);
                    }
                });
            },

            buildFormControl =  function (pJson, elem) {
                var platformCustomInputGroupList = pJson.platformCustomInputGroupList;

                _.each(platformCustomInputGroupList, function (inputGroupList) { // jshint ignore:line
                    if (inputGroupList.isActivated) {
                        buildInputControl(inputGroupList, elem, true);
                    }
                });
            },

            init = function (platformCustomeJson, elem, adPlatformCustomInputs) {
                var tabElem;

                //remvoing the build markup for platform.
                $('.platformHeading, .form-individual-section').remove();

                _self.customPlatformWithTab = false;
                _self.elem = elem;
                _self.adPlatformCustomInputs= adPlatformCustomInputs;
                _self.platformCustomInputNamespaceList =
                    _.sortBy(platformCustomeJson.platformCustomInputNamespaceList, 'displayOrder'); // jshint ignore:line
                _self.platformCustomInputActivationOrderList =
                    platformCustomeJson.platformCustomInputActivationOrderList;

                // if namespace is greater than 1.
                if (_self.platformCustomInputNamespaceList.length > 1 ) {
                    _self.customPlatformWithTab = true;
                    $('.eachBuyingSection').not('.staticMarkup').remove();
                }

                _.each(_self.platformCustomInputNamespaceList, function (pJson, idx) { // jshint ignore:line
                    if (_self.customPlatformWithTab) {
                        tabElem =
                            $('<div />').prependTo(elem).addClass('eachBuyingSection').addClass(pJson.name + '_div');

                        platformHeader(pJson, tabElem);
                        buildFormControl(pJson, tabElem);

                        if (!adPlatformCustomInputs && idx > 0) {
                            $('.' + pJson.name + '_div').find('input, select').attr('disabled', 'disabled');
                        }
                    } else {
                        platformHeader(pJson, elem);
                        buildFormControl(pJson, elem);
                    }
                });
            };

        return {
            init: init
        };
    });
});
