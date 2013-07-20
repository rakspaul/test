(function(Report) {
  'use strict';

  Report.ReportOptionsView = Backbone.Marionette.ItemView.extend({
    template: _.template('<a id="export_excel" class="btn btn-mini btn-primary">Excel</a> <a id="export_csv" class="btn btn-mini btn-primary">CSV</a> <a id="share_report" class="btn btn-mini btn-primary">Email</a>'),
    events: {
      'click #export_excel' : 'onExportExcelClick',
      'click #export_csv' : 'onExportCSVClick',
    },

    onExportExcelClick: function(args) {
      this.trigger('report:export', 'xls');
    },

    onExportCSVClick: function(args) {
      this.trigger('report:export', 'csv');
    },


  });
})(ReachUI.namespace("Reports"));
