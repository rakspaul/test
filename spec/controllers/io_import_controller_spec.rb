require 'spec_helper'

describe IoImportController do
  setup :activate_authlogic

  let(:io_file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx') }
  let(:io_file_revised) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_revised.xlsx') }
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
      @order = FactoryGirl.create :order, name: "Otterbein University on Audience Network & RR (6.27-8.18.13) – 799361", start_date: Time.now, end_date: Time.now.advance(days: +10)
      io_detail = FactoryGirl.create :io_detail, client_order_id: "7762936"

      ReachClient.create name: "Time Warner Cable", abbr: "TWC", network_id: collective_network.id

      ad_size1 = AdSize.create size: "300x250", width: 300, height: 250, network_id: user.network.id
      ad_size2 = AdSize.create size: "728x90", width: 728, height: 90, network_id: user.network.id
      ad_size3 = AdSize.create size: "160x600", width: 160, height: 600, network_id: user.network.id

      lineitem = FactoryGirl.create :lineitem, start_date: Time.now, end_date: Time.now.advance(days: +10), name: "Age 18-34 or Age 34-50 or Education; Columbus Zips", volume: 300_000, order: @order, user: user

      lineitem2 = FactoryGirl.create :lineitem, start_date: Time.now, end_date: Time.now.advance(days: +5), name: "RON; Columbus Zips", volume: 210_000, alt_ad_id: "2", order: @order, user: user
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
        expect(data['order']['name']).to eq("Otterbein University on Audience Network & RR (6.27-8.18.13) – 799361")
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
