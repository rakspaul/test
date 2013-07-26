(function(Report) {
  'use strict';

  Report.ScheduleReportView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/schedule_report'],

    initialize: function(){
      this.bindUIElements();
    },

    events: {
      'change input[name="endsOnRadio"]' : 'endsOnRadioClick'
    },

    ui: {
      select_end_date : '#select_end_date',
      report_dates : '#report_dates'
    },

    onRender: function(){
      this._updateScheduleReportView(this.model.get('start_date'), this.model.get('end_date'));
    },

    _updateScheduleReportView: function(start, end){
      this.ui.report_dates.val(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    },

    endsOnRadioClick: function(event){
      var selected = $(event.target).val();
      if(selected == 'end_date'){
        this.ui.select_end_date.removeAttr("disabled");
      }
      else{
        this.ui.select_end_date.attr("disabled", "disabled");
      }
    },

  });
})(ReachUI.namespace("Reports"));