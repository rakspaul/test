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

      this.pagingMetaData = new Report.PagingMetaData();
      

      this.availableDimensions = new Report.DimensionList(this._initializeAvaliableDimensions());
      // this.selectedDimensions = new Report.DimensionList();

      // this.selectedColumns = new Report.TableColumnList();
      this.responseRowList = new Report.ResponseRowList();

      this.dateRangePicker = new Report.ReportDateRangePickerView({model: this.metadata});
      this.availableDimensionsView = new Report.AvailableDimensionsView({collection: this.availableDimensions});
      this.selectedDimensionsView = new Report.SelectedDimensionsView({collection:this.metadata.selectedDimensions});
      this.selectedDimensionsView.on('itemview:dimension:remove', this._onRemoveDimension, this);
      this.tableHeadView = new Report.TableHeadView({collection:this.metadata.selectedColumns});
      this.tableBodyView = new Report.TableBodyView({collection: this.responseRowList, columns: this.metadata.selectedColumns});
      this.pagingView = new Report.PagingView({model:this.pagingMetaData});

      this.layout.date_range_picker.show(this.dateRangePicker);
      this.layout.available_dimensions.show(this.availableDimensionsView);
      this.layout.selected_dimensions.show(this.selectedDimensionsView);

      this.layout.report_table.show(this.tableLayout);
      this.layout.paging.show(this.pagingView);
      this.pagingView.on('page:change', this.onPageChange, this);

      this.tableLayout.head.show(this.tableHeadView);
      this.tableLayout.body.show(this.tableBodyView);
 
      this.tableLayout.on("item:drop", this._onItemDrop, this);
      
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
        para.offset = this.pagingMetaData.getOffset();

      var self = this;
      var request = $.ajax({
        dataType: "json",
        url: "/reports/query.json",
        data: para
      });

      request.success(function(data){
        self.responseRowList.reset(new Report.ResponseRowList(data.records).toJSON());
        self.tableBodyView.setSelectedColumns(self.metadata.selectedColumns);
        if(update_paging) {
          self.pagingMetaData.setItemCount(data.total_records);
        }
      });
    },

    _onItemDrop: function(dropItem){
      this.model = this.availableDimensions.find(function(model) { 
        return model.get('name') == dropItem; 
      });

      this.is_dimension = this.model.get('is_dimension');

      if (this.is_dimension) {
         this.metadata.selectedDimensions.add(this.model);        
      }

      this.metadata.selectedColumns.add(this.model);
      this.availableDimensions.remove(this.model);
      this._getReportData(true);
    },

    _initializeAvaliableDimensions: function() {
      return [
        { name: 'Advertiser', internal_id:'advertiser_id', internal_name: 'advertiser_name', is_removable: false, is_dimension: true, index: 1 },
        { name: 'Order', internal_id:'order_id', internal_name: 'order_name', is_removable: false, is_dimension: true, index: 2 },
        { name: 'Ad', internal_id:'ad_id', internal_name: 'ad_name', is_removable: false, is_dimension: true, index: 3 },
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
      this.metadata.selectedDimensions.remove(args.model);
      this.metadata.selectedColumns.remove(args.model);
      this.availableDimensions.add(args.model);
    }
  });

})(ReachUI.namespace("Reports"));