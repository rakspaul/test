var angObj = angObj || {};
(function () {
    'use strict';
        angObj.controller('AudienceTargettingController', function ($scope,  audienceService, $rootScope, $location, zipCode) {
            $scope.sortColumn = '';
            $scope.sortOrder = '';
            $scope.audienceList = [];
            $scope.sourceList = [];
            $scope.audienceKeywords = [];
            $scope.selectedKeywords = [];
            $scope.selectedCategory = [];
            $scope.selectedSource = [];
            $scope.selectedAudience = []

            $scope.dropdownCss = {display:'none','max-height': '100px',overflow: 'scroll',top: '60px',
                left: '0px'};
            $scope.keywordText = "";
            $scope.audienceCategories = [];
            $scope.selectAllChecked = false;
            $scope.pageNumber = 1;
            $scope.pageSize = 50;
            $scope.andOr = 'Or';
            $scope.audienceFetching = false;
            $scope.categoryText = 'All';
            $scope.sourceText = 'All';

            $(document).on('click','.dropdown-menu', function(event) {
                //$(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="icon-arrow-down"></span>');
                //$(this).parents(".dropdown").find('.btn').val($(this).data('value'));
                event.stopPropagation();

            });
            //$(document).on('click','.audience-tabs',function(){
            //    $('.audience-tabs').toggleClass('active');
            //})

            $rootScope.$on('triggerAudienceLoading',function(){
                $scope.fetchAllAudience();
            })

            $scope.setSortColumn = function(col){
                if(col){
                    $scope.sortColumn = col;
                }
                else{
                    $scope.sortColumn = 'name';
                }
            }

            $scope.setSortOrder = function(order){
                if(order){
                    $scope.sortOrder = order;
                }
                else{
                    $scope.sortOrder = 'asc';
                }
            }

            $scope.fetchAllAudience = function(loadMoreFlag){
                if(!loadMoreFlag){
                    $scope.pageNumber = 1;
                }
                //api call to fetch segments
                audienceService.fetchAudience($scope.sortColumn,$scope.sortOrder,$scope.pageNumber,$scope.pageSize,$scope.selectedKeywords,$scope.selectedSource,$scope.selectedCategory).then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        audienceService.setAudience(result.data.data);

                        if(loadMoreFlag){
                            var tempAudience = $scope.audienceList;
                            $scope.audienceList.concat(result.data.data); // lazy loading fetch
                        }
                        else{
                            $scope.audienceList = result.data.data; // first time fetch/filter fetch
                        //
                        }

                    }

                });

            }

            $scope.fetchAllSource = function(){
                //api call to fetch sources
                audienceService.fetchAudienceSource().then(function(result){
                    if (result.status === "OK" || result.status === "success") {
                        audienceService.setAudienceSource(result.data.data);
                        $scope.sourceList = result.data.data;
                    }
                    //$scope.sourceList = [{"id":36,"name":"Collective","billableAccountId":1,"clientType":"DATA_PROVIDER","isArchived":false,"country":{"id":171998,"name":"United States","code":"US","geoType":"COUNTRY","parentId":1,"countryCode":"US","createdAt":"2015-08-19 00:32:55.994","updatedAt":"2015-08-19 00:32:55.994"},"timezone":"EST","currency":{"id":1,"name":"US DOLLAR","currencyCode":"USD","currencySymbol":"$"},"createdBy":2,"updatedBy":2,"createdAt":"2015-11-24 08:24:13.935","updatedAt":"2015-11-24 08:24:13.935"},
                    //    {"id":360,"name":"Collective","billableAccountId":1,"clientType":"DATA_PROVIDER","isArchived":false,"country":{"id":171998,"name":"United States","code":"US","geoType":"COUNTRY","parentId":1,"countryCode":"US","createdAt":"2015-08-19 00:32:55.994","updatedAt":"2015-08-19 00:32:55.994"},"timezone":"EST","currency":{"id":1,"name":"US DOLLAR","currencyCode":"USD","currencySymbol":"$"},"createdBy":2,"updatedBy":2,"createdAt":"2015-11-24 08:24:13.935","updatedAt":"2015-11-24 08:24:13.935"}]
                })

            }

            $scope.fetchAllKeywords = function(){
                //api call to fetch keywords
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
                //$scope.fetchAllAudience();
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
                $scope.fetchAllAudience();

            }

            $scope.removeKeyword = function(keyword){
                $scope.audienceKeywords.push(keyword);
                var index = _.findIndex($scope.selectedKeywords, function(item) {
                    return item.id == keyword.id});
                $scope.selectedKeywords.splice(index,1);
                $scope.fetchAllAudience();
            }
            // end of keyword

            // source selection
            $scope.selectSource = function(sourceObj){
                var index = _.findIndex($scope.selectedSource, function(item) {
                    return item.id == sourceObj.id});

                if(index == -1){
                    $scope.selectedSource.push(sourceObj);
                    sourceObj.isChecked = true;
                }
                else{
                    $scope.selectedSource.splice(index,1);
                    sourceObj.isChecked = false;
                }
                $scope.updateSourceText();
            }

            $scope.clearAllSelectedSource = function(){
                for(var i = 0; i < $scope.selectedSource.length; i++){
                    $scope.selectedSource[i].isChecked = false;
                }
                $scope.selectedSource = [];
                $scope.fetchAllAudience();
                $scope.updateSourceText();
            }

            $scope.updateSourceText = function(){
                console.log('selected source',$scope.selectedSource);
                if($scope.selectedSource.length == 0){
                    $scope.sourceText = 'All';
                }
                else if($scope.selectedSource.length == 1){
                    $scope.sourceText = $scope.selectedSource[0].name;

                }
                else{
                    $scope.sourceText = $scope.selectedSource.length+' Selected'
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
                // selected text change
                $scope.updateCategoryText();

            }

            $scope.updateCategoryText = function(){
                console.log('selected categoru',$scope.selectedCategory.length);
                if($scope.selectedCategory.length == 0){
                    $scope.categoryText = 'All';
                }
                else if($scope.selectedCategory.length == 1){
                    $scope.categoryText = $scope.selectedCategory[0].subCategory;

                }
                else{
                    $scope.categoryText = $scope.selectedCategory.length+' Selected'
                }
            }

            $scope.showSubCategory = function(event){

                var elem = $(event.target);
                if(elem.hasClass('active')){
                    elem.parent().next('ul').hide();
                }
                else{
                    elem.parent().next('ul').show();
                }
                elem.toggleClass('active');


            }

            $scope.clearAllSelectedCategory = function(){
                for(var i = 0; i < $scope.audienceCategories.length;i++){
                    $scope.audienceCategories[i].isChecked = false;
                    for(var j = 0; j < $scope.audienceCategories[i].subCategories.length;j++){
                        $scope.audienceCategories[i].subCategories[j].isChecked = false;
                    }
                }
                $scope.selectedCategory = [];
                $scope.fetchAllAudience();
                $scope.updateCategoryText();
            }
            // end of category

            //audience
            $scope.selectAudience = function(audience){
                var audienceIndex = _.findIndex( $scope.selectedAudience, function(item) {
                    return item.id == audience.id});

                if(audienceIndex == -1){
                    $scope.selectedAudience.push(audience);
                    audience.isChecked = true;
                    audience.isIncluded = true;
                }
                else{
                    $scope.selectedAudience.splice(audienceIndex,1);
                    audience.isChecked = false;
                    delete  audience.isIncluded;

                }
            }

            $scope.selectAllAudience = function(){
                $scope.selectedAudience = [];  //empty the selected audience array before populating/empting it with all the audience
                if($scope.selectAllChecked == false){ // select all
                    $scope.selectAllChecked = true;


                    for(var i = 0; i < $scope.audienceList.length; i++){
                        $scope.selectedAudience.push($scope.audienceList[i]);
                        $scope.audienceList[i].isChecked = true;
                        $scope.audienceList[i].isIncluded  = true;

                    }
                }
                else{ // deselect all
                    resetAudience()
                }
            }



            $scope.clearAllSelectedAudience = function(){
                resetAudience();
                $scope.selectedAudience = [];
            }

            function resetAudience(){
                $scope.selectAllChecked = false;
                for(var i = 0; i < $scope.audienceList.length; i++){
                    $scope.audienceList[i].isChecked = false;
                    delete  $scope.audienceList[i].isIncluded;
                }
            }
            // end of audience

            //building audience
            $scope.changeOrAndStatus = function(status){
                $scope.andOr = status;
            }

            $scope.changeIncludeStatus = function(audienceObj,status){
                audienceObj.isIncluded = status;
            }

            // final save from audience segment
            $scope.saveCampaignWithAudience = function(){
                audienceService.setSelectedAudience($scope.selectedAudience);
                audienceService.setAndOr($scope.andOr)
                $scope.CampaignADsave(false);
            }
                // end of final save

            $scope.loadMoreAudience = function(){
                if($scope.audienceList) {
                    $scope.audienceFetching = true;
                    $scope.pageNumber += 1
                    $scope.fetchAllAudience(true);
                }
            }

            $scope.buildAudience = function(){
                $('.audience-tabs-segment').removeClass('active');
                $('.audience-tabs-audience').addClass('active');
            }
        });
})();
