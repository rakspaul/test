// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var baseURL = "/reports/dimensions";	
	var dropColumnCollection = [];
	var requestpParams ={};
	var count = 0;
	var dropItem = '';
	var dropColName = null;
	var tabColumn = 0;		
	var dropColString = null;
	var flag = true;	

	var appReset = function(){
		 dropColumnCollection = [];
		 requestpParams ={};
		 count = 0;
		 dropItem = '';
		 dropColName = null;
		 tabColumn = 0;		
		 dropColString = null;	
		$("#ordersReportTable").hide();
		$(".placeholder").show();
		
		$("#selectedDimensions").html('').hide();
		$("#dimensions li").show();

		addDragDrop();
		addDraggable();

		return true;
	}	

	var addDragDrop = function(){		

		//Drag Starts
		$( "#draggable ul li" ).draggable({
			revert: true			
		});

		//Drop Starts
		$("#droppable").droppable({ 
			
			hoverClass: "drop-hover",
			accept: "#draggable ul li",
			tolerance: "pointer",

			drop: function( event, ui ) { 

				dropItem = ui.draggable;


				if(dropColumnCollection.length<2 && flag){
					
        	dropItem.hide();
					//dropItem.draggable('option', 'disabled', true);
	        $(".placeholder").hide(); 
	        $(".ajax_loader").show(); 
	        flag = false;      

					dropColName = $(dropItem).text();
					dropColString = $(dropItem).text().toLowerCase();
					if(dropColString == 'ads') dropColString = 'ad';
					dropColumnCollection.push(dropColString);

					var showSelectedDim = showSelectedDimensions();
										
					var containsHeaders = $("#ordersReportTable thead th").length;

					if(dropColumnCollection.length < 2){
						if(containsHeaders){
							addColumnsNew(dropColName, dropColString);
						}
						else{
							addColumnsNew(dropColName, dropColString);
						}
					}
					else{
						$(".dimName").removeAttr("disabled");
						$(".dimName").addClass("dimNameActive");
						$(".accIcon").css({'display':'inline-block'});
						$(".ajax_loader").hide();						
					}			
				}
				else{
					dropItem.draggable('option', 'revert', true);
				}

			}
		});
	}
	
	var addColumnsNew = function(dropColName, dropColString){

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
		
    requestpParams .dimensions = dropColumnCollection;
    requestpParams .from_date = from_date;
    requestpParams .to_date = to_date;

    return requestpParams;
	}

	var showSelectedDimensions = function(){

		var selectedBtns = [];
		var selectedButtons = '';

		for(i=0; i<dropColumnCollection.length; i++){
		  selectedBtns[i] = "<a href='#' class='selectedDim'>"+dropColumnCollection[i]+" <i class='icon-white icon-remove'></i></a>";
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

      requestpParams.expand_id = selectExpandID;

      if($selectAccIcon.hasClass("icon-plus-sign")){
      	excuteRequest(selectExpandID);
      }
      else{
      	hideAccordionContent(selectExpandID);
      }


      function excuteRequest(selectExpandID){

      	var request = $.ajax({url:baseURL, data:requestpParams , dataType: "script"});

	    	request.done(function(data){
				
					var jsonData = JSON.parse(data);
					$(".ajax_loader").hide();						
					flag = true;	

					$selectAccIcon.removeClass("icon-plus-sign").addClass("icon-minus-sign");

					var rowData = addTableColumnsDataHigh(jsonData, selectExpandID);
					
					$selectDOMElement.after(rowData);

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
  }

  var removeSelectedDimension = function(){  	

  	$(document).on("click",".selectedDim",function(){
  		var dimName = $(this).text();
  		if(dropColumnCollection.length==1){
  			var clearContent = clearTableContent();
  			var resetAppParams = appReset();
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

					var removeItem = dropColumnCollection[1];

					dropColumnCollection = jQuery.grep(dropColumnCollection, function(value) {
					  return value != removeItem;
					});

					showSelectedDimensions();

  			}
  			else{
  				var clearContent = clearTableContent();
  				var resetAppParams = appReset();
  				var deleteSelected = deleteSelectedDim(getSelIndex);
  			}
  			

  		}
  		
  	});
  }

  var deleteSelectedDim = function(getSelIndex){
  	alert(getSelIndex);
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
  
  var adjustColumnWidth = function(){

  	adjustColWidth();

  	$(window).resize(function(){
  		adjustColWidth();
  	});


  	function adjustColWidth(){
  		var docWidth = $(document).width();
	  	$(".orderRepLeftCol").width(220);
	  	$(".orderRepRightCol").width(docWidth-220);
	  	$("#droppable").width(docWidth-220);
  	}

  }

	return {
		init: function(){
			adjustColumnWidth();
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
			dimensionsOrderByClick();
			removeSelectedDimension();
		}
	}
	
}


