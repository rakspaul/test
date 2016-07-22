define(['angularAMD', 'common/services/constants_service', 'common/services/role_based_service'],
    function (angularAMD) {
        angularAMD
        // NOTE: Not used anywhere (as on 19th July 2016)
            .filter('splitter', function () {
                return function (input, splitIndex) {
                    // do some bounds checking here to ensure it has that index
                    return input.split(' ')[splitIndex];
                };
            })

            // NOTE: Used in
            // 1) bar_chart.html
            // (as on 19th July 2016)
            .filter('dashboardKpiFormatter', function ($filter, constants) {
                return function (input, kpiType) {
                    var returnValue;

                    if (input && kpiType) {
                        kpiType = kpiType.toLowerCase();

                        if (kpiType === 'ctr' || kpiType === 'action_rate' || kpiType === 'action rate') {
                            returnValue = input + '%';
                        } else if (kpiType === 'vtc') {
                            returnValue = input + '%';
                        } else if (kpiType === 'cpc' || kpiType === 'cpa' || kpiType === 'cpm') {
                            returnValue = constants.currencySymbol + input;
                        } else if (kpiType === 'gross_rev' || kpiType === 'impressions') {
                            returnValue = input + '%';
                        }
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in:
            // 1) campaign_card.html
            // 2) campaign_tactics_card.html
            // 3) campaign_cost_card.html
            // 4) campaign_details.html
            // 5) campaign_strategy_card.html
            // 6) custom_report.html
            // 7) bar_chart.html
            // (as on 19th July 2016)
            .filter('kpiFormatter', function ($filter, constants, $locale, RoleBasedService) {
                return function (input, kpiType, precision) {
                    var returnValue;

                    RoleBasedService.setCurrencySymbol();

                    if (input && kpiType) {
                        kpiType = kpiType.toLowerCase();

                        if (kpiType === 'ctr' || kpiType === 'action_rate' || kpiType === 'action rate') {
                            returnValue = $filter('number')(input, 3) + '%';
                        } else if (kpiType === 'cpc' || kpiType === 'cpa' || kpiType === 'cpm') {
                            returnValue = constants.currencySymbol + $filter('number')(input, 3);
                        } else if (kpiType === 'actions' ||
                            kpiType === 'clicks' ||
                            kpiType === 'impressions' ||
                            kpiType === 'delivery') {
                            returnValue = $filter('number')(input, 0);
                        } else if (kpiType === 'vtc' && !precision) {
                            returnValue = $filter('number')(input, 0) + '%';
                        } else if (kpiType === 'vtc' && precision) {
                            returnValue = $filter('number')(input, 3) + '%';
                        } else {
                            // unknown kpiType
                            returnValue = $filter('number')(input, 0);
                        }
                    } else {
                        if (kpiType.toLowerCase() === 'impressions') {
                            returnValue = 0;
                        }

                        returnValue = 'NA';
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) campaign_create.html
            // 2) performance.html
            // 3) budget.html
            // (as on 19th July 2016)
            .filter('setDecimal', function () {
                return function (input, places) {
                    var factor;

                    if (isNaN(input)) {
                        return input;
                    }

                    factor = '1' + new Array(+(places > 0 && places + 1)).join('0');

                    return Math.round(input * factor) / factor;
                };
            })

            // NOTE: Used in
            // 1) campaign_overview.html
            // 2) campaign_tactics_card.html
            // (as on 22nd July 2016)
            .filter('toCamelCase', function () {
                return function (str) {
                    return str
                        .toLowerCase()
                        .replace(/['']/g, '')
                        .replace(/\W+/g, ' ')
                        .replace(/ (.)/g, function ($1) {
                            return $1.toUpperCase();
                        }).replace(/ /g, '');
                };
            })

            // NOTE: Used in
            // 1) campaign_details.html
            // 2) campaign_tactics_card.html
            // 3) campaign_card.html
            // 4) campaign_strategy_card.html
            // (as on 22nd July 2016)
            .filter('displayToCamelCase', function (toCamelCaseFilter, toTitleCaseFilter) {
                return function (input) {
                    var returnValue;

                    if (!input) {
                        returnValue = '';
                    } else if (input.toLowerCase() === 'delivery') {
                        returnValue = toTitleCaseFilter(input);
                    } else if (input.toLowerCase() === 'clicks') {
                        returnValue = toTitleCaseFilter(input);
                    } else if (input.toLowerCase() === 'viewable impressions') {
                        returnValue = 'Viewable Impressions';
                    } else if (input.toLowerCase() === 'impressions') {
                        returnValue = toTitleCaseFilter(input);
                    } else if (input.toLowerCase() === 'select from list') {
                        returnValue = 'Select From list';
                    } else {
                        returnValue = input.toUpperCase();
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) ad_create_controller.js
            // 2) campaign_cost_card.html
            // 3) campaign_card.html
            // 4) inventory.html
            // (as on 22nd July 2016)
            .filter('toTitleCase', function () {
                return function (input) {
                    var returnValue = '';

                    if (input) {
                        returnValue = input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) screen_chart_model.js
            // 2) buying_platform.js
            // 3) campaign_create_controller.js
            // 4) performance.html
            // 5) overview_getAdgroups.html
            // (as on 22nd July 2016)
            .filter('toPascalCase', function (toTitleCaseFilter) {
                return function (input) {
                    var splitStr = input.split(' '),
                        finalStr = '',
                        i;

                    if (input) {
                        for (i = 0; i < splitStr.length; i++) {
                            finalStr += toTitleCaseFilter(splitStr[i]);

                            if (i + 1 < splitStr.length) {
                                finalStr += ' ';
                            }
                        }
                    }

                    return finalStr;
                };
            })

            // NOTE: Not used anywhere.
            // (as on 22nd July 2016)
            // TODO: As this functionality is available in the standard JS library, is this filter really needed???
            .filter('toUpperCase', function () {
                return function (input) {
                    var returnValue = '';

                    if (input) {
                        returnValue = input.toUpperCase();
                    }

                    return returnValue;
                };
            })

            // NOTE: Not used anywhere.
            // (as on 22nd July 2016)
            // TODO: As this functionality is available in the standard JS library, is this filter really needed???
            .filter('toLowerCase', function () {
                return function (input) {
                    var returnValue = '';

                    if (input) {
                        returnValue = input.toLowerCase();
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) campaign_details.html
            // (as on 22nd July 2016)
            .filter('formatCostData', function ($filter) {
                return function (input, symbol, places) {
                    var returnValue;

                    symbol = symbol || '';

                    if (input === undefined) {
                        returnValue = 'NA';
                    } else {
                        if (places !== undefined) {
                            returnValue = symbol + $filter('number')(input, places);
                        } else {
                            returnValue = symbol + input;
                        }
                    }

                    return returnValue;
                };
            })

            // NOTE: Not used anywhere.
            // (as on 22nd July 2016)
            .filter('truncateString', function () {
                return function (input, stringLength) {
                    var returnValue;

                    if (!input) {
                        returnValue = 'NA';
                    } else {
                        returnValue = input.substring(0, stringLength) + (input.length > stringLength ? ' [...]' : '');
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) campaign_strategy_card.html
            // (as on 22nd July 2016)
            .filter('roundThisOff', function () {
                return function (input, places) {
                    var factor;

                    places = places || 0;
                    factor = Math.pow(10, places);

                    return Math.round(input * factor) / factor;
                };
            })

            .filter('vtcRoundOff', function () {
                return function (input, places) {
                    var factor;

                    places = input > 1 ? 0 : places;
                    factor = Math.pow(10, places);

                    return Math.round(input * factor) / factor;
                };
            })

            // NOTE: Not used anywhere (as on 19th July 2016)
            .filter('displayActionSubTypes', function () {
                return function (actionSubTypes) {
                    var length = actionSubTypes.length,
                        subType = '',
                        i;

                    if (!actionSubTypes) {
                        subType = '-';
                    } else {
                        if (length > 1) {
                            for (i = 0; i < actionSubTypes.length; i++) {
                                subType += actionSubTypes[i].name;

                                if (i !== actionSubTypes.length - 1) {
                                    subType += ', ';
                                }
                            }
                        } else {
                            subType = actionSubTypes[0].name;
                        }
                    }

                    return subType;
                };
            })

            // NOTE: Used in campaign_details.html (as on 19th July 2016)
            .filter('formatActionDate', function ($filter) {
                return function (input) {
                    var _date = new Date(input),
                        formatDate;

                    if (moment(_date).diff(moment(), 'days') === 0) {
                        // today - format 01:29 PM
                        formatDate = $filter('date')(_date, 'h:mm a');
                    } else {
                        // in the past - format 05 Oct '14 01:22 PM
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

            // Used in _inventory.html file
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

            // NOTE: Used in campaign_details.html
            // 1) inventory.html
            // 2) optimization.html
            // 3) performance.html
            // 4) platform.html
            // 5) cost.html
            // (as on 19th July 2016)
            .filter('appendDollar', function (constants, $locale, RoleBasedService) {
                return function (val, type) {
                    var returnValue;

                    RoleBasedService.setCurrencySymbol();

                    if (!val) {
                        returnValue = '-';
                    } else if (type.toLowerCase() === 'delivery (impressions)') {
                        returnValue = (val.toFixed(0)).toLocaleString();
                    } else {
                        val = val.toFixed(3);

                        returnValue = (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                        type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                        val + '%' : constants.currencySymbol + val;
                    }

                    return returnValue;
                };
            })

            // This is used in tooltip for optimization tab
            .filter('appendDollarWithoutFormat', function (constants, $locale, RoleBasedService) {
                return function (val, type) {
                    RoleBasedService.setCurrencySymbol();

                    if (!val) {
                        return '-';
                    } else if (type.toLowerCase() === 'delivery (impressions)') {
                        return val.toLocaleString();
                    } else {
                        return (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                        type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                        parseFloat(val.toFixed(6)) + '%' : constants.currencySymbol + parseFloat(val.toFixed(6));
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

                    // @124 is the css width of the progress bar
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

            .filter('moreLines', function () {
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

                    if (key === undefined ) {
                        key = 2;
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
                return function (value) {
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
                return function (value) {
                    return momentService.reportDateFormat(value);
                };
            })

            .filter('formatDate',function ($filter,momentService){
                return function (value,format) {
                    return momentService.formatDate(value,format);
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

            .filter('positive', function () {
                return function (input) {
                    if (!input) {
                        return 0;
                    }

                    return Math.abs(input);
                };
            });
    }
);
