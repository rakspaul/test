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
        return '/orders/' + this.get("order_id") + '/lineitems/' + this.get("lineitem_id") + '/creatives/' + this.id + '.json';
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
      'click .delete-btn': '_destroyCreative',
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

      // select Creative size from the drop-down autocomplete
      this.$el.find('.size .editable.custom').editable({
        source: '/ad_sizes.json',
        typeahead: {
          minLength: 1,
          remote: '/ad_sizes.json?search=%QUERY',
          valueKey: 'size'
        }
      });
      this.$el.find('.size').on('typeahead:selected', function(ev, el) {
        self.model.set("ad_size", el.size);
      });

      this.$el.find('.editable:not(.typeahead):not(.custom)').editable({
        success: function(response, newValue) {
          self.model.set(this.dataset['name'], newValue); //update backbone model
        }
      });
    },

    _showDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').show();
    },

    _hideDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').hide();
    },
    
    _destroyCreative: function(e) {
      e.stopPropagation();
      var view = this,
          delete_creative_model_from_li = true;

      view.model.destroy({
        success: function(model, response) {
          view.remove();
        }
      });

      // only delete Creative on LI level if in another Ads there is no such Creative
      var this_ad = this.options.parent_view.model;
      if(this_ad) {
        var this_li = this.options.parent_view.options.parent_view.model;    

        var ads_except_current = _.filter(this_li.ads, function(el) {
          if(el.cid != this_ad.cid) {
            return el;
          }
        });
        
        var creatives_urls = [];
        _.each(ads_except_current, function(ad) { 
          _.each(ad.get('creatives').models, function(c) {
            creatives_urls.push(c.get('redirect_url'));
          });
        });

        if(_.contains(creatives_urls, view.model.get('redirect_url'))) { // if present then not delete
          delete_creative_model_from_li = false;
        }

        if(delete_creative_model_from_li) {
          // delete this model
          _.each(this_li.get('creatives').models, function(c) {
            if(c.get('redirect_url') == view.model.get('redirect_url')) {
              c.destroy();
            }
          });
  
          // mark this creative to be deleted on back-end side
          if(view.model.get('id')) {
            var delete_creatives = view.options.parent_view.model.get('_delete_creatives');
            delete_creatives.push(view.model.get('id'));
            this_li.get('_delete_creatives', delete_creatives);
          }
        }
      }
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

      // if this is Ad 
      if(this.options.parent_view.options.parent_view) {
        var li = this.options.parent_view.options.parent_view.model;
        li.get('creatives').add(creative);
      }

      this.options.parent_view.model.get('creatives').add(creative);
    },

    _closeCreativeDialog: function() {
      this.options.parent_view._toggleCreativesDialog();
    }
  });
})(ReachUI.namespace("Creatives"));
