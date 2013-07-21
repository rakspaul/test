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
    }
  });

  Report.DetailRegion = Backbone.Marionette.Region.extend({
    el: "#details.content"
  });

  Report.Layout = Backbone.Marionette.Layout.extend({
    template: JST['templates/reports/report_layout'],

    regions: {
      date_range_picker: '#date_range_region',
      available_dimensions: "#available_dimensions_region",
      available_columns: "#columns_region",
      report_options: "#report_options_region",
      selected_dimensions: '#selected_dimensions_region',
      report_table: "#report_table_region",
      paging: "#paging_region"
    },

    onDomRefresh: function() {
      var height = $(window).height() - 84 - 10; // 84 - window top to breadcrumb, 10 - content area margin
      this.$('.report-options .content').css({'min-height': height});
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
      this._initializeColumns();
      this._initializeDatePicker();
      this._initializeReportOptions();
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
      this.tableHeadView.on('itemview:column:sort', this._onTableColumnSort, this);
      this.tableHeadView.on('itemview:column:remove', this._onTableColumnRemove, this);
      this.tableBodyView = new Report.TableBodyView({
        collection: this.reportData,
        columns: this.metadata.selectedColumns
      });

      this.tableLayout.head.show(this.tableHeadView);
      this.tableLayout.body.show(this.tableBodyView);

      this.tableLayout.on("item:drop", this._onItemDrop, this);
      this.tableBodyView.on("column:reorder", this._onColumnReorder, this);
    },

    _intializePagination: function() {
      this.pagination = new Report.Pagination();
      this.pagination.on('change:current_page', this.onPageChange, this);
      this.paginationView = new Report.PaginationView({model:this.pagination});

      this.layout.paging.show(this.paginationView);
    },

    _intializeDimensions: function() {
      this.availableDimensions = new Report.DimensionList([
        { name: 'Advertiser', internal_id:'advertiser_id', default_column: 'advertiser_name', index: 1 },
        { name: 'Order', internal_id:'order_id', default_column: 'order_name', index: 2 },
        { name: 'Ad', internal_id:'ad_id', default_column: 'ad_name', index: 3 },
        { name: 'DMA', internal_id:'dma_id', default_column: 'dma_name', index: 4 },
      ]);
      this.availableDimensionsView = new Report.AvailableDimensionsView({collection: this.availableDimensions});

      this.selectedDimensionsView = new Report.SelectedDimensionsView({collection:this.metadata.selectedDimensions});
      this.selectedDimensionsView.on('itemview:dimension:remove', this._onRemoveDimension, this);

      this.layout.available_dimensions.show(this.availableDimensionsView);
      this.layout.selected_dimensions.show(this.selectedDimensionsView);
    },

    _initializeReportOptions: function() {
      this.reportOptionsView = new Report.ReportOptionsView();
      this.reportOptionsView.on('report:export', this._exportReport, this);
      this.layout.report_options.show(this.reportOptionsView);
    },

    _initializeColumns: function() {
      this.availableColumns = new Report.TableColumnList([
        { name: 'Advertiser Name', internal_name: 'advertiser_name', is_removable: false, index: 1 },
        { name: 'Order Name', internal_name: 'order_name', is_removable: false, index: 2 },
        { name: 'Ad Name', internal_name: 'ad_name', is_removable: false, index: 3 },
        { name: 'Ad Start', internal_name: 'ad_start', is_removable: true, index: 4 },
        { name: 'Ad End', internal_name: 'ad_end', is_removable: true, index: 5 },
        { name: 'Ad Starts', internal_name: 'ad_starts', is_removable: true, index: 6 },
        { name: 'Impressions', internal_name: 'impressions', is_removable: true, index: 7, format:'number' },
        { name: 'Clicks', internal_name: 'clicks', is_removable: true, index: 8, format:'number' },
        { name: 'CTR %', internal_name: 'ctr', is_removable: true, index: 9, format:'number', precision: 4 },
        { name: 'PCCR %', internal_name: 'pccr', is_removable: true, index: 10, format:'number', precision: 4 },
        { name: 'Action Rate', internal_name: 'action_rate', is_removable: true, index: 11, format:'number', precision: 4 },
        { name: 'Total Actions', internal_name: 'actions', is_removable: true, index: 12, format:'number' },
        { name: 'Gross Rev', internal_name: 'gross_rev', is_removable: true, index: 13, format:'number' },
        { name: 'Gross eCPM', internal_name: 'gross_ecpm', is_removable: true, index: 14, format:'number' },
        { name: 'DMA', internal_name: 'dma_name', is_removable: true, index: 15 }
      ]);
      this.availableColumnsView = new Report.AvailableColumnsView({collection: this.availableColumns});
      this.layout.available_columns.show(this.availableColumnsView);
    },

    regenerateReport: function() {
      this._getReportData(true);
    },

    onPageChange: function() {
       this._getReportData(false);
    },

    _getReportData: function(update_paging) {

      var para = this._getQueryParam('json');
        para.limit = 50;
        para.offset = !update_paging ? this.pagination.getOffset() : 0;

      var self = this;
      var request = $.ajax({
        dataType: "json",
        url: "/reports/query.json",
        data: para
      });

      request.success(function(data) {
        self.reportData.reset(new Report.ResponseRowList(data.records).toJSON());
        self.tableBodyView.setSelectedColumns(self.metadata.selectedColumns);
        if(update_paging) {
          self.pagination.setTotalRecords(data.total_records);
        }
      });
    },

    _getQueryParam: function(format) {
      var para = {};
        para.start_date = this.metadata.get("start_date").format('YYYY-MM-DD');
        para.end_date = this.metadata.get("end_date").format('YYYY-MM-DD');
        para.group = this.metadata.selectedDimensions.pluck("internal_id").join(',');
        para.cols = this.metadata.selectedColumns.pluck("internal_name").join(',');
        para.format = format;
        return para;
    },

    _onItemDrop: function(dropItem, dropped_item){
      var dimension = this.availableDimensions.findWhere({name: dropItem}),
        column = null;

      // ignore column drops if no dimensions are selected
      if(!dimension && this.metadata.selectedDimensions.length === 0) {
        dropped_item.show();
        return;
      }

      if(dimension) {
        this.metadata.selectedDimensions.add(dimension);
        this.availableDimensions.remove(dimension);
        column = this.availableColumns.findWhere({internal_name: dimension.get('default_column') })
      } else {
        column = this.availableColumns.findWhere({name: dropItem });
      }

      this.metadata.selectedColumns.add(column);
      this.availableColumns.remove(column);

      // this is first dimension, therefore add default columns with it
      if(this.metadata.selectedDimensions.length === 1) {
        var imps = this.availableColumns.findWhere({internal_name: 'impressions' }),
          clicks = this.availableColumns.findWhere({internal_name: 'clicks' })
        if(imps && clicks) {
          this.metadata.selectedColumns.add([imps, clicks]);
          this.availableColumns.remove([imps, clicks]);
        }
      }

      this._getReportData(true);
    },

    _onRemoveDimension: function(args) {
      var dimension = args.model,
        column = this.metadata.selectedColumns.findWhere({internal_name: dimension.get('default_column') });

      this.metadata.selectedDimensions.remove(dimension);

      this.metadata.selectedColumns.remove(column);
      this.availableDimensions.add(dimension);
      this.availableColumns.add(column);
      // if all the dimension deleted
      if (this.metadata.selectedDimensions.isEmpty({})) {
        this.availableColumns.add(this.metadata.selectedColumns.toJSON());
        this.metadata.selectedColumns.reset();
        this.reportData.reset(new Report.ResponseRowList().toJSON());
        this.pagination.setTotalRecords(0);
      }
      else {
        this._updateTableBodyView();
        this._getReportData(true);
      }
    },

    _onTableColumnRemove: function(args) {
      var column = args.model;
      this.metadata.selectedColumns.remove(column);
      this.availableColumns.add(column);
      this._updateTableBodyView();
      this._getReportData(true);
    },

    _updateTableBodyView: function() {
      this.tableBodyView.setSelectedColumns(this.metadata.selectedColumns);
    },

    _onTableColumnSort: function(sort_field, sort_direction) {
      // this._getReportData(true);
    },

    _exportReport: function(report_type) {
      var para = this._getQueryParam(report_type);
      window.location = '/reports/query.'+ report_type +'?' + $.param(para);
    },

    _onColumnReorder: function(columnsOrder){
      var reoderedColumns = new Report.TableColumnList();

      for (var i = 0; i < columnsOrder.length; i++) {
        var column = this.metadata.selectedColumns.findWhere({ internal_name: columnsOrder[i] });
        reoderedColumns.add(column);
      };
      this.metadata.selectedColumns.reset(reoderedColumns.toJSON());
    },

  });

})(ReachUI.namespace("Reports"));
