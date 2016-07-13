define(['angularAMD'],function (angularAMD) {
    'use strict';

    angularAMD.directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
        // contains
        function contains(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        return true;
                    }
                }
            }

            return false;
        }

        // add
        function add(arr, item, comparator) {
            arr = angular.isArray(arr) ? arr : [];

            if(!contains(arr, item, comparator)) {
                arr.push(item);
            }

            return arr;
        }

        // remove
        function remove(arr, item, comparator) {
            var i;

            if (angular.isArray(arr)) {
                for (i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }

            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // exclude recursion, but still keep the model
            var checklistModel = attrs.checklistModel,
                getter,
                setter,
                checklistChange,
                checklistBeforeChange,
                value,
                comparator,
                comparatorExpression;

            attrs.$set('checklistModel', null);
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);
            attrs.$set('checklistModel', checklistModel);

            // getter / setter for original model
            getter = $parse(checklistModel);
            setter = getter.assign;

            checklistChange = $parse(attrs.checklistChange);
            checklistBeforeChange = $parse(attrs.checklistBeforeChange);

            // value added to list
            value = attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;

            comparator = angular.equals;

            if (attrs.hasOwnProperty('checklistComparator')){
                if (attrs.checklistComparator[0] === '.') {
                    comparatorExpression = attrs.checklistComparator.substring(1);

                    comparator = function (a, b) {
                        return a[comparatorExpression] === b[comparatorExpression];
                    };
                } else {
                    comparator = $parse(attrs.checklistComparator)(scope.$parent);
                }
            }

            // watch UI checked change
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }

                if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                    scope[attrs.ngModel] = contains(getter(scope.$parent), value, comparator);
                    return;
                }

                setValueInChecklistModel(value, newValue);

                if (checklistChange) {
                    checklistChange(scope);
                }
            });

            function setValueInChecklistModel(value, checked) {
                var current = getter(scope.$parent);

                if (angular.isfunction (setter)) {
                    if (checked === true) {
                        setter(scope.$parent, add(current, value, comparator));
                    } else {
                        setter(scope.$parent, remove(current, value, comparator));
                    }
                }
            }

            // declare one function to be used for both $watch functions
            function setChecked(newArr) {
                if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
                    setValueInChecklistModel(value, scope[attrs.ngModel]);
                    return;
                }

                scope[attrs.ngModel] = contains(newArr, value, comparator);
            }

            // watch original model change
            // use the faster $watchCollection method if it's available
            if (angular.isfunction (scope.$parent.$watchCollection)) {
                scope.$parent.$watchCollection(checklistModel, setChecked);
            } else {
                scope.$parent.$watch(checklistModel, setChecked, true);
            }
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,

            compile: function (tElement, tAttrs) {
                if ((tElement[0].tagName !== 'INPUT' ||
                    tAttrs.type !== 'checkbox') && (tElement[0].tagName !== 'MD-CHECKBOX') &&
                    (!tAttrs.btnCheckbox)) {
                    throw 'checklist-model should be applied to `input[type="checkbox"]` or "md-checkbox".';
                }

                if (!tAttrs.checklistValue && !tAttrs.value) {
                    throw 'You should provide `value` or `checklist-value`.';
                }

                // by default ngModel is 'checked', so we set it if not specified
                if (!tAttrs.ngModel) {
                    // local scope var storing individual checkbox model
                    tAttrs.$set('ngModel', 'checked');
                }

                return postLinkFn;
            }
        };
    }]);
});
