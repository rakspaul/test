class IoAsset < ActiveRecord::Base
  scope :details, -> { where(asset_type: 'io') }
  scope :io_revised, -> { where(asset_type: 'io_revised').order('created_at ASC') }
  scope :io_creatives, -> { where(asset_type: 'creatives').order('created_at ASC') }

  belongs_to :order

  validates :asset_upload_name, :asset_path, presence: true
end
