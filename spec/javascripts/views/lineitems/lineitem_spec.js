describe('Line items views', function() {
  describe('ReachUI.LineItems.LineItemView', function() {

    beforeEach(function() {
      this.lineitem = new ReachUI.LineItems.LineItem({
        name:       'Pre-roll Video Line Item',
        start_date: '2014-03-21',
        end_date:   '2014-03-28',
        volume:     300124,
        rate:       1.9856,
        ad_sizes:   '1x1',
        creatives:  [],
        type:       'Display'
      });

      this.view = new ReachUI.LineItems.LineItemView({ model: this.lineitem });
    });

    it('should be defined', function() {
      expect(ReachUI.LineItems.LineItemView).toBeDefined();
    });

    it('can be instantiated', function() {
      expect(this.view).not.toBeNull();
    });

    describe('should update model attributes', function() {
      beforeEach(function() {
        var el = this.view.render().$el;
        $('body').append(el);
      });

      xit('should update start date attribute', function() {
        console.log(this.view.model.get('start_date'));
        var startDate = this.view.$el.find('.start-date'),
            date = new Date(2014, 6, 4),
            formattedDate = moment(date).format("YYYY-MM-DD");


        startDate.find('.editable').editable('show');

        //console.log(startDate);

        startDate.find('.start-date-editable').html(formattedDate);
        startDate.find('.editable').editable('setValue', date);
        //startDate.datepicker('update', date);

        console.log(startDate.find('.editable').editable('getValue'));
        //startDate.find('button[type=submit]').click();
        startDate.find('form').submit();

        expect(this.view.model.get('start_date')).toBe('2014-06-04');
      });

      it('should update name attribute', function() {
        var name = this.view.$el.find('.name');

        name.find('.editable').editable('show');
        name.find('input').val('Test lineitem name');
        name.find('button[type=submit]').click();

        expect(this.view.model.get('name')).toBe('Test lineitem name');
      });

      it('should update rate attribute', function() {
        var rate = this.view.$el.find('.rate');

        rate.find('.rate-editable').editable('show');
        rate.find('input').val(5.3);
        rate.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('rate'))).toBe(5.3);
      });

      it('should update volume attribute', function() {
        var volume = this.view.$el.find('.volume');

        volume.find('.volume-editable').editable('show');
        volume.find('input').val(78);
        volume.find('button[type=submit]').click();

        expect(parseFloat(this.view.model.get('volume'))).toBe(78);
      });
    });
  });
});

