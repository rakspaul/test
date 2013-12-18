Reachui::Application.routes.draw do
  root 'account_sessions#new'

  resource :account_session, :path => 'session', as: 'session', only: [:new, :create, :destroy]
  post 'signin' => 'account_sessions#create'
  get 'signout' => 'account_sessions#destroy'


  namespace :reports do
    resources :reports
    resources :query
    resources :schedule_reports
    resources :dimensions
    resources :columns
  end


  namespace :admin do
    resources :reach_clients
    resources :audience_groups
    resources :media_contacts
    resources :billing_contacts

    resources :block_sites do
      collection do
        post 'commit' => 'block_sites#commit'
        get 'blacklisted_advertisers' => 'block_sites#get_blacklisted_advertisers'
        get 'blacklisted_advertiser_groups' => 'block_sites#get_blacklisted_advertiser_groups'
        get 'whitelisted_advertisers' => 'block_sites#get_whitelisted_advertiser'
        get 'whitelisted_advertiser_groups' => 'block_sites#get_whitelisted_advertiser_groups'
        get 'export_blacklisted_advertisers_and_groups'
        get 'export_whitelisted_advertisers'
        get 'advertisers_with_default_blocks'
      end
    end

    resources :blocked_advertisers do
      collection do
        get 'get_blocked_sites_on_advertiser'
        get 'get_blocked_sites_on_advertiser_group'
        get 'export_blocked_sites_on_advertisers'
        get 'export_blocked_sites_on_advertiser_groups'
      end
    end

    resources :default_block_list do
      collection do
        get 'export'
        get 'whitelisted_sites'
      end
    end
  end

  resources :users do
    collection do
      get 'search'
    end
  end


  resources :orders do
    resource :nielsen_campaign, controller: 'nielsen_campaign' do
      member do
        get 'ads'
      end
    end

    resources :lineitems do
      resources :creatives, :only => [:destroy]
    end

    resources :ads, :only => [:index]

    member do
      post 'change_status'
      get 'status'
    end

    collection do
      get 'search'
      delete 'delete'
    end
    get 'export' => 'io_export#export'

    resources :notes, controller: 'order_notes'
  end

  resources :kendoui
  resources :ad_sizes, only: [:index]
  resources :advertisers, only: [:index] do
    collection do
      get 'search'
      post 'validate'
    end
  end
  resources :sales_people, only: [:index]

  resources :reach_clients do
    collection do
      get :search
    end
  end

  resources :billing_contacts do
    collection do
      get :search
    end
  end

  resources :media_contacts do
    collection do
      get :search
    end
  end

  resources :nielsen_ocrs, only: [:index, :show] do
    collection do
      get 'search'
    end
  end

  resources :dmas, controller: 'designated_market_areas', only: [:index]
  resource :io_import, controller: 'io_import'
  resource :creatives_import, controller: 'creatives_import'

  resources :users
  get 'io_assets/:order_id' => 'io_assets#serve'

  resources :segments do
    collection do
      get 'search'
    end
  end

  resources :sites do
    collection do
      get 'search'
      get 'blacklisted_sites'
    end
  end

  resources :contexts do
    collection do
      get 'search'
    end
  end

  resources :advertiser_blocks do
    collection do
      get 'search'
    end
  end

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  mount JasmineRails::Engine => "/specs" if defined?(JasmineRails)
end
