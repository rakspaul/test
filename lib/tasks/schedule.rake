require 'net/http'

namespace :schedule_report do

  task :schedule_task => :environment do
    include ApplicationHelper

    @time_now = format_date(Time.now)
    start_time = Time.now

    $logger.info("Report running execution begin..")
    scheduled_rep = ReportSchedule.where(:status => 'Scheduled')

      scheduled_rep.each do |report|
        $logger.info("Loading scheduled reports..")
      begin
        @user = User.find(report.user_id)
        scheduled_start_date = format_date(report.report_start_date)
        scheduled_end_date = format_date(report.report_end_date)
        scheduled_end_date = scheduled_end_date.nil? ? @time_now : scheduled_end_date

        if scheduled_end_date >= @time_now || scheduled_start_date <= @time_now
          $logger.info("Processing report id #{report.id}")

          case report.frequency_type
          when "everyday"
            $logger.info("Running 'Everyday' report")
            report.url = recalculate_date(report, 1.day) if report.recalculate_dates == true
            run(report)
          when "weekly"
            $logger.info("Running 'Weekly' report")
            if report.frequency_value.include?(@time_now.to_date.strftime("%a").downcase)
              report.url = recalculate_date(report, 1.week - 1) if report.recalculate_dates == true
              run(report)
            end
          when "specific_days"
            $logger.info("Running 'Specific days' report")
            values = format_date(report.frequency_value.to_date)
            if values.include?(@time_now)
              run(report)
            end
          when "quarterly"
            if is_today_quarter_ends == true
              $logger.info("Running 'Quarterly' report")
              q_num = get_current_quarter

              if report.frequency_value.include?("q#{q_num.to_s}")
                report.url = recalculate_date(report, 3.month) if report.recalculate_dates == true
                run(report)
              end
            end
          else
            $logger.warn("No reports to be executed on date #{@time_now}")
          end
        end

        end_time = Time.now
        $logger.info("Updatating report history")
        update_report_history(start_time.to_i, start_time, end_time, report)
        ReportSchedule.find(report.id).update_attributes(:url => report.url, :last_ran => "#{end_time}")
        $logger.info("Scheduled report running job [ID-#{report.id}] finished in time [#{end_time-start_time} sec]")
      rescue Exception => e
        $logger.error(e.message)
      end

      end
      $logger.info("Report running execution ends")
  end

  def recalculate_date(report, shift_to)
    $logger.info("Recalculating start and end date")
    url_start_date = Date.parse report.url.match(/start_date(=|:)([0-9-]+)/)[2]
    url_end_date = Date.parse report.url.match(/end_date(=|:)([0-9-]+)/)[2]

    if url_start_date.to_s != format_date(report.start_date).to_s && is_today_end_date(report) != true
      calculated_str_date = shift_to.from_now(url_start_date).beginning_of_day
      calculated_end_date = shift_to.from_now(url_end_date).beginning_of_day

      report.url.gsub!(/start_date(=|:)[0-9-]+/,'start_date\1'+format_date(calculated_str_date).gsub(/-0/,'-'))
      report.url.gsub!(/end_date(=|:)[0-9-]+/,'end_date\1'+format_date(calculated_end_date).gsub(/-0/,'-'))
    end

    report.url
  end

  def is_today_quarter_ends
    return true if @time_now == Time.now.end_of_quarter
  end

  def is_today_end_date(report)
    return true if @time_now == format_date(report.report_end_date)
  end

  def get_current_quarter
    quarters = [[1,2,3], [4,5,6], [7,8,9], [10,11,12]]
    current_quarter = quarters[(Time.now.month - 1) / 3]
    q_num = quarters.index(current_quarter) + 1

    q_num
  end

  def run(report)
    url = update_token(report.url)
    resp = report_service_call(url)

    if !resp.nil?
      begin
        file_path = write_file(resp.body, report)
        ReportMailer.send_mail(@user, file_path).deliver
        $logger.info("Send email to User:- #{@user.first_name}-#{@user.last_name}")
        File.delete(file_path)

      rescue => e
        $logger.error(e.message)
      end

      if format_date(report.report_end_date) == @time_now
        $logger.info("Updating report status")
        report.update_attributes(:status => 'Completed', :id => "#{report.id}")
      end
    else
      $logger.error("Report data missing of ID:- #{report.id}")
      report.update_attributes(:status => 'Failure', :id => "#{report.id}")
    end
  end

  def update_token(url)
    url =~ /tkn=/ ? url.sub!(/tkn=(\w+)/,"tkn=#{build_request_token}") : url += "&tkn=#{build_request_token}"
    url.sub!(/format=(\w+)/,"format=csv")

    url
  end

  def report_service_call(url)
    begin
      $logger.info("Fetching data from reporting server")
      uri = URI.parse(url)
      http_conn = Net::HTTP.new(uri.host, uri.port)
      http_conn.use_ssl = uri.is_a? URI::HTTPS
      response = nil
      http_conn.start {|http| response = http.post("#{uri.path}", "#{uri.query}")}
    rescue => e
      $logger.error(e.message)
    end

    response
  end

  def write_file(resp, report)
    file_name = "Report_#{@user.id}_#{format_date(report.start_date)}_to_#{@time_now}.csv"
    file_path = "tmp/reports/#{file_name}"

    File.open(file_path,'w') do |file|
      file.puts resp
      file.close
    end

    file_path
  end

  def build_request_token
    Digest::MD5.hexdigest("#{@user.network.id}:#{@user.id}:#{@time_now}")
  end

  def update_report_history(job_id, start_time, end_time, report)
    report_history = ReportScheduleHistory.new
    report_history.job_id = job_id
    report_history.start_date_time = start_time
    report_history.end_date_time = end_time
    report_history.url = report.url
    report_history.report_id = report.id

    report_history.save
  end

end
