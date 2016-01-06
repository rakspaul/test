angular.module('ui.multiselect', [])

  //from bootstrap-ui typeahead parser
  .factory('optionParser', ['$parse', function ($parse) {

    //                      00000111000000000000022200000000000000003333333333333330000000000044000
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    return {
      parse: function (input) {

        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error(
            "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
              " but got '" + input + "'.");
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

            changeHandler = attrs.change || angular.noop;

          scope.items = [];
          scope.defaultoption = attrs.defaultoption;
          scope.displaySelectAllOPtion = attrs.displaySelectAllOPtion;
          scope.multipleoption = attrs.multipleoption;
          scope.datashow = attrs.datashow;
          scope.acceptmultiple = attrs.acceptmultiple;
          scope.maxcharacter = attrs.maxcharacter > 0 ? attrs.maxcharacter:0;
          scope.header = 'Select';
          scope.multiple = isMultiple;
          scope.disabled = false;

          originalScope.$on('$destroy', function () {
            scope.$destroy();
          });

          var popUpEl = angular.element('<multiselect-popup></multiselect-popup>');

          //required validator
          if (attrs.required || attrs.ngRequired) {
            required = true;
          }
          attrs.$observe('required', function(newVal) {
            required = newVal;
          });

          //watch disabled state
          scope.$watch(function () {
            return $parse(attrs.disabled)(originalScope);
          }, function (newVal) {
            scope.disabled = newVal;
          });

          //watch single/multiple state for dynamically change single to multiple
          scope.$watch(function () {
            return $parse(attrs.multiple)(originalScope);
          }, function (newVal) {
            isMultiple = newVal || false;
          });

          //watch option changes for options that are populated dynamically
          scope.$watch(function () {
            return parsedResult.source(originalScope);
          }, function (newVal) {
            if (angular.isDefined(newVal))
              parseModel();
          }, true);

          //watch model change
          scope.$watch(function () {
            return modelCtrl.$modelValue;
          }, function (newVal, oldVal) {
            //when directive initialize, newVal usually undefined. Also, if model value already set in the controller
            //for preselected list then we need to mark checked in our scope item. But we don't want to do this every time
            //model changes. We need to do this only if it is done outside directive scope, from controller, for example.
            if (angular.isDefined(newVal)) {
              markChecked(newVal);
              scope.$eval(changeHandler);
            }
            getHeaderText();
            modelCtrl.$setValidity('required', scope.valid());
          }, true);

          function parseModel() {
            scope.items.length = 0;
            var model = parsedResult.source(originalScope);
            if(!angular.isDefined(model)) return;
            for (var i = 0; i < model.length; i++) {
              var local = {};
              local[parsedResult.itemName] = model[i];
              scope.items.push({
                label: parsedResult.viewMapper(local),
                model: model[i],
                checked: false
              });
            }
          }

          parseModel();

          element.append($compile(popUpEl)(scope));

          function getHeaderText() {
            if (is_empty(modelCtrl.$modelValue)) return scope.header = '';
            if (isMultiple) {
               var selected_item ='';
               var data_selected = modelCtrl.$modelValue; 
               for(i=0;i < data_selected.length;i++){
                  selected_item = selected_item + data_selected[i].name +",";
               }
               if(selected_item.length > 0 ){
                  selected_item = selected_item.substring(0, selected_item.length - 1);
                  if(selected_item.length < scope.maxcharacter){
                     scope.header = selected_item;      
                  }else{
                     scope.header = modelCtrl.$modelValue.length+' Selected' ;
                  }

               }
            } else {
              var local = {};
              local[parsedResult.itemName] = modelCtrl.$modelValue;
              
              scope.header = parsedResult.viewMapper(local);
            }
          }
          
          function is_empty(obj) {
            if (!obj) return true;
            if (obj.length && obj.length > 0) return false;
            for (var prop in obj) if (obj[prop]) return false;
            return true;
          };

          scope.valid = function validModel() {
            if(!required) return true;
            var value = modelCtrl.$modelValue;
            return (angular.isArray(value) && value.length > 0) || (!angular.isArray(value) && value != null);
          };

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
                if (item.checked) value.push(item.model);
              })
            } else {
              angular.forEach(scope.items, function (item) {
                if (item.checked) {
                  value = item.model;
                  return false;
                }
              })
            }
            modelCtrl.$setViewValue(value);
          }

          function markChecked(newVal) {
            if (!angular.isArray(newVal)) {
              angular.forEach(scope.items, function (item) {
                if (angular.equals(item.model, newVal)) {
                  item.checked = true;
                  return false;
                }
              });
            } else {
              angular.forEach(newVal, function (i) {
                angular.forEach(scope.items, function (item) {
                  if (angular.equals(item.model, i)) {
                    item.checked = true;
                  }
                });
              });
            }
          }

          scope.checkAll = function () {
            if (!isMultiple) return;
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
              if(modelCtrl.$modelValue)
              {
                if(modelCtrl.$modelValue.length == 0){
                  scope.toggleSelectAll(false);
                }
                if(scope.items){
                  if(modelCtrl.$modelValue.length == scope.items.length ){
                    scope.toggleSelectAll(true);
                  }
                }
              }
            }
          }
        }
      };
    }])

  .directive('multiselectPopup', ['$document', '$rootScope','constants', function ($document, $rootScope, constants) {
    return {
      restrict: 'E',
      scope: false,
      replace: true,
      templateUrl: assets.html_multi_select,
      link: function (scope, element, attrs) {
        scope.textConstants = constants;
        scope.isVisible = false;
        scope.selectedAll = true;
       // scope.displaySelectAllOPtion = false;
        scope.multipleoption = false;

        scope.toggleSelect = function () {
          if (element.hasClass('open')) {
            element.removeClass('open');
            $document.unbind('click', clickHandler);
          } else {
            element.addClass('open');
            $document.bind('click', clickHandler);
            scope.focus();
          }
        };

        function clickHandler(event) {
          if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName)))
            return;
          element.removeClass('open');
          $document.unbind('click', clickHandler);
          scope.$apply();
        }

        scope.focus = function focus(){
          var searchBox = element.find('input')[0];
          //searchBox.focus(); 
        }
       
        scope.clearCheckbox = function(){
          
        };
         $rootScope.$on("clear",function(){ 
           scope.selectedAll = true;
           scope.uncheckAll();
         });
           $rootScope.$on("removeOptions",function(event,args){ 
            //scope.selectedAll = true;
            if(scope.datashow == 2 ){
             scope.selectedAll = true;
             scope.items = [];
             scope.multipleoption = false;
             scope.header = '';
             scope.toggleSelectAll(false);
            }
             if(scope.datashow == 3 ){
               scope.multipleoption = false;

               //scope.header = '';
             }
          });
            $rootScope.$on("showOptions",function(event,args){ 
          
            if(scope.datashow == 2 || scope.datashow == 3  ){

              if(scope.datashow == 2){
                 scope.selectedAll = true;
                 scope.header = '';
              }
             
             scope.multipleoption = true;
           }
          });
        scope.toggleSelectAll = function(flag){ 
          if(flag == false){     
            scope.selectedAll = true;
            scope.uncheckAll();
          }else{

            scope.selectedAll = false;
            scope.checkAll();
          }

        }

        var elementMatchesAnyInArray = function (element, elementArray) {
          for (var i = 0; i < elementArray.length; i++)
            if (element == elementArray[i])
              return true;
          return false;
        }
      }
    }
  }]);
