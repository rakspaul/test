var angObj = angObj || {};

(function () {
    'use strict';

    angObj.controller('AudienceTargettingController', function ($scope,  audienceService, $rootScope, workflowService,constants) {
        var _audienceTargetting = this;
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
        $scope.andOr = constants.DEFAULTANDORSTATUS;
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

        var editOneTimeFlag = false;

        audienceService.resetAudienceData();

        var _audienceTargetting = {
            processAudienceEdit: function () {
                var fetchedObj = angular.copy(workflowService.getAdsDetails());
                var selectedAudience = audienceService.getSelectedAudience();
                var i, index;
                if (selectedAudience && selectedAudience.length > 0) {
                    for (i = 0; i < selectedAudience.length; i++) {
                        index = _.findIndex($scope.audienceList, function (item) {
                            return item.id === selectedAudience[i].id;
                        });

                        if (index !== -1) {
                            $scope.audienceList[index].isChecked = true;
                            $scope.audienceList[index].isIncluded = true
                        }
                    }
                }

                $scope.andOr = fetchedObj.targets.segmentTargets.operation;
                audienceService.setAndOr($scope.andOr);
            },

            updateCategoryText: function () {
                var limit = 10;
                if ($scope.selectedCategory.length === 0) {
                    $scope.categoryText = 'All';
                } else if ($scope.selectedCategory.length === 1) {
                    if ($scope.selectedCategory[0].category.length < limit)
                        $scope.categoryText = $scope.selectedCategory[0].category;
                    else
                        $scope.categoryText = $scope.selectedCategory[0].category.slice(0, limit) + '...';

                } else {
                    $scope.categoryText = $scope.selectedCategory.length + ' Selected';
                }
            },

            updateSourceText: function () {
                if ($scope.selectedSource.length === 0) {
                    $scope.sourceText = 'All';
                } else if ($scope.selectedSource.length === 1) {
                    $scope.sourceText = $scope.selectedSource[0].name;
                } else {
                    $scope.sourceText = $scope.selectedSource.length + ' Selected';
                }
            },

            resetAudience: function () {
                var i;
                for (i = 0; i < $scope.audienceList.length; i++) {
                    $scope.audienceList[i].isChecked = false;
                    $scope.audienceList[i].isIncluded = null;
                }
            },

            fetchAllKeywords: function (key) {
                //api call to fetch keywords
                audienceService
                    .fetchAudiencekeywords(key)
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            audienceService.setAudienceKeywords(result.data.data);
                            $scope.audienceKeywords = result.data.data;
                        }
                    }, function (err) {
                        console.log("fetchAllKeywords Error", err);
                    });
            },

            checkSelectedAudience: function () {
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
            },

            fetchAllAudience: function (loadMoreFlag) {
                if(!loadMoreFlag) {
                    $("#audienceTargetingContainer").scrollTop(0);
                }
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
                        if (result.status === 'OK' || result.status === 'success') {
                            var responseData = result.data.data;
                            audienceService.setAudience(responseData);
                            if (loadMoreFlag) {
                                _.each(responseData, function (obj) {
                                    $scope.audienceList.push(obj);
                                });
                            } else {
                                $scope.audienceList = responseData; // first time fetch/filter fetch
                            }

                            if($scope.mode ==='edit' &&  editOneTimeFlag == false) {
                                _audienceTargetting.processAudienceEdit();
                                editOneTimeFlag = true;
                            }
                            //check if selected audience exists and length > 0 call select Audience
                            if ($scope.selectedAudience && $scope.selectedAudience.length > 0) {
                                _audienceTargetting.checkSelectedAudience();
                            }
                        }
                    });
            },

            fetchAllCategories: function () {
                //api call to fetch categories
                audienceService
                    .fetchAudienceCategories()
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            audienceService.setAudienceKeywords(result.data.data);
                            $scope.audienceCategories = result.data.data;
                        }
                    }, function (err) {
                        console.log("err", err);
                    });
            },

            fetchAllSource: function () {
                //api call to fetch sources
                audienceService
                    .fetchAudienceSource()
                    .then(function (result) {
                        if (result.status === 'OK' || result.status === 'success') {
                            audienceService.setAudienceSource(result.data.data);
                            $scope.sourceList = result.data.data;
                        }
                    });
            },

            setSortOrder: function (order) {
                $scope.sortOrder = order || 'asc';
            },

            setSortColumn: function (col) {
                $scope.sortColumn = col || 'name';
            },

            initAudienceTargetting: function () {
                _audienceTargetting.setSortColumn();
                _audienceTargetting.setSortOrder();
                _audienceTargetting.fetchAllSource();
                _audienceTargetting.fetchAllCategories();
            },

            resetSelectedFields: function () {
                $scope.pageNumber = 1;
                $scope.selectedKeywords = [];
                $scope.selectedCategory = [];
                $scope.selectedSource = [];
                $scope.selectedAudience = [];

            },

            hideAudienceTargetingBox: function () {
                $('#audienceTargeting')
                    .delay(300)
                    .animate({
                        left: '100%',
                        marginLeft: '0',
                        opacity: '0.0'
                    }, function () {
                        $(this).hide();
                    });
            },
            showAudienceTargetingBox: function () {
                $('#audienceTargeting')
                    .show()
                    .delay(300).animate({
                        left: '50%',
                        marginLeft: '-461px',
                        opacity: '1.0'
                }, 'slow');
            }
        }


        //building audience
        $scope.changeOrAndStatus = function (status) {
            $scope.andOr = status;
            var str = '<span class="text">' + $scope.andOr + '</span><span class="icon-arrow-down"></span>';

            //remove all elements inside and-or-txt and append the created structure -- needs permanent fix
            $('.and-or-txt').html('');
            $('.and-or-txt').append(str);
            $('.dropdown.open').removeClass('open');
        };

        $scope.changeIncludeStatus = function (audienceObj, status) {
            audienceObj.isIncluded = status;
            $('.dropdown.open').removeClass('open');
        };


        $scope.buildAudience = function () {
            $('.audience-tabs-segment').removeClass('active');
            $('.audience-tabs-audience').addClass('active');
        };



        $scope.$on('setSelectedAudience',function(event, callabck) {
            _audienceTargetting.resetAudience()
            $scope.selectedAudience = [];
            var audiences = angular.copy(audienceService.getSelectedAudience());
            _.each(audiences,function(item){
                $scope.selectedAudience.push(item);
            })
        });

        // Closes Audience Targeting View
        $scope.resetAudienceTargetingVariables = function () {
            _audienceTargetting.resetSelectedFields();
            _audienceTargetting.hideAudienceTargetingBox();
        };


        // final save from audience segment
        $scope.saveAdWithAudience = function () {
            $scope.saveCopyOfSelectedAudience = angular.copy($scope.selectedAudience);
            audienceService.setSelectedAudience($scope.saveCopyOfSelectedAudience);
            audienceService.setAndOr($scope.andOr);
            _audienceTargetting.hideAudienceTargetingBox();
            if($scope.selectedKeywords.length >0) {
                $scope.selectedKeywords = [];
                _audienceTargetting.fetchAllAudience();
            }
            $scope.$parent.saveAudience($scope.saveCopyOfSelectedAudience)
        };

        // done button filter click
        $scope.processDone = function () {
            $scope.pageNumber =  1;
            $('.dropdown.open').removeClass('open');
            _audienceTargetting.fetchAllAudience();
        };

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
            _audienceTargetting.updateSourceText();
        };

        $scope.clearAllSelectedSource = function () {
            var i;

            for (i = 0; i < $scope.selectedSource.length; i++) {
                $scope.selectedSource[i].isChecked = false;
            }
            $scope.selectedSource = [];
            $scope.pageNumber = 1;
            _audienceTargetting.fetchAllAudience();
            _audienceTargetting.updateSourceText();
        };

        // category
        $scope.selectCategories = function (categoryObj,type,parentObj) {
            var index,
                subCategoryIndex,
                i;

            //when category is selected
            if (type === 'category') {
                //index = _.findIndex($scope.audienceCategories, function (item) {
                //    return item.category === categoryObj.category;
                //});
                //if ($scope.audienceCategories[index].isChecked) {
                //    $scope.audienceCategories[index].isChecked = false;
                //} else {
                //    $scope.audienceCategories[index].isChecked = true;
                //}
                //for (i = 0; i < $scope.audienceCategories[index].subCategories.length; i++) {
                //    subCategoryIndex = _.findIndex($scope.selectedCategory, function (item) {
                //        return item.id === $scope.audienceCategories[index].subCategories[i].id;
                //    });
                //    //if the category is not checked
                //    if (subCategoryIndex === -1) {
                //        $scope.selectedCategory.push($scope.audienceCategories[index].subCategories[i]);
                //        $scope.audienceCategories[index].subCategories[i].isChecked = true;
                //    } else if ($scope.audienceCategories[index].isChecked !== true) {
                //        // if category checkbox is not checked
                //        $scope.selectedCategory.splice(subCategoryIndex,1);
                //        $scope.audienceCategories[index].subCategories[i].isChecked = false;
                //    }
                //}
                index = _.findIndex($scope.selectedCategory, function (item) {
                    return item.category === categoryObj.category;
                });

                if (index === -1) {
                    $scope.selectedCategory.push(categoryObj);
                    categoryObj.isChecked = true;
                } else {
                    $scope.selectedCategory.splice(index, 1);
                    categoryObj.isChecked = false;
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
            _audienceTargetting.updateCategoryText();
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
            $scope.pageNumber = 1;
            _audienceTargetting.fetchAllAudience();
            _audienceTargetting.updateCategoryText();
        };

        //select or unselect indiviual audience
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
                var index = _.findIndex($scope.audienceList,function(list){
                    return audience.id == list.id;
                })

                $scope.audienceList[index].isChecked = false;
                $scope.audienceList[index].isIncluded = null;
            }
        };

        $scope.selectAllAudience = function (event) {
            var i;
            $scope.selectedAudience = []; //empty the selected audience array before populating/empting it with all the audience
            $scope.selectAllChecked = event.target.checked;
            if ($scope.selectAllChecked) {
                for (i = 0; i < $scope.audienceList.length; i++) {
                    $scope.selectedAudience.push($scope.audienceList[i]);
                    $scope.audienceList[i].isChecked = true;
                    $scope.audienceList[i].isIncluded  = true;
                }
            } else {
                _audienceTargetting.resetAudience(); // deselect all
            }
        };

        $scope.clearAllSelectedAudience = function () {
            _audienceTargetting.resetAudience();
            $scope.selectedAudience = [];
            var fetchedObj = workflowService.getAdsDetails();
            fetchedObj.targets.segmentTargets.segmentList = [];
            workflowService.setAdsDetails(fetchedObj);
        };

        $scope.selectKeyword = function (keyword) {
            var input = $.trim($('#selectAud').find('.keyword-txt').val());
            // If user has not entered anything (blanks are trimmed off), don't do anything.
            if (!input) {
                return;
            }

            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });

            $scope.dropdownCss.display = 'none';

            if (index === -1) {
                $scope.selectedKeywords.push(keyword);
            }

            $scope.audienceKeywords = [];
            $('.keyword-txt').val('');
            _audienceTargetting.fetchAllAudience();
        };

        $scope.removeKeyword = function (keyword) {
            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });
            $scope.selectedKeywords.splice(index, 1);
            _audienceTargetting.fetchAllAudience();
        };

        //keyword user choice
        $scope.showKeywords = function (keyword, event) {
            $scope.pageNumber =  1;
            $scope.dropdownCss.display = keyword.length > 0 ? 'block' : 'none';
            if (event.which === 13) {
                $scope.selectKeyword(keyword);// fetch audience
                return false;
            } else {
                _audienceTargetting.fetchAllKeywords(keyword);
            }
        };

        $scope.loadMoreAudience = function () {
            if ($scope.audienceList) {
                $scope.audienceFetching = true;
                $scope.pageNumber += 1
                _audienceTargetting.fetchAllAudience(true);
            }
        };

        $scope.$on('triggerAudience', function () {
            var moduleDeleted = workflowService.getDeleteModule();
            if(_.indexOf(moduleDeleted, 'Audience') !== -1) {
                audienceService.resetAudienceData();
                $scope.clearAllSelectedAudience();
            }

            $scope.pageNumber =  1;
            _audienceTargetting.showAudienceTargetingBox();
            _audienceTargetting.initAudienceTargetting();
            _audienceTargetting.fetchAllAudience();
        });

        $(document).on('click', '.dropdown-menu', function (event) {
            event.stopPropagation();
        });

    });
})();
