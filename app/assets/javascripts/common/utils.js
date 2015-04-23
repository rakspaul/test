(function () {
  'use strict';
  commonModule.factory('utils', ["$location", "$sce", "constants", function ($location, $sce,constants) {
    var formatDate = function (input) {
      var date = new Date(input);
      var dayOfMonth = date.getDate();
      var suffixes = ["th", "st", "nd", "rd"];
      var relevantDigits = (dayOfMonth < 30) ? dayOfMonth % 20 : dayOfMonth % 30;
      var suf = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
      return suf;
    };
    var makeTitle = function (input) {
      var title = '<div id="legend">';
      for (var i = 0; i < input.length; i++) {
        title += '<a id="a' + (i + 1) + '">' + input[i] + '</a>';
      }
      title += '</div>';
      return title;
    };
    var highlightSearch = function(text, search) {
      if (!search) {
          return $sce.trustAsHtml(text);
      }
      return $sce.trustAsHtml(unescape(text.replace(new RegExp(escape(search), 'gi'), '<span class="brand_search_highlight" >$&</span>')));
    };
    var roundOff = function (value, places) {
      var factor = Math.pow(10, places);
      return Math.round(value * factor) / factor;
    };
    var goToLocation = function (url) {
      $location.url(url);
    };
    var allValuesSame = function (arr) {
      for (var i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[0])
          return false;
      }
      return true;
    };
    //clones any javascript object recursively
    var clone = function clone(obj) {
      if(obj == null || typeof(obj) != 'object')
        return obj;

      var temp = obj.constructor();

      for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
          temp[key] = clone(obj[key]);
        }
      }
      return temp;
    };

    var SEARCH_OBJECT = {
      key : "",
      limit: constants.DEFAULT_LIMIT_COUNT,
      offset: constants.DEFAULT_OFFSET_START
    };
    /**
     * Note: You can provide limit, offset and key as arguments for initializing.
     * Please follow the above order for initialization.
     * Will consider first three parameters only.
     */
     function getTypeaheadParams(){
      var search = clone(SEARCH_OBJECT);
      if(arguments.length === 0)
        return search;
      var size = 3;
      if(arguments.length<3)
        size = arguments.length;
      for(var i=0; i<size; i++){
        switch(i) {
          case 0: if(!isNaN(arguments[i]))search.limit = arguments[i];
                  break;
          case 1: if(!isNaN(arguments[i]))search.offset = arguments[i];
                  break;
          case 2: search.key = arguments[i];
                  break;
        }
      }
      return search;
    };

    function getParameterByName(url, name) {
      var results = '';
      if (name) {
          name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
          var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
              results = regex.exec(url);
          results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      }
      return results;
    };


    return {
      formatDate: formatDate,
      makeTitle: makeTitle,
      roundOff: roundOff,
      goToLocation: goToLocation,
      allValuesSame: allValuesSame,
      clone: clone,
      highlightSearch: highlightSearch,
      typeaheadParams: getTypeaheadParams(),
      getParameterByName : getParameterByName
    };
  }]);
  angObj.directive('welcomeUser', function (common) {
    return{
      restrict: 'AE',
      scope: {
        username: '@username'
      },
      template: '<div class="navbar" role="navigation">' +
        ' <div class="container-fluid">' +
        ' <div class="navbar-header col-xs-6 col-sm-2 col-md-3">' +
        ' <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
        ' <span class="sr-only">Toggle navigation</span>' +
        ' <span class="icon-bar"></span>' +
        ' <span class="icon-bar"></span>' +
        ' <span class="icon-bar"></span>' +
        ' </button>' +
        ' <a id="logo" class="navbar-brand" href="#">Collective Media</a>' +
        ' </div>' +
        ' <span class="navbar-brand col-xs-4 col-sm-6 col-md-6 applicationName">' + common.title + '</span>' +
        ' <div class="navbar-collapse collapse" >' +
        ' <ul class="nav navbar-nav navbar-right">' +
        ' <li><a class="buttonRegularText" >Welcome, {{username}}</a></li>' +
        ' </ul>' +
        ' <!--<loader class="loading-spinner-holder" data-loading >Loading...</loader>-->' +
        ' </div>' +
        ' </div>' +
        '</div>'
    };
  });
  angObj.directive('loader', function ($http) {
    angular.element('#ngViewPlaceHolder').hide();
    return {
      restrict: 'AEC',
      link: function (scope, elm, attrs) {
        scope.isLoading = function () {
          return $http.pendingRequests.length > 0;
        };
        scope.$watch(scope.isLoading, function (v) {
          if (v) {
            elm.show();
            angular.element('#ngViewPlaceHolder').hide();
          } else {
            elm.hide();
            angular.element('#ngViewPlaceHolder').show();
          }
        });
      }
    };
  });
  angObj.directive('scrollOnClick', function ($routeParams) {
    return {
      restrict: 'A',
      link: function (scope, $elm, attrs) {
        if ($routeParams.to != undefined) {
          window.setTimeout(function () {
            if ($routeParams.to.length) {
              jQuery("body").animate({scrollTop: jQuery("#camp_" + $routeParams.to).offset().top}, "slow");
            }
          }, 2000);
        }
      }
    };
  });
