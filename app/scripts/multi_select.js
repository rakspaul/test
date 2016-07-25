'use strict'; // jshint ignore:line

angular.module('ui.multiselect', [])
    // from bootstrap-ui typeahead parser
    .factory('optionParser', ['$parse', function ($parse) {
        //                      00000111000000000000022200000000000000003333333333333330000000000044000
        var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

        return {
            parse: function (input) {
                var match = input.match(TYPEAHEAD_REGEXP);

                if (!match) {
                    throw new Error(
                        'Expected typeahead specification in form of ' +
                        '"_modelValue_ (as _label_)? for _item_ in _collection_"' +
                        ' but got "' + input + '".');
                }

                return {
                    itemName: match[3],
                    source: $parse(match[4]),
                    viewMapper: $parse(match[2] || match[1]),
                    modelMapper: $parse(match[1])
                };
            }
        };
    }])

    .directive('multiselect', ['$parse', '$document', '$compile', 'optionParser',
        function ($parse, $document, $compile, optionParser) {
            return {
                restrict: 'E',

                require: 'ngModel',

                link: function (originalScope, element, attrs, modelCtrl) {
                    var exp = attrs.options,
                        parsedResult = optionParser.parse(exp),
                        isMultiple = attrs.multiple ? true : false,
                        required = false,
                        scope = originalScope.$new(),
                        changeHandler = attrs.change || angular.noop,
                        popUpEl;

                    function parseModel() {
                        var model = parsedResult.source(originalScope),
                            i,
                            local;

                        scope.items.length = 0;

                        if (! angular.isDefined(model)) {
                            return;
                        }

                        for (i = 0; i < model.length; i++) {
                            local = {};
                            local[parsedResult.itemName] = model[i];

                            scope.items.push({
                                label: parsedResult.viewMapper(local),
                                model: model[i],
                                checked: false
                            });
                        }
                    }

                    function getHeaderText() {
                        var selectedItem,
                            dataSelected,
                            i,
                            local;

                        if (isEmpty(modelCtrl.$modelValue)) {
                            // TODO: This is a very valid error! Pleaseeeee avoid writing code like this.
                            // return scope.header = '';
                            scope.header = '';
                            return;
                        }

                        if (isMultiple) {
                            selectedItem = '';
                            dataSelected = modelCtrl.$modelValue;

                            for (i = 0; i < dataSelected.length; i++) {
                                selectedItem = selectedItem + dataSelected[i].name + ',';
                            }

                            if (selectedItem.length > 0) {
                                selectedItem = selectedItem.substring(0, selectedItem.length - 1);

                                if (selectedItem.length < scope.maxcharacter) {
                                    scope.header = selectedItem;
                                } else {
                                    scope.header = modelCtrl.$modelValue.length + ' Selected';
                                }

                            }
                        } else {
                            local = {};
                            local[parsedResult.itemName] = modelCtrl.$modelValue;
                            scope.header = parsedResult.viewMapper(local);
                        }
                    }

                    function isEmpty(obj) {
                        var prop;

                        if (!obj) {
                            return true;
                        }

                        if (obj.length && obj.length > 0) {
                            return false;
                        }

                        for (prop in obj) {
                            if (obj[prop]) {
                                return false;
                            }
                        }

                        return true;
                    }

                    function selectSingle(item) {
                        if (item.checked) {
                            scope.uncheckAll();
                        } else {
                            scope.uncheckAll();
                            item.checked = !item.checked;
                        }

                        setModelValue(false);
                    }

                    function selectMultiple(item) {
                        item.checked = !item.checked;
                        setModelValue(true);
                    }

                    function setModelValue(isMultiple) {
                        var value;

                        if (isMultiple) {
                            value = [];

                            angular.forEach(scope.items, function (item) {
                                ((item.checked) && value.push(item.model));
                            });
                        } else {
                            angular.forEach(scope.items, function (item) {
                                if (item.checked) {
                                    value = item.model;
                                    return false;
                                }
                            });
                        }

                        modelCtrl.$setViewValue(value);
                    }

                    function markChecked(newVal) {
                        if (!angular.isArray(newVal)) {
                            angular.forEach(scope.items, function (item) {
                                if ( angular.equals(item.model, newVal)) {
                                    item.checked = true;

                                    return false;
                                }
                            });
                        } else {
                            angular.forEach(newVal, function (i) {
                                angular.forEach(scope.items, function (item) {
                                    if ( angular.equals(item.model, i)) {
                                        item.checked = true;
                                    }
                                });
                            });
                        }
                    }

                    scope.items = [];
                    scope.defaultoption = attrs.defaultoption;
                    scope.displaySelectAllOPtion = attrs.displaySelectAllOPtion;
                    scope.multipleoption = attrs.multipleoption;
                    scope.datashow = attrs.datashow;
                    scope.acceptmultiple = attrs.acceptmultiple;
                    scope.maxcharacter = attrs.maxcharacter > 0 ? attrs.maxcharacter : 0;
                    scope.header = 'Select';
                    scope.multiple = isMultiple;
                    scope.disabled = false;

                    originalScope.$on('$destroy', function () {
                        scope.$destroy();
                    });

                    popUpEl =  angular.element('<multiselect-popup></multiselect-popup>');

                    // required validator
                    if (attrs.required || attrs.ngRequired) {
                        required = true;
                    }

                    attrs.$observe('required', function (newVal) {
                        required = newVal;
                    });

                    // watch disabled state
                    scope.$watch(function () {
                        return $parse(attrs.disabled)(originalScope);
                    }, function (newVal) {
                        scope.disabled = newVal;
                    });

                    // watch single/multiple state for dynamically change single to multiple
                    scope.$watch(function () {
                        return $parse(attrs.multiple)(originalScope);
                    }, function (newVal) {
                        isMultiple = newVal || false;
                    });

                    // watch option changes for options that are populated dynamically
                    scope.$watch(function () {
                        return parsedResult.source(originalScope);
                    }, function (newVal) {
                        (angular.isDefined(newVal)) && (parseModel());
                    }, true);

                    // watch model change
                    scope.$watch(function () {
                        return modelCtrl.$modelValue;
                    }, function (newVal) {
                        // when directive initialize, newVal usually undefined. Also, if model value already
                        // set in the controller for preselected list then we need to mark checked in our scope item.
                        // But we don't want to do this every time model changes. We need to do this only
                        // if it is done outside directive scope, from controller, for example.
                        if ( angular.isDefined(newVal)) {
                            markChecked(newVal);
                            scope.$eval(changeHandler);
                        }

                        getHeaderText();
                        modelCtrl.$setValidity('required', scope.valid());
                    }, true);

                    parseModel();

                    element.append($compile(popUpEl)(scope));

                    scope.valid = function validModel() {
                        var value = modelCtrl.$modelValue;

                        if (!required) {
                            return true;
                        }

                        return ( angular.isArray(value) && value.length > 0) ||
                            (! angular.isArray(value) && value !== null);
                    };

                    scope.checkAll = function () {
                        if (!isMultiple) {
                            return;
                        }

                        angular.forEach(scope.items, function (item) {
                            item.checked = true;
                        });

                        setModelValue(true);
                    };

                    scope.uncheckAll = function () {
                         angular.forEach(scope.items, function (item) {
                            item.checked = false;
                         });

                        setModelValue(true);
                    };

                    scope.select = function (item) {
                        if (isMultiple === false) {
                            selectSingle(item);
                            scope.toggleSelect();
                        } else {
                            selectMultiple(item);

                            if (modelCtrl.$modelValue) {
                                if (modelCtrl.$modelValue.length === 0) {
                                    scope.toggleSelectAll(false);
                                }

                                if (scope.items) {
                                    if (modelCtrl.$modelValue.length === scope.items.length) {
                                        scope.toggleSelectAll(true);
                                    }
                                }
                            }
                        }
                    };
                }
            };
        }
    ])

    .directive('multiselectPopup', ['$document', '$rootScope', 'constants',
        function ($document, $rootScope, constants) {
            return {
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: assets.html_multi_select,

                link: function (scope, element) {
                    var elementMatchesAnyInArray = function (element, elementArray) {
                        var i;

                        for (i = 0; i < elementArray.length; i++) {
                            if (element === elementArray[i]) {
                                return true;
                            }
                        }

                        return false;
                    };

                    function clickHandler(event) {
                        if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName))) {
                            return;
                        }

                        element.removeClass('open');
                        $document.unbind('click', clickHandler);
                        scope.$apply();
                    }

                    scope.textConstants = constants;
                    scope.isVisible = false;
                    scope.selectedAll = true;
                    scope.multipleoption = false;

                    scope.toggleSelect = function () {
                        if (element.hasClass('open')) {
                            element.removeClass('open');
                            $document.unbind('click', clickHandler);
                        } else {
                            element.addClass('open');
                            $document.bind('click', clickHandler);
                            (typeof scope.focus === 'function') && scope.focus();
                        }
                    };

                    scope.clearCheckbox = function () {};

                    $rootScope.$on('clear', function () {
                        scope.selectedAll = true;
                        scope.uncheckAll();
                    });

                    $rootScope.$on('removeOptions', function () {
                        if (scope.datashow === 2) {
                            scope.selectedAll = true;
                            scope.items = [];
                            scope.multipleoption = false;
                            scope.header = '';
                            scope.toggleSelectAll(false);
                        }

                        if (scope.datashow === 3) {
                            scope.multipleoption = false;
                        }
                    });

                    $rootScope.$on('showOptions', function () {
                        if (scope.datashow === 2 || scope.datashow === 3) {
                            if (scope.datashow === 2) {
                                scope.selectedAll = true;
                                scope.header = '';
                            }

                            scope.multipleoption = true;
                        }
                    });

                    scope.toggleSelectAll = function (flag) {
                        if (flag === false) {
                            scope.selectedAll = true;
                            scope.uncheckAll();
                        } else {
                            scope.selectedAll = false;
                            scope.checkAll();
                        }
                    };
                }
            };
        }]
    );
