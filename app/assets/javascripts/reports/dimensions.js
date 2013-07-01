// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var baseURL = "/reports/dimensions";	
	var dropColumnCollection = [];
	var requestParams ={};
	var count = 0;
	var dropItem = '';
	var dropColName = null;
	var tabColumn = 0;		
	var dropColString = null;
	var flag = true;	
	var options = {};

	var dropColumnNames = [];

	var dimeColumnNames = {};		
	var dataColumnType = '';
	var optionalColNames = [];
	var flagOptionalCol = false;

	var paginationNav = false;
	var pageOffset = 0;
	var totalRecords = 0;
	var jsonObjectsCol = [];
	var jsonObjectDefault = {
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
    onPageClick: function(pageNumber, event){
			loadPaginationLineItems(pageNumber);
		}
  }

	var appResetComplete = function(){
		dropColumnCollection = [];
		dropColumnNames = [];
		count = 0;
		dropItem = '';
		dropColName = null;
		tabColumn = 0;		
		dropColString = null;	
		pageOffset = 0;
		paginationNav = false;
		flagOptionalCol = false;

		$("#ordersReportTable").hide();
		$("#simplePagination").hide();

		$(".placeholder").show();
		
		$("#selectedDimensions").hide();
		$("#selectedDimensions ul.filters_list").html('');

		$(".addFilter li").show();

		addDragDrop();
		addDraggable();
		resetJsonObjets();

		dimeColumnNames = {};		
		dataColumnType = '';
		optionalColNames = [];

		$("#simplePagination").pagination(paginationOptions);

		return true;
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

	var add_dimensions_list = function(dimName){
		$(".addFilter li[data-name="+dimName+"]").show();
		addDragDrop();
	}

	var addDragDrop = function(){		

		//Drag Starts
		$( "#draggable ul.addFilter li" ).draggable({
			revert: true			
		});

		//Drop Starts
		$("#droppable").droppable({ 
			
			hoverClass: "drop-hover",
			accept: "#draggable ul.addFilter li",
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
					//dropItem.draggable('option', 'disabled', true);		       
		      flag = false;
		      flagOptionalCol = true;
		      pageOffset = 0;
		      paginationNav = false;		      
					
					dropColumnCollection.push(dataColumnName);
					if(dataColumnType == "group_by"){
						dropColumnNames.push(dataColumnName);
					}					

					if(dataColumnType=="optional"){
						optionalColNames.push(dataColumnName);
					}

					dimeColumnNames[dataColumnName] = dataColumnType;

					var showSelectedDim = showSelectedDimensions();
										
					addColumnsNew(paginationNav);

				}
				else{
					dropItem.draggable('option', 'revert', true);
				}

			}

		});
	}

	var addColumnsNew = function(paginationNavOption){

		$(".placeholder").hide();
		$("#simplePagination").hide(); 
		$(".ajax_loader").show();

		var clear_Table_Content = clearTableContent();     

		var requestParams=getRequestParams();	

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "json"});

    request.success(function(data){			
			
			flag = true;

			$(".ajax_loader").hide();			
			$("#ordersReportTable").show();					

			if(!paginationNavOption){
				pageOffset = 0;
				totalRecords = data["total_records"];
				paginationOptions["items"] = totalRecords;
				$("#simplePagination").pagination(paginationOptions);
				// console.log(paginationOptions);
			}		

			$("#simplePagination").show();

			var jsonData = data["records"];
			// console.log(jsonData);
			setNewJsonData(jsonData);
			// console.log(jsonObjectsCol);
			//Json Object Headers
			var tableHeaders = [];
			var obj = jsonData[0];
			for (var key in obj) {
   			tableHeaders.push(key);
			}
						
			var $thead = $("#ordersReportTable thead");
			var $tbody = $("#ordersReportTable tbody");	

			var tableHeadersRow = addTableHeaders(jsonObjectsCol[0]);	

			var tableRowData = addTableColumnsData(jsonObjectsCol);

			$tbody.append(tableRowData);
			$thead.append(tableHeadersRow);

		});
		request.fail(function(){
			alert("error msg");
		});
	}

	var setNewJsonData = function(jsonData){
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
    return true;  
	}

	var getRequestParams = function(){
		
		var selected_date = $("#report_date span").text().split("to");
		
		var group_cols = '';
		var cols_names = '';
		var fixed_col_names = "impressions,clicks" //,ctr,pccr,actions,gross_rev,gross_ecpm
		
		for(i=0; i<dropColumnNames.length; i++){
			group_cols += dropColumnCollection[i] + "_id,";
			cols_names += dropColumnCollection[i] + "_id," + dropColumnCollection[i] + "_name,"
		}		

		if(optionalColNames.length){
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
		  offset: pageOffset
		}

    return requestParams;
	}

	var showSelectedDimensions = function(){
		var selectedButtons = '';

		$.each(dimeColumnNames, function(key, val){
			selectedButtons += "<li data-col="+val+" data-name="+key+"><span class='arrow-right'></span><a href='#' class='selectedDim'>"+key+"</a> <a href='#' class='remove_filter_dimension icon-remove'></a></li>";
		});

		$("#selectedDimensions").show();
		$("#selectedDimensions ul.filters_list").html(selectedButtons)
	}

	var addTableHeaders = function(tableHeaders){
		
		var headersTempl = _.template($("#orders_reports_headers_temp").html(), tableHeaders);
		return headersTempl;
	}

	var addTableColumnsData = function(jsonData){

		var tableRowData = '';

		$.each(jsonData, function(count, item){
			var tableColumnNames = '';
			var template = _.template($("#orders_reports_body_temp").html(), item);
			tableRowData += template;
		});		

		return tableRowData;		
	}

	var dimensionsOrderByClick = function(){
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

  	$(document).on("click",".remove_filter_dimension",function(){
  		
  		var dimName = $(this).parent().text().trim();  		

  		var dimeDataColType = $(this).parent().attr("data-col");

  		delete dimeColumnNames[dimName];

  		if(dropColumnCollection.length==1){
  			var clearContent = clearTableContent();
  			var resetAppParams = appResetComplete();
  			add_filters_all();
  		}
  		else{

  			resetJsonObjets();

  			dropColumnCollection = removeItem_dropColumnCollection(dimName.toLowerCase());					
				
				if(dimeDataColType == "group_by"){
					dropColumnNames = removeItem_dropColumnNames(dimName);
				}

				if(dimeDataColType == "optional"){
					optionalColNames = removeItem_Collection(dimName, optionalColNames);
				}

    		add_dimensions_list(dimName.toLowerCase());    		
				showSelectedDimensions();
				flag = true;
				pageOffset = 0;
		    paginationNav = false;
				addColumnsNew(paginationNav);
  					
  		}
  	});
  }

  var removeItem_Collection = function(removeItemValue, collectionName){
  	collectionName = jQuery.grep(collectionName, function(value) {
		  return value != removeItemValue;
		});
		return collectionName;
  }

  var removeItem_dropColumnCollection =function(removeItem){
  	dropColumnCollection = jQuery.grep(dropColumnCollection, function(value) {
		  return value != removeItem;
		});
		return dropColumnCollection;
  }

  var removeItem_dropColumnNames = function(removeColItem){
  	dropColumnNames = jQuery.grep(dropColumnNames, function(value) {
		  return value != removeColItem;
		});
		return dropColumnNames;
  }

  var handle_App_Clicks = function(){
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

	var loadPaginationLineItems = function(pageNumber){
		paginationNav = true;
		pageOffset = 50 * (pageNumber - 1);
		addColumnsNew(paginationNav);
	}
  
  var addSimplePagination = function(){  	
  	$("#simplePagination").pagination(paginationOptions);
  }

	return {
		init: function(){
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
			removeSelectedDimension();
			handle_App_Clicks();
			addSimplePagination();
		}
	}
	
}


