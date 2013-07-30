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

      var column = this.selectedColumns.find(this._getSortedColumn);
      // get sorted column info if any
      if(column){
        params.sort_param = column.get('internal_name');
        params.sort_direction = column.get('sort_direction');
      } else {
        // no column is sorted get the column which is associated with the first dimension
        var column = this._getDefaultColumnForSort();
          column.setSortDirection('asc');
        params.sort_param = column.get('internal_name');
        params.sort_direction =  column.get('sort_direction')
      };

      return params;
    },

    _fetchReportData: function() {
      if(!this.selectedColumns.isEmpty()) {
        this.fetch({data: this.toQueryParam("json")});
      }
    },

    _getSortedColumn: function(model) {
      return model.get('sort_direction') == 'asc' || model.get('sort_direction') == 'desc'
    },

    _getDefaultColumnForSort: function() {
      var dimension = this.selectedDimensions.at(0);
      var column = this.selectedColumns.findWhere({internal_name: dimension.get('default_column') });

      return column;
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
      paging: "#paging_region",
      schedule_report: "#schedule_report_region"
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
      this._initializeScheduleReport();
    },

    _initializeLayout: function() {
      this.detailRegion = new Report.DetailRegion();

      this.layout = new Report.Layout();
      this.detailRegion.show(this.layout);
      this.layout.addRegions({'schedule_report_modal': new Report.ModalRegion({el:'#schedule_report_modal'})});
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

    _initializeScheduleReport: function(){
      this.scheduleReportView = new Report.ScheduleReportView();
      this.scheduleReportView.on('open:schedule_report_modal', this._openScheduleReportModal, this);
      this.layout.schedule_report.show(this.scheduleReportView);
    },

    _intializeDimensions: function() {
      this.availableDimensions = new Report.DimensionList();
      this.availableDimensions.fetch();
      this.availableDimensionsView = new Report.AvailableDimensionsView({collection: this.availableDimensions});

      this.selectedDimensionsView = new Report.SelectedDimensionsView({collection:this.metadata.selectedDimensions});
      this.selectedDimensionsView.on('itemview:dimension:remove', this._onRemoveDimension, this);

      this.layout.available_dimensions.show(this.availableDimensionsView);
      this.layout.selected_dimensions.show(this.selectedDimensionsView);
    },

    _initializeColumns: function() {
      this.availableColumns = new Report.TableColumnList();
      this.availableColumns.fetch();
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
      // if deleted column is sorted then reset the sort direction
      column.resetSortDirection();
      this.availableDimensions.add(dimension);
      this.availableColumns.add(column);

      // if all the dimension deleted
      if (this.metadata.selectedDimensions.length === 1) {
        // reset the sort direction and then add the object
        this.metadata.selectedColumns.each(function(model) {
          model.resetSortDirection();
          this.availableColumns.add(model);
        },this);

        this.metadata.resetMetadata();
      } else {
        this.metadata.selectedColumns.remove(column);
      }

      this.metadata.selectedDimensions.remove(dimension);
    },

    _onTableColumnRemove: function(args) {
      // if deleted column is sorted then reset the sort direction
      args.model.resetSortDirection();
      this.metadata.selectedColumns.remove(args.model);
      this.availableColumns.add(args.model);
    },

    _onTableColumnSort: function(args) {
      var sortDirection = args.model.get('sort_direction');
      var column = this.metadata.selectedColumns.find(this._getSortedColumn);

      if (column) {
        column.resetSortDirection();
      }

      if(sortDirection){
        sortDirection = (sortDirection == 'asc') ? 'desc' : 'asc';
      } else{
        sortDirection = 'asc';
      }

      args.model.setSortDirection(sortDirection);
      // reset the paging view
      this.metadata.pagination.setTotalRecords(0);
      this.metadata._fetchReportData();
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
    },

    _getSortedColumn: function(model) {
      return model.get('sort_direction') == 'asc' || model.get('sort_direction') == 'desc'
    },

    _openScheduleReportModal: function() {
      var reportModal = new Report.ReportModel();
      var start_date = this.metadata.get('start_date').format('YYYY-MM-DD');
      var end_date = this.metadata.get('end_date').format('YYYY-MM-DD');
        reportModal.set({start_date: start_date, end_date: end_date});

      this.scheduleReportModalView = new Report.ScheduleReportModalView({model: reportModal});
      this.layout.schedule_report_modal.show(this.scheduleReportModalView);
    }

  });

})(ReachUI.namespace("Reports"));
