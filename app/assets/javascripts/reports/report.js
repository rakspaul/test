(function(Report) {
  'use strict';

  Report.Metadata = Backbone.Model.extend({
    defaults: {
      start_date: moment().subtract("days", 30),
      end_date: moment().subtract("days", 1),
    },

    url: '/reports/query.json',

    constructor: function() {
      this.selectedDimensions = new Report.DimensionList();
      this.selectedColumns = new Report.TableColumnList();
      this.pagination = new Report.Pagination();
      this.reportData = new Report.ResponseRowList();

      Backbone.Model.apply(this, arguments);
    },

    initialize: function() {
      this.on('change:start_date change:end_date', this._fetchReportData, this);
      this.selectedColumns.on('add', this._fetchReportData, this);
      this.selectedDimensions.on('remove', this._fetchReportData, this);
      this.pagination.on('change:current_page', this._fetchReportData, this);
    },

    addDimension: function(dimensions, columns) {
      this.selectedDimensions.add(dimensions);

      if(this.selectedColumns.length === 0) {
        this.selectedColumns.reset(columns);
        this._fetchReportData();
      } else {
        this.selectedColumns.add(columns);
      }
    },

    resetMetadata: function() {
      this.selectedColumns.reset();
      this.reportData.reset();
      this.pagination.setTotalRecords(0);
    },

    parse: function(response, options) {
      this.reportData.reset(response.records);

      if(this.pagination.get('total_records') <= 0) {
        this.pagination.setTotalRecords(response.total_records);
      }

      delete response.records;
      delete response.start_date;
      delete response.end_date;

      return response;
    },

    toQueryParam: function(report_type) {
      var params = {
        format: report_type,
        start_date: this.get("start_date").format('YYYY-MM-DD'),
        end_date: this.get("end_date").format('YYYY-MM-DD'),
        group: this.selectedDimensions.pluck("internal_id").join(','),
        cols: this.selectedColumns.pluck("internal_name").join(',')
      }

      if (report_type === "json") {
        params.limit = this.pagination.get('page_size');
        params.offset = this.pagination.getOffset();
      }

      return params;
    },

    _fetchReportData: function() {
      if(!this.selectedColumns.isEmpty()) {
        this.fetch({data: this.toQueryParam("json")});
      }
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
      available_columns: "#columns_region",
      report_options: "#report_options_region",
      selected_dimensions: '#selected_dimensions_region',
      report_table: "#report_table_region",
      paging: "#paging_region"
    },

    onDomRefresh: function() {
      var height = $(window).height() - 84 - 10; // 84 - window top to breadcrumb, 10 - content area margin
      this.$('.report-options .content').css({'min-height': height});
      this.$('.header').click(this._onHeaderClick);
    },

    _onHeaderClick: function(event) {
      $(event.target).next().slideToggle(300);
      $(event.target).find('i').toggleClass('icon-angle-down icon-angle-right');
    },
  });

  Report.ReportController = Marionette.Controller.extend({
    initialize: function() {
      this.metadata = new Report.Metadata();

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
        collection: this.metadata.reportData,
        columns: this.metadata.selectedColumns
      });

      this.tableLayout.head.show(this.tableHeadView);
      this.tableLayout.body.show(this.tableBodyView);

      this.tableLayout.on("item:drop", this._onItemDrop, this);
      this.tableBodyView.on("column:reorder", this._onColumnReorder, this);
    },

    _intializePagination: function() {
      this.paginationView = new Report.PaginationView({model:this.metadata.pagination});
      this.layout.paging.show(this.paginationView);
    },

    _initializeReportOptions: function() {
      this.reportOptionsView = new Report.ReportOptionsView();
      this.reportOptionsView.on('report:export', this._exportReport, this);
      this.layout.report_options.show(this.reportOptionsView);
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
        { name: 'DMA', internal_name: 'dma_name', is_removable: false, index: 15 }
      ]);
      this.availableColumns.comparator = function(column) {
        return column.get("index");
      };
      this.availableColumnsView = new Report.AvailableColumnsView({collection: this.availableColumns});
      this.layout.available_columns.show(this.availableColumnsView);
    },

    regenerateReport: function() {
      this._getReportData(true);
    },

    onPageChange: function() {
       this._getReportData(false);
    },

    _onItemDrop: function(dropItem, dropped_item){
      var dimension = this.availableDimensions.findWhere({name: dropItem}),
        columns = [];

      // ignore column drops if no dimensions are selected
      if(!dimension && this.metadata.selectedDimensions.length === 0) {
        dropped_item.show();
        return;
      }

      if(dimension) {
        var column = this.availableColumns.findWhere({internal_name: dimension.get('default_column') });
        if(column) {
          columns.push(column);
          this.availableColumns.remove(column);
        }

        if(this.metadata.selectedDimensions.length === 0) {
          var imps = this.availableColumns.findWhere({internal_name: 'impressions' }),
            clicks = this.availableColumns.findWhere({internal_name: 'clicks' });
          if(imps && clicks) {
            columns.push(imps);
            columns.push(clicks);
          }
        }

        this.metadata.addDimension(dimension, columns);

        this.availableColumns.remove([imps, clicks]);
        this.availableDimensions.remove(dimension);
      } else {
        var column = this.availableColumns.findWhere({name: dropItem });
        if(column) {
          var temp_dimension  = this.availableDimensions.findWhere({default_column: column.get('internal_name')});
          if(temp_dimension) {
            dropped_item.show();
            return;
          }
          this.metadata.selectedColumns.add(column);
          this.availableColumns.remove(column);
        }
      }
    },

    _onRemoveDimension: function(args) {
      var dimension = args.model,
        column = this.metadata.selectedColumns.findWhere({internal_name: dimension.get('default_column') });

      this.availableDimensions.add(dimension);
      this.availableColumns.add(column);

      // if all the dimension deleted
      if (this.metadata.selectedDimensions.length === 1) {
        this.availableColumns.add(this.metadata.selectedColumns.models);
        this.metadata.resetMetadata();
      } else {
        this.metadata.selectedColumns.remove(column);
      }

      this.metadata.selectedDimensions.remove(dimension);
    },

    _onTableColumnRemove: function(args) {
      this.metadata.selectedColumns.remove(args.model);
      this.availableColumns.add(args.model);
    },

    _onTableColumnSort: function(sort_field, sort_direction) {
      // this._getReportData(true);
    },

    _exportReport: function(report_type) {
      if(!this.metadata.selectedColumns.isEmpty()) {
        var para = this.metadata.toQueryParam(report_type);
        window.location = '/reports/query.'+ report_type +'?' + $.param(para);
      }
    },

    _onColumnReorder: function(columnsOrder){
      var reoderedColumns = [];

      for (var i = 0; i < columnsOrder.length; i++) {
        var column = this.metadata.selectedColumns.findWhere({ internal_name: columnsOrder[i] });
        reoderedColumns.push(column);
      };
      this.metadata.selectedColumns.reset(reoderedColumns);
    }
  });

})(ReachUI.namespace("Reports"));
