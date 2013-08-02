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
      subject.start_flight_date == Date.strptime("06/27/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
    end

    it "have finish flight date" do
      subject.finish_flight_date == Date.strptime("08/18/2013", IOExcelFileReader::DATE_FORMAT_WITH_SLASH)
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
