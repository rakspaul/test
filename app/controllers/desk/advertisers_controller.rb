class Desk::AdvertisersController < Desk::DeskController

  respond_to :json

  def index
    @advertisers = filtered_orders.joins(:advertiser)
                    .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  def search
    @advertisers_search = filtered_orders.joins(:advertiser)
                          .where("lower(network_advertisers.name) ilike lower(?)", "%#{params[:search]}%")
                          .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  #below 2 actions are not used
  def list_network_advertisers
    @all_advertisers = Order.of_network(current_network)
                            .joins(:advertiser)
                            .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  def search_network_advertisers
    @all_advertisers_search = Order.of_network(current_network)
                            .joins(:advertiser)
                            .where("lower(network_advertisers.name) ilike lower(?)", "%#{params[:search]}%")
                            .select('network_advertiser_id as id, network_advertisers.name as name').distinct
  end

  private

  def filtered_orders
    if current_user.network_user?
      Order.of_network(current_network)
    else
      Order.of_agency(current_user.agency)
    end
  end
end
