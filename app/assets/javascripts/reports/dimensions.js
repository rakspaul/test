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
									
				var containsHeaders = $("#ordersReportTable thead th").length;

				if(containsHeaders){
					addColumnsNew(dropColName, dropColString, dropColStringOld);
				}
				else{
					addColumnNew(dropColName, dropColString);
					dropColStringOld = dropColString;
				}

			}
		});
	}

	var addColumnNew = function(dropColName, dropColString){
						
		var para={};		
    para.selected = dropColString;
    var request = $.ajax({url:baseURL, data:para, dataType: "script"});

		request.done(function(data){
			var jsonData = JSON.parse(data);
      
			var tableHeaders = [];			
			var tableHeaderNames = [dropColName];

			addTableHeaders(tableHeaderNames);

			addTableColumnData(tableHeaders, jsonData);

		});
	}

	var addColumnsNew = function(dropColName, dropColString, dropColStringOld){

		$("#ordersReportTable thead tr").remove();
    $("#ordersReportTable tbody tr").remove();   

		var para={};
		// para.existing = dropColStringOld;		
    para.selected = dropColString;
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
			addTableHeaders(dropColumnCollection);

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

	var addTableColumnData = function(tableHeaders, jsonData){

		var $tbody = $("#ordersReportTable tbody");		
	
		var tableColumnNames = '';

		$.each(jsonData, function(count, item){
			tableColumnNames  += '<tr><td>' + item.name + '</td></tr>';
		});

		$tbody.append(tableColumnNames);

	}

	var addTableColumnsData = function(tableHeaders, jsonData){

		var $tbody = $("#ordersReportTable tbody");		
	
		var tableColumnNames = '';

		$.each(jsonData, function(count, item){
			tableColumnNames  += '<tr><td>' + item.name + '</td><td>' + item.id + '</td></tr>';
		});

		$tbody.append(tableColumnNames);

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
			addDragDrop();
			addDraggable();
		}
	}
	
}


