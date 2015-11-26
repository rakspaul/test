var angObj = angObj || {};
(function () {
    'use strict';
        angObj.controller('AudienceTargettingController', function ($scope,  audienceService, $timeout, utils, $location, zipCode) {
            $scope.sortColumn = '';
            $scope.sortOrder = '';
            $scope.audienceList = [];
            $scope.sourceList = [];
            $scope.audienceKeywords = [];
            $scope.selectedKeywords = [];
            $scope.selectedCategory = [];
            $scope.selectedSource = [];
            $scope.dropdownCss = {display:'none','max-height': '100px',overflow: 'scroll',top: '60px',
                left: '0px'};
            $scope.keywordText = "";
            $scope.audienceCategories = [];

            $(document).on('click','.dropdown-menu li span', function(event) {
                $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
                $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
                event.stopPropagation();

            });

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
                    //$scope.audienceKeywords = [{id:1,name:"shujan"},{id:2,name:"shujan1"},{id:3,name:"shujan2"}];
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

                    $scope.audienceCategories = [
                        {
                            "category": "Demographic",
                            "subCategories": [
                                {
                                    "id": 1,
                                    "subCategory": "Age"
                                },
                                {
                                    "id": 2,
                                    "subCategory": "Education"
                                },
                                {
                                    "id": 3,
                                    "subCategory": "Financial"
                                }
                            ]
                        },
                        {
                            "category": "Demographic1",
                            "subCategories": [
                                {
                                    "id": 4,
                                    "subCategory": "Age1"
                                },
                                {
                                    "id": 5,
                                    "subCategory": "Education1"
                                },
                                {
                                    "id": 6,
                                    "subCategory": "Financial1"
                                }
                            ]
                        },
                        {
                            "category": "empty category",
                            "subCategories": [
                                {
                                    "id": 7,
                                    "subCategory": null
                                }

                            ]
                        }
                    ];
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
                $scope.dropdownCss.display = 'none';
                $scope.selectedKeywords.push(keyword);
                var index = _.findIndex($scope.audienceKeywords, function(item) {
                    return item.id == keyword.id});
                $scope.audienceKeywords.splice(index,1);
                $('.keyword-txt').val('');

            }

            $scope.removeKeyword = function(keyword){
                $scope.audienceKeywords.push(keyword);
                var index = _.findIndex($scope.selectedKeywords, function(item) {
                    return item.id == keyword.id});
                $scope.selectedKeywords.splice(index,1);
            }
            // end of keyword

            // source selection
            $scope.selectSource = function(sourceObj){
                var index = _.findIndex($scope.selectedSource, function(item) {
                    return item.id == sourceObj.id});

                if(index == -1){
                    $scope.selectedSource.push(sourceObj);
                }
                else{
                    $scope.selectedSource.splice(index,1);
                }
            }
            // end of source

            // category
            $scope.selectCategories = function(categoryObj,type,parentObj){
                //when category is selected
                if(type == 'category'){
                    var index = _.findIndex($scope.audienceCategories, function(item) {
                        return item.category == categoryObj.category});

                    if($scope.audienceCategories[index].isChecked){
                        $scope.audienceCategories[index].isChecked = false;
                    }else{
                        $scope.audienceCategories[index].isChecked = true;
                    }

                    for(var i = 0;i < $scope.audienceCategories[index].subCategories.length;i++){
                        var subCategoryIndex = _.findIndex( $scope.selectedCategory, function(item) {
                            return item.id == $scope.audienceCategories[index].subCategories[i].id});

                        //if the category is not checked
                        if(subCategoryIndex == -1){
                            $scope.selectedCategory.push($scope.audienceCategories[index].subCategories[i]);
                            $scope.audienceCategories[index].subCategories[i].isChecked = true;
                        }
                        else if($scope.audienceCategories[index].isChecked != true){ // if category checkbox is not checked
                            $scope.selectedCategory.splice(subCategoryIndex,1);
                            $scope.audienceCategories[index].subCategories[i].isChecked = false;
                        }
                    }
                }
                else{
                    var subCategoryIndex = _.findIndex( $scope.selectedCategory, function(item) {
                        return item.id == categoryObj.id});


                    //if the category is not checked
                    if(subCategoryIndex == -1){
                        $scope.selectedCategory.push(categoryObj);
                        categoryObj.isChecked = true;
                    }
                    else{
                        $scope.selectedCategory.splice(subCategoryIndex,1);
                        categoryObj.isChecked = false;
                        parentObj.isChecked = false;
                    }

                }
            }

            $scope.showSubCategory = function(event){

                var elem = $(event.target);
                //console.log('minimize -->',elem.parent().next());
                if(elem.hasClass('active')){
                    elem.parent().next('ul').hide();
                }
                else{
                    elem.parent().next('ul').show();
                }
                elem.toggleClass('active');


            }
            // end of category


        });
})();
