// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {

  // ********************************************************** Models ****************************************

  var Dimension = Backbone.Model.extend({
      setId: function (value) {
        this.set({id: value});
      },
      setDisplayName: function(value) {
        this.set({displayName: value});
      },
      getId: function() {
        return this.get("id");
      }
  });

  // ********************************************************** Collection ***********************************

  var DimensionsList = Backbone.Collection.extend({
      model: Dimension,
  });

  // ********************************************************** Views ****************************************  

  var ReportLayout = Backbone.Marionette.Layout.extend({
      template: JST['templates/reports/report_layout'],

      regions: {
        dimensions: "#selected_dimensions",
        report_table: "#report_table"
      }
  });

  var SelectedDimension = Backbone.Marionette.ItemView.extend({
      template: JST['templates/reports/dimension_list_item'],
      className: "selected-dimension-btn",
      triggers: {
        'click': 'delete'
      }
  });

  var SelectedDimensionsView = Backbone.Marionette.CollectionView.extend({
      itemView: SelectedDimension,
  });

  // ********************************************************************************************************

  var initializeDragDrop = function() {
    $( "#draggable ul.dimensions-list li" ).draggable({
      revert: true      
    });

    $("#droppable").droppable({
      accept: "#draggable ul.dimensions-list li",
      tolerance: "pointer",
      drop: function( event, item ) {
        dropedItem = item.draggable;
        var id = dropedItem.attr("data-field-name");
        var displayName = dropedItem.text();
        var isDimension = dropedItem.attr("data-dimension") === "true" ? true : false;
        if (isDimension) {
          selected_dimensions.push({id: id, displayName: displayName});
        } else {
          // its a column           
        }
        toggleAccordionItemState(id, false);
        $(".dimensions-list li.hide").show();
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

  var dimensionsAccordionClickHandler = function(){
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

  var toggleAccordionItemState = function(id, visible) {
    if(visible) {
      $(".dimensions-list li[data-field-name="+ id +"]").show();
    } else {
      $(".dimensions-list li[data-field-name="+ id +"]").hide();
    }
  }

  var onDeleteDimension = function(view) {
    var model = view.model;
    toggleAccordionItemState(model.getId(), true);
    selected_dimensions.remove(view.model);
    if (selected_dimensions.length < 1) {
      $(".dimensions-list li.hide").hide();
    }
  }

  var report_ui,
    reportLayout,
    selected_dimensions,
    selected_dimensions_view;
  var initialize = function(){

    initializeDateRangePicker();
    initializeDragDrop();
    dimensionsAccordionClickHandler();

    report_ui = new Backbone.Marionette.Application();
    report_ui.addRegions({
      mainRegion: "#droppable-inner"
    });

    reportLayout = new ReportLayout();
    report_ui.mainRegion.show(reportLayout);

    selected_dimensions = new DimensionsList();
    selected_dimensions_view = new SelectedDimensionsView({collection:selected_dimensions})
    selected_dimensions_view.on("itemview:delete", onDeleteDimension);
    reportLayout.dimensions.show(selected_dimensions_view);
  }

  return {
    init: function(){      
      initialize();
    }
  }
}