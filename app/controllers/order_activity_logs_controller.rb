class OrderActivityLogsController < ApplicationController

  include Authenticator

  before_filter :require_order, :only => [:index, :create]

  respond_to :json

  def index
    limit = params[:limit]
    offset = params[:offset]
    filters = params[:filters] || []
    filter = filters[0] || OrderActivityLog::ActivityType::ALL

    @activities = case filter
                  when OrderActivityLog::ActivityType::USER_COMMENT
                    @order.order_activity_logs.recent_user_comments(limit, offset)
                  when OrderActivityLog::ActivityType::ALERT
                    @order.order_activity_logs.recent_urgent_tasks(limit, offset)
                  when OrderActivityLog::ActivityType::ATTACHMENT
                    @order.order_activity_logs.recent_attachments(limit, offset)
                  when OrderActivityLog::ActivityType::TASK
                    @order.order_activity_logs.recent_tasks(limit, offset)
                  when OrderActivityLog::ActivityType::ALL
                    @order.order_activity_logs.recent_activity(limit, offset)
                  end

    respond_to do |format|
      format.json
    end
  end

  def create
    activity_params = activity_log_params

    return not_found unless OrderActivityLog::ActivityType.const_values.include? activity_params[:activity_type]

    OrderActivityLog.transaction do
      attachment = ActivityAttachment.find_by_id(params[:activity_attachment_id]) if params[:activity_attachment_id]

      case activity_params[:activity_type]
      when OrderActivityLog::ActivityType::TASK
        # create task
        task_params = get_task_params
        task_params.merge! :name => task_params.delete(:note),
                           :order_id => @order.id,
                           :created_by => current_user,
                           :requested_by => current_user,
                           :task_state => Task::TaskState::OPEN,
                           :assignable => team_or_user(task_params.delete(:assigned_by_id)),
                           :important => task_params.delete(:important)

        @task = Task.new(task_params)
        @task.save!

        # link activity attachment
        if attachment
          attachment.activity_log = @task
          attachment.save!
        end
      when OrderActivityLog::ActivityType::USER_COMMENT
        activity = OrderActivityLog.new activity_params.merge!(:order_id => @order.id,
                                                               :created_by => current_account.user)
        activity.save!
      when OrderActivityLog::ActivityType::SYSTEM_COMMENT
          p activity_params
          activity = OrderActivityLog.new activity_params.merge!(:order_id => @order.id,
                                                                 :created_by => current_account.user)
          activity.save!
      when OrderActivityLog::ActivityType::ATTACHMENT
        activity = OrderActivityLog.new activity_params.merge!(:order_id => @order.id,
                                                               :created_by => current_account.user)
        activity.save!
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
    logger.debug params
    params.permit(:note, :order_id, :important, :due_date, :task_type_id, :assignable, :assigned_by_id)
  end

  def team_or_user(assigned_by_id)
    type = params[:assignable_type] || 'User'
    logger.debug("params[:assignable_type]: #{params[:assignable_type]}")
    logger.debug("type: #{type}")

    if type == 'User'
      User.find_by_id assigned_by_id
    else
      Team.find_by_id assigned_by_id
    end
  end
end
