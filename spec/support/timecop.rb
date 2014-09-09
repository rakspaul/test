module Timecop
  def freeze_time(now=nil)
    # throw away sub-seconds
    (now || Time.at(Time.now.to_i)).tap do |now|
      Time.stub(:now).and_return(now)
      Date.stub(:today).and_return(now.to_date)
    end
  end

  def adjust_time(delta)
    freeze_time(Time.now + delta)
  end
end