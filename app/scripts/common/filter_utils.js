define(['angularAMD','common/services/constants_service', 'common/services/role_based_service'],
    function (angularAMD) {

        angularAMD

            .filter('spliter', function () {
                return function (input, splitIndex) {
                    // do some bounds checking here to ensure it has that index
                    return input.split(' ')[splitIndex];
                };
            })

            .filter('dashboardKpiFormatter', function ($filter, constants) {
                return function (input, kpiType) {
                    if (input && kpiType) {
                        kpiType = kpiType.toLowerCase();
                        if (kpiType === 'ctr' || kpiType === 'action_rate' || kpiType === 'action rate') {
                            return input + '%';
                        } else if (kpiType === 'vtc') {
                            return input + '%';
                        } else if (kpiType === 'cpc' || kpiType === 'cpa' || kpiType === 'cpm') {
                            return constants.currencySymbol + input;
                        } else if (kpiType === 'gross_rev' || kpiType === 'impressions') {
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
                        kpiType = kpiType.toLowerCase()
                        if (kpiType === 'ctr' || kpiType === 'action_rate' || kpiType === 'action rate') {
                            return $filter('number')(input, 3) + '%';
                        } else if (kpiType === 'cpc' || kpiType === 'cpa' || kpiType === 'cpm') {
                            return constants.currencySymbol + $filter('number')(input, 3);
                        } else if (kpiType === 'actions' || kpiType === 'clicks' || kpiType === 'impressions' || kpiType === 'delivery') {
                            return $filter('number')(input, 0);
                        } else if (kpiType === 'vtc' && !precision) {
                            return $filter('number')(input, 0) + '%';
                        } else if (kpiType === 'vtc' && precision) {
                            return $filter('number')(input, 3) + '%';
                        } else {
                            //unknown kpiType
                            return $filter('number')(input, 0);
                        }
                    } else {
                        if (kpiType.toLowerCase() === 'impressions') {
                            return 0;
                        }
                        return 'NA';
                    }
                };
            })

            .filter('setDecimal', function ($filter) {
                return function (input, places) {
                    var factor;

                    if (isNaN(input)) {
                        return input;
                    }

                    factor = '1' + new Array(+(places > 0 && places + 1)).join('0');

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
                        _style = 'background:url("' + icon + '") no-repeat scroll 0 0 rgba(0, 0, 0, 0);' +
                            'width: 17px;' + 'height: 17px;' + 'display: inline-block;' + 'background-size:17px;"';
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
                        return (val.toFixed(0)).toLocaleString();
                    } else {
                       // val = (val >0 && val <1) ? val.toFixed(4):val.toFixed(2);
                        val = val.toFixed(3);

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
                    if(key == undefined ) {
                        key = 2 ;
                    }
                    if (y < 9999) {
                        return value.toFixed(key);
                    }

                    if (y < 1000000) {
                        return (value / 1000).toFixed(key) + 'K';
                    }

                    if (y < 10000000) {
                        return (value / 1000000).toFixed(key) + 'M';
                    }

                    if (y < 1000000000) {
                        return (value / 1000000).toFixed(key) + 'M';
                    }

                    if (y < 1000000000000) {
                        return (value / 1000000000).toFixed(key) + 'B';
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
            })

            .filter('positive', function() {
                return function(input) {
                    if (!input) {
                        return 0;
                    }

                    return Math.abs(input);
                };
            });


    }
);
