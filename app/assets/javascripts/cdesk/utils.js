/*global angular, angObj, jQuery*/
(function () {
    'use strict';
    angObj.factory('utils', [ function () {
        var formatDate = function (input) {
            var date = new Date(input);
            var dayOfMonth = date.getDate();
            var suffixes = ["th", "st", "nd", "rd"];
            var relevantDigits = (dayOfMonth < 30) ? dayOfMonth % 20 : dayOfMonth % 30;
            var suf = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
            return  suf;
        };
        var makeTitle = function (input) {
            var title='<div id="legend">';
            for(var i=0; i<input.length; i++){
                title += '<a id="a'+(i+1)+'">'+input[i]+'</a>';
            }
            title += '</div>';
            return  title;
        };
        return {
            formatDate: formatDate,
            makeTitle: makeTitle
        };
    }]);

    angObj.directive('welcomeUser', function (common) {
        return{
            restrict: 'AE',
            scope: {
                username: '@username'
            },
            template: '<div class="navbar" role="navigation">' +
                '   <div class="container-fluid">' +
                '       <div class="navbar-header col-xs-6 col-sm-2 col-md-3">' +
                '       <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
                '           <span class="sr-only">Toggle navigation</span>' +
                '           <span class="icon-bar"></span>' +
                '           <span class="icon-bar"></span>' +
                '           <span class="icon-bar"></span>' +
                '       </button>' +
                '       <a id="logo" class="navbar-brand" href="#">Collective Media</a>' +
                '   </div>' +
                '   <span class="navbar-brand col-xs-4 col-sm-6 col-md-6 applicationName">' + common.title + '</span>' +
                '   <div class="navbar-collapse collapse" >' +
                '   <ul class="nav navbar-nav navbar-right">' +
                '       <li><a class="buttonRegularText" >Welcome, {{username}}</a></li>' +
                '   </ul>' +
                '   <!--<loader class="loading-spinner-holder" data-loading >Loading...</loader>-->' +
                '   </div>' +
                '   </div>' +
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
            	startDate :'@start',
                fromSuffix :'@fromsuffix',
                endDate :'@end',
                toSuffix :'@tosuffix',
                back :'=back'
            },
            templateUrl : '../views/detailsbanner.html'
        };
    });

    angObj.directive('makeTitle', function () {
        return{
            restrict: 'AE',
            scope: {
                measures: "=",
                dimensions: "=",
                updateparent: '&',
                measurementList :"=",
                dimensionList: "=",
                groupList :"=",
                updateTo :"="
            },
            template:
                 '<ul class="nav navbar-nav">'+
                 '<li class="dropdown">'+
                     '<a class="dropdown-toggle" data-toggle="dropdown">'+
                         '<span id="measuresLabel" >{{measures}}</span>'+ 
                     '</a>'+
                     '<ul class="dropdown-menu" role="menu" aria-labelledby="myTabDrop1" id="measuresOptions">'+
                         '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="IMPRESSIONS"> IMPRESSIONS </a></li>'+
                         '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CTR"> CTR </a></li>'+
                         '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CVR"> CVR </a></li>'+
                         '</ul>'+
                 '</li>'+
                 '<li> BY </li>'+
                 '<li class="dropdown">'+
                     '<a class="dropdown-toggle"  data-toggle="dropdown">'+
                         '<span id="dimensionLabel">{{dimensions}}</span>'+
                     '</a>'+
                    '<ul  id="dimensionOptions" aria-labelledby="myTabDrop1" role="menu" class="dropdown-menu">'+  
                         '<li><a data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="AGE"> AGE </a></li>'+
                         '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="GENDER"> GENDER </a></li>'+    
                         '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="INMARKET"> INMARKET </a></li>'+
                       '</ul>'+
                    '</li>'+
             '</ul>'+
             '<button type="button" class="close" data-dismiss="widget">'+
                 '<span aria-hidden="true">&times;</span>'+
                 '<span class="sr-only">Close</span>'+
             '</button>',
            link: function($scope, elem, attrs) {
                elem.find('#measuresOptions li a').bind('click', function(e) {
                       var messureText = $(this).attr('rel');
                    elem.find("#measuresLabel").html(messureText);
                       $scope.$apply($scope.$parent.changeAudienceKPI(messureText.toLowerCase(), elem.find("#dimensionLabel").text().toLowerCase(), $scope.updateTo));
                  });
                elem.find('#dimensionOptions li a').bind('click', function(e) {
                       var dimensionText = $(this).attr('rel');
                    elem.find("#dimensionLabel").html(dimensionText);
                       $scope.$apply($scope.$parent.changeAudienceKPI(elem.find("#measuresLabel").text().toLowerCase(), dimensionText.toLowerCase(),$scope.updateTo));
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
                measurementList :"=",
                dimensionList: "=",
                groupList :"=",
                updateTo :"="
            },
            template:
                '<ul class="nav navbar-nav">'+
                '<li class="dropdown">'+
                '<a class="dropdown-toggle" data-toggle="dropdown">'+
                '<span id="measuresLabel" >{{measures}}</span>'+
                '</a>'+
                '<ul class="dropdown-menu" role="menu" aria-labelledby="myTabDrop1" id="measuresOptions">'+
                '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="IMPRESSIONS"> IMPRESSIONS </a></li>'+
                '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CTR"> CTR </a></li>'+
                '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="CVR"> CVR </a></li>'+
                '<li><a href="javascript://" tabindex="-1" role="tab" data-toggle="" rel="SPEND"> SPEND </a></li>'+
                '</ul>'+
                '</li>'+
                '<li> BY </li>'+
                '<li class="dropdown">'+
                '<a class="dropdown-toggle"  data-toggle="dropdown">'+
                '<span id="dimensionLabel">{{dimensions}}</span>'+
                '</a>'+
                '<ul  id="dimensionOptions" aria-labelledby="myTabDrop1" role="menu" class="dropdown-menu">'+
                '<li><a data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="REGION"> REGION </a></li>'+
                '<li><a style="" data-toggle="" role="tab" tabindex="-1" href="javascript://" rel="SITES"> SITES </a></li>'+
                '</ul>'+
                '</li>'+
                '</ul>'+
                '<button type="button" class="close" data-dismiss="widget">'+
                '<span aria-hidden="true">&times;</span>'+
                '<span class="sr-only">Close</span>'+
                '</button>',
            link: function($scope, elem, attrs) {
                elem.find('#measuresOptions li a').bind('click', function(e) {
                    var messureText = $(this).attr('rel');
                    elem.find("#measuresLabel").html(messureText);
                    
                    $scope.$apply($scope.$parent.changeCDBKPI(messureText.toLowerCase(), elem.find("#dimensionLabel").text().toLowerCase(), $scope.updateTo));
                    
                });
                elem.find('#dimensionOptions li a').bind('click', function(e) {
                    var dimensionText = $(this).attr('rel');
                    elem.find("#dimensionLabel").html(dimensionText);
                    $scope.$apply($scope.$parent.changeCDBKPI(elem.find("#measuresLabel").text().toLowerCase(), dimensionText.toLowerCase(),$scope.updateTo));
                });
            }
        };
    });
    
    angObj.filter('spliter', function() {
        return function(input, splitIndex) {
            // do some bounds checking here to ensure it has that index
        return input.split(' ')[splitIndex];
        }
    });

    angObj.filter('kpiFormatter', function($filter) {
        return function(input, kpiType) {
            if(input && kpiType) {
                if(kpiType == 'CTR') {
                    return $filter('number')(input, 2) + '%';
                }else if(kpiType == 'CPC' || kpiType == 'CPA' || kpiType == 'CPM') {
                    return '$' + $filter('number')(input, 2);
                }else if(kpiType == 'Actions' || kpiType == 'Clicks' || kpiType == 'Impressions') {
                    return $filter('number')(input, 0); 
                }else {
                    //unknown kpiType
                    return $filter('number')(input, 0);
                }
            }else {
                return 'NA';
            }
        }
    });

    angObj.filter('toCamelCase', function() {
        return function(input) {
            if(input == undefined) {
                return '';
            }
            input = input.charAt(0).toUpperCase() + input.substr(1);
            return input.replace(/(\-[a-z])/g, function($1) {
                return $1.toUpperCase().replace('-', '');
            });
        }
    });

    angObj.filter('truncateString', function() {
        return function(input, stringLength) {
            return input.substring(0, stringLength) + (input.length > stringLength ? ' [...]' : '');
        }
    });

}());
