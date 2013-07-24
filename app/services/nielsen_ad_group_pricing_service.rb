# set to create lineitems behind the scene and set nielsen_pricing
class NielsenAdGroupPricingService
  def initialize(order, user)
    @order = order
    @user = user
  end

  def set_pricing(ocr_lineitems)
    ocr_lineitems.each do |ocr_lineitem|
      li_name = ocr_lineitem['name']
      lineitem = find_or_build_by_alt_ad_id(li_name)

      if lineitem
        nielsen_pricing = lineitem.nielsen_pricing || lineitem.build_nielsen_pricing
        nielsen_pricing.cpp = ocr_lineitem['cpp'].to_f
        nielsen_pricing.trp = ocr_lineitem['trp'].to_f

        lineitem.save!
      end
    end
  end

  private
    def find_or_build_by_alt_ad_id(alt_ad_id)
      lineitem = @order.lineitems.where(name: alt_ad_id).first
      if lineitem.nil?
        ads = @order.ads.where(alt_ad_id: alt_ad_id).select('id, start_date, end_date, size').includes(:ad_pricing)
        lineitem = build_lineitem(alt_ad_id, ads) unless ads.empty?
      end

      lineitem
    end

    def build_lineitem(alt_ad_id, ads)
      min_start_date = ads.map(&:start_date).min
      max_end_date = ads.map(&:end_date).max

      # Ad start/end date also include time, therefore if dates fall out of
      # order range, use order start and end dates
      min_start_date = @order.start_date if min_start_date < @order.start_date
      max_end_date = @order.end_date if max_end_date > @order.end_date

      ad_sizes = ads.map(&:size).uniq.join(',')
      ad_pricing = ads.map(&:ad_pricing)

      rate = ad_pricing.first.rate
      quantity = ad_pricing.map(&:quantity).sum
      value = ad_pricing.map(&:value).sum

      lineitem = @order.lineitems.build({
        name: alt_ad_id,
        alt_ad_id: alt_ad_id,
        start_date: min_start_date,
        end_date: max_end_date,
        ad_sizes: ad_sizes,
        rate: rate,
        volume: quantity,
        value: value
      })
      lineitem.user = @user

      lineitem
    end
end
