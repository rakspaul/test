(function(BlockToolComponents) {
  'use strict';

  BlockToolComponents.SelectedItems = Backbone.Collection.extend({})

  BlockToolComponents.ListItemView = Backbone.Marionette.ItemView.extend({
    template: _.template('<%= name%>'),
    tagName: 'li',
    className: function() {
      if(this.options.draggable) {
        return 'draggble';
      }
    },

    attributes: function() {
      return {value: this.model.id};
    },

    triggers:{
      'click' : 'selected'
    },

    initialize: function() {
      this.model.on('change:selected', this.render, this);
    },

    onRender: function() {
      if (this.model.get('selected')) {
        this.$el.addClass('selected');
      } else {
        this.$el.removeClass('selected');
      }

      if(this.options.draggable) {
        this.$el.draggable({
          revert: 'invalid',
          helper: this._dragHelper,
          appendTo: 'body',
          containment: 'body'
        });
      }
    },

    _dragHelper: function(){
      var selected = $('#sitesList li.selected');
      if (selected.length <= 1) {
        $('#sitesList li').removeClass('selected');
        selected = $(this).addClass('selected');
      }
      var container = $('<ul class="select-keyvals" />');
      container.append(selected.clone());
      return container;
    }

  }),

  BlockToolComponents.SearchList = Backbone.Marionette.CompositeView.extend({
    template: JST['templates/admin/block_sites/site_list_view'],
    itemView: BlockToolComponents.ListItemView,
    itemViewContainer: '#sitesList',

    itemViewOptions: function() {
      return {
        draggable:this.draggable
      }
    },

    events: {
      'click #search_button': '_onSearch',
      'keypress #search_input': '_onSearch',
      'click #reset_button' : '_onResetClick',
    },

    ui:{
      search_input: '#search_input',
      site_list: '#sitesList',
      loading_div: '#loading_div'
    },

    serializeData: function(){
      return {
        placeholder: this.placeholder
      }
    },

    initialize: function() {
      this.draggable = this.options.hasOwnProperty('draggable') ? this.options.draggable : false
      this.placeholder = this.options.hasOwnProperty('placeholder') ? this.options.placeholder : 'Search'
      this.selectedItems = new BlockToolComponents.SelectedItems();
      this.collection.fetch({reset: true});

      this.collection.on("fetch", this._onFetch, this);
      this.collection.on("reset", this._onReset, this);
      this.on('itemview:selected', this._onItemClick, this);
    },

    getSelectedItems: function() {
      if(this.selectedItems && this.selectedItems.length > 0) {
        return this.selectedItems.models
      } else {
        return [];
      }
    },

    setSelectedItems: function(value) {
      this.selectedItems.each(function(item) {
        var vo = this.collection.get(item.id);
        if(vo) {
          vo.set({selected: value});
        }
      }, this);
    },

    getSelectedItemIds: function() {
      if(this.selectedItems && this.selectedItems.length > 0) {
        return this.selectedItems.pluck('id');
      } else {
        return [];
      }
    },

    resetSelection: function() {
      this.setSelectedItems(false)
      this.selectedItems.reset();
      this.trigger('SearchList:SelectedItemReset');
    },

    _onFetch: function() {
      this.ui.loading_div.show();
    },

    _onReset: function() {
      this.ui.loading_div.hide();
      this.setSelectedItems(true);
    },

    _onSearch: function(event) {
      if (event.type === 'keypress' && event.keyCode != 13) {
        return;
      }
      var searchString = this.ui.search_input.val().trim();
      this.collection.fetch({data:{search: searchString}, reset: true});
    },

    _onResetClick: function() {
      this.resetSelection();
    },

    _onItemClick: function(event){
      var selectedItem = event.model,
      vo = this.selectedItems.get(event.model.id);

      if (vo) {
        this.selectedItems.remove(vo);
        selectedItem.set({selected: false});
      } else {
        this.selectedItems.add(event.model);
        selectedItem.set({selected: true});
      }

      this.trigger('SearchList:ItemClick', this.selectedItems);
    },

  });

})(ReachUI.namespace("BlockToolComponents"));