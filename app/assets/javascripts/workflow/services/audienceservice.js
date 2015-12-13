(function () {
    "use strict";
    angObj.factory("audienceService", function (apiPaths,dataService,workflowService) {

        var audience;
        var source;
        var keywords;
        var selectedAudiences;
        var andOrStatus;
        var dayPartData;

        return {
            setAudience: function (aud) {
                audience = aud;
            },
            getAudience: function () {
                return audience;
            },
            fetchAudience: function (sortCol, sortOrder, pageNum, size, keywords, source, classification) {
                var pageNo = 1;
                var pageSize = 50;
                console.log('key -- >', keywords);
                if (pageNum)
                    pageNo = pageNum;
                if (size)
                    pageSize = size;
                var url = apiPaths.WORKFLOW_APIUrl + '/segments/platform/' + workflowService.getPlatform().id + '?pageNo=' + pageNo + '&pageSize=' + pageSize;
                if (sortCol && sortCol != '')
                    url += '&sortBy=' + sortCol;
                if (sortOrder && sortOrder != '')
                    url += '&sortOrder=' + sortOrder;
                if (keywords && keywords.length > 0) {
                    url += '&keywords=';
                    for (var i = 0; i < keywords.length; i++) {
                        url += keywords[i].id;
                        if (i + 1 < keywords.length)
                            url += ',';
                    }
                }
                if (source && source.length > 0) {
                    url += '&sources=';
                    for (var i = 0; i < source.length; i++) {
                        url += source[i].id;
                        if (i + 1 < source.length)
                            url += ',';
                    }
                }
                if (classification && classification.length > 0)
                //url += '&classification='+classification;
                    url += '&classifiers=';
                for (var i = 0; i < classification.length; i++) {
                    url += classification[i].id;
                    if (i + 1 < classification.length)
                        url += ',';
                }


                //console.log(url);

                return dataService.fetch(url, {cache: false});
            },
            fetchAudienceSource: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients?type=DATA_PROVIDER';// ask abhi
                return dataService.fetch(url, {cache: false});
            },
            fetchAudienceCategories: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/segments/categories';
                return dataService.fetch(url, {cache: false});
            },
            setAudienceSource: function (s) {
                source = s;
            },
            getAudienceSource: function () {
                return source;
            },

            fetchAudiencekeywords: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/segments/keywords';
                return dataService.fetch(url, {cache: false});
            },
            setAudienceKeywords: function (s) {
                keywords = s;
            },
            getAudienceKeywords: function () {
                return keywords;
            },
            setSelectedAudience: function (s) {
                selectedAudiences = s;
            },
            getSelectedAudience: function () {
                return selectedAudiences;
            },
            setAndOr: function (status) {
                andOrStatus = status
            },
            getAndOr: function () {
                return andOrStatus;
            },
            setDayPartData:function(dataObj){
                dayPartData=dataObj;
            },
            getDayPartdata:function(){
                return dayPartData;
            }

    }
    });
}());
