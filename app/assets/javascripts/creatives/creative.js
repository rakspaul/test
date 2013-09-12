(function(Creatives) {
  'use strict';

  Creatives.Creative = Backbone.Model.extend({
    defaults: function() {
      return {
        start_date: moment().add('days', 1).format("YYYY-MM-DD"),
        end_date: moment().add('days', 15).format("YYYY-MM-DD")
      }
    },

    url: function() {
      if(this.isNew()) {
        return '/orders/' + this.get("order_id") + '/creatives.json';
      } else {
        return '/orders/' + this.get("order_id") + '/creatives/' + this.id + '.json';
      }
    },

    toJSON: function() {
      return { creative: _.clone(this.attributes) };
    }
  });

  Creatives.CreativesList = Backbone.Collection.extend({
    model: Creatives.Creative,

    url: function() {
      return '/orders/' + this.order.id + '/creatives.json';
    },

    setOrder: function(order) {
      this.order = order;
    },

    getOrder: function() {
      return this.order;
    }
  });

  Creatives.CreativeView = Backbone.Marionette.ItemView.extend({
    tagName: 'div',
    className: 'creative pure-g',
    template: JST['templates/creatives/creatives_row'],

    initialize: function(){
      _.bindAll(this, "render");
      this.model.bind('change', this.render); // when start/end date is changed we should rerender the view
    },

    events: {
      'mouseenter': '_showDeleteBtn',
      'mouseleave': '_hideDeleteBtn',
      'click .delete_btn': '_destroyCreative',
    },

    onRender: function() {
      var self = this;

      $.fn.editable.defaults.mode = 'popup';
      this.$el.find('.start-date .editable.custom, .end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");
          self.model.set(this.dataset['name'], date); //update backbone model
        },
        datepicker: {
          startDate: moment().subtract('days', 1).format("YYYY-MM-DD")
        }
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          self.model.set(this.dataset['name'], newValue); //update backbone model
        }
      });
    },

    _showDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete_btn').show();
    },

    _hideDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete_btn').hide();
    },
    
    _destroyCreative: function(e) {
      this.remove();
    }
  });

  Creatives.CreativesListView = Backbone.Marionette.CompositeView.extend({
    itemView: Creatives.CreativeView,
    itemViewContainer: '.creatives-list-view',
    template: JST['templates/creatives/creatives_container'],
    className: 'creatives-content',
    tagName: 'table',

    ui: {
      creatives: '.creatives-container'
    },

    events: {
      'click .add-creative-btn': '_addCreative',
      'click .done-creative-btn': '_closeCreativeDialog'
    },

    _addCreative: function() {
      var creative = new ReachUI.Creatives.Creative();
      var creativeView = new ReachUI.Creatives.CreativeView({model: creative});
      this.ui.creatives.append(creativeView.render().el);
    },

    _closeCreativeDialog: function() {
      this.options.parent_view._toggleCreativesDialog();
    }
  });
})(ReachUI.namespace("Creatives"));
