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
      end_date : '#end_date',
      report_dates : '#report_dates'
    },

    onRender: function(){
      this._updateScheduleReportView(this.model.get('start_date'), this.model.get('end_date'));
    },

    onDomRefresh: function(){
      $('#start_date, #end_date').datepicker({
        format: 'yyyy-mm-dd'
      });
    },

    _updateScheduleReportView: function(start, end){
      this.ui.report_dates.val(start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    },

    endsOnRadioClick: function(event){
      var selected = $(event.target).val();
      if(selected == 'end_date'){
        this.ui.end_date.removeAttr("disabled");
      }
      else{
        this.ui.end_date.attr("disabled", "disabled");
        this.ui.end_date.val('');
      }
    },

  });
})(ReachUI.namespace("Reports"));