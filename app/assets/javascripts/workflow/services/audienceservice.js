(function () {
    "use strict";
    angObj.factory("audienceService", function (apiPaths,dataService) {

        var audience;
        var source;
        var keywords;

        return {
            setAudience: function(aud){
                audience = aud;
            },
            getAudience: function(){
              return audience;
            },
            fetchAudience: function(sortCol,sortOrder,pageNum,size,keywords,source,classification){
                var pageNo = 1;
                var pageSize = 50;

                if(pageNum)
                    pageNo = pageNum;
                if(size)
                    pageSize = size;

                var url = apiPaths.WORKFLOW_APIUrl + '/fetchAudience?pageNo='+pageNo+'&pageSize='+pageSize;
                if(sortCol)
                    url += '&sortBy='+sortCol;
                if(sortOrder)
                    url += '&sortOrder='+sortOrder;
                if(keywords)
                    url += '&keywords='+keywords;
                if(source)
                    url += '&source='+keywords;
                if(classification)
                    url += '&classification='+classification;


                //console.log(url);

                return dataService.fetch(url, {cache:false});
            },
            fetchAudienceSource: function(){
                var url =  apiPaths.WORKFLOW_APIUrl +'/clients?type=DATA_PROVIDER';// ask abhi
                return dataService.fetch(url, {cache:false});
            },
            fetchAudienceCategories: function(){
                var url =  apiPaths.WORKFLOW_APIUrl +'/segments/categories';
                return dataService.fetch(url, {cache:false});
            },
            setAudienceSource: function(s){
                source = s;
            },
            getAudienceSource: function(){
                return source;
            },

            fetchAudiencekeywords: function(){
                var url =  apiPaths.WORKFLOW_APIUrl +'/segments/keywords';
                return dataService.fetch(url, {cache:false});
            },
            setAudienceKeywords: function(s){
                keywords = s;
            },
            getAudienceKeywords: function(){
                return keywords;
            }
        }
    });
}());
