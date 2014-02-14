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

  Creatives.CreativeView = Creatives.BasicCreativeView.extend({
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

    modelEvents: {
      'change': 'updateLiCreative'
    },

    collectionEvents: {
      'add': 'updateLiCreative'
    },

    updateLiCreative: function() {
      var view = this,
          update_creative_model_from_li = true,
          current_creative = view.model;

      // only update Creative on LI level if in another Ads there is no such Creative
      var this_ad = this.options.parent_view.model;
      if (this_ad) {
        if(this.options.parent_view.options.parent_view) {
          var this_li_view = this.options.parent_view.options.parent_view;
          var this_li = this_li_view.model;    

          if (this_li) {
            var ads_except_current = _.filter(this_li.ads, function(el) {
              if(el.cid != this_ad.cid) {
                return el;
              }
            });

            var clone_creative_to_li = true;
            _.each(this_li.get('creatives').models, function(c) {
              if(c.get('id') && current_creative.get('id') && c.get('id') == current_creative.get('id')) {
                // creatives are persisted and one of them was changed
                // then copy new attributes to LI level creative
                c.attributes = current_creative.attributes;
                this_li_view.renderCreatives();
                clone_creative_to_li = false;
              } else if (c.cid == current_creative.get('parent_cid')) { // not persisted creative
                c.attributes = current_creative.attributes;
                this_li_view.renderCreatives();
                clone_creative_to_li = false;
              }
            });

            // create new one with new attributes (copy-on-write)
            if(clone_creative_to_li) {
              view.options.parent_view.options.parent_view.model.get('creatives').add(current_creative);
              this_li_view.renderCreatives();
            }
          }
        }
      }
    },

    onRender: function() {
      var self = this;

      $.fn.editable.defaults.mode = 'popup';

      this.$el.find('.end-date .editable.custom').editable({
        success: function(response, newValue) {
          var end_date = moment(newValue).format("YYYY-MM-DD");
          self.model.set('end_date', end_date); //update backbone model

          if(end_date < self.model.get('start_date')) {
            self.$el.find('.end-date .errors_container').html('End date cannot be before start date')
          }
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
        }
      });

      this.$el.find('.start-date .editable.custom').editable({
        success: function(response, newValue) {
          var start_date = moment(newValue).format("YYYY-MM-DD");
          self.model.set('start_date', start_date); //update backbone model

          if(start_date > self.model.get('end_date')) {
            self.$el.find('.end-date .errors_container').html('End date cannot be before start date')
          }
        },
        datepicker: {
          startDate: moment().format("YYYY-MM-DD")
        }
      });

      this.$el.find('.javascript-code .editable.custom').editable({
        success: function(response, newValue) {
          self.model.attributes.html_code = newValue;
        },
        display: function(value, sourceData) {
          var start_pos = value.indexOf('"id" :');
          var val = value.substr(start_pos - 22, 47);
          $(this).html(val);
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
        this.model.attributes.creative_type = "ThirdPartyCreative";
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

      this.updateLiCreative();
    }
  });

  Creatives.CreativesListView = Creatives.BasicCreativesListView.extend({
    itemView: Creatives.CreativeView,
    template: JST['templates/creatives/creatives_container'],

    events: {
      'click .add-typed-creative-btn': '_addCreative',
      'click .done-creative-btn': '_closeCreativeDialog'
    },

    _addCreative: function(ev) {
      var type = $(ev.currentTarget).data('type');
      var parentModel = this.options.parent_view.model;
      var creative = new ReachUI.Creatives.Creative({
        start_date: parentModel.get('start_date'),
        end_date:   parentModel.get('end_date'),
        creative_type: type
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
