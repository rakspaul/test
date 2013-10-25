class BlockAdvertiserAndGroupExport

  ADVERTISER_SHEET = "Blocked Advertisers"
  ADVERTISER_GROUP_SHEET = "Blocked Advertiser Groups"

  def initialize(current_user)
    @current_user = current_user
  end

  def export_advertiser(blocked_adv)
    blocked_adv_arr = []

    blocked_adv.each do |block_adv|
      sites_arr = []
      if block_adv.visited == false
        adv_name = block_adv.advertiser.name

        blocked_adv.each do |ba|
          if ba.advertiser.name == adv_name && ba.visited == false
            sites_arr << ba.try(:site).try(:name)
            ba.visited = true
          end
        end

        sites_hash = {
          "adv_name" => adv_name,
          "sites_name" => sites_arr.compact
        }

        blocked_adv_arr << sites_hash
      end
    end

    write_to_excel(blocked_adv_arr, "adv_name", ADVERTISER_SHEET)
  end

  def export_advertiser_group(blocked_adv_group)
    blocked_adv_group_arr = []

    blocked_adv_group.each do |block_adv_group|
      sites_arr = []
      if block_adv_group.visited == false
        adv_group_name = block_adv_group.advertiser_block.name

        blocked_adv_group.each do |bag|
          if bag.advertiser_block.name == adv_group_name && bag.visited == false
            sites_arr << bag.try(:site).try(:name)
            bag.visited = true
          end
        end

        sites_hash = {
          "adv_group_name" => adv_group_name,
          "sites_name" => sites_arr.compact
        }

        blocked_adv_group_arr << sites_hash
      end
    end

    write_to_excel(blocked_adv_group_arr, "adv_group_name", ADVERTISER_GROUP_SHEET)
  end

  def write_to_excel(blocked_arr, blcked_name, sheet_name)
    create_sheet(sheet_name)

    row_no = 0
    col_no = 0

    blocked_arr.each do |blocked|
      header = @sheet.row(row_no)
      header.default_format=(@format_color)
      header[col_no] = blocked[blcked_name]

      row_no += 1

      sites_data = @sheet.row(row_no)
      sites_data.set_format(0, @format)
      sites_data[col_no] = blocked['sites_name'].join(',')

      row_no += 2
    end

    spreadsheet = StringIO.new
    @book.write spreadsheet

    spreadsheet.string
  end

  def create_sheet(name)
    Spreadsheet.client_encoding = 'UTF-8'

    @format = Spreadsheet::Format.new :color => :black, :size => 10
    @format_color = Spreadsheet::Format.new :color => :black, :weight => :bold, :size => 11, :pattern_fg_color => :Gray, :pattern => 2

    @book = Spreadsheet::Workbook.new
    @sheet = @book.create_worksheet :name => name
  end

  def get_adv_file
    "#{@current_user.network.name}_Block_Advertisers_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

  def get_adv_group_file
    "#{@current_user.network.name}_Block_Advertisers_group_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

end