define(['angularAMD'], function (angularAMD) { // jshint ignore:line
    angularAMD.factory('zipCode', function () {
        var _oZipCodeRegex = new RegExp(/^\d{5}(-\d{5})?$/),

            // returns the integer value of a zip code
            _getValueFromCode = function (code) {
                return parseInt(code, 10);
            },

            // returns the zip code of an integer
            _getCodeFromValue = function (value) {
                var _value = value.toString();

                while(_value.length < 5) {
                    _value = '0' + _value;
                }

                return _value;
            },

            // returns the code one greater than the existing code
            _incrementCode = function (code) {
                var intValue = _getValueFromCode(code);

                return _getCodeFromValue(intValue+1);
            },

            // returns the list of zip tokens given the api ranges
            _getValuesFromRanges = function (ranges) {
                var normalized = ranges.map(function (range) {
                    if (range.from_zip === range.to_zip) {
                        return range.from_zip;
                    } else {
                        return range.from_zip + '-' + range.to_zip;
                    }
                });

                if (!ranges) {
                    return [];
                }

                return normalized;
            },

            // returns the greater of two zip codes
            _maxCode = function (code1, code2) {
                if (_getValueFromCode(code1) > _getValueFromCode(code2)) {
                    return code1;
                } else {
                    return code2;
                }
            },

            _zipValidator = function (token) {
                var valid = _oZipCodeRegex.test(token),
                    split;

                if (valid) {
                    split = token.split('-');

                    switch(split.length) {
                        case 1: break;

                        case 2:
                            valid = _getValueFromCode(split[0]) < _getValueFromCode(split[1]);
                            break;

                        default:
                            valid = false;
                    }
                }

                return valid;
            },

            // returns the api ranges given a list of zip tokens, eliminating duplicates
            // and combining overlapping ranges
            _getRangesFromValues = function (values) {
                var sorted = _.chain(values).uniq().sort() // jshint ignore:line
                    .map(function (value) {
                        var split = value.split('-');
                        return {
                            from: split[0],
                            to: split.length > 1 ? split[1] : split[0]
                        };
                    }).value(),

                    ranges = [],
                    temp,
                    i;

                for (i = 0; i < sorted.length; i++) {
                    // give 'from'/'to' values iff 'from' has no values
                    if (!temp) {
                        temp = _.clone(sorted[i]);
                    }

                    if (i === sorted.length - 1) {
                        // you ran out of ranges
                        ranges.push({
                            from_zip: temp.from,
                            to_zip: temp.to
                        });
                    } else if (temp.from <= sorted[i+1].from && sorted[i+1].from <= temp.to) {
                        // the start of the next range is within the existing range
                        temp.to = _maxCode(temp.to, sorted[i+1].to);
                    } else if (sorted[i+1].from === _incrementCode(temp.to)) {
                        // the start of the next range is one more than the existing end value
                        temp.to = sorted[i+1].to;
                    } else {
                        // the start of the next range is beyond the existing end value
                        ranges.push({
                            from_zip: temp.from,
                            to_zip: temp.to
                        });

                        temp = null;
                    }
                }

                return ranges;
            },

            /*
             * Picks up the case where newly added values would cause some of the ranges to become combined
             * when we commit the values. This pre-emptively redefines the content of the list and sets a
             * a message to alert the user.
             */
            _rangeFilter = function (delta, current) {
                // values in the delta that are not already in current
                var uniqueDeltas = _.difference(delta, current), // jshint ignore:line

                    // values in the delta that are already in current
                    duplicate = _.intersection(delta, current), // jshint ignore:line

                    combinedValues,
                    concatValues,
                    itemsAdded,
                    itemsRemoved,
                    newItemSet = null,
                    info = [],
                    error = [];

                if (uniqueDeltas.length > 0) {
                    // the naively concatenated set (old logic for ranges)
                    concatValues = _.compact(uniqueDeltas.concat(current)); // jshint ignore:line

                    // the new ranges, merged together (new logic for ranges)
                    combinedValues = _getValuesFromRanges(_getRangesFromValues(concatValues));

                    // items that no longer exist in combined values
                    itemsRemoved = _.difference(current, combinedValues); // jshint ignore:line

                    // new items that now exist in the combined set
                    itemsAdded = _.difference(combinedValues, current); // jshint ignore:line

                    newItemSet = combinedValues;
                    if (itemsRemoved.length === 0 && itemsAdded.length === 0) {
                        // nothing happened, so just pass back the original set with the dupes
                        duplicate = uniqueDeltas;
                    } else if (combinedValues.length < current.length + uniqueDeltas.length) {
                        info.push('Adjacent zipcodes are grouped automatically.');
                    }
                }

                return {
                    added: itemsAdded || delta,
                    removed: itemsRemoved,
                    duplicate: duplicate,
                    info: info,
                    error : error
                };
            },

            checkZipCodes =  function (zipCodes, codeList) {
                var zipCode = zipCodes.split(/[ ,]+/),
                    inValidCode = [],
                    validCode = [],
                    results;

                codeList = codeList || [];

                _.each(zipCode, function (code) { // jshint ignore:line
                    if (_zipValidator(code)) {
                        validCode.push(code);
                    } else {
                        inValidCode.push(code);
                    }
                });

                results =  _rangeFilter(validCode, codeList);

                if (inValidCode.length > 0) {
                    results.error.push(inValidCode.join(',') + ' zip code/range is not valid.');
                }

                return results;
            };

        return {
            checkZipCodes: checkZipCodes
        };
    });
});