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
        get 'export_blacklisted_advertisers_and_groups'
        get 'export_whitelisted_advertisers'
        get 'advertisers_with_default_blocks'
        get 'blacklisted_advertisers_to_commit' => 'block_sites#blacklisted_advertisers_to_commit'
        get 'whitelisted_advertisers_to_commit' => 'block_sites#whitelisted_advertisers_to_commit'
        get 'blacklisted_advertiser_groups_to_commit' => 'block_sites#blacklisted_advertiser_groups_to_commit'
        get 'whitelisted_advertiser_groups_to_commit' => 'block_sites#whitelisted_advertiser_groups_to_commit'
        post 'recommit' => 'block_sites#recommit'
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
    resources :block_logs do
      collection do
        get 'export'
      end
    end

    resources :block_violations

    resources :platforms do
      collection do
        get 'search'
      end
    end
  end

  resources :users do
    collection do
      get 'search'
    end
  end

  resources :task_types, only: [:index, :search] do
    collection do
      get 'search'
    end
  end

  #get 'task_types' => 'tasks#task_types'

  post 'tasks/:id' => 'tasks#update'

  resources :orders do

    get 'metrics' => 'metrics#order_metrics'

    resources :tasks, :only => [:index]

    resource :nielsen_campaign, controller: 'nielsen_campaign' do
      member do
        get 'ads'
      end
    end

    resources :lineitems do
      get 'metrics' => 'metrics#lineitem_metrics'
      resources :creatives, :only => [:destroy]
    end

    resources :ads, :only => [:index]

    member do
      post 'change_status', 'cancel_revisions'
      get 'status'
    end

    collection do
      get 'search'
      delete 'delete'
    end
    get 'export' => 'io_export#export'

    resources :notes, controller: 'order_notes'
    resources :activities, controller: 'order_activity_logs'
    resources :tasks, controller: 'tasks'
  end

  resources :tasks do
    collection do
      get 'my_tasks'
      get 'user_tasks'
      get 'team_tasks'
      get 'only_team_tasks'
      get 'team_user_tasks'
    end
    get 'comments'
    post 'add_comment' => 'tasks#add_comment'
  end

  post '/file_upload' => 'file_upload#upload', :as => :file_upload
  get '/file_download/:id' => 'file_upload#download', :as => :file_download
  get '/file_delete/:id' => 'file_upload#delete', :as => :file_delete

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
      get :search, :for_reach_client
    end
  end

  resources :media_contacts do
    collection do
      get :search, :for_reach_client
    end
  end

  resources :nielsen_ocrs, only: [:index, :show] do
    collection do
      get 'search'
    end
  end

  resources :dmas, controller: 'geo_targets', only: [:index] do
    collection do
      get :search
    end
  end

  resource :io_import, controller: 'io_import'
  resource :creatives_import, controller: 'creatives_import'

  resources :users
  get 'io_assets/:order_id' => 'io_assets#serve'
  get 'io_assets/:order_id/creatives/:io_asset_id' => 'io_assets#serve'
  get 'io_assets/:order_id/revised_io/:io_asset_id' => 'io_assets#serve'

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

  resources :agency

  resources :platforms, :only => [:index]
  get 'media_types/media_types'

  get 'zones/search'

  resources :key_values do
    collection do
      post 'validate'
    end
  end

  resources :zipcode do
    collection do
      post 'validate'
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
