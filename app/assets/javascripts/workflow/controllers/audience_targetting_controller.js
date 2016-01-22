var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('AudienceTargettingController', function ($scope,  audienceService, $rootScope, workflowService) {
        function processAudienceEdit() {
            var fetchedObj =  angular.copy(workflowService.getAdsDetails()),
                previouslySelectedAudience = fetchedObj.targets.segmentTargets.segmentList,
                selectedIndex,
                index,
                i;

            // TODO: partially done
            if (previouslySelectedAudience && previouslySelectedAudience.length > 0) {
                for (i = 0; i < previouslySelectedAudience.length; i++) {
                    //find  array index in audienc list
                    index = _.findIndex($scope.audienceList, function (item) {
                        return item.id === previouslySelectedAudience[i].segment.id;
                    });

                    // can't call $scope.selectAudience($scope.audienceList[index]) because this will 
                    // toggle selection when filter is clicked
                    if (index !== -1) {
                        selectedIndex = _.findIndex($scope.selectedAudience, function (item) {
                            return item.id === $scope.audienceList[index].id;
                        });
                        if (selectedIndex === -1) {
                            $scope.selectedAudience.push($scope.audienceList[index]);
                        }
                        $scope.audienceList[index].isChecked = true;
                        // TODO: need to change
                        $scope.audienceList[index].isIncluded = previouslySelectedAudience[i].isIncluded;
                    }
                }
                // and or details after getting it from api
                $scope.andOr = fetchedObj.targets.segmentTargets.operation;
                audienceService.setAndOr($scope.andOr);
                audienceService.setSelectedAudience(angular.copy($scope.selectedAudience));
                // reset selected array in service after initial load to avoid populating same data when platform is changed
                fetchedObj.targets.segmentTargets = [];
                workflowService.getAdsDetails(fetchedObj);
                // update target summary
                $scope.getSelectedAudience();
                $scope.setTargeting('Audience');
            }
        }

        function checkSelectedAudience() {
            var index,
                i;

            for (i = 0; i < $scope.selectedAudience.length; i++) {
                //find  array index in audienc list
                index = _.findIndex($scope.audienceList, function (item) {
                    return item.id === $scope.selectedAudience[i].id;
                });

                if (index !== -1) {
                    $scope.audienceList[index].isChecked = true;
                }

            }
        }

        function resetAudience() {
            var i;

            $scope.selectAllChecked = false;
            for (i = 0; i < $scope.audienceList.length; i++) {
                $scope.audienceList[i].isChecked = false;
                delete  $scope.audienceList[i].isIncluded;
            }
        }

        $scope.sortColumn = '';
        $scope.sortOrder = '';
        $scope.audienceList = [];
        $scope.sourceList = [];
        $scope.audienceKeywords = [];
        $scope.selectedKeywords = [];
        $scope.selectedCategory = [];
        $scope.selectedSource = [];
        $scope.selectedAudience = [];
        $scope.keywordText = '';
        $scope.audienceCategories = [];
        $scope.selectAllChecked = false;
        $scope.pageNumber = 1;
        $scope.pageSize = 50;
        $scope.andOr = 'Or';
        $scope.audienceFetching = false;
        $scope.categoryText = 'All';
        $scope.sourceText = 'All';
        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0'
        };

        $(document).on('click', '.dropdown-menu', function (event) {
            event.stopPropagation();
        });

        $rootScope.$on('triggerAudienceLoading', function () {
            $scope.resetSelectedFields();
            $scope.initAudienceTargetting();
            $scope.fetchAllAudience();
        });

        $scope.resetSelectedFields = function () {
            $scope.selectedKeywords = [];
            $scope.selectedCategory = [];
            $scope.selectedSource = [];
            $scope.selectedAudience = [];
        };

        $scope.setSortColumn = function (col) {
            if (col) {
                $scope.sortColumn = col;
            } else {
                $scope.sortColumn = 'name';
            }
        };

        $scope.setSortOrder = function (order) {
            if (order) {
                $scope.sortOrder = order;
            } else {
                $scope.sortOrder = 'asc';
            }
        };

        $scope.fetchAllAudience = function (loadMoreFlag) {
            if (!loadMoreFlag) {
                $scope.pageNumber = 1;
            }

            //api call to fetch segments
            audienceService
                .fetchAudience(
                    $scope.sortColumn, 
                    $scope.sortOrder, 
                    $scope.pageNumber, 
                    $scope.pageSize,
                    $scope.selectedKeywords,
                    $scope.selectedSource,
                    $scope.selectedCategory
                )
                .then(function (result) {
                    var tempAudience;

                    if (result.status === 'OK' || result.status === 'success') {
                        audienceService.setAudience(result.data.data);
                        if (loadMoreFlag) {
                            tempAudience = $scope.audienceList;
                            _.each(result.data.data , function (obj) {
                                $scope.audienceList.push(obj);
                            });
                        } else {
                            // first time fetch/filter fetch
                            $scope.audienceList = result.data.data; 
                        }

                        //edit mode
                        if ($scope.mode === 'edit') {
                            processAudienceEdit();
                        }

                        //check if selected audience exists and length > 0 call select Audience
                        if ($scope.selectedAudience && $scope.selectedAudience.length > 0) {
                            checkSelectedAudience();
                        }
                    }
                });
        };

        $scope.fetchAllSource = function () {
            //api call to fetch sources
            audienceService
                .fetchAudienceSource()
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        audienceService.setAudienceSource(result.data.data);
                        $scope.sourceList = result.data.data;
                    }
                });
        };

        $scope.fetchAllKeywords = function (key) {
            //api call to fetch keywords
            audienceService
                .fetchAudiencekeywords(key)
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        audienceService.setAudienceKeywords(result.data.data);
                        $scope.audienceKeywords = result.data.data;
                    }
                }, function (err) {
                    // TODO: 
                });
        };

        $scope.fetchAllCategories = function () {
            //api call to fetch categories
            audienceService
                .fetchAudienceCategories()
                .then(function (result) {
                    if (result.status === 'OK' || result.status === 'success') {
                        audienceService.setAudienceKeywords(result.data.data);
                        $scope.audienceCategories = result.data.data;
                    }
                }, function (err) {
                    // TODO: 
                });
        };

        $scope.initAudienceTargetting = function () {
            $scope.setSortColumn();
            $scope.setSortOrder();
            $scope.fetchAllSource();
            $scope.fetchAllCategories();
        };

        //keyword user choice
        $scope.showKeywords = function (keyword, event) {
            if (keyword.length > 0) {
                $scope.dropdownCss.display = 'block';
            } else {
                $scope.dropdownCss.display = 'none';
            }
            if (event.which === 13) {
                // fetch audience
                $scope.selectKeyword(keyword);
                return false;
            } else {
                // search the audience keyword an show list as and when the user types in.
                // fetch keywords
                $scope.fetchAllKeywords(keyword);
            }
        };

        $scope.selectKeyword = function (keyword) {
            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });

            $scope.dropdownCss.display = 'none';
            if (index === -1) {
                $scope.selectedKeywords.push(keyword);
            }
            $scope.audienceKeywords = [];
            $('.keyword-txt').val('');
            $scope.fetchAllAudience();
        };

        $scope.removeKeyword = function (keyword) {
            //$scope.audienceKeywords.push(keyword);
            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });
            $scope.selectedKeywords.splice(index, 1);
            $scope.fetchAllAudience();
        };
        // end of keyword

        // source selection
        $scope.selectSource = function (sourceObj) {
            var index = _.findIndex($scope.selectedSource, function (item) {
                return item.id === sourceObj.id;
            });

            if (index === -1) {
                $scope.selectedSource.push(sourceObj);
                sourceObj.isChecked = true;
            } else {
                $scope.selectedSource.splice(index, 1);
                sourceObj.isChecked = false;
            }
            $scope.updateSourceText();
        };

        $scope.clearAllSelectedSource = function () {
            var i;

            for (i = 0; i < $scope.selectedSource.length; i++) {
                $scope.selectedSource[i].isChecked = false;
            }
            $scope.selectedSource = [];
            $scope.fetchAllAudience();
            $scope.updateSourceText();
        };

        $scope.updateSourceText = function () {
            if ($scope.selectedSource.length === 0) {
                $scope.sourceText = 'All';
            } else if ($scope.selectedSource.length === 1) {
                $scope.sourceText = $scope.selectedSource[0].name;
            } else {
                $scope.sourceText = $scope.selectedSource.length+' Selected';
            }
        }
        // end of source

        // category
        $scope.selectCategories = function (categoryObj,type,parentObj) {
            var index,
                subCategoryIndex,
                i;

            //when category is selected
            if (type === 'category') {
                index = _.findIndex($scope.audienceCategories, function (item) {
                    return item.category === categoryObj.category;
                });
                if ($scope.audienceCategories[index].isChecked) {
                    $scope.audienceCategories[index].isChecked = false;
                } else {
                    $scope.audienceCategories[index].isChecked = true;
                }
                for (i = 0; i < $scope.audienceCategories[index].subCategories.length; i++) {
                    subCategoryIndex = _.findIndex($scope.selectedCategory, function (item) {
                        return item.id === $scope.audienceCategories[index].subCategories[i].id;
                    });
                    //if the category is not checked
                    if (subCategoryIndex === -1) {
                        $scope.selectedCategory.push($scope.audienceCategories[index].subCategories[i]);
                        $scope.audienceCategories[index].subCategories[i].isChecked = true;
                    } else if ($scope.audienceCategories[index].isChecked !== true) { 
                        // if category checkbox is not checked
                        $scope.selectedCategory.splice(subCategoryIndex,1);
                        $scope.audienceCategories[index].subCategories[i].isChecked = false;
                    }
                }
            } else {
                subCategoryIndex = _.findIndex($scope.selectedCategory, function (item) {
                    return item.id === categoryObj.id;
                });
                //if the category is not checked
                if (subCategoryIndex === -1) {
                    $scope.selectedCategory.push(categoryObj);
                    categoryObj.isChecked = true;
                } else {
                    $scope.selectedCategory.splice(subCategoryIndex, 1);
                    categoryObj.isChecked = false;
                    parentObj.isChecked = false;
                }
            }
            // selected text change
            $scope.updateCategoryText();
        };

        $scope.updateCategoryText = function () {
            if ($scope.selectedCategory.length === 0) {
                $scope.categoryText = 'All';
            } else if ($scope.selectedCategory.length === 1) {
                $scope.categoryText = $scope.selectedCategory[0].subCategory;

            } else {
                $scope.categoryText = $scope.selectedCategory.length + ' Selected';
            }
        };

        $scope.showSubCategory = function (event) {
            var elem = $(event.target);

            if (elem.hasClass('active')) {
                elem.parent().next('ul').hide();
            } else {
                elem.parent().next('ul').show();
            }
            elem.toggleClass('active');
        };

        $scope.clearAllSelectedCategory = function () {
            var i,
                j;

            for (i = 0; i < $scope.audienceCategories.length; i++) {
                $scope.audienceCategories[i].isChecked = false;
                for (j = 0; j < $scope.audienceCategories[i].subCategories.length; j++) {
                    $scope.audienceCategories[i].subCategories[j].isChecked = false;
                }
            }
            $scope.selectedCategory = [];
            $scope.fetchAllAudience();
            $scope.updateCategoryText();
        };
        // end of category

        //audience
        $scope.selectAudience = function (audience) {
            var audienceIndex = _.findIndex($scope.selectedAudience, function (item) {
                return item.id === audience.id;
            });

            if (audienceIndex === -1) {
                $scope.selectedAudience.push(audience);
                audience.isChecked = true;
                audience.isIncluded = true;
            } else {
                $scope.selectedAudience.splice(audienceIndex,1);
                audience.isChecked = false;
                delete  audience.isIncluded;
            }
        };

        $scope.selectAllAudience = function () {
            var i;

            //empty the selected audience array before populating/empting it with all the audience
            $scope.selectedAudience = [];  
            if ($scope.selectAllChecked === false) { 
                // select all
                $scope.selectAllChecked = true;
                for (i = 0; i < $scope.audienceList.length; i++) {
                    $scope.selectedAudience.push($scope.audienceList[i]);
                    $scope.audienceList[i].isChecked = true;
                    $scope.audienceList[i].isIncluded  = true;
                }
            } else { 
                // deselect all
                resetAudience()
            }
        };

        $scope.clearAllSelectedAudience = function () {
            resetAudience();
            $scope.selectedAudience = [];
            //this is to save selected audience in service to show in summary
            audienceService.setSelectedAudience(angular.copy($scope.selectedAudience));
            $scope.getSelectedAudience();
        };
        // end of audience

        //building audience
        $scope.changeOrAndStatus = function (status) {
            var str = '<span class="text">' + $scope.andOr + '</span><span class="icon-arrow-down"></span>';

            $scope.andOr = status;
            //remove all elements inside and-or-txt and append the created structure -- needs permanent fix
            $('.and-or-txt').html('');
            $('.and-or-txt').append(str);
            $('.dropdown.open').removeClass('open');
        };

        $scope.changeIncludeStatus = function (audienceObj, status) {
            audienceObj.isIncluded = status;
            $('.dropdown.open').removeClass('open');
        };

        // final save from audience segment
        $scope.saveCampaignWithAudience = function () {
            audienceService.setSelectedAudience(angular.copy($scope.selectedAudience));
            audienceService.setAndOr($scope.andOr);
            $scope.resetAudienceTargetingVariables();
            $scope.getSelectedAudience();
        };

        $scope.loadMoreAudience = function () {
            if ($scope.audienceList) {
                $scope.audienceFetching = true;
                $scope.pageNumber += 1
                $scope.fetchAllAudience(true);
            }
        };

        $scope.buildAudience = function () {
            $('.audience-tabs-segment').removeClass('active');
            $('.audience-tabs-audience').addClass('active');
        };

        // done button filter click
        $scope.processDone = function () {
            $('.dropdown.open').removeClass('open');
            $scope.fetchAllAudience();
        };
    });
})();
