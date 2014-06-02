require 'spec_helper'

describe OrdersController do
  setup :activate_authlogic

  let(:reach_client) { FactoryGirl.singleton(:reach_client) }
  let(:user) { FactoryGirl.singleton(:user) }
  let(:advertiser) { FactoryGirl.singleton(:advertiser) }
  let(:io_detail) {FactoryGirl.create(:io_detail)}

  before do
    path = "/tmp/IO_asset1385031164"
    path2 = "/tmp/IO_asset1383656012"
    file = mock('file')
    file.stub(:read)
    file.stub(:close)
    file.stub(:path).and_return(path)
    File.stub(:open).and_call_original
    File.stub(:open).with(path).and_return(file)
    File.stub(:open).with(path2).and_return(file)
    File.stub(:unlink).and_call_original
    File.stub(:unlink).with(path).and_return(file)
    File.stub(:unlink).with(path2).and_return(file)
    FactoryGirl.create(:country)
    FactoryGirl.create(:state)
    FactoryGirl.create(:designated_market_area)
    FactoryGirl.create(:city)
  end

  before :each do
    @account = FactoryGirl.create(:account)
    AccountSession.create(@account)
  end

  describe "GET 'index'" do
    it "returns http success" do
      get 'index'
      expect(response).to be_success
    end
  end

  describe "POST 'create'" do
    context "valid order" do
      it "returns http success" do
        post :create, io_request

        expect(response).to be_success
      end

      it "create a new order" do
        expect{
          post :create, io_request
        }.to change(Order, :count).by(1)
      end

      it "create a new order and sets trafficking contact correctly" do        
        post :create, io_request
        expect(Order.last.io_detail.trafficking_contact.full_name).to eq(io_request["order"]["trafficking_contact_name"])
      end

      it "create a new order and sets account manager correctly" do
        post :create, io_request
        expect(Order.last.io_detail.account_manager.full_name).to eq(io_request["order"]["account_contact_name"])
      end

      it "sets assignee for created order as current user" do
        post :create, io_request
        expect(Order.last.user).to eq(@account.user)
      end

      it "create a new IO detail" do
        expect{
          post :create, io_request
        }.to change(IoDetail, :count).by(1)
      end

      it "create a new billing contact" do
        expect{
          post :create, io_request
        }.to change(BillingContact, :count).by(1)
      end

      it "create a new media contact" do
        expect{
          post :create, io_request
        }.to change(MediaContact, :count).by(1)
      end

      it "create a new lineitem" do
        expect{
          post :create, io_request
        }.to change(Lineitem, :count).by(1)
      end

      it "creates a new video and regular creatives" do
        expect {
          expect {
            expect {
              expect {
                post :create, io_request
              }.to change(Creative, :count).by(2)
            }.to change(VideoCreative, :count).by(1)
          }.to change(LineitemAssignment, :count).by(2)
        }.to change(LineitemVideoAssignment, :count).by(1)
      end

      it "creates new creative with correct html_code attribute (not escaped)" do
        post :create, io_request
        creative = Creative.where(creative_type: "ThirdPartyCreative").first
        expect(creative.html_code).to eq("<iframe frameborder='1' scrolling='no' width='728' height='90' marginwidth='0' marginheight='0'  src='http://greatlakes.placelocal.com/adtag_frame.php?clientID=ab1a4d0dd4d48a2ba1077c4494791306&campaignID=308888&adWidth=728&adHeight=90&campaign_api=dispCamp.getNextCampaign&api_url=api.placelocal.com&domain_name=greatlakes.placelocal.com&tracking_url=tracking.placelocal.com&animationTime=30&clickTag=${CLICKURLENC}&random=${REQUESTID}&landing_page=http%3A%2F%2Fcarzonesales.com'><a href='${CLICKURL}http://greatlakes.placelocal.com/tracking/click.php?campaign_id=308888&invocation_code=ab1a4d0dd4d48a2ba1077c4494791306&url=http%3A%2F%2Fcarzonesales.com' target='_blank' style='display:inline-block'><img src='http://assets.placelocal.com/backup_image.php?campaign_id=308888&width=728&height=90&invocation_code=ab1a4d0dd4d48a2ba1077c4494791306' border='0' /></a></iframe>")
      end

      it "saves creatives with name = ad description + creative's ad_size" do
        post :create, io_request_w_ads
        Order.last.ads.each do |ad|
          ad.creatives.each do |creative|
            ad_description = ad.description.gsub(/\s*\d+x\d+,?/, '')
            expect(creative.name).to start_with(ad_description)
          end
        end
      end

      it "create a new order note" do
        expect{
          post :create, io_request
        }.to change(OrderNote, :count).by(2)
      end
    end

    context "order pulled from DFP" do
      before do
        @order = FactoryGirl.create :dfp_pulled_order
        FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #1"
        FactoryGirl.create :ad, order_id: @order.id, description: "Test ad #2"
        @unknown_reach_client = FactoryGirl.create :reach_client, name: "Unknown"
      end

      it "opens an order page successfully" do
        get :show, {id: @order.id}
      end

      it "assigns 'Unknown' reach client to DFP-pulled order" do
        get :show, {id: @order.id}
        expect(@order.io_detail.reach_client).to eq(@unknown_reach_client)
      end

      it "creates a note with 'Imported Order' text" do
        get :show, {id: @order.id}
        expect(@order.order_notes.last.note).to eq('Imported Order')
      end

      it "creates io_detail on order open" do
        expect {
          get :show, {id: @order.id}
        }.to change(IoDetail, :count).by(1)
      end

      it "assigns draft status to order on open" do
        get :show, {id: @order.id}
        expect(@order.io_detail.state).to eq('draft')
      end

      it "assigns client_advertiser_name to io_detail" do
        get :show, {id: @order.id}
        expect(@order.io_detail.client_advertiser_name).to eq(@order.advertiser.name.to_s)
      end
    end

    context "vaild order w/ City and State and DMA targeting" do
      before :each do
        @us = GeoTarget::Country.where(['country_code = ?', 'US']).first
        @state = GeoTarget::State.find_by name: "New York", country_code: "US"
        @city = GeoTarget::City.find_by name: "New York", source_parent_id: @state.source_id, country_code: "US"
        @dma = GeoTarget::DesignatedMarketArea.find_by name: "Lexington"
      end

      it "creates correct links between city/dma/state targeting and Lineitems" do
        expect(@us).to be
        expect {
          expect {
            expect {
              post :create, io_request
            }.to change(@state.lineitems, :count).by(1)
          }.to change(@city.lineitems, :count).by(1)
        }.to change(@dma.lineitems, :count).by(1)
      end

      it "creates correct links between city/dma/state targeting and Ads" do
        expect {
          expect {
            expect {
              post :create, io_request_w_ads
            }.to change(@state.ads, :count).by(1)
          }.to change(@city.ads, :count).by(1)
        }.to change(@dma.ads, :count).by(1)
      end
    end

    context "invalid order" do
      let(:params) { io_request }

      it "return reach client error" do
        params['order']['reach_client_id'] = false
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:reach_client)
      end

      it "return trafficking contact error" do
        params['order']['trafficking_contact_id'] = false
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:trafficking_contact)
      end

      it "return error on wrong billing contact" do
        params['order'].delete('billing_contact_name')
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:billing_contact)
      end

      it "return error on wrong media contact" do
        params['order'].delete('media_contact_name')
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:media_contact)
      end

      it "return sales person error for invalid record" do
        params['order']['sales_person_name'] = 'wrong name'
        controller.stub(:find_sales_person).and_raise(ActiveRecord::RecordInvalid.new(user))
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:sales_person)
      end

      it "return sales person error" do
        params['order']['sales_person_name'] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors][:sales_person]).to eq("this sales person was not found, please select another one")
      end

      it "return account manager error for invalid account" do
        params['order']['account_contact_name'] = 'wrong name'
        controller.stub(:find_account_manager).and_raise(ActiveRecord::RecordInvalid.new(user))
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:account_manager)
      end

      it "return account manager error" do
        params['order']['account_contact_name'] = ''
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors][:account_manager]).to eq("this account manager was not found, please select another one")
      end

      it "return order name error" do
        order = FactoryGirl.create(:order)
        params['order']['name'] = order.name
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors]).to include(:name)
      end

      it "return lineitems errors" do
        order = FactoryGirl.create(:order)
        params['order']['lineitems'].each do |li|
          li['lineitem']['start_date'] = 21.day.ago.strftime('%Y-%m-%d')
          li['lineitem']['end_date']   = 1.day.ago.strftime('%Y-%m-%d')
        end
        post :create, params

        data = json_parse(response.body)
        expect(data[:errors][:lineitems]['0'][:lineitems]).to include(:start_date)
      end

      it "return error on invalid keyvalue targeting on ad level" do
        params = io_request_w_ads

        {'btg' => "Key value format should be [key]=[value]", 'btg=123 bth=33' => "Key values should be comma separated"}.each do |error_request, error_response|
          params['order']['lineitems'].each do |li|
            li['ads'].each do |ad|
              ad['ad']['targeting']['targeting']['keyvalue_targeting'] = error_request
            end
          end

          expect{
            post :create, params
          }.to change(Order, :count).by(0)

          data = json_parse(response.body)
          expect(data[:errors][:lineitems]['0'][:ads]['0'][:targeting]).to include(error_response)
        end
      end

      it "return error on invalid keyvalue targeting on lineitem level" do
        params = io_request_w_ads

        {'btg' => "Key value format should be [key]=[value]", 'btg=123 bth=33' => "Key values should be comma separated"}.each do |error_request, error_response|
          params['order']['lineitems'].each do |li|
            li['lineitem']['targeting']['targeting']['keyvalue_targeting'] = error_request
          end

          expect{
            post :create, params
          }.to change(Order, :count).by(0)

          data = json_parse(response.body)
          expect(data[:errors][:lineitems]['0'][:targeting]).to include(error_response)
        end
      end
    end

    context "ads" do
      let(:params) { io_request_w_ads }

      it "create new ads" do
        expect{
          post :create, params
        }.to change(Ad, :count).by(1)
      end

      it "creates new regular and video creatives" do
        expect {
          expect {
            post :create, params
          }.to change(Creative, :count).by(2)
        }.to change(VideoCreative, :count).by(1)
      end

      it "creates video and regular lineitem assignments" do
        expect {
          expect {
            post :create, params
          }.to change(LineitemVideoAssignment, :count).by(1)
        }.to change(LineitemAssignment, :count).by(2)
      end

      it "creates video and regular ad assignments" do
        expect {
          expect {
            post :create, params
          }.to change(AdAssignment, :count).by(2)
        }.to change(VideoAdAssignment, :count).by(1)
      end

      it "should set creative_type attribute of created creative" do
        post :create, params
        creative = Creative.last
        expect(creative.creative_type).to eq("InternalRedirectCreative")
      end

      it "create companion ad for video lineitem" do
        params['order']['lineitems'].each do |li|
          li['ads'].each do |ad|
            ad['ad']['type'] = 'Companion'
          end
        end
        media_type = user.network.media_types.where(:category => 'Display').first
        post :create, params
        expect(Ad.last.media_type_id).to eq(media_type.id)
      end

      it "create ad with SPONSORSHIP ad type for mobile ad" do
        params['order']['lineitems'].each do |li|
          li['ads'].each do |ad|
            ad['ad']['type'] = 'Mobile'
          end
        end
        post :create, params
        expect(Ad.last.ad_type).to eq('SPONSORSHIP')
      end
    end
  end

  describe "GET 'show'" do
    let(:order) { FactoryGirl.create(:order_with_lineitem, name: 'order show test') }

    it "returns http success" do
      get 'show', { id: order.id }
      expect(response).to be_success
    end
  end

  describe "PUT 'update'" do
    context "valid order" do
      let!(:order) { FactoryGirl.create(:order_with_lineitem, name: 'order update test') }
      let!(:params) { io_request_w_ads }

      before do
        params['id'] = order.id
        params['order']['lineitems'].each do |li|
          li_id = order.lineitems.first.id
          li['lineitem']['id'] = li_id
          li['lineitem']['order_id'] = order.id
          li['ads'].each do |ad|
            ad['ad']['id'] = order.lineitems.first.ads.first.id
            ad['ad']['order_id'] = order.id
            ad['ad']['io_lineitem_id'] = li_id
          end
        end
      end

      it "returns http success" do
        put :update, params

        expect(response).to be_success
      end

      it "updates assignee to AM if Order is ready_for_am" do
        params['order']['order_status'] = "ready_for_am"
        put :update, params

        expect(response).to be_success
        order = Order.find(params['id'])
        expect(order.user).to eq(order.io_detail.account_manager)
      end

      it "updates assignee to Trafficker if Order is ready_for_trafficker" do
        params['order']['order_status'] = "ready_for_trafficker"
        put :update, params

        expect(response).to be_success
        order = Order.find(params['id'])
        expect(order.user).to eq(order.io_detail.trafficking_contact)
      end
 
      it "update ad start date" do
        li = order.lineitems.first
        ad = order.lineitems.first.ads.first
        ad.update_attribute(:start_date, li.start_date - 1.day)

        params['order']['lineitems'][0]['ads'][0]['start_date'] = li.start_date.strftime('%Y-%m-%d')

        put :update, params
        expect(json_parse(response.body)).not_to include(:errors)
      end
    end
  end

  describe "DELETE 'delete'" do
    let!(:order) { FactoryGirl.create(:order, name: 'order delete test') }
    let!(:order2) { FactoryGirl.create(:order_with_lineitem, name: 'order delete test 2') }

    it "returns http success" do
      delete 'delete', { ids: order.id }
      expect(response).to be_success
    end

    it "delete several orders" do
      expect{
        delete 'delete', { ids: "#{order.id},#{order2.id}" }
      }.to change(Order, :count).by(-2)
    end
  end

  describe "GET 'search'" do
    let!(:order) { FactoryGirl.create(:order_with_lineitem, name: 'order search test') }

    it "returns http success" do
      get 'search', { format: 'json', search: 'search' }
      expect(response).to be_success
    end

    it "returns http success" do
      get 'search', { format: 'json', search: 'search' }
      expect(response).to be_success
    end

    it "search order by search param" do
      get 'search', { format: 'json', search: 'search' }

      data = json_parse(response.body)
      expect(data[0][:name]).to eq('order search test')
    end

    it "empty search returns last updated" do
      get 'search', { format: 'json' }

      data = json_parse(response.body)
      expect(data[0][:name]).to eq('order search test')
    end
  end

  describe "GET 'status'" do
    let(:order) { FactoryGirl.create(:order_with_lineitem, name: 'order show test') }

    it "returns http success" do
      get 'status', { id: order.id }
      expect(response).to be_success
    end

    it "returns order status" do
      get 'status', { id: order.id }

      data = json_parse(response.body)
      expect(data[:status]).to eq('Draft')
    end
  end

  describe "DELETE 'destroy'" do
    before :each do
      advertiser = FactoryGirl.create :advertiser, name: 'testAdvertiser'
      @order = FactoryGirl.create :order, name: 'testOrder', io_detail: io_detail, advertiser: advertiser
    end

    it "returns http success" do
      delete :delete, ids: @order

      response.should be_success
    end

    it "deletes the order" do
      expect{
        delete :delete, ids: @order
      }.to change(Order,:count).by(-1)
    end

    it "deletes the advertiser" do
      expect{
        delete :delete, ids: @order
      }.to change(Advertiser,:count).by(-1)
    end

    it "should not delete advertiser if more than one orders associated" do
      order_one = FactoryGirl.create :order, name: 'order_one', network_advertiser_id: advertiser.id, io_detail: io_detail
      order_two = FactoryGirl.create :order, name: 'order_two', network_advertiser_id: advertiser.id, io_detail: io_detail

      expect{
        delete :delete, ids: order_one
      }.to change(Advertiser,:count).by(0)
    end
  end

