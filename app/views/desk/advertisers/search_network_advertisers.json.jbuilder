# desk/advertisers/list_network_advertisers.json.jbuilder
json.array! @all_advertisers_search, partial: 'desk/advertisers/advertiser', as: :advertiser
