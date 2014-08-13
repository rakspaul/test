function datepickerClick(datepicker, day) {
  // Enable past date selection
  datepicker.find('.editable').editable('option', 'datepicker', { startDate: new Date(2012, 0, 1), language: 'en' });
  datepicker.find('.editable').editable('show');
  datepicker.find('.datepicker-days tbody td:contains(' + day + ')').click();
  datepicker.find('form').submit();
};