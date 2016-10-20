define(['angularAMD', 'audience-service'], function (angularAMD) {
    'use strict';

    angularAMD.controller('AudienceTargettingController', ['$scope', 'audienceService',
        'workflowService', 'constants', 'vistoconfig', function ($scope, audienceService,
                                                                    workflowService, constants, vistoconfig) {

        var editOneTimeFlag = false,

            _audienceTargetting = {
                processAudienceEdit: function () {
                    var fetchedObj = angular.copy(workflowService.getAdsDetails()),
                        selectedAudience = audienceService.getSelectedAudience(),
                        i,
                        index,

                        findAudience = function (item) {
                            return item.id === selectedAudience[i].id;
                        };

                    if (selectedAudience && selectedAudience.length > 0) {
                        for (i = 0; i < selectedAudience.length; i++) {
                            index = _.findIndex($scope.audienceList, findAudience);

                            if (index !== -1) {
                                $scope.audienceList[index].isChecked = true;
                                $scope.audienceList[index].isIncluded = true;
                            }
                        }
                    }

                    $scope.andOr = fetchedObj.targets.segmentTargets.operation;
                    audienceService.setAndOr($scope.andOr);
                },


                resetAudience: function () {
                    var i;

                    for (i = 0; i < $scope.audienceList.length; i++) {
                        $scope.audienceList[i].isChecked = false;
                        $scope.audienceList[i].isIncluded = null;
                    }
                },

                checkSelectedAudience: function () {
                    var index,
                        i,

                        findAudience = function (item) {
                            return item.id === $scope.selectedAudience[i].id;
                        };

                    for (i = 0; i < $scope.selectedAudience.length; i++) {
                        // find  array index in audienc list
                        index = _.findIndex($scope.audienceList, findAudience);

                        if (index !== -1) {
                            $scope.audienceList[index].isChecked = true;
                        }
                    }
                },

                fetchAllAudience: function (loadMoreFlag) {
                    var paramsObj = {
                        sortColumn: $scope.sortColumn,
                        sortOrder: $scope.sortOrder,
                        pageNumber: $scope.pageNumber || 1,
                        pageSize: $scope.pageSize || 50,
                        selectedKeywords: $scope.selectedKeywords,
                        selectedProviders: $scope.selectedProviders,
                        seatId: $scope.adData.platformSeatId,
                        platformId: $scope.adData.platformId,
                        advertiserId: vistoconfig.getSelectAdvertiserId()
                    };

                    if (!loadMoreFlag) {
                        $('#audienceTargetingContainer').scrollTop(0);
                        $scope.showAudienceLoader = true;
                        $scope.audienceList = [];
                    }

                    if($scope.noMoreSegmentData) {
                        return;
                    }

                    audienceService
                        .fetchAudience(paramsObj)
                        .then(function (result) {
                            var responseData;

                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.showAudienceLoader = false;
                                responseData = result.data.data;
                                audienceService.setAudience(responseData);
                                if(responseData.length  >0) {
                                    $scope.noMoreSegmentData =  false;
                                    if (loadMoreFlag) {
                                        _.each(responseData, function (obj) {
                                            $scope.audienceList.push(obj);
                                        });
                                    } else {
                                        // first time fetch/filter fetch
                                        $scope.audienceList = responseData;
                                    }

                                    if ($scope.mode === 'edit' && editOneTimeFlag === false) {
                                        _audienceTargetting.processAudienceEdit();
                                        editOneTimeFlag = true;
                                    }

                                    // check if selected audience exists and length > 0 call select Audience
                                    if ($scope.selectedAudience && $scope.selectedAudience.length > 0) {
                                        _audienceTargetting.checkSelectedAudience();
                                    }
                                } else {
                                    $scope.noMoreSegmentData  = true;
                                }
                            }
                        });
                },

                fetchProviders : function() {
                    var params = {
                        advertiserId: vistoconfig.getSelectAdvertiserId(),
                        clientId :  vistoconfig.getSelectedAccountId(),
                        seatId: $scope.adData.platformSeatId,
                        platformId: $scope.adData.platformId
                    };

                    $scope.providerLoader = true;

                    audienceService
                        .fetchProviders(params)
                        .then(function(result) {
                            if (result.status === 'OK' || result.status === 'success') {
                                $scope.segmentProviders = result.data.data;
                                $scope.providerLoader = false;

                            }
                        });
                },

                setSortOrder: function (order) {
                    $scope.sortOrder = order || 'asc';
                },

                updateProvidersText: function () {
                    if($scope.selectedProviders.length === 0 ){
                        $scope.providerLabel = 'All';

                    } else {
                        if ($scope.selectedProviders.length === 1) {
                            $scope.providerLabel = $scope.selectedProviders[0];
                        } else {
                            $scope.providerLabel = $scope.selectedProviders.length + ' Selected';
                        }
                    }
                },

                setSortColumn: function (col) {
                    $scope.sortColumn = col || 'displayName';
                },

                initAudienceTargeting: function () {
                    _audienceTargetting.setSortColumn();
                    _audienceTargetting.setSortOrder();
                },

                resetSelectedFields: function () {
                    $scope.pageNumber = 1;
                    $scope.noMoreSegmentData =  false;
                    $scope.selectedKeywords = [];
                    $scope.selectedCategory = [];
                    $scope.selectedAudience = [];
                    $scope.selectedProviders = [];
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
            };

        $scope.sortColumn = '';
        $scope.sortOrder = '';
        $scope.audienceList = [];
        $scope.sourceList = [];
        $scope.audienceKeywords = [];
        $scope.selectedKeywords = [];
        $scope.selectedCategory = [];
        $scope.selectedAudience = [];
        $scope.keywordText = '';
        $scope.audienceCategories = [];
        $scope.selectedProviders = [];
        $scope.selectAllChecked = false;
        $scope.pageNumber = 1;
        $scope.pageSize = 50;
        $scope.andOr = constants.DEFAULTANDORSTATUS;
        $scope.audienceFetching = false;
        $scope.categoryText = 'All';
        $scope.providerLabel = 'All';
        $scope.noMoreSegmentData = false;

        $scope.dropdownCss = {
            display: 'none',
            'max-height': '100px',
            overflow: 'scroll',
            top: '60px',
            left: '0'
        };

        $scope.isAudienceTargetingSearched = false;
        $scope.showAudienceLoader = false;

        audienceService.resetAudienceData();

        // building audience
        $scope.changeOrAndStatus = function (status) {
            var str;

            $scope.andOr = status;
            str = '<span class="text">' + $scope.andOr + '</span><span class="icon-arrow-solid-down"></span>';

            // remove all elements inside and-or-txt and append the created structure -- needs permanent fix
            $('.and-or-txt').html('').append(str);
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

        $scope.$on('setSelectedAudience', function () {
            var audiences;

            _audienceTargetting.resetAudience();
            $scope.selectedAudience = [];
            audiences = angular.copy(audienceService.getSelectedAudience());

            _.each(audiences, function (item) {
                $scope.selectedAudience.push(item);
            });
        });

        // Closes Audience Targeting View
        $scope.resetAudienceTargetingVariables = function () {
            var selectedAudience = audienceService.getSelectedAudience();

            if (!selectedAudience || selectedAudience.length === 0) {
                $scope.adData.isAudienceSelected = false;
                $scope.adData.targetName = null;
            }

            _audienceTargetting.resetSelectedFields();
            _audienceTargetting.hideAudienceTargetingBox();
        };

        // final save from audience segment
        $scope.saveAdWithAudience = function () {
            if($scope.selectedAudience.length <= 0){
                $scope.adData.isAudienceSelected = null;
            }

            $scope.saveCopyOfSelectedAudience = angular.copy($scope.selectedAudience);
            audienceService.setSelectedAudience($scope.saveCopyOfSelectedAudience);
            audienceService.setAndOr($scope.andOr);
            _audienceTargetting.hideAudienceTargetingBox();

            if ($scope.selectedKeywords.length > 0) {
                $scope.selectedKeywords = [];
                _audienceTargetting.fetchAllAudience();
            }

            $scope.$parent.saveAudience($scope.saveCopyOfSelectedAudience);
        };

        // done button filter click
        $scope.processDone = function () {
            $scope.pageNumber = 1;
            $('.dropdown.open').removeClass('open');
            _audienceTargetting.fetchAllAudience();
        };

        // category
        $scope.selectCategories = function (categoryObj, type, parentObj) {
            var index,
                subCategoryIndex;

            // when category is selected
            if (type === 'category') {
                // TODO: please don't remove code this commented out code. We need it in future
                /*
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
                    // if the category is not checked
                    if (subCategoryIndex === -1) {
                        $scope.selectedCategory.push($scope.audienceCategories[index].subCategories[i]);
                        $scope.audienceCategories[index].subCategories[i].isChecked = true;
                    } else if ($scope.audienceCategories[index].isChecked !== true) {
                        // if category checkbox is not checked
                        $scope.selectedCategory.splice(subCategoryIndex,1);
                        $scope.audienceCategories[index].subCategories[i].isChecked = false;
                    }
                }
                */

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

                // if the category is not checked
                if (subCategoryIndex === -1) {
                    $scope.selectedCategory.push(categoryObj);
                    categoryObj.isChecked = true;
                } else {
                    $scope.selectedCategory.splice(subCategoryIndex, 1);
                    categoryObj.isChecked = false;
                    parentObj.isChecked = false;
                }
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

        // select or unselect indiviual audience
        $scope.selectAudience = function (audience) {
            var index,

                audienceIndex = _.findIndex($scope.selectedAudience, function (item) {
                    return item.id === audience.id;
                });

            if (audienceIndex === -1) {
                $scope.selectedAudience.push(audience);
                audience.isChecked = true;
                audience.isIncluded = true;
            } else {
                $scope.selectedAudience.splice(audienceIndex, 1);

                index = _.findIndex($scope.audienceList, function (list) {
                    return audience.id === list.id;
                });

                $scope.audienceList[index].isChecked = false;
                $scope.audienceList[index].isIncluded = null;
            }
        };

        $scope.selectAllAudience = function (event) {
            var i;

            // empty the selected audience array before populating/emptying it with all the audience
            $scope.selectedAudience = [];

            $scope.selectAllChecked = event.target.checked;

            if ($scope.selectAllChecked) {
                for (i = 0; i < $scope.audienceList.length; i++) {
                    $scope.selectedAudience.push($scope.audienceList[i]);
                    $scope.audienceList[i].isChecked = true;
                    $scope.audienceList[i].isIncluded = true;
                }
            } else {
                // deselect all
                _audienceTargetting.resetAudience();
            }
        };

        $scope.clearAllSelectedAudience = function () {
            var fetchedObj;

            _audienceTargetting.resetAudience();
            $scope.selectedAudience = [];
            fetchedObj = workflowService.getAdsDetails();

            if (fetchedObj) {
                fetchedObj.targets.segmentTargets.segmentList = [];
            }

            workflowService.setAdsDetails(fetchedObj);
        };

        $scope.selectKeyword = function (keyword) {
            var index;

            $scope.selectedKeywords = [];

            index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });

            $scope.dropdownCss.display = 'none';

            if (index === -1) {
                $scope.selectedKeywords.push(keyword);
            }

            $scope.audienceKeywords = [];
            _audienceTargetting.fetchAllAudience();
        };

        $scope.removeKeyword = function (keyword) {
            var index = _.findIndex($scope.selectedKeywords, function (item) {
                return item === keyword;
            });

            $scope.selectedKeywords.splice(index, 1);
            _audienceTargetting.fetchAllAudience();
        };

        $scope.clearKeywordSearch = function (evt) {
            $scope.selectedKeywords=[];
            $('.keyword-txt').val('');
            evt && $(evt.currentTarget).parent().hide();
            $scope.noMoreSegmentData =  false;
            $scope.pageNumber = 1;

            if ($scope.isAudienceTargetingSearched) {
                $scope.isAudienceTargetingSearched = false;
                _audienceTargetting.fetchAllAudience();
            }
        };

        // keyword user choice
        $scope.showKeywords = function (event, keyword) {
            event.stopPropagation();
            $scope.noMoreSegmentData =  false;
            $scope.pageNumber = 1;
            $scope.dropdownCss.display = keyword.length > 0 ? 'block' : 'none';
            $scope.isAudienceTargetingSearched = true;

            if (event.which === 13) {
                $scope.audienceList = [];
                if (keyword.length){
                    // fetch audience for keyword entered by user
                    $scope.selectKeyword(keyword);
                } else {
                    // fetch all audience when user clears the textBox
                    $scope.clearKeywordSearch();
                }
            } else {
                // TODO  verify HACK
                $scope.selectedKeywords = [];
                $scope.selectedKeywords.push(keyword);

            }
        };



        $scope.filterAudienceData = function(provider) {
            var index;
            $scope.noMoreSegmentData =  false;
            $scope.pageNumber = 1;

            index = _.findIndex($scope.selectedProviders, function (item) {
                return item === provider;
            });

            if (index === -1) {
                $scope.selectedProviders.push(provider);
            } else {
                $scope.selectedProviders.splice(index, 1);
            }

            _audienceTargetting.fetchAllAudience();
            _audienceTargetting.updateProvidersText();
        };

        $scope.loadMoreAudience = function () {
            if ($scope.audienceList) {
                $scope.audienceFetching = true;
                $scope.pageNumber += 1;
                _audienceTargetting.fetchAllAudience(true);
            }
        };

        $scope.$on('triggerAudience', function () {
            var moduleDeleted = workflowService.getDeleteModule();

            if (_.indexOf(moduleDeleted, 'Audience') !== -1) {
                workflowService.resetDeleteModule();
                audienceService.resetAudienceData();
            }

            $scope.clearAllSelectedAudience();
            $scope.pageNumber = 1;
            $scope.noMoreSegmentData =  false;
            _audienceTargetting.showAudienceTargetingBox();
            _audienceTargetting.initAudienceTargeting();
            _audienceTargetting.fetchAllAudience();
            _audienceTargetting.fetchProviders();

        });
            $scope.showHideDropdownWithSearch = function(event) {
                $(event.target).closest('.dropdown').find('.dropdown-menu-with-search').toggle() ;
            };

        $(document).on('click', '.dropdown-menu', function (event) {
            event.stopPropagation();
        });
    }]);
});
