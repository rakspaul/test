// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {
  
  var addDragDrop = function() {
    $( "#draggable ul.dimensions-list li" ).draggable({
      revert: true      
    });
    $("#droppable").droppable({
      accept: "#draggable ul.dimensions-list li",
      tolerance: "pointer",
      drop: function( event, ui ) {
        dropItem = ui.draggable;
        dropItem.hide();   
      }
    });
  }

  var initializeDateRangePicker = function() {
    $('#report_date').daterangepicker(
    {
      ranges: {
         'Today': [new Date(), new Date()],
         'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
         'Last 7 Days': [moment().subtract('days', 7), moment().subtract('days', 1)],
         'Last 30 Days': [moment().subtract('days', 30), moment().subtract('days', 1)],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
      },
      opens: 'left',
      format: 'YYYY-MM-DD',
      separator: ' to ',
      startDate: moment().subtract('days', 30),
      endDate: moment().subtract('days', 1),
      maxDate: moment().subtract('days', 1),
      showWeekNumbers: true,
      buttonClasses: ['btn-danger'],
      dateLimit: false
    },
      function(start, end) {
        $('#report_date span').html(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
      }
    );
    //Set the initial state of the picker label
    $('#report_date span').html(moment().subtract('days', 30).format('YYYY-MM-DD') + ' to ' + moment().subtract('days', 1).format('YYYY-MM-DD'));
  }

  var dimensionsAccordion = function(){
    $(".dimensions-header").click(function(){
      if($(this).next().is(":visible")){
        $(".dimensions-header").find("span").removeClass('arrow-up');
        $(this).find("span").removeClass('arrow-up').addClass('arrow-down');
        $(this).next().slideUp('fast');
      } else {
        $(".dimensions-body").slideUp();
        $(this).next().slideToggle('fast');
        $(".dimensions-header").find("span").removeClass('arrow-up').addClass('arrow-down');        
        $(this).find("span").toggleClass('arrow-up').toggleClass('arrow-down');
      }
    });
  }

  var intialize = function(){
    initializeDateRangePicker();
    addDragDrop(); 
    dimensionsAccordion();   
  }

  return {
    init: function(){      
      intialize();
    }
  }
}