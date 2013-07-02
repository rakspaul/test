// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
  
  var baseURL = "/reports/query.json",    
    requestParams ={},
    flag = true,
    flagOptionalCol = false,
    paginationNav = false,
    dropItem = '',
    dropColName = null,
    dropColString = null,   
    dropColumnCollection = [],
    dropColumnNames = [],
    dimeColumnNames = {},
    dataColumnType = '',
    optionalColNames = [],
    pageOffset = 0,
    totalRecords = 0,
    jsonObjectsCol = [],
    jsonObjectDefault = {
      advertiser_id: null,
      advertiser_name: null,
      order_id: null,
      order_name: null,
      ad_id : null,
      ad_name : null,
      ctr: null,
      pccr: null,
      actions: null,
      gross_rev: null,
      gross_ecpm: null
    }

  var paginationOptions = {
    items: 100,
    itemsOnPage: 50,
    cssStyle: 'light-theme',
    onPageClick: function( pageNumber, event ){
      loadPaginationLineItems(pageNumber);
    }
  }

  var appReset = function(){    
    requestParams ={},
    flag = true,
    flagOptionalCol = false,
    paginationNav = false,
    dropItem = '',
    dropColName = null,
    dropColString = null,   
    dropColumnCollection = [],
    dropColumnNames = [],
    dimeColumnNames = {},
    dataColumnType = '',
    optionalColNames = [],        
    pageOffset = 0,
    totalRecords = 0,
    $("#ordersReportTable").hide();
    $("#simplePagination").hide();
    $(".placeholder").show();
    $("#selectedDimensions").hide();
    $("#selectedDimensions ul.filters_list").html('');
    $(".addFilter li").show();
    $("#simplePagination").pagination(paginationOptions);   
    addDragDrop();
    addDraggable();
    resetJsonObjets();
  }

  var resetJsonObjets = function(){
    jsonObjectsCol = [];
    jsonObjectDefault = {
      advertiser_id: null,
      advertiser_name: null,
      order_id: null,
      order_name: null,
      ad_id : null,
      ad_name : null,
      ctr: null,
      pccr: null,
      actions: null,
      gross_rev: null,
      gross_ecpm: null
    }
  }

  var add_filters_all = function(){
    $(".addFilter li").show();
    addDragDrop();
  }

  var add_dimensions_list = function( dimName, dimeDataColType ){
    
    if( dimeDataColType == "group_by"){
      $(".addFilter li[data-name="+dimName+"]").show();
    }
    if( dimeDataColType == "optional" ){
      $(".addColumns li[data-name="+dimName+"]").show();
    }
    

    addDragDrop();
  }

  var addDragDrop = function(){

    $( "#draggable ul.addFilter li,#draggable ul.addColumns li" ).draggable({
      revert: true      
    });

    $("#droppable").droppable({
      accept: "#draggable ul.addFilter li, #draggable ul.addColumns li",
      tolerance: "pointer",

      drop: function( event, ui ) {
        dropItem = ui.draggable;
        dropColName = $(dropItem).text();
        dropColString = $(dropItem).text().toLowerCase();
        dataColumnName = $(dropItem).attr("data-name");
        dataColumnType = $(dropItem).attr("data-col");

        if(flag && dataColumnType =="group_by" || flagOptionalCol){
          dropItem.hide();
          resetDropdownAccordion();
          flag = false;
          flagOptionalCol = true;
          pageOffset = 0;
          paginationNav = false;
          dropColumnCollection.push(dataColumnName);
          dimeColumnNames[dataColumnName] = dataColumnType;

          if( dataColumnType == "group_by" ){
            dropColumnNames.push(dataColumnName);
          }
          if( dataColumnType=="optional" ){
            optionalColNames.push(dataColumnName);
          }         
          showSelectedDimensions();
          addColumnsNew(paginationNav);
        }
        else{
          dropItem.draggable('option', 'revert', true);
        }
      }

    });
  }

  var addColumnsNew = function( paginationNavOption ){
    $(".placeholder").hide();
    $("#simplePagination").hide();
    $(".ajax_loader").show();
    clearTableContent();
    var requestParams=getRequestParams();

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "json"});
    request.success(function(data){
      var jsonData = data["records"],
        $thead = $("#ordersReportTable thead"),
        $tbody = $("#ordersReportTable tbody"),
        tableHeadersRow = '',
        tableRowData = '';

      setNewJsonData(jsonData);
      flag = true;
      $(".ajax_loader").hide();
      $("#ordersReportTable").show();

      if(!paginationNavOption){
        pageOffset = 0;
        totalRecords = data["total_records"];
        paginationOptions["items"] = totalRecords;
        $("#simplePagination").pagination(paginationOptions);
      }   

      $("#simplePagination").show();
      tableHeadersRow = addTableHeaders(jsonObjectsCol[0]);
      tableRowData = addTableColumnsData(jsonObjectsCol);
      $tbody.append(tableRowData);
      $thead.append(tableHeadersRow);

    });
    request.fail(function(){
      alert("error");
    });
  }

  var setNewJsonData = function( jsonData ){
    resetJsonObjets();
    for(i=0; i<jsonData.length; i++){
      var jsonObj = jsonData[i];
      var newObj = $.extend({},jsonObjectDefault, jsonObj);
      jsonObjectsCol.push(newObj);
    }
  }

  var clearTableContent = function(){
    $("#ordersReportTable thead tr").remove();
    $("#ordersReportTable tbody tr").remove();
  }

  var getRequestParams = function(){
    var selected_date = $("#report_date span").text().split("to");
    var group_cols = '';
    var cols_names = '';
    var fixed_col_names = "impressions,clicks,ctr" //,ctr,pccr,actions,gross_rev,gross_ecpm

    for( i=0; i<dropColumnNames.length; i++ ){
      group_cols += dropColumnNames[i] + "_id,";
      cols_names += dropColumnNames[i] + "_id," + dropColumnNames[i] + "_name,"
    }
    if( optionalColNames.length ){
      for(i=0; i<optionalColNames.length; i++){
        cols_names += optionalColNames[i] + ",";
      }
    }

    cols_names = cols_names + fixed_col_names;
    requestParams = {
      group:group_cols,
      cols:cols_names,
      start_date:selected_date[0].trim(),
      end_date:selected_date[1].trim(),
      limit:50,
      offset: pageOffset
    }

    return requestParams;
  }

  var showSelectedDimensions = function(){
    var selectedButtons_groupby = '';
    var selectedButtons_columns = '';
    $.each(dimeColumnNames, function(key, val){
      if( val=="group_by" ){
        selectedButtons_groupby += "<div data-col="+val+" data-name="+key+" class='selectedBtns_groupBy'><a href='#' class='selectedDim'>"+key+"</a> <a href='#' class='remove_filter_dimension icon-white icon-remove'></a></div>";
      }
      if( val=="optional" ){
        selectedButtons_columns += "<div data-col="+val+" data-name="+key+" class='selectedBtns_optionalCol'><a href='#' class='selectedDim'>"+key+"</a> <a href='#' class='remove_filter_dimension icon-white icon-remove'></a></div><br/>";
      }
    });
    $("#selectedDimensions").show();
    $("#groupByBtns").html(selectedButtons_groupby);
    $("#optionalBtns").html(selectedButtons_columns)
  }

  var addTableHeaders = function( tableHeaders ){
    var headersTempl = _.template($("#orders_reports_headers_temp").html(), tableHeaders);
    return headersTempl;
  }

  var addTableColumnsData = function( jsonData ){
    var tableRowData = '';
    $.each(jsonData, function(count, item){
      var tableColumnNames = '';
      var template = _.template($("#orders_reports_body_temp").html(), item);
      tableRowData += template;
    });
    return tableRowData;
  }

  var initializeDateRangePicker = function() {
    $('#report_date').daterangepicker(
    {
      ranges: {
         'Today': [new Date(), new Date()],
         'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
         'Last 7 Days': [moment().subtract('days', 6), new Date()],
         'Last 30 Days': [moment().subtract('days', 29), new Date()],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
      },
      opens: 'left',
      format: 'YYYY-MM-DD',
      separator: ' to ',
      startDate: moment().subtract('days', 29),
      endDate: new Date(),
      minDate: '2012-01-01',
      maxDate: '2013-31-12',
      locale: {
          applyLabel: 'Submit',
          fromLabel: 'From',
          toLabel: 'To',
          customRangeLabel: 'Custom Range',
          daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
          monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          firstDay: 1
      },
      showWeekNumbers: true,
      buttonClasses: ['btn-danger'],
      dateLimit: false
    },
      function(start, end) {
        $('#report_date span').html(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
      }
    );
    //Set the initial state of the picker label
    $('#report_date span').html(moment().subtract('days', 29).format('YYYY-MM-DD') + ' to ' + moment().format('YYYY-MM-DD'));
  }

  var dimensionsAccordion = function(){
    $(".dimensionsHeader").click(function(){
      if($(this).next().is(":visible")){
        $(this).find("span").removeClass('arrow-up').addClass('arrow-down');
        $(this).next().slideUp();

      } else {
        $(".dimensionsBody").slideUp();
        $(this).next().slideToggle();
        $(this).find("span").toggleClass('arrow-up').toggleClass('arrow-down');
      }
    });

    $(".dropdownAccHeader").click(function(){
      if($(this).next().is(":visible")){
        $(this).find("span").removeClass('arrow-up').addClass('arrow-down');
        $(this).next().slideUp();

      } else {
        $(".dropdownAccBody").slideUp();
        $(this).next().slideToggle();
        $(this).find("span").toggleClass('arrow-up').toggleClass('arrow-down');
      }
    });
  }

  var resetDropdownAccordion = function(){
    $(".dropdownAccBody").slideUp();
    $(".dropdownAccHeader").find("span").removeClass('arrow-up').addClass('arrow-down');
  }

  var removeSelectedDimension = function(){
    $(document).on( "click",".remove_filter_dimension", function(){
      var dimName = $(this).parent().text().trim();
      var dimeDataColType = $(this).parent().attr("data-col");
      delete dimeColumnNames[dimName];
      if( dropColumnCollection.length==1 ){
        clearTableContent();
        appReset();
        add_filters_all();
      }
      else{
        resetJsonObjets();
        dropColumnCollection = removeItem_dropColumnCollection(dimName.toLowerCase());
        if( dimeDataColType == "group_by" ){
          dropColumnNames = removeItem_dropColumnNames(dimName);
        }
        if( dimeDataColType == "optional" ){
          optionalColNames = removeItem_Collection(dimName, optionalColNames);
        }
        add_dimensions_list( dimName.toLowerCase(), dimeDataColType );
        showSelectedDimensions();
        flag = true;
        pageOffset = 0;
        paginationNav = false;
        addColumnsNew(paginationNav);
      }
    });
  }

  var removeItem_Collection = function( removeItemValue, collectionName ){
    collectionName = jQuery.grep(collectionName, function(value) {
      return value != removeItemValue;
    });
    return collectionName;
  }

  var removeItem_dropColumnCollection =function( removeItem ){
    dropColumnCollection = jQuery.grep(dropColumnCollection, function(value) {
      return value != removeItem;
    });
    return dropColumnCollection;
  }

  var removeItem_dropColumnNames = function( removeColItem ){
    dropColumnNames = jQuery.grep(dropColumnNames, function(value) {
      return value != removeColItem;
    });
    return dropColumnNames;
  }

  var addDraggable = function(){
    $('#ordersReportTable').each(function(){
      $(this).dragtable({
        placeholder: 'dragtable-col-placeholder',
        items: 'thead th:not( .notdraggable ):not( :has( .dragtable-drag-handle ) ), .dragtable-drag-handle',
        appendTarget: $(this).parent(),
        scroll: true
      });
    });
  }

  var loadPaginationLineItems = function( pageNumber ){
    paginationNav = true;
    pageOffset = 50 * (pageNumber - 1);
    addColumnsNew(paginationNav);
  }

  return {
    init: function(){
      addDragDrop();
      addDraggable();
      initializeDateRangePicker();
      dimensionsAccordion();
      removeSelectedDimension();
    }
  }
}


