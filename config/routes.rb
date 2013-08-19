Reachui::Application.routes.draw do
  root 'account_sessions#new'

  resource :account_session, :path => 'session', as: 'session', only: [:new, :create, :destroy]
  post 'signin' => 'account_sessions#create'
  get 'signout' => 'account_sessions#destroy'


  namespace :reports do
    resources :reports
    resources :query
    resources :dimensions
    resources :columns
  end

  namespace :admin do
    resources :reach_clients
    resources :audience_groups
    resources :exclude_sites
    resources :media_contacts
    resources :billing_contacts
  end

  resources :orders do
    resource :nielsen_campaign, controller: 'nielsen_campaign' do
      member do
        get 'ads'
      end
    end
    resources :lineitems

    collection do
      get 'search'
    end
    get 'export' => 'io_export#export'
  end

  resources :kendoui
  resources :ad_sizes, only: [:index]
  resources :advertisers, only: [:index]
  resources :sales_people, only: [:index]
  resources :nielsen_ocrs, only: [:index, :show] do
    collection do
      get 'search'
    end
  end

  resources :dmas, controller: 'designated_market_areas', only: [:index]
  resource :io_import, controller: 'io_import'
  resources :users
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
end
