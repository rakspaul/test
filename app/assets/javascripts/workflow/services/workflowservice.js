(function () {
    "use strict";
    angObj.factory("workflowService", function ($http,$location, api, apiPaths, dataService, $cookieStore,requestCanceller,constants,$rootScope) {
        var mode;
        var adDetails;
        var newCreative;
        var platform;

        return {
            fetchCampaigns : function() {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns';
                return dataService.fetch(url);
            },
            getClients: function () {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients';
                return dataService.fetch(url, {cache:false});
            },


            getAdvertisers: function (clientId) {

                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId + '/advertisers';
                return dataService.fetch(url);
            },
            getBrands: function (clientId, advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/' + clientId +'/advertisers/' + advertiserId + '/brands';
                return dataService.fetch(url);
            },
            saveCampaign: function (data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns', data, {'Content-Type': 'application/json'})
            },
            updateCampaign : function(data,id) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+id, data, {'Content-Type': 'application/json'})
            },
            getCampaignData : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId;
                return dataService.fetch(url, {cache:false});
            },
            getPlatforms:function(cacheObj){
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms';
                return dataService.fetch(url,cacheObj);
            },
            getAdsForCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/no_ad_group/ads';
                return dataService.fetch(url, {cache:false});
            },
            getAdgroups : function(campaignId){
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ad_groups';
                return dataService.fetch(url, {cache:false});

            },

            createAdGroups:function(campaignId,data){
                 return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId+'/ad_groups', data, {'Content-Type': 'application/json'})

            },

            getAdsInAdGroup :function(campaignId,adGroupID){
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads';
                return dataService.fetch(url, {cache:false});
            },

            createAdGroupOfIndividualAds:function(){

            },

            createAd : function(data) {
                return dataService.post(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads', data, {'Content-Type': 'application/json'})
            },

            updateAd : function(data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.adId, data, {'Content-Type': 'application/json'})
            },
            deleteAd : function(campaignId,adId) {
                return dataService.delete(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId+'/ads/'+adId, {'Content-Type': 'application/json'})
            },
            pauseAd : function(data){
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.id+'/pause', data, {'Content-Type': 'application/json'})
            },
            resumeAd : function(data){
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.id+'/resume', data, {'Content-Type': 'application/json'})
            },
            deleteCampaign : function(campaignId) {
                return dataService.delete(apiPaths.WORKFLOW_APIUrl +'/campaigns/'+campaignId, {'Content-Type': 'application/json'})
            },
            getAd : function(data) {
                var url = apiPaths.WORKFLOW_APIUrl +'/campaigns/'+data.campaignId+'/ads/'+data.adId;
                return dataService.fetch(url, {cache:false});
            },
            getDetailedAdsInAdGroup :function(campaignId,adGroupID,adId){
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ad_groups/'+adGroupID+'/ads/'+adId;
                return dataService.fetch(url, {cache:false});
            },
