(function () {
    "use strict";
    angObj.factory("audienceService", function (apiPaths,dataService,workflowService, loginModel) {
        var audience;
        var source;
        var keywords;
        var selectedAudiences;
        var andOrStatus;
        var dayPartData;
        var dayTimeSelectedObj;
        var daytimeArrObj;

        return {
            setAudience: function (aud) {
                audience = aud;
            },
            getAudience: function () {
                return audience;
            },
            fetchAudience: function (sortCol, sortOrder, pageNum, size, keywords, source, classification) {
                var clientId =  loginModel.getSelectedClient().id;
                var pageNo = 1;
                var pageSize = 50;
                if (pageNum)
                    pageNo = pageNum;
                if (size)
                    pageSize = size;
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/platform/' + workflowService.getPlatform().id + '/segments?pageNo=' + pageNo + '&pageSize=' + pageSize;
                if (sortCol && sortCol != '')
                    url += '&sortBy=' + sortCol;
                if (sortOrder && sortOrder != '')
                    url += '&sortOrder=' + sortOrder;
                if (keywords && keywords.length > 0) {
                    url += '&keywords=';
                    for (var i = 0; i < keywords.length; i++) {
                        url += keywords[i];
                        if (i + 1 < keywords.length)
                            url += '--';
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
                var url = apiPaths.WORKFLOW_APIUrl + '/costCategories/6/vendors';// ask abhi
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

            fetchAudiencekeywords: function (key) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+loginModel.getSelectedClient().id+'/platform/'+workflowService.getPlatform().id+'/segments/keywords?search='+key;
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
            },
            resetDayPartdata:function(){
                dayPartData = null;
            },
            setDayPartDispObj: function(daytimeArr,dayTimeSelected){
                daytimeArrObj = daytimeArr;
                dayTimeSelectedObj = dayTimeSelected;
            },
            getDaytimeObj: function(){
                return daytimeArrObj;
            },
            getDayTimeSelectedObj: function(){
                return dayTimeSelectedObj;
            }

    }
    });
}());