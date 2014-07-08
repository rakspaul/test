var ReachUI = {
  namespace: function(ns) {
    var parts = ns.split("."),
      object = this,
      i, len;
    for (i=0, len=parts.length; i < len; i++) {
      if (!object[parts[i]]) {
        object[parts[i]] = {};
      }
      object = object[parts[i]];
    }

    return object;
  }
};

EventsBus = {};
_.extend(EventsBus, Backbone.Events);

ReachUI.formatColumn = function(value, type, precision) {
  if(type === 'number') {
    return accounting.formatNumber(value, precision || 0);
  } else {
    return value;
  }
};

// Jan-Mar = 1
// Apr-Jun = 2
// Jul-Sep = 3
// Oct-Dec = 4
ReachUI.getQuarter = function(d) {
  d = d || new Date();
  return Math.ceil((d.getMonth() + 1) / 3);
};

ReachUI.humanize = function(msg) {
  if (_.isArray(msg) && msg[0]) {
    msg = msg[0];
  }
  return msg.charAt(0).toUpperCase() + msg.slice(1);
};

// returns string like "Option, option + 5 more"
ReachUI.truncateArray = function(arr, attr) {
  var result = "";
  if(arr.length >= 2) {
    result += (attr ? (arr[0][attr]+", "+arr[1][attr]) : (arr[0]+", "+arr[1]));
    if(arr.length >= 3) {
      var remaining_arr = arr.slice(2);
      var more_items_tooltip = [];
      more_items_tooltip = _.inject(remaining_arr, function(sum, el) {
        attr ? sum.push(el[attr]) : sum.push(el);
        return sum;
      }, [] );
      result += ' <span title="'+more_items_tooltip.join('; ')+'">+' + remaining_arr.length + ' more</span>';
    }
  } else if(arr.length == 1) {
    result += (attr ? arr[0][attr] : arr[0]);
  }
  return result;
};

ReachUI.truncateArrayCustom = function(arr) {
  var result = "";
  if(arr.length <= 2){
    result = arr.join();
  }
  else{
    var remaining_arr = arr.slice(2);
    result = arr[0]+", "+arr[1];
    result += ' <span title="'+ remaining_arr.join('; ')+'">+' + remaining_arr.length + ' more</span>';
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////
// show list of selected targeting options under 'Name' column of Ad or Lineitem
ReachUI.showCondensedTargetingOptions = function() {
  var targeting_options = [];
  var targeting = this.model.get('targeting');

  var geos = targeting.attributes.selected_geos;
  if(geos.length > 0) {
    targeting_options.push('<div class="dma-targeting-icon pull-left" title="GEOs"></div>', '<div class="targeting-options">', ReachUI.truncateArray(geos, "title"), '</div>');
  }

  var zips = targeting.attributes.selected_zip_codes;
  if(zips.length > 0) {
    targeting_options.push('<div class="zip-codes-icon pull-left" title="Zip codes"></div>', '<div class="targeting-options">', ReachUI.truncateArray(zips), '</div>');
  }

  var key_values = targeting.attributes.selected_key_values;
  if(key_values.length > 0) {
    targeting_options.push('<div class="account-contact-icon pull-left" title="Key Value Targeting"></div>');
    targeting_options.push('<div class="targeting-options">');
    targeting_options.push(ReachUI.truncateArray(key_values, "title"));
    targeting_options.push('</div>');
  }

  var custom_key_values = targeting.get('keyvalue_targeting');
  if(custom_key_values) {
    targeting_options.push('<div class="custom-kv-icon" title="Custom Key/Value Targeting"></div>');
    targeting_options.push('<div class="targeting-options">');
    targeting_options.push(ReachUI.truncateArrayCustom(custom_key_values.split(','), "title"));
    targeting_options.push('</div>');
  }

  var frequency_caps = targeting.get('frequency_caps');
  if (frequency_caps.models) {
    frequency_caps = frequency_caps.models;
  }
  if (frequency_caps.length > 0) {
    var caps = _.map(frequency_caps, function(fc) {
      fc = fc.toJSON ? fc.toJSON() : fc;
      return { title: fc.impressions + ' per ' + fc.time_value + ' ' +
               ReachUI.FrequencyCaps.FrequencyCap.timeUnits[fc.time_unit] };
    });
    targeting_options.push('<div class="custom-kv-icon pull-left" title="Frequency Caps Targeting"></div>');
    targeting_options.push('<div class="targeting-options">');
    targeting_options.push(ReachUI.truncateArray(caps, "title"));
    targeting_options.push('</div>');
  }

  // if we close Targeting Dialog in Li context then *all* .targeting_options_condensed will be
  // selected (including Ads' ones), so we need to limit this only to first matching element
  var toptions = this.$el.find('.targeting_options_condensed')[0];
  $(toptions).html(targeting_options.join(' '));
};

ReachUI.checkOrderStatus = function(order_id) {
  var current_order_state = $('.current-io-status-top .io-status').html().trim();
  if (current_order_state) {
    current_order_state = current_order_state[0].toUpperCase() + current_order_state.slice(1);
  }

  if (current_order_state == "Pushing") {
    // pulsate the 'Pushing' status
    $('.current-io-status-top').effect('pulsate', {duration: 9000000, times: 10000}); // 25h

    // check every 2 seconds whether order was pushed or failed
    var statusCheckTimer = setInterval(function() {
      $.get('/orders/'+order_id+'/status', function(resp) {
        if(resp.status != "Pushing") {
          $('.current-io-status-top').stop(true, true); // stop current running animation
          $('.current-io-status-top').css('opacity', 1);
          $('.current-io-status-top .io-status').html(resp.status);
          $('.save-order-btn').removeClass('disabled');
          $('.push-order-btn').removeClass('disabled');
          clearInterval(statusCheckTimer);
          location.reload();
        }
      });
    }, 4000);
  }
};

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

ReachUI.currentTimeWithOffset = function(offset) {
    // create Date object for current location
    var d = new Date();

    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000*parseInt(offset)));

    // return time
    return nd;
};

