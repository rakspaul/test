class BlockSitesExport

  ADVERTISER_HEADER = "Advertisers"
  ADVERTISER_GROUP_HEADER = "Advertiser Groups"
  HEADER_ROW = 2
  SITES_SHEET = "Blocked Sites"

  def initialize(blocked_sites, current_user)
    @blocked_sites = blocked_sites
    @current_user = current_user
  end

  def export_blacklisted_advertisers_and_groups
    prepare_data

    write_to_file(true)
  end

  def export_whitelisted_advertisers
    prepare_data

    write_to_file(false)
  end

  def get_file
    "#{@current_user.network.name}_Block_Sites_#{Date.today.strftime('%Y-%m-%d')}.xls"
  end

  def create_sheet
    Spreadsheet.client_encoding = 'UTF-8'

    @format = Spreadsheet::Format.new :color => :black, :weight => :bold, :size => 10
    @format_color = Spreadsheet::Format.new :color => :black, :weight => :bold, :size => 11, :pattern_fg_color => :Gray, :pattern => 2

    @book = Spreadsheet::Workbook.new
    @sheet = @book.create_worksheet :name => SITES_SHEET
  end

  def prepare_data
    @blocked_sites_arr = []

    @blocked_sites.each do |block_site|
      adv_array = []
      adv_group_array = []
      if block_site.visited == false
        site_name = block_site.site.name

        @blocked_sites.each do |bs|
          if bs.site.name == site_name && bs.visited == false
            if bs.type == BlockSite::BLOCKED_ADVERTISER
              adv_array << bs.try(:advertiser).try(:name)
            elsif bs.type == BlockSite::BLOCKED_ADVERTISER_GROUP
              adv_group_array << bs.try(:advertiser_block).try(:name)
            end
          bs.visited = true
          end
        end

        adv_and_grp_hash = {
          "site_name" => site_name,
          "adv_name" => adv_array.compact,
          "adv_grp_name" => adv_group_array.compact
        }

        @blocked_sites_arr << adv_and_grp_hash
      end
    end
  end

  def write_to_file(export_advertiser_groups)
    create_sheet

    row_no = 0
    col_no = 0
    advertiser_row_count = 0
    advertiser_group_count = 0

    @blocked_sites_arr.each do |bs|
      row_count = row_no + HEADER_ROW

      adv_len = bs['adv_name'].length
      adv_grp_len = bs['adv_grp_name'].length

      site_header = @sheet.row(row_no)
      site_header.default_format=(@format_color)
      site_header[col_no] = bs['site_name']

      row_no += 1
      adv_header_row = @sheet.row(row_no)
      advertiser_row_count = write_advertisers(@format, @sheet, bs, adv_header_row, row_no, 0)
      advertiser_group_count = write_advertiser_groups(@format, @sheet, bs, adv_header_row, row_no, 1) if export_advertiser_groups

      if advertiser_row_count > advertiser_group_count
        row_no = row_count + advertiser_row_count
      elsif advertiser_row_count <= advertiser_group_count
        row_no = row_count + advertiser_group_count
      end
    end

    spreadsheet = StringIO.new
    @book.write spreadsheet

    spreadsheet.string
  end

  def write_advertisers(format, sheet, bs, adv_header_row, row_no, col_no)
    adv_header_row.set_format(0, format)
    adv_header_row[col_no] = ADVERTISER_HEADER

    bs['adv_name'].each do |adv|
      row_no += 1
      adv_data = sheet.row(row_no)
      adv_data[col_no] = adv
    end
    return bs['adv_name'].length + 1;
  end

  def write_advertiser_groups(format, sheet, bs, adv_header_row, row_no, col_no)
    adv_header_row.set_format(1, format)
    adv_header_row[col_no] = ADVERTISER_GROUP_HEADER

    bs['adv_grp_name'].each do |adv_grp|
      row_no += 1
      adv_grp_data = sheet.row(row_no)
      adv_grp_data[col_no] = adv_grp
    end
    return bs['adv_grp_name'].length + 1;
  end

end
