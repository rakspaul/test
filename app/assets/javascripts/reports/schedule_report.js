(function(Report) {
  'use strict';

  Report.ReportModel = Backbone.Model.extend({
    url: '/reports/schedule_reports/',
    defaults: {
      title: '',
      emails: '',
      start_date: '',
      end_date: '',
      recalculate_dates: false,
      report_start_date: moment().add("days", 1).format('YYYY-MM-DD'),
      report_end_date: '',
      groups: null,
      cols: null,
      sort_param: '',
      sort_direction: '',
      frequency_type: 'Everyday',
      frequency_value: 1,
    },

    toJSON: function() {
      return { report_schedule: _.clone(this.attributes) };
    }
  });

  Report.ModalRegion = Backbone.Marionette.Region.extend({

    constructor: function(){
      _.bindAll(this);
      this.ensureEl();
      Marionette.Region.prototype.constructor.apply(this, arguments);
    },

    getEl: function(selector){
      var $el = $(selector);
      $el.on("hidden", this.close);
      return $el;
    },

    onShow: function(view){
      view.on("close", this.hideModal, this);
      this.$el.modal('show');
    },

    hideModal: function(){
      this.$el.modal('hide');
    }
  });


  Report.ScheduleReportView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/schedule_report'],

    triggers: {
      'click #schedule_report' : 'open:schedule_report_modal',
    },

  });

  Report.ScheduleReportModalView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/schedule_report_modal'],
    className: 'modal schedule-report-modal',

    initialize: function(){
      this.bindUIElements();
      _.bindAll(this);
    },

    events: {
      'change input[name="endsOnRadio"]' : 'endsOnRadioClick',
      'change input[name="frequencyRadio"]' : 'frequencyRadioClick',
      'click #save_report' : 'saveReport'
    },

    ui: {
      report_dates : '#report_dates',
      title : '#title',
      emails: '#emails',
      report_start_date: '#report_start_date',
      report_end_date: '#report_end_date',
      report_specific_days: '#report_specific_days'
    },

    onDomRefresh: function(){
      this.ui.report_start_date.datepicker(this._date_options()).on('changeDate', this.onStartDateChange);
      this.ui.report_end_date.datepicker(this._date_options()).on('changeDate', this.onEndDateChange);
      this.ui.report_specific_days.datepicker(this._date_options_specific());
    },

    _date_options: function() {
      return {
        format: 'yyyy-mm-dd',
        startDate: moment().add("days", 1).format('YYYY-MM-DD'),
        autoclose: true,
      }
    },

    _date_options_specific: function() {
      return {
        format: 'yyyy-mm-dd',
        startDate: moment().add("days", 1).format('YYYY-MM-DD')
      }
    },

    onStartDateChange: function(event) {
      this.ui.report_end_date.datepicker('setStartDate', moment(event.date).format('YYYY-MM-DD'));
      this.model.set({report_start_date: moment(event.date).format('YYYY-MM-DD')});
      this.model.set({report_end_date: moment(event.date).format('YYYY-MM-DD')});
    },

    onEndDateChange: function(event){
      this.ui.report_end_date.val(moment(event.date).format('YYYY-MM-DD'));
      this.model.set({report_end_date: moment(event.date).format('YYYY-MM-DD')});
    },

    endsOnRadioClick: function(event){
      var selected = $(event.target).val();
      if(selected == 'end_date'){
        this.ui.report_end_date.show();
        this.ui.report_end_date.datepicker('setStartDate', this.model.get('report_start_date'));
        this.model.set({report_end_date: this.model.get('report_start_date') });
      }
      else{
        this.ui.report_end_date.find('input').val('');
        this.ui.report_end_date.hide();
      }
    },

    frequencyRadioClick: function(event){
      var selected = $(event.target).val();

      if(selected == 'specific_days'){
        $('#specific_days_option').show();
        $('#weekly_checkboxes_option').hide();
        $('#quarterly_checkboxes_option').hide();
      }

      if(selected == 'weekly'){
        $('#specific_days_option').hide();
        $('#weekly_checkboxes_option').show();
        $('#quarterly_checkboxes_option').hide();

        this.ui.report_specific_days.find('input').val('');
      }

      if(selected == 'quarterly'){
        $('#specific_days_option').hide();
        $('#weekly_checkboxes_option').hide();
        $('#quarterly_checkboxes_option').show();

        this.ui.report_specific_days.find('input').val('');
      }

      if(selected == 'everyday'){
        $('#specific_days_option').hide();
        $('#weekly_checkboxes_option').hide();
        $('#quarterly_checkboxes_option').hide();
      }
    },

    saveReport: function() {
      var _report = this.model.toJSON();

      _report.report_schedule.title = this.ui.title.val();
      _report.report_schedule.emails = this.ui.emails.val();

      this.model.save(_report.report_schedule,{
        success: this._onSaveReportSuccess,
        error: this._onSaveReportFailure
      });
    },

    _onSaveReportSuccess: function(model, xhr, options){
      //Success
    },

    _onSaveReportFailure: function(model, xhr, options){
      $('#close_modal').trigger('click');
    },

  });

})(ReachUI.namespace("Reports"));