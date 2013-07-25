class SearchOrdersQuery
  def initialize(relation = Order.all)
    @relation = relation.includes(:advertiser)
  end

  def search(term)
    id = Integer(term) rescue 0

    # assume that number above 4 digit is search on 'id' or 'source id'
    if id > 9999
      @relation = @relation.find_by_id_or_source_id(id)
    else
      @relation = @relation.where(
                    "orders.name ilike :q or
                      network_advertisers.name ilike :q", q: "%#{term}%"
                  ).references(:advertiser)
    end

    @relation
  end
end
