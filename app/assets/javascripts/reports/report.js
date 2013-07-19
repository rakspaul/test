(function(Report) {
  'use strict';

  Report.Metadata = Backbone.Model.extend({
    defaults: {
      start_date: moment().subtract("days", 30),
      end_date: moment().subtract("days", 1),
    },

    constructor: function() {
      this.selectedDimensions = new Report.DimensionList();
      this.selectedColumns = new Report.TableColumnList();

      Backbone.Model.apply(this, arguments);
    },

    getSelectedColumnsList: function() {
      return this.get("selectedColumns");
    },

  });

  Report.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  Report.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/reports/report_layout'],

    regions: {
      date_range_picker: '#date_range_region',
      available_dimensions: "#available_dimensions_region",
      selected_dimensions: '#selected_dimensions_region',
      report_table: "#report_table_region",
      paging: "#paging_region"
    }
  });

  Report.ReportController = Marionette.Controller.extend({
    initialize: function() {

      this.layout = new Report.Layout();
      this.detailRegion = new Report.DetailRegion();
      this.detailRegion.show(this.layout);
      this.tableLayout = new Report.TableLayout();

      this.metadata = new Report.Metadata();
      this.metadata.on('change', this.regenerateReport, this);

      this.availableDimensions = new Report.DimensionList(this._initializeAvaliableDimensions());
      this.selectedDimensions = new Report.DimensionList();

      this.selectedColumns = new Report.TableColumnList();
      this.responseRowList = new Report.ResponseRowList();

      this.dateRangePicker = new Report.ReportDateRangePickerView({model: this.metadata});
      this.availableDimensionsView = new Report.AvailableDimensionsView({collection: this.availableDimensions});
      this.selectedDimensionsView = new Report.SelectedDimensionsView({collection:this.selectedDimensions});
      this.selectedDimensionsView.on('itemview:dimension:remove', this._onRemoveDimension, this);
      this.tableHeadView = new Report.TableHeadView({collection:this.selectedColumns});
      this.tableBodyView = new Report.TableBodyView({collection: this.reportList, columns: this.selectedColumns});

      this.layout.date_range_picker.show(this.dateRangePicker);
      this.layout.available_dimensions.show(this.availableDimensionsView);
      this.layout.selected_dimensions.show(this.selectedDimensionsView);

      this.layout.report_table.show(this.tableLayout);
      this.tableLayout.head.show(this.tableHeadView);
      this.tableLayout.body.show(this.tableBodyView);
 
      this.tableLayout.on("item:drop", this._onItemDrop, this);
      
    },

    regenerateReport: function() {

    },

    _onItemDrop: function(dropItem){
      this.model = this.availableDimensions.find(function(model) { 
        return model.get('name') == dropItem; 
      });

      this.is_dimension = this.model.get('is_dimension');

      if (this.is_dimension) {
        this.selectedDimensions.add(this.model);        
      }

      this.selectedColumns.add(this.model);       
      this.availableDimensions.remove(this.model);
    },

    _initializeAvaliableDimensions: function() {
      return [
        { name: 'Advertiser', internal_name: 'advertiser_name', is_removable: false, is_dimension: true, index: 1 },
        { name: 'Order', internal_name: 'order_name', is_removable: false, is_dimension: true, index: 2 },
        { name: 'Ad', internal_name: 'ad_name', is_removable: false, is_dimension: true, index: 3 },
        { name: 'PCCR %', internal_name: 'pccr', is_removable: false, is_dimension: false, index: 4 },
        { name: 'Total Actions', internal_name: 'actions', is_removable: false, is_dimension: false, index: 5 },
        { name: 'Gross Rev', internal_name: 'gross_rev', is_removable: false, is_dimension: false, index: 6 },
        { name: 'Gross eCPM', internal_name: 'gross_ecpm', is_removable: false, is_dimension: false, index: 7 }
      ];
    },

    _initializeSelectedColumns: function(){
       return [
        { name: 'Impressions', internal_name: 'impressions', is_removable: false, is_dimension: false, index: 1 },
        { name: 'Clicks', internal_name: 'clicks', is_removable: false, is_dimension: false, index: 2 },
        { name: 'CTR %', internal_name: 'ctr', is_removable: false, is_dimension: false, index: 3 },
      ];
    },

    _onRemoveDimension: function(args) {
      this.selectedDimensions.remove(args.model);
      this.selectedColumns.remove(args.model);
      this.availableDimensions.add(args.model);
    }
  });

})(ReachUI.namespace("Reports"));