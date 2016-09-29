define(['angularAMD'],
    function (angularAMD) {
        'use strict';

        angularAMD.factory('audienceService', ['vistoconfig', 'dataService', 'constants', 'workflowService',
            'loginModel', function (vistoconfig, dataService, constants, workflowService,
                                                        loginModel) {
            var audience,
                source,
                keywords,
                selAudiences,
                andOrStatus,
                dayPartData,
                dayTimeSelectedObj,
                daytimeArrObj,
                dayArr,

                setAudience = function (aud) {
                    audience = aud;
                },

                getAudience = function () {
                    return audience;
                },

                fetchAudience = function (params) {
                    var sortCol = params.sortColumn,
                        sortOrder = params.sortOrder,
                        pageNo = params.pageNumber,
                        pageSize = params.pageSize,
                        keywords = params.selectedKeywords,
                        source = params.selectedSource,
                        classification = params.selectedCategory,
                        clientId =  vistoconfig.getSelectedAccountId(),
                        advertiserId=params.advertiserId,
                        platformId=params.platformId,
                        seatId=params.seatId,
                        url,
                        i,
                        j;

                    url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + clientId +
                        '/advertisers/'+advertiserId+
                        '/vendors/'+platformId+
                        '/seats/'+seatId+
                        '/segments?pageNo=' + pageNo +
                        '&pageSize=' + pageSize;

                    if (sortCol && sortCol !== '') {
                        url += '&sortBy=' + sortCol;
                    }

                    if (sortOrder && sortOrder !== '') {
                        url += '&sortOrder=' + sortOrder;
                    }

                    if (keywords && keywords.length > 0) {
                        url += '&query=';

                        for (i = 0; i < keywords.length; i++) {
                            if(/^[a-zA-Z0-9- ]*$/.test(keywords[i]) === false) {
                                url += encodeURIComponent(keywords[i]);
                            } else {
                                url += keywords[i];
                            }

                            if (i + 1 < keywords.length) {
                                url += '--';
                            }
                        }
                    }

                    if (source && source.length > 0) {
                        url += '&sources=';

                        for (i = 0; i < source.length; i++) {
                            url += source[i].id;

                            if (i + 1 < source.length) {
                                url += ',';
                            }
                        }
                    }

                    if (classification && classification.length > 0) {
                        url += '&classifiers=';

                        for (i = 0; i < classification.length; i++) {
                            for (j = 0; j < classification[i].subCategories.length; j++) {
                                url += classification[i].subCategories[j].id;
                                if (j + 1 < classification[i].subCategories.length) {
                                    url += ',';
                                }
                            }

                            if (i + 1 < classification.length) {
                                url += ',';
                            }
                        }
                    }

                    return dataService.fetch(url, {cache: false});
                },

                fetchAudienceSource = function (seatId) {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL +
                        '/clients/' + loginModel.getSelectedClient().id +
                        '/vendors/' + workflowService.getPlatform().id +
                        '/seats/' + seatId +
                        '/segments/sources';

                    return dataService.fetch(url, {cache: false});
                },

                fetchAudienceCategories = function () {
                    var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/segments/categories';

                    return dataService.fetch(url, {cache: false});
                },

                setAudienceSource = function (s) {
                    source = s;
                },

                getAudienceSource = function () {
                    return source;
                },

                setAudienceKeywords = function (s) {
                    keywords = s;
                },

                getAudienceKeywords = function () {
                    return keywords;
                },

                setSelectedAudience = function (s) {
                    selAudiences = s;
                },

                getSelectedAudience = function () {
                    return selAudiences;
                },

                resetAudienceData = function () {
                    selAudiences = null;
                    andOrStatus = constants.DEFAULTANDORSTATUS;
                },

                setAndOr = function (status) {
                    andOrStatus = status;
                },

                getAndOr = function () {
                    return andOrStatus;
                },

                setDayPartData = function (dataObj) {
                    dayPartData=dataObj;
                },

                getDayPartdata = function () {
                    return dayPartData;
                },

                resetDayPartdata = function () {
                    dayPartData = null;
                },

                setDayPartDispObj = function (daytimeArr, dayTimeSelected) {
                    daytimeArrObj = daytimeArr;
                    dayTimeSelectedObj = dayTimeSelected;
                },

                getDaytimeObj = function () {
                    return daytimeArrObj;
                },

                getDayTimeSelectedObj = function () {
                    return dayTimeSelectedObj;
                },

                setDayTimeArr = function (arr) {
                    dayArr = arr;
                },

                getDayTimeArr = function () {
                    return dayArr;
                };

            return {
                setAudience : setAudience,
                getAudience : getAudience,
                fetchAudience : fetchAudience,
                fetchAudienceSource : fetchAudienceSource,
                fetchAudienceCategories : fetchAudienceCategories,
                setAudienceSource : setAudienceSource,
                getAudienceSource : getAudienceSource,
                setAudienceKeywords : setAudienceKeywords,
                getAudienceKeywords : getAudienceKeywords,
                setSelectedAudience : setSelectedAudience,
                getSelectedAudience : getSelectedAudience,
                resetAudienceData : resetAudienceData,
                setAndOr : setAndOr,
                getAndOr : getAndOr,
                setDayPartData : setDayPartData,
                getDayPartdata : getDayPartdata,
                resetDayPartdata : resetDayPartdata,
                setDayPartDispObj : setDayPartDispObj,
                getDaytimeObj : getDaytimeObj,
                getDayTimeSelectedObj : getDayTimeSelectedObj,
                setDayTimeArr : setDayTimeArr,
                getDayTimeArr : getDayTimeArr
            };
        }]);
    }
);
