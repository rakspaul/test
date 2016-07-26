define(['angularAMD', '../../common/services/constants_service'], function (angularAMD) {
    'use strict';

    angularAMD.factory('creativeCustomModule', function ($compile) {
        var _self = this,
            idx= 0,

            createInputElem = function (inputList, idx, scope) {
                var inputWrapper,
                    options,
                    supportedTag,
                    LabelHtml,
                    fieldLabel,
                    toggleLabel,
                    activeToggleIdx,
                    inputRadio,
                    target,
                    parentElem;

                if (inputList.platformCustomWidgetType === 'TOGGLE') {
                    inputWrapper =
                        $('<div/>')
                            .addClass('form-group-section zeroPadding radioBtnToggle')
                            .attr({
                            });
                } else if (inputList.platformCustomWidgetType === 'DROPDOWN') {
                    inputWrapper=
                        $('<div/>')
                            .addClass('form-group col-md-3')
                            .attr({
                            });
                } else {
                    inputWrapper =
                        $('<div/>')
                            .addClass('form-group-section')
                            .attr({
                            });
                }

                if (inputList.displayName !== '') {
                    if (inputList.displayName !== 'NA') {
                        fieldLabel =
                            $('<label />')
                                .addClass('greyTxt col-md-12 zeroPadding')
                                .text(inputList.displayName);

                        inputWrapper.append(fieldLabel);
                    }
                }

                if (inputList.platformCustomWidgetType === 'TEXTAREA' ||
                    inputList.platformCustomWidgetType === 'TEXTBOX') {
                    fieldLabel =
                        $('<textarea />')
                            .addClass('form-control col-md-8 ng-pristine ng-valid')
                            .attr({
                                placeholder: (inputList.defaultValue !== '') ? '' : inputList.displayName,
                                'ng-required': inputList.isMandatory ? true : false,
                                'ng-model': (inputList.defaultValue !== '') ?
                                    inputList.defaultValue :
                                    inputList.displayName,

                                style: 'width: 66.66666667%;float:none;',
                                rows: (inputList.platformCustomWidgetType === 'TEXTAREA') ? '15' : '',
                                name: inputList.name + '$$' + inputList.id,
                                value: (inputList.defaultValue !== '') ? inputList.defaultValue : ''
                            })
                            .text((inputList.defaultValue !== '') ? inputList.defaultValue : '')
                            .on('keypress', function () {});

                    inputWrapper.append(fieldLabel);

                    fieldLabel = $('<label/>')
                        .addClass('col-sm-12 control-label greyTxt errorLabel')
                        .attr({
                            'ng-if': 'formCreativeCreate.' + inputList.name + '$$' + inputList.id + '.$error.required'
                        })
                        .text('Please enter ' + inputList.displayName);

                    inputWrapper.append(fieldLabel);
                }

                if (inputList.platformCustomWidgetType === 'TOGGLE') {
                    LabelHtml = $('<div/>').addClass('btn-group miniToggle');

                    // Split the range Json to get all possible values for toggle
                    options = inputList.rangeJson.split(',');

                    //split the supported tags into an array
                    supportedTag = inputList.supportedTags.split(',');

                    // for each value to be shown on toggle
                    toggleLabel = '';

                    //Make active when idx = 0
                    _.each(options, function (option, idx) {
                        // set for edit
                        if (inputList.defaultValue !== '') {
                            if (inputList.defaultValue === option) {
                                activeToggleIdx = idx;
                            }
                        }

                        toggleLabel =
                            $('<label/>')
                                .addClass('btn btn-default')
                                .addClass((activeToggleIdx >= 0) ? ((activeToggleIdx === idx) ? 'active' : '') :
                                    (inputList.defaultValue !== '') ? '' : (idx === 0?'active':''))
                                .addClass((supportedTag.indexOf(option) === -1 )?'disabled':'')
                                .text(option)
                                .on('click', function () {
                                    target = $(event.target);
                                    parentElem =  target.parents('.miniToggle');

                                    parentElem
                                        .find('label')
                                        .removeClass('active');

                                    target.parent().addClass('active');
                                });

                        inputRadio = $('<input/>')
                            .addClass('btn_rad')
                            .attr({
                                type: 'radio',

                                //creativeType is the name for HTML/JS
                                name: inputList.name + '$$' + inputList.id,

                                value: option,

                                checked: (activeToggleIdx >= 0) ? ((activeToggleIdx === idx) ? true : false) :
                                    (idx === 0 ? true : false),

                                hidden: 'hidden'
                            })
                            .on('change', function () {});

                        toggleLabel.append(inputRadio);
                        LabelHtml.append(toggleLabel);
                    });

                    inputWrapper.append(LabelHtml);
                }

                if (inputList.platformCustomWidgetType === 'DROPDOWN') {
                    var sizeHtml,
                        selectHtml;

                    // Only for size, write the predefined Markup
                    if (inputList.name === 'sizes.size') {
                        sizeHtml = angular.element(
                            '<div class="col-md-12 zeroPadding dropdown-workflow">'+
                            '<div class="dropdown">'+
                            '<button class="btn btn-default dropdown-toggle"' +
                                'id="creativeSize"' +
                                'type="button"' +
                                'data-toggle="dropdown"' +
                                'aria-haspopup="true"' +
                                'aria-expanded="true">' +
                            '<span class="text"' +
                                'ng-bind="adData.creativeSize ? adData.creativeSize.size : &quot;Select Size&quot;">' +
                            '</span>'+
                            '<span class="icon-arrow-solid-down"></span>'+
                            '</button>'+
                            '<ul class="dropdown-menu dropdown-search" aria-labelledby="sel1" id="sel1">' +
                            '<li class="searchBar">' +
                            '<div class="input-group input-group-sm search-control">' +
                            '<input class="col-md-12"' +
                                'id="listBoxSize"' +
                                'ng-model="newData.creativeSize"' +
                                'placeholder="Search">' +
                            '<div class="icon-search"></div>'+
                            '</div>'+
                            '</li>'+
                            '<span ng-if="!newData.creativeSize"' +
                                'class="greyTxt"' +
                                'style="margin-left:15px; margin-top:10px;">' +
                                'POPULAR SIZES' +
                            '</span>' +
                            '<li>'+
                            '<ul>' +
                            '<li class="available"' +
                                'ng-repeat="creativePopSizes in creativePopularSizes | filter:newData.creativeSize ' +
                                'track by creativePopSizes.id">' +
                            '<a ng-click="dropBoxItemSelected(creativePopSizes, &quot;creativeSize&quot;)"' +
                                'ng-bind="creativePopSizes.size">' +
                            '</a>' +
                            '</li>' +
                            '</ul>' +
                            '</li>' +
                            '<span class="greyTxt" style="margin-left:15px">AVAILABLE SIZES</span>' +
                            '<li style="padding-left:15px;"' +
                                'class="available"' +
                                'ng-repeat="creativeSize in creativeSizeData.creativeSize | ' +
                                    'filter:newData.creativeSize track by creativeSize.id">'+
                            '<a ng-click="dropBoxItemSelected(creativeSize, &quot;creativeSize&quot;)"' +
                                'ng-bind="creativeSize.size | lowercase">' +
                            '</a>' +
                            '</li>' +
                            '</ul>' +
                            '<input ng-model="adData.creativeSize.id"' +
                                'type="hidden"' +
                                'name="' + inputList.name + '$$' + inputList.id + '" ng-update-hidden required/>' +
                            '</div>' +
                            '</div>');

                        inputWrapper.append(sizeHtml);
                        $compile(sizeHtml)(scope);
                    } else {
                        options = inputList.rangeJson.split(',');
                        selectHtml = $('<select/>')
                            .attr({
                                required: inputList.isMandatory  ? true : false,
                                name: inputList.name + '$$' + inputList.id,
                                'ng-model': 'data.' + inputList.displayName
                            })
                            .on('click', function () {});

                        _.each(options, function (option) {
                            var optionElem = $('<option/>')
                                .attr({
                                    value: option,
                                    selected: inputList.defaultValue === option ? true : false
                                })
                                .text(option);

                            selectHtml.append(optionElem);
                        });

                        inputWrapper.append(selectHtml);
                    }
                }

                return inputWrapper;
            },

            createPlatformCustomInputList = function (inputGroupList, elem, scope, editModeData) {
                var groupContainer;

                _.each(editModeData,function (obj) {
                    if (obj.creativeCustomInputId === inputGroupList.id) {
                        inputGroupList.defaultValue=obj.value;
                    }
                });

                _self.inputGroupList = inputGroupList;

                if (inputGroupList) {
                    groupContainer =
                        $('<div/>')
                            .addClass('form-group col-md-12')
                            .addClass('form-individual-section');
                }

                groupContainer.append(createInputElem(inputGroupList, idx++, scope));
                elem.append(groupContainer);
            },

            buildFormControl = function (pJson, elem, scope, editModeData) {
                var creativeCustomInputList;

                if (pJson.isActivated) {
                    creativeCustomInputList = pJson.platformCustomInputList;

                    _.each(creativeCustomInputList, function (inputGroupList) {
                        createPlatformCustomInputList(inputGroupList, elem, scope, editModeData);
                    });
                }
            },

            init = function(creativeTemplate,elem,scope,editModeData){
                elem.html('');
                _self.elem = elem;

                 _self.creativeCustomInputNamespaceList = creativeTemplate ?
                     creativeTemplate.creativeTemplateCustomInputJson.platformCustomInputNamespaceList : '';

                 _self.creativeCustomInputGroupList = creativeTemplate ?
                     creativeTemplate.creativeTemplateCustomInputJson.platformCustomInputNamespaceList[0]
                         .platformCustomInputGroupList : '';

                _.each(_self.creativeCustomInputGroupList, function (pJson) {
                    buildFormControl(pJson, elem,scope,editModeData);
                });
            };

        return {
            init: init
        };

    });
});
