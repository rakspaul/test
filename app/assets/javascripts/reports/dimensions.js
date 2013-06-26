// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var baseURL = "/reports/dimensions";	
	// var baseURL = "http://stg-cdb1.collective-media.net/export"
	var dropColumnCollection = [];
	var requestParams ={};
	var count = 0;
	var dropItem = '';
	var dropColName = null;
	var tabColumn = 0;		
	var dropColString = null;
	var flag = true;	
	var options = {};
	var filter_dimensions = ["Advertiser","Order","Ad", "Creative Size"]
	var filters_all = filter_dimensions;
	var dropColumnNames = [];
	var selectParam_Names = []

	var appReset = function(){
		 dropColumnCollection = [];
		 dropColumnNames = [];
		 count = 0;
		 dropItem = '';
		 dropColName = null;
		 tabColumn = 0;		
		 dropColString = null;	
		$("#ordersReportTable").hide();
		$(".placeholder").show();
		
		$("#selectedDimensions").hide();
		$("#selectedDimensions ul.filters_list").html('');

		$(".addFilter li").show();
		filter_dimensions = ["Advertiser","Order","Ad", "Creative Size"];

		addDragDrop();
		addDraggable();

		selectParam_Names = [];

		return true;
	}	

	var add_filters_all = function(){
		$(".addFilter").html("");
		$.each(filters_all, function(index, objValue){
			$(".addFilter").append(
        $("<li>" + objValue + "</li>"));
		});
		addDragDrop();
	}

	var add_dimensions_list = function(){
		$(".addFilter").html("");
		$.each(filter_dimensions, function(index, objValue){
			$(".addFilter").append(
        $("<li>" + objValue + "</li>"));
		});
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

				if(dropColumnCollection.length<3 && flag && dropColName !="Creative Size"){
					
		    	dropItem.hide();
		    	resetDropdownAccordion();
					//dropItem.draggable('option', 'disabled', true);
		       
		      flag = false;
					
					dropColumnCollection.push(dropColString);
					dropColumnNames.push(dropColName);

					var showSelectedDim = showSelectedDimensions();
										
					addColumnsNew();

				}
				else{
					dropItem.draggable('option', 'revert', true);
				}

			}

		});
	}

	var addColumnsNew = function(){

		$(".placeholder").hide(); 
		$(".ajax_loader").show();

		var clear_Table_Content = clearTableContent();     

		var requestParams=getRequestParams();	

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "script"});

    request.success(function(data){
			
			// console.log(data);
			
			$(".ajax_loader").hide();			
			$("#ordersReportTable").show();	
			flag = true;

			var jsonData = JSON.parse(data);
			
			//Json Object Headers
			var tableHeaders = [];
			var obj = jsonData[0];
			for (var key in obj) {
   			tableHeaders.push(key);
			}			

			var $thead = $("#ordersReportTable thead");
			var $tbody = $("#ordersReportTable tbody");	

			var tableHeadersRow = addTableHeaders(tableHeaders);	

			var tableRowData = addTableColumnsData(jsonData);

			$tbody.append(tableRowData);
			$thead.append(tableHeadersRow);

		});
		request.fail(function(){
			alert("error");
		});
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
		var fixed_col_names = "impressions,clicks,ctr,pccr,actions,gross_rev,gross_ecpm"
		
		for(i=0; i<dropColumnCollection.length; i++){
			group_cols += dropColumnCollection[i] + "_id,";
			cols_names += dropColumnCollection[i] + "_id," + dropColumnCollection[i] + "_name,"
		}
		
		cols_names = cols_names + fixed_col_names;

		requestParams = {
		  group:group_cols,
		  cols:cols_names,
		  start_date:selected_date[0].trim(),
		  end_date:selected_date[1].trim()
		}

		// requestParams = {
		//   instance:6,
		//   format:"json",
		//   group:group_cols,
		//   cols:cols_names,
		//   start_date:selected_date[0].trim(),
		//   end_date:selected_date[1].trim(),
		//   limit:20
		// }

    return requestParams;
	}

	var showSelectedDimensions = function(){

		var selectedBtns = [];
		var selectedButtons = '';
		filter_dimensions = filters_all;

		for(i=0; i<dropColumnNames.length; i++){
		  selectedBtns[i] = "<li data-colsel="+dropColumnNames[i].toLowerCase()+"><span class='arrow-right'></span><a href='#' class='selectedDim'>"+dropColumnNames[i]+"</a> <a href='#' class='remove_filter_dimension icon-remove'></a></li>";
		  selectedButtons += selectedBtns[i];
		}

		// var selectedBtn = "<a class='btn btn-success selectedDim'>"+dropColName+" <i class='icon-white icon-remove'></i></a>";

		$("#selectedDimensions").show();
		$("#selectedDimensions ul.filters_list").html(selectedButtons)
	}

	var addTableHeaders = function(tableHeaders){
		
		var headersTempl = _.template($("#orders_reports_headers_temp").html());
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

  		if(dropColumnCollection.length==1){
  			var clearContent = clearTableContent();
  			var resetAppParams = appReset();
  			add_filters_all();
  		}
  		else{


				dropColumnCollection = removeItem_dropColumnCollection(dimName.toLowerCase());	
				dropColumnNames = removeItem_dropColumnNames(dimName);				
				filter_dimensions = removeItem_filter_dimensions(dimName);

				console.log(dropColumnNames);

    		add_dimensions_list();    		
				showSelectedDimensions();

				flag = true;
  					
  		}
  	});

  }

  var deleteSelectedDim = function(getSelIndex){
  	var removeItem = dropColumnCollection[getSelIndex];
  	dropColumnCollection = removeItem_dropColumnCollection(removeItem);
  	showSelectedDimensions();  	
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

  var removeItem_filter_dimensions =function(removeItem){
  	
  	var removeItem = removeItem.charAt(0).toUpperCase() + removeItem.substring(1);

  	filter_dimensions = jQuery.grep(filter_dimensions, function(value) {
		  return value != removeItem;
		});
		return filter_dimensions;
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
  
	return {
		init: function(){
			add_filters_all();
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
			removeSelectedDimension();
			handle_App_Clicks();
		}
	}
	
}