ReachUI.initialStartDate = function(startDate) {
  var initialStartDate = moment().format("YYYY-MM-DD");
  if (moment(ReachUI.currentTimeWithOffset("-5h")).format("YYYY-MM-DD") > startDate) {
    initialStartDate = moment(window.server_time).format("YYYY-MM-DD");
  }
  return initialStartDate;
};

ReachUI.omitAttribute = function(attributes, attr) {
  var result = [];
  if (attributes.models) {
    result = _.map(attributes.models, function(a) {
      return _.omit(a.attributes, attr);
    });
  } else {
    result = _.map(attributes, function(a) {
      return _.omit(a, 'id');
    });
  }
  return result;
};

ReachUI.copyTargeting = function(e, scope) {
  e.stopPropagation();
  e.preventDefault();

  var el        = $(e.currentTarget),
      parent    = el.parent(),
      type      = el.data('type'),
      active    = parent.hasClass('active'),
      targeting = this.model.get('targeting'),
      buffer    = ReachUI.LineItems.LineItem.getCopyBuffer('targeting');

  if (!active) {
    var copiedOptions = {};

    parent.addClass('active');

    switch (type) {
      case 'key_values':
        copiedOptions = {
          selected_key_values: _.clone(targeting.get('selected_key_values')),
          keyvalue_targeting:  _.clone(targeting.get('keyvalue_targeting'))
        };
        break;
      case 'geo':
        copiedOptions = {
          selected_geos:      _.clone(targeting.get('selected_geos')),
          selected_zip_codes: _.clone(targeting.get('selected_zip_codes'))
        };
        break;
      case 'freq_cap':
        copiedOptions = {
          frequency_caps: ReachUI.omitAttribute(_.clone(targeting.get('frequency_caps')), 'id')
        };
        break;
    };

    if (!buffer) {
      buffer = {};
    }
    _.each(copiedOptions, function(value, key) {
      buffer[key] = value;
    });
  } else {
    if (buffer) {
      var deleteKeys = [];
      switch (type) {
      case 'key_values':
        deleteKeys = [ 'selected_key_values', 'keyvalue_targeting' ];
        break;
      case 'geo':
        deleteKeys = [ 'selected_geos', 'selected_zip_codes' ];
        break;
      case 'freq_cap':
        deleteKeys = [ 'frequency_caps' ];
        break;
      }
      buffer = _.omit(buffer, deleteKeys);
    }
    el.blur();
    parent.removeClass('active');
  }
  ReachUI.LineItems.LineItem.setCopyBuffer('targeting', buffer);

  noty({text: 'Targeting copied', type: 'success', timeout: 3000});
  this._deselectAllItems({ multi: true });
  this.$el.addClass('copied-targeting-from');
};

