class OrderActivityLogsController < ApplicationController

  include Authenticator

  before_filter :require_order, :only => [:index, :create]

  respond_to :json

  def index
    activity_logs = @order.order_activity_logs.includes(:activity_attachment, :task)
    limit = params[:limit]
    offset = params[:offset]

    filters = params[:filters]

    if filters
      task_important = filters.include?OrderActivityLog::ActivityType::ALERT

      if task_important
        #remove the alert filter as it refers an urgent flag for task and apply task filter if one not existed in the filter.
        if !filters.include?!OrderActivityLog::ActivityType::TASK
          filters.push(OrderActivityLog::ActivityType::TASK)
        end
        activity_logs = activity_logs.where(important: true)
        filters.delete(OrderActivityLog::ActivityType::ALERT)
      end
    end

    if filters
      if filters[0] == OrderActivityLog::ActivityType::ALL
        @activities = activity_logs.recent_activity nil
      elsif filters.include? OrderActivityLog::ActivityType::USER
        filters.delete(OrderActivityLog::ActivityType::USER)
        @activities = activity_logs.apply_filters_with_user filters, current_user, limit, offset
      else
        @activities = activity_logs.apply_filters filters, limit, offset
      end
    else
      @activities = activity_logs.recent_activity limit, offset
    end

    respond_to do |format|
      format.json
    end
  end

  def create
    activity_params = activity_log_params

    return not_found unless OrderActivityLog::ActivityType.const_values.include? activity_params[:activity_type]

    OrderActivityLog.transaction do
      activity = OrderActivityLog.new activity_params.merge!(:order_id => @order.id,
                                                              :created_by => current_account.user)
      activity.save!

      attachment = ActivityAttachment.find_by_id(params[:activity_attachment_id]) if params[:activity_attachment_id]

      case activity_params[:activity_type]
      when OrderActivityLog::ActivityType::TASK
        # create task
        task_params = get_task_params
        task_params.merge! :name => task_params.delete(:note),
                           :order_id => @order.id,
                           :created_by => current_user,
                           :task_state => Task::TaskState::ASSIGNED,
                           :assignable => User.find_by_id(task_params.delete(:assigned_by_id)),
                           :order_activity_log => activity,
                           :important => task_params.delete(:important)

        @task = Task.new(task_params)
        @task.save!

        # link activity attachment
        if attachment
          attachment.activity_log = task
          attachment.save!
        end
      when OrderActivityLog::ActivityType::USER_COMMENT
        #nothing to do
      when OrderActivityLog::ActivityType::ATTACHMENT
        if attachment
          attachment.activity_log = activity
          attachment.save!
        end
      end
    end

    render :json => {:status => 'ok'}, :status => 200
  rescue ActiveRecord::RecordInvalid => e
    render :json => {:status => 'error', :message => @task.errors.messages}, :status => 400
  rescue ActiveRecord::ActiveRecordError => e
    error_message(e.message)
  end

  private

  def require_order
    @order = Order.find_by_id params[:order_id]
  end

  def activity_log_params
    params.permit(:note, :activity_type, :order_id, :important)
  end

  def get_task_params
    params.permit(:note, :order_id, :important, :due_date, :task_type_id, :assignable, :assigned_by_id)
  end

end
