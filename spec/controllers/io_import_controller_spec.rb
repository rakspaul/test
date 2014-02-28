require 'spec_helper'

describe IoImportController do
  setup :activate_authlogic

  let(:io_file) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xlsx') }
  let(:io_file_multi_li) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_multi_LI.xlsx') }
  let(:io_file_w_prerolls) { Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO_prerolls.xlsx') }

  before do
    account = FactoryGirl.create(:account)
    AccountSession.create(account)

    request.env["HTTP_ACCEPT"] = 'application/json'
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