//Details-Banner-Directive
  angObj.directive('campaignDetailsBanner', function () {
    return{
      restrict: 'AE',
      scope: {
        camapignTitle: '@',
        startDate: '@start',
        fromSuffix: '@fromsuffix',
        endDate: '@end',
        toSuffix: '@tosuffix',
        back: '=back'
      },
      templateUrl: '../views/detailsbanner.html'
    };
  });
  angObj.directive('makeTitle', function () {
    return{
      restrict: 'AE',
      scope: {
        measures: "=",
        dimensions: "=",
        updateparent: '&',
        measurementList: "=",
        dimensionList: "=",
        groupList: "=",
        updateTo: "="
      },
      template: '<ul class="nav navbar-nav">' +
        '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<span id="measuresLabel" >{{measures}}</span>' +
        '</a>' +
        '<ul class="dropdown-menu" role="menu" aria-labelledby="myTabDrop1" id="measuresOptions">' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="IMPRESSIONS"> IMPRESSIONS </a></li>' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CTR"> CTR </a></li>' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CVR"> CVR </a></li>' +
        '</ul>' +
        '</li>' +
        '<li> BY </li>' +
        '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<span id="dimensionLabel">{{dimensions}}</span>' +
        '</a>' +
        '<ul id="dimensionOptions" aria-labelledby="myTabDrop1" role="menu" class="dropdown-menu">' +
        '<li><a data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="AGE"> AGE </a></li>' +
        '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="GENDER"> GENDER </a></li>' +
        '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="INMARKET"> INMARKET </a></li>' +
        '</ul>' +
        '</li>' +
        '</ul>' +
        '<button type="button" class="close" data-dismiss="widget">' +
        '<span aria-hidden="true">&times;</span>' +
        '<span class="sr-only">Close</span>' +
        '</button>',
      link: function ($scope, elem, attrs) {
        elem.find('#measuresOptions li a').bind('click', function (e) {
          var messureText = $(this).attr('rel');
          elem.find("#measuresLabel").html(messureText);
          $scope.$apply($scope.$parent.changeAudienceKPI(messureText.toLowerCase(), elem.find("#dimensionLabel").text().toLowerCase(), $scope.updateTo));
        });
        elem.find('#dimensionOptions li a').bind('click', function (e) {
          var dimensionText = $(this).attr('rel');
          elem.find("#dimensionLabel").html(dimensionText);
          $scope.$apply($scope.$parent.changeAudienceKPI(elem.find("#measuresLabel").text().toLowerCase(), dimensionText.toLowerCase(), $scope.updateTo));
        });
      }
    };
  });
  angObj.directive('makeTitleCdb', function () {
    return{
      restrict: 'AE',
      scope: {
        measures: "=",
        dimensions: "=",
        updateparent: '&',
        measurementList: "=",
        dimensionList: "=",
        groupList: "=",
        updateTo: "="
      },
      template: '<ul class="nav navbar-nav">' +
        '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<span id="measuresLabel" >{{measures}}</span>' +
        '</a>' +
        '<ul class="dropdown-menu" role="menu" aria-labelledby="myTabDrop1" id="measuresOptions">' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="IMPRESSIONS"> IMPRESSIONS </a></li>' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CTR"> CTR </a></li>' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CVR"> CVR </a></li>' +
        '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="SPEND"> SPEND </a></li>' +
        '</ul>' +
        '</li>' +
        '<li> BY </li>' +
        '<li class="dropdown">' +
        '<a class="dropdown-toggle" data-toggle="dropdown">' +
        '<span id="dimensionLabel">{{dimensions}}</span>' +
        '</a>' +
        '<ul id="dimensionOptions" aria-labelledby="myTabDrop1" role="menu" class="dropdown-menu">' +
        '<li><a data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="REGION"> REGION </a></li>' +
        '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="SITES"> SITES </a></li>' +
        '</ul>' +
        '</li>' +
        '</ul>' +
        '<button type="button" class="close" data-dismiss="widget">' +
        '<span aria-hidden="true">&times;</span>' +
        '<span class="sr-only">Close</span>' +
        '</button>',
      link: function ($scope, elem, attrs) {
        elem.find('#measuresOptions li a').bind('click', function (e) {
          var messureText = $(this).attr('rel');
          elem.find("#measuresLabel").html(messureText);
          $scope.$apply($scope.$parent.changeCDBKPI(messureText.toLowerCase(), elem.find("#dimensionLabel").text().toLowerCase(), $scope.updateTo));
        });
        elem.find('#dimensionOptions li a').bind('click', function (e) {
          var dimensionText = $(this).attr('rel');
          elem.find("#dimensionLabel").html(dimensionText);
          $scope.$apply($scope.$parent.changeCDBKPI(elem.find("#measuresLabel").text().toLowerCase(), dimensionText.toLowerCase(), $scope.updateTo));
        });
      }
    };
  });
