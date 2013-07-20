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
      this.metadata = new Report.Metadata();
      this.metadata.on('change', this.regenerateReport, this);
      this.reportData = new Report.ResponseRowList();

      this._initializeLayout();

      this._initializeTableView();
      this._intializePagination();
      this._intializeDimensions();
      this._initializeDatePicker();
    },

    _initializeLayout: function() {
      this.detailRegion = new Report.DetailRegion();

      this.layout = new Report.Layout();
      this.detailRegion.show(this.layout);
    },

    _initializeDatePicker: function() {
      this.dateRangePicker = new Report.ReportDateRangePickerView({model: this.metadata});
      this.layout.date_range_picker.show(this.dateRangePicker);
    },

    _initializeTableView: function() {
      this.tableLayout = new Report.TableLayout();
      this.layout.report_table.show(this.tableLayout);

      this.tableHeadView = new Report.TableHeadView({collection:this.metadata.selectedColumns});
      this.tableBodyView = new Report.TableBodyView({
        collection: this.reportData,
        columns: this.metadata.selectedColumns});

      this.tableLayout.head.show(this.tableHeadView);
      this.tableLayout.body.show(this.tableBodyView);

      this.tableLayout.on("item:drop", this._onItemDrop, this);
    },

    _intializePagination: function() {
      this.pagination = new Report.Pagination();
      this.paginationView = new Report.PaginationView({model:this.pagination});
      this.paginationView.on('page:change', this.onPageChange, this);

      this.layout.paging.show(this.paginationView);
    },

    _intializeDimensions: function() {
      this.availableDimensions = new Report.DimensionList([
        { name: 'Advertiser', internal_id:'advertiser_id', internal_name: 'advertiser_name', index: 1 },
        { name: 'Order', internal_id:'order_id', internal_name: 'order_name', index: 2 },
        { name: 'Ad', internal_id:'ad_id', internal_name: 'ad_name', index: 3 },
      ]);
      this.availableDimensionsView = new Report.AvailableDimensionsView({collection: this.availableDimensions});

      this.selectedDimensionsView = new Report.SelectedDimensionsView({collection:this.metadata.selectedDimensions});
      this.selectedDimensionsView.on('itemview:dimension:remove', this._onRemoveDimension, this);

      this.layout.available_dimensions.show(this.availableDimensionsView);
      this.layout.selected_dimensions.show(this.selectedDimensionsView);
    },

    regenerateReport: function() {
      this._getReportData(true);
    },

    onPageChange: function() {
       this._getReportData(false);
    },

    _getReportData: function(update_paging) {

      var para = {};
        para.start_date = this.metadata.get("start_date").format('YYYY-MM-DD');
        para.end_date = this.metadata.get("end_date").format('YYYY-MM-DD');
        para.group = this.metadata.selectedDimensions.pluck("internal_id").join(',');
        para.cols = this.metadata.selectedColumns.pluck("internal_name").join(',');
        para.limit = 50;
        para.format = "json";
        para.offset = this.pagination.getOffset();

      var self = this;
      var request = $.ajax({
        dataType: "json",
        url: "/reports/query.json",
        data: para
      });

      request.success(function(data){
        self.reportData.reset(new Report.ResponseRowList(data.records).toJSON());
        self.tableBodyView.setSelectedColumns(self.metadata.selectedColumns);
        if(update_paging) {
          self.pagination.setTotalRecords(data.total_records);
        }
      });
    },

    _onItemDrop: function(dropItem){
      this.model = this.availableDimensions.find(function(model) {
        return model.get('name') == dropItem;
      });

      this.metadata.selectedDimensions.add(this.model);

      this.metadata.selectedColumns.add(this.model);
      this.availableDimensions.remove(this.model);
      this._getReportData(true);
    },

    _initializeAvaliableDimensions: function() {
      return [
        { name: 'Advertiser', internal_id:'advertiser_id', internal_name: 'advertiser_name', index: 1 },
        { name: 'Order', internal_id:'order_id', internal_name: 'order_name', index: 2 },
        { name: 'Ad', internal_id:'ad_id', internal_name: 'ad_name', index: 3 },
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
      this.metadata.selectedDimensions.remove(args.model);
      this.metadata.selectedColumns.remove(args.model);
      this.availableDimensions.add(args.model);
    }
  });

})(ReachUI.namespace("Reports"));
