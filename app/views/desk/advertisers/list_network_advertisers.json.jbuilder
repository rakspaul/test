# desk/advertisers/list_network_advertisers.json.jbuilder
json.array! @all_advertisers, partial: 'desk/advertisers/advertiser', as: :advertiser
