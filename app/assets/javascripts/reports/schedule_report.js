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
    },

    events: {
      'change input[name="endsOnRadio"]' : 'endsOnRadioClick',
      'click #save_report' : 'saveReport'
    },

    ui: {
      end_date : '#end_date',
      report_dates : '#report_dates',
      title : '#title',
      emails: '#emails',
      report_start_date: '#start_date',
      report_end_date: '#end_date'
    },

    onDomRefresh: function(){
      $('#start_date, #end_date').datepicker(this._defaults());
    },

    _defaults: function() {
      return {
        format: 'yyyy-mm-dd',
        startDate: this.model.get('report_start_date'),
      }
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

    saveReport: function() {
      var _report = this.model.toJSON();
      this.model.save(_report.report_schedule,{
        success: this._onSaveReportSuccess,
        error: this._onSaveReportFailure
      });
    },

    _onSaveReportSuccess: function(model, response, options){
      //Success
    },

    _onSaveReportFailure: function(model, response, options){
      $('#close_modal').trigger('click');
    }


  });

})(ReachUI.namespace("Reports"));