//            downloadTrackerURL:function(campaignId,adId){
//                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/ads/' +adId+ '/creatives?format=csv';
//                return dataService.fetch(url);
//            },
            pushCampaign : function(campaignId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/campaigns/' + campaignId + '/push';
                return dataService.fetch(url);

            },

            getTaggedCreatives : function(campaignId,adId){
                 var url= apiPaths.WORKFLOW_APIUrl +'/campaigns/'+ campaignId +'/ads/'+adId;
                 return dataService.fetch(url);
            },

            getCreativeSizes : function(){
                 var url= apiPaths.WORKFLOW_APIUrl +'/sizes';
                 return dataService.fetch(url);
            },
            saveCreatives: function(clientId,adId,data){
                     return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives', data, {'Content-Type': 'application/json'})

                var url= apiPaths.WORKFLOW_APIUrl +'/campaigns/'+ campaignId +'/ads/'+adId;
                return dataService.fetch(url);
            },

            forceSaveCreatives:function(clientId,adId,data){
               return dataService.post(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives?forceSave=true', data, {'Content-Type': 'application/json'})
            },

            getCreatives :  function(clientId, advertiserId, formats, query, cacheObj,integrationTracking) {
                var queryStr = query ? query : '';
                var creativeFormats = formats ? '?creativeFormat='+formats : ''
                var integration_Tracking= integrationTracking ? '&tracking=true':''
                var url= apiPaths.WORKFLOW_APIUrl +'/clients/'+ clientId+'/advertisers/'+ advertiserId +'/creatives'+ creativeFormats+ queryStr+ integration_Tracking;
                return dataService.fetch(url, cacheObj);
            },

            updateCreative : function(clientId,adId,id,data) {
                return dataService.put(apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+adId+'/creatives/'+id, data, {'Content-Type': 'application/json'})
            },

            getRegionsList :  function(platformId, data, success, failure,flag) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/regions'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }

            },

            getCitiesList :  function(platformId, data, success, failure,flag) {

                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/cities'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },

            getDMAsList :  function(platformId, data, success, failure, flag) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId+'/dmas'+data;
                if(flag == 'cancellable'){
                    var canceller = requestCanceller.initCanceller(constants.CAMPAIGN_FILTER_CANCELLER);
                    return dataService.fetchCancelable(url, canceller, success, failure);
                }
                else{
                    return dataService.fetch(url);
                }
            },


            getAdvertisersDomainList :  function(clientId, advertiserId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists';
                return dataService.fetch(url);
            },

            createAdvertiseDomainList :  function(clientId, advertiserId, domainId) {
                var domainIdstr =  domainId ? '/'+domainId : '';
                return apiPaths.WORKFLOW_APIUrl +'/clients/'+clientId+'/advertisers/'+advertiserId+'/domain_lists/upload'+domainIdstr;
            },

            getPlatformCustomInputs : function(platformId) {
                var url = apiPaths.WORKFLOW_APIUrl + '/platforms/'+platformId;
                return dataService.fetch(url);
            },

            setMode :  function(m) {
                mode = m;
            },
            getMode: function(){
                return mode;
            },
            setAdsDetails :  function(ad) {
                adDetails = ad;
            },
            getAdsDetails: function(){
                return adDetails;
            },
            setNewCreative :  function(creative) {
                newCreative = creative;
                $rootScope.$broadcast('updateNewCreative');
            },
            getNewCreative: function(){
                return newCreative;
            },
            setPlatform :  function(m) {
                platform = m;
            },
            getPlatform: function(){
                return platform;
            }
        };

    });
}());


