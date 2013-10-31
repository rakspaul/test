class IoLog < ActiveRecord::Base
  self.table_name = "reach_io_logs"
  
  # we already have `type` column which is reserved for single-table inheritance so changing the default
  self.inheritance_column = "poly_type" 

  belongs_to :order

  def full_message
    case type
    when /ad/
      "Ad #{ad_id}: #{message}"
    when /creative/
      "Creative #{creative_id}: #{message}"
    end
  end
end
