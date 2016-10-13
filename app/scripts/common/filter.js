define(['angularAMD'],
    function (angularAMD) {
        angularAMD
            // NOTE: Not used anywhere
            // (as on 19th July 2016)
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

            // NOTE: Used in
            // 1) campaign_list_service.js
            // (as on 22nd July 2016)
            .filter('vtcRoundOff', function () {
                return function (input, places) {
                    var factor;

                    input = input || 0;
                    places = places || 0;

                    places = input > 1 ? 0 : places;
                    factor = Math.pow(10, places);

                    return Math.round(input * factor) / factor;
                };
            })

            // NOTE: Not used anywhere
            // (as on 19th July 2016)
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

            // NOTE: Used in
            // 1) campaign_details.html
            // (as on 19th July 2016)
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

            // NOTE: Used in
            // 1) campaign_details.html
            // (as on 19th July 2016)
            .filter('platformIconCss', function () {
                return function (input, defaultIcon) {
                    var _style = '',
                        icon = input;

                    if (!input) {
                        icon = defaultIcon || assets.platform_icon;

                        _style = 'background:url("' + icon + '") no-repeat scroll 0 0 rgba(0, 0, 0, 0);' +
                            'width: 17px;' + 'height: 17px;' + 'display: inline-block;' + 'background-size:17px;"';
                    }

                    return _style;
                };
            })

            // NOTE: Used in
            // 1) inventory.html
            // (as on 19th July 2016)
            .filter('formatUrl', function (constants) {
                return function (url, l) {
                    var returnValue;

                    if (!url) {
                        returnValue =  url;
                    } else {
                        if (url === constants.NO_MEDIAPLANS_FOUND || url === constants.NO_ADGROUPS_FOUND) {
                            returnValue =  url;
                        } else {
                            if (!l) {
                                l = 20;
                            }

                            if (url.length > parseInt(l * 2 + 3)) {
                                returnValue = url.substring(0, l) + ' ... ' + url.substring(url.length - l);
                            } else {
                                returnValue = url;
                            }
                        }
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
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
                        //action rate,vtc,ctr should be of 3 decimals and CPA,CPM and CPC should be 2 decimal places
                        val = ((type.toLowerCase() === 'action_rate') || ((type.toLowerCase() === 'ctr')))?val.toFixed(3):val.toFixed(2);

                        returnValue = (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                        type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                        val + '%' : constants.currencySymbol + val;
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) optimization.html
            // (as on 19th July 2016)
            .filter('appendDollarWithoutFormat', function (constants, $locale, RoleBasedService) {
                return function (val, type) {
                    var returnValue;

                    RoleBasedService.setCurrencySymbol();

                    if (!val) {
                        returnValue = '-';
                    } else if (type.toLowerCase() === 'delivery (impressions)') {
                        returnValue = val.toLocaleString();
                    } else {
                        returnValue = (type.toLowerCase() === 'ctr' || type.toLowerCase() === 'action_rate' ||
                            type.toLowerCase() === 'action rate' || type.toLowerCase() === 'vtc') ?
                            parseFloat(val.toFixed(6)) + '%' : constants.currencySymbol + parseFloat(val.toFixed(6));
                    }

                    return returnValue;
                };
            })

            // NOTE: Not used anywhere
            // (as on 19th July 2016)
            .filter('calculatePerc', function () {
                return function (delivered, total) {
                    var width;

                    if (!delivered || !total) {
                        width = 0;
                    } else {
                        width = parseInt(delivered / total) * 124;

                        // @124 is the css width of the progress bar
                        if (width > 124) {
                            width = 124;
                        }
                    }

                    return width;
                };
            })

            // NOTE: Used in
            // 1) campaign_details.html
            // 2) optimization.html
            // (as on 19th July 2016)
            .filter('newlines', function () {
                return function (input) {
                    return input.replace(/(?:\r\n|\r|\n)/g, '<br />');
                };
            })

            // NOTE: Used in
            // 1) campaign_details.html
            // 2) optimization.html
            // (as on 19th July 2016)
            .filter('removeSpecialCharacter', function () {
                return function (input) {
                    return input.replace(/(?:<)/g, '&lt;');
                };
            })

            // NOTE: Used in
            // 1) campaign_details.html
            // 2) optimization.html
            // (as on 19th July 2016)
            .filter('moreLines', function () {
                return function (input) {
                    return input.replace('\\n', '<br />');
                };
            })

            // NOTE: Not used anywhere
            // (as on 19th July 2016)
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

            // NOTE: Used in
            // 1)  campaign_chart.js
            // 2)  campaign_tactics_card.html
            // 3)  campaign_overview.html
            // 4)  campaign_card.html
            // 5)  campaign_cost_card.html
            // 6)  campaign_details.html
            // 7)  campaign_strategy_card.html
            // 8)  cost.html
            // 9)  overview_getAdgroups.html
            // 10) performance.html
            // 11) platform.html
            // 12) viewability.html
            // (as on 19th July 2016)
            .filter('nrFormat', function () {
                return function (value, key) {
                    var returnValue,
                        y = Math.abs(value);

                    if (y <= 0) {
                        returnValue = y;
                    } else {

                        if(key === 0) {
                            key = 0 ;
                        } else {
                            key = key || 2;
                        }

                        if (y < 9999) {
                            returnValue = value.toFixed(key);
                        } else if (y < 1000000) {
                            returnValue = (value / 1000).toFixed(key) + 'K';
                        } else if (y < 10000000) {
                            returnValue = (value / 1000000).toFixed(key) + 'M';
                        } else if (y < 1000000000) {
                            returnValue = (value / 1000000).toFixed(key) + 'M';
                        } else if (y < 1000000000000) {
                            returnValue = (value / 1000000000).toFixed(key) + 'B';
                        } else {
                            returnValue = '1T+';
                        }
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) campaign_tactics_card.html
            // 2) campaign_overview.html
            // 3) campaign_card.html
            // 4) campaign_cost_card.html
            // 5) campaign_details.html
            // 6) campaign_strategy_card.html
            // (as on 19th July 2016)
            .filter('nrFormatWithCurrency', function ($filter) {
                // i18n of currency fails when the currency symbol comes at the end of the value
                return function (value) {
                    var y = Math.abs(value),
                        returnValue;

                    if (y < 9999) {
                        returnValue = $filter('currency')(value.toFixed(2));
                    } else if (y < 1000000) {
                        returnValue = $filter('currency')((value / 1000).toFixed(2)) + 'K';
                    } else if (y < 10000000) {
                        returnValue = $filter('currency')((value / 1000000).toFixed(2)) + 'M';
                    } else if (y < 1000000000) {
                        returnValue = $filter('currency')((value / 1000000).toFixed(2)) + 'M';
                    } else if (y < 1000000000000) {
                        returnValue = $filter('currency')((value / 1000000000).toFixed(2)) + 'B';
                    } else {
                        returnValue = '1T+';
                    }

                    return returnValue;
                };
            })

            // NOTE: Used in
            // 1) collective_report_listing.html
            // (as on 19th July 2016)
            .filter('reportDateFilter', function ($filter, momentService) {
                return function (value) {
                    return momentService.reportDateFormat(value);
                };
            })

            // NOTE: Used in
            // 1) custom_report.html
            // (as on 19th July 2016)
            .filter('formatDate',function ($filter, momentService){
                return function (value,format) {
                    return momentService.formatDate(value,format);
                };
            })

            // NOTE: Used in
            // 1)  campaign_list.html
            // 2)  creative_list.html
            // 3)  campain_header.html (TODO: the typo is in the file name. Correct the typo in the file name.)
            // 4)  add_list_items.html
            // 5)  budget.html
            // 6)  pixels.html
            // 7)  custom_report.html
            // 8)  campaign_ad_create.html
            // 9   campaign_overview.html
            // 10) accounts_add_or_edit_advertiser.html
            // 11) add_list_items.html
            // 12) overview_getAdgroups.html
            // (as on 19th July 2016)
            .filter('textEllipsis', function () {
                return function (input, len) {
                    var displayName = '';

                    input = input || '';

                    if (input) {
                        displayName = input;

                        if (input.length > len) {
                            displayName = input.substring(0, len) + '...';
                        }
                    }

                    return displayName;
                };
            })

            // NOTE: Not used anywhere
            // (as on 19th July 2016)
            .filter('positive', function () {
                return function (input) {
                    if (!input) {
                        return 0;
                    }

                    return Math.abs(input);
                };
            })

            // Used: Canned report
            // performance.html
            .filter('suffixPrefixCannedReport', function (constants) {
                return function (val, type) {
                    var retVal = '-';
                    if(val) {
                        if(type === 'suspicious_impressions_perc' || type === 'viewable_impressions_perc'){
                            retVal = val.toFixed(2) + '%';
                        }else if(type === 'viewable_impressions'){
                            retVal = val.toFixed(0);
                        } else{
                            retVal = constants.currencySymbol + val.toFixed(2);
                        }
                    }
                    return retVal;
                };
            })

            .filter('suffixRBDimensionTotal', function (constants, $filter) {
                return function (val, type) {
                    var ret = '';
                    if(val === undefined || type === undefined){
                        return ret;
                    }
                    if(val === -1 && (type === 'Creative' || type === 'Research')){
                        return 'NA';
                    }
                    switch(type){
                        case 'eCPM':
                        case 'eCPC':
                        case 'eCPA':
                            ret = $filter('number')(val, 2);
                            break;
                        case 'CTR %':
                        case 'PCCR %':
                        case 'pacing_metrics':
                            ret = val.toFixed(2) + '%';
                            break;
                        case 'Measurable %':
                        case 'Viewable %':
                        case 'Suspicious Activity %':
                            ret = val.toFixed(0) + '%';
                            break;
                        default:
                            ret = $filter('number')(val, 0);
                            break;
                    }
                    return ret;
                };
            })

            .filter('startFrom', function() {
                return function(input, start) {
                    if(input) {
                        start = +start; //parse to int
                        return input.slice(start);
                    }
                    return [];
                };
            })

            .filter('actionRateToolTip',function($filter){
                return function (value) {
                   // value = 0.12345;
                    var findForDigit = true,
                        valueWorkedUpon,
                        index = 0,
                        finalValue, beforeDecimalCount,
                        defaultFormat = 3;

                    // Get the count of numbers before decimal point eg: 123.789 then beforeDecimalCount = 123
                    beforeDecimalCount = String(value).split('.')[0].length;

                    // Get the second part of the decimal value eg: 123.789 then valueWorkedUpon = 0.789
                    valueWorkedUpon = Number('0.' + String(value).split('.')[1]);

                    while (findForDigit) {
                        valueWorkedUpon = valueWorkedUpon * 10;
                        index++;

                        if ((valueWorkedUpon >= 1) || (index >= 18)) {
                            findForDigit = false;

                            if (valueWorkedUpon > 0) {

                                //if digit found after 3 decimal place eg 0.000045 then finalValue will be 0.00004
                                if (index > defaultFormat) {
                                    // + 1 is the decimal count
                                    finalValue = String(value).slice(0, beforeDecimalCount + index + 1);

                                } else {
                                  //If digit found befoe or at 3 decimal place eg: 0.0123789 then final value will be 0.012
                                    finalValue = $filter('number')(value, 3);
                                }
                            //Have kept a limit 18 so that we check for a number after decimal till 18th position, after 18th position it breaks the loop
                            } else if (index >= 18) {
                                finalValue = $filter('number')(value, 3);
                            }
                        }
                    }
                    return finalValue+'%';
                };
            });
    }
);