(function () {
    "use strict";
    angObj.factory("platformCustomeModule", function ($timeout) {

      var _self = this;
      //private method
      var platformHeader = function(pJson, elem) {
         var platformHTML = '<div class="col-md-12 platformHeading zeroPadding">';
         platformHTML += '<div class="col-md-8 zeroPadding">'+ pJson.displayName+'<br/>';
         platformHTML += '</div>';
         platformHTML += ' <div class="col-md-4 zeroPadding pull-left clearLeft"><a href="javascript:void(0);">'+pJson.subName+'</a></div>'
         platformHTML + '</div>';
         elem.append(platformHTML);
      };

      var selectPlatform = function(selectedValue, inputList, platformCustomInputChildrenGroupList, dependentItems) {
        if(dependentItems == 'selectBoxchkDependentItems') {
          _self.elem.find("div[relationwith=selectBoxchkDependentItems]").length >0 && _self.elem.find("div[relationWith=selectBoxchkDependentItems]").remove();
          _self.elem.find("div[relationwith=chkDependentItems]").length >0 && _self.elem.find("div[relationWith=chkDependentItems]").remove();
        }

        if(dependentItems == 'chkDependentItems') {
          _self.elem.find("div[relationwith=chkDependentItems]").length >0 && _self.elem.find("div[relationWith=chkDependentItems]").remove();
        }


        var activationOrderList = _self.platformCustomInputActivationOrderList;
        var selectedOrderList = _.filter(activationOrderList, function(obj) { return obj.value === $.trim(selectedValue) && obj.platformCustomInputId === inputList.id });
        if(selectedOrderList.length >0) {
          var platformCustomInputGroupId = selectedOrderList[0].platformCustomInputGroupId;
          var Item = _.filter(platformCustomInputChildrenGroupList, function(obj) { return obj.id === platformCustomInputGroupId});
          if(Item.length >0) {
            Item =  Item[0];
            Item['relationWith'] = dependentItems;
          }
          createPlatformCustomInputList(Item , _self.elem);
        }
      }

      var adsEditDefaultValueMapper = function(adPlatformCustomInputs, inputList) {
        console.log(adPlatformCustomInputs);
        console.log(inputList);
        _.each(adPlatformCustomInputs, function(obj) {
            if(obj.platformCustomInputId === inputList.id) {
              inputList.defaultValue = obj.value;
              console.log("111", obj);
            }
        })
      }

      var createInputElem = function(inputList, inputGroupList, idx) {
        if(_self.adPlatformCustomInputs) {
          adsEditDefaultValueMapper(_self.adPlatformCustomInputs, inputList);
        }
        var inputWrapper = $('<div/>').addClass('form-group-section').attr({
          'relationWith' : inputGroupList.relationWith
        });

        if(inputList.name === 'target_reach.autobid_option') {
          inputWrapper.addClass('auto-bid-option');
        }

        if(inputList.displayName !== "") {
          if(inputList.displayName !== 'NA') {
            var fieldLabel = $('<span />').addClass('greyTxt col-md-12 zeroPadding').text(inputList.displayName);
            inputWrapper.append(fieldLabel);
          }
        }

        if(inputList.platformCustomWidgetType ==='DROPDOWN') {
          var options = inputList.rangeJson.split(',');
          var inputListHTML = $('<select/>').addClass('form-control col-md-12 na').addClass(inputList.decoratorOrientation.toLowerCase()).attr({
            'required': inputList.isMandatory ==='required' ? true : false,
            'name' : inputList.name+"$$"+inputList.id
          }).on('change', function() {
              if(inputList.dependentGroups) {
                selectPlatform(this.value, inputList, inputGroupList.platformCustomInputChildrenGroupList, 'selectBoxchkDependentItems');
              }
          });
          $timeout(function() {
            if(inputList.defaultValue) {
              inputListHTML.trigger('change');
            }
          }, 500)

          //selectPlatform(inputList.defaultValue, inputList, inputGroupList.platformCustomInputChildrenGroupList, 'selectBoxDependentItems')

          _.each(options, function(option) {
              var optionElem = $('<option/>').attr({
                'value': option,
                'name' : inputList.name,
                'selected': inputList.defaultValue === option ? true : false
              }).text(option);
              inputListHTML.append(optionElem);
          })
          inputWrapper.append(inputListHTML);
        }

        if(inputList.platformCustomWidgetType === 'CHECKBOX' || inputList.platformCustomWidgetType === 'TEXTBOX') {

          var platformCustomWidgetType = inputList.platformCustomWidgetType;
          var type = platformCustomWidgetType === 'CHECKBOX' ? 'checkbox' : 'number';
          var options = inputList.rangeJson && JSON.parse(inputList.rangeJson);
          var inputListHTML = $('<input/>').attr({
            'type': type,
            'required': inputList.isMandatory,
            'name' : type !== 'checkbox' ? inputList.name+"$$"+inputList.id : '',
            'id' : inputList.name,
            'value': inputList.defaultValue ,
            'min': options.min,
            'max': options.max
          });

          if(inputList.decorator !== 'NA')
            var decoratorHTML = $('<span />').text(inputList.decorator).appendTo(inputWrapper).addClass('decoratorFloat');

          if(platformCustomWidgetType === 'CHECKBOX') {
            inputListHTML.addClass('cmn-toggle cmn-toggle-round').attr({
              'id': 'cmn-toggle-'+(idx+1),
              checked : inputList.defaultValue ==='TRUE' ? true : false
            });
            inputWrapper.append(inputListHTML);
            var hiddenInputField = $('<input />').attr({
              'type' : 'hidden',
              'name' : inputList.name+"$$"+inputList.id,
              'value' : inputList.defaultValue,
            }).appendTo(fieldLabel);

            inputListHTML && inputListHTML.on('change', function() {
                var chkSelValue = this.checked ?  "TRUE" : "FALSE";
                if(inputList.dependentGroups) {
                  selectPlatform(chkSelValue , inputList, inputGroupList.platformCustomInputChildrenGroupList, 'chkDependentItems');
                }
                 hiddenInputField.attr('value' , chkSelValue);
            })
            var label = $('<label for="cmn-toggle-'+(idx+1)+'"/>');
            inputWrapper.append(label);



            if(inputList.defaultValue === 'TRUE') {
              $timeout(function() {
                  inputListHTML.trigger('change');
              }, 300)

            }

          } else {
            inputListHTML.addClass('form-control col-md-12');
            inputWrapper.append(inputListHTML);
          }
        }
        if(inputList.platformCustomWidgetType === 'LABEL') {
            inputWrapper.removeClass('form-group-section');
            var LabelHTML = $('<span />').addClass('pull-left clearLeft').text(inputList.defaultValue);
            inputWrapper.append(LabelHTML);
        }

        //adding validation for custom field.
        inputListHTML && inputListHTML.on('blur', function(){
            var field =  $(this);
            var value = field.val();
            field.next(".customFieldErrorMsg").remove();
            /*if(parseFloat(value) > options.min ||  parseFloat(value) > options.max ) {
              field.after('<div class="customFieldErrorMsg">'+inputList.displayName+' is invalid.</div>');
            } else {*/
              if(value.length === 0){
                  field.after('<div class="customFieldErrorMsg">'+inputList.displayName+' is required</div>');
              } else {
                  field.next(".customFieldErrorMsg").remove();
                  return true;
              }
            //}
        })
        return inputWrapper;
      };

      var createPlatformCustomInputList =  function(inputGroupList, elem, noGroup) {
        _self.inputGroupList = inputGroupList;
        var platformCustomInputList = _.sortBy(inputGroupList.platformCustomInputList, 'displayOrder');
        if(platformCustomInputList.length >0) {
          var groupConatiner =  $('<div/>').addClass("form-group col-md-12 zeroPadding").addClass(noGroup ? 'form-individual-section' : '')
        }
        _.each(platformCustomInputList, function(inputList, idx) {
            groupConatiner.append(createInputElem(inputList, inputGroupList, idx, 'group'));
        })
        elem.append(groupConatiner);

      }

      var buildInputControl = function(inputGroupList, elem, noGroup) {
         createPlatformCustomInputList(inputGroupList, elem, noGroup);
         var platformCustomInputChildrenGroupList = inputGroupList.platformCustomInputChildrenGroupList;
        _.each(platformCustomInputChildrenGroupList, function(inputGroupList) {
            if(inputGroupList.isActivated) {
              buildInputControl(inputGroupList, elem);
            }
        })
      };

      var buildFormControl =  function(pJson, elem) {
        var platformCustomInputGroupList = pJson.platformCustomInputGroupList
        _.each(platformCustomInputGroupList, function(inputGroupList) {
            if(inputGroupList.isActivated) {
              buildInputControl(inputGroupList, elem, true);
            }
        })
      }

      var init = function (platformCustomeJson, elem, adPlatformCustomInputs) {
         elem.html('');
        _self.elem = elem;
        _self.adPlatformCustomInputs= adPlatformCustomInputs;
        _self.platformCustomInputNamespaceList = platformCustomeJson.platformCustomInputNamespaceList;
        _self.platformCustomInputActivationOrderList = platformCustomeJson.platformCustomInputActivationOrderList;
         _.each(_self.platformCustomInputNamespaceList, function(pJson) {
           platformHeader(pJson, elem)
           buildFormControl(pJson, elem)
         })
      };

      return {
        init: init
      };
    });
}());
