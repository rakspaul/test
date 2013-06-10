// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
	
	var addDragDrop = function(){
		
		var tabColumn = 0;
		var dropColName = null;
		var dropColString = null;
	
		//Drag Starts
		$( "#draggable ul li" ).draggable({
			revert: true,
			drag: function( event, ui ) {
				//console.log('drag starts');
			},
			stop: function( event, ui ) {
				console.log('stop');
			}
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
									
				var containsHeaders = $("#ordersReportTable thead th").length;

				if(containsHeaders){
					addColumnsNew(dropColName, dropColString);
				}
				else{
					addColumnNew(dropColName, dropColString);
				}

			}
		});
	}

	var addColumnNew = function(dropColName, dropColString){
						
		var url = "/reports/"+dropColString+".json";
		var requestJson = $.get(url);

		requestJson.done(function(data){

      var tr = $("<tr>")
      var th = $("<th>");
      th.html(dropColName);
      th.appendTo(tr);
      tr.appendTo("#ordersReportTable thead");

	  	$.each(data, function(i, item){
		    
        var tr = $("<tr>");
				var td = $("<td>");
				td.html(item.name);
				td.appendTo(tr);  					
				
				tr.appendTo("#ordersReportTable tbody");

			});
		});
	}

	var addColumnsNew = function(dropColName, dropColString){

		dropColString = "orders";

		$("#ordersReportTable thead tr").remove();
    $("#ordersReportTable tbody tr").remove();

    var url = "/reports/"+dropColString+".json";
    var requestJson = $.get(url);

    requestJson.done(function(data){
   		
   		var tr = $("<tr>")

      var th = $("<th>");
      th.html("Advertisers");
      th.appendTo(tr);

      var th1 = $("<th>");
      th1.html("Orders");
      th1.appendTo(tr);

      tr.appendTo("#ordersReportTable thead");

	  	$.each(data, function(i, item){
		    
        var tr = $("<tr>");
				
				var td = $("<td>");
				td.html(item.advertiser.name);
				td.appendTo(tr);  						

					var td1 = $("<td>");
				td1.html(item.name);
				td1.appendTo(tr);

				tr.appendTo("#ordersReportTable tbody");

			});
    });
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


