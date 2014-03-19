require 'spec_helper'
require 'io_import.rb'

describe IOPdfFileReader do
  context "opened io pdf file with 1 lineitem" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Cox_InsertionOrder.pdf')) }

    before do
      FactoryGirl.create(:user, first_name: "Peter", last_name: "Fernquist", phone_number: "1111", email: "peter.f@collective.com", account_login: "pfernquist")
    end

    it "has advertiser name" do
      subject.client_advertiser_name.should == "Chick-Fil-A"
    end

    it "has correct campaign name" do
      subject.order[:name].should == "Chick-Fil-A_Denver Breakfast 2013_9/14-9/28"
    end

    it "has correct campaign IO number" do
      subject.client_order_id.should == 169905
    end

    it "has start flight dates" do
      subject.start_flight_date.should == Date.strptime("09/14/2013", IOReader::DATE_FORMAT_WITH_SLASH)
    end

    it "has finish flight date" do
      subject.finish_flight_date.should == Date.strptime("09/28/2013", IOReader::DATE_FORMAT_WITH_SLASH)
    end

    #it "has account contact name, phone and email" do
    #  subject.account_contact[:first_name].should == "Alexandra"
    #  subject.account_contact[:last_name].should == "Piechota" 
    #  subject.account_contact[:phone_number].should == "646-786-6701"
    #  subject.account_contact[:email].should == "ampnetwork@collective.com"
    #end

    it "has media contact name, company, address, phone and email" do
      subject.media_contact[:name].should == "Holly Rodiger"
      subject.media_contact[:phone].should == "2125882851"
      subject.media_contact[:email].should == "hrodiger@coxds.com"
    end

    it "has sales person's name, email and phone" do
      subject.sales_person[:first_name].should == "Peter"
      subject.sales_person[:last_name].should == "Fernquist"
      subject.sales_person[:phone_number].should == "1111"
      subject.sales_person[:email].should == "peter.f@collective.com"
    end

    it "has billing contact name, phone and email" do
      subject.billing_contact[:name].should == "CDS Billing (Mary Ann Lynch)"
      subject.billing_contact[:phone].should == "212-588-2828"
      subject.billing_contact[:email].should == "SiteInquiries@coxds.com"
    end

    context "lineitems" do
      before do 
        @lineitems = []
        subject.lineitems{|li| @lineitems << li}
      end

      it "has 1 lineitems" do
        @lineitems.count.should == 1
      end

      it "has first lineitem with correct options" do
        li = @lineitems.first

        li[:start_date].should == Date.strptime("9/14/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:end_date].should == Date.strptime("9/28/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:ad_sizes].should == "160x600, 300x250, 728x90"
        li[:name].should == "CDSNetwork_AddedValueRON_DMADenver_300x250,160x600,728x90_9/14-9/28"
        li[:volume].should == 10350
        li[:rate].should == 0.01
        li[:notes].should == "Proposal Line Item ID: 269771556 - Added Value RON- DMA Denver"
      end
    end
  end

  context "opened io pdf file with campaign name spread between multiple lines" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'IO_campaign_name_multiple_lines.pdf')) }

    before do
      FactoryGirl.create(:user, first_name: "Peter", last_name: "Fernquist", phone_number: "1111", email: "peter.f@collective.com", account_login: "pfernquist")
    end

    it "properly reads campaign name" do
      subject.order[:name].should == "Temecula Valley CVB_LA&Orange County_11/27- 1/4/14"
    end
  end

  context "ad sizes in different cells" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'elements_cherry_hill.pdf')) }

    it "should parse ad sizes only from 'Targeting' column" do
      @lineitems = []
      subject.lineitems{|li| @lineitems << li}
      @lineitems[19][:ad_sizes].should == "1x1"
      @lineitems[0][:ad_sizes].should == "160x600, 300x250, 728x90"
    end
  end

  context "whole world water pdf IO" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'InsertionOrder_www.pdf')) }

    it "parses LI name correctly" do
      subject.send(:search_for_placement_and_li_id)[0][:name].should == "CDS_AudienceNetwork_ADDEDVALUE:Run of AudienceNetwork_National_300x250,728x90_3/17-3/22"
    end
  end

  context "Nyserda pdf IO" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'nyserda_io.pdf')) }

    it "parses LI name correctly" do
      subject.send(:search_for_placement_and_li_id)[0][:name].should == "CDS_AddedValueRON_NYStateNOTNYCandLI_300x250,728x90_3/1-6/30"
    end
  end

  context "Dunkin Donuts pdf IO" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'DunkinDonuts.pdf')) }

    it "parses LI name correctly" do
      subject.send(:search_for_placement_and_li_id)[0][:name].should == "Cox Digital Solutions_Added Value_Geo-Targeted to Burlington, VT_300x250,728x90,160x600_3/3-5/31"
    end
  end

  context "Dunkin Donuts second pdf IO" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'DunkinDonuts2.pdf')) }

    it "parses LI name correctly" do
      subject.send(:search_for_placement_and_li_id)[0][:name].should == "CDS_AddedValueRONLocalNewsSites_DMATargetBinghamton_300x250, 728x90,160x600_3/3-3/30"
    end
  end

  context "opened io pdf file with 3 lineitems on different pages" do
    subject { IOPdfFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Cox_InsertionOrder_5.pdf')) }

    before do
      FactoryGirl.create(:user, first_name: "Peter", last_name: "Fernquist", phone_number: "1111", email: "peter.f@collective.com", account_login: "pfernquist")
    end

    it "has start flight dates" do
      subject.start_flight_date.should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
    end

    it "has finish flight date" do
      subject.finish_flight_date.should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
    end

    context "lineitems" do
      before do 
        @lineitems = []
        subject.lineitems{|li| @lineitems << li}
      end

      it "has 3 lineitems" do
        @lineitems.count.should == 3
      end

      it "has first lineitem with correct options" do
        li = @lineitems.first

        li[:start_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:end_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:ad_sizes].should == "160x600, 300x250, 728x90"
        li[:name].should == "Canceled_Run of News, Business, and Technology & Computing"
        li[:volume].should == 1
        li[:rate].should == 4.00
        li[:notes].should == "Proposal Line Item ID: 249147746 - Run of News, Business, and Technology & Computing vertical site lists"
      end

      it "has second lineitem with correct options" do
        li = @lineitems[1]

        li[:start_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:end_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:ad_sizes].should == "160x600, 300x250, 728x90"
        li[:name].should == "Canceled_LexisNexis Custom Audience Segment_300x250, 160x600, 728x90"
        li[:volume].should == 1
        li[:rate].should == 5.50
        li[:notes].should == "Proposal Line Item ID: 249147756 - Management and Business #2081, Sales and Sales Management #3281, Management #1146281, Sales #1151181, Account Management #1151281, Exec/Upper Management #1220981, Sales & Marketing #1222681, Sales #1382781, Executive #1384581, Management #1384981, Management #1796581, Sales/Marketing #1796781, Management #1829781, Sales & Marketing #1829981, Sales Leadership #1832781, Management & Corporate Operations #1927581, Management and Business #1989981, Sales and Sales Management #1990181, Executive #2019881"
      end

      it "has third lineitem with correct options" do
        li = @lineitems[2]

        li[:start_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:end_date].should == Date.strptime("9/3/2013", IOReader::DATE_FORMAT_WITH_SLASH)
        li[:ad_sizes].should == "160x600, 300x250, 728x90"
        li[:name].should == "Canceled_Retargeting_300x250, 160x600, 728x90"
        li[:volume].should == 1
        li[:rate].should == 1.50
        li[:notes].should == "Proposal Line Item ID: 249147766 - "
      end
    end
  end
end
