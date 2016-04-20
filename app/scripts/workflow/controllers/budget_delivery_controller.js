define(['angularAMD', 'common/services/constants_service', 'common/moment_utils', 'workflow/directives/ng_upload_hidden', 'workflow/directives/custom_date_picker'], function (angularAMD) {
  angularAMD.controller('BudgetDeliveryController', function ($scope, constants, momentService,workflowService) {

      $scope.adData.primaryKpi='Impressions';
      $scope.BudgetExceeded=false;
      $scope.adBudgetExceedUnallocated=false;
      $scope.isChecked=true;
      $scope.unitName="CPM";
      $scope.adData.targetValue='';
      $scope.adData.unitCost='';
      $scope.adData.totalAdBudget='';
      $scope.adData.budgetAmount='';
      var unallocatedAmount=0;
      var adMaximumRevenue=0;
    $scope.ImpressionPerUserValidator = function () {
      var impressionPerUser = Number($scope.adData.quantity),
        totalImpression;

      $scope.budgetErrorObj.impressionPerUserValidator = false;
      if ($scope.adData.budgetType.toLowerCase() === 'impressions' && impressionPerUser >= 0) {
        totalImpression = Number($scope.adData.budgetAmount);
        if (impressionPerUser > totalImpression) {
          $scope.budgetErrorObj.impressionPerUserValidator = true;
        }
      }
    };
      $scope.calculateTotalAdBudget=function(){
          if($('#targetUnitCost_squaredFour').prop("checked") && ($scope.adData.primaryKpi).toUpperCase()=='IMPRESSIONS' && $scope.unitName=='CPM'){
              if($scope.adData.targetValue>=0 && $scope.adData.unitCost>=0){
                $scope.adData.totalAdBudget=Number((Number($scope.adData.targetValue)*Number($scope.adData.unitCost))/1000);
              }
          }
         var campaignData = $scope.workflowData.campaignData;
          unallocatedAmount = Number(localStorage.getItem('unallocatedAmount'));
            //var unallocatedAmount = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
          // new budget calculation
          if(workflowService.getIsAdGroup() == false ){
              unallocatedAmount = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
          }
          else{
              if(unallocatedAmount > 0){
                  adMaximumRevenue = Number(unallocatedAmount);
              }
              else{
                  if(Number(localStorage.getItem('groupBudget')) > 0){
                      adMaximumRevenue = 0;
                  }
                  else{
                      adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
                  }
              }
          }
          if($scope.adData.totalAdBudget>unallocatedAmount || $scope.adData.totalAdBudget>adMaximumRevenue){
            console.log("total budget exceeds unallocated budget")
              $scope.adBudgetExceedUnallocated=true;
          }else{
              $scope.adBudgetExceedUnallocated=false;


          }
      }
      $scope.checkBudgetExceed=function(){
          if(($scope.adData.budgetType).toUpperCase()=="COST" && ($scope.adData.totalAdBudget>=0 && $scope.adData.budgetAmount>=0)){
                if(Number($scope.adData.totalAdBudget)< Number($scope.adData.budgetAmount)){
                    $scope.BudgetExceeded=true;
                    console.log("errorMsg that mediacost exceeds total ad budget");
                }else{
                    $scope.BudgetExceeded=false;
                }
            }else{
                $scope.BudgetExceeded=false;
          }


      }
/*
    $scope.adBudgetValidator = function () {
      var campaignData,
        campaignBuget,
        adAvailableRevenue,
        adsData,
        adMaximumRevenue,
        budgetAmount,
        unitType,
        unitCost,
        totalBudget,
        unallocatedAmount;
        unallocatedAmount = Number(localStorage.getItem('unallocatedAmount'));
      if (!$scope.workflowData.campaignData) {
        return false;
      }
      $scope.budgetErrorObj.mediaCostValidator = false;
      $scope.budgetErrorObj.availableRevenueValidator = false;
      $scope.budgetErrorObj.availableMaximumAdRevenueValidator = false;

      campaignData = $scope.workflowData.campaignData;
      campaignBuget = Number(campaignData.deliveryBudget || 0);
        // new budget calculation
        if(workflowService.getIsAdGroup() == false ){
            adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
        }
        else{
            if(unallocatedAmount > 0){
                adMaximumRevenue = Number(unallocatedAmount);
            }
            else{
                if(Number(localStorage.getItem('groupBudget')) > 0){
                    adMaximumRevenue = 0;
                }
                else{
                    adMaximumRevenue = Number(campaignData.deliveryBudget - (campaignData.bookedSpend || 0));
                }
            }
        }
      //  budgetAmount = Number($scope.adData.budgetAmount);
        budgetAmount = Number($scope.adData.totalAdBudget);

      if ($scope.workflowData.adsData && $scope.mode === 'edit') {
          //when ads are inside ad group and unallocated amount is 0 OR ad is outside any ad group
          if ((workflowService.getIsAdGroup() && unallocatedAmount == 0)
              || !workflowService.getIsAdGroup()){
              if (Number(localStorage.getItem('groupBudget')) > 0){
                  if ( $scope.workflowData.adsData.budgetType === "COST"){
                      adAvailableRevenue = unallocatedAmount + Number($scope.workflowData.adsData.budgetValue);
                  }
                  else if ($scope.workflowData.adsData.budgetType === "IMPRESSIONS"){
                      if($scope.workflowData.adsData.rateValue > 0){
                          adAvailableRevenue = unallocatedAmount + ($scope.workflowData.adsData.budgetValue * $scope.workflowData.adsData.rateValue / 1000);
                      }
                      else {
                          adAvailableRevenue = 0;
                      }
                  }
                  else {
                      adAvailableRevenue = unallocatedAmount + ($scope.workflowData.adsData.budgetValue * $scope.workflowData.adsData.rateValue);
                  }
              }
              else{
                  adsData = $scope.workflowData.adsData;
                  adAvailableRevenue = Number(adsData.availableRevenue);
              }

          }
          else {
              adsData = $scope.workflowData.adsData;
              //BUDGET then add ad budget value + unallocated , IMPRESSION then just use unallocated value
              if (adsData.budgetType === "COST"){
                  adAvailableRevenue = unallocatedAmount +  Number(adsData.budgetValue);
              }
              else if (adsData.budgetType === "IMPRESSIONS") {
                  if (adsData.rateValue > 0){
                      adAvailableRevenue = unallocatedAmount + (adsData.budgetValue * adsData.rateValue / 1000);
                  } else {
                      adAvailableRevenue = unallocatedAmount;
                  }
              }
              else {
                  adAvailableRevenue = unallocatedAmount + (adsData.budgetValue * adsData.rateValue);
              }
          }
      }
        //console.log("adAvailableRevenue ",adAvailableRevenue);

        if (budgetAmount > 0 && $scope.adData.budgetType.toLowerCase() !== 'impressions') {
        $scope.ImpressionPerUserValidator();

        if ($scope.adData.budgetType.toLowerCase() === 'cost') {
            //if(workflowService.getIsAdGroup() && unallocatedAmount > 0){
            //    if(unallocatedAmount < budgetAmount){
            //        adMaximumRevenue = unallocatedAmount;
            //        $scope.adMaximumRevenue = adMaximumRevenue;
            //    }
            //}
          if (adAvailableRevenue) {
            if (budgetAmount > adAvailableRevenue) {
              $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
              $scope.budgetErrorObj.mediaCostValidator = false;
              $scope.adMaximumRevenue = adAvailableRevenue;
            }
          } else if (budgetAmount > campaignBuget) {
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = false;
                $scope.budgetErrorObj.mediaCostValidator = true;
          } else if (budgetAmount > adMaximumRevenue) {
            //in case of create ad total budget is greater then adMaximumRevene
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
            $scope.adMaximumRevenue = adMaximumRevenue;
          }
        } else {
          unitType = $scope.adData.unitType;
          unitCost = Number($scope.adData.unitCost);
          totalBudget;
          if (unitType.name === 'CPM') {
            totalBudget = unitCost * (budgetAmount / 1000);
          } else if (unitType.name === 'CPC' || unitType.name === 'CPA') {
            totalBudget = unitCost * budgetAmount;
          }

            //if(workflowService.getIsAdGroup() && unallocatedAmount > 0){
            //    if(unallocatedAmount < totalBudget){
            //        adMaximumRevenue = unallocatedAmount;
            //    }
            //}

          if ($scope.mode === 'edit' && totalBudget > adAvailableRevenue) {
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
            $scope.adMaximumRevenue = adAvailableRevenue;
          }
          if ($scope.mode === 'create' && totalBudget > adMaximumRevenue) {
            //in case of create ad total budget is greater then adMaximumRevene
            $scope.budgetErrorObj.availableMaximumAdRevenueValidator = true;
            $scope.adMaximumRevenue = adMaximumRevenue;
          }


        }
      }
    };
*/
    $scope.checkForPastDate = function (startDate, endDate) {
      var endDate = moment(endDate).format(constants.DATE_US_FORMAT);

      return moment().isAfter(endDate, 'day')
    };

    $scope.handleEndFlightDate = function (data) {
      var endDateElem = $('#endDateInput'),
        startDateElem = $('#startDateInput'),
        startDate = data.startTime,
        endDate = data.endTime,
        adsDate = JSON.parse(localStorage.getItem('adsDates')),
        changeDate;

      // if End Date is in Past
      if (!endDate && adsDate) {
        endDate = adsDate.adEndDate;
        changeDate = endDate;
        $scope.adData.endTime = changeDate;
        if (moment().isAfter(endDate)) {
          endDateElem.datepicker('setStartDate', moment().format(constants.DATE_US_FORMAT));
        }
      }
    };

    $scope.handleStartFlightDate = function (data) {
      if(!$scope.workflowData.campaignData)   return;
      var endDateElem = $('#endDateInput'),
        startDateElem = $('#startDateInput'),
        startDate = data.startTime,
        endDate = data.endTime,
        campaignEndTime = momentService.utcToLocalTime($scope.workflowData.campaignData.endTime),
        changeDate,
        adsDate;

      if ($scope.mode !== 'edit') {
        endDateElem
          .attr('disabled', 'disabled')
          .css({'background': '#eee'});
        if (startDate) {
          endDateElem
            .removeAttr('disabled')
            .css({'background': 'transparent'});
          changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
          endDateElem.datepicker('setStartDate', changeDate);
          if (location.href.indexOf('adGroup') > -1) {
            endDateElem.datepicker('setEndDate', momentService.utcToLocalTime(localStorage.getItem('edTime')));
          } else {
            endDateElem.datepicker('setEndDate', campaignEndTime);
          }
          endDateElem.datepicker('update', changeDate);
        }
      } else {
        changeDate = moment(startDate).format(constants.DATE_US_FORMAT);
        adsDate = JSON.parse(localStorage.getItem('adsDates'));
        // if start Date is in Past
        if (!startDate && adsDate) {
          changeDate = startDate = adsDate.adStartDate;
          $scope.adData.startTime = changeDate;
          if (moment().isAfter(endDate, 'day')) {
            endDateElem.datepicker('setStartDate', moment().format(constants.DATE_US_FORMAT));
          }
        } else {
          endDateElem.datepicker('setStartDate', changeDate);
        }
        if (moment(startDate).isAfter(endDate, 'day')) {
          endDateElem.datepicker('update', changeDate);
        }
      }
    };

    $scope.setDateInEditMode = function (campaignStartTime, campaignEndTime) {
      var endDateElem = $('#endDateInput'),
        startDateElem = $('#startDateInput'),
        adsDate = JSON.parse(localStorage.getItem('adsDates')),
        startDate,
        endDate;

      if (adsDate) {
        startDate = adsDate.adStartDate;
        endDate = adsDate.adEndDate;
      }
      // ads start Date in Past
      if (campaignStartTime > startDate) {
        startDateElem.datepicker('setStartDate', campaignStartTime);
      }
      if (startDate > campaignStartTime) {
        startDateElem.datepicker('update', startDate);
      }
      if (campaignEndTime >= endDate) {
        startDateElem.datepicker('setEndDate', campaignEndTime);
      }
      // ads start Date in Past
      if (moment(endDate).isAfter(campaignEndTime, 'day')) {
        endDateElem.datepicker('setEndDate', endDate);
        endDateElem.datepicker('setStartDate', endDate);
        endDateElem.datepicker('update', endDate);
      } else {
        endDateElem.datepicker('setStartDate', startDate);
        endDateElem.datepicker('setEndDate', campaignEndTime);
        endDateElem.datepicker('update', endDate);
      }

      // this is to disable the enddate before today
      var currentDate = moment().format(constants.DATE_US_FORMAT);
      endDateElem.datepicker('setStartDate', currentDate);
    };

    $scope.resetBudgetField = function (bookingType) {
      $scope.adData.budgetAmount = '';
      $scope.budgetErrorObj.mediaCostValidator = '';
      $scope.budgetErrorObj.availableRevenueValidator = '';
      $scope.budgetErrorObj.availableMaximumAdRevenueValidator = '';
    };

    $scope.enable_budget_input = function ( event ) {
      var elem = $(event.target);
      if(elem.is(':checked')) {
        //elem.closest(".budget_holder_input").find(".budget_holder input").attr("disabled" , true);//.addClass("disabled-field") ;
        //elem.closest(".budget_holder_input").find(".impression_field").addClass("disabled-field") ;
        $('.totalBudgetInputClass').attr("disabled" , true);
        $('.totalBudgetInputClass').addClass("disabled-field") ;
      } else {
          $('.totalBudgetInputClass').attr("disabled" , false);
          $('.totalBudgetInputClass').removeClass("disabled-field") ;
        //elem.closest(".budget_holder_input").find(".budget_holder input").attr("disabled" , false).removeClass("disabled-field") ;
        //elem.closest(".budget_holder_input").find(".impression_field").removeClass("disabled-field") ;
      }

    };

    $scope.select_kpi = function (event , type) {
        $scope.adData.primaryKpi=type;
        $scope.adData.targetValue='';
        $scope.adData.totalAdBudget='';

       var elem = $(event.target);
       elem.closest(".symbolAbs").find(".KPI_symbol").show() ;
       elem.closest(".symbolAbs").find(".VTC_per").hide() ;
       elem.closest(".symbolAbs").find(".target_val_input").removeClass("target_val_input_vtc") ;
       if( type != "impressions") {
           $('#targetUnitCost_squaredFour').prop("checked",false);
           $(".impressions_holder").find("input[type='checkbox']").attr("disabled" , true) ;
           elem.closest(".symbolAbs").find(".KPI_symbol").html("$") ;
           $(".budget_holder_input").find("input[type='text']").attr("disabled" , false).removeClass("disabled-field") ;
           $(".impressions_holder").find(".external_chkbox").addClass("disabled") ;
           $(".external_chkbox").hide();
           if( type == "VTC" ||type == "CTR") {
            elem.closest(".symbolAbs").find(".KPI_symbol").hide() ;
            elem.closest(".symbolAbs").find(".VTC_per").show() ;
            elem.closest(".symbolAbs").find(".target_val_input").addClass("target_val_input_vtc") ;
           }
       } else {
           elem.closest(".symbolAbs").find(".KPI_symbol").html("#") ;
           if(($scope.adData.unitType.name).toUpperCase()=="CPM"){
               $(".external_chkbox").show();
               $(".impressions_holder").find("input[type='checkbox']").attr("disabled" , false) ;
               $('#targetUnitCost_squaredFour').prop("checked",true);
               $(".budget_holder_input").find("input[type='text']").attr("disabled" , true);//.addClass("disabled-field") ;
               $(".impressions_holder").find(".external_chkbox").removeClass("disabled") ;
           }
       }
    };
      $scope.select_unitType=function (event , type) {
          //$scope.adData.unitType.name=type;
          $scope.unitName=type;
          $scope.adData.unitCost='';
          $scope.adData.totalAdBudget='';
          if( type != "CPM") {
              $(".external_chkbox").hide();
              $('#targetUnitCost_squaredFour').prop("checked",false);
              $(".impressions_holder").find("input[type='checkbox']").attr("disabled" , true) ;
              $(".budget_holder_input").find("input[type='text']").attr("disabled" , false).removeClass("disabled-field") ;
              $(".impressions_holder").find(".external_chkbox").addClass("disabled") ;
          } else {
              if (($scope.adData.primaryKpi).toUpperCase() == "IMPRESSIONS") {
                  $(".external_chkbox").show();
                  $(".impressions_holder").find("input[type='checkbox']").attr("disabled", false);
                  $('#targetUnitCost_squaredFour').prop("checked",true);
                  $(".budget_holder_input").find("input[type='text']").attr("disabled", true);//.addClass("disabled-field") ;
                  $(".impressions_holder").find(".external_chkbox").removeClass("disabled");
              }
          }
      }

    $scope.$parent.initiateDatePicker = function () {
      var endDateElem = $('#endDateInput'),
        startDateElem = $('#startDateInput'),
        startDateElem = $('#startDateInput'),
        endDateElem = $('#endDateInput'),
        campaignData = $scope.workflowData.campaignData,
        campaignStartTime = momentService.utcToLocalTime(campaignData.startTime),
        campaignEndTime = momentService.utcToLocalTime(campaignData.endTime),
        adGroupStartDate,
        adGroupEndDate,
        currentDate = moment().format(constants.DATE_US_FORMAT);

      if (moment().isAfter(campaignStartTime, 'day')) {
        campaignStartTime = moment().format(constants.DATE_US_FORMAT);
      }

      $scope.mode === 'edit' && endDateElem.removeAttr('disabled').css({'background': 'transparent'});

      // If we are handling an ad of an Adgroup
      if (location.href.indexOf('adGroup') > -1) {
        if ($scope.mode === 'edit') {

          if (momentService.isDateBefore($scope.workflowData.adGroupData.startDate, currentDate)) {
            adGroupStartDate = currentDate;
          } else {
            adGroupStartDate = $scope.workflowData.adGroupData.startDate;
          }
          adGroupEndDate = $scope.workflowData.adGroupData.endDate;
          startDateElem.datepicker('setStartDate', adGroupStartDate);
          startDateElem.datepicker('setEndDate', adGroupEndDate);
          $scope.setDateInEditMode(adGroupStartDate, adGroupEndDate);

        } else {
          // When creating a new Adgroup ad, if Adgroup start date is:
          // 1) before currrent date (in the past), default start & end dates will be current date
          // 2) else (in the future)m default current date will be Adgroup start date.
          adGroupStartDate = momentService.utcToLocalTime(localStorage.getItem('stTime'));
          adGroupEndDate = momentService.utcToLocalTime(localStorage.getItem('edTime'));
          if (momentService.isDateBefore(adGroupStartDate, currentDate)) {
            startDateElem.datepicker('setStartDate', currentDate);
            startDateElem.datepicker('update', currentDate);1
          } else {
            startDateElem.datepicker('setStartDate', adGroupStartDate);
            startDateElem.datepicker('update', adGroupStartDate);
          }
          startDateElem.datepicker('setEndDate', adGroupEndDate);
        }
      } else {

        // Normal ad (non-Adgroup)
        startDateElem.datepicker('setStartDate', campaignStartTime);
        endDateElem.datepicker('setEndDate', campaignEndTime);
        if ($scope.mode === 'edit') {
          $scope.setDateInEditMode(campaignStartTime, campaignEndTime);
        } else {
          startDateElem.datepicker('setEndDate', campaignEndTime);
          startDateElem.datepicker('update', campaignStartTime);
        }
      }
    };

    $scope.$parent.budgetErrorObj = {};

    $scope.$watch('adData.budgetType', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.budgetErrorObj.availableRevenueValidator = false;
        $scope.budgetErrorObj.mediaCostValidator = false;
      }
    //  $scope.adBudgetValidator();
    });
  });
});
