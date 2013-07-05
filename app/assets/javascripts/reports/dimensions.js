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
    fixedColumnNames = ["impressions", "clicks", "ctr"],
    sortDirection = null,
    sortParam = null,
    jsonObjectDefault = {
      advertiser_id: null,
      advertiser_name: null,
      order_id: null,
      order_name: null,
      ad_id : null,
      ad_name : null,
      impressions: null,
      clicks: null,
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
    sortDirection = null,
    sortParam = null,
    fixedColumnNames = ["impressions", "clicks", "ctr"];
    $("#orders_report_table").hide();
    $("#simplePagination").hide();
    $(".placeholder").show();
    $("#selected_dimensions").hide();
    $("#selected_dimensions ul.filters-list").html('');
    $(".add-columns li").hide();
    $(".add-filter li, .add-columns li.show").show();
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
      impressions: null,
      clicks: null,
      ctr: null,
      pccr: null,
      actions: null,
      gross_rev: null,
      gross_ecpm: null
    }
  }

  var add_filters_all = function(){
    $(".add-filter li").show();
    addDragDrop();
  }

  var add_dimensions_list = function( dimName, dimeDataColType ){    
    if( dimeDataColType == "group_by"){
      $(".add-filter li[data-name="+dimName+"]").show();
    }
    if( dimeDataColType == "optional" ){
      $(".add-columns li[data-name="+dimName+"]").show();
    }
    if( dimeDataColType == "groupFixed" ){
      $(".add-columns li[data-name="+dimName+"]").removeClass('hide').show();
    }
    addDragDrop();
  }

  var addDragDrop = function(){

    $( "#draggable ul.add-filter li,#draggable ul.add-columns li" ).draggable({
      revert: true      
    });

    $("#droppable").droppable({
      accept: "#draggable ul.add-filter li, #draggable ul.add-columns li",
      tolerance: "pointer",

      drop: function( event, ui ) {
        dropItem = ui.draggable;
        dropColName = $(dropItem).text();
        dropColString = $(dropItem).text().toLowerCase();
        dataColumnName = $(dropItem).attr("data-name");
        dataColumnType = $(dropItem).attr("data-col");

        if(flag && dataColumnType =="group_by" || flagOptionalCol){
          dropItem.hide();
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
          if( dataColumnType=="groupFixed" ){
            fixedColumnNames.push(dataColumnName);
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
    $(".ajax-loader").show();
    clearTableContent();
    var requestParams=getRequestParams();

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "json"});
    request.success(function(data){
      var jsonData = data["records"],
        $thead = $("#orders_report_table thead"),
        $tbody = $("#orders_report_table tbody"),
        tableHeadersRow = '',
        tableRowData = '';

      setNewJsonData(jsonData);
      flag = true;
      $(".ajax-loader").hide();
      $("#orders_report_table").show();

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
    $("#orders_report_table thead tr").remove();
    $("#orders_report_table tbody tr").remove();
    $("#orders_report_table").hide();
  }

  var getRequestParams = function(){
    var selectedDate = $("#report_date span").text().split("to");
    var groupColDimensions = '';
    var cols_names = '';
  
    for( i=0; i<dropColumnNames.length; i++ ){
      groupColDimensions += dropColumnNames[i] + "_id,";
      cols_names += dropColumnNames[i] + "_name,"
    }
    for( i =0; i<fixedColumnNames.length; i++){
      cols_names += fixedColumnNames[i] + ",";
    } 
    if( optionalColNames.length ){
      for(i=0; i<optionalColNames.length; i++){
        cols_names += optionalColNames[i] + ",";
      }
    }
    
    requestParams = {
      group:groupColDimensions,
      cols:cols_names,
      start_date:selectedDate[0].trim(),
      end_date:selectedDate[1].trim(),
      limit:50,
      format:"json",
      offset: pageOffset
    }

    if( sortParam && sortDirection != "null" ){
      requestParams["sort_param"]=sortParam;
      requestParams["sort_direction"]=sortDirection ? "asc" : "desc";
    }

    return requestParams;
  }

  var showSelectedDimensions = function(){
    var selectedButtons_groupby = '';
    var selectedButtons_columns = '';
    $.each(dimeColumnNames, function(key, val){
      if( val=="group_by" ){
        selectedButtons_groupby += "<div data-col="+val+" data-name="+key+" class='selected-btns-groupby'><a href='#' class='selected-dimename'>"+key+"</a> <a href='#' class='remove-filter-dimension icon-white icon-remove'></a></div>";
      }
      if( val=="optional" ){
        // selectedButtons_columns += "<div data-col="+val+" data-name="+key+" class='selected-btns-optional'><a href='#' class='selected-dimename'>"+key+"</a> <a href='#' class='remove-filter-dimension icon-white icon-remove'></a></div><br/>";
      }
    });
    $("#selected_dimensions").show();
    $("#group_by_btns").html(selectedButtons_groupby);
    $("#optional_btns").html(selectedButtons_columns)
  }

  var addTableHeaders = function( tableHeaders ){
    tableHeaders["sortParam"] = sortParam;
    if(sortDirection == null){
      tableHeaders["sortDirection"] = null;
    }
    else{      
      tableHeaders["sortDirection"] = sortDirection;
    }    
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
    $(".dimensions-header").click(function(){
      if($(this).next().is(":visible")){
        $(this).find("span").removeClass('arrow-up').addClass('arrow-down');
        $(this).next().slideUp();

      } else {
        $(".dimensions-body").slideUp();
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

  var removeSelectedDimension = function(){
    $(document).on( "mousedown",".remove-filter-dimension", function(){     
      var dimName = $(this).parent().attr("data-name");
      var dimeDataColType = $(this).parent().attr("data-col");

      if( dropColumnNames.length==1 && dimeDataColType != "groupFixed" ){
        clearTableContent();
        appReset();
        add_filters_all();
      }
      else{        
        if(dimeDataColType=="group_by" && dropColumnNames.length == 1 && optionalColNames.length) return

        delete dimeColumnNames[dimName];
        resetJsonObjets();
        dropColumnCollection = removeItem_dropColumnCollection(dimName.toLowerCase());
        if( dimeDataColType == "group_by" ){
          dropColumnNames = removeItem_dropColumnNames(dimName);
        }
        if(dimeDataColType =="groupFixed"){
          fixedColumnNames = removeItem_Collection(dimName, fixedColumnNames);
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
    $('#orders_report_table').each(function(){
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

  var exportButtonClick = function(){
    $(document).on('click', '.export-button', function(e){
      var exportFormat = $(this).attr("data-format");
      var requestParamCSV = getRequestParams();
      var requestParamQueryString = '';
      requestParamCSV["format"] = exportFormat;
      requestParamCSV["limit"] = totalRecords;
      requestParamQueryString = decodeURIComponent($.param(requestParamCSV));
      window.location = '/reports/query.'+ exportFormat +'?'+requestParamQueryString;
    });
  }

  var addTableSorting = function(){
    $(document).on( 'mousedown','.table-filter-icon', function(){
      var sortColumnName = $(this).parent().attr("data-name");
      if(sortParam === sortColumnName) {
        sortDirection = !sortDirection;
      } else {
        sortParam = sortColumnName;
        sortDirection = true;
      }
      addColumnsNew(false);
    });
  }

  return {
    init: function(){
      addDragDrop();      
      initializeDateRangePicker();
      dimensionsAccordion();
      removeSelectedDimension();
      exportButtonClick();
      addDraggable();
      addTableSorting();
    }
  }
}
