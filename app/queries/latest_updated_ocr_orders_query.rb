class LatestUpdatedOcrOrdersQuery
  def initialize(relation = Order.all)
    @relation = relation
  end

  def all
    @relation
      .joins("left outer join nielsen_campaigns on nielsen_campaigns.order_id = orders.id")
      .where.not(nielsen_campaigns: {order_id: nil})
      .latest_updated
  end
end
