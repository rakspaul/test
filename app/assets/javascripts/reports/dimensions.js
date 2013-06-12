// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var baseURL = "/reports/dimensions";
	var dropColumnCollection = [];

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

				dropColName = $(dropItem).text();
				dropColString = $(dropItem).text().toLowerCase();
				dropColumnCollection.push(dropColString);

				console.log(dropColumnCollection);
									
				var containsHeaders = $("#ordersReportTable thead th").length;

				if(containsHeaders){
					addColumnsNew(dropColName, dropColString);
				}
				else{
					addColumnsNew(dropColName, dropColString);
					dropColStringOld = dropColString;
				}

			}
		});
	}

	
	var addColumnsNew = function(dropColName, dropColString){

		$("#ordersReportTable thead tr").remove();
    $("#ordersReportTable tbody tr").remove();   

		var para={};
		// para.existing = dropColStringOld;		
    para.selected = dropColString;
    para.dimensions = dropColumnCollection;

    var request = $.ajax({url:baseURL, data:para, dataType: "script"});

    request.done(function(data){
			
			var jsonData = JSON.parse(data);
			
			//Json Object Headers
			var tableHeaders = [];
			var obj = jsonData[0];
			for (var key in obj) {
   			tableHeaders.push(key);
			}			

			//Required Headers to add in table
			//var tableHeaderNames = ["Advertisers", "Orders"];
			addTableHeaders(tableHeaders);

			//Adds Column data in table
			addTableColumnsData(tableHeaders, jsonData);

		});

	}	

	var addTableHeaders = function(tableHeaders){
		
		var $thead = $("#ordersReportTable thead");
	
		var $tableHeadersRow = $("<tr>");
		var tableHeadersNames = '';

		for(i=0;i<tableHeaders.length;i++){
			tableHeadersNames  += '<th>' + tableHeaders[i] + '</th>';
		}

		$(tableHeadersNames).appendTo($tableHeadersRow);
		$tableHeadersRow.appendTo($thead);

	}


	var addTableColumnsData = function(tableHeaders, jsonData){

		var $tbody = $("#ordersReportTable tbody");		
		//var $tableRow = $("<tr>");

		var tableRowData = '';

		$.each(jsonData, function(count, item){
			
			var tableColumnNames = '';

			for(i=0; i<tableHeaders.length;i++){
				tableColumnNames  += '<td>' + item[tableHeaders[i]] + '</td>';
			}
			
			tableRowData += '<tr>'+tableColumnNames+'</tr>';

		});		

		$tbody.append(tableRowData);			

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
      strSelectedStartDate = Date.parse("3 months ago"),
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
  		$(".dimensions").slideUp();
  		$(this).next().slideToggle();
  	});
  }

	return {
		init: function(){
			addDragDrop();
			addDraggable();
			initializeDateRangePicker();
			dimensionsAccordion();
		}
	}
	
}


