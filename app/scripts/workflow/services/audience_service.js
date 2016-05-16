define(['angularAMD','common/services/vistoconfig_service','common/services/data_service','common/services/constants_service','workflow/services/workflow_service','login/login_model'],function (angularAMD) {
    'use strict';
    angularAMD.factory('audienceService', function(vistoconfig, dataService, constants, workflowService,loginModel) {

        var audience;
        var source;
        var keywords;
        var selAudiences;
        var andOrStatus;
        var dayPartData;
        var dayTimeSelectedObj;
        var daytimeArrObj;
        var dayArr;

        return {
            setAudience: function (aud) {
                audience = aud;
            },

            getAudience: function () {
                return audience;
            },

            fetchAudience: function (params) {

                var sortCol = params.sortColumn,
                    sortOrder = params.sortOrder,
                    pageNo = params.pageNumber,
                    pageSize = params.pageSize,
                    keywords = params.selectedKeywords,
                    source = params.selectedSource,
                    classification = params.selectedCategory,
                    seatId = params.seatId,
                    clientId =  loginModel.getSelectedClient().id,
                    url;

                //url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/vendors/' + workflowService.getPlatform().id + '/seats/' + seatId + '/segments?pageNo=' + pageNo + '&pageSize=' + pageSize;
                url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/' + clientId + '/segments?pageNo=' + pageNo + '&pageSize=' + pageSize;

                if (sortCol && sortCol != '') {
                    url += '&sortBy=' + sortCol;
                }

                if (sortOrder && sortOrder != '') {
                    url += '&sortOrder=' + sortOrder;
                }

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

                if (classification && classification.length > 0) {
                    url += '&classifiers=';
                    for (var i = 0; i < classification.length; i++) {
                        for (var j = 0; j < classification[i].subCategories.length; j++) {
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

            fetchAudienceSource: function (seatId) {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/'+loginModel.getSelectedClient().id+'/vendors/'+workflowService.getPlatform().id + '/seats/' + seatId + '/segments/sources';
                return dataService.fetch(url, {cache: false});
            },

            fetchAudienceCategories: function () {
                var url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/segments/categories';
                return dataService.fetch(url, {cache: false});
            },

            setAudienceSource: function (s) {
                source = s;
            },

            getAudienceSource: function () {
                return source;
            },

            fetchAudiencekeywords: function (params) {
                var searchKey = params.searchKey,
                    seatId = params.seatId,
                    url;

                url = vistoconfig.apiPaths.WORKFLOW_API_URL + '/clients/'+loginModel.getSelectedClient().id+'/vendors/'+workflowService.getPlatform().id + '/seats/' + seatId + '/segments/keywords?search='+searchKey;
                return dataService.fetch(url, {cache: false});
            },

            setAudienceKeywords: function (s) {
                keywords = s;
            },

            getAudienceKeywords: function () {
                return keywords;
            },

            setSelectedAudience: function (s) {
                selAudiences = s;
            },

            getSelectedAudience: function () {
                return selAudiences;
            },

            resetAudienceData: function () {
                selAudiences = null;
                andOrStatus = constants.DEFAULTANDORSTATUS;
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
            },

            setDayTimeArr: function(arr){
                dayArr = arr;
            },

            getDayTimeArr: function(){
                return dayArr;
            }
        };
    });
});
