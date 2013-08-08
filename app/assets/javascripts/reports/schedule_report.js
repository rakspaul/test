(function(Report) {
  'use strict';

  Report.ReportModel = Backbone.Model.extend({
    url: '/reports/schedule_reports/',
    defaults: {
      title: null,
      email: null,
      start_date: null,
      end_date: null,
      recalculate_dates: false,
      report_start_date: moment().add("days", 1).format('YYYY-MM-DD'),
      report_end_date: null,
      frequency_type: 'Everyday',
      frequency_value: 1,
      url: null
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
      'change input[name="endsOnRadio"]' : '_endsOnRadioClick',
      'change input[name="frequencyRadio"]' : '_frequencyRadioClick',
      'change input[name="weeklyCheckboxes"]' : '_weeklyCheckboxesClick',
      'change input[name="quarterlyCheckboxes"]' : '_quarterlyCheckboxesClick',
      'click #save_report' : '_saveReport'
    },

    ui: {
      report_dates : '#report_dates',
      title : '#title',
      email: '#email',
      report_start_date: '#report_start_date',
      report_end_date: '#report_end_date',
      report_specific_days: '#report_specific_days',
      title_error: '#title_error',
      email_error: '#email_error',
      frequency_value_error: '#frequency_value_error'
    },

    onDomRefresh: function(){
      this.ui.report_start_date.datepicker(this._dateOptions()).on('changeDate', this._onStartDateChange);
      this.ui.report_end_date.datepicker(this._dateOptions()).on('changeDate', this._onEndDateChange);
      this.ui.report_specific_days.datepicker(this._dateOptionsSpecific()).on('changeDate', this._onSpecificDateChange);;
    },

    _dateOptions: function() {
      return {
        format: 'yyyy-mm-dd',
        startDate: moment().add("days", 1).format('YYYY-MM-DD'),
        autoclose: true,
      }
    },

    _dateOptionsSpecific: function() {
      return {
        format: 'yyyy-mm-dd',
        startDate: moment().add("days", 1).format('YYYY-MM-DD')
      }
    },

    _onStartDateChange: function(event) {
      this.ui.report_end_date.datepicker('setStartDate', moment(event.date).format('YYYY-MM-DD'));
      this.model.set({report_start_date: moment(event.date).format('YYYY-MM-DD')});
      this.model.set({report_end_date: moment(event.date).format('YYYY-MM-DD')});
    },

    _onEndDateChange: function(event){
      this.ui.report_end_date.val(moment(event.date).format('YYYY-MM-DD'));
      this.model.set({report_end_date: moment(event.date).format('YYYY-MM-DD')});
    },

    _onSpecificDateChange: function(event){
      this.model.set({frequency_value: this.ui.report_specific_days.find('input').val()});
    },

    _endsOnRadioClick: function(event){
      var selected = $(event.target).val();
      if(selected === 'end_date'){
        $('#report_enddate_option').show();
        this.ui.report_end_date.datepicker('setStartDate', this.model.get('report_start_date'));
      }
      else{
        this.ui.report_end_date.find('input').val('');
        $('#report_enddate_option').hide();
      }
    },

    _frequencyRadioClick: function(event){
      var selected = $(event.target).val();

      if(selected === 'specific_days'){
        $('#specific_days_option').show();
        $('#weekly_checkboxes_option, #quarterly_checkboxes_option').hide();
        this.model.set({frequency_type: 'Specific Days', frequency_value: null });
      }
      if(selected === 'weekly'){
        $('#weekly_checkboxes_option').show();
        $('#specific_days_option, #quarterly_checkboxes_option').hide();
        this.model.set({frequency_type: 'Weekly', frequency_value: null });
        this.ui.report_specific_days.datepicker('reset_date');
      }
      if(selected === 'quarterly'){
        $('#quarterly_checkboxes_option').show();
        $('#specific_days_option, #weekly_checkboxes_option').hide();
        this.model.set({frequency_type: 'Quarterly', frequency_value: null });
        this.ui.report_specific_days.datepicker('reset_date');
      }
      if(selected === 'everyday'){
        $('#specific_days_option, #weekly_checkboxes_option, #quarterly_checkboxes_option').hide();
        this.model.set({frequency_type: 'Everyday', frequency_value: 1 });
        this.ui.report_specific_days.datepicker('reset_date');
      }
    },

    _weeklyCheckboxesClick: function(event){
      var selectedWeeklyDays = [];
      $('input[name="weeklyCheckboxes"]:checked').each(function() {
         selectedWeeklyDays.push(this.value);
      });
      this.model.set({frequency_value: selectedWeeklyDays.join(',') });
    },

    _quarterlyCheckboxesClick: function(event){
      var selectedQuarters = [];
      $('input[name="quarterlyCheckboxes"]:checked').each(function() {
         selectedQuarters.push(this.value);
      });
      this.model.set({frequency_value: selectedQuarters.join(',') });
    },

    _saveReport: function() {
      this.model.set({
        title: this.ui.title.val(),
        email: this.ui.email.val(),
        recalculate_dates: $('#recalculate_dates').is(':checked')
      });

      var _report = this.model.toJSON(),
        self = this;

      // get all the error labels and clear them
      _.keys(this.ui)
        .filter(function(val) {
          return /_error$/.test(val);
        })
        .forEach(function(val) {
          self.ui[val].text("");
        });

      this.model.save(_report.report_schedule,{
        success: this._onSaveReportSuccess,
        error: this._onSaveReportFailure
      });
    },

    _onSaveReportSuccess: function(model, xhr, options){
      alert("Report saved succcessfully.");
      $('#close_modal').trigger('click');
    },

    _onSaveReportFailure: function(model, xhr, options){
      if(xhr.responseJSON && xhr.responseJSON.errors) {
        var formErrors = [],
          self = this;

        _.each(xhr.responseJSON.errors, function(value, key) {
          var errorLabel = self.ui[key + "_error"];
          if(errorLabel) {
            errorLabel.text(value[0]);
          } else {
            formErrors.push(value);
          }
        });

        alert("Error saving report. \n" + formErrors.join("\n"));
      }
    },

  });

})(ReachUI.namespace("Reports"));