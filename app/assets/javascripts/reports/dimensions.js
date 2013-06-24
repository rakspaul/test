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
	var dimensions_all = ["Advertiser","Order","Ad", "Creative Size"]
	var dimensions_list_all = dimensions_all;

	var appReset = function(){
		 dropColumnCollection = [];
		 count = 0;
		 dropItem = '';
		 dropColName = null;
		 tabColumn = 0;		
		 dropColString = null;	
		$("#ordersReportTable").hide();
		$(".placeholder").show();
		
		$("#selectedDimensions").html('').hide();
		$(".addFilter li").show();
		dimensions_all = ["Advertiser","Order","Ad", "Creative Size"]

		addDragDrop();
		addDraggable();

		return true;
	}	

	var add_dimensions_all = function(){
		$(".addFilter").html("");
		$.each(dimensions_list_all, function(index, objValue){
			$(".addFilter").append(
        $("<li>" + objValue + "</li>"));
		});
		addDragDrop();
	}

	var add_dimensions_list = function(){
		$(".addFilter").html("");
		$.each(dimensions_all, function(index, objValue){
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

				if(dropColumnCollection.length<2 && flag && dropColName !="Creative Size"){
					
		    	dropItem.hide();
		    	resetDropdownAccordion();
					//dropItem.draggable('option', 'disabled', true);
		       
		      flag = false;

					
					dropColumnCollection.push(dropColString);

					var showSelectedDim = showSelectedDimensions();
										
					if(dropColumnCollection.length < 2){
						addColumnsNew();
					}
					else{
						activateGroupByFilter();						
					}			
				}
				else{
					dropItem.draggable('option', 'revert', true);
				}

			}

		});
	}

	var activateGroupByFilter = function(){
		$(".dimName").removeAttr("disabled");
		$(".dimName").addClass("dimNameActive");
		$(".accIcon").css({'display':'inline-block'});
		$(".ajax_loader").hide();
	}
	
	var addColumnsNew = function(){

		$(".placeholder").hide(); 
		$(".ajax_loader").show();

		var clear_Table_Content = clearTableContent();     

		var requestParams=getRequestParams();	

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "script"});

    request.done(function(data){
			
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
			// appReset();
			// $(".placeholder").show();
			// $(".ajax_loader").hide();
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
    var from_date = selected_date[0].trim();
    var to_date = selected_date[1].trim();
		
    requestParams.dimensions = dropColumnCollection;
    requestParams.from_date = from_date;
    requestParams.to_date = to_date;

    return requestParams;
	}

	var setRequestParams = function(options){

		requestParams.expand_id = options.expand_id;
	}

	var showSelectedDimensions = function(){

		var selectedBtns = [];
		var selectedButtons = '';
		dimensions_all = dimensions_list_all;

		for(i=0; i<dropColumnCollection.length; i++){
		  selectedBtns[i] = "<a href='#' class='selectedDim'>"+dropColumnCollection[i]+" <i class='icon-remove'></i></a><br/>";
		  selectedButtons += selectedBtns[i];
		}

		// var selectedBtn = "<a class='btn btn-success selectedDim'>"+dropColName+" <i class='icon-white icon-remove'></i></a>";

		$("#selectedDimensions").html(selectedButtons).show();
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

	var addTableColumnsDataHigh = function(jsonData, expandID){

		var tableRowData = '';

		$.each(jsonData, function(count, item){			
			var tableColumnNames = '';	
			item["expandID"] = expandID;
			var template = _.template($("#orders_reports_body_temp_high").html(), item);
			tableRowData += template;
		});		

		return tableRowData;	
	}

	var dimensionsOrderByClick = function(){
  	$(document).on("click",".dimName",function(){
      
      var selectExpandID = $(this).attr("data-id").trim();
      var $selectDOMElement = $(this).closest("tr");
      var $selectAccIcon = $selectDOMElement.find(".accIcon");

      // requestParams.expand_id = selectExpandID;
      
      options.expand_id = selectExpandID;

      setRequestParams(options);

      if($selectAccIcon.hasClass("icon-plus-sign")){
      	excuteRequest(selectExpandID);
      }
      else{
      	hideAccordionContent(selectExpandID);
      }


      function excuteRequest(selectExpandID){

      	var request = $.ajax({url:baseURL, data:requestParams , dataType: "script"});

	    	request.done(function(data){
				
					var jsonData = JSON.parse(data);
					$(".ajax_loader").hide();						
					flag = true;	

					$selectAccIcon.removeClass("icon-plus-sign").addClass("icon-minus-sign");

					var rowData = addTableColumnsDataHigh(jsonData, selectExpandID);
					
					$selectDOMElement.after(rowData);

				});
				request.fail(function(){
					// $(".placeholder").show();
					// $(".ajax_loader").hide();
					alert("error");
				});
      }

      function hideAccordionContent(selectExpandID){
      	$("."+selectExpandID+"_parent").find(".accIcon").removeClass("icon-minus-sign").addClass("icon-plus-sign");
      	$("."+selectExpandID+"_child").remove();
      }
	    
    });
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

  	$(document).on("click",".selectedDim",function(){
  		
  		var dimName = $(this).text();  		

  		if(dropColumnCollection.length==1){
  			var clearContent = clearTableContent();
  			var resetAppParams = appReset();
  			add_dimensions_all();
  		}
  		else{
  			var dime_name = dimName.toLowerCase().trim();
				var getSelIndex;

  			for(i=0; i<dropColumnCollection.length; i++){
	  			if( dropColumnCollection[i] == dime_name) 
	  			{
	  				getSelIndex = i;
	  			}	  				
  			}

  			if(getSelIndex==1){
  				$(".dimName").attr("disabled","disabled");
					$(".dimName").removeClass("dimNameActive");
					$(".accIcon").css({'display':'none'});
					$(".highlightCol").remove();
					$(".accIcon").removeClass("icon-minus-sign").addClass("icon-plus-sign");
					var removeItem = dropColumnCollection[1];

					dropColumnCollection = removeItem_dropColumnCollection(removeItem);					

					requestParams.dimensions = dropColumnCollection;

					dimensions_all = removeItem_dimensions_all(dropColumnCollection[0]);
      		add_dimensions_list();
      		flag = true;
					showSelectedDimensions();
  			}
  			else{
  				var clearContent = clearTableContent();
  				// var resetAppParams = appReset();
  				var deleteSelected = deleteSelectedDim(getSelIndex);
					options.expand_id = '';
      		setRequestParams(options);       		
      		
      		dimensions_all = removeItem_dimensions_all(dropColumnCollection[0]);
      		add_dimensions_list();
					addColumnsNew();  
  			}  			
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

  var removeItem_dimensions_all =function(removeItem){
  	
  	var removeItem = removeItem.charAt(0).toUpperCase() + removeItem.substring(1);

  	dimensions_all = jQuery.grep(dimensions_all, function(value) {
		  return value != removeItem;
		});
		return dimensions_all;
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
			add_dimensions_list();
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
			dimensionsOrderByClick();
			removeSelectedDimension();
		}
	}
	
}


