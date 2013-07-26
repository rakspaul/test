(function(Report) {
  'use strict';

  Report.ReportDateRangePickerView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/date_range_picker'],

    initialize: function() {
      this.model.on('change:start_date change:end_date', this._onDateChanged, this);
      _.bindAll(this, '_onDateSelected');
    },

    onRender: function() {
      this.$el.daterangepicker(this._defaults(), this._onDateSelected);

      //Set the initial state of the picker label
      this._updateDateView(this.model.get('start_date'), this.model.get('end_date'));
    },

    onClose: function() {
      this.$el.daterangepicker('destroy');
    },

    _defaults: function() {
      return {
        ranges: {
           'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
           'Last 7 Days': [moment().subtract('days', 7), moment().subtract('days', 1)],
           'Last 30 Days': [moment().subtract('days', 30), moment().subtract('days', 1)],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        },
        format: 'YYYY-MM-DD',
        separator: ' to ',
        startDate: moment().subtract('days', 30),
        endDate: moment().subtract('days', 1),
        showWeekNumbers: true,
        dateLimit: false,
        locale: {
          clearLabel: 'Close'
        }
      };
    },

    _onDateSelected: function(start, end) {
      if(start && end) {
        this.model.set({start_date: start, end_date: end});
      }
    },

    _onDateChanged: function(model) {
      this._updateDateView(model.get('start_date'), model.get('end_date'));
    },

    _updateDateView: function(start, end) {
      this.$('span').html(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    }
  });
})(ReachUI.namespace("Reports"));
