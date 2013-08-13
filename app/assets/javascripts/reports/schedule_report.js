(function(Report) {
  'use strict';

  Report.ReportModel = Backbone.Model.extend({
    url: function() {
      if(this.isNew()) {
        return '/reports/schedule_reports/';
      } else {
        return '/reports/schedule_reports/' + this.id + '.json';
      }
    },

    constructor: function() {
      this.report_para = null;
      Backbone.Model.apply(this, arguments);
    },

    defaults: {
      title: null,
      email: null,
      start_date: null,
      end_date: null,
      recalculate_dates: false,
      report_start_date: moment().add("days", 1).format('YYYY-MM-DD'),
      report_end_date: null,
      frequency_type: 'everyday',
      frequency_value: 1,
      url: null
    },

    getGroups: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['group'].split(',');
    },

    getColumns: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['cols'].split(',');
    },

    getStartDate: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['start_date']
    },

    getEndDate: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['end_date']
    },

    getSortField: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['sort_param']
    },

    getSortDirection: function() {
      if(!this.report_para) {
        this.report_para = this.explodeToObject(this.get('url'));
      }
      return this.report_para['sort_direction']
    },

    explodeToObject: function(url) {
      var decoded_url = decodeURIComponent(url);
      var queryString = decoded_url.split('?');
      var array = queryString[1].split('&');

      var object = {};
      for(var i=0; i < array.length; i++) {
        var paramvalue = array[i].split('=');
        object[paramvalue[0]] = paramvalue[1];
      }
      return object;
    },

    toJSON: function() {
      return { report_schedule: _.clone(this.attributes) };
    }
  });

  Report.ReportModelList = Backbone.Collection.extend({
    model: Report.ReportModel,
    url: '/reports/schedule_reports.json'
  });

  Report.ScheduledReportsGridItemView = Backbone.Marionette.ItemView.extend({
    template: JST['templates/reports/scheduled_reports_grid_item'],
    tagName: 'tr',
    triggers: {
      'click .icon-remove' : 'delete:scheduled_report',
      'click .icon-edit' : 'edit:scheduled_report'
    },
  });

  Report.ScheduledReportsGridView = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/reports/scheduled_reports_grid'],
    itemView: Report.ScheduledReportsGridItemView,
    tagName: 'table',
    className: 'schedule-report-table',

    appendHtml: function(collectionView, itemView){
        collectionView.$('tbody').append(itemView.el);
    },
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
      'change input[name="ends_on_radio_group"]' : '_endsOnRadioClick',
      'change input[name="frequency_radio_group"]' : '_frequencyRadioClick',
      'change input[name="weekly_checkbox_group"]' : '_weeklyCheckboxClick',
      'change input[name="quarterly_checkbox_group"]' : '_quarterlyCheckboxClick',
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
      frequency_value_error: '#frequency_value_error',
      report_end_date_error: '#report_end_date_error',
      report_start_date_error: '#report_start_date_error',
      specific_days_option: '#specific_days_option',
      weekly_checkboxes_option: '#weekly_checkboxes_option',
      quarterly_checkboxes_option: '#quarterly_checkboxes_option',
      report_enddate_option: '#report_enddate_option',
      recalculate_dates: '#recalculate_dates',
      specific_days_input: '#specific_days_input'
    },

    onDomRefresh: function(){
      this.ui.report_start_date.datepicker(this._dateOptions()).on('changeDate', this._onStartDateChange);
      this.ui.report_end_date.datepicker(this._dateOptions()).on('changeDate', this._onEndDateChange);
      this.ui.report_specific_days.datepicker(this._dateOptionsSpecific());

      // Frequency field update
      var frequency_type = this.model.get('frequency_type'),
        frequency_value = this.model.get('frequency_value');

      if(frequency_type && frequency_value){
        $('input[name="frequency_radio_group"][value='+ frequency_type +']').trigger('click');

        if(frequency_type==='specific_days'){
          this.ui.report_specific_days.datepicker('_update_dates', frequency_value.split(','));
        } else if(frequency_type==='weekly'){
            frequency_value = frequency_value.split(',');
          for(var i=0; i< frequency_value.length; i++){
            $('input[name="weekly_checkbox_group"][value='+ frequency_value[i] +']').attr({'checked':'checked'});
          }
        } else if(frequency_type==='quarterly'){
            frequency_value = frequency_value.split(',');
          for(var i=0; i< frequency_value.length; i++){
            $('input[name="quarterly_checkbox_group"][value='+ frequency_value[i] +']').addClass('new')
            $('input[name="quarterly_checkbox_group"][value='+ frequency_value[i] +']').attr({'checked':'checked'});
          }
        }
      }

      // Ends on date field update
      if(this.model.get('report_end_date')){
        $('input[name="ends_on_radio_group"][value="end_date"]').trigger('click');
        this.ui.report_enddate_option.show();
      }

      // Recalculate date field update
      if(this.model.get('recalculate_dates')){
        this.ui.recalculate_dates.attr({'checked':'checked'});
      }

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
      if($('input[name="ends_on_radio_group"][value="end_date"]').is(':checked')){
        this.ui.report_end_date.datepicker('setStartDate', this.ui.report_start_date.find('input').val());
        this.ui.report_end_date.datepicker('_update_dates', this.ui.report_start_date.find('input').val().split(','));
      }
    },

    _onEndDateChange: function(event){
      this.ui.report_end_date.val(moment(event.date).format('YYYY-MM-DD'));
    },

    _endsOnRadioClick: function(event){
      var selected = $(event.target).val();
      if(selected === 'end_date'){
        this.ui.report_enddate_option.show();
        this.ui.report_end_date.datepicker('setStartDate', this.ui.report_start_date.find('input').val());
        this.ui.report_end_date.datepicker('_update_dates', this.ui.report_start_date.find('input').val().split(','));
      }
      else{
        this.ui.report_end_date.datepicker('_reset_date');
        this.ui.report_end_date.find('input').val('');
        this.ui.report_enddate_option.hide();
      }
    },

    _frequencyRadioClick: function(event){
      var frequency_type = $(event.target).val();

      this.ui.specific_days_option.hide(),
      this.ui.weekly_checkboxes_option.hide(),
      this.ui.quarterly_checkboxes_option.hide();
      this._reset_controls();

      if(frequency_type === 'specific_days'){
        var frequency_value =  moment().add("days", 1).format('YYYY-MM-DD');
        this.ui.specific_days_option.show();
        this.ui.report_specific_days.datepicker('_update_dates', frequency_value.split(','));
      } else if(frequency_type === 'weekly'){
        this.ui.weekly_checkboxes_option.show();
      } else if(frequency_type === 'quarterly'){
        this.ui.quarterly_checkboxes_option.show();
      }
    },

    _reset_controls: function(){
      this.ui.report_specific_days.datepicker('_reset_date');
      $('input[name="weekly_checkbox_group"]:checked').removeAttr('checked');
      $('input[name="quarterly_checkbox_group"]:checked').removeAttr('checked');
    },

    _weeklyCheckboxClick: function(event){
      var selectedWeeklyDays = [];
      $('input[name="weekly_checkbox_group"]:checked').each(function() {
         selectedWeeklyDays.push(this.value);
      });
    },

    _quarterlyCheckboxClick: function(event){
      var selectedQuarters = [];
      $('input[name="quarterly_checkbox_group"]:checked').each(function() {
         selectedQuarters.push(this.value);
      });
    },

    _setReportModel: function(){
      //getting selected values for frequency_type & frequency_value
      var frequency_type = $('input[name="frequency_radio_group"]:checked').val(),
        frequency_value = 1;
      if(frequency_type === 'everyday'){
        frequency_value = 1;
      } else if(frequency_type === 'specific_days'){
        frequency_value = this.ui.specific_days_input.val();
      } else if(frequency_type === 'weekly'){
        var arr = []
        $.each($('input[name="weekly_checkbox_group"]:checked'), function(){
          arr.push($(this).val());
        });
        frequency_value = arr.join(',');
      } else if(frequency_type === 'quarterly'){
        var arr = []
        $.each($('input[name="quarterly_checkbox_group"]:checked'), function(){
          arr.push($(this).val());
        });
        frequency_value = arr.join(',');
      }

      this.model.set({
        title: this.ui.title.val(),
        email: this.ui.email.val(),
        recalculate_dates: this.ui.recalculate_dates.is(':checked'),
        report_start_date:this.ui.report_start_date.find('input').val(),
        report_end_date:(this.ui.report_end_date.find('input').val() === "") ? null : this.ui.report_end_date.find('input').val(),
        frequency_type: frequency_type,
        frequency_value: frequency_value
      });
    },

    _saveReport: function() {
      //set model from form properties
      this._setReportModel();

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