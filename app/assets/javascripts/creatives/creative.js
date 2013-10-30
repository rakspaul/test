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
      'click .creative-type input': '_changeCreativeType'
    },

    updateLiCreative: function() {
      var view = this,
          update_creative_model_from_li = true;

      // only update Creative on LI level if in another Ads there is no such Creative
      var this_ad = this.options.parent_view.model;
      if(this_ad) {
        if(this.options.parent_view.options.parent_view) {
          var this_li_view = this.options.parent_view.options.parent_view;
          var this_li = this_li_view.model;    

          if(this_li) {
            var ads_except_current = _.filter(this_li.ads, function(el) {
              if(el.cid != this_ad.cid) {
                return el;
              }
            });

            // collect all creative attributes from LI's Ads except current one
            var creatives_urls = [], start_dates = [], end_dates = [], ad_sizes = [];
            _.each(ads_except_current, function(ad) { 
              _.each(ad.get('creatives').models, function(c) {
                creatives_urls.push(c.get('redirect_url'));
                start_dates.push(c.get('start_date'));
                end_dates.push(c.get('end_date'));
                ad_sizes.push(c.get('ad_size'));
              });
            });

            // if all attributes are already present among existing ones creatives then do nothing
            if(_.contains(creatives_urls, view.model.get('redirect_url')) && _.contains(start_dates, view.model.get('start_date')) && _.contains(end_dates, view.model.get('end_date')) && _.contains(ad_sizes, view.model.get('ad_size'))) {
              update_creative_model_from_li = false;
            }

            if(update_creative_model_from_li) {
              var clone_creative_to_li = false;
              _.each(this_li.get('creatives').models, function(c) {

                if(c.get('id') && view.model.get('id')) {
                  if(c.get('id') == view.model.get('id')) {
                    c.attributes = view.model.attributes;
                    this_li_view.renderCreatives();
                    return;
                  } else {
                    clone_creative_to_li = true;
                  }
                } else if (c.cid == view.model.get('parent_cid')) { // not persisted creative
                  c.attributes = view.model.attributes;
                  this_li_view.renderCreatives();
                  return;
                } else {
                  clone_creative_to_li = true;
                }
              });

              // create new one with new attributes (copy-on-write)
              if(clone_creative_to_li) {
                view.options.parent_view.options.parent_view.model.get('creatives').add(view.model);
                this_li_view.renderCreatives();
              }
            }
          }
        }
      }
    },

    onRender: function() {
      var self = this;

      $.fn.editable.defaults.mode = 'popup';

      this.$el.find('.start-date .editable.custom, .end-date .editable.custom').editable({
        success: function(response, newValue) {
          var date = moment(newValue).format("YYYY-MM-DD");
          self.model.set($(this).data('name'), date); //update backbone model
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
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
          self.model.set($(this).data('name'), newValue); //update backbone model
        }
      });

      this.updateLiCreative();
    },

    _showDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').show();
    },

    _hideDeleteBtn: function(e) {
      e.stopPropagation();
      this.$el.find('.delete-btn').hide();
    },
    
    _changeCreativeType: function(e) {
      e.stopPropagation();

      if($(e.currentTarget).is(':checked')) {
        this.$el.find('.image-url span').editable('disable');
        this.model.attributes.creative_type = "CustomCreative";
      } else {
        this.$el.find('.image-url span').editable('enable');
        this.model.attributes.creative_type = "InternalRedirectCreative";
      }

      this.updateLiCreative();
    },

    _markCreativeForDeletion : function(li) {
      // mark this creative to be deleted on back-end side
      if(this.model.get('id')) {
        var delete_creatives = this.options.parent_view.model.get('_delete_creatives');
        delete_creatives.push(this.model.get('id'));
        li.get('_delete_creatives', delete_creatives);
      }
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
      if(this_ad && this.options.parent_view.options.parent_view) {
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

          view._markCreativeForDeletion(this_li);
        }
      } else { // this is lineitem's creative
        var this_li = this.options.parent_view.model;  
        this._markCreativeForDeletion(this_li);
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
      var parentModel = this.options.parent_view.model;
      var creative = new ReachUI.Creatives.Creative({
        start_date: parentModel.get('start_date'),
        end_date:   parentModel.get('end_date')
      });
      var creativeView = new ReachUI.Creatives.CreativeView({model: creative, parent_view: this.options.parent_view});
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
