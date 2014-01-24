class Video < Lineitem

  DEFAULT_MASTER_ADSIZE = '1x1'
  AD_TYPE = 'STANDARD'
  PRIORITY = 6
  COMPANION_AD_TYPE = 'SPONSORSHIP'
  COMPANION_PRIORITY = 1

  before_validation :set_ad_sizes, :if => :new_record?

  def master_ad_size=(ad_size)
    @master_ad_size = ad_size
  end

  def master_ad_size
    @master_ad_size || (!ad_sizes.blank? ? ad_sizes.split(',')[0].strip : DEFAULT_MASTER_ADSIZE)
  end

  def companion_ad_size=(ad_size)
    @companion_ad_size = ad_size
  end

  def companion_ad_size
    sizes = ad_sizes.split(',') if ad_sizes
    @companion_ad_size || (sizes && sizes.size > 1) ? sizes[1] : nil
  end

private

  def set_ad_sizes
    return unless ad_sizes.blank?
    self.ad_sizes = master_ad_size
    self.ad_sizes = "#{sizes},#{companion_ad_size}" if companion_ad_size
  end
end
