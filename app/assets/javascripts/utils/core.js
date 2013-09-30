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
    targeting_options.push(ReachUI.truncateArray(key_values));
    targeting_options.push('</div>');
  } 

  // if we close Targeting Dialog in Li context then *all* .targeting_options_condensed will be
  // selected (including Ads' ones), so we need to limit this only to first matching element
  var toptions = this.$el.find('.targeting_options_condensed')[0];
  $(toptions).html(targeting_options.join(' '));
};

// align height of ad's subdivs with the largest one ('.name')
ReachUI.alignAdsDivs = function() {
  _.each($('.ad > div[class^="pure-u-"]'), function(el) { $(el).css('height', $(el).siblings('.name').height() + 'px' ) });
};
