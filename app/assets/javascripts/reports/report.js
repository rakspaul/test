// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

ReachUI.namespace("Reports");

ReachUI.Reports.Dimensions = function() {

  // ********************************************************** Models ****************************************

  var Dimension = Backbone.Model.extend({
      setDisplayName: function(value) {
        this.set({displayName: value});
      },

      getFieldName: function() {
        return this.get("fieldName");
      },

      getGroupId: function() {
        return this.get("groupId");
      },

  });

  var Report = Backbone.Model.extend({
    defaults: {
      start_date: moment().subtract("days", 30).format('YYYY-MM-DD'),
      end_date: moment().subtract("days", 1).format('YYYY-MM-DD'),
      dimensions: null,
      report_data: null,
      columns: ["impressions", "clicks", "ctr"],
    },

    addDimension: function(model) {
      this.get("dimensions").push(model);
    },

    removeDimension: function(model) {
      this.get("dimensions").remove(model);
    },

    getDimensionLength: function() {
      return this.get("dimensions").length;
    },

    getDimensions: function() {
      return this.get("dimensions");
    },

    getColumns: function() {
      return this.get("columns");
    },

    setStartDate: function(start_date) {
      this.set({start_date: start_date});
    },

    setEndDate: function(end_date) {
      this.set({end_date: end_date});
    },

    getStartDate: function() {
      return this.get("start_date");
    },

    getEndDate: function() {
      return this.get("end_date");
    },

    setReportData: function(report_data) {
      this.set({report_data: report_data});
    },

    getReportData: function() {
      return this.get("report_data");
    },

    getReportTableColumns: function() {
      return this.get("columns");
    },

    getQueryString: function() {
      var str ='';
      var dimensions = [];
      var dimensionColumns = [];
      this.getDimensions().each(function(dimension){
        dimensions.push(dimension.getGroupId());
        dimensionColumns.push(dimension.getFieldName());
      });

      str = "group=" + dimensions.join(",");
      str += "&cols=" + dimensionColumns.join(",") +","+ this.getColumns().join(",");
      str += "&start_date=" + this.getStartDate();
      str += "&end_date=" + this.getEndDate();

      return str;
    },

  });

  // ********************************************************** Collection ***********************************

  var DimensionsList = Backbone.Collection.extend({
      model: Dimension,
  });

  var ReportData = Backbone.Collection.extend({

  });

  // ********************************************************** Views ****************************************  

  var ReportLayout = Backbone.Marionette.Layout.extend({
      template: JST['templates/reports/report_layout'],

      regions: {
        dimensions: "#selected_dimensions_region",
        report_table: "#report_table_region"
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

  var ReportTableRowView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/report_table_row'],
    tagName: "tr",
    serializeData: function(){
        var data = {};
        data.columns = this.options.columns;
        data.model = this.model.toJSON();
        return data
    }
  });

  var ReportTableView = Backbone.Marionette.CompositeView.extend({
    tagName: "table",
    template: JST['templates/reports/report_table'],
    itemView: ReportTableRowView,
    
    initialize: function(){
        this.collection = this.model.getReportData();
    },
     serializeData: function(){
        var data = {};
        data.collection = this.collection;
        data.columns = this.model.getReportTableColumns();
        return data
    },
    
    buildItemView: function(item, ItemView){
        var view = new ItemView({
            model: item,
            columns:this.model.getReportTableColumns(),
        });
        return view;
    },
 
    appendHtml: function(collectionView, itemView){
        collectionView.$("tbody").append(itemView.el);
    }
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
        var field_name = dropedItem.attr("data-field-name");
        var displayName = dropedItem.text();
        var group_id = dropedItem.attr("data-group-id");
        var isDimension = dropedItem.attr("data-dimension") === "true" ? true : false;
        if (isDimension) {
          report.addDimension({fieldName: field_name, displayName: displayName, groupId: group_id});
          getReportData();
        } else {
          // its a column           
        }
        toggleAccordionItemState(field_name, false);
        $(".dimensions-list li.hide").show();
      }
    });
  }

  var initializeDateRangePicker = function() {
    $('#report_date').daterangepicker(
    {
      ranges: {
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
      showWeekNumbers: true,
      buttonClasses: ['btn-danger'],
      dateLimit: false
    },
      function(start, end) {
        $('#report_date span').html(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        report.setStartDate(start.format('YYYY-MM-DD'));
        report.setEndDate(end.format('YYYY-MM-DD'));
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

  var toggleAccordionItemState = function(name, visible) {
    if(visible) {
      $(".dimensions-list li[data-field-name="+ name +"]").show();
    } else {
      $(".dimensions-list li[data-field-name="+ name +"]").hide();
    }
  }

  var onDeleteDimension = function(view) {
    var model = view.model;
    toggleAccordionItemState(model.getFieldName(), true);
    report.removeDimension(view.model);
    if (report.getDimensionLength() < 1) {
      $(".dimensions-list li.hide").hide();
    } else {
      getReportData();
    }
  }

  var getReportData = function() {
    $.ajax({
      dataType: "json",
      url: "/reports/query.json",
      data: report.getQueryString() + "&limit=50&offset=0&format=json"
      });
  }

  var report_ui,
    reportLayout,
    report,
    selected_dimensions_view,
    report_table_view;
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

    report = new Report({
      dimensions: new DimensionsList(),
    });

    selected_dimensions_view = new SelectedDimensionsView({collection:report.getDimensions()})
    selected_dimensions_view.on("itemview:delete", onDeleteDimension);
    reportLayout.dimensions.show(selected_dimensions_view);

    report_table_view = new ReportTableView({model:report});
    reportLayout.report_table.show(report_table_view);    
  }

  return {
    init: function(){      
      initialize();
    }
  }
}