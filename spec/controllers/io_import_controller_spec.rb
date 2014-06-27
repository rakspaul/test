require 'spec_helper'

describe IoImportController do
  setup :activate_authlogic

  let(:io_file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx') }
  let(:io_file_revised) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_revised.xlsx') }
  let(:io_file_revised_w_new_lis) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_revised_new_lis.xlsx') }
  let(:io_file_multi_li) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_multi_LI.xlsx') }
  let(:io_file_w_prerolls) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_prerolls.xlsx') }

  before do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    request.env["HTTP_ACCEPT"] = 'application/json'
  end

  describe "revised orders" do
    let(:data_source) { DataSource.create name: "Test Source", ident: "source ident" }
    let(:collective_network) { Network.create name: 'Collective', :data_source => data_source }
    let(:user) { FactoryGirl.create :user }

    before do
      start_date = Date.today.to_s+" 00:00:00"
      end_date = (Date.today+10.days).to_s+" 23:59:59"
      end_date2 = (Date.today+5.days).to_s+" 23:59:59"
      @order = FactoryGirl.create :order, name: "Otterbein University on Audience Network & RR (6.27-8.18.13) – 799361", start_date: start_date, end_date: end_date
      io_detail = FactoryGirl.create :io_detail, client_order_id: "7762936"

      ReachClient.create name: "Time Warner Cable", abbr: "TWC", network_id: collective_network.id

      ad_size1 = AdSize.create size: "300x250", width: 300, height: 250, network_id: user.network.id
      ad_size2 = AdSize.create size: "728x90", width: 728, height: 90, network_id: user.network.id
      ad_size3 = AdSize.create size: "160x600", width: 160, height: 600, network_id: user.network.id
      ad_size3 = AdSize.create size: "1x1", width: 1, height: 1, network_id: user.network.id
      creative = FactoryGirl.create :creative

      lineitem = FactoryGirl.create :lineitem, start_date: start_date, end_date: end_date, name: "Age 18-34 or Age 34-50 or Education; Columbus Zips", volume: 300_000, order: @order, user: user

      lineitem2 = FactoryGirl.create :lineitem_video, start_date: start_date, end_date: end_date2, name: "RON; Columbus Zips", volume: 210_000, alt_ad_id: "2", order: @order, user: user
      lineitem_video_assignment = FactoryGirl.create :lineitem_assignment, start_date: start_date, end_date: end_date2, creative: creative, lineitem: lineitem2
      @order.io_detail = io_detail
      @order.save
      @order.lineitems << lineitem
      @order.lineitems << lineitem2
    end

    context "revised order" do
      it "sets #is_existing_order flag to true" do
        post 'create', { io_file: io_file_revised, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['is_existing_order']).to eq(true)
      end

      it "imports new LIs along with revisions for old ones" do
        post 'create', { io_file: io_file_revised_w_new_lis, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['is_existing_order']).to eq(true)
        expect(data['lineitems'].count).to eq(4)
        expect(data['order']['revisions'].count).to eq(2)
        expect(data['lineitems'][0]['revised']).to eq(true)
        expect(data['lineitems'][1]['revised']).to eq(true)
        expect(data['lineitems'][2]['revised']).to eq(true) # 2 new LIs should be highlighted also
        expect(data['lineitems'][3]['revised']).to eq(true)
        expect(data['lineitems'][2]['name']).to eq("Test New LI")
        expect(data['lineitems'][3]['name']).to eq("Test New LI #2")
        expect(data['lineitems'][2]['volume']).to eq(100_000)
        expect(data['lineitems'][3]['volume']).to eq(150_000)
        expect(data['lineitems'][2]['rate']).to eq("5.0")
        expect(data['lineitems'][3]['rate']).to eq("4.0")
      end

      it "imports new LIs along with creatives with them" do
        post 'create', { io_file: io_file_revised_w_new_lis, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['is_existing_order']).to eq(true)
        expect(data['lineitems'].count).to eq(4)
        expect(data['order']['revisions'].count).to eq(2)
        expect(data['lineitems'][2]['creatives'].count).to eq(1)
      end

      it "does not change the number of creatives after import of revised order" do
        post 'create', { io_file: io_file_revised, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['revisions'][0]).to be
        expect(data['lineitems'][0]['creatives'].count).to eq(0)
        expect(data['lineitems'][1]['creatives'].count).to eq(1)
      end

      it "sees changes in start_date and end_date and in impressions of lineitems" do
        post 'create', { io_file: io_file_revised, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['revisions'][0]).to be
        expect(data['order']['revisions'][0]['start_date']).to match('2014-08-17')
        expect(data['order']['revisions'][0]['end_date']).to match('2014-08-29')
        expect(data['order']['revisions'][0]['volume']).to eq(400_000)
      end

      it "does not change order name" do
        post 'create', { io_file: io_file_revised, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['name']).to eq(@order.name)
      end

      it "does not change AM, Trafficker, Reach Client and Sales Person and Advertiser" do
        post 'create', { io_file: io_file_revised, current_order_id: @order.id, format: :json }

        data = JSON.parse(response.body)

        expect(data['order']['account_contact_id']).to eq(@order.io_detail.account_manager_id)
        expect(data['order']['sales_person_id']).to eq(@order.io_detail.sales_person_id)
        expect(data['order']['reach_client_id']).to eq(@order.io_detail.reach_client_id)
        expect(data['order']['trafficking_contact_id']).to eq(@order.io_detail.trafficking_contact_id)
        expect(data['order']['advertiser_id']).to eq(@order.network_advertiser_id)
      end
    end

    context "same not revised order" do
      it "sets #is_existing_order flag to false" do
        post 'create', { io_file: io_file_multi_li, format: :json }

        data = JSON.parse(response.body)
        expect(data['order']['is_existing_order']).to eq(false)
      end
    end
  end

  describe "POST 'create'" do
    context "valid io order" do

      it "renders create json template" do
        post 'create', { io_file: io_file, format: :json }

        expect(response).to render_template("create")
      end

      it "returns order json" do
        post 'create', { io_file: io_file, format: :json }

        data = JSON.parse(response.body)
        expect(data).to include('order')
      end

      it "returns lineitems json" do
        post 'create', { io_file: io_file, format: :json }

        data = JSON.parse(response.body)
        expect(data).to include('lineitems')
      end

      it "has *revised* flag not set for lineitems" do
        post 'create', { io_file: io_file, format: :json }

        data = JSON.parse(response.body)
        expect(data).to include('lineitems')
        expect(data['lineitems'][0]['revised']).to eq(false)
      end

      it "returns lineitem with related creatives" do
        post 'create', { io_file: io_file_multi_li, format: :json }

        data = JSON.parse(response.body)
        expect(data['lineitems'][2]['creatives']).to have(3).items
      end

      it "imports all video creatives" do
        post 'create', { io_file: io_file_w_prerolls, format: :json }

        data = JSON.parse(response.body)
        4.times do |li_i|
          expect(data['lineitems'][li_i]['creatives']).to have(1).items
        end
      end
    end
  end
end