ReachUI.pasteTargeting = function(e, scope) {
  var self = this;
  e.stopPropagation();
  noty({text: 'Targeting pasted', type: 'success', timeout: 3000});

  var buffer = ReachUI.LineItems.LineItem.getCopyBuffer('targeting');

  _.each([ 'li', 'ad' ], function (type) {
    _.each(ReachUI.LineItems.LineItem.getSelectedItem(type), function(item) {
      var itemTargeting = item.model.get('targeting'),
          targeting = {};
      _.each(buffer, function(value, key) { // TODO
        if (key != 'frequency_caps') {
          targeting[key] = _.clone(value);
        }
      });

      if (buffer['frequency_caps']) {
        var frequencyCaps = itemTargeting.get('frequency_caps');
        var removedCaps = [];
        _.each(frequencyCaps.models, function(fc) {
          if (fc.get('id')) {
            removedCaps.push(fc.get('id'));
          }
        });
        _.each(removedCaps, function(id) {
          frequencyCaps.remove(id);
        });
        _.each(buffer['frequency_caps'], function(fc) {
          frequencyCaps.add(fc);
        });
        targeting['frequency_caps'] = frequencyCaps;
      }
      itemTargeting.set(targeting, { silent: true });

      item.$el.find('.targeting_options_condensed').eq(0).find('.targeting-options').addClass('highlighted');
    });
  });

  this.cancelTargeting();
};

ReachUI.cancelTargeting = function(e) {
  if (e) {
    e.stopPropagation();
  }
  ReachUI.LineItems.LineItem.setCopyBuffer('targeting', null);
  $('.lineitem').removeClass('copied-targeting-from');
  this._deselectAllItems();
};

ReachUI.toggleItemSelection = function(e, scope) {
  // if there is no copied targeting then exclusive select, otherwise accumulative
  var ui = this.ui;
  var buffer = ReachUI.LineItems.LineItem.getCopyBuffer('targeting');
  if (!buffer) {
    this._deselectAllItems({'except_current': true});
  }

  this.ui.item_number.toggleClass('selected');
  this.selected = this.ui.item_number.hasClass('selected');
  this.ui.copy_targeting_btn.toggle();

  var selectedItems = ReachUI.LineItems.LineItem.getSelectedItem(scope);

  if (this.selected) {
    selectedItems.push(this);
  } else {
    selectedItems.splice(this, 1);
  }
  ReachUI.LineItems.LineItem.setSelectedItem(selectedItems, scope);

  if (buffer) {
    // Hide all buttons
    $('.copy-targeting-btn, .paste-targeting-btn, .cancel-targeting-btn').hide();
    $('.copy-targeting-btn li').removeClass('active');
    _.each([ ui.paste_targeting_btn, ui.cancel_targeting_btn ], function(el) { el.toggle(); });
  }
};

ReachUI.deselectAllItems = function(options, scope) {
  var self = this;
  _.each([ 'li', 'ad' ], function (type) {
    _.each(ReachUI.LineItems.LineItem.getSelectedItem(type), function(item) {
      if (!(options && options['except_current'] && item == self)) {
        item.selected = false;
        item.ui.item_number.removeClass('selected');
        if (!options || !options['multi']) {
          _.each([ item.ui.copy_targeting_btn, item.ui.paste_targeting_btn, item.ui.cancel_targeting_btn ], function(el) { el.hide(); });
        }
        item.renderTargetingDialog();
      }
    });
  });
  ReachUI.LineItems.LineItem.setSelectedItem();
};
