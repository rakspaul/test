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

////////////////////////////////////////////////////////////////////////////////
// show list of selected targeting options under 'Name' column of Ad or Lineitem
ReachUI.showCondensedTargetingOptions = function() {
  var targeting_options = [];
  var targeting = this.model.get('targeting');

  var dmas = targeting.attributes.selected_dmas;
  if(dmas.length > 0) {
    targeting_options.push('<div class="dma-targeting-icon" title="DMAs"></div>', '<div style="float:left">', ReachUI.truncateArray(dmas, "title"), '</div>');
  }

  var zips = targeting.attributes.selected_zip_codes;
  if(zips.length > 0) {
    targeting_options.push('<div class="zip-codes-icon" title="Zip codes"></div>', '<div style="float:left">', ReachUI.truncateArray(zips), '</div>');
  }
 
  var key_values = targeting.attributes.selected_key_values;      
  if(key_values.length > 0) {   
    targeting_options.push('<div class="account-contact-icon" title="Key Value Targeting"></div>');
    targeting_options.push('<div style="float:left">');
    targeting_options.push(ReachUI.truncateArray(key_values, "title"));
    targeting_options.push('</div>');
  } 

  // if we close Targeting Dialog in Li context then *all* .targeting_options_condensed will be
  // selected (including Ads' ones), so we need to limit this only to first matching element
  var toptions = this.$el.find('.targeting_options_condensed')[0];
  $(toptions).html(targeting_options.join(' '));
};

// align height of ad's subdivs with the largest one ('.name')
ReachUI.alignAdsDivs = function() {
  var highest_div = _.max(_.map($('.ad > div[class^="pure-u-"]'), function(el) { return $(el).height() } ));
  _.each($('.ad > div[class^="pure-u-"]'), function(el) {
    var padding = $(el).css('box-sizing') == 'border-box' ? parseInt($(el).css('padding-top')) : 0;
    $(el).css('height', (highest_div + padding + 'px') ) 
  });
};

// align height of lineitem's li-number div
ReachUI.alignLINumberDiv = function() {
  _.each($('.lineitem'), function(li) {
    var height = _.max(_.map($(li).children('div[class^="pure-u-"]'), function(col) {
      return $(col).outerHeight();
    }));
    $(li).find('.li-number').css('height', height +'px');
  });
};

ReachUI.checkOrderStatus = function(order_id) {
  var current_order_state = $('.current-io-status-top .io-status').html().trim();
  current_order_state = current_order_state[0].toUpperCase() + current_order_state.slice(1);

  if(current_order_state == "Pushing") {
    // pulsate the 'Pushing' status
    $('.current-io-status-top').effect('pulsate', {duration: 9000000, times: 10000}); // 25h

    // check every 2 seconds whether order was pushed or failed
    var statusCheckTimer = setInterval(function() {
      $.get('/orders/'+order_id+'/status', function(resp) {
        if(resp.status != "Pushing") {
          $('.current-io-status-top').stop(true, true); // stop current running animation
          $('.current-io-status-top').css('opacity', 1);
          $('.current-io-status-top .io-status').html(resp.status);
          clearInterval(statusCheckTimer);

          ReachUI.Orders.router.options.controller.orderList.remove(order_id);
          ReachUI.Orders.router.navigate('/'+order_id, {trigger: true});
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
}