private
  def io_request
    params = JSON.parse(File.read( Rails.root.join('spec', 'fixtures', 'requests', 'valid_io.json')))

    user_name = "#{user.first_name} #{user.last_name}"
    start_date = 1.day.from_now.strftime('%Y-%m-%d')
    end_date   = 22.day.from_now.strftime('%Y-%m-%d')

    params['order']['reach_client_id']        = reach_client.id
    params['order']['trafficking_contact_id'] = user.id
    params['order']['trafficking_contact_name'] = user.full_name
    params['order']['sales_person_name']      = user_name
    params['order']['account_contact_name']   = user_name
    params['order']['account_contact_id']     = user.id
    params['order']['start_date'] = start_date
    params['order']['end_date'] = end_date
    params['order']['advertiser_id'] = advertiser.id
    params['order']['lineitems'].each do |li|
      li['lineitem']['proposal_li_id'] = "#{SecureRandom.random_number(10000)}"
      li['lineitem']['start_date'] = start_date
      li['lineitem']['end_date']   = end_date
      li['lineitem']['creatives'].each do |creative|
        creative['creative']['start_date'] = start_date
        creative['creative']['end_date']   = end_date
      end
    end
    li = params['order']['lineitems'].first
    if li
      us = GeoTarget::Country.where(['country_code = ?', 'US']).first
      state = GeoTarget::State.find_by name: "New York", country_code: "US"
      city = GeoTarget::City.find_by name: "New York", source_parent_id: state.source_id, country_code: "US"
      dma = GeoTarget::DesignatedMarketArea.find_by name: "Lexington"

      li['lineitem']['targeting']['targeting']['selected_geos'] = [{id: city.id, title: "New York/New York/US", type: "City"}, {id: state.id, title: "New York/United States", type: "State"}, {id: dma.id, title: "Lexington", type: "DMA"}]

      creative = li['lineitem']['creatives'].first
      creative['creative']['ad_size'] = "1x1"
    end

    { :format => 'json' }.merge params
  end

  def io_request_w_ads
    params = JSON.parse(File.read( Rails.root.join('spec', 'fixtures', 'requests', 'valid_io_w_ads.json')))

    user_name = "#{user.first_name} #{user.last_name}"
    start_date = 1.day.from_now.strftime('%Y-%m-%d')
    end_date   = 22.day.from_now.strftime('%Y-%m-%d')

    params['order']['reach_client_id']        = reach_client.id
    params['order']['trafficking_contact_id'] = user.id
    params['order']['trafficking_contact_name'] = user.full_name
    params['order']['sales_person_name']      = user_name
    params['order']['account_contact_name']   = user_name
    params['order']['account_contact_id']     = user.id
    params['order']['start_date'] = start_date
    params['order']['end_date'] = end_date
    params['order']['advertiser_id'] = advertiser.id
    params['order']['lineitems'].each do |li|
      li['lineitem']['proposal_li_id'] = "#{SecureRandom.random_number(10000)}"
      li['lineitem']['start_date'] = start_date
      li['lineitem']['end_date']   = end_date
      li['lineitem']['creatives'].each do |creative|
        creative['creative']['start_date'] = start_date
        creative['creative']['end_date']   = end_date
      end

      li['ads'].each do |ad|
        ad['ad']['start_date'] = start_date
        ad['ad']['end_date'] = end_date
        ad['ad']['creatives'].each do |creative|
          creative['creative']['start_date'] = start_date
          creative['creative']['end_date']   = end_date
        end
        ad['ad']['type'] = 'Video'
      end

      ad = li['ads'].first
      if ad
        us = GeoTarget::Country.where(['country_code = ?', 'US']).first
        state = GeoTarget::State.find_by name: "New York", country_code: "US"
        city = GeoTarget::City.find_by name: "New York", source_parent_id: state.source_id, country_code: "US"
        dma = GeoTarget::DesignatedMarketArea.find_by name: "Lexington"

        ad['ad']['targeting']['targeting']['selected_geos'] = [{id: city.id, title: "New York/New York/US", type: "City"}, {id: state.id, title: "New York/United States", type: "State"}, {id: dma.id, title: "Lexington", type: "DMA"}]
        creative = ad['ad']['creatives'].first
        creative['creative']['ad_size'] = "1x1"
      end
    end

    li = params['order']['lineitems'].first
    if li
      creative = li['lineitem']['creatives'].first
      creative['creative']['ad_size'] = "1x1"
    end

   { :format => 'json' }.merge params
  end
end
