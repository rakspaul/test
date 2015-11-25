var angObj = angObj || {};
(function () {
    'use strict';
    angObj.controller('AudienceTargettingController', function ($scope,  audienceService, $timeout, utils, $location, zipCode) {
        $scope.sortColumn = '';
        $scope.sortOrder = '';
        $scope.audienceList = [];
        $scope.sourceList = [];
        $scope.audienceKeywords = [{id:1,name:"shujan"},{id:2,name:"shujan1"},{id:3,name:"shujan2"}];
        $scope.selectedKeywords = [];
        $scope.dropdownCss = {display:'none','max-height': '100px',overflow: 'scroll',top: '60px',
            left: '0px'};
        $scope.keywordText = "";
        $scope.audienceCategories = []


        $scope.setSortColumn = function(col){
            if(col){
                $scope.sortColumn = col;
            }
            else{
                $scope.sortColumn = 'segment';
            }
        }

        $scope.setSortOrder = function(order){
            if(order){
                $scope.sortOrder = order;
            }
            else{
                $scope.sortOrder = order;
            }
        }

        $scope.fetchAllAudience = function(){
            //api call to fetch segments
            console.log("load data");
            audienceService.fetchAudience().then(function(result){
                if (result.status === "OK" || result.status === "success") {
                    audienceService.setAudience(result.data.data);
                    $scope.audienceList = result.data.data;
                }
            });

        }

        $scope.fetchAllSource = function(){
            //api call to fetch sources
            console.log("fetch source");
            audienceService.fetchAudienceSource().then(function(result){
                if (result.status === "OK" || result.status === "success") {
                    audienceService.setAudienceSource(result.data.data);
                    $scope.sourceList = result.data.data;
                }

            })

        }

        $scope.fetchAllKeywords = function(){
            //api call to fetch keywords
            console.log("fetch keywords");
            audienceService.fetchAudiencekeywords().then(function(result){
                if (result.status === "OK" || result.status === "success") {
                    audienceService.setAudienceKeywords(result.data.data);
                    $scope.audienceKeywords = result.data.data;
                }
            },function(err){

            })

        }

        $scope.fetchAllCategories = function(){
            //api call to fetch categories
            console.log("fetch categories");
            audienceService.fetchAudienceCategories().then(function(result){
                if (result.status === "OK" || result.status === "success") {
                    audienceService.setAudienceKeywords(result.data.data);
                    $scope.audienceCategories = result.data.data;
                }
            },function(err){

            })

        }

        $scope.initAudienceTargetting = function(){
            $scope.setSortColumn();
            $scope.setSortOrder();
            $scope.fetchAllAudience();
            $scope.fetchAllSource();
            $scope.fetchAllKeywords();
            $scope.fetchAllCategories();
        }

        $scope.initAudienceTargetting();

        //keyword user choice
        $scope.showKeywords = function(keyword){
            if(keyword.length > 0)
                $scope.dropdownCss.display = 'block';
            else
                $scope.dropdownCss.display = 'none';

        }

        $scope.selectKeyword = function(keyword){
            //console.log(event);
            $scope.dropdownCss.display = 'none';
            $scope.selectedKeywords.push(keyword);
            var index = _.findIndex($scope.audienceKeywords, function(item) {
                return item.id == keyword.id});
            $scope.audienceKeywords.splice(index,1);
            $scope.keywordText = "";

        }

        $scope.removeKeyword = function(keyword){
            $scope.audienceKeywords.push(keyword);
            var index = _.findIndex($scope.selectedKeywords, function(item) {
                return item.id == keyword.id});
            $scope.selectedKeywords.splice(index,1);
        }
        // end of keyword
        // source selection
        // end of source

        // category

        // end of category


    });
})();
