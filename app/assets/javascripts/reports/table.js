(function(Report) {
  'use strict';

  Report.TableColumn = Backbone.Model.extend({
    defaults: {
      name: '',
      internal_name: '',
      is_removable: false,
      index: 0
    }
  });

  Report.TableColumnList = Backbone.Collection.extend({
    model: Report.TableColumn
  });

  Report.ColumnView = Backbone.Marionette.ItemView.extend({
    tagName: 'li',
    className: 'droppable',
    template: _.template('<%= name %>')
  });

  Report.AvailableColumnsView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'columns-list',
    itemView: Report.ColumnView,

    onAfterItemAdded: function(itemView) {
      itemView.$el.draggable({ revert: true });
    }
  });

  Report.TableHeaderColumnView = Backbone.Marionette.ItemView.extend({
    tagName: 'th',
    template: _.template('<%= name %> <% if (is_removable) { %> <i class="icon-white icon-remove"></i> <%} %>'),

    attributes: function() {
      return {
        "id" : this.model.get("internal_name"),
      }
    },
   
    triggers: {
      'click' : 'column:sort',
      'click .icon-remove' : 'column:remove'
    },
  });

  Report.TableHeadView = Backbone.Marionette.CollectionView.extend({
    tagName: 'tr',
    itemView: Report.TableHeaderColumnView
  });

  // Represents single row returned in AA response
  Report.ResponseRow = Backbone.Model.extend({ });

  Report.ResponseRowList = Backbone.Collection.extend({
    model: Report.ResponseRow,
  });

  Report.ResponseRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: _.template("<% for(col in columns){%><td><%= model[columns[col]] %> </td> <% } %>"),
    initialize: function(options) {
      this.columns = options.columns;
    },

    serializeData: function() {
      return {
        columns: this.columns,
        model: this.model.toJSON()
      };
    }
  });

  Report.TableBodyView = Backbone.Marionette.CollectionView.extend({
    itemView: Report.ResponseRowView,
    initialize: function() {
      this.columns = this.options.columns.pluck('internal_name');
      // this.columns = ['advertiser_name']
      this.collection.on("reset", this.onCollectionChange, this);
    },

    onCollectionChange: function() {
      this.render();
    },

    buildItemView: function(item, ItemView){
      var view = new ItemView({
        model: item,
        columns:this.columns
      });
      return view;
    },

    appendHtml: function(collectionView, itemView, index) {
      // hackish way to properly render table
      this.$el.parent().append(itemView.el);
    },

    setSelectedColumns: function(columns) {
      this.columns = columns.pluck('internal_name');
      this.render();
    }
   });

  Report.TableLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/reports/table_layout'],
    regions: {
      'head': '.head-region',
      'body': '.body-region',
      'footer': '.foot-region'
    },

    onRender: function() {
      var self = this,
        dropItem
      this.$el.droppable({
        accept: ".droppable",
        drop: function(event, ui){
          ui.draggable.hide();
          dropItem = $(ui.draggable).text();
          self.trigger("item:drop", dropItem);
        }
      })
    }
  });
})(ReachUI.namespace("Reports"));
