(function() {
    commonModule.factory("zipCode", function () {
        var _oZipCodeRegex = new RegExp(/^\d{5}(-\d{5})?$/);

        // returns the integer value of a zip code
        var _getValueFromCode = function(code) {
            return parseInt(code, 10);
        };

        // returns the zip code of an integer
        var _getCodeFromValue = function(value) {
            var _value = value.toString();
            while(_value.length < 5) {
                _value = '0' + _value;
            }
            return _value;
        };

        // returns the code one greater than the existing code
        var _incrementCode = function(code) {
            var intValue = _getValueFromCode(code);
            return _getCodeFromValue(intValue+1);
        };

        // returns the list of zip tokens given the api ranges
        var _getValuesFromRanges = function(ranges) {
            if(!ranges) {
                return [];
            }
            var normalized = ranges.map(function(range) {
                if(range.from_zip === range.to_zip) {
                    return range.from_zip;
                } else {
                    return range.from_zip + '-' + range.to_zip;
                }
            });
            return normalized;
        };

        // returns the greater of two zip codes
        var _maxCode = function(code1, code2) {
            if(_getValueFromCode(code1) > _getValueFromCode(code2)) {
                return code1;
            } else {
                return code2;
            }
        };

        var _zipValidator = function(token) {
            var valid = _oZipCodeRegex.test(token);
            var split;

            if(valid) {
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
        };

        // returns the api ranges given a list of zip tokens, eliminating duplicates
        // and combining overlapping ranges
        var _getRangesFromValues = function(values) {
            var sorted = _.chain(values).uniq().sort()
                .map(function(value) {
                    var split = value.split('-');
                    return {
                        from: split[0],
                        to: split.length > 1 ? split[1] : split[0]
                    };
                }).value();
            var ranges = [];
            var temp;

            for(var i = 0; i < sorted.length; i++) {
                // give 'from'/'to' values iff 'from' has no values
                if(!temp) {
                    temp = _.clone(sorted[i]);
                }

                if(i === sorted.length - 1) {
                    // you ran out of ranges
                    ranges.push({
                        from_zip: temp.from,
                        to_zip: temp.to
                    });
                } else if(temp.from <= sorted[i+1].from && sorted[i+1].from <= temp.to) {
                    // the start of the next range is within the existing range
                    temp.to = _maxCode(temp.to, sorted[i+1].to);
                } else if(sorted[i+1].from === _incrementCode(temp.to)) {
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
        };

        /*
         * Picks up the case where newly added values would cause some of the ranges to become combined
         * when we commit the values. This pre-emptively redefines the content of the list and sets a
         * a message to alert the user.
         */
        var _rangeFilter = function(delta, current) {
            // values in the delta that are not already in current
            var uniqueDeltas = _.difference(delta, current);
            // values in the delta that are already in current
            var duplicate = _.intersection(delta, current);
            var combinedValues;
            var concatValues;
            var itemsAdded;
            var itemsRemoved;

            var newItemSet = null;
            var info = [];
            var error = [];

            if(uniqueDeltas.length > 0) {
                // the naively concatenated set (old logic for ranges)
                concatValues = _.compact(uniqueDeltas.concat(current));
                // the new ranges, merged together (new logic for ranges)
                combinedValues = _getValuesFromRanges(_getRangesFromValues(concatValues));
                // items that no longer exist in combined values
                itemsRemoved = _.difference(current, combinedValues);
                // new items that now exist in the combined set
                itemsAdded = _.difference(combinedValues, current);

                newItemSet = combinedValues;
                if(itemsRemoved.length === 0 && itemsAdded.length === 0) {
                    // nothing happened, so just pass back the original set with the dupes
                    duplicate = uniqueDeltas;
                } else if(combinedValues.length < current.length + uniqueDeltas.length) {
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
        };

        var checkZipCodes =  function(zipCodes, codeList) {
            codeList = codeList || [];
            var zipCode = zipCodes.split(/[ ,]+/);
            var inValidCode = [];
            var validCode = [];
            _.each(zipCode, function(code) {
                if(_zipValidator(code)) {
                    validCode.push(code);
                } else {
                    inValidCode.push(code);
                }
            })
            var results =  _rangeFilter(validCode, codeList);
            if(inValidCode.length >0) {
                results.error.push(inValidCode.join(",") + ' zip code/range is not valid.');
            }

            return results;
        }

        return {
            checkZipCodes : checkZipCodes
        }

    });
})();