angObj.directive('truncateTextWithHover', function () {
    return{
      restrict: 'AE',
      scope: {
        txt: "@txt",
        txtLength: "@txtlength"
      },
      /*template: '<span data-toggle="tooltip" data-placement="top" data-original-title="{{txt}}" ng-show="(txt.length > txtLength)">' +
      '{{txt |limitTo:txtLength}} ...</span>'+
      '<span  ng-show="(txt.length <= txtLength)">' +
      '{{txt}}</span>'*/
        template:'<span ng-show="(txt.length > txtLength)" tooltip-placement="top" tooltip="{{txt}}" >{{txt|limitTo:txtLength}} ...</span>' +
      '<span  ng-show="(txt.length <= txtLength)">' +
      '{{txt}}</span>'
    };
  });
  angObj.filter('spliter', function () {
    return function (input, splitIndex) {
// do some bounds checking here to ensure it has that index
      return input.split(' ')[splitIndex];
    }
  });
  angObj.filter('kpiFormatter', function ($filter) {
    return function (input, kpiType, precision) {
      if (input && kpiType) {
        if (kpiType.toLowerCase() == 'ctr') {
          return $filter('number')(input, 2) + '%';
        } else if (kpiType.toLowerCase() == 'cpc' || kpiType.toLowerCase() == 'cpa' || kpiType.toLowerCase() == 'cpm') {
          return '$' + $filter('number')(input, 2);
        } else if (kpiType.toLowerCase() == 'actions' || kpiType.toLowerCase() == 'clicks' || kpiType.toLowerCase() == 'impressions') {
          return $filter('number')(input, 0);
        } else if (kpiType.toLowerCase() == 'vtc' && precision === undefined) {
          return $filter('number')(input, 0) + '%';
        } else if (kpiType.toLowerCase() == 'vtc' && precision) {
          return $filter('number')(input, 2) + '%';
        } else {
//unknown kpiType
          return $filter('number')(input, 0);
        }
      } else {
        return 'NA';
      }
    }
  });
  angObj.filter('toCamelCase', function () {
    return function (input) {
      if (input == undefined) {
        return '';
      }
      input = input.charAt(0).toUpperCase() + input.substr(1);
      return input.replace(/(\-[a-z])/g, function ($1) {
        return $1.toUpperCase().replace('-', '');
      });
    }
  });
  angObj.filter('toTitleCase', function () {
    return function (input) {
      if (input == undefined) {
        return '';
      }
      input = input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
      return input;
    }
  });
  angObj.filter('toUpperCase', function () {
    return function (input) {
      if (input == undefined) {
        return '';
      }
      input = input.toUpperCase() ;
      return input;
    }
  });
  angObj.filter('toLowerCase', function () {
    return function (input) {
      if (input == undefined) {
        return '';
      }
      input = input.toLowerCase() ;
      return input;
    }
  });
  angObj.filter('formatCostData', function ($filter) {
    return function (input, symbol, places) {
      if (input == undefined) {
        return 'NA';
      }
      if(symbol === undefined) {
        symbol = '';
      }
      if(places !== undefined) {
        return symbol + $filter('number')(input, places);
      }
      return symbol + input;
    }
  });
  angObj.filter('truncateString', function () {
    return function (input, stringLength) {
      if(input === undefined) {
        return 'NA';
      }
      return input.substring(0, stringLength) + (input.length > stringLength ? ' [...]' : '');
    }
  });
  angObj.filter('roundThisOff', function () {
    return function (input, places) {
      var factor = Math.pow(10, places);
      return Math.round(input * factor) / factor;
    }
  });
  angObj.filter('displayActionSubtypes', function () {
    return function (actionSubTypes) {
      if (actionSubTypes === undefined) {
        return "-";
      }
      var length = actionSubTypes.length,
        subType = "";
      if (length > 1) {
        for (var i = 0; i < actionSubTypes.length; i++) {
          subType += actionSubTypes[i].name;
          if (i != actionSubTypes.length - 1) {
            subType += ", ";
          }
        }
        return subType;
      } else {
        return actionSubTypes[0].name;
      }
    }
  });
  angObj.filter('formatActionDate', function ($filter) {
    return function (input) {
      var _date = new Date(input),
        formatDate = "";
      if (moment(_date).diff(moment(), 'days') == 0) {
//today - format 01:29 PM
        formatDate = $filter('date')(_date, 'h:mm a');
      } else {
//in the past - format 05 Oct '14 01:22 PM
        formatDate = $filter('date')(_date, "d MMM ''''yy h:mm a");
      }
      return formatDate;
    }
  });
  angObj.filter('platformIconCss', function () {
    return function (input, defaultIcon) {
      var _style = "",
        icon = input;
      if (input === undefined || input == "") {
        icon = defaultIcon || assets.platform_icon;
        _style = "background:url('" + icon + "') no-repeat scroll 0 0 rgba(0, 0, 0, 0);"
        + "width: 17px;"
        + "height: 17px;"
        + "display: inline-block;"
        + 'background-size:17px;"';
        return _style;
      }

    }
  });
