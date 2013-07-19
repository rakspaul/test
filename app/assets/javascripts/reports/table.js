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
    model: Report.TableColumn,
    comparator: function(column) {
      return column.get('index');
    }
  });

  Report.TableHeaderColumnView = Backbone.Marionette.ItemView.extend({
    tagName: 'th',
    template: _.template('<%= name %>'),
  });

  Report.TableHeadView = Backbone.Marionette.CollectionView.extend({
    tagName: 'tr',
    itemView: Report.TableHeaderColumnView,

  });

  // Represents single row returned in AA response
  Report.ResponseRow = Backbone.Model.extend({ });

  Report.ResponseRowList = Backbone.Collection.extend({
    model: Report.ResponseRow,
  });

  // template:
  // for(col in columns) {
  //  <td>model.get(col)</td>
  // }
  Report.ResponseRowView = Backbone.Marionette.ItemView.extend({
    tagName: 'td',
    template: _.template("<% for(col in columns) { print( model[columns[col]]) } %>"),
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
    tagName: 'tr',
    itemView: Report.ResponseRowView,

    initialize: function() {
      this.columns = this.options.columns.pluck('name');
    },

    // itemViewOptions: {
    //   columns: 'test',
    // },
    buildItemView: function(item, ItemView){
      var view = new ItemView({
        model: item,
        columns:this.columns
      });
      return view;
    },

   }); 
  // <table id='report_table'>
  //  <thead class='head-region'></thead>
  //  <tbody class='body-region'></tbody>
  // </table>
  Report.TableLayout = Backbone.Marionette.Layout.extend({
    template: JST['templates/reports/table_layout'],
    regions: {
      'head': '#head-region',
      'body': '#body-region'
    },

    onRender: function() {
     this.$el.droppable({
      accept: ".dimensions-list li",
      drop: function(event, ui){
        ui.draggable.hide();
        alert($(ui.draggable).text());

     }})
    }

  });
})(ReachUI.namespace("Reports"));
