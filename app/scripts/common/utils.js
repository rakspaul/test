define(['angularAMD','common/services/constants_service', 'common/services/role_based_service'],
    function (angularAMD) {
        angularAMD.factory('utils', ['$location', '$sce', 'constants',
            function ($location, $sce, constants) {
                var formatDate = function (input) {
                        var date = new Date(input),
                            dayOfMonth = date.getDate(),
                            suffixes = ['th', 'st', 'nd', 'rd'],
                            relevantDigits = (dayOfMonth < 30) ? dayOfMonth % 20 : dayOfMonth % 30;

                        return relevantDigits <= 3 ? suffixes[relevantDigits] : suffixes[0];
                    },

                    regExp = function () {
                        return {
                            removeSpecialCharacterAndSpaces : /[&\/\\#,+()@!^$~%.'":*?<>{} ]/g
                        };
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

                        return moment(Date.parse(finalDate)).tz('UTC')
                            .format(constants.DATE_UTC_FORMAT);
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

                    getResponseMsg = function(res){
                        return (res.message || res.data.message || res.data.data.message);
                    },

                    validateUrl = function (url) {
                        var re =
                        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

                        return re.test(url);
                    },

                    validateTag = function (scriptTag) {
                        var pattern = new RegExp(/.*(https:).*/),
                            tagLower = scriptTag.toLowerCase().replace(' ', '').replace(/(\r\n|\n|\r)/gm, '');

                        if (tagLower.match(pattern)) {
                            return true;
                        } else {
                            return false;
                        }
                    },

                    highlightSearch = function (text, search) {
                        if (!search) {
                            return $sce.trustAsHtml(text);
                        }

                        return $sce.trustAsHtml(window.unescape(text.replace(new RegExp(window.escape(search), 'gi'),
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

                    // clones any javascript object recursively
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

                    // Note: You can provide limit, offset and key as arguments for initializing.
                    // Please follow the above order for initialization.
                    // Will consider first three parameters only.
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
                                        left: leftPosTactic,
                                        top: childPos.top - parentPos.top - 189,
                                        display: 'block'
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
                        var nAgt = navigator.userAgent,
                            browserName = navigator.appName,
                            fullVersion = '' + parseFloat(navigator.appVersion),
                            majorVersion,
                            nameOffset,
                            verOffset,
                            ix,
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

                            // IE 11 and Above
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
                            browserName:  browserName,
                            fullVersion:  fullVersion,
                            majorVersion: majorVersion
                        };
                    },
                    stripCommaFromNumber = function (num) {
                        return String(num).replace(/,/g, '');
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

                function hasItem(data, key, val) {
                    var retVal = false;

                    _.each(data, function (item) {
                        if(item[key] === val) {
                            retVal = true;
                        }
                    });

                    return retVal;
                }

                function getValueOfItem(data, key) {
                    var retVal = '';

                    _.each(data, function (item) {
                        if (item.key === key.trim()) {
                            retVal = item.value;
                        }
                    });

                    return retVal;
                }

                function getEndAndStartDate(timeFrame) {
                    var o = {},
                        startWeekDate;

                    switch (timeFrame) {
                        case 'yesterday':
                            o.startDate = moment()
                                .subtract(1, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.endDate = moment().format(constants.DATE_UTC_SHORT_FORMAT);
                            o.displayTimeFrame = 'Yesterday';
                            break;

                        case 'last7days':
                            o.startDate = moment()
                                .subtract(7, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.endDate = moment()
                                .subtract(0, 'days')
                                .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.displayTimeFrame = 'Last 7 days';
                            break;

                        case 'last2Weeks':
                            startWeekDate = moment().startOf('week').subtract(1, 'day');
                            o.endDate = startWeekDate.format(constants.DATE_UTC_SHORT_FORMAT);
                            o.startDate = startWeekDate.subtract('days', 13).format(constants.DATE_UTC_SHORT_FORMAT);
                            o.displayTimeFrame = 'Last 2 weeks';
                            break;

                        case 'lastMonth':
                            o.startDate =
                                moment()
                                    .subtract(1, 'months')
                                    .endOf('month')
                                    .format('YYYY-MM') + '-01';

                            o.endDate =
                                moment()
                                    .subtract(1, 'months')
                                    .endOf('month')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.displayTimeFrame = 'Last month';
                            break;

                        case 'lastQuater':
                            o.startDate =
                                moment()
                                    .subtract(1, 'quarter')
                                    .startOf('quarter')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.endDate =
                                moment()
                                    .subtract(1, 'quarter')
                                    .endOf('quarter')
                                    .format(constants.DATE_UTC_SHORT_FORMAT);

                            o.displayTimeFrame = 'Last quarter';
                            break;
                    }

                    return o;
                }

                return {
                    formatDate: formatDate,
                    regExp: regExp,
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
                    getValueOfItem: getValueOfItem,
                    getEndAndStartDate: getEndAndStartDate,
                    validateUrl:validateUrl,
                    validateTag:validateTag,
                    stripCommaFromNumber: stripCommaFromNumber,
                    getResponseMsg: getResponseMsg
                };
            }
        ]);

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
    }
);
