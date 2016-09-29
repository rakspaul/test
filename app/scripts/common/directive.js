define(['angularAMD'], function (angularAMD) {
    'use strict';

    angularAMD
        .directive('welcomeUser', function (common) {
            return {
                restrict: 'AE',

                scope: {
                    username: '@username'
                },

                template: '<div class="navbar" role="navigation">' +
                    '<div class="container-fluid">' +
                        '<div class="navbar-header col-xs-6 col-sm-2 col-md-3">' +
                            '<button type="button" ' +
                                'class="navbar-toggle" ' +
                                'data-toggle="collapse" ' +
                                'data-target=".navbar-collapse">' +
                                '<span class="sr-only">Toggle navigation</span>' +
                                '<span class="icon-bar"></span>' +
                                '<span class="icon-bar"></span>' +
                                '<span class="icon-bar"></span>' +
                            '</button>' +
                            '<a id="logo" class="navbar-brand" href="#">Collective Media</a>' +
                        '</div>' +
                        '<span class="navbar-brand col-xs-4 col-sm-6 col-md-6 applicationName">' +
                            common.title +
                        '</span>' +
                        '<div class="navbar-collapse collapse">' +
                            '<ul class="nav navbar-nav navbar-right">' +
                                '<li><a class="buttonRegularText" >Welcome, {{username}}</a></li>' +
                            '</ul>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            };
        })

        .directive('loader', function ($http) {
            angular.element('#ngViewPlaceHolder').hide();

            return {
                restrict: 'AEC',

                link: function (scope, elm) {
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
        })

        .directive('scrollOnClick', function ($routeParams) {
            return {
                restrict: 'A',

                link: function () {
                    if ($routeParams.to) {
                        window.setTimeout(function () {
                            if ($routeParams.to.length) {
                                jQuery('body').animate({
                                    scrollTop: jQuery('#camp_' + $routeParams.to).offset().top
                                }, 'slow');
                            }
                        }, 2000);
                    }
                }
            };
        })

        // Details-Banner-Directive
        .directive('campaignDetailsBanner', function () {
            return {
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
        })

        .directive('makeTitle', function () {
            return {
                restrict: 'AE',

                scope: {
                    measures: '=',
                    dimensions: '=',
                    updateparent: '&',
                    measurementList: '=',
                    dimensionList: '=',
                    groupList: '=',
                    updateTo: '='
                },

                template:
                    '<ul class="nav navbar-nav">' +
                        '<li class="dropdown">' +
                            '<a class="dropdown-toggle" data-toggle="dropdown">' +
                                '<span id="measuresLabel" >{{measures}}</span>' +
                            '</a>' +
                            '<ul class="dropdown-menu" ' +
                                'role="menu" ' +
                                'aria-labelledby="myTabDrop1" ' +
                                'id="measuresOptions">' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="IMPRESSIONS">' +
                                        ' IMPRESSIONS ' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="CTR">' +
                                        ' CTR ' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="CVR">' +
                                        ' CVR ' +
                                    '</a>' +
                        '       </li>' +
                            '</ul>' +
                        '</li>' +
                        '<li> BY </li>' +
                        '<li class="dropdown">' +
                            '<a class="dropdown-toggle" data-toggle="dropdown">' +
                                '<span id="dimensionLabel">{{dimensions}}</span>' +
                            '</a>' +
                            '<ul id="dimensionOptions" ' +
                                'aria-labelledby="myTabDrop1" ' +
                                'role="menu" ' +
                                'class="dropdown-menu">' +
                                '<li>' +
                                    '<a data-toggle="" ' +
                                        'role="tab" ' +
                                        'tabindex="-1" ' +
                                        'href="javascript://" ' +
                                        'rel="AGE">' +
                                        ' AGE ' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a style="" ' +
                                        'data-toggle="" ' +
                                        'role="tab" ' +
                                        'tabindex="-1" ' +
                                        'href="javascript://" ' +
                                        'rel="GENDER">' +
                                        'GENDER' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a style="" ' +
                                        'data-toggle="" ' +
                                        'role="tab" ' +
                                        'tabindex="-1" ' +
                                        'href="javascript://" ' +
                                        'rel="INMARKET">' +
                                        'INMARKET' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                        '</li>' +
                    '</ul>' +
                    '<button type="button" class="close" data-dismiss="widget">' +
                        '<span aria-hidden="true">&times;</span>' +
                        '<span class="sr-only">Close</span>' +
                    '</button>',

                link: function ($scope, elem) {
                    elem.find('#measuresOptions li a').bind('click', function () {
                        var measureText = $(this).attr('rel');

                        elem.find('#measuresLabel').html(measureText);

                        $scope.$apply($scope.$parent.changeAudienceKPI(measureText.toLowerCase(),
                            elem.find('#dimensionLabel').text().toLowerCase(), $scope.updateTo));
                    });

                    elem.find('#dimensionOptions li a').bind('click', function () {
                        var dimensionText = $(this).attr('rel');

                        elem.find('#dimensionLabel').html(dimensionText);

                        $scope.$apply($scope.$parent.changeAudienceKPI(
                            elem.find('#measuresLabel').text().toLowerCase(),
                            dimensionText.toLowerCase(), $scope.updateTo)
                        );
                    });
                }
            };
        })

        .directive('makeTitleCdb', function () {
            return {
                restrict: 'AE',

                scope: {
                    measures: '=',
                    dimensions: '=',
                    updateparent: '&',
                    measurementList: '=',
                    dimensionList: '=',
                    groupList: '=',
                    updateTo: '='
                },

                template:
                    '<ul class="nav navbar-nav">' +
                        '<li class="dropdown">' +
                            '<a class="dropdown-toggle" data-toggle="dropdown">' +
                                '<span id="measuresLabel" >{{measures}}</span>' +
                            '</a>' +
                            '<ul class="dropdown-menu" ' +
                                'role="menu" ' +
                                'aria-labelledby="myTabDrop1" ' +
                                'id="measuresOptions">' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="IMPRESSIONS">' +
                                        'IMPRESSIONS' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="CTR">' +
                                        'CTR' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="CVR">' +
                                        ' CVR ' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="javascript://" ' +
                                        'tabindex="-1" ' +
                                        'role="tab" ' +
                                        'data-toggle="" ' +
                                        'rel="SPEND">' +
                                        'SPEND' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                        '</li>' +
                        '<li> BY </li>' +
                        '<li class="dropdown">' +
                            '<a class="dropdown-toggle" data-toggle="dropdown">' +
                                '<span id="dimensionLabel">{{dimensions}}</span>' +
                            '</a>' +
                            '<ul id="dimensionOptions" ' +
                                'aria-labelledby="myTabDrop1" ' +
                                'role="menu" ' +
                                'class="dropdown-menu">' +
                                '<li>' +
                                    '<a data-toggle="" ' +
                                        'role="tab" ' +
                                        'tabindex="-1" ' +
                                        'href="javascript://" ' +
                                        'rel="REGION">' +
                                        'REGION' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a style="" ' +
                                        'data-toggle="" ' +
                                        'role="tab" ' +
                                        'tabindex="-1" ' +
                                        'href="javascript://" ' +
                                        'rel="SITES">' +
                                        'SITES' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                        '</li>' +
                    '</ul>' +
                    '<button type="button" class="close" data-dismiss="widget">' +
                        '<span aria-hidden="true">&times;</span>' +
                        '<span class="sr-only">Close</span>' +
                    '</button>',

                link: function ($scope, elem) {
                    elem.find('#measuresOptions li a').bind('click', function () {
                        var measureText = $(this).attr('rel');

                        elem.find('#measuresLabel').html(measureText);

                        $scope.$apply($scope.$parent.changeCDBKPI(measureText.toLowerCase(),
                            elem.find('#dimensionLabel').text().toLowerCase(), $scope.updateTo));
                    });

                    elem.find('#dimensionOptions li a').bind('click', function () {
                        var dimensionText = $(this).attr('rel');

                        elem.find('#dimensionLabel').html(dimensionText);

                        $scope.$apply($scope.$parent.changeCDBKPI(elem.find('#measuresLabel').text().toLowerCase(),
                            dimensionText.toLowerCase(), $scope.updateTo));
                    });
                }
            };
        })

        .directive('truncateTextWithHover', function (campaignListService) {
            return {
                restrict: 'AE',

                scope: {
                    txt: '@txt',
                    txtHtml: '@txtHtml',
                    txtLength: '@txtlength',
                    lstCampaign: '='
                },

                template:
                    '<span ng-show="(txt.length > txtLength)" ' +
                        'tooltip-placement="top" ' +
                        'tooltip="{{txt}}" ' +
                        'ng-bind-html="(txtHtml|limitTo:txtLength) + \'...\'">' +
                    '</span>' +
                    '<span ng-show="(txt.length <= txtLength)" ' +
                        'class="campaign_name_txt" ' +
                        'tooltip-placement="top" ' +
                        'tooltip="{{txt}}" ' +
                        'ng-bind-html="txtHtml">' +
                    '</span>',

                link: function (scope, element) {
                    element.on('click', function () {
                        campaignListService.setListCampaign(scope.lstCampaign);
                    });
                }
            };
        })

        .directive('targetingIconWithHover', function () {
            return {
                restrict: 'AE',

                scope: {
                    txt: '@txt',
                    className: '@className'
                },

                template:
                    '<span ng-show="(txt.length > 0 )" ' +
                        'tooltip-placement="bottom" ' +
                        'tooltip="{{txt}}" ' +
                        'class="{{className}}">' +
                    '</span>'
            };
        })

        .directive('wholeNumberOnly', function () {
            return {
                restrict: 'A',

                link: function (scope, element) {
                    element.on('keypress keyup blur', function (evt) {
                        var charCode = (evt.which) ? evt.which : window.event.keyCode;

                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                            return false;
                        } else if (([8, 13, 27, 37, 38, 39, 40].indexOf(charCode > -1))) {
                            return true;
                        }

                        return true;
                    });
                }
            };
        })

        .directive('validNumber', function() {
            return {
                require: '?ngModel',

                link: function(scope, element, attrs, ngModelCtrl) {
                    if(!ngModelCtrl) {
                        return;
                    }

                    ngModelCtrl.$parsers.push(function(val) {
                        var clean = val.replace(/[^-0-9\.]/g, ''),
                            negativeCheck = clean.split('-'),
                            decimalCheck = clean.split('.');

                        if (angular.isUndefined(val)) {
                            val = '';
                        }

                        if (!angular.isUndefined(negativeCheck[1])) {
                            negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                            clean =negativeCheck[0] + '-' + negativeCheck[1];

                            if(negativeCheck[0].length > 0) {
                                clean =negativeCheck[0];
                            }
                        }

                        if (!angular.isUndefined(decimalCheck[1])) {
                            decimalCheck[1] = decimalCheck[1].slice(0,2);
                            clean =decimalCheck[0] + '.' + decimalCheck[1];
                        }

                        if (val !== clean) {
                            ngModelCtrl.$setViewValue(clean);
                            ngModelCtrl.$render();
                        }
                        return clean;
                    });

                    element.bind('keypress', function(event) {
                        if(event.keyCode === 32) {
                            event.preventDefault();
                        }
                    });
                }
            };
        })

        .directive('inputCommaSeparatorThousands', function ($filter) {
            return {
                require: '?ngModel',

                link: function (scope, elem, attrs, ctrl) {
                    if (!ctrl) {
                        return;
                    }

                    ctrl.$parsers.unshift(function (viewValue) {
                        var plainNumber = viewValue.replace(/[\,\.]/g, ''),
                            b = $filter('number')(plainNumber);

                        if ( b !== 0 ) {
                            elem.val(b);
                        }

                        return plainNumber;
                    });
                }
            };
        })

        .directive('fractionNumbers', function () {
            return {
                restrict: 'A',

                link: function (scope, element) {
                    element.on('keypress keyup blur', function (evt) {
                        var charCode = (evt.which) ? evt.which : window.event.keyCode;

                        if (charCode > 31 && (charCode !== 46 || this.value.indexOf('.') !== -1) &&
                            (charCode < 48 || charCode > 57)) {
                            return false;
                        } else if (([8, 13, 27, 37, 38, 39, 40].indexOf(charCode > -1))) {
                            return true;
                        }

                        return true;
                    });
                }
            };
        })

        .directive('removeSpecialCharacter', function () {
            return {
                require: 'ngModel',

                link: function (scope, element, attrs, modelCtrl) {
                    modelCtrl.$parsers.push(function (inputValue) {
                        var transformedInput;

                        if (!inputValue) {
                            return '';
                        }

                        transformedInput = inputValue.replace(/[^a-zA-Z0-9 _-]/gi, '');

                        if (transformedInput !== inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }
                        return transformedInput;
                    });
                }
            };
        })

        .directive('specialCharacter', function () {
            return {
                require: 'ngModel',

                link: function (scope, element, attrs, modelCtrl) {
                    modelCtrl.$parsers.push(function (inputValue) {
                        var transformedInput;

                        if (!inputValue) {
                            return '';
                        }
                        transformedInput = inputValue.replace(/[^a-zA-Z0-9 _-]/gi, '');
                        if (transformedInput !== inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                            element.siblings('.special-character-error').show();
                            setTimeout(function(){
                               element.siblings('.special-character-error').fadeOut();
                            }, 6000);
                        }
                        element.bind('blur', function() {
                            element.siblings('.special-character-error').fadeOut();
                        });
                        return transformedInput;
                    });

                }
            };
        })

        .directive('errSrc', function() {
            return {
                link: function(scope, element, attrs) {
                    element.bind('error', function() {
                        if (attrs.src !== attrs.errSrc) {
                            attrs.$set('src', attrs.errSrc);
                        }
                    });
                }
            };
        })

       .directive('roundConverter', function() {
          return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModelCtrl) {
              function roundNumber(val) {
                var parsed = parseFloat(val, 10);
                if(parsed !== parsed) { return null; } // check for NaN
                var rounded = Math.round(parsed);
                return rounded;
              }
              // Parsers take the view value and convert it to a model value.
              ngModelCtrl.$parsers.push(roundNumber);
           }
         };
        })
        .directive('searchBox', function() {
            return {
                restrict: 'A',
                require: 'ngModel',

                link: function (scope, element) {
                     var clearBtn = element.parent().find('.searchClearInputBtn');

                    element.on('keyup blur', function (evt) {
                        var searchInpVal = evt.target.value;

                        clearBtn.toggle(Boolean(searchInpVal));
                    });

                    clearBtn.on('click', function(ev) {
                        $(ev.currentTarget).hide();
                    });
                }
            };
        });
});
