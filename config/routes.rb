Reachui::Application.routes.draw do
  get "adsizes/index"
  root 'account_sessions#new'

  resource :account_session, :path => 'session', as: 'session', only: [:new, :create, :destroy]
  post 'signin' => 'account_sessions#create'
  get 'signout' => 'account_sessions#destroy'

  namespace :reports do
    resources :reports
  end

  resources :orders do
    resources :lineitems
    collection do
      get 'search'
    end
    get 'export'
  end

  resources :ad_sizes, only: [:index]
  resources :advertisers, only: [:index]
  resources :sales_people, only: [:index]

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