//Used in _inventory.html file
  angObj.filter('formatUrl', function () {
    return function (url, l) {
      if (url === undefined || url == "") {
        return url;
      }
      if (url === "No Campaign Found" || url == "No Strategy Found") {
        return url;
      }
      if (l === undefined) {
        var l = 20;
      }
// var l = 26;
      if (url.length > parseInt(l * 2 + 3)) {
        return url.substring(0, l) + ' ... ' + url.substring(url.length - l);
      } else {
        return url;
      }
    }
  });
  angObj.filter('appendDollor', function () {
    return function (val, type) {
        if (val === undefined || val === "" || val === "null") {
            return 'NA';
        }
        else if (type.toLowerCase() === "delivery (impressions)")
            return (val.toFixed(2)).toLocaleString();
        else {
            return (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' || type.toLowerCase() === 'action rate'  || type.toLowerCase() === 'vtc' ) ? (val * 100).toFixed(2) + '%' : '$' + val.toFixed(2);
        }
    }
  });
    // This is used in tooltip for optimization tab
    angObj.filter('appendDollarWithoutFormat', function () {
       // console.log("append dollar without format");
        return function (val, type) {
            if (val === undefined || val === "" || val === "null") {
                return 'NA';
            }
            else if (type.toLowerCase() === "delivery (impressions)")
                return val.toLocaleString();
            else {
                return (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' || type.toLowerCase() === 'action rate'  || type.toLowerCase() === 'vtc' ) ? parseFloat((val*100).toFixed(6)) + '%' : '$' + parseFloat((val).toFixed(6)) ;
            }
        }
    });
  angObj.filter('calculatePerc', function () {
    return function (delivered, total) {
      if (delivered === undefined || total === undefined) {
        return 0;
      }
      var width = parseInt((delivered / total )* 124);
      //@124 is the css width of the progress bar
      if(width > 124){
        return 124;
      }
      return width;
    }
  });
  angObj.filter('newlines', function(){
     return function (input) {
        return input.replace(/(?:\r\n|\r|\n)/g, '<br />');
     }
  });
   angObj.filter('removeSpecialCharacter', function(){
     return function (input) {
        return input.replace(/(?:<)/g, '&lt;');
     }
  });
  angObj.filter('morelines', function(){
     return function (input) {
        return input.replace('\\n', '<br />');
     }
  });
  angObj.filter("zeroToBeLast", function () {
    return function (array, key) {
        var present = array.filter(function (item) {
            return item[key];
        });
        var empty = array.filter(function (item) {
            return !item[key]
        });
        return present.concat(empty);
    };
});
  $.fn.scrollWithInDiv = function() {
    this.bind('mousewheel DOMMouseScroll', function (e) {
      var scrollTo = null;

      if (e.type == 'mousewheel') {
        scrollTo = (e.originalEvent.wheelDelta * -1);
      }
      else if (e.type == 'DOMMouseScroll') {
        scrollTo = 40 * e.originalEvent.detail;
      }

      if (scrollTo) {
        e.preventDefault();
        $(this).scrollTop(scrollTo + $(this).scrollTop());
      }
    });
    return this;
  };
}());
