class BlockLog < ActiveRecord::Base
  self.table_name = "reach_block_logs"

  belongs_to :site
  belongs_to :user
  belongs_to :advertiser
  belongs_to :advertiser_block, :foreign_key => 'advertiser_group_id'

  def self.of_network(network)
    where("users.company_id" => network.id)
  end
end
