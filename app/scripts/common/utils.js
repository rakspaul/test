define(['angularAMD','common/services/constants_service', 'common/services/role_based_service'], function (angularAMD) {
  angularAMD.factory('utils', ["$location", "$sce", "constants", "RoleBasedService", function ($location, $sce, constants, RoleBasedService) {

        var formatDate = function (input) {
                var date = new Date(input),
                    dayOfMonth = date.getDate(),
                    suffixes = ['th', 'st', 'nd', 'rd'],
                    relevantDigits = (dayOfMonth < 30) ? dayOfMonth % 20 : dayOfMonth % 30;

                return relevantDigits <= 3 ? suffixes[relevantDigits] : suffixes[0];
            },

            convertToEST = function (date, format) {
                var d1,
                    d2,
                    tz,
                    finalDate,
                    parsedDate;

                if (date) {
                    d1 = date.slice(0, 10);
                    d2 = d1.split('-');
                    tz = 'UTC';
                    finalDate = d2[1] + '/' + d2[2] + '/' + d2[0] + ' ' + date.slice(11, 19) + ' ' + tz;
                    parsedDate = Date.parse(finalDate);

                }
                if (date === '') {
                    return moment().format(format);
                } else if (format === '') {
                    return moment(parsedDate).tz('EST').format(constants.DATE_US_FORMAT);
                } else {
                    return moment(parsedDate).tz('EST').format(format);
                }
            },

            convertToUTC = function (date, type) {
                var timeSuffix = (type === 'ST' ? '00:00:00' : '23:59:59'),
                    tz = 'EST',
                    finalDate = date + ' ' + timeSuffix + ' ' + ' ' + tz;

                return moment(Date.parse(finalDate)).tz('UTC').format(constants.DATE_UTC_FORMAT);
            },

            reportTypeOptions = function () {
                return [
                    {name: 'PCAR'},
                    {name: 'MCAR'},
                    {name: 'Monthly'},
                    {name: 'Custom'}
                ];
            },

            makeTitle = function (input) {
                var title = '<div id="legend">',
                    i;

                for (i = 0; i < input.length; i++) {
                    title += '<a id="a"' + (i + 1) + '>' + input[i] + '</a>';
                }
                title += '</div>';
                return title;
            },

            highlightSearch = function (text, search) {
                if (!search) {
                    return $sce.trustAsHtml(text);
                }
                return $sce.trustAsHtml(unescape(text.replace(new RegExp(escape(search), 'gi'),
                    '<span class="brand_search_highlight">$&</span>')));
            },

            roundOff = function (value, places) {
                var factor = Math.pow(10, places);

                return Math.round(value * factor) / factor;
            },

            goToLocation = function (url) {
                $location.url(url);
            },

            allValuesSame = function (arr) {
                var i;

                for (i = 1; i < arr.length; i++) {
                    if (arr[i] !== arr[0]) {
                        return false;
                    }
                }
                return true;
            },

            //clones any javascript object recursively
            clone = function clone(obj) {
                var temp,
                    key;

                if (!obj || typeof(obj) !== 'object') {
                    return obj;
                }
                temp = obj.constructor();
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        temp[key] = clone(obj[key]);
                    }
                }
                return temp;
            },

            SEARCH_OBJECT = {
                key: '',
                limit: constants.DEFAULT_LIMIT_COUNT,
                offset: constants.DEFAULT_OFFSET_START
            },

            /**
             * Note: You can provide limit, offset and key as arguments for initializing.
             * Please follow the above order for initialization.
             * Will consider first three parameters only.
             */
            VTCpopupfunc = function (event, flag) {
                var elem = $(event.target),
                    leftPos,
                    vtcContainer,
                    vtcBtnContainer,
                    leftPosNumber,
                    topPos,
                    childPos,
                    parentPos,
                    leftPosTactic;

                elem.closest('.each_campaign_list_container').find('.quartile_details_VTC').show();
                if (flag === 1) {
                    leftPos = elem
                        .closest('.each_campaign_list_container')
                        .find('.quartile_details_VTC_btn')
                        .offset()
                        .left;
                    vtcContainer = elem
                        .closest('.each_campaign_list_container')
                        .find('.quartile_details_VTC')
                        .outerWidth() / 2;
                    vtcBtnContainer = elem
                        .closest('.each_campaign_list_container')
                        .find('.quartile_details_VTC_btn')
                        .outerWidth() / 2;
                    leftPosNumber = leftPos - vtcContainer + vtcBtnContainer;
                    elem
                        .closest('.each_campaign_list_container')
                        .find('.quartile_details_VTC')
                        .css({
                            'left': leftPosNumber,
                            'display': 'block'
                        });
                    if (elem.closest('.tactics_container').length === 0) {
                        topPos = elem
                            .closest('.each_campaign_list_container')
                            .find('.quartile_details_VTC_btn')
                            .offset()
                            .top;
                        elem
                            .closest('.each_campaign_list_container')
                            .find('.quartile_details_VTC')
                            .css('top', topPos - 189);
                    } else {
                        childPos = elem
                            .closest('.each_campaign_list_container')
                            .find('.quartile_details_VTC_btn')
                            .offset();
                        parentPos = elem
                            .closest('.tactics_linkage_lines')
                            .offset();
                        leftPosTactic = childPos.left - parentPos.left - vtcContainer + vtcBtnContainer;
                        elem
                            .closest('.each_campaign_list_container')
                            .find('.quartile_details_VTC')
                            .css({
                                'left': leftPosTactic,
                                'top': childPos.top - parentPos.top - 189,
                                'display': 'block'
                            });
                    }
                } else {
                    elem
                        .closest('.each_campaign_list_container')
                        .find('.quartile_details_VTC')
                        .hide();
                }
            },

            detectBrowserInfo = function () {
                var //nVer = navigator.appVersion,
                    nAgt = navigator.userAgent,
                    browserName = navigator.appName,
                    fullVersion = '' + parseFloat(navigator.appVersion),
                    majorVersion = parseInt(navigator.appVersion, 10),
                    nameOffset,
                    verOffset,
                    ix,
                    //browserInfo = {},
                    re;

                switch (true) {
                    // In Opera 15+, the true version is after 'OPR/'
                    case (nAgt.indexOf('OPR/') !== -1):
                        verOffset = nAgt.indexOf('OPR/');
                        browserName = 'Opera';
                        fullVersion = nAgt.substring(verOffset + 4);
                        break;
                    // In older Opera, the true version is after 'Opera' or after 'Version'
                    case (nAgt.indexOf('Opera') !== -1):
                        verOffset = nAgt.indexOf('Opera');
                        browserName = 'Opera';
                        fullVersion = nAgt.substring(verOffset + 6);
                        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                            fullVersion = nAgt.substring(verOffset + 8);
                        }
                        break;
                    // In MSIE, the true version is after 'MSIE' in userAgent
                    case (nAgt.indexOf('MSIE') !== -1):
                        verOffset = nAgt.indexOf('MSIE');
                        browserName = 'Internet Explorer';
                        fullVersion = nAgt.substring(verOffset + 5);
                        break;
                    //IE 11 and Above
                    case (nAgt.indexOf('Trident/') !== -1):
                        browserName = 'Internet Explorer';
                        re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');
                        if (re.exec(nAgt) !== null) {
                            fullVersion = (RegExp.$1);
                        }
                        break;
                    // In Chrome, the true version is after 'Chrome'
                    case (nAgt.indexOf('Chrome') !== -1):
                        verOffset = nAgt.indexOf('Chrome');
                        browserName = 'Chrome';
                        fullVersion = nAgt.substring(verOffset + 7);
                        break;
                    // In Safari, the true version is after 'Safari' or after 'Version'
                    case (nAgt.indexOf('Safari') !== -1):
                        browserName = 'Safari';
                        verOffset = nAgt.indexOf('Safari');
                        fullVersion = nAgt.substring(verOffset + 7);
                        if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                            fullVersion = nAgt.substring(verOffset + 8);
                        }
                        break;
                    // In Firefox, the true version is after 'Firefox'
                    case (nAgt.indexOf('Firefox') !== -1):
                        verOffset = nAgt.indexOf('Firefox');
                        browserName = 'Firefox';
                        fullVersion = nAgt.substring(verOffset + 8);
                        break;
                    case ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))):
                        browserName = nAgt.substring(nameOffset, verOffset);
                        fullVersion = nAgt.substring(verOffset + 1);
                        if (browserName.toLowerCase() === browserName.toUpperCase()) {
                            browserName = navigator.appName;
                        }
                        break;
                }
                // trim the fullVersion string at semicolon/space if present
                if ((ix = fullVersion.indexOf(';')) !== -1) {
                    fullVersion = fullVersion.substring(0, ix);
                }
                if ((ix = fullVersion.indexOf(' ')) !== -1) {
                    fullVersion = fullVersion.substring(0, ix);
                }
                majorVersion = parseInt('' + fullVersion, 10);
                if (isNaN(majorVersion)) {
                    fullVersion = '' + parseFloat(navigator.appVersion);
                    majorVersion = parseInt(navigator.appVersion, 10);
                }
                return {
                    'browserName':  browserName,
                    'fullVersion':  fullVersion,
                    'majorVersion': majorVersion
                };
            };

        function getTypeaheadParams() {
            var search = clone(SEARCH_OBJECT),
                size = 3,
                i;

            if (arguments.length === 0) {
                return search;
            }
            if (arguments.length < 3) {
                size = arguments.length;
            }
            for (i = 0; i < size; i++) {
                switch (i) {
                    case 0:
                        if (!isNaN(arguments[i])) {
                            search.limit = arguments[i];
                        }
                        break;
                    case 1:
                        if (!isNaN(arguments[i])) {
                            search.offset = arguments[i];
                        }
                        break;
                    case 2:
                        search.key = arguments[i];
                        break;
                }
            }
            return search;
        }

        function getParameterByName(url, name) {
            var results = '',
                regex;

            if (name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                results = regex.exec(url);
                results = !results ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            }
            return results;
        }
        function hasItem(data, key, val){
            var retVal = false;
            _.each(data,function(item){
                if(item[key] == val){
                    retVal = true;
                }
            });
            return retVal;
        }
      function getValueOfItem(data, key){
          var retVal = '';
          _.each(data,function(item){
              if(item['key'] == key.trim()){
                  retVal = item.value;
              }
          });
          return retVal;
      }
        return {
            formatDate: formatDate,
            makeTitle: makeTitle,
            roundOff: roundOff,
            goToLocation: goToLocation,
            allValuesSame: allValuesSame,
            clone: clone,
            highlightSearch: highlightSearch,
            typeaheadParams: getTypeaheadParams(),
            getParameterByName: getParameterByName,
            detectBrowserInfo: detectBrowserInfo,
            VTCpopupfunc: VTCpopupfunc,
            reportTypeOptions: reportTypeOptions,
            convertToEST: convertToEST,
            convertToUTC: convertToUTC,
            hasItem: hasItem,
            getValueOfItem: getValueOfItem
        };
    }]);

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
                    '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
                    '<span class="sr-only">Toggle navigation</span>' +
                    '<span class="icon-bar"></span>' +
                    '<span class="icon-bar"></span>' +
                    '<span class="icon-bar"></span>' +
                    '</button>' +
                    '<a id="logo" class="navbar-brand" href="#">Collective Media</a>' +
                    '</div>' +
                    '<span class="navbar-brand col-xs-4 col-sm-6 col-md-6 applicationName">' + common.title + '</span>' +
                    '<div class="navbar-collapse collapse" >' +
                    '<ul class="nav navbar-nav navbar-right">' +
                    '<li><a class="buttonRegularText" >Welcome, {{username}}</a></li>' +
                    '</ul>' +
                    '<!--<loader class="loading-spinner-holder" data-loading >Loading...</loader>-->' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            };
        })

        .directive('loader', function ($http) {
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
        })

        .directive('scrollOnClick', function ($routeParams) {
            return {
                restrict: 'A',
                link: function (scope, $elm, attrs) {
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

        //Details-Banner-Directive
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
                        var measureText = $(this).attr('rel');

                        elem.find('#measuresLabel').html(measureText);
                        $scope.$apply($scope.$parent.changeAudienceKPI(measureText.toLowerCase(),
                            elem.find('#dimensionLabel').text().toLowerCase(), $scope.updateTo));
                    });
                    elem.find('#dimensionOptions li a').bind('click', function (e) {
                        var dimensionText = $(this).attr('rel');

                        elem.find('#dimensionLabel').html(dimensionText);
                        $scope.$apply($scope.$parent.changeAudienceKPI(elem.find('#measuresLabel').text().toLowerCase(),
                            dimensionText.toLowerCase(), $scope.updateTo));
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
                        var measureText = $(this).attr('rel');

                        elem.find('#measuresLabel').html(measureText);
                        $scope.$apply($scope.$parent.changeCDBKPI(measureText.toLowerCase(),
                            elem.find('#dimensionLabel').text().toLowerCase(), $scope.updateTo));
                    });
                    elem.find('#dimensionOptions li a').bind('click', function (e) {
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
                    txtLength: '@txtlength',
                    lstCampaign: '='
                },
                template: '<span ng-show="(txt.length > txtLength)" tooltip-placement="top" tooltip="{{txt}}">' +
                    '{{txt|limitTo:txtLength}} ...</span>' +
                    '<span  class="campaign_name_txt" ng-show="(txt.length <= txtLength)">' +
                    '{{txt}}</span>',
                link: function (scope, element, attrs, modelCtrl) {
                    element.on('click', function (event) {
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
                template: '<span ng-show="(txt.length > 0 )" tooltip-placement="bottom" tooltip="{{txt}}" class="{{className}}"></span>'
            };
        })

        .directive('wholeNumberOnly', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, modelCtrl) {
                    element.on('keypress keyup blur', function (evt) {
                        var charCode = (evt.which) ? evt.which : window.event.keyCode
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

        .directive('fractionNumbers', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs, modelCtrl) {
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

        .filter('spliter', function () {
            return function (input, splitIndex) {
                // do some bounds checking here to ensure it has that index
                return input.split(' ')[splitIndex];
            };
        })

        .filter('dashboardKpiFormatter', function ($filter, constants) {
            return function (input, kpiType) {
                if (input && kpiType) {
                    if (kpiType.toLowerCase() === 'ctr' || kpiType.toLowerCase() === 'action_rate') {
                        return input + '%';
                    } else if (kpiType.toLowerCase() === 'vtc') {
                        return input + '%';
                    } else if (kpiType.toLowerCase() === 'cpc' || kpiType.toLowerCase() === 'cpa' || kpiType.toLowerCase() === 'cpm') {
                        return constants.currencySymbol + input;
                    } else if (kpiType.toLowerCase() === 'gross_rev' || kpiType.toLowerCase() === 'impressions') {
                        return input + '%';
                    }
                }
            };
        })

        .filter('kpiFormatter', function ($filter, constants, $locale, RoleBasedService) {
            return function (input, kpiType, precision) {
                //constants.currencySymbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
                RoleBasedService.setCurrencySymbol();
                if (input && kpiType) {
                    if (kpiType.toLowerCase() === 'ctr') {
                        return $filter('number')(input, 2) + '%';
                    } else if (kpiType.toLowerCase() === 'cpc' || kpiType.toLowerCase() === 'cpa' ||
                        kpiType.toLowerCase() === 'cpm') {
                        return constants.currencySymbol + $filter('number')(input, 2);
                    } else if (kpiType.toLowerCase() === 'actions' || kpiType.toLowerCase() === 'clicks' ||
                        kpiType.toLowerCase() === 'impressions' || kpiType.toLowerCase() === 'delivery') {
                        return $filter('number')(input, 0);
                    } else if (kpiType.toLowerCase() === 'vtc' && !precision) {
                        return $filter('number')(input, 0) + '%';
                    } else if (kpiType.toLowerCase() === 'vtc' && precision) {
                        return $filter('number')(input, 2) + '%';
                    } else {
                        //unknown kpiType
                        return $filter('number')(input, 0);
                    }
                } else {
                    if (kpiType.toLowerCase() === 'delivery') {
                        return 0;
                    }
                    return 'NA';
                }
            };
        })

        .filter('setDecimal', function ($filter) {
            return function (input, places) {
                if (isNaN(input)) {
                    return input;
                }
                var factor = '1' + new Array(+(places > 0 && places + 1)).join('0');
                return Math.round(input * factor) / factor;
            };
        })
        .filter('toCamelCase', function () {
            return function (str) {
                return str.toLowerCase().replace(/['']/g, '').replace(/\W+/g, ' ').replace(/ (.)/g, function ($1) {
                    return $1.toUpperCase();
                }).replace(/ /g, '');
                /*if (!input) {
                    return '';
                }
                input = input.charAt(0).toUpperCase() + input.substr(1);
                return input.replace(/(\-[a-z])/g, function ($1) {
                    return $1.toUpperCase().replace('-', '');
                });*/
            };
        })

        .filter('displayToCamelCase', function (toCamelCaseFilter, toTitleCaseFilter) {
            return function (input) {
                if (!input) {
                    return '';
                }
                if (input.toLowerCase() === 'delivery') {
                    return toTitleCaseFilter(input);
                }
                if (input.toLowerCase() === 'clicks') {
                    return toTitleCaseFilter(input);
                }
                if (input.toLowerCase() === 'viewable impressions') {
                    return 'Viewable Impressions';
                }
                if (input.toLowerCase() === 'impressions') {
                    return toTitleCaseFilter(input);
                }
                if (input.toLowerCase() === 'select from list') {
                    return 'Select From list';
                }
                return input.toUpperCase();
            };
        })

        .filter('toTitleCase', function () {
            return function (input) {
                if (!input) {
                    return '';
                }
                input = input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
                return input;
            };
        })

        .filter('toPascalCase', function (toTitleCaseFilter) {
            return function (input) {
                var splitStr = input.split(' '),
                    finalStr = '',
                    i;

                if (!input) {
                    return '';
                }
                for (i = 0; i < splitStr.length; i++) {
                    finalStr += toTitleCaseFilter(splitStr[i]);
                    if (i + 1 < splitStr.length) {
                        finalStr += ' ';
                    }
                }
                return finalStr;
            };
        })

        .filter('toUpperCase', function () {
            return function (input) {
                if (!input) {
                    return '';
                }
                return input.toUpperCase();
            };
        })

        .filter('toLowerCase', function () {
            return function (input) {
                if (!input) {
                    return '';
                }
                return input.toLowerCase();
            };
        })

        .filter('formatCostData', function ($filter) {
            return function (input, symbol, places) {
                if (input === undefined) {
                    return 'NA';
                }
                if (!symbol) {
                    symbol = '';
                }
                if(places !== undefined) {
                    return symbol + $filter('number')(input, places);
                }
                return symbol + input;
            };
        })

        .filter('truncateString', function () {
            return function (input, stringLength) {
                if (!input) {
                    return 'NA';
                }
                return input.substring(0, stringLength) + (input.length > stringLength ? ' [...]' : '');
            };
        })

        .filter('roundThisOff', function () {
            return function (input, places) {
                var factor = Math.pow(10, places);

                return Math.round(input * factor) / factor;
            };
        })

        .filter('vtcRoundOff', function () {
            return function (input, places) {
                var factor = Math.pow(10, places);

                places = input > 1 ? 0 : places;
                return Math.round(input * factor) / factor;
            };
        })

        .filter('displayActionSubtypes', function () {
            return function (actionSubTypes) {
                var length = actionSubTypes.length,
                    subType = '',
                    i;

                if (!actionSubTypes) {
                    return '-';
                }
                if (length > 1) {
                    for (i = 0; i < actionSubTypes.length; i++) {
                        subType += actionSubTypes[i].name;
                        if (i !== actionSubTypes.length - 1) {
                            subType += ', ';
                        }
                    }
                    return subType;
                } else {
                    return actionSubTypes[0].name;
                }
            };
        })

        .filter('formatActionDate', function ($filter) {
            return function (input) {
                var _date = new Date(input),
                    formatDate = '';

                if (moment(_date).diff(moment(), 'days') === 0) {
                    //today - format 01:29 PM
                    formatDate = $filter('date')(_date, 'h:mm a');
                } else {
                    //in the past - format 05 Oct '14 01:22 PM
                    formatDate = $filter('date')(_date, 'd MMM yyyy h:mm a');
                }
                return formatDate;
            };
        })

        .filter('platformIconCss', function () {
            return function (input, defaultIcon) {
                var _style = '',
                    icon = input;

                if (!input) {
                    icon = defaultIcon || assets.platform_icon;
                    _style = 'background:url("' + icon + '") no-repeat scroll 0 0 rgba(0, 0, 0, 0);' + 'width: 17px;' +
                        'height: 17px;' + 'display: inline-block;' + 'background-size:17px;"';
                    return _style;
                }
            };
        })

        //Used in _inventory.html file
        .filter('formatUrl', function (constants) {
            return function (url, l) {
                if (!url) {
                    return url;
                }
                if (url === constants.NO_MEDIAPLANS_FOUND || url === constants.NO_ADGROUPS_FOUND) {
                    return url;
                }
                if (!l) {
                    l = 20;
                }
                if (url.length > parseInt(l * 2 + 3)) {
                    return url.substring(0, l) + ' ... ' + url.substring(url.length - l);
                } else {
                    return url;
                }
            };
        })

        .filter('appendDollor', function (constants, $locale, RoleBasedService) {
            return function (val, type) {
                RoleBasedService.setCurrencySymbol();
                if(!val) {
                    return '-';
                } else if (type.toLowerCase() === 'delivery (impressions)') {
                    return (val.toFixed(2)).toLocaleString();
                } else {
                    val = (val >0 && val <1) ? val.toFixed(4):val.toFixed(2);
                    return (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                        type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                        val + '%' :
                        constants.currencySymbol + val;
                }
            };
        })

        // This is used in tooltip for optimization tab
        .filter('appendDollarWithoutFormat', function (constants, $locale, RoleBasedService) {
            return function (val, type) {
                RoleBasedService.setCurrencySymbol();
                if(!val) {
                    return '-';
                } else if (type.toLowerCase() === 'delivery (impressions)') {
                    return val.toLocaleString();
                } else {
                    return (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                        type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                        parseFloat(val.toFixed(6)) + '%' :
                        constants.currencySymbol + parseFloat(val.toFixed(6));
                }
            };
        })

        .filter('calculatePerc', function () {
            return function (delivered, total) {
                var width;

                if (!delivered || !total) {
                    return 0;
                }
                width = parseInt(delivered / total) * 124;
                //@124 is the css width of the progress bar
                if (width > 124) {
                    return 124;
                }
                return width;
            };
        })

        .filter('newlines', function () {
            return function (input) {
                return input.replace(/(?:\r\n|\r|\n)/g, '<br />');
            };
        })

        .filter('removeSpecialCharacter', function () {
            return function (input) {
                return input.replace(/(?:<)/g, '&lt;');
            };
        })

        .filter('morelines', function () {
            return function (input) {
                return input.replace('\\n', '<br />');
            };
        })

        .filter('zeroToBeLast', function () {
            return function (array, key) {
                var present = array.filter(function (item) {
                        return item[key];
                    }),
                    empty = array.filter(function (item) {
                        return !item[key];
                    });

                return present.concat(empty);
            };
        })

        .filter('nrFormat', function () {
            return function (value, key) {
                var y = Math.abs(value);

                if (y <= 0) {
                    return y;
                }
                key = key || 0;
                if (y < 9999) {
                    return value.toFixed(key);
                }
                if (y < 1000000) {
                    return (value / 1000).toFixed(2) + 'K';
                }
                if (y < 10000000) {
                    return (value / 1000000).toFixed(2) + 'M';
                }
                if (y < 1000000000) {
                    return (value / 1000000).toFixed(2) + 'M';
                }
                if (y < 1000000000000) {
                    return (value / 1000000000).toFixed(2) + 'B';
                }
                return '1T+';
            };
        })

        // i18n of currency fails when the currency symbol comes at the end of the value
        .filter('nrFormatWithCurrency', function ($filter) {
            return function (value, key) {
                var y = Math.abs(value);

                if (y < 9999) {
                    return $filter('currency')(value.toFixed(2));
                }
                if (y < 1000000) {
                    return $filter('currency')((value / 1000).toFixed(2)) + 'K';
                }
                if (y < 10000000) {
                    return $filter('currency')((value / 1000000).toFixed(2)) + 'M';
                }
                if (y < 1000000000) {
                    return $filter('currency')((value / 1000000).toFixed(2)) + 'M';
                }
                if (y < 1000000000000) {
                    return $filter('currency')((value / 1000000000).toFixed(2)) + 'B';
                }
                return '1T+';
            };
        })

        .filter('reportDateFilter', function ($filter, momentService) {
            return function (value, key) {
                return momentService.reportDateFormat(value);
            };
        })

        .filter('textEllipsis', function () {
            return function (input, len) {
                var dispName;

                if (!input) {
                    return '';
                }
                dispName = input;
                if (input.length > len) {
                    dispName = input.substring(0, len) + '...';
                }
                return dispName;
            };
        });

    $.fn.scrollWithInDiv = function () {
        this.bind('mousewheel DOMMouseScroll', function (e) {
            var scrollTo = null;
            if (e.type === 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            } else if (e.type === 'DOMMouseScroll') {
                scrollTo = 40 * e.originalEvent.detail;
            }
            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
        });
        return this;
    };
});
