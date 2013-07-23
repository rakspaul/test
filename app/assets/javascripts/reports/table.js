(function(Report) {
  'use strict';

  Report.TableColumn = Backbone.Model.extend({
    defaults: {
      name: '',
      internal_name: '',
      is_removable: false,
      index: 0,
      format: 'string',
      precision: 0,
      sort_direction:''
    },
    setSortParam: function(sort_param){
      this.set({'sort_param': sort_param});
    },
    setSortDirection: function(sort_direction){
      this.set({'sort_direction': sort_direction});
    }    
  });

  Report.TableColumnList = Backbone.Collection.extend({
    model: Report.TableColumn,
    url: '/reports/reports/columns.json',
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
    initialize: function() {
      this.listenTo(this.collection, "sort", this.render);
    },

    onAfterItemAdded: function(itemView) {
      itemView.$el.draggable({ revert: true });
    }
  });

  Report.TableHeaderColumnView = Backbone.Marionette.ItemView.extend({
    tagName: 'th',
    template: JST['templates/reports/table_header_column'],

    attributes: function() {
      return {
        "data-header" : this.model.get("internal_name"),
      }
    },

    initialize: function(){
      this.model.on('change', this.render);
    },
    triggers: {
      'click' : 'column:sort',
      'click .icon-remove' : 'column:remove'
    },
  });

  Report.TableHeadView = Backbone.Marionette.CollectionView.extend({
    tagName: 'tr',
    itemView: Report.TableHeaderColumnView,
    initialize: function(){
      this.collection.on('change', this.render);      
    } 
  });

  // Represents single row returned in AA response
  Report.ResponseRow = Backbone.Model.extend({ });

  Report.ResponseRowList = Backbone.Collection.extend({
    model: Report.ResponseRow,
  });

  Report.ResponseRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    template: JST['templates/reports/table_body_row'],

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
      this.columns = this.options.columns.toJSON();
      this.selectedColumns = this.options.columns;

      this.listenTo(this.selectedColumns, "remove", this.onCollectionChange);
      this.listenTo(this.collection, "reset", this.onCollectionChange);
    },

    onCollectionChange: function() {
      this.render();
    },

    onBeforeRender: function() {
      this.columns = this.selectedColumns.toJSON();
    },

    buildItemView: function(item, ItemView){
      var view = new ItemView({
        model: item,
        columns: this.columns
      });

      return view;
    },

    appendHtml: function(collectionView, itemView, index) {
      // hackish way to properly render table
      this.$el.parent().append(itemView.el);
    },

    onDomRefresh: function(){
      var self = this;
      $('#report_table').dragtable({
        stop: function(){
          var columnsOrder = $('#report_table').dragtable('order');
          self.trigger("column:reorder", columnsOrder);
        }
      });
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
          self.trigger("item:drop", dropItem, ui.draggable);
        }
      })
    }
  });
})(ReachUI.namespace("Reports"));
