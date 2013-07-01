class IoAsset < ActiveRecord::Base
  belongs_to :order

  validates :asset_upload_name, :asset_path, presence: true
end
