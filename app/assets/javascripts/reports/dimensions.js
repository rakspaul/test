// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var baseURL = "/reports/dimensions";
	var dropColumnCollection = [];
	var requestpParams ={};
	var count = 0;

	var addDragDrop = function(){
		
		var tabColumn = 0;
		var dropColName = null;
		var dropColString = null;		
		var dropColStringOld = null;
		

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

				var dropItem = ui.draggable;

        dropItem.remove();
				//dropItem.draggable('option', 'disabled', true);
        $(".placeholder").remove(); 
        $(".ajax_loader").show();       

				dropColName = $(dropItem).text();
				dropColString = $(dropItem).text().toLowerCase();
				dropColumnCollection.push(dropColString);

				console.log(dropColumnCollection);
									
				var containsHeaders = $("#ordersReportTable thead th").length;

				if(dropColumnCollection.length < 2){
					if(containsHeaders){
						addColumnsNew(dropColName, dropColString);
					}
					else{
						addColumnsNew(dropColName, dropColString);
						dropColStringOld = dropColString;
					}
				}
				else{
					$(".dimName").removeAttr("disabled");
					$(".dimName").addClass("dimNameActive");
				}

			}
		});
	}

	
	
	var addColumnsNew = function(dropColName, dropColString){

		$("#ordersReportTable thead tr").remove();
    $("#ordersReportTable tbody tr").remove();   
    

		var requestParams=getRequestParams();		

    var request = $.ajax({url:baseURL, data:requestParams, dataType: "script"});

    request.done(function(data){
			
			$(".ajax_loader").hide();

			var jsonData = JSON.parse(data);
			
			//Json Object Headers
			var tableHeaders = [];
			var obj = jsonData[0];
			for (var key in obj) {
   			tableHeaders.push(key);
			}			

			//Required Headers to add in table
			//var tableHeaderNames = ["Advertisers", "Orders"];

			var $thead = $("#ordersReportTable thead");
			var $tbody = $("#ordersReportTable tbody");	

			var tableHeadersRow = addTableHeaders(tableHeaders);	

			var tableRowData = addTableColumnsData(tableHeaders, jsonData, "");

			$tbody.append(tableRowData);
			$thead.append(tableHeadersRow);

		});

	}	

	var getRequestParams = function(){
		var selected_date = $("#report_date span").text().split("to");
    var from_date = selected_date[0].trim();
    var to_date = selected_date[1].trim();
		
		// para.existing = dropColStringOld;		
    //para.selected = dropColString;
    requestpParams .dimensions = dropColumnCollection;
    requestpParams .from_date = from_date;
    requestpParams .to_date = to_date;
		//requestpParams.expand_id = null;

    return requestpParams;
	}

	var addTableHeaders = function(tableHeaders){
		
		//var $thead = $("#ordersReportTable thead");
	
		var tableHeadersRow = '';
		var tableHeadersNames = '';

		for(i=0;i<tableHeaders.length;i++){
			tableHeadersNames  += '<th>' + tableHeaders[i] + '</th>';
		}

		tableHeadersRow = '<tr>'+ tableHeadersNames + '</tr>';
		
		return tableHeadersRow;
		//$tableHeadersRow.appendTo($thead);

	}


	var addTableColumnsData = function(tableHeaders, jsonData, tableColClass){

		var tableRowData = '';

		$.each(jsonData, function(count, item){
			
			var tableColumnNames = '';

			for(i=0; i<tableHeaders.length;i++){
				
				if(tableColClass){
					if(tableHeaders[i]=="name"){
						tableColumnNames  += '<td class='+tableColClass+'><a class="dimName" disabled="disabled" data-id='+item.id+'>' + item[tableHeaders[i]] + '</a></td>';
					}
					else{
						tableColumnNames  += '<td class='+tableColClass+'>' + item[tableHeaders[i]] + '</td>';
					}
				}
				else{
					if(tableHeaders[i]=="name"){
						tableColumnNames  += '<td><a class="dimName" disabled="disabled" data-id='+item.id+'>' + item[tableHeaders[i]] + '</a></td>';
					}
					else{
						tableColumnNames  += '<td>' + item[tableHeaders[i]] + '</td>';
					}
				}

			}

			if(tableColClass){
				tableRowData += '<tr class="hightlightRow">'+tableColumnNames+'</tr>';
			}
			else{
				tableRowData += '<tr>'+tableColumnNames+'</tr>';
			}
			

		});		

		// $el.append(tableRowData);
		return tableRowData;		

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

	var initializeDateRangePicker = function() {
    var maxDate = Date.parse("yesterday"),
      strSelectedStartDate = Date.parse("yesterday"),
      strSelectedEndDate = Date.parse("yesterday");

    // create range for last six months
    var minDate = Date.parse("6 months ago"),
      dateRanges = {},
      monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    while(minDate.isBefore(maxDate)) {
      var mName = monthNames[minDate.getMonth()] + " " + minDate.getFullYear();
      dateRanges[mName] = [];
      dateRanges[mName].push(minDate.clone().moveToFirstDayOfMonth());
      dateRanges[mName].push(minDate.clone().moveToLastDayOfMonth());
      dateRanges[mName].push("month");
      minDate.addMonths(1);
    }

    // add last month
    var mName = monthNames[minDate.getMonth()] + " " + minDate.getFullYear();
    dateRanges[mName] = [];
    dateRanges[mName].push(minDate.moveToFirstDayOfMonth().clone());
    dateRanges[mName].push(minDate.moveToLastDayOfMonth().clone());
    dateRanges[mName].push("month");

    var yearName = "Last 12 months"
    dateRanges[yearName] = []
    dateRanges[yearName].push(Date.parse("1 year ago"));
    dateRanges[yearName].push(Date.parse("today"));
    dateRanges[yearName].push("year");

    $('#report_date').daterangepicker(
      {
        ranges: dateRanges,
        opens: 'right',
        format: 'yyyy-MM-dd',
        startDate: Date.parse(strSelectedStartDate).moveToFirstDayOfMonth(),
        endDate: Date.parse(strSelectedEndDate),
        minDate: false,
        maxDate: maxDate.moveToLastDayOfMonth(),
        locale: {
          applyLabel: 'Apply',
          fromLabel: 'From',
          toLabel: 'To',
          customRangeLabel: 'Custom Range',
          daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
          monthNames: monthNames,
          firstDay: 1
        }
      },

      function(start, end, selectedRange) {
        
        $('#report_date span').html(formatDate(start) + ' to ' + formatDate(end));
      }
    );

    $('#report_date span').html(formatDate(strSelectedStartDate) + ' to ' + formatDate(strSelectedEndDate));

  }

  var formatDate = function(dt) {
    if(typeof dt === 'string') {
      dt = Date.parse(dt);
    }

    return dt.toString('yyyy-MM-dd');
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

  var dimensionsOrderByClick = function(){
  	$(document).on("click",".dimName",function(){
      
      var selectExpandID = $(this).attr("data-id");
      var $selectDOMElement = $(this).closest("tr");

      requestpParams.expand_id = selectExpandID;


      var request = $.ajax({url:baseURL, data:requestpParams , dataType: "script"});

	    if(count<1){
	    	request.done(function(data){
				
					var jsonData = JSON.parse(data);
					$(".ajax_loader").hide();
					count++;
					
					//Json Object Headers
					var tableHeaders = [];
					var obj = jsonData[0];
					for (var key in obj) {
		   			tableHeaders.push(key);
					}			

					var rowData = addTableColumnsData(tableHeaders, jsonData, "highlightCol");

					$selectDOMElement.after(rowData);

				});
	    }
	    

    });
  }

	return {
		init: function(){
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
			dimensionsOrderByClick();
		}
	}
	
}


