require 'spec_helper'
require 'io_import.rb'

describe IOExcelFileReader do
  subject { IOExcelFileReader.new( Rack::Test::UploadedFile.new Rails.root.join('spec', 'fixtures', 'io_files', 'Collective_IO.xls')) }

  it "opens io xls file w/o errors" do
    lambda { subject.open }.should_not raise_error
  end

  context "opened io xls file" do
    before { subject.open }

    it "have advertiser name" do
      subject.advertiser_name.should == "Otterbein University"
    end

    it "have start flight dates" do
      subject.start_flight_date.should == Date.strptime("06/27/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
    end

    it "have finish flight date" do
      subject.finish_flight_date.should == Date.strptime("08/18/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
    end

    it "have account contact name, phone and email" do
      subject.account_contact[:name].should == "Alexandra Piechota" 
      subject.account_contact[:phone].should == "646-786-6701"
      subject.account_contact[:email].should == "ampnetwork@collective.com"
    end

    it "have media contact name, company, address, phone and email" do
      subject.media_contact[:name].should == "Mary Ball"
      subject.media_contact[:company].should == "Time Warner Cable"
      subject.media_contact[:address].should == ""
      subject.media_contact[:phone].should == "704-973-7508"
      subject.media_contact[:email].should == "digital.services@twcable.com"
    end

    it "have trafficking contact name, email and phone" do
      subject.trafficking_contact[:first_name].should == "Ronnie" 
      subject.trafficking_contact[:last_name].should == "Wallace" 
      subject.trafficking_contact[:phone_number].should == "646-442-8220"
      subject.trafficking_contact[:email].should == "ops@collective.com"
    end

    it "have sales person's name, email and phone" do
      subject.sales_person[:first_name].should == "Eric"
      subject.sales_person[:last_name].should == "Burns"
      subject.sales_person[:account_login].should == "ericburns"
      subject.sales_person[:phone_number].should == "919-604-4451"
      subject.sales_person[:email].should == "eric@collective.com"
    end

    it "have billing contact name, phone and email" do
      subject.billing_contact[:name].should == "Bryan Snyder"
      subject.billing_contact[:company].should == "Time Warner Cable"
      subject.billing_contact[:address].should == ""
      subject.billing_contact[:phone].should == "(704) 973-7346"
      subject.billing_contact[:email].should == "digital.services@twcable.com"
    end

    context "lineitems" do
      before do 
        @lineitems = []
        subject.lineitems{|li| @lineitems << li}
      end

      it "have 2 lineitems" do
        @lineitems.count.should == 2
      end

      it "have first lineitem with correct options" do
        li = @lineitems.first

        li[:start_date].should == Date.strptime("06/27/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
        li[:end_date].should == Date.strptime("08/18/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
        li[:ad_sizes].should == "300x250, 728x90, 160x600"
        li[:name].should == "Age 18-34 or Age 34-50 or Education; Columbus Zips"
        li[:volume].should == 300000
        li[:rate].should == 0
      end
    end
  end
end