/*<span class="editable start-date-editable editable-click editable-open" data-type="date" data-name="start_date" data-date-format="yyyy-mm-dd" data-pk="1" contenteditable="true" data-original-title="" title="">2014-03-21</span>
<div class="popover fade in editable-container editable-popup top" style="position: relative; display: block; top: -308px; left: -154px; ">
  <div class="arrow"></div>
  <h3 class="popover-title"></h3>
  <div class="popover-content"> <div>
  <div class="editableform-loading" style="display: none; "></div>
  <form class="form-inline editableform" style="">
    <div class="control-group"><div>
    <div class="editable-input">
      <div class="editable-date well">
        <div class="datepicker datepicker-inline">
          <div class="datepicker-days" style="display: block; ">
            <table class=" table-condensed">
              <thead>
                <tr>
                  <th class="prev" style="visibility: hidden; ">
                    <i class="icon-arrow-left"></i>
                  </th>
                  <th colspan="5" class="datepicker-switch">June 2014</th>
                  <th class="next" style="visibility: visible; ">
                    <i class="icon-arrow-right"></i>
                  </th>
                </tr>
                <tr>
                  <th class="dow">Su</th>
                  <th class="dow">Mo</th>
                  <th class="dow">Tu</th>
                  <th class="dow">We</th>
                  <th class="dow">Th</th>
                  <th class="dow">Fr</th>
                  <th class="dow">Sa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="old disabled day">25</td>
                  <td class="old disabled day">26</td>
                  <td class="old disabled day">27</td>
                  <td class="old disabled day">28</td>
                  <td class="old disabled day">29</td>
                  <td class="old disabled day">30</td>
                  <td class="old disabled day">31</td>
                </tr>
                <tr>
                  <td class="disabled day">1</td>
                  <td class="disabled day">2</td>
                  <td class="disabled day">3</td>
                  <td class="day">4</td>
                  <td class="day">5</td>
                  <td class="day">6</td>
                  <td class="day">7</td>
                </tr>
                <tr>
                  <td class="day">8</td>
                  <td class="day">9</td>
                  <td class="day">10</td>
                  <td class="day">11</td>
                  <td class="day">12</td>
                  <td class="day">13</td>
                  <td class="day">14</td>
                </tr>
                <tr>
                  <td class="day">15</td>
                  <td class="day">16</td>
                  <td class="day">17</td>
                  <td class="day">18</td>
                  <td class="day">19</td>
                  <td class="day">20</td>
                  <td class="day">21</td>
                </tr>
                <tr>
                  <td class="day">22</td>
                  <td class="day">23</td>
                  <td class="day">24</td>
                  <td class="day">25</td>
                  <td class="day">26</td>
                  <td class="day">27</td>
                  <td class="day">28</td>
                </tr>
                <tr>
                  <td class="day">29</td>
                  <td class="day">30</td>
                  <td class="new day">1</td>
                  <td class="new day">2</td>
                  <td class="new day">3</td>
                  <td class="new day">4</td>
                  <td class="new day">5</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="7" class="today" style="display: none; ">Today</th>
                </tr>
                <tr>
                  <th colspan="7" class="clear" style="display: none; ">Clear</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="datepicker-months" style="display: none; ">
            <table class="table-condensed"><thead>
              <tr>
                <th class="prev" style="visibility: hidden; ">
                  <i class="icon-arrow-left"></i>
                </th>
                <th colspan="5" class="datepicker-switch">2014</th>
                <th class="next" style="visibility: visible; ">
                  <i class="icon-arrow-right"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="7">
                  <span class="month disabled">Jan</span>
                  <span class="month disabled">Feb</span>
                  <span class="month active disabled">Mar</span>
                  <span class="month disabled">Apr</span>
                  <span class="month disabled">May</span>
                  <span class="month">Jun</span>
                  <span class="month">Jul</span>
                  <span class="month">Aug</span>
                  <span class="month">Sep</span>
                  <span class="month">Oct</span>
                  <span class="month">Nov</span>
                  <span class="month">Dec</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="7" class="today" style="display: none; ">Today</th>
              </tr>
              <tr>
                <th colspan="7" class="clear" style="display: none; ">Clear</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="datepicker-years" style="display: none; ">
          <table class="table-condensed">
            <thead>
              <tr>
                <th class="prev" style="visibility: hidden; ">
                  <i class="icon-arrow-left"></i>
                </th>
                <th colspan="5" class="datepicker-switch">2010-2019</th>
                <th class="next" style="visibility: visible; ">
                  <i class="icon-arrow-right"></i>
                </th>
              </tr>ґ
            </thead>
            <tbody>
              <tr>
                <td colspan="7">
                  <span class="year old disabled">2009</span>
                  <span class="year disabled">2010</span>
                  <span class="year disabled">2011</span>
                  <span class="year disabled">2012</span>
                  <span class="year disabled">2013</span>
                  <span class="year active">2014</span>
                  <span class="year">2015</span>
                  <span class="year">2016</span>
                  <span class="year">2017</span>
                  <span class="year">2018</span>
                  <span class="year">2019</span>
                  <span class="year new">2020</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="7" class="today" style="display: none; ">Today</th>
              </tr>
              <tr>
                <th colspan="7" class="clear" style="display: none; ">Clear</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    <div class="editable-clear">
      <a href="#">× clear</a>
    </div>
  </div>
  <div class="editable-buttons">
    <button type="submit" class="btn btn-primary editable-submit">
      <i class="icon-ok icon-white"></i>
    </button>
    <button type="button" class="btn editable-cancel">
      <i class="icon-remove"></i>
    </button>
  </div>
</div>
<div class="editable-error-block help-block" style="display: none; "></div>

</div></form></div></div></div>
